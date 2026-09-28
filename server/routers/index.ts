import { listCategories } from "~~/server/routers/categories";

export { authed, base } from "./base";

export const appRouter = {
  categories: {
    list: listCategories,
  },
};

export type AppRouter = typeof appRouter;
