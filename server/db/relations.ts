import * as schema from "./schema";
import { defineRelations } from "drizzle-orm";

export const relations = defineRelations(schema, (r) => ({
  users: {
    videos: r.many.videos(),
    videoReviews: r.many.videoViews(),
    videoReactions: r.many.videoReactions(),
    commentReactions: r.many.commentReactions(),
    subscriptions: r.many.subscriptions({
      alias: "subscriptions_viewer_id_fkey",
    }),
    subscribers: r.many.subscriptions({
      alias: "subscriptions_creator_id_fkey",
    }),
  },
  categories: {
    videos: r.many.videos(),
  },
  videos: {
    user: r.one.users({
      from: r.videos.userId,
      to: r.users.id,
    }),
    category: r.one.categories({
      from: r.videos.categoryId,
      to: r.categories.id,
    }),
    views: r.many.videoViews({
      from: r.videos.id,
      to: r.videoViews.videoId,
    }),
    reactions: r.many.videoReactions({
      from: r.videos.id,
      to: r.videoReactions.videoId,
    }),
  },
  videoViews: {
    user: r.one.users({
      from: r.videoViews.userId,
      to: r.users.id,
    }),
    video: r.one.videos({
      from: r.videoViews.videoId,
      to: r.videos.id,
    }),
  },
  videoReactions: {
    user: r.one.users({
      from: r.videoReactions.userId,
      to: r.users.id,
    }),
    video: r.one.videos({
      from: r.videoReactions.videoId,
      to: r.videos.id,
    }),
  },
  subscriptions: {
    viewer: r.one.users({
      from: r.subscriptions.viewerId,
      to: r.users.id,
      alias: "subscriptions_viewer_id_fkey",
    }),
    creator: r.one.users({
      from: r.subscriptions.creatorId,
      to: r.users.id,
      alias: "subscriptions_creator_id_fkey",
    }),
  },
  comments: {
    user: r.one.users({
      from: r.comments.userId,
      to: r.users.id,
    }),
    video: r.one.videos({
      from: r.comments.videoId,
      to: r.videos.id,
    }),
    reactions: r.many.commentReactions({
      from: r.comments.id,
      to: r.commentReactions.commentId,
    }),
  },
  commentReactions: {
    user: r.one.users({
      from: r.commentReactions.userId,
      to: r.users.id,
    }),
    comment: r.one.comments({
      from: r.commentReactions.commentId,
      to: r.comments.id,
    }),
  },
}));
