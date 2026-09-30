import { createEnv } from "@t3-oss/env-nuxt";
import * as z from "zod";

export const env = createEnv({
  emptyStringAsUndefined: true,
  server: {
    DATABASE_URL: z.url(),
    NUXT_CLERK_SECRET_KEY: z.string().min(1),
    NUXT_CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1),
    MUX_TOKEN_ID: z.string(),
    MUX_TOKEN_SECRET: z.string(),
    MUX_WEBHOOK_SECRET: z.string(),
    R2_ACCOUNT_ID: z.string(),
    R2_ACCESS_KEY_ID: z.string(),
    R2_SECRET_ACCESS_KEY: z.string(),
    R2_BUCKET_NAME: z.string(),
    // Public CDN base URL for the R2 bucket (custom domain or r2.dev).
    // Optional: absent URLs fall back to the Mux-hosted thumbnail.
    R2_PUBLIC_URL: z.url().optional(),
    // Optional until AI generation is enabled; checked together when starting a job.
    DEEPSEEK_API_KEY: z.string().min(1).optional(),
    DEEPSEEK_MODEL: z.enum(["deepseek-flash", "deepseek-v4-pro"]).default("deepseek-flash"),
    QSTASH_TOKEN: z.string().min(1).optional(),
    QSTASH_CURRENT_SIGNING_KEY: z.string().min(1).optional(),
    QSTASH_NEXT_SIGNING_KEY: z.string().min(1).optional(),
    QSTASH_URL: z.url().optional(),
    UPSTASH_WORKFLOW_URL: z.url().optional(),
  },
  client: {
    NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  },
});
