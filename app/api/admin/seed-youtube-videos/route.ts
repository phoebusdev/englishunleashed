import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { historicalVideos } from '@/lib/youtube-videos-static'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('🚀 Starting YouTube video seed...')
    console.log(`📺 Found ${historicalVideos.length} historical videos to import`)
    
    let imported = 0
    let updated = 0
    let failed = 0
    const errors: string[] = []
    
    for (const video of historicalVideos) {
      try {
        const existing = await prisma.youTubeVideo.findUnique({
          where: { videoId: video.id }
        })
        
        if (existing) {
          // Update existing video
          await prisma.youTubeVideo.update({
            where: { videoId: video.id },
            data: {
              title: video.title,
              description: video.description,
              thumbnailUrl: video.thumbnail.url,
              thumbnailWidth: video.thumbnail.width,
              thumbnailHeight: video.thumbnail.height,
              updatedAt: new Date()
            }
          })
          updated++
        } else {
          // Create new video
          await prisma.youTubeVideo.create({
            data: {
              videoId: video.id,
              title: video.title,
              description: video.description,
              publishedAt: new Date(video.publishedAt),
              thumbnailUrl: video.thumbnail.url,
              thumbnailWidth: video.thumbnail.width,
              thumbnailHeight: video.thumbnail.height,
              videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
              source: 'manual'
            }
          })
          imported++
        }
      } catch (error) {
        failed++
        const errorMsg = `Failed to import video ${video.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }
    
    const totalInDb = await prisma.youTubeVideo.count()
    
    return NextResponse.json({
      success: true,
      summary: {
        newVideosImported: imported,
        existingVideosUpdated: updated,
        failedImports: failed,
        totalVideosInDatabase: totalInDb
      },
      errors: errors.length > 0 ? errors : undefined
    })
    
  } catch (error) {
    console.error('Seed failed:', error)
    return NextResponse.json({ 
      error: 'Seed failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}