import z from "zod";
import { and, desc, eq, getColumns, lt, ne, or } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "./base";
import { db } from "../db";
import { users, videoReactions, videos, videoViews } from "../db/schema";

export const listSuggestions = base
  .input(
    z.object({
      videoId: z.uuid(),
      cursor: z
        .object({
          id: z.uuid(),
          updatedAt: z.date(),
        })
        .nullish(),
      limit: z.number().min(1).max(100),
    }),
  )
  .handler(async ({ input }) => {
    const { videoId, cursor, limit } = input;

    const [existingVideo] = await db.select().from(videos).where(eq(videos.id, videoId));

    if (!existingVideo) {
      throw new ORPCError("NOT_FOUND");
    }

    const data = await db
      .select({
        ...getColumns(videos),
        user: users,
        viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
        likeCount: db.$count(
          videoReactions,
          and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, "like")),
        ),
        dislikeCount: db.$count(
          videoReactions,
          and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, "dislike")),
        ),
      })
      .from(videos)
      .innerJoin(users, eq(videos.userId, users.id))
      .where(
        and(
          ne(videos.id, videoId),
          eq(videos.visibility, "public"),
          existingVideo.categoryId ? eq(videos.categoryId, existingVideo.categoryId) : undefined,
          cursor
            ? or(
                lt(videos.updatedAt, cursor.updatedAt),
                and(eq(videos.updatedAt, cursor.updatedAt), lt(videos.id, cursor.id)),
              )
            : undefined,
        ),
      )
      .orderBy(desc(videos.updatedAt), desc(videos.id))
      // Fetch one extra row to know whether another page exists
      .limit(limit + 1);

    const hasMore = data.length > limit;
    const items = hasMore ? data.slice(0, -1) : data;
    const lastItem = items.at(-1);
    const nextCursor =
      hasMore && lastItem ? { id: lastItem.id, updatedAt: lastItem.updatedAt } : null;

    return { items, nextCursor };
  });
