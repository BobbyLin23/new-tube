import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { authed } from "~~/server/routers/base";
import { db } from "~~/server/db";
import { videos, videoUpdateSchema } from "~~/server/db/schema";
import { mux } from "#server/utils/mux";
import { r2Delete, r2StoreFromUrl, r2Url, r2PutSignedUrl } from "#server/utils/r2";

export const createVideo = authed.handler(async ({ context }) => {
  const upload = await mux.video.uploads.create({
    new_asset_settings: {
      passthrough: context.userId,
      playback_policy: ["public"],
    },
    cors_origin: "*", // TODO: In production, set to your url
  });

  const [video] = await db
    .insert(videos)
    .values({
      userId: context.userId,
      title: "Untitled",
      muxStatus: "waiting",
      muxUploadId: upload.id,
    })
    .returning();

  return {
    video: video,
    url: upload.url,
  };
});

export const restoreThumbnail = authed
  .input(
    z.object({
      id: z.uuid(),
    }),
  )
  .handler(async ({ context, input }) => {
    const { userId } = context;
    const { id } = input;

    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, id), eq(videos.userId, userId)));

    if (!existingVideo) {
      throw new ORPCError("NOT_FOUND");
    }

    if (existingVideo.thumbnailKey) {
      await r2Delete(existingVideo.thumbnailKey);

      await db
        .update(videos)
        .set({ thumbnailKey: null, thumbnailUrl: null })
        .where(and(eq(videos.id, id), eq(videos.userId, userId)));
    }

    if (!existingVideo.muxPlaybackId) {
      throw new ORPCError("BAD_REQUEST", { message: "Video is not ready yet" });
    }

    const key = `thumbnails/${existingVideo.muxPlaybackId}.jpg`;
    const { url: thumbnailUrl } = await r2StoreFromUrl(
      `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`,
      key,
    );

    const [updatedVideo] = await db
      .update(videos)
      .set({ thumbnailUrl, thumbnailKey: key, updatedAt: new Date() })
      .where(and(eq(videos.id, id), eq(videos.userId, userId)))
      .returning();

    return updatedVideo;
  });

export const uploadThumbnailUrl = authed
  .input(
    z.object({
      id: z.uuid(),
      contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    }),
  )
  .handler(async ({ context, input }) => {
    const { userId } = context;

    const [video] = await db
      .select({ id: videos.id })
      .from(videos)
      .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));

    if (!video) {
      throw new ORPCError("NOT_FOUND");
    }

    const ext = input.contentType.split("/")[1];
    const key = `thumbnails/${userId}/${video.id}-${Date.now()}.${ext}`;
    const uploadUrl = await r2PutSignedUrl(key, input.contentType);

    return { key, uploadUrl };
  });

export const setThumbnail = authed
  .input(
    z.object({
      id: z.uuid(),
      key: z.string().min(1),
    }),
  )
  .handler(async ({ context, input }) => {
    const { userId } = context;
    const { id, key } = input;

    // Only keys minted by uploadThumbnailUrl (user-scoped prefix) are accepted.
    const expectedPrefix = `thumbnails/${userId}/`;
    if (!key.startsWith(expectedPrefix)) {
      throw new ORPCError("FORBIDDEN", { message: "Invalid thumbnail key" });
    }

    const [video] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, id), eq(videos.userId, userId)));

    if (!video) {
      throw new ORPCError("NOT_FOUND");
    }

    if (video.thumbnailKey && video.thumbnailKey !== key) {
      await r2Delete(video.thumbnailKey);
    }

    const thumbnailUrl = await r2Url(key);

    const [updatedVideo] = await db
      .update(videos)
      .set({ thumbnailUrl, thumbnailKey: key, updatedAt: new Date() })
      .where(and(eq(videos.id, id), eq(videos.userId, userId)))
      .returning();

    return updatedVideo;
  });

export const updateVideo = authed
  .input(
    videoUpdateSchema
      .pick({ title: true, description: true, categoryId: true, visibility: true })
      .extend({ id: z.uuid() }),
  )
  .handler(async ({ context, input }) => {
    const { id, ...data } = input;
    const { userId } = context;

    const [updated] = await db
      .update(videos)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(videos.id, id), eq(videos.userId, userId)))
      .returning();

    if (!updated) {
      throw new ORPCError("NOT_FOUND");
    }

    return updated;
  });

export const removeVideo = authed
  .input(
    z.object({
      id: z.uuid(),
    }),
  )
  .handler(async ({ context, input }) => {
    const { userId } = context;
    const { id } = input;

    const [video] = await db
      .select({ muxAssetId: videos.muxAssetId })
      .from(videos)
      .where(and(eq(videos.id, id), eq(videos.userId, userId)));

    if (!video) {
      throw new ORPCError("NOT_FOUND");
    }

    if (video.muxAssetId) {
      await mux.video.assets.delete(video.muxAssetId);
    }

    await db.delete(videos).where(and(eq(videos.id, id), eq(videos.userId, userId)));

    return { success: true };
  });
