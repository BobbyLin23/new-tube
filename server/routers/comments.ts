import z from "zod";
import { and, count, desc, eq, getColumns, lt, or } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { authed, base } from "./base";
import { db } from "../db";
import { comments, users } from "../db/schema";

export const createComment = authed
  .input(
    z.object({
      videoId: z.uuid(),
      value: z.string().trim().min(1).max(2000),
    }),
  )
  .handler(async ({ input, context }) => {
    const [createdComment] = await db
      .insert(comments)
      .values({ userId: context.userId, videoId: input.videoId, value: input.value })
      .returning();

    return createdComment;
  });

export const removeComment = authed
  .input(
    z.object({
      id: z.uuid(),
    }),
  )
  .handler(async ({ input, context }) => {
    const [deletedComment] = await db
      .delete(comments)
      .where(and(eq(comments.id, input.id), eq(comments.userId, context.userId)))
      .returning();

    if (!deletedComment) {
      throw new ORPCError("NOT_FOUND");
    }

    return deletedComment;
  });

export const listComments = base
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

    const [[total], data] = await Promise.all([
      db.select({ count: count() }).from(comments).where(eq(comments.videoId, videoId)),
      db
        .select({
          ...getColumns(comments),
          user: users,
        })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .where(
          and(
            eq(comments.videoId, videoId),
            cursor
              ? or(
                  lt(comments.updatedAt, cursor.updatedAt),
                  and(eq(comments.updatedAt, cursor.updatedAt), lt(comments.id, cursor.id)),
                )
              : undefined,
          ),
        )
        .orderBy(desc(comments.updatedAt), desc(comments.id))
        // Fetch one extra row to know whether another page exists
        .limit(limit + 1),
    ]);

    const hasMore = data.length > limit;
    const items = hasMore ? data.slice(0, -1) : data;
    const lastItem = items.at(-1);
    const nextCursor =
      hasMore && lastItem ? { id: lastItem.id, updatedAt: lastItem.updatedAt } : null;

    return {
      totalCount: total?.count ?? 0,
      items,
      nextCursor,
    };
  });
