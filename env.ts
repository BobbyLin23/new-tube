import { createEnv } from "@t3-oss/env-nuxt";
import * as z from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    NUXT_CLERK_SECRET_KEY: z.string().min(1),
  },
  client: {
    NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  },
});
