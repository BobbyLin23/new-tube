import { authed } from "~~/server/routers/base";
import { z } from "zod";
import { db } from "~~/server/db";
import { videos } from "~~/server/db/schema";
import { and, desc, eq, lt, or } from "drizzle-orm";
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
    const { userId } = context;
    const { id } = input;

    const [video] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, id), eq(videos.userId, userId)));

    if (!video) {
      throw new ORPCError("NOT_FOUND");
    }

    return video;
  });
