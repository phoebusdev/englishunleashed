# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL DATABASE WARNING ⚠️

**NEVER CHANGE THE DATABASE PROVIDER IN schema.prisma FROM PostgreSQL**

```prisma
// This MUST always be PostgreSQL for Vercel deployment
datasource db {
  provider = "postgresql"  // ✅ CORRECT - DO NOT CHANGE
  url      = env("DATABASE_URL")
}
```

**Changing to SQLite will break production deployment!** See docs/DATABASE-CONFIGURATION.md for details.

## Project Overview

English Unleashed - Next.js e-commerce platform for educational content with YouTube integration, Stripe payment processing, and a comprehensive quiz system. Built on Next.js Enterprise Boilerplate foundation.

## Core Development Commands

### Initial Setup
```bash
pnpm install                      # Install dependencies
pnpm db:push                      # Push schema to database
pnpm seed:admin                   # Create admin user (admin@example.com / password123)
pnpm dev                          # Start dev server at http://localhost:3000
```

### Code Quality (pre-commit workflow)
```bash
pnpm typecheck                    # TypeScript checks (0 errors required)
pnpm lint                         # ESLint checks
pnpm lint:fix                     # Auto-fix ESLint issues
pnpm prettier:fix                 # Format all code
pnpm build                        # Production build test (validates everything)
```

### Testing
```bash
pnpm test                         # Jest unit tests (watch mode: pnpm test -- --watch)
pnpm e2e:headless                 # Playwright E2E tests
pnpm e2e:ui                       # Playwright UI mode (interactive debugging)
pnpm test-storybook               # Storybook interaction tests
```

### Database Management
```bash
pnpm db:studio                    # Open Prisma Studio UI at http://localhost:5555
pnpm db:push                      # Push schema changes (dev only, no migration)
pnpm db:migrate                   # Apply migrations (production)
pnpm prisma generate              # Regenerate Prisma client (after schema changes)
```

### YouTube Integration
```bash
pnpm youtube:sync                 # Manual sync (uses YouTube API)
pnpm youtube:rss-sync             # RSS feed sync (no API quota)
pnpm youtube:import-history       # Import all historical videos
pnpm sync:videos                  # Initial video import from channel
```

### Development Tools
```bash
pnpm storybook                    # Component development at http://localhost:6006
pnpm analyze                      # Bundle size analysis
pnpm coupling-graph               # Generate dependency graph (outputs graph.svg)
```

## Architecture & Key Patterns

### Tech Stack
- **Next.js 15.3.1** with App Router (React 19.1.0)
- **TypeScript 5.8.3** with strict mode
- **Tailwind CSS v4** with PostCSS
- **Prisma ORM** with SQLite (dev) / PostgreSQL (prod)
- **NextAuth** for authentication (JWT strategy)
- **Stripe** for payments (Payment Links + webhooks)
- **Radix UI** components with CVA for variants
- **Zod** + T3 Env for validation

### Critical File Structure
```
/app                              # Next.js App Router
  /(public)                      # Public pages (no auth)
    /shop, /videos, /checkout    
  /account                       # User dashboard (auth required)
    /quizzes, /orders            
  /admin                         # Admin panel (admin auth)
    /quiz-builder, /packs        
  /api                           # API routes
    /admin/*                     # Admin endpoints (protected)
    /auth/[...nextauth]         # Auth handlers
    /webhooks/stripe             # Payment webhooks
    /cron/*                      # Scheduled jobs

/lib                             # Core utilities (AI-optimized)
  /errors                        # Centralized error handling
  /validation                    # Zod schemas for all models
  /dev-utils                     # Development helpers
  /api/response.ts               # Standardized API responses
  auth.ts                        # NextAuth configuration
  db.ts                          # Prisma client singleton
  stripe.ts                      # Stripe initialization
  youtube.ts                     # YouTube API client

/components                      # Reusable UI components
  /ui                           # Base components (Button, Card, etc.)
  /quiz                         # Quiz-specific components
  /shop                         # E-commerce components

/prisma
  schema.prisma                  # Database schema
```

### AI-Friendly Refactoring Features

#### Error Handling System (`/lib/errors`)
```typescript
import { ValidationError, assert, ensureExists, handleApiError } from '@/lib/errors'

// Use specific error classes
throw new ValidationError('Invalid input', { field: 'email' })

// Assert conditions
assert(user.isAdmin, 'Admin access required')

// Ensure non-null values
const validUser = ensureExists(user, 'User')

// Handle API errors consistently
try {
  // operation
} catch (error) {
  return handleApiError(error)
}
```

#### Validation Schemas (`/lib/validation`)
```typescript
import { validate, UserCreateSchema, OrderCreateSchema } from '@/lib/validation'

// Validate and type data
const userData = validate(UserCreateSchema, requestBody)
```

#### Development Utilities (`/lib/dev-utils`)
```typescript
import { devLog, startTimer, checkEnvVars } from '@/lib/dev-utils'

// Enhanced logging
devLog.info('Processing order', { orderId })

// Performance monitoring
const timer = startTimer('Database query')
// ... operation
timer.end()
```

#### API Response Standards (`/lib/api/response`)
```typescript
import { createSuccessResponse, createErrorResponse } from '@/lib/api/response'

// Consistent API responses
return createSuccessResponse(data, 'Operation successful')
return createErrorResponse('Not found', 404)
```

### Database Models & Relations

Core models defined in `prisma/schema.prisma`:

- **User**: Authentication, roles (`isAdmin`), sessions, password resets
  - Relations: `orders[]`, `quizAttempts[]`, `sessions[]`

- **Product**: Top-level products with Stripe integration
  - Fields: `stripePaymentLinkId`, `stripePaymentLinkUrl`, `price` (in cents)
  - Relations: `packs[]`, `orders[]`

- **Pack**: Content bundles (YouTube video + PDF + quiz)
  - Fields: `videoId`, `videoUrl`, `pdfUrl`, `hasPdf`, `hasQuiz`
  - Relations: `product`, `quiz?`

- **Order**: Purchase tracking with status management
  - Status: `PENDING` → `COMPLETED` / `FAILED` / `REFUNDED`
  - Fields: `stripeId`, `downloadExpiry`, notification flags
  - Relations: `user`, `product`, `promoCode?`

- **Quiz/Question**: Multiple choice quiz system
  - Question.options stored as JSON string array
  - QuizAttempt tracks user scores and answers

- **EmailQueue**: Async email processing with retry logic
  - Status: `PENDING` → `PROCESSING` → `SENT` / `FAILED`

- **Analytics**: PageView, AnalyticsSession, DownloadLog for tracking

### Authentication & Authorization

Authentication flow in `lib/auth.ts` and `middleware.ts`:

1. **NextAuth Configuration**: JWT strategy with bcrypt password hashing
   - Provider: Credentials (email/password)
   - Session: JWT-based (stateless)
   - Callbacks: Add `isAdmin` flag to token/session

2. **Protected Routes** (`middleware.ts`):
   - `/admin/*` - Requires auth + `isAdmin` flag
   - `/account/*` - Requires auth
   - `/quiz/*` - Requires auth
   - Redirects to `/login?callbackUrl=...` when unauthenticated

3. **Admin Access**: Check `session.user.isAdmin` in API routes
   - Use `lib/admin/auth.ts` helpers: `requireAdmin()`, `isAdminUser()`

4. **Guest Checkout**: JWT tokens for 24-hour download access without account
   - Token signing/verification in `lib/jwt.ts`
   - Used for order downloads when user not logged in

### Payment Flow

Stripe integration via Payment Links (configured in Product model):

1. **Checkout**: User clicks pack → redirects to `product.stripePaymentLinkUrl`
2. **Webhook**: Stripe sends `checkout.session.completed` to `/api/webhooks/stripe`
   - Verify signature with `STRIPE_WEBHOOK_SECRET`
   - Extract metadata: `packId`, `userId`, `guestEmail`
3. **Order Creation**: Create Order with `COMPLETED` status
4. **Email Queue**: Queue purchase confirmation email
5. **Download Access**: Generate JWT token with 24-hour expiry for downloads
   - Download route: `/api/download/[orderId]` validates token or session

**Webhook Security**: Raw body required for signature verification - handled in webhook route.

### Environment Variables

```bash
# Required for development
DATABASE_URL="file:./dev.db"              # SQLite for local
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-with-openssl>" # openssl rand -base64 32

# Optional services (see .env.example)
STRIPE_SECRET_KEY                         # Payment processing
STRIPE_WEBHOOK_SECRET                     # Webhook verification
YOUTUBE_API_KEY                           # Video sync
RESEND_API_KEY                            # Email service
BLOB_READ_WRITE_TOKEN                     # File storage
CRON_SECRET                               # Scheduled jobs
```

### Component Patterns

#### CVA for Variants
```typescript
import { cva } from "class-variance-authority"

const buttonVariants = cva("base-classes", {
  variants: {
    variant: { primary: "...", secondary: "..." },
    size: { sm: "...", md: "...", lg: "..." }
  },
  defaultVariants: { variant: "primary", size: "md" }
})
```

#### Server vs Client Components
- Default to Server Components
- Use `"use client"` only when needed (interactivity, hooks, browser APIs)
- Data fetching in Server Components with Prisma

#### API Route Pattern
```typescript
// app/api/[route]/route.ts
import { createSuccessResponse } from '@/lib/api/response'
import { validate } from '@/lib/validation'
import { handleApiError } from '@/lib/errors'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = validate(Schema, body)
    // ... operation
    return createSuccessResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
```

### Testing Strategy

- **Unit Tests**: Jest for utilities and helpers (run with `pnpm test`)
- **Component Tests**: React Testing Library (co-located with components)
- **E2E Tests**: Playwright for critical user flows (`e2e/` directory)
- **Visual Tests**: Storybook for component development (`stories/` directory)
- **API Tests**: Use `fetch-mock` for mocking external services

### Performance Optimizations

- **Images**: Next.js Image component with automatic optimization
- **Rendering**: Static generation for public pages, ISR for videos/shop
- **Database**: Prisma query optimization, connection pooling with Accelerate
- **Caching**: SWR for client-side data fetching, Redis for rate limiting
- **Bundle**: Automatic code splitting, dynamic imports for heavy components
- **Monitoring**: Vercel Analytics and Speed Insights integrated

### Security Measures

- **CSRF Protection**: Token validation on mutations (see `/api/csrf`)
- **Rate Limiting**: Upstash Redis rate limiting on auth endpoints (`lib/rate-limit.ts`)
- **Input Validation**: All inputs validated with Zod schemas (`lib/validation`)
- **SQL Injection**: Prevented via Prisma ORM (parameterized queries)
- **Password Security**: bcrypt hashing with salt rounds (`lib/password.ts`)
- **Download URLs**: JWT-signed with expiry to prevent unauthorized access
- **Environment Variables**: Validated with T3 Env (see `env.ts`)
- **Webhook Verification**: Stripe signature validation on all webhook events

## Critical Development Patterns

### Adding New API Routes

Follow this pattern for consistency:

```typescript
// app/api/your-route/route.ts
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { createApiResponse } from '@/lib/api/response'
import { validate, YourSchema } from '@/lib/validation'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check (if required)
    const session = await getServerSession(authOptions)
    if (!session) {
      return createApiResponse.unauthorized()
    }

    // 2. Parse and validate input
    const body = await request.json()
    const data = validate(YourSchema, body)

    // 3. Business logic
    const result = await db.yourModel.create({ data })

    // 4. Return standardized response
    return createApiResponse.success(result, 'Success message')
  } catch (error) {
    return handleApiError(error)
  }
}
```

### Modifying Database Schema

**CRITICAL**: Always use PostgreSQL provider for production compatibility.

```bash
# 1. Edit prisma/schema.prisma
# 2. Push changes to local DB
pnpm db:push

# 3. Regenerate Prisma client
pnpm prisma generate

# 4. For production, create migration
pnpm prisma migrate dev --name your_migration_name

# 5. Test locally before deploying
pnpm build
```

### YouTube Video Integration

Videos are synced from YouTube channel configured in environment variables:

- **RSS Sync** (`lib/youtube-rss.ts`): No API quota, updates every hour via cron
- **API Sync** (`lib/youtube.ts`): Uses quota, more reliable metadata
- **Webhook** (`app/api/webhooks/youtube`): Real-time updates (requires setup)

Video metadata stored in static file: `lib/youtube-videos-static.ts` (fallback when API unavailable)

### Error Handling Best Practices

```typescript
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
  ensureExists,
  assert
} from '@/lib/errors'

// Use specific error types
throw new ValidationError('Invalid email', { field: 'email' })

// Use ensureExists for null checks
const user = ensureExists(
  await db.user.findUnique({ where: { id } }),
  'User'
)

// Use assert for business logic
assert(order.userId === session.user.id, 'Not authorized', AuthorizationError)
```

## Deployment

### Vercel Deployment Requirements

1. **Database**: Must be PostgreSQL (Vercel Postgres, Neon, Supabase)
2. **Environment Variables**: Set all variables from `.env.example`
3. **Build Command**: `pnpm build:vercel` (runs migrations + build)
4. **Webhooks**: Configure Stripe webhook URL in dashboard
5. **Cron Jobs**: Configure in `vercel.json` for email queue, YouTube sync

See `docs/VERCEL_DEPLOYMENT.md` for detailed steps.

### Build Process

```bash
# Local production build test
pnpm build

# Vercel build (includes migrations)
pnpm build:vercel

# This runs:
# 1. bash scripts/build-production.sh
# 2. Prisma generate
# 3. Database migrations (if needed)
# 4. Next.js build
```

## Troubleshooting

### Common Issues

1. **Build fails with database errors**
   - Check `DATABASE_URL` is PostgreSQL, not SQLite
   - Ensure database is accessible from build environment
   - See `docs/DATABASE-CONFIGURATION.md`

2. **Stripe webhook not receiving events**
   - Verify `STRIPE_WEBHOOK_SECRET` matches dashboard
   - Check webhook URL is publicly accessible
   - Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

3. **YouTube sync not working**
   - Check `YOUTUBE_API_KEY` is valid
   - Verify `YOUTUBE_CHANNEL_ID` is correct
   - Monitor quota usage in Google Cloud Console
   - See `docs/YOUTUBE-SYNC-SETUP.md`

4. **NextAuth session issues**
   - Ensure `NEXTAUTH_SECRET` is set (32+ characters)
   - Check `NEXTAUTH_URL` matches deployment URL
   - Clear cookies and test in incognito mode

For more issues, see `docs/TROUBLESHOOTING.md`