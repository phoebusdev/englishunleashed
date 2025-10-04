# Sync YouTube Content

Complete guide for managing YouTube video synchronization in English Unleashed.

## 1. Manual YouTube Sync

### Quick Sync Commands
```bash
# Full YouTube sync (all videos)
pnpm youtube:sync

# Import historical videos
pnpm youtube:import-history

# Sync via RSS feed (faster)
pnpm youtube:rss-sync

# Import via YouTube API (detailed metadata)
pnpm youtube:import-api
```

### Check Sync Status
```bash
# View current videos in database
pnpm db:studio
# Navigate to Video table to see synced content

# Check YouTube API quota usage
npx tsx -e "
import { youtube } from './lib/youtube'
const response = await youtube.videos.list({
  part: ['statistics'],
  id: ['test-video-id']
})
console.log('API quota remaining:', response.headers['x-ratelimit-remaining'])
"
```

## 2. Setup YouTube Integration

### Configure API Keys
```bash
# Add to .env.local
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_CHANNEL_ID=your_channel_id_here
YOUTUBE_CHANNEL_HANDLE=@your_channel_handle

# Optional: For webhook security
YOUTUBE_WEBHOOK_SECRET=random_secret_string
```

### Get YouTube Channel ID
```bash
# If you only have the channel handle
npx tsx -e "
import { youtube } from './lib/youtube'
const response = await youtube.channels.list({
  part: ['id'],
  forHandle: '@your_channel_handle'
})
console.log('Channel ID:', response.data.items[0].id)
"
```

## 3. YouTube Webhook Setup

### Setup Webhook Endpoint
```bash
# Setup YouTube webhook subscription
pnpm youtube:webhook:setup

# Unsubscribe from webhooks
pnpm youtube:webhook:unsubscribe
```

### Manual Webhook Setup
```typescript
// File: scripts/setup-youtube-webhook.ts
import { google } from 'googleapis'

async function setupWebhook() {
  const youtube = google.youtube('v3')

  // Subscribe to channel updates
  const response = await youtube.subscriptions.insert({
    part: ['snippet'],
    requestBody: {
      snippet: {
        resourceId: {
          kind: 'youtube#channel',
          channelId: process.env.YOUTUBE_CHANNEL_ID
        }
      }
    }
  })

  console.log('Webhook subscription created:', response.data.id)
}
```

### Test Webhook Reception
```bash
# Test webhook endpoint locally
curl -X POST http://localhost:3000/api/webhooks/youtube \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>yt:video:TEST_VIDEO_ID</id>
    <title>Test Video</title>
    <published>2024-01-01T00:00:00Z</published>
  </entry>
</feed>'
```

## 4. Video Import Strategies

### Strategy 1: RSS Feed Sync (Recommended)
```typescript
// File: scripts/sync-youtube-rss.ts
import { parseStringPromise } from 'xml2js'
import { db } from '../lib/db'

async function syncViaRSS() {
  const channelId = process.env.YOUTUBE_CHANNEL_ID
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`

  const response = await fetch(rssUrl)
  const xmlData = await response.text()
  const parsed = await parseStringPromise(xmlData)

  const entries = parsed.feed.entry || []

  for (const entry of entries) {
    const videoId = entry['yt:videoId'][0]
    const title = entry.title[0]
    const publishedAt = new Date(entry.published[0])

    // Check if video already exists
    const existingVideo = await db.video.findUnique({
      where: { youtubeId: videoId }
    })

    if (!existingVideo) {
      await db.video.create({
        data: {
          youtubeId: videoId,
          title,
          publishedAt,
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        }
      })
      console.log('Added video:', title)
    }
  }
}
```

### Strategy 2: YouTube API Sync (Detailed)
```typescript
// File: scripts/import-youtube-via-api.ts
import { youtube } from '../lib/youtube'
import { db } from '../lib/db'

async function syncViaAPI() {
  let nextPageToken = ''
  let totalVideos = 0

  do {
    const response = await youtube.search.list({
      part: ['snippet'],
      channelId: process.env.YOUTUBE_CHANNEL_ID,
      type: ['video'],
      order: 'date',
      maxResults: 50,
      pageToken: nextPageToken
    })

    const videos = response.data.items || []

    for (const video of videos) {
      const videoId = video.id.videoId
      const snippet = video.snippet

      // Get detailed video statistics
      const detailResponse = await youtube.videos.list({
        part: ['statistics', 'contentDetails'],
        id: [videoId]
      })

      const details = detailResponse.data.items[0]

      await db.video.upsert({
        where: { youtubeId: videoId },
        update: {
          title: snippet.title,
          description: snippet.description,
          thumbnailUrl: snippet.thumbnails.maxres?.url || snippet.thumbnails.high.url,
          publishedAt: new Date(snippet.publishedAt),
          viewCount: parseInt(details.statistics.viewCount || '0'),
          duration: details.contentDetails.duration
        },
        create: {
          youtubeId: videoId,
          title: snippet.title,
          description: snippet.description,
          thumbnailUrl: snippet.thumbnails.maxres?.url || snippet.thumbnails.high.url,
          publishedAt: new Date(snippet.publishedAt),
          viewCount: parseInt(details.statistics.viewCount || '0'),
          duration: details.contentDetails.duration
        }
      })

      totalVideos++
    }

    nextPageToken = response.data.nextPageToken
  } while (nextPageToken)

  console.log(`Synced ${totalVideos} videos`)
}
```

## 5. Troubleshooting YouTube Sync

### Issue: API Quota Exceeded
**Error**: `quotaExceeded` from YouTube API

**Solutions**:
1. **Check quota usage in Google Cloud Console**
2. **Use RSS feed for basic sync** (no quota limits)
3. **Implement caching** to reduce API calls

```typescript
// Implement video caching
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

async function getCachedVideoDetails(videoId: string) {
  const cached = await redis.get(`video:${videoId}`)
  if (cached) {
    return JSON.parse(cached)
  }

  const details = await youtube.videos.list({
    part: ['snippet', 'statistics'],
    id: [videoId]
  })

  await redis.setex(`video:${videoId}`, CACHE_DURATION / 1000, JSON.stringify(details.data))
  return details.data
}
```

### Issue: Videos Not Appearing on Site
**Problem**: Videos synced but not showing in frontend

**Debug Steps**:
```bash
# Check video count in database
npx tsx -e "
import { db } from './lib/db'
const count = await db.video.count()
console.log('Total videos in database:', count)
"

# Check video fetch in homepage
# File: app/(public)/page.tsx
# Verify video query includes proper ordering and filtering
```

### Issue: Duplicate Videos
**Problem**: Same video imported multiple times

**Solution**:
```typescript
// Use upsert instead of create
await db.video.upsert({
  where: { youtubeId: videoId },
  update: {
    // Update fields that might change
    title: snippet.title,
    description: snippet.description,
    viewCount: parseInt(statistics.viewCount || '0')
  },
  create: {
    // Create new video record
    youtubeId: videoId,
    title: snippet.title,
    // ... other fields
  }
})
```

### Issue: Webhook Not Receiving Updates
**Problem**: YouTube webhook endpoint not triggered

**Debug Steps**:
1. **Check webhook subscription status**:
```bash
# List active subscriptions (if available via API)
npx tsx -e "
// Check webhook logs in Vercel dashboard
console.log('Check Vercel function logs for webhook endpoint')
"
```

2. **Test webhook endpoint manually**:
```bash
# Test with PubSubHubbub
curl -X POST https://pubsubhubbub.appspot.com/subscribe \
  -d "hub.callback=https://your-domain.com/api/webhooks/youtube" \
  -d "hub.topic=https://www.youtube.com/feeds/videos.xml?channel_id=YOUR_CHANNEL_ID" \
  -d "hub.verify=sync" \
  -d "hub.mode=subscribe"
```

## 6. Video Metadata Management

### Update Video Thumbnails
```bash
# Refresh thumbnails for all videos
npx tsx -e "
import { db } from './lib/db'

const videos = await db.video.findMany()

for (const video of videos) {
  const thumbnailUrl = \`https://img.youtube.com/vi/\${video.youtubeId}/maxresdefault.jpg\`

  // Check if thumbnail exists
  const response = await fetch(thumbnailUrl, { method: 'HEAD' })
  const finalUrl = response.ok ? thumbnailUrl : \`https://img.youtube.com/vi/\${video.youtubeId}/hqdefault.jpg\`

  await db.video.update({
    where: { id: video.id },
    data: { thumbnailUrl: finalUrl }
  })
}

console.log('Updated thumbnails for all videos')
"
```

### Batch Update Video Metadata
```typescript
// Update video descriptions, view counts, etc.
async function updateVideoMetadata() {
  const videos = await db.video.findMany({
    where: {
      updatedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Older than 7 days
    }
  })

  for (const video of videos) {
    try {
      const response = await youtube.videos.list({
        part: ['snippet', 'statistics'],
        id: [video.youtubeId]
      })

      const youtubeVideo = response.data.items[0]
      if (youtubeVideo) {
        await db.video.update({
          where: { id: video.id },
          data: {
            title: youtubeVideo.snippet.title,
            description: youtubeVideo.snippet.description,
            viewCount: parseInt(youtubeVideo.statistics.viewCount || '0'),
            updatedAt: new Date()
          }
        })
      }
    } catch (error) {
      console.error(`Failed to update video ${video.youtubeId}:`, error.message)
    }
  }
}
```

## 7. Performance Optimization

### Optimize Video Loading
```typescript
// File: components/video/VideoGrid.tsx
// Implement pagination for large video lists
interface VideoGridProps {
  videos: Video[]
  totalCount: number
  currentPage: number
}

export function VideoGrid({ videos, totalCount, currentPage }: VideoGridProps) {
  const hasNextPage = currentPage * VIDEOS_PER_PAGE < totalCount

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      {hasNextPage && (
        <LoadMoreButton onLoadMore={() => loadNextPage()} />
      )}
    </div>
  )
}
```

### Cache Video Data
```typescript
// Add Redis caching for video lists
import { redis } from '../lib/redis'

export async function getVideos(page = 1, limit = 12) {
  const cacheKey = `videos:page:${page}:limit:${limit}`
  const cached = await redis.get(cacheKey)

  if (cached) {
    return JSON.parse(cached)
  }

  const videos = await db.video.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { publishedAt: 'desc' }
  })

  // Cache for 10 minutes
  await redis.setex(cacheKey, 600, JSON.stringify(videos))
  return videos
}
```

## 8. Monitoring YouTube Sync

### Create Sync Health Check
```typescript
// File: app/api/admin/youtube-health/route.ts
export async function GET() {
  const latestVideo = await db.video.findFirst({
    orderBy: { publishedAt: 'desc' }
  })

  const totalVideos = await db.video.count()

  const syncHealth = {
    totalVideos,
    latestVideoDate: latestVideo?.publishedAt,
    lastSyncAttempt: await getLastSyncAttempt(),
    isHealthy: isWithinLast24Hours(latestVideo?.publishedAt)
  }

  return Response.json(syncHealth)
}
```

### Set Up Sync Alerts
```bash
# Create cron job to check sync health
# File: app/api/cron/check-youtube-sync/route.ts
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const lastSync = await getLastSyncTime()
  const isStale = Date.now() - lastSync.getTime() > 24 * 60 * 60 * 1000

  if (isStale) {
    await sendAdminAlert({
      type: 'YOUTUBE_SYNC_STALE',
      message: 'YouTube sync has not run in over 24 hours'
    })
  }

  return new Response('OK')
}
```

This comprehensive guide covers all aspects of YouTube content synchronization for English Unleashed.