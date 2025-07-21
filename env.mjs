import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    ANALYZE: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
    YOUTUBE_API_KEY: z.string().optional(),
    YOUTUBE_CHANNEL_ID: z.string().optional(),
    YOUTUBE_CHANNEL_HANDLE: z.string().optional(),
    GUMROAD_ACCESS_TOKEN: z.string().optional(),
    WEBHOOK_SECRET: z.string().optional(),
    REVALIDATE_API_KEY: z.string().optional(),
  },
  client: {},
  runtimeEnv: {
    ANALYZE: process.env.ANALYZE,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    YOUTUBE_CHANNEL_ID: process.env.YOUTUBE_CHANNEL_ID,
    YOUTUBE_CHANNEL_HANDLE: process.env.YOUTUBE_CHANNEL_HANDLE,
    GUMROAD_ACCESS_TOKEN: process.env.GUMROAD_ACCESS_TOKEN,
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
    REVALIDATE_API_KEY: process.env.REVALIDATE_API_KEY,
  },
})
