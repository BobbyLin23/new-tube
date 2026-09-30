import * as schema from "./schema";
import { defineRelations } from "drizzle-orm";

export const relations = defineRelations(schema, (r) => ({
  users: {
    videos: r.many.videos(),
    videoReviews: r.many.videoViews(),
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
}));
