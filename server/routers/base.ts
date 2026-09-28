import { ORPCError, os } from "@orpc/server";
import type { AuthFn } from "@clerk/nuxt/types";

/**
 * oRPC initial context.
 * - `headers`: the incoming request headers.
 * - `getAuth`: Clerk's per-request auth closure (`@clerk/nuxt` middleware sets
 *   `event.context.auth` on every Nitro request); absent if no request event.
 *   `authed` resolves it into `context.auth`.
 */
export const base = os.$context<{ getAuth?: AuthFn; headers: Headers }>();

/**
 * Builder requiring a signed-in Clerk session.
 * Injects the resolved `AuthObject` as `context.auth` for handlers.
 *
 * ```ts
 * export const me = authed.handler(({ context }) => context.auth.userId);
 * ```
 */
export const authed = base.use(({ context, next }) => {
  const auth = context.getAuth?.();

  if (!auth?.userId) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return next({ context: { auth } });
});
