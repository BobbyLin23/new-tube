import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { authed } from "~~/server/routers/base";
import { db } from "~~/server/db";
import { videos, videoUpdateSchema } from "~~/server/db/schema";
import { mux } from "#server/utils/mux";

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
