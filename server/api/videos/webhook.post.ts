import { env } from "~~/env";
import { VideoAssetCreatedWebhookEvent } from "@mux/mux-node/resources/webhooks/webhooks";
import { mux } from "~~/server/utils/mux";
import { db } from "~~/server/db";
import { videos } from "~~/server/db/schema";
import { eq } from "drizzle-orm";

const SIGNING_SECRET = env.MUX_WEBHOOK_SECRET;

export default defineEventHandler(async (event) => {
  const muxSignature = getHeader(event, "mux-signature");
  if (!muxSignature) {
    throw createError({
      statusCode: 401,
      statusMessage: "No signature found",
    });
  }

  const rawBody = (await readRawBody(event)) ?? "";
  const payload = JSON.parse(rawBody) as VideoAssetCreatedWebhookEvent;
  mux.webhooks.verifySignature(rawBody, { "mux-signature": muxSignature }, SIGNING_SECRET);

  switch (payload.type) {
    case "video.asset.created": {
      const data = payload.data;
      if (!data.upload_id) {
        throw createError({
          statusCode: 400,
          statusMessage: "No upload ID found",
        });
      }
      await db
        .update(videos)
        .set({ muxAssetId: data.id, muxStatus: data.status })
        .where(eq(videos.muxUploadId, data.upload_id));
      break;
    }
  }

  return "Webhook received";
});
