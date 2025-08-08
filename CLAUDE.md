# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

English Unleashed - Next.js e-commerce platform for educational content with YouTube integration, Stripe payment processing, and a comprehensive quiz system.

## Development Commands

```bash
# Install dependencies
pnpm install

# Database setup (SQLite for local dev)
pnpm db:push              # Push schema to database
pnpm db:studio            # Open Prisma Studio UI
pnpm seed:admin           # Create admin user

# Development
pnpm dev                  # Start dev server (port 3000)
pnpm build                # Production build
pnpm start                # Start production server

# Code quality
pnpm lint                 # Run ESLint
pnpm lint:fix             # Fix ESLint issues
pnpm prettier             # Check formatting
pnpm prettier:fix         # Fix formatting
pnpm test                 # Run Jest tests
pnpm e2e:headless         # Run Playwright tests

# Component development
pnpm storybook            # Start Storybook (port 6006)
pnpm build-storybook      # Build Storybook

# Analysis tools
pnpm analyze              # Bundle size analysis
pnpm coupling-graph       # Generate dependency graph
```

## Architecture

### Tech Stack
- **Next.js 15.3.1** with App Router
- **React 19.1.0** with TypeScript 5.8.3
- **Tailwind CSS v4** with PostCSS
- **Prisma ORM** with SQLite (dev) / PostgreSQL (prod)
- **NextAuth** for authentication
- **Stripe** for payments
- **Radix UI** for accessible components
- **Zod + T3 Env** for environment validation

### Directory Structure
```
/app                      # Next.js App Router
  /(public)              # Public-facing pages
  /account               # User dashboard
  /admin                 # Admin dashboard
  /api                   # API routes
    /admin               # Admin API endpoints
    /auth                # Authentication endpoints
    /cron                # Scheduled jobs
    /webhooks            # External webhooks (Stripe)
/components              # Reusable UI components
/hooks                   # Custom React hooks
/lib                     # Core utilities
  auth.ts               # NextAuth configuration
  db.ts                 # Prisma client
  email.ts              # Email service
  stripe.ts             # Stripe configuration
  youtube.ts            # YouTube API integration
/prisma
  schema.prisma         # Database schema
```

### Key Patterns

#### Component Variants (CVA)
All UI components use class-variance-authority for consistent styling:
```typescript
const buttonVariants = cva("base-classes", {
  variants: {
    variant: { primary: "...", secondary: "..." },
    size: { sm: "...", md: "...", lg: "..." }
  }
})
```

#### Database Models
- **User**: Authentication, admin roles, purchase tracking
- **Product/Pack**: Video + PDF + Quiz bundles
- **Order**: Purchase records with Stripe integration
- **Quiz/Question**: Multiple choice quiz system
- **EmailQueue**: Async email processing
- **Analytics**: PageView, Session, DownloadLog tracking

#### Authentication Flow
1. NextAuth with JWT strategy
2. Credentials provider with bcrypt password hashing
3. Admin middleware for protected routes
4. Guest checkout with 24hr download access

#### Payment Processing
1. Stripe Payment Links for products
2. Webhook handling for order completion
3. Automatic email notifications
4. Secure PDF download URLs with expiry

### Environment Variables

Required for development:
```bash
DATABASE_URL="file:./dev.db"              # SQLite for local dev
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-with-openssl>"
```

Optional services:
- `STRIPE_*` - Payment processing
- `YOUTUBE_*` - Video sync
- `RESEND_API_KEY` - Email notifications
- `BLOB_READ_WRITE_TOKEN` - File storage
- `CRON_SECRET` - Scheduled jobs

### API Routes Pattern

All API routes use standard Next.js App Router conventions:
```typescript
// app/api/[route]/route.ts
export async function GET(request: Request) { }
export async function POST(request: Request) { }
export async function PUT(request: Request, { params }) { }
export async function DELETE(request: Request, { params }) { }
```

### Admin Features

The admin dashboard (`/admin`) provides:
- Pack management (create/edit/delete)
- PDF uploads via Vercel Blob
- Quiz builder with multiple choice questions
- User management
- Order tracking
- Email queue monitoring
- Analytics dashboard

### Automated Systems

1. **YouTube Sync** (`/api/cron/sync-youtube`)
   - Runs hourly via Vercel Cron
   - Creates inactive packs from new videos
   - Admin completes by adding PDF + quiz

2. **Email Queue** (`/api/cron/email-queue`)
   - Processes pending emails every 5 minutes
   - Handles purchase confirmations
   - Notifies when content becomes available

### Testing Approach

- Unit tests with Jest for utilities
- Component testing with React Testing Library
- E2E tests with Playwright for critical flows
- Storybook for visual component development

### Security Considerations

- CSRF protection on state-changing operations
- Rate limiting on authentication endpoints
- Secure download URLs with JWT tokens
- Input validation with Zod schemas
- SQL injection prevention via Prisma ORM