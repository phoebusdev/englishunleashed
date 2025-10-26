import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

// Check if we're in actual production deployment (not just local build)
const isProduction = process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'

export const env = createEnv({
  server: {
    ANALYZE: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
    YOUTUBE_API_KEY: z.string().optional(),
    YOUTUBE_CHANNEL_ID: z.string().optional(),
    YOUTUBE_CHANNEL_HANDLE: z.string().optional(),
    // Always required
    DATABASE_URL: z.string().min(1),
    NEXTAUTH_URL: z.string().min(1),
    NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
    // Required in production, optional in development
    STRIPE_SECRET_KEY: isProduction
      ? z.string().min(1, "STRIPE_SECRET_KEY is required in production")
      : z.string().optional(),
    STRIPE_WEBHOOK_SECRET: isProduction
      ? z.string().min(1, "STRIPE_WEBHOOK_SECRET is required in production")
      : z.string().optional(),
    BLOB_READ_WRITE_TOKEN: isProduction
      ? z.string().min(1, "BLOB_READ_WRITE_TOKEN is required in production")
      : z.string().optional(),
    RESEND_API_KEY: isProduction
      ? z.string().min(1, "RESEND_API_KEY is required in production")
      : z.string().optional(),
    CRON_SECRET: z.string().optional(), // Optional for now (cron requires paid Vercel plan)
  },
  client: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: isProduction
      ? z.string().min(1, "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required in production")
      : z.string().optional(),
  },
  runtimeEnv: {
    ANALYZE: process.env.ANALYZE,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    YOUTUBE_CHANNEL_ID: process.env.YOUTUBE_CHANNEL_ID,
    YOUTUBE_CHANNEL_HANDLE: process.env.YOUTUBE_CHANNEL_HANDLE,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    CRON_SECRET: process.env.CRON_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
})
