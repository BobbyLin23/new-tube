import { eq } from "drizzle-orm";

import { db } from "~~/server/db";
import { users } from "~~/server/db/schema";
import { authed } from "./base";

/**
 * Returns the signed-in user's synced DB record (created/updated by the
 * Clerk webhook). Requires a Clerk session.
 */
export const me = authed
  .errors({ USER_NOT_FOUND: { message: "User not found" } })
  .handler(async ({ context, errors }) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, context.auth.userId))
      .limit(1);

    if (!user) {
      throw errors.USER_NOT_FOUND();
    }

    return user;
  });
