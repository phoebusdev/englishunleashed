# YouTube Video History Storage

## Overview

The videos page now stores all YouTube videos in the database, allowing you to display your entire channel history instead of just the 15 most recent videos from RSS.

## How It Works

1. **RSS Feed** fetches the 15 most recent videos from YouTube
2. **Database Storage** saves all videos permanently  
3. **Videos Page** displays ALL stored videos (not just the 15 from RSS)
4. **Automatic Updates** - new videos are added automatically when posted

## Benefits

✅ **Show ALL Videos** - Display your entire channel history  
✅ **Never Lose Videos** - Videos remain even if deleted from YouTube  
✅ **Fast Loading** - Database queries are faster than RSS  
✅ **Offline Resilience** - Works even if YouTube RSS is down  
✅ **Zero API Quota** - Still uses RSS, no API limits  

## Setup for Production (Vercel)

### 1. Run Database Migration

The YouTubeVideo table needs to be added to your production database. 

**Option A: Using Vercel Dashboard**
1. Go to your Vercel project
2. Navigate to Storage → Your Database
3. Click "Query" tab
4. Paste the contents of `prisma/migrations/add_youtube_videos_table.sql`
5. Execute the query

**Option B: Using Prisma Migrate (if you have direct database access)**
```bash
# Set your production DATABASE_URL
export DATABASE_URL="postgresql://..."

# Generate migration
pnpm prisma migrate deploy
```

### 2. Deploy the Updated Code

```bash
git add .
git commit -m "Add YouTube video history storage"
git push
```

Vercel will automatically deploy the changes.

### 3. Initial Video Sync (Optional)

After deployment, the first visitor to `/videos` will trigger the RSS sync, which will store the 15 most recent videos. All future videos will be added automatically.

To manually sync the initial videos via API:
```bash
curl -X POST https://your-site.vercel.app/api/youtube/videos \
  -H "Content-Type: application/json" \
  -d '{"clearCache": false}'
```

## How Videos Are Stored

When a user visits `/videos`:

1. **Check Cache** (5 minutes) - Return if fresh
2. **Fetch RSS** - Get latest 15 videos from YouTube
3. **Store/Update** - Save new videos to database
4. **Return All** - Show ALL videos from database

### Database Schema

```prisma
model YouTubeVideo {
  id          String   @id
  videoId     String   @unique  // YouTube video ID
  title       String
  description String?
  publishedAt DateTime
  thumbnailUrl String?
  channelId   String?           // Your channel ID
  videoUrl    String            // Full YouTube URL
  
  // Tracking
  addedAt     DateTime          // When we discovered it
  updatedAt   DateTime          // Last metadata update
  lastSeenAt  DateTime          // Last time in RSS
}
```

## Video Lifecycle

1. **New Video Posted** → Appears in RSS within minutes
2. **User Visits Site** → RSS checked, video stored in database
3. **Video Stored** → Permanent record, shown to all users
4. **RSS Limit Hit** → Only affects discovery of NEW videos
5. **Old Videos** → Always available from database

## Monitoring

Check stored video count:
```bash
# Via API
curl https://your-site.vercel.app/api/youtube/videos?debug=true

# Response includes:
# - totalVideosInDb: Total stored videos
# - rssVideosFound: Videos in current RSS (max 15)
# - method: "database+rss" confirms storage is working
```

## Limitations & Solutions

| Limitation | Impact | Solution |
|------------|--------|----------|
| RSS shows only 15 videos | Can't auto-discover older videos | Manual import via YouTube API if needed |
| First sync gets only 15 | History incomplete initially | Use API to import full history once |
| Deleted YouTube videos | Links break but data remains | Videos stay in your database |

## Manual Full History Import

If you want to import your ENTIRE channel history (beyond the 15 RSS videos):

1. **Use YouTube API** (one-time, uses quota)
   - Modify sync script to use YouTube Data API
   - Fetch all videos with pagination
   - Run once to populate history

2. **Export/Import** 
   - Export video list from YouTube Studio
   - Create import script for CSV data
   - Run once to populate database

3. **Keep Going Forward**
   - After initial import, RSS handles all new videos
   - No need for API quota ongoing

## Troubleshooting

### Videos not saving to database?

1. Check database connection:
```bash
# Test database is accessible
curl -X POST https://your-site.vercel.app/api/youtube/videos \
  -H "Content-Type: application/json" \
  -d '{"testChannelId": "UC..."}'
```

2. Check migration was run:
   - Verify YouTubeVideo table exists in database
   - Check Vercel logs for database errors

### Only showing 15 videos?

- This is expected initially (RSS limit)
- New videos will be added as they're posted
- Old videos need manual import (see above)

### Database storage not working?

Check logs for errors:
- Database connection issues
- Missing YouTubeVideo table
- Permission problems

## Best Practices

1. **Don't worry about RSS limits** - Storage handles history
2. **Let it build over time** - Each new video is stored
3. **Monitor occasionally** - Check video count grows
4. **Backup if critical** - Export database periodically

## Future Enhancements

Possible improvements:
- YouTube API integration for full history import
- Playlist support with separate storage
- View count and duration tracking
- Automatic thumbnail optimization
- Search and filtering capabilities

---

**Note:** This feature gracefully degrades - if database storage fails, the site still shows the 15 RSS videos. Your visitors always see content!