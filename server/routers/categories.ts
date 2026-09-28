import { base } from "~~/server/routers/base";
import { db } from "~~/server/db";
import { categories } from "~~/server/db/schema";

export const listCategories = base.handler(async () => {
  return await db.select().from(categories);
});
