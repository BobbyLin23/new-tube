import { z } from "zod";

export { videoInsertSchema, videoUpdateSchema, videoSelectSchema } from "~~/server/db/schema";

export const thumbnailPromptSchema = z
  .string()
  .trim()
  .min(10, "Describe your thumbnail in at least 10 characters")
  .max(1500, "Keep your prompt within 1500 characters");
