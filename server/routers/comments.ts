import z from "zod";
import {
  and,
  count,
  desc,
  eq,
  getColumns,
  inArray,
  isNotNull,
  isNull,
  lt,
  or,
  sql,
} from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { authed, base } from "./base";
import { db } from "../db";
import { commentReactions, comments, users } from "../db/schema";

export const createComment = authed
  .input(
    z.object({
      videoId: z.uuid(),
      parentId: z.uuid().nullish(),
      value: z.string().trim().min(1).max(2000),
    }),
  )
  .handler(async ({ input, context }) => {
    const { parentId, videoId, value } = input;

    if (parentId) {
      const [parent] = await db
        .select({ parentId: comments.parentId, videoId: comments.videoId })
        .from(comments)
        .where(eq(comments.id, parentId));

      if (!parent || parent.videoId !== videoId) {
        throw new ORPCError("NOT_FOUND");
      }

      // Only one level of nesting is supported
      if (parent.parentId) {
        throw new ORPCError("BAD_REQUEST");
      }
    }

    const [createdComment] = await db
      .insert(comments)
      .values({ userId: context.userId, videoId, parentId, value })
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
      parentId: z.uuid().nullish(),
      cursor: z
        .object({
          id: z.uuid(),
          updatedAt: z.date(),
        })
        .nullish(),
      limit: z.number().min(1).max(100),
    }),
  )
  .handler(async ({ input, context }) => {
    const { videoId, parentId, cursor, limit } = input;
    const clerkUserId = context.getAuth?.()?.userId;

    let viewerId: string | undefined;

    if (clerkUserId) {
      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.clerkId, clerkUserId))
        .limit(1);
      viewerId = user?.id;
    }

    const viewerReactions = db.$with("viewer_reactions").as(
      db
        .select({
          commentId: commentReactions.commentId,
          type: commentReactions.type,
        })
        .from(commentReactions)
        .where(inArray(commentReactions.userId, viewerId ? [viewerId] : [])),
    );

    const replies = db.$with("replies").as(
      db
        .select({
          parentId: comments.parentId,
          count: count(comments.id).as("count"),
        })
        .from(comments)
        .where(and(eq(comments.videoId, videoId), isNotNull(comments.parentId)))
        .groupBy(comments.parentId),
    );

    const [[total], data] = await Promise.all([
      db.select({ count: count() }).from(comments).where(eq(comments.videoId, videoId)),
      db
        .with(viewerReactions, replies)
        .select({
          ...getColumns(comments),
          user: users,
          viewerReaction: viewerReactions.type,
          replyCount: sql<number>`coalesce(${replies.count}, 0)`.mapWith(Number),
          likeCount: db.$count(
            commentReactions,
            and(eq(commentReactions.type, "like"), eq(commentReactions.commentId, comments.id)),
          ),
          dislikeCount: db.$count(
            commentReactions,
            and(eq(commentReactions.type, "dislike"), eq(commentReactions.commentId, comments.id)),
          ),
        })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .leftJoin(viewerReactions, eq(comments.id, viewerReactions.commentId))
        .leftJoin(replies, eq(comments.id, replies.parentId))
        .where(
          and(
            eq(comments.videoId, videoId),
            parentId ? eq(comments.parentId, parentId) : isNull(comments.parentId),
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
