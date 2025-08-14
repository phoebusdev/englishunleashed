-- CreateTable
CREATE TABLE "YouTubeVideo" (
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

-- CreateIndex
CREATE UNIQUE INDEX "YouTubeVideo_videoId_key" ON "YouTubeVideo"("videoId");

-- CreateIndex
CREATE INDEX "YouTubeVideo_publishedAt_idx" ON "YouTubeVideo"("publishedAt");

-- CreateIndex
CREATE INDEX "YouTubeVideo_channelId_idx" ON "YouTubeVideo"("channelId");

-- CreateIndex
CREATE INDEX "YouTubeVideo_addedAt_idx" ON "YouTubeVideo"("addedAt");