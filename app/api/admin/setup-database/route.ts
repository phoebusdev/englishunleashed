import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Create the table using raw SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS "YouTubeVideo" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        "videoId" TEXT NOT NULL UNIQUE,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "publishedAt" TIMESTAMP NOT NULL,
        "thumbnailUrl" TEXT,
        "thumbnailWidth" INTEGER,
        "thumbnailHeight" INTEGER,
        "channelId" TEXT,
        "videoUrl" TEXT NOT NULL,
        "duration" TEXT,
        "viewCount" TEXT,
        "addedAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        "lastSeenAt" TIMESTAMP DEFAULT NOW(),
        "metadata" TEXT
      );
    `

    const createIndexSQL = [
      `CREATE INDEX IF NOT EXISTS "idx_youtube_published" ON "YouTubeVideo"("publishedAt" DESC);`,
      `CREATE INDEX IF NOT EXISTS "idx_youtube_channel" ON "YouTubeVideo"("channelId");`,
      `CREATE INDEX IF NOT EXISTS "idx_youtube_added" ON "YouTubeVideo"("addedAt" DESC);`
    ]

    // Execute the create table query
    await prisma.$executeRawUnsafe(createTableSQL)
    
    // Execute index creation
    for (const sql of createIndexSQL) {
      await prisma.$executeRawUnsafe(sql)
    }

    // Check if table was created
    const count = await prisma.$executeRaw`SELECT COUNT(*) FROM "YouTubeVideo"`

    return NextResponse.json({
      success: true,
      message: 'YouTubeVideo table created successfully',
      tableExists: true,
      rowCount: count
    })

  } catch (error: any) {
    // If table already exists, that's fine
    if (error.message?.includes('already exists')) {
      return NextResponse.json({
        success: true,
        message: 'Table already exists',
        tableExists: true
      })
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create table',
      details: error
    }, { status: 500 })
  }
}