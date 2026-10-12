import type { InferRouterOutputs } from "@orpc/server";
import { type AppRouter } from "~~/server/routers";

export type VideoGetOneOutput = InferRouterOutputs<AppRouter>["videos"]["getOne"];

export type VideoGetManyOutput = InferRouterOutputs<AppRouter>["suggestions"]["getMany"];
