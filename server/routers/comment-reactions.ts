import z from "zod";
import { and, eq } from "drizzle-orm";
import { authed } from "./base";
import { db } from "../db";
import { commentReactions } from "../db/schema";

type ReactionType = "like" | "dislike";

async function toggleCommentReaction(userId: string, commentId: string, type: ReactionType) {
  const [existing] = await db
    .select()
    .from(commentReactions)
    .where(
      and(
        eq(commentReactions.commentId, commentId),
        eq(commentReactions.userId, userId),
        eq(commentReactions.type, type),
      ),
    );

  if (existing) {
    const [deleted] = await db
      .delete(commentReactions)
      .where(and(eq(commentReactions.userId, userId), eq(commentReactions.commentId, commentId)))
      .returning();

    return deleted;
  }

  const [created] = await db
    .insert(commentReactions)
    .values({ userId, commentId, type })
    .onConflictDoUpdate({
      target: [commentReactions.userId, commentReactions.commentId],
      set: { type, updatedAt: new Date() },
    })
    .returning();

  return created;
}

export const likeComment = authed
  .input(z.object({ commentId: z.uuid() }))
  .handler(({ input, context }) => toggleCommentReaction(context.userId, input.commentId, "like"));

export const dislikeComment = authed
  .input(z.object({ commentId: z.uuid() }))
  .handler(({ input, context }) =>
    toggleCommentReaction(context.userId, input.commentId, "dislike"),
  );
