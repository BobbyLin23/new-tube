import { eq } from "drizzle-orm";
import type {
  VideoAssetCreatedWebhookEvent,
  VideoAssetDeletedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks/webhooks";
import { db } from "~~/server/db";
import { videos } from "~~/server/db/schema";
import { mux } from "~~/server/utils/mux";
import { r2StoreFromUrl } from "~~/server/utils/r2";
import { env } from "~~/env";

const SIGNING_SECRET = env.MUX_WEBHOOK_SECRET;

type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetTrackReadyWebhookEvent
  | VideoAssetDeletedWebhookEvent;

export default defineEventHandler(async (event) => {
  if (!SIGNING_SECRET) {
    throw createError({ statusCode: 500, statusMessage: "MUX_WEBHOOK_SECRET is not set" });
  }

  const muxSignature = getHeader(event, "mux-signature");
  if (!muxSignature) {
    throw createError({ statusCode: 401, statusMessage: "No signature found" });
  }

  const rawBody = (await readRawBody(event)) ?? "";
  await mux.webhooks.verifySignature(rawBody, { "mux-signature": muxSignature }, SIGNING_SECRET);
  const payload = JSON.parse(rawBody) as WebhookEvent;

  switch (payload.type) {
    case "video.asset.created": {
      const data = payload.data;
      if (!data.upload_id) {
        throw createError({ statusCode: 400, statusMessage: "No upload ID found" });
      }

      await db
        .update(videos)
        .set({ muxAssetId: data.id, muxStatus: data.status })
        .where(eq(videos.muxUploadId, data.upload_id));
      break;
    }

    case "video.asset.ready": {
      const data = payload.data;
      const playbackId = data.playback_ids?.[0]?.id;

      if (!data.upload_id) {
        throw createError({ statusCode: 400, statusMessage: "Missing upload ID" });
      }
      if (!playbackId) {
        throw createError({ statusCode: 400, statusMessage: "Missing playback ID" });
      }

      const duration = data.duration ? Math.round(data.duration * 1000) : 0;

      // Re-host Mux-generated imagery in R2 so thumbnails survive Mux
      // playback policy changes and are served from one CDN.
      const [thumbnail, preview] = await Promise.all([
        r2StoreFromUrl(
          `https://image.mux.com/${playbackId}/thumbnail.jpg`,
          `thumbnails/${playbackId}.jpg`,
        ).catch((error) => {
          console.error("[mux webhook] thumbnail re-host failed", error);
          return null;
        }),
        r2StoreFromUrl(
          `https://image.mux.com/${playbackId}/animated.gif`,
          `previews/${playbackId}.gif`,
        ).catch((error) => {
          console.error("[mux webhook] preview re-host failed", error);
          return null;
        }),
      ]);

      await db
        .update(videos)
        .set({
          muxStatus: data.status,
          muxPlaybackId: playbackId,
          muxAssetId: data.id,
          thumbnailUrl: thumbnail?.url ?? null,
          thumbnailKey: thumbnail?.key ?? null,
          previewUrl: preview?.url ?? null,
          previewKey: preview?.key ?? null,
          duration,
        })
        .where(eq(videos.muxUploadId, data.upload_id));
      break;
    }

    case "video.asset.errored": {
      const data = payload.data;
      if (!data.upload_id) {
        throw createError({ statusCode: 400, statusMessage: "Missing upload ID" });
      }

      await db
        .update(videos)
        .set({ muxStatus: data.status })
        .where(eq(videos.muxUploadId, data.upload_id));
      break;
    }

    case "video.asset.deleted": {
      const data = payload.data;
      if (!data.upload_id) {
        throw createError({ statusCode: 400, statusMessage: "Missing upload ID" });
      }

      await db.delete(videos).where(eq(videos.muxUploadId, data.upload_id));
      break;
    }

    case "video.asset.track.ready": {
      const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & {
        asset_id: string;
      };

      // Mux's types incorrectly omit asset_id on track payloads.
      const assetId = data.asset_id;
      const trackId = data.id;
      const status = data.status;

      if (!assetId) {
        throw createError({ statusCode: 400, statusMessage: "Missing asset ID" });
      }

      await db
        .update(videos)
        .set({ muxTrackId: trackId, muxTrackStatus: status })
        .where(eq(videos.muxAssetId, assetId));
      break;
    }
  }

  return "Webhook received";
});
