import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { syncYouTubeVideos } from '@/lib/youtube-sync'

export async function GET(request: Request) {
  // Verify this is from Vercel Cron
  const authHeader = headers().get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const result = await syncYouTubeVideos()
    
    return NextResponse.json({
      success: true,
      synced: result.synced,
      errors: result.errors,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cron sync error:', error)
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}