import { listCategories } from "~~/server/routers/categories";
import { createVideo } from "~~/server/routers/videos";
import { listStudios } from "~~/server/routers/studio";

export { authed, base } from "./base";

export const appRouter = {
  categories: {
    list: listCategories,
  },
  videos: {
    create: createVideo,
  },
  studio: {
    list: listStudios,
  },
};

export type AppRouter = typeof appRouter;
