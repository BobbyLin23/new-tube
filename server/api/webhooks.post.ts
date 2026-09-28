import { verifyWebhook } from "@clerk/nuxt/webhooks";
import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { users } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  try {
    // @clerk/nuxt bundles its own h3 copy, so its H3Event type is distinct from the app's;
    // runtime shape is identical, hence the cast (verified end-to-end against Neon).
    const evt = await verifyWebhook(event as unknown as Parameters<typeof verifyWebhook>[0]);

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const data = evt.data;
      const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || data.id;
      const imageUrl = data.image_url ?? "";

      if (evt.type === "user.created") {
        await db.insert(users).values({
          clerkId: data.id,
          name,
          imageUrl,
        });
      } else {
        await db
          .update(users)
          .set({ name, imageUrl, updatedAt: new Date() })
          .where(eq(users.clerkId, data.id));
      }
    } else if (evt.type === "user.deleted") {
      const { id } = evt.data;
      if (typeof id !== "string") {
        console.warn("Clerk webhook user.deleted missing id, skipping:", evt.data);
        return { received: true };
      }
      await db.delete(users).where(eq(users.clerkId, id));
    }

    return { received: true };
  } catch (error) {
    console.error("Clerk webhook error:", error);
    throw createError({
      statusCode: 400,
      statusMessage: "Webhook verification failed",
    });
  }
});
