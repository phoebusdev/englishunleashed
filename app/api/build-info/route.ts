import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    CI: process.env.CI,
    BUILD_ID: process.env.BUILD_ID,
    IS_BUILD_TIME: process.env.VERCEL && !process.env.VERCEL_URL,
  })
}