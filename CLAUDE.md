# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

English Unleashed - Next.js e-commerce platform for educational content with YouTube integration, Stripe payment processing, and a comprehensive quiz system. Built on Next.js Enterprise Boilerplate foundation.

## Core Development Commands

```bash
# Essential setup (run in order for new setup)
pnpm install                      # Install dependencies
pnpm db:push                      # Push schema to SQLite database
pnpm seed:admin                   # Create admin user (required for /admin access)
pnpm dev                          # Start dev server (port 3000)

# Code quality checks (run before committing)
pnpm typecheck                    # TypeScript type checking
pnpm lint                         # ESLint checks
pnpm lint:fix                     # Auto-fix ESLint issues
pnpm prettier:fix                 # Format code
pnpm build                        # Production build (final validation)

# Testing
pnpm test                         # Jest unit tests
pnpm e2e:headless                 # Playwright E2E tests
pnpm test-storybook               # Storybook tests

# Database management
pnpm db:studio                    # Open Prisma Studio UI
pnpm prisma generate              # Regenerate Prisma client after schema changes

# YouTube sync (if configured)
pnpm youtube:sync                 # Manual sync
pnpm sync:videos                  # Initial video import

# Development tools
pnpm storybook                    # Component development (port 6006)
pnpm analyze                      # Bundle size analysis
pnpm coupling-graph               # Generate dependency graph
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

- **User**: Auth, roles, purchase history
- **Pack**: Product bundles (video + PDF + quiz)
- **Order**: Purchase records with Stripe integration
- **Quiz/Question/Answer**: Multiple choice quiz system
- **EmailQueue**: Async email processing
- **Analytics**: PageView, Session, DownloadLog tracking

### Authentication & Authorization

1. **NextAuth Configuration**: JWT strategy with credentials provider
2. **Protected Routes**: Middleware checks in `/middleware.ts`
3. **Admin Access**: Role-based with `user.isAdmin` flag
4. **Guest Checkout**: 24-hour download access via JWT tokens

### Payment Flow

1. User selects pack → redirects to Stripe Payment Link
2. Stripe webhook (`/api/webhooks/stripe`) handles completion
3. Order created with status tracking
4. Email notification queued
5. Download URLs generated with expiry

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

- **Unit Tests**: Jest for utilities and helpers
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright for critical user flows
- **Visual Tests**: Storybook for component development

### Common Tasks

#### Adding a New Pack
1. Admin panel → Packs → Create
2. Upload PDF to Vercel Blob
3. Add quiz questions
4. Set Stripe Payment Link
5. Activate pack

#### Modifying Quiz System
- Quiz components: `/components/quiz/`
- Quiz API: `/app/api/quiz/`
- Database schema: `prisma/schema.prisma` (Quiz, Question, Answer models)

#### Debugging Payments
1. Check Stripe webhook logs: `/admin/webhooks`
2. Verify environment variables
3. Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Performance Optimizations

- Image optimization with Next.js Image
- Static generation where possible
- Database query optimization with Prisma
- Client-side caching with SWR patterns
- Bundle splitting automatic with Next.js

### Security Measures

- CSRF protection on mutations
- Rate limiting on auth endpoints
- Input validation with Zod
- SQL injection prevention via Prisma
- Secure download URLs with JWT
- Environment variable validation with T3 Env