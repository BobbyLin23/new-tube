import type { InferRouterOutputs } from "@orpc/server";
import type { AppRouter } from "~~/server/routers";

export type CommentsGetManyOutput = InferRouterOutputs<AppRouter>["comments"]["getMany"];
