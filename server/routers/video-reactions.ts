import z from "zod";
import { authed } from "~~/server/routers/base";
import { db } from "../db";
import { videoReactions } from "../db/schema";
import { and, eq } from "drizzle-orm";

export const likeVideo = authed
  .input(z.object({ videoId: z.uuid() }))
  .handler(async ({ input, context }) => {
    const { videoId } = input;
    const { userId } = context;

    const [existingVideoReactionLike] = await db
      .select()
      .from(videoReactions)
      .where(
        and(
          eq(videoReactions.videoId, videoId),
          eq(videoReactions.userId, userId),
          eq(videoReactions.type, "like"),
        ),
      );

    if (existingVideoReactionLike) {
      const [deletedViewerReaction] = await db
        .delete(videoReactions)
        .where(and(eq(videoReactions.userId, userId), eq(videoReactions.videoId, videoId)))
        .returning();

      return deletedViewerReaction;
    }

    const [createdVideoReaction] = await db
      .insert(videoReactions)
      .values({ userId, videoId, type: "like" })
      .onConflictDoUpdate({
        target: [videoReactions.userId, videoReactions.videoId],
        set: {
          type: "like",
        },
      })
      .returning();

    return createdVideoReaction;
  });

export const dislikeVideo = authed
  .input(z.object({ videoId: z.uuid() }))
  .handler(async ({ input, context }) => {
    const { videoId } = input;
    const { userId } = context;

    const [existingVideoReactionDislike] = await db
      .select()
      .from(videoReactions)
      .where(
        and(
          eq(videoReactions.videoId, videoId),
          eq(videoReactions.userId, userId),
          eq(videoReactions.type, "dislike"),
        ),
      );

    if (existingVideoReactionDislike) {
      const [deletedViewerReaction] = await db
        .delete(videoReactions)
        .where(and(eq(videoReactions.userId, userId), eq(videoReactions.videoId, videoId)))
        .returning();

      return deletedViewerReaction;
    }

    const [createdVideoReaction] = await db
      .insert(videoReactions)
      .values({ userId, videoId, type: "dislike" })
      .onConflictDoUpdate({
        target: [videoReactions.userId, videoReactions.videoId],
        set: {
          type: "dislike",
        },
      })
      .returning();

    return createdVideoReaction;
  });
