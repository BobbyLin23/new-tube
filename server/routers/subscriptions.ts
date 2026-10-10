import z from "zod";
import { authed } from "./base";
import { ORPCError } from "@orpc/server";
import { db } from "../db";
import { subscriptions } from "../db/schema";
import { and, eq } from "drizzle-orm";

export const subscribeUser = authed
  .input(
    z.object({
      userId: z.uuid(),
    }),
  )
  .handler(async ({ input, context }) => {
    const { userId } = input;

    if (userId === context.userId) {
      throw new ORPCError("BAD_REQUEST");
    }

    const [createdSubscription] = await db
      .insert(subscriptions)
      .values({ viewerId: context.userId, creatorId: userId })
      .returning();

    return createdSubscription;
  });

export const removeSubscription = authed
  .input(
    z.object({
      userId: z.uuid(),
    }),
  )
  .handler(async ({ input, context }) => {
    const { userId } = input;

    if (userId === context.userId) {
      throw new ORPCError("BAD_REQUEST");
    }

    const [deletedSubscription] = await db
      .delete(subscriptions)
      .where(and(eq(subscriptions.viewerId, context.userId), eq(subscriptions.creatorId, userId)))
      .returning();

    return deletedSubscription;
  });
