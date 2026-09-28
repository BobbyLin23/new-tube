import { authed } from "~~/server/routers/base.ts";
import { db } from "~~/server/db";
import { categories } from "~~/server/db/schema.ts";

export const listCategories = authed.handler(async () => {
  return await db.select().from(categories);
});
