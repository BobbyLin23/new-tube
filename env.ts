import { createEnv } from "@t3-oss/env-nuxt";
import * as z from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    NUXT_CLERK_SECRET_KEY: z.string().min(1),
    NUXT_CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1),
    MUX_TOKEN_ID: z.string(),
    MUX_TOKEN_SECRET: z.string(),
    MUX_WEBHOOK_SECRET: z.string(),
  },
  client: {
    NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  },
});
