import { NextResponse } from 'next/server'

export async function GET() {
  // Check which environment variables are set (without exposing values)
  const envStatus = {
    YOUTUBE_API_KEY: !!process.env.YOUTUBE_API_KEY,
    YOUTUBE_CHANNEL_ID: !!process.env.YOUTUBE_CHANNEL_ID,
    YOUTUBE_CHANNEL_HANDLE: !!process.env.YOUTUBE_CHANNEL_HANDLE,
    NODE_ENV: process.env.NODE_ENV,
  }

  return NextResponse.json({
    message: 'Environment variable status',
    status: envStatus,
    timestamp: new Date().toISOString()
  })
}