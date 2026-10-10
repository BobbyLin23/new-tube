import z from "zod";
import { desc, eq, getColumns } from "drizzle-orm";
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

export const listComments = base
  .input(
    z.object({
      videoId: z.uuid(),
    }),
  )
  .handler(async ({ input }) => {
    return db
      .select({
        ...getColumns(comments),
        user: users,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.videoId, input.videoId))
      .orderBy(desc(comments.createdAt));
  });
