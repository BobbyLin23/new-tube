import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createPiniaColadaUtils } from "@orpc/pinia-colada";

import type { RouterClient } from "@orpc/server";
import type { AppRouter } from "#server/routers";

/**
 * Browser-side oRPC client + Pinia Colada utils.
 * Calls the `/rpc` server route over HTTP; same-origin fetch
 * attaches cookies automatically.
 */
export default defineNuxtPlugin(() => {
  const link = new RPCLink({
    url: "/rpc",
  });

  const client: RouterClient<AppRouter> = createORPCClient(link);
  const orpc = createPiniaColadaUtils(client);

  return {
    provide: {
      orpc,
    },
  };
});
