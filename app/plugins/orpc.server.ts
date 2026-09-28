import { createRouterClient } from "@orpc/server";
import { createPiniaColadaUtils } from "@orpc/pinia-colada";

import { appRouter } from "#server/routers";

/**
 * Server-side oRPC client + Pinia Colada utils.
 * Procedures run in-process during SSR — no self-HTTP round trip.
 */
export default defineNuxtPlugin(() => {
  const event = useRequestEvent();

  const client = createRouterClient(appRouter, {
    context: () => ({
      headers: event?.headers ?? new Headers(),
      getAuth: event?.context.auth,
    }),
  });

  const orpc = createPiniaColadaUtils(client);

  return {
    provide: {
      orpc,
    },
  };
});
