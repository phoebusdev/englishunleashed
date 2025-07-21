import { NextResponse } from 'next/server'

export async function GET() {
  // Disable in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    )
  }

  // Check which environment variables are set (without exposing values)
  const envStatus = {
    YOUTUBE_API_KEY: !!process.env.YOUTUBE_API_KEY,
    YOUTUBE_CHANNEL_ID: !!process.env.YOUTUBE_CHANNEL_ID,
    YOUTUBE_CHANNEL_HANDLE: !!process.env.YOUTUBE_CHANNEL_HANDLE,
    GUMROAD_ACCESS_TOKEN: !!process.env.GUMROAD_ACCESS_TOKEN,
    WEBHOOK_SECRET: !!process.env.WEBHOOK_SECRET,
    REVALIDATE_API_KEY: !!process.env.REVALIDATE_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
  }

  return NextResponse.json({
    message: 'Environment variable status (development only)',
    status: envStatus,
    timestamp: new Date().toISOString()
  })
}