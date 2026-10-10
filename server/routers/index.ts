import { listCategories } from "~~/server/routers/categories";
import {
  createVideo,
  updateVideo,
  removeVideo,
  restoreThumbnail,
  uploadThumbnailUrl,
  setThumbnail,
  generateTitle,
  generateDescription,
  generateThumbnail,
  generationStatus,
} from "~~/server/routers/videos";
import { listVideosInStudio, getVideoById } from "~~/server/routers/studio";
import { createVideoView } from "./videoViews";
import { dislikeVideo, likeVideo } from "./video-reactions";
import { createComment, listComments, removeComment } from "./comments";
import { removeSubscription, subscribeUser } from "./subscriptions";

export { authed, base } from "./base";

export const appRouter = {
  categories: {
    list: listCategories,
  },
  videos: {
    create: createVideo,
    update: updateVideo,
    remove: removeVideo,
    getOne: getVideoById,
    restoreThumbnail,
    uploadThumbnailUrl,
    setThumbnail,
    generateTitle,
    generateDescription,
    generateThumbnail,
    generationStatus,
  },
  studio: {
    list: listVideosInStudio,
    getOne: getVideoById,
  },
  videoViews: {
    create: createVideoView,
  },
  videoReactions: {
    like: likeVideo,
    dislike: dislikeVideo,
  },
  comments: {
    create: createComment,
    remove: removeComment,
    getMany: listComments,
  },
  subscriptions: {
    create: subscribeUser,
    remove: removeSubscription,
  },
};

export type AppRouter = typeof appRouter;
