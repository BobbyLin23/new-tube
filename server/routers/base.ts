import { ORPCError, os } from "@orpc/server";
import { eq } from "drizzle-orm";
import type { AuthFn } from "@clerk/nuxt/types";

import { db } from "~~/server/db";
import { users } from "~~/server/db/schema";

/**
 * oRPC initial context.
 * - `headers`: the incoming request headers.
 * - `getAuth`: Clerk's per-request auth closure (`@clerk/nuxt` middleware sets
 *   `event.context.auth` on every Nitro request); absent if no request event.
 *   `authed` resolves it into `context.userId`.
 */
export const base = os.$context<{ getAuth?: AuthFn; headers: Headers }>();

/**
 * Builder requiring a signed-in Clerk session with a synced DB user record.
 *
 * Resolves the Clerk user ID to the internal `users.id` (uuid FK used by
 * `videos` and other tables) and injects it as `context.userId` for handlers.
 * Throws `UNAUTHORIZED` without a session, `NOT_FOUND` if the Clerk webhook
 * has not created the user record yet.
 *
 * ```ts
 * export const me = authed.handler(({ context }) => context.userId);
 * ```
 */
export const authed = base.use(async ({ context, next }) => {
  const auth = context.getAuth?.();

  if (!auth?.userId) {
    throw new ORPCError("UNAUTHORIZED");
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, auth.userId))
    .limit(1);

  if (!user) {
    throw new ORPCError("NOT_FOUND", { message: "User record not found" });
  }

  return next({ context: { userId: user.id, clerkUserId: auth.userId } });
});
