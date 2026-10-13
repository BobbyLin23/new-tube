import z from "zod";
import { and, desc, eq, getColumns, ilike, lt, or } from "drizzle-orm";
import { base } from "./base";
import { db } from "../db";
import { users, videoReactions, videos, videoViews } from "../db/schema";

export const listSearch = base
  .input(
    z.object({
      query: z.string().nullish(),
      categoryId: z.uuid().nullish(),
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
    const { query, categoryId, cursor, limit } = input;

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
          eq(videos.visibility, "public"),
          query ? ilike(videos.title, `%${query}%`) : undefined,
          categoryId ? eq(videos.categoryId, categoryId) : undefined,
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
