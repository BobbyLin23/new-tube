import type { RouterClient } from "@orpc/server";
import type { RouterUtils } from "@orpc/pinia-colada";

import type { AppRouter } from "#server/routers";

/**
 * Typed accessor for the injected oRPC client decorated with Pinia Colada utils.
 *
 * ```ts
 * const orpc = useOrpc()
 * const { data } = useQuery(orpc.planet.list.queryOptions({}))
 * await useMutation(orpc.planet.create.mutationOptions()).mutate({ name: 'Venus' })
 * ```
 */
export type OrpcClient = RouterClient<AppRouter>;
export type OrpcUtils = RouterUtils<OrpcClient>;

export function useOrpc(): OrpcUtils {
  return useNuxtApp().$orpc;
}
