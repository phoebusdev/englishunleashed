# Deploy to Production

Complete deployment guide for English Unleashed production deployment on Vercel.

## 1. Pre-Deployment Checklist

### Code Quality Verification
```bash
# Run all quality checks locally first
pnpm typecheck          # TypeScript compilation
pnpm lint              # ESLint checks
pnpm lint:fix          # Auto-fix linting issues
pnpm prettier:fix      # Format code
pnpm test              # Unit tests
pnpm build             # Production build test

# Check bundle size
pnpm analyze
# Ensure total bundle < 500KB, individual routes < 100KB
```

### Database Preparation
```bash
# Generate Prisma client for production
pnpm prisma generate

# Check database migrations
pnpm prisma migrate status

# Apply pending migrations (if any)
pnpm prisma migrate deploy

# Verify schema is up to date
pnpm prisma db pull
```

### Environment Variables Audit
```bash
# Verify all required production environment variables
# Check these are set in Vercel dashboard:

# Core Requirements
✓ DATABASE_URL                    # PostgreSQL connection string
✓ NEXTAUTH_URL                   # Production domain URL
✓ NEXTAUTH_SECRET                # 32+ character secret
✓ NODE_ENV=production            # Environment flag

# Payment Processing
✓ STRIPE_SECRET_KEY              # Live Stripe secret key (sk_live_...)
✓ STRIPE_WEBHOOK_SECRET          # Production webhook secret (whsec_...)
✓ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  # Live publishable key (pk_live_...)

# File Storage
✓ BLOB_READ_WRITE_TOKEN          # Vercel Blob storage token

# Email Service
✓ RESEND_API_KEY                 # Resend API key for emails

# YouTube Integration
✓ YOUTUBE_API_KEY                # YouTube Data API key
✓ YOUTUBE_CHANNEL_ID             # Channel ID for video sync

# Security
✓ CRON_SECRET                    # Secret for cron job authentication
```

## 2. Database Migration Strategy

### Safe Migration Process
```bash
# 1. Backup production database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Test migrations on staging/local copy
# Copy production data to staging
psql $STAGING_DATABASE_URL < backup_20240101_120000.sql

# 3. Test migration on staging
pnpm prisma migrate deploy

# 4. Verify staging works correctly
# Run smoke tests on staging environment

# 5. Apply to production during low-traffic window
pnpm prisma migrate deploy
```

### Database Migration Rollback Plan
```sql
-- Prepare rollback SQL before deploying
-- Example rollback for column addition:
ALTER TABLE "Quiz" DROP COLUMN IF EXISTS "timeLimit";
ALTER TABLE "Pack" DROP COLUMN IF EXISTS "difficulty";

-- Save as: rollback_migration_20240101.sql
-- Test rollback on staging first
```

## 3. Deployment Process

### Method 1: Git-based Deployment (Recommended)
```bash
# 1. Ensure you're on the correct branch
git checkout main  # or your production branch

# 2. Merge feature branch
git merge feature/quiz-system-final

# 3. Push to main (triggers auto-deployment)
git push origin main

# 4. Monitor deployment in Vercel dashboard
# https://vercel.com/your-team/englishunleashed/deployments
```

### Method 2: CLI Deployment
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Alias to custom domain (if needed)
vercel alias https://englishunleashed-xyz.vercel.app englishunleashed.com
```

## 4. Post-Deployment Verification

### Automated Health Checks
```bash
# Health check script
#!/bin/bash

DOMAIN="https://englishunleashed.com"

echo "🏥 Running post-deployment health checks..."

# 1. Basic connectivity
echo "✓ Checking basic connectivity..."
curl -f $DOMAIN || exit 1

# 2. API endpoints
echo "✓ Checking API health..."
curl -f $DOMAIN/api/health || exit 1

# 3. Authentication
echo "✓ Checking auth endpoints..."
curl -f $DOMAIN/api/auth/session || exit 1

# 4. Database connectivity
echo "✓ Checking database..."
curl -f $DOMAIN/api/admin/health || exit 1

# 5. Stripe webhook
echo "✓ Checking Stripe webhook endpoint..."
curl -I $DOMAIN/api/webhooks/stripe | grep "405 Method Not Allowed" || exit 1

echo "🎉 All health checks passed!"
```

### Manual Verification Checklist
```bash
# Critical User Flows
□ Homepage loads with video grid
□ Pack details page displays correctly
□ Purchase flow redirects to Stripe
□ Admin panel login works
□ Quiz taking interface functional
□ PDF downloads work with valid tokens

# Performance Checks
□ Lighthouse score > 80
□ Core Web Vitals within thresholds
□ Images loading optimally
□ No console errors in browser

# Security Verification
□ HTTPS redirects working
□ Security headers present
□ No sensitive data exposed in client
□ API rate limiting functional
```

## 5. Monitoring & Alerting Setup

### Vercel Analytics Configuration
```typescript
// File: app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### Error Monitoring
```typescript
// File: app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Log error to monitoring service
  console.error('Application error:', {
    message: error.message,
    digest: error.digest,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href
  })

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### Custom Monitoring Endpoints
```typescript
// File: app/api/health/route.ts
export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    database: false,
    stripe: false,
    youtube: false,
    email: false
  }

  try {
    // Database check
    await db.$queryRaw`SELECT 1`
    checks.database = true

    // Stripe check
    await stripe.accounts.retrieve()
    checks.stripe = true

    // YouTube check (if API key provided)
    if (process.env.YOUTUBE_API_KEY) {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=id&id=${process.env.YOUTUBE_CHANNEL_ID}&key=${process.env.YOUTUBE_API_KEY}`
      )
      checks.youtube = response.ok
    }

    // Email service check (if API key provided)
    if (process.env.RESEND_API_KEY) {
      // Simple API validation
      checks.email = true
    }

  } catch (error) {
    console.error('Health check failed:', error)
  }

  const allHealthy = Object.values(checks).every(check => check === true)
  const status = allHealthy ? 200 : 503

  return Response.json(checks, { status })
}
```

## 6. Performance Optimization

### Enable Production Optimizations
```typescript
// File: next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  swcMinify: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    domains: ['img.youtube.com', 'blob.vercel-storage.com'],
    formats: ['image/webp', 'image/avif']
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },

  // Bundle analyzer in production
  ...(process.env.ANALYZE === 'true' && {
    bundleAnalyzer: {
      enabled: true,
      openAnalyzer: false
    }
  })
}

export default nextConfig
```

### Database Connection Pooling
```typescript
// File: lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.NODE_ENV === 'production'
        ? process.env.PRISMA_ACCELERATE_URL
        : process.env.DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

## 7. Rollback Procedures

### Instant Rollback via Vercel
```bash
# List recent deployments
vercel ls englishunleashed

# Rollback to previous deployment
vercel rollback https://englishunleashed-abc123.vercel.app
```

### Emergency Database Rollback
```bash
# 1. Identify rollback point
pg_restore --list backup_20240101_120000.sql

# 2. Create emergency backup
pg_dump $DATABASE_URL > emergency_backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Restore to rollback point
pg_restore --clean --if-exists -d $DATABASE_URL backup_20240101_120000.sql

# 4. Verify rollback successful
psql $DATABASE_URL -c "SELECT version();"
```

### Feature Flag Rollback
```typescript
// Use feature flags for risky features
// File: lib/feature-flags.ts
export const FEATURE_FLAGS = {
  NEW_QUIZ_SYSTEM: process.env.FEATURE_NEW_QUIZ_SYSTEM === 'true',
  SUBSCRIPTION_MODEL: process.env.FEATURE_SUBSCRIPTIONS === 'true',
  LIVE_CHAT: process.env.FEATURE_LIVE_CHAT === 'true'
}

// In components
import { FEATURE_FLAGS } from '@/lib/feature-flags'

export function QuizInterface() {
  if (FEATURE_FLAGS.NEW_QUIZ_SYSTEM) {
    return <NewQuizInterface />
  }
  return <LegacyQuizInterface />
}
```

## 8. Domain & SSL Configuration

### Custom Domain Setup
```bash
# 1. Add domain in Vercel dashboard
# Project Settings > Domains > Add Domain

# 2. Configure DNS records
# Add CNAME record: englishunleashed.com -> cname.vercel-dns.com

# 3. Wait for SSL certificate generation
# Vercel automatically provisions SSL certificates

# 4. Verify HTTPS redirect
curl -I http://englishunleashed.com
# Should return 301 redirect to https://
```

### Security Configuration
```typescript
// File: middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production' &&
      request.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${request.nextUrl.pathname}`,
      301
    )
  }

  // Security headers
  const response = NextResponse.next()

  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)'
}
```

## 9. Backup & Recovery

### Automated Backup Strategy
```bash
# Setup automated database backups
# File: app/api/cron/backup-database/route.ts
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // Create database backup
    const backupUrl = await createDatabaseBackup()

    // Store backup in secure location
    await uploadBackupToStorage(backupUrl)

    // Clean up old backups (keep last 30 days)
    await cleanupOldBackups()

    return new Response('Backup completed')
  } catch (error) {
    console.error('Backup failed:', error)
    await sendAdminAlert('Database backup failed')
    return new Response('Backup failed', { status: 500 })
  }
}
```

### Recovery Testing
```bash
# Monthly recovery test
# 1. Create test database
createdb test_recovery_db

# 2. Restore from backup
pg_restore -d test_recovery_db latest_backup.sql

# 3. Verify data integrity
psql test_recovery_db -c "SELECT COUNT(*) FROM users;"
psql test_recovery_db -c "SELECT COUNT(*) FROM orders;"

# 4. Test application against recovered database
DATABASE_URL=postgresql://localhost/test_recovery_db pnpm test

# 5. Clean up
dropdb test_recovery_db
```

This comprehensive deployment guide ensures safe, reliable production deployments for English Unleashed.