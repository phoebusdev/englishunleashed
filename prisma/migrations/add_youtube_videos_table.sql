-- Add YouTubeVideo table for storing all channel videos
CREATE TABLE IF NOT EXISTS "YouTubeVideo" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "thumbnailUrl" TEXT,
    "thumbnailWidth" INTEGER,
    "thumbnailHeight" INTEGER,
    "channelId" TEXT,
    "videoUrl" TEXT NOT NULL,
    "duration" TEXT,
    "viewCount" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,

    CONSTRAINT "YouTubeVideo_pkey" PRIMARY KEY ("id")
);

-- Create unique index on videoId
CREATE UNIQUE INDEX IF NOT EXISTS "YouTubeVideo_videoId_key" ON "YouTubeVideo"("videoId");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "YouTubeVideo_publishedAt_idx" ON "YouTubeVideo"("publishedAt");
CREATE INDEX IF NOT EXISTS "YouTubeVideo_channelId_idx" ON "YouTubeVideo"("channelId");
CREATE INDEX IF NOT EXISTS "YouTubeVideo_addedAt_idx" ON "YouTubeVideo"("addedAt");