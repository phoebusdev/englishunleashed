# Vercel Deployment Guide

## Pre-Deployment Checklist

### 1. Database Setup
- [ ] Create PostgreSQL database (Vercel Postgres, Supabase, or Neon)
- [ ] Get database connection string
- [ ] Add `DATABASE_URL` to Vercel environment variables
- [ ] If using Prisma Accelerate, add `PRISMA_ACCELERATE_URL` and `DIRECT_DATABASE_URL`

### 2. Environment Variables
Add these to your Vercel project settings (Settings > Environment Variables):

#### Required Variables
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_URL` - Your production URL (https://yourdomain.com)
- [ ] `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- [ ] `YOUTUBE_API_KEY` - From Google Cloud Console
- [ ] `YOUTUBE_CHANNEL_ID` - Your YouTube channel ID
- [ ] `YOUTUBE_CHANNEL_HANDLE` - Your YouTube handle
- [ ] `STRIPE_SECRET_KEY` - From Stripe Dashboard (use live keys)
- [ ] `STRIPE_WEBHOOK_SECRET` - Configure after deployment
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - From Stripe Dashboard
- [ ] `BLOB_READ_WRITE_TOKEN` - From Vercel Blob Storage
- [ ] `RESEND_API_KEY` - From Resend Dashboard
- [ ] `CRON_SECRET` - Random string for security

#### Optional Variables
- [ ] `YOUTUBE_WEBHOOK_SECRET` - For YouTube webhooks
- [ ] `ADMIN_EMAIL` - For notifications
- [ ] `NEXT_PUBLIC_SITE_URL` - If different from NEXTAUTH_URL

### 3. Stripe Setup
1. [ ] Switch to live keys in Stripe Dashboard
2. [ ] Deploy to Vercel first
3. [ ] Configure webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. [ ] Add webhook events: `checkout.session.completed`, `payment_intent.succeeded`
5. [ ] Update `STRIPE_WEBHOOK_SECRET` in Vercel

### 4. Database Migration
After deployment, run database migrations:

```bash
# Option 1: Via Vercel CLI
vercel env pull .env.production.local
npx prisma migrate deploy

# Option 2: Direct connection
DATABASE_URL="your-production-url" npx prisma db push
```

### 5. Initial Admin Setup
Create admin user after deployment:

```bash
# Create admin user
npx tsx scripts/seed-admin.ts
# Default credentials: admin@test.com / testpass123
# CHANGE PASSWORD IMMEDIATELY after first login
```

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin feature/quiz-system-final
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import Git Repository
3. Select your repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `prisma generate && next build`
   - Install Command: `pnpm install`

### 3. Environment Variables
Add all required variables in Vercel dashboard before deploying

### 4. Deploy
Click "Deploy" and wait for build to complete

### 5. Post-Deployment

#### Configure Stripe Webhook
1. Get your deployment URL
2. Go to Stripe Dashboard > Webhooks
3. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Select events: `checkout.session.completed`, `payment_intent.succeeded`
5. Copy webhook secret and update in Vercel

#### Setup YouTube Webhook (Optional)
```bash
# After deployment, subscribe to YouTube notifications
npm run youtube:webhook:setup
```

#### Verify Cron Jobs
Check that cron jobs are running:
- YouTube sync: Every 6 hours
- Email queue: Every 5 minutes

View in Vercel Dashboard > Functions > Cron

## Environment-Specific Settings

### Production Build Settings
```json
{
  "buildCommand": "prisma generate && next build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

### Vercel.json Configuration
Already configured with:
- Cron jobs for YouTube sync and email queue
- Proper scheduling

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL database is accessible
- Check SSL mode in connection string
- Verify Prisma schema matches database

### Authentication Issues
- Verify `NEXTAUTH_URL` matches your domain
- Ensure `NEXTAUTH_SECRET` is set
- Check callback URLs in OAuth providers

### Payment Issues
- Verify Stripe keys are for correct environment
- Check webhook endpoint is accessible
- Ensure webhook secret matches

### File Upload Issues
- Verify Blob storage token is valid
- Check file size limits (default 4.5MB)

### YouTube Sync Issues
- Check API quota in Google Cloud Console
- Verify channel ID is correct
- Check webhook subscription status

## Performance Optimization

### Enable Caching
- Static pages are automatically cached
- API responses use proper cache headers
- Images optimized automatically

### Database Optimization
- Consider using Prisma Accelerate for connection pooling
- Add database indexes for frequently queried fields
- Monitor slow queries in production

### Edge Functions
Consider moving lightweight APIs to Edge Runtime:
```typescript
export const runtime = 'edge' // Add to API routes
```

## Monitoring

### Recommended Services
- Vercel Analytics (built-in)
- Sentry for error tracking
- LogRocket for session replay
- Uptime monitoring (Pingdom, UptimeRobot)

### Key Metrics to Monitor
- Page load times
- API response times
- Database query performance
- Error rates
- Stripe webhook success rate

## Security Checklist

- [ ] All secrets in environment variables (not in code)
- [ ] HTTPS enforced
- [ ] Rate limiting on API routes
- [ ] CSRF protection enabled
- [ ] SQL injection prevention (via Prisma)
- [ ] XSS protection headers
- [ ] Secure session configuration

## Rollback Plan

If issues arise:
1. Vercel automatically keeps previous deployments
2. Instant rollback via Vercel Dashboard
3. Database migrations can be reverted with Prisma

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Production](https://www.prisma.io/docs/guides/deployment)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)