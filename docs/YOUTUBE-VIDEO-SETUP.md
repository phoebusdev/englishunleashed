# YouTube Video Display Setup

## Overview

The videos page automatically fetches and displays your YouTube channel videos using RSS feeds - **completely free with zero API quota usage!**

## How It Works

1. **User visits `/videos` page**
2. **Page fetches RSS feed** from YouTube (no API key needed)
3. **Videos display immediately** with embedded players
4. **Cache refreshes every 5 minutes** for new content

## Setup Instructions

### Required: Add Your Channel ID to Vercel

In Vercel Dashboard → Settings → Environment Variables:

```env
YOUTUBE_CHANNEL_ID=UCxxxxxxxxxxxxxxxxxxxxxx
```

**How to find your channel ID:**
1. Go to your YouTube channel
2. Right-click → View Page Source (or press Ctrl+U)
3. Search for `"channelId"`
4. Copy the value starting with "UC" (24 characters)

### That's It!

Once deployed with the channel ID, videos will:
- Load automatically when users visit `/videos`
- Update within minutes of YouTube posting
- Play embedded on your site
- Show episode numbers and publish dates

## Features

✅ **Zero API Quota** - Uses RSS feeds, not YouTube API  
✅ **No Cron Jobs** - Fetches on page load with smart caching  
✅ **No Configuration** - Just needs channel ID  
✅ **Instant Updates** - New videos appear within minutes  
✅ **Embedded Playback** - Videos play directly on your site  

## Technical Details

### RSS Feed URL
```
https://www.youtube.com/feeds/videos.xml?channel_id=YOUR_CHANNEL_ID
```

### Caching Strategy
- **5-minute cache** on the API route
- **In-memory cache** to reduce RSS fetches
- **Fallback to cache** if RSS temporarily unavailable

### Data Flow
```
User → /videos page → /api/youtube/videos → RSS Feed → YouTube
         ↑                                      ↓
         ←──────── Cached Data ←───────────────┘
```

## Monitoring

Check if videos are loading:
```bash
curl https://your-site.vercel.app/api/youtube/videos
```

Response will show:
- `videos`: Array of video data
- `cached`: Whether using cached data
- `method`: "rss" (confirms RSS is being used)

## Troubleshooting

### No videos showing?
1. Verify `YOUTUBE_CHANNEL_ID` is set in Vercel
2. Check the channel ID is correct (starts with UC, 24 chars)
3. Ensure channel has public videos

### Videos not updating?
- Cache refreshes every 5 minutes
- Force refresh with hard reload (Ctrl+F5)
- RSS feed updates within minutes of YouTube posting

### Testing locally?
```bash
# Set channel ID in .env.local
YOUTUBE_CHANNEL_ID=UCxxxxxxxxxxxxxxxxxxxxxx

# Run development server
pnpm dev

# Visit http://localhost:3000/videos
```

## Benefits

| Feature | RSS (Current) | YouTube API (Old) |
|---------|--------------|-------------------|
| Quota Usage | **0** | 100-10,000 per day |
| API Key Required | **No** | Yes |
| Update Speed | 1-5 minutes | Real-time |
| Maintenance | **None** | Token refresh, quotas |
| Cost | **Free** | Potential charges |

## Video Display

Each video shows:
- Embedded YouTube player
- Episode number
- Title and description
- Publish date
- Hover effects

## Customization

To modify video display, edit `/app/videos/page.tsx`:
- Grid layout (2-3 columns responsive)
- Card styling
- Episode numbering
- Description truncation

## Performance

- **Page load**: ~500ms (with cache)
- **RSS fetch**: ~200ms
- **Cache duration**: 5 minutes
- **No database queries**: Videos load directly from RSS

---

**Remember:** No API keys, no quotas, no cron jobs - just add your channel ID and deploy! 🚀