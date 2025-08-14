-- CreateTable
CREATE TABLE "YouTubeVideo" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "thumbnailUrl" TEXT,
    "thumbnailWidth" INTEGER NOT NULL DEFAULT 1280,
    "thumbnailHeight" INTEGER NOT NULL DEFAULT 720,
    "videoUrl" TEXT NOT NULL,
    "duration" TEXT,
    "viewCount" TEXT,
    "source" TEXT NOT NULL DEFAULT 'rss',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YouTubeVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YouTubeVideo_videoId_key" ON "YouTubeVideo"("videoId");

-- CreateIndex
CREATE INDEX "YouTubeVideo_publishedAt_idx" ON "YouTubeVideo"("publishedAt");

-- CreateIndex
CREATE INDEX "YouTubeVideo_videoId_idx" ON "YouTubeVideo"("videoId");