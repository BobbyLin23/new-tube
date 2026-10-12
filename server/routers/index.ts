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
import { dislikeComment, likeComment } from "./comment-reactions";
import { createComment, listComments, removeComment } from "./comments";
import { listSuggestions } from "./suggestions";
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
  commentReactions: {
    like: likeComment,
    dislike: dislikeComment,
  },
  comments: {
    create: createComment,
    remove: removeComment,
    getMany: listComments,
  },
  suggestions: {
    getMany: listSuggestions,
  },
  subscriptions: {
    create: subscribeUser,
    remove: removeSubscription,
  },
};

export type AppRouter = typeof appRouter;
