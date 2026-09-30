import { serve } from "@upstash/workflow";
import { and, eq, isNull, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "~~/server/db";
import { videos } from "~~/server/db/schema";
import { r2Delete, r2StoreFromUrl } from "~~/server/utils/r2";
import { getThumbnailGenerationConfig } from "~~/server/utils/workflow";
import { parseMiniMaxImageResponse } from "~~/server/utils/minimax";

const inputSchema = z.object({
  userId: z.uuid(),
  videoId: z.uuid(),
  prompt: thumbnailPromptSchema,
  originalKey: z.string().nullable(),
  originalUrl: z.string().nullable(),
});

export default defineEventHandler(async (event) => {
  if (!getHeader(event, "upstash-signature"))
    throw createError({ statusCode: 401, statusMessage: "Missing workflow signature" });
  let config: ReturnType<typeof getThumbnailGenerationConfig>;
  try {
    config = getThumbnailGenerationConfig();
  } catch {
    throw createError({ statusCode: 503, statusMessage: "Thumbnail generation is not configured" });
  }

  const { handler } = serve(
    async (context) => {
      const { userId, videoId, prompt, originalKey, originalUrl } = context.requestPayload;
      await context.run("get-video", async () => {
        const [video] = await db
          .select({ id: videos.id })
          .from(videos)
          .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
        if (!video) throw new Error("Video not found");
      });

      const { body, status } = await context.call<unknown>("generate-thumbnail", {
        url: `${config.MINIMAX_API_HOST}/v1/image_generation`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.MINIMAX_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "image-01",
          prompt,
          aspect_ratio: "16:9",
          response_format: "url",
          n: 1,
        }),
        timeout: "2m",
        retries: 0,
      });
      const imageUrl = parseMiniMaxImageResponse(body, status);

      // Use a stable, unique key so replaying an upload step cannot create duplicate files.
      const key = `thumbnails/${userId}/${videoId}-ai-${encodeURIComponent(context.workflowRunId)}.jpg`;
      const uploaded = await context.run("upload-thumbnail", () => r2StoreFromUrl(imageUrl, key));
      const applied = await context.run("update-video", async () => {
        const [updated] = await db
          .update(videos)
          .set({ thumbnailKey: uploaded.key, thumbnailUrl: uploaded.url, updatedAt: new Date() })
          .where(
            and(
              eq(videos.id, videoId),
              eq(videos.userId, userId),
              or(
                // A replay after a committed update is still successful.
                eq(videos.thumbnailKey, uploaded.key),
                and(
                  originalKey === null
                    ? isNull(videos.thumbnailKey)
                    : eq(videos.thumbnailKey, originalKey),
                  originalUrl === null
                    ? isNull(videos.thumbnailUrl)
                    : eq(videos.thumbnailUrl, originalUrl),
                ),
              ),
            ),
          )
          .returning({ id: videos.id });
        return Boolean(updated);
      });

      await context.run("cleanup-thumbnail", async () => {
        if (!applied) await r2Delete(uploaded.key);
        // Only delete unique custom uploads; Mux thumbnails use reusable keys.
        else if (originalKey?.startsWith(`thumbnails/${userId}/`) && originalKey !== uploaded.key)
          await r2Delete(originalKey);
      });
      return { applied };
    },
    { schema: inputSchema, env: config, baseUrl: config.UPSTASH_WORKFLOW_URL },
  );

  const response = await handler(toWebRequest(event));
  return response.status >= 400
    ? new Response("Workflow request failed", { status: response.status })
    : response;
});
