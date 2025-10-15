# English Unleashed

A production-ready Next.js e-commerce platform for educational content with YouTube integration, Stripe payment processing, and an interactive quiz system. Built on the [Next.js Enterprise Boilerplate](https://github.com/Blazity/next-enterprise) foundation.

## 🎯 Project Overview

English Unleashed is a comprehensive learning platform that combines:
- 📦 **Educational Packs** - Bundled content (Video + PDF + Quiz)
- 💳 **Stripe Payment Links** - Secure payment processing with automated order fulfillment
- 🎥 **YouTube Integration** - Automated video sync with RSS and API support
- 📝 **Interactive Quizzes** - Multiple-choice assessments with progress tracking
- 👤 **User Accounts** - Full authentication with guest checkout support
- 📧 **Email Notifications** - Purchase confirmations and content ready alerts
- 📊 **Analytics Dashboard** - Track downloads, page views, and user engagement
- 🔐 **Admin Panel** - Complete content management system

## ✅ Verified Working Features

### Stripe/PDF Integration (100% Operational)
- ✅ **Payment Links** - Automated Stripe Payment Link generation for each pack
- ✅ **Webhook Processing** - Real-time order creation via `checkout.session.completed` events
- ✅ **Guest Checkout** - 24-hour download access without account creation
- ✅ **Registered Users** - Permanent access with 7-day JWT tokens
- ✅ **PDF Upload** - Vercel Blob storage with admin upload interface
- ✅ **Secure Downloads** - JWT-protected download URLs with expiry enforcement
- ✅ **Email Notifications** - Purchase confirmations with download links
- ✅ **Order Management** - Complete order history and status tracking

### Payment Flow Architecture
```
User Purchase → Stripe Payment Link → checkout.session.completed webhook
    ↓
Order Creation (with JWT token) → Email Queue → Purchase Confirmation
    ↓
Download Access (via /api/download/[orderId]?token=...) → Vercel Blob PDF
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (LTS)
- pnpm 9.1.0+
- PostgreSQL database (production) or SQLite (local dev)
- Stripe account (for payments)
- Vercel account (for deployment & blob storage)
- Resend account (for emails)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd englishunleashed

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials (see Configuration below)

# Initialize database
pnpm db:push

# Create admin user
pnpm seed:admin
# Default: admin@englishunleashed.com / changeme123

# Start development server
pnpm dev
# Open http://localhost:3000
```

## ⚙️ Configuration

### Required Environment Variables

```bash
# Database (PostgreSQL for production, SQLite for local)
DATABASE_URL="postgresql://user:password@host:5432/database"

# Authentication (generate with: openssl rand -base64 32)
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-32-character-secret"

# Stripe (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Vercel Blob (for PDF storage)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Resend (for email notifications)
RESEND_API_KEY="re_..."

# Optional: YouTube API (for video sync)
YOUTUBE_API_KEY="..."
YOUTUBE_CHANNEL_ID="..."
YOUTUBE_CHANNEL_HANDLE="@yourchannel"
```

### Stripe Setup

#### 1. Get API Keys
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy **Secret key** → `STRIPE_SECRET_KEY`
3. Copy **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

#### 2. Configure Webhook
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe`
4. **Events**: Select `checkout.session.completed`
5. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

#### 3. Test Locally with Stripe CLI
```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret to .env.local
# STRIPE_WEBHOOK_SECRET="whsec_..."

# Restart dev server to pick up new env var
pnpm dev
```

### Vercel Blob Setup

1. Go to your Vercel project settings
2. Navigate to **Storage** → **Create Blob Store**
3. Copy the `BLOB_READ_WRITE_TOKEN`
4. Add to Vercel environment variables (Preview & Production)

### Vercel Deployment

#### Environment Variables in Vercel
Add all variables from `.env.example` to:
- **Settings** → **Environment Variables**
- Check **Preview** and **Production** environments
- Redeploy after adding variables

#### Webhook Configuration
⚠️ **Important**: Update your Stripe webhook URL to your production domain:
```
https://yourdomain.com/api/webhooks/stripe
```

## 📋 Development Commands

### Core Commands
```bash
pnpm dev                          # Start development server
pnpm build                        # Production build
pnpm start                        # Start production server
pnpm typecheck                    # TypeScript validation
pnpm lint                         # ESLint checks
pnpm lint:fix                     # Auto-fix linting issues
pnpm prettier:fix                 # Format code
```

### Database Commands
```bash
pnpm db:push                      # Push schema changes (dev)
pnpm db:migrate                   # Apply migrations (prod)
pnpm db:studio                    # Open Prisma Studio UI
pnpm prisma generate              # Regenerate Prisma client
pnpm seed:admin                   # Create admin user
```

### Testing Commands
```bash
pnpm test                         # Jest unit tests
pnpm e2e:headless                 # Playwright E2E tests
pnpm e2e:ui                       # Playwright UI mode
pnpm test-storybook               # Storybook tests
pnpm storybook                    # Start Storybook
```

### YouTube Integration
```bash
pnpm youtube:sync                 # Manual YouTube API sync
pnpm youtube:rss-sync             # RSS feed sync (no quota)
pnpm youtube:import-history       # Import historical videos
```

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 15.3.1 with App Router
- **Language**: TypeScript 5.8.3 (strict mode)
- **Styling**: Tailwind CSS v4
- **Database**: Prisma ORM (PostgreSQL production, SQLite dev)
- **Authentication**: NextAuth.js (JWT strategy)
- **Payments**: Stripe (Payment Links + Webhooks)
- **Storage**: Vercel Blob (PDF files)
- **Email**: Resend (with queue system)
- **UI Components**: Radix UI + CVA (class-variance-authority)
- **Validation**: Zod schemas
- **Testing**: Jest, React Testing Library, Playwright
- **Deployment**: Vercel

### Project Structure
```
/app                              # Next.js App Router
  /(public)                       # Public pages (no auth)
    /shop                         # Product catalog
    /videos                       # Video gallery
    /checkout                     # Payment flow
  /account                        # User dashboard (auth required)
    /quizzes                      # Quiz history
    /orders                       # Purchase history
  /admin                          # Admin panel (admin only)
    /packs                        # Content management
    /quiz-builder                 # Quiz creation
    /users, /orders, /analytics   # Management panels
  /api                            # Backend API
    /admin/*                      # Admin endpoints
    /auth/*                       # Authentication
    /webhooks/stripe              # Payment webhooks ✅
    /download/[orderId]           # Secure downloads ✅
    /checkout                     # Payment initiation

/lib                              # Core utilities
  /errors                         # Error handling system
  /validation                     # Zod validation schemas
  /dev-utils                      # Development utilities
  /api/response.ts                # Standardized API responses
  auth.ts                         # NextAuth config
  stripe.ts                       # Stripe client ✅
  email.ts                        # Email queue system ✅

/components                       # Reusable UI components
  /ui                             # Base components (Radix UI)
  /quiz                           # Quiz components
  /shop                           # E-commerce components

/prisma
  schema.prisma                   # Database schema ✅
```

### Database Models

**Core Models:**
- `User` - Authentication, roles (isAdmin), sessions
- `Product` - Top-level products with Stripe Payment Link IDs ✅
- `Pack` - Content bundles (video + PDF + quiz) ✅
- `Order` - Purchase tracking with JWT download tokens ✅
- `Quiz` / `Question` - Interactive assessments
- `QuizAttempt` - User progress tracking
- `EmailQueue` - Async email processing with retry logic ✅
- `DownloadLog` - Analytics tracking ✅

**Key Relations:**
```
Product (1) → (N) Pack (1) → (1) Quiz → (N) Question
   ↓
Order (N) ← (1) User → (N) QuizAttempt
```

## 🔐 Security Features

- ✅ **Webhook Signature Verification** - Stripe signatures validated
- ✅ **JWT Token Security** - Signed tokens with expiry (issuer/audience claims)
- ✅ **Download Authorization** - Multi-layer verification (token + order + user)
- ✅ **Guest Expiry Enforcement** - 24-hour limit for non-registered users
- ✅ **SQL Injection Prevention** - Prisma ORM parameterized queries
- ✅ **File Type Validation** - PDF-only uploads
- ✅ **Admin Route Protection** - Middleware + session checks
- ✅ **Rate Limiting** - Upstash Redis on auth endpoints
- ✅ **CSRF Protection** - Token validation on mutations
- ✅ **Environment Variable Validation** - T3 Env runtime checks

## 📊 Testing & Monitoring

### Test Payment Cards (Stripe Test Mode)
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any valid ZIP
```

### Monitoring Webhooks
```bash
# Check webhook events in Stripe Dashboard
https://dashboard.stripe.com/test/webhooks

# View logs in Vercel
vercel logs --follow

# Check local webhook events
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Analytics Dashboard
Access at `/admin/analytics` to view:
- Page views and sessions
- Download logs
- User engagement metrics
- Order statistics

## 🐛 Troubleshooting

### Common Issues

**1. Webhook Not Receiving Events**
```bash
# Verify webhook secret matches Stripe dashboard
echo $STRIPE_WEBHOOK_SECRET

# Test webhook endpoint
curl -X POST https://yourdomain.com/api/webhooks/stripe

# Check Stripe dashboard for delivery attempts
```

**2. Download Links Not Working**
```bash
# Verify JWT secret is set
echo $NEXTAUTH_SECRET

# Check token expiry (default: 24h guests, 7d registered)
# View in browser console after download attempt
```

**3. PDF Upload Failing**
```bash
# Verify Blob token is configured
echo $BLOB_READ_WRITE_TOKEN

# Check file type (must be PDF)
# Check file size (Vercel Blob limits apply)
```

**4. Database Connection Errors**
```bash
# PostgreSQL required for production
# Verify connection string format
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Test connection
pnpm prisma db push
```

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Complete development guide for AI assistants
- **[STRIPE-SETUP.md](./STRIPE-SETUP.md)** - Detailed Stripe configuration
- **[AI_DEVELOPMENT_GUIDE.md](./AI_DEVELOPMENT_GUIDE.md)** - AI-friendly development patterns
- **[VERCEL_DEPLOYMENT.md](./docs/VERCEL_DEPLOYMENT.md)** - Deployment instructions
- **[DATABASE-CONFIGURATION.md](./docs/DATABASE-CONFIGURATION.md)** - Database setup guide

## 🎉 Success Stories

### Verified Integration Test (December 2024)
✅ **Complete Stripe/PDF Integration**
- Environment: Vercel Preview Deployment (`specdriven` branch)
- Test URL: `https://englishunleashed-git-specdriven-phoebusdevs-projects.vercel.app`
- Results:
  - Payment Link generation: **Working**
  - Webhook reception: **Working**
  - Order creation: **Working**
  - PDF downloads: **Working**
  - Email notifications: **Working**
  - Guest vs registered user flows: **Both working**

## 🤝 Contributing

This project uses:
- **Conventional Commits** for commit messages
- **Semantic Release** for automated versioning
- **ESLint** + **Prettier** for code quality
- **TypeScript strict mode** for type safety

### Pre-commit Checklist
```bash
pnpm typecheck    # Must pass with 0 errors
pnpm lint         # Must pass
pnpm build        # Must complete successfully
```

## 📄 License

MIT

## 🙏 Acknowledgments

Built on [Next.js Enterprise Boilerplate](https://github.com/Blazity/next-enterprise) by Blazity.

---

**Status**: ✅ Production Ready | **Last Updated**: December 2024 | **Stripe Integration**: Fully Operational
