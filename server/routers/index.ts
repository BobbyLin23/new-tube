import { listCategories } from "~~/server/routers/categories";
import { createVideo, updateVideo, removeVideo } from "~~/server/routers/videos";
import { listVideosInStudio, getVideoById } from "~~/server/routers/studio";

export { authed, base } from "./base";

export const appRouter = {
  categories: {
    list: listCategories,
  },
  videos: {
    create: createVideo,
    update: updateVideo,
    remove: removeVideo,
  },
  studio: {
    list: listVideosInStudio,
    getOne: getVideoById,
  },
};

export type AppRouter = typeof appRouter;
