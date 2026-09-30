import z from "zod";
import { authed } from "~~/server/routers/base";
import { db } from "../db";
import { videoViews } from "../db/schema";
import { and, eq } from "drizzle-orm";

export const createVideoView = authed
  .input(z.object({ videoId: z.uuid() }))
  .handler(async ({ context, input }) => {
    const { videoId } = input;
    const { userId } = context;

    const [existingVideoView] = await db
      .select()
      .from(videoViews)
      .where(and(eq(videoViews.videoId, videoId), eq(videoViews.userId, userId)));

    if (existingVideoView) {
      return existingVideoView;
    }

    const [createdVideoView] = await db.insert(videoViews).values({ userId, videoId }).returning();

    return createdVideoView;
  });
