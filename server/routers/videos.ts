import { authed } from "~~/server/routers/base";
import { db } from "~~/server/db";
import { videos } from "~~/server/db/schema";
import { mux } from "#server/utils/mux";

export const createVideo = authed.handler(async ({ context }) => {
  const upload = await mux.video.uploads.create({
    new_asset_settings: {
      passthrough: context.userId,
      playback_policy: ["public"],
    },
    cors_origin: "*", // TODO: In production, set to your url
  });

  const [video] = await db
    .insert(videos)
    .values({
      userId: context.userId,
      title: "Untitled",
      muxStatus: "waiting",
      muxUploadId: upload.id,
    })
    .returning();

  return {
    video: video,
    url: upload.url,
  };
});
