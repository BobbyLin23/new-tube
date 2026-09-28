import { authed } from "~~/server/routers/base";
import { db } from "~~/server/db";
import { videos } from "~~/server/db/schema";

export const createVideo = authed.handler(async ({ context }) => {
  const [video] = await db
    .insert(videos)
    .values({
      userId: context.userId,
      title: "Untitled",
    })
    .returning();

  return {
    video: video,
  };
});
