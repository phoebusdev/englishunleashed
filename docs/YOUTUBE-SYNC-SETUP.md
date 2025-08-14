# YouTube Video Sync Setup Guide

## Overview

This system automatically syncs YouTube videos to your website using RSS feeds - **no API quota usage!**

## Features

✅ **Zero API Quota Usage** - Uses YouTube RSS feeds instead of API  
✅ **Automatic Sync** - Runs every 30 minutes via Vercel Cron  
✅ **No Configuration Needed** - Works immediately after deployment  
✅ **Fallback Display** - Shows sample videos if no real videos synced yet

## Setup Instructions

### 1. Find Your YouTube Channel ID

Your channel ID starts with "UC" and is 24 characters long.

**How to find it:**
1. Go to your YouTube channel
2. Right-click → View Page Source
3. Search for `"channelId"`
4. Copy the value (e.g., `UCxxxxxxxxxxxxxxxxxxxxxx`)

**Alternative method:**
1. Go to your channel
2. Click "About"
3. Click "Share Channel"
4. The URL contains `/channel/UCxxxxxxxxxxxxxxxxxxxxxx`

### 2. Add Channel ID to Vercel

In Vercel Dashboard → Settings → Environment Variables:

```env
YOUTUBE_CHANNEL_ID=UCxxxxxxxxxxxxxxxxxxxxxx
CRON_SECRET=your-random-secret-here
```

Generate a CRON_SECRET:
```bash
openssl rand -base64 32
```

### 3. Deploy to Vercel

```bash
git add -A
git commit -m "Add YouTube RSS sync"
git push
```

### 4. Initial Video Sync

After deployment, trigger the initial sync:

```bash
# Option 1: Use the RSS sync endpoint directly
curl -X POST https://your-site.vercel.app/api/cron/sync-youtube-rss \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"initialSync": true}'

# Option 2: Wait for automatic sync (runs every 30 minutes)
```

## How It Works

### Automatic Sync (Production)

1. **Vercel Cron** runs `/api/cron/sync-youtube-rss` every 30 minutes
2. **RSS Feed** is fetched from `youtube.com/feeds/videos.xml?channel_id=XXX`
3. **New Videos** are detected and added to database
4. **Videos Page** displays all synced videos automatically

### Manual Sync (Development/Testing)

```bash
# Preview what videos would be synced
npm run youtube:rss-sync preview UCxxxxxxxxxxxxxxxxxxxxxx

# Sync latest 10 videos
npm run youtube:rss-sync UCxxxxxxxxxxxxxxxxxxxxxx

# Sync specific number of videos
npm run youtube:rss-sync 20 UCxxxxxxxxxxxxxxxxxxxxxx
```

## Video Display

Videos appear on `/videos` page with:
- YouTube embed player
- Title and description
- Episode numbering
- Link to YouTube channel

## Database Structure

Each video creates:
1. **Product** - Entry in products table (price set to 0 for free videos)
2. **Pack** - Entry in packs table with:
   - `videoId`: YouTube video ID
   - `videoUrl`: Full YouTube URL
   - `title`: Video title
   - `description`: Video description
   - `metadata`: Publishing info and thumbnail

## Monitoring

### Check Sync Status
```bash
# View recent sync attempts
curl https://your-site.vercel.app/api/health

# Check Vercel Function logs
# Vercel Dashboard → Functions → sync-youtube-rss → Logs
```

### Troubleshooting

**Videos not appearing:**
1. Check channel ID is correct
2. Verify CRON_SECRET is set in Vercel
3. Check Function logs for errors
4. Manually trigger sync with curl command

**Cron not running:**
1. Verify `vercel.json` has cron configuration
2. Check Vercel Dashboard → Settings → Crons
3. Ensure you're on Vercel Pro plan (required for crons)

## API Quota Comparison

| Method | Quota Usage | Frequency | Videos/Day |
|--------|------------|-----------|------------|
| YouTube API Search | 100 units/call | Limited | ~100 videos |
| YouTube API Activities | 1 unit/call | 10,000 calls/day | 10,000 videos |
| **RSS Feed (Our Method)** | **0 units** | **Unlimited** | **Unlimited** |

## Advanced Configuration

### Custom Sync Frequency

Edit `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-youtube-rss",
      "schedule": "0 * * * *"  // Every hour
    }
  ]
}
```

Cron schedule examples:
- `*/30 * * * *` - Every 30 minutes (default)
- `0 * * * *` - Every hour
- `0 */6 * * *` - Every 6 hours
- `0 0 * * *` - Daily at midnight

### Filter Videos

To only sync certain videos, modify `/lib/youtube-rss.ts`:
```typescript
// Example: Only sync videos with "English" in title
if (!video.title.includes('English')) continue
```

## Benefits of RSS Sync

1. **No API Key Required** - Works without YouTube API key
2. **No Quota Limits** - Unlimited syncs per day
3. **Fast** - RSS feeds are cached by YouTube
4. **Reliable** - No authentication or token refresh needed
5. **Real-time** - RSS updates within minutes of video publish

## Security Notes

- CRON_SECRET prevents unauthorized sync triggers
- RSS feeds are public (no private video access)
- No user data or analytics available via RSS
- Videos are stored locally for faster page loads

## Next Steps

After videos are syncing:
1. Customize video display on `/videos` page
2. Add PDF materials to videos (admin panel)
3. Create quizzes for videos (admin panel)
4. Set up payment for premium content

---

**Remember:** RSS sync uses ZERO API quota - sync as often as you want! 🎉