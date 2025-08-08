# YouTube Sync Optimization Guide

## Overview
This system provides efficient YouTube video synchronization with minimal API quota usage.

## API Quota Usage Comparison

### Old System (Problem)
- **Search API**: 100 units per call
- **Videos API**: 1 unit per video
- **Total per sync**: 101+ units (for 50 videos)
- **Daily with hourly sync**: 2,424 units
- **Result**: Quota exceeded in < 5 hours

### New System (Solution)
- **Activities API**: 1 unit per call (checks latest only)
- **Videos API**: 1 unit when new video found
- **Total per sync**: 1-2 units max
- **Daily with 4x sync**: 4-8 units
- **Result**: Uses < 0.1% of daily quota

## Features

### 1. Instant Webhook Notifications (Recommended)
- **Zero API quota usage**
- **Instant notifications** when videos are published
- **Uses YouTube PubSubHubbub**

#### Setup Webhook
```bash
# Subscribe to channel notifications
npm run youtube:webhook:setup

# Unsubscribe (if needed)
npm run youtube:webhook:unsubscribe
```

**Important**: 
- Webhook URL must be publicly accessible
- Subscriptions expire after 10 days (auto-renew via cron)
- Add `YOUTUBE_WEBHOOK_SECRET` to .env for security

### 2. Optimized Cron Job
- Runs every 6 hours (configurable)
- Only checks for the latest video
- Uses 1 API unit per check

### 3. Manual Sync Tools

#### Sync Latest Video
```bash
npm run youtube:sync latest
```

#### Sync Specific Video
```bash
# By video ID
npm run youtube:sync dQw4w9WgXcQ

# By URL
npm run youtube:sync https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

## Environment Variables

```env
# Required
YOUTUBE_API_KEY=your-api-key
YOUTUBE_CHANNEL_ID=UCxxxxxxxxxxxxxx

# Optional (for webhooks)
YOUTUBE_WEBHOOK_SECRET=random-secret-string

# Admin notifications
ADMIN_EMAIL=admin@example.com
```

## API Endpoints

### Admin Dashboard
`GET /api/admin/youtube-sync` - View sync status and quota
`POST /api/admin/youtube-sync` - Manually trigger sync

### Webhook Endpoint
`GET /api/webhooks/youtube` - Webhook verification
`POST /api/webhooks/youtube` - Receive video notifications

### Cron Endpoints
`/api/cron/sync-youtube-optimized` - Optimized sync (1 unit)

## Workflow

1. **New Video Published** on YouTube
2. **Instant Notification** via webhook (if configured)
3. **Video Synced** to database (inactive by default)
4. **Admin Notified** via email
5. **Admin Adds** PDF and quiz
6. **Product Activated** for sale

## Quota Management

### Daily Limits
- **Free Tier**: 10,000 units/day
- **Our Usage**: ~10 units/day (0.1%)
- **Remaining**: 9,990 units for other operations

### Monitoring
- Check quota: `npm run youtube:sync` (without args)
- View in admin: `/admin/youtube-sync`
- Automatic warnings when < 100 units remain

## Troubleshooting

### Webhook Not Working
1. Verify app is deployed and accessible
2. Check webhook URL in browser: `/api/webhooks/youtube`
3. Re-subscribe: `npm run youtube:webhook:setup`

### Videos Not Syncing
1. Check API key is valid
2. Verify channel ID is correct
3. Check quota: might be exceeded
4. View logs in admin dashboard

### Quota Exceeded
1. Wait for daily reset (Pacific Time midnight)
2. Use webhooks instead of polling
3. Reduce cron frequency in vercel.json

## Best Practices

1. **Use Webhooks** for instant, quota-free updates
2. **Set Videos Inactive** initially (admin reviews first)
3. **Monitor Quota** via admin dashboard
4. **Test Locally** with manual sync before deploying

## Migration from Old System

1. Deploy new code
2. Update vercel.json cron schedule
3. Setup webhook: `npm run youtube:webhook:setup`
4. Monitor for 24 hours
5. Remove old sync endpoint