import { authed } from "~~/server/routers/base";
import { z } from "zod";
import { db } from "~~/server/db";
import { users, videoReactions, videos, videoViews } from "~~/server/db/schema";
import { and, desc, eq, getColumns, inArray, lt, or } from "drizzle-orm";
import { ORPCError } from "@orpc/server";

export const listVideosInStudio = authed
  .input(
    z.object({
      cursor: z
        .object({
          id: z.uuid(),
          updatedAt: z.date(),
        })
        .nullish(),
      limit: z.number().min(1).max(100),
    }),
  )
  .handler(async ({ context, input }) => {
    const { cursor, limit } = input;

    const data = await db
      .select()
      .from(videos)
      .where(
        and(
          eq(videos.userId, context.userId),
          cursor
            ? or(
                lt(videos.updatedAt, cursor.updatedAt),
                and(eq(videos.updatedAt, cursor.updatedAt), lt(videos.id, cursor.id)),
              )
            : undefined,
        ),
      )
      .orderBy(desc(videos.updatedAt), desc(videos.id))
      // Add 1 to the limit to check if there is more data
      .limit(limit + 1);

    const hasMore = data.length > limit;
    // Remove the last item if there is more data
    const items = hasMore ? data.slice(0, -1) : data;
    // Set the next cursor to the last item if there is more data
    const lastItem = items.at(-1);
    const nextCursor =
      hasMore && lastItem
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

    return {
      items,
      nextCursor,
    };
  });

export const getVideoById = authed
  .input(
    z.object({
      id: z.uuid(),
    }),
  )
  .handler(async ({ context, input }) => {
    const { clerkUserId } = context;

    let userId;

    const [user] = await db
      .select()
      .from(users)
      .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));

    if (user) {
      userId = user.id;
    }

    const viewerReactions = db.$with("viewer_reactions").as(
      db
        .select({
          videoId: videoReactions.videoId,
          type: videoReactions.type,
        })
        .from(videoReactions)
        .where(inArray(videoReactions.userId, userId ? [userId] : [])),
    );

    const [existingVideo] = await db
      .with(viewerReactions)
      .select({
        ...getColumns(videos),
        user: {
          ...getColumns(users),
        },
        viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
        likeCount: db.$count(
          videoReactions,
          and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, "like")),
        ),
        dislikeCount: db.$count(
          videoReactions,
          and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, "dislike")),
        ),
        viewerReaction: viewerReactions.type,
      })
      .from(videos)
      .innerJoin(users, eq(videos.userId, users.id))
      .leftJoin(viewerReactions, eq(viewerReactions.videoId, videos.id))
      .where(eq(videos.id, input.id));

    if (!existingVideo) {
      throw new ORPCError("NOT_FOUND");
    }

    return existingVideo;
  });
