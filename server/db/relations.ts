import * as schema from "./schema";
import { defineRelations } from "drizzle-orm";

export const relations = defineRelations(schema, (r) => ({
  users: {
    videos: r.many.videos(),
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
}));
