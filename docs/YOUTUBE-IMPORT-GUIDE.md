# YouTube Full History Import Guide

## Quick Start (After Deployment)

### Step 1: Run Database Migration on Vercel

1. Go to Vercel Dashboard → Your Project → Storage → Your Database
2. Click "Query" tab
3. Paste this SQL and execute:

```sql
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

CREATE UNIQUE INDEX IF NOT EXISTS "YouTubeVideo_videoId_key" ON "YouTubeVideo"("videoId");
CREATE INDEX IF NOT EXISTS "YouTubeVideo_publishedAt_idx" ON "YouTubeVideo"("publishedAt");
CREATE INDEX IF NOT EXISTS "YouTubeVideo_channelId_idx" ON "YouTubeVideo"("channelId");
CREATE INDEX IF NOT EXISTS "YouTubeVideo_addedAt_idx" ON "YouTubeVideo"("addedAt");
```

### Step 2: Set Environment Variables on Vercel

In Vercel Dashboard → Settings → Environment Variables, ensure these are set:

```env
YOUTUBE_API_KEY=your-youtube-api-key
YOUTUBE_CHANNEL_ID=your-channel-id
```

**Getting your YouTube API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new API key or use existing
3. Enable "YouTube Data API v3"

**Finding your Channel ID:**
1. Go to your YouTube channel
2. View page source (Ctrl+U)
3. Search for "channelId"
4. Copy the value starting with "UC" (24 characters)

### Step 3: Import Your Videos

#### Option A: Using Admin UI (if available)
1. Login as admin at: https://your-site.vercel.app/login
2. Navigate to: https://your-site.vercel.app/api/admin/import-youtube-history
3. Click "Import All Videos"

#### Option B: Using cURL (manual)
```bash
# First, login as admin and get your session cookie from browser DevTools

# Then run:
curl -X POST https://your-site.vercel.app/api/admin/import-youtube-history \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie-here" \
  -d '{}'
```

#### Option C: Using the Script (from your local machine)
```bash
# Set in .env.local:
NEXT_PUBLIC_SITE_URL=https://your-site.vercel.app
AUTH_COOKIE=your-session-cookie  # Get from browser after logging in

# Run:
pnpm youtube:import-api
```

### Step 4: Verify Import

Visit https://your-site.vercel.app/videos and you should see ALL your videos!

## What Happens Next?

1. **Existing Videos**: All your historical videos are now stored
2. **New Videos**: Automatically added via RSS when posted (no API needed)
3. **Updates**: RSS keeps the 15 most recent videos updated
4. **Permanence**: Videos remain even if deleted from YouTube

## Troubleshooting

### "Unauthorized - Admin access required"
- You need to be logged in as an admin user
- Run `pnpm seed:admin` locally to create admin user
- Login with those credentials

### "YouTube API key not configured"
- Add YOUTUBE_API_KEY to Vercel environment variables
- Redeploy after adding the variable

### "Could not find uploads playlist"
- Check the channel ID is correct
- Ensure the channel has public videos

### Database table doesn't exist
- Run the SQL migration from Step 1
- Check for any errors in the query execution

## API Quota Information

- **One-time cost**: ~100 units per 50 videos
- **Daily limit**: 10,000 units (free tier)
- **Your channel**: Will use ~2 units per video
- **After import**: Zero quota (RSS only)

## Support

If you encounter issues:
1. Check Vercel function logs for errors
2. Verify all environment variables are set
3. Ensure database migration was successful
4. Check YouTube API quotas haven't been exceeded

---

**Remember**: This is a one-time setup. After import, your site will automatically handle new videos via RSS with zero API quota usage!