import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { historicalVideos } from '@/lib/youtube-videos-static'

// One-time initialization endpoint for production
// Should be called once after deploying to populate the database
export async function POST(request: Request) {
  try {
    // Check if already initialized
    const existingCount = await prisma.youTubeVideo.count()
    if (existingCount > 30) {
      return NextResponse.json({
        success: false,
        message: 'Database already initialized',
        videoCount: existingCount
      })
    }
    
    console.log('🚀 Initializing YouTube videos database...')
    console.log(`📺 Found ${historicalVideos.length} historical videos to import`)
    
    let imported = 0
    let failed = 0
    const errors: string[] = []
    
    // Use transaction for better performance
    const results = await prisma.$transaction(
      historicalVideos.map(video => 
        prisma.youTubeVideo.upsert({
          where: { videoId: video.id },
          update: {
            title: video.title,
            description: video.description || '',
            thumbnailUrl: video.thumbnail?.url || '',
            thumbnailWidth: video.thumbnail?.width || 1280,
            thumbnailHeight: video.thumbnail?.height || 720,
          },
          create: {
            videoId: video.id,
            title: video.title,
            description: video.description || '',
            publishedAt: new Date(video.publishedAt),
            thumbnailUrl: video.thumbnail?.url || '',
            thumbnailWidth: video.thumbnail?.width || 1280,
            thumbnailHeight: video.thumbnail?.height || 720,
            videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
            source: 'manual'
          }
        })
      )
    )
    
    imported = results.length
    const totalInDb = await prisma.youTubeVideo.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      summary: {
        videosImported: imported,
        totalVideosInDatabase: totalInDb
      }
    })
    
  } catch (error) {
    console.error('Initialization failed:', error)
    
    // Try to provide helpful error message
    if (error instanceof Error && error.message.includes('P2002')) {
      return NextResponse.json({
        error: 'Some videos already exist',
        message: 'Database partially initialized. Videos page should work.'
      })
    }
    
    return NextResponse.json({ 
      error: 'Initialization failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      hint: 'The YouTubeVideo table might not exist. Ensure migrations have run.'
    }, { status: 500 })
  }
}