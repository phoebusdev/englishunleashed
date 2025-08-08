# English Unleashed E-commerce Platform

## Quick Start (Local Development)

### 1. Switch to the feature branch
```bash
git checkout feature/ecommerce-platform
```

### 2. Copy environment variables
```bash
cp .env.example .env.local
```

### 3. Choose your database

#### Option A: PostgreSQL (Recommended)
- Install PostgreSQL locally
- Update `DATABASE_URL` in `.env.local`
- Example: `postgresql://postgres:password@localhost:5432/englishunleashed_dev`

#### Option B: SQLite (Easiest for testing)
- Update `.env.local`:
  ```
  DATABASE_URL="file:./dev.db"
  ```
- Update `prisma/schema.prisma`:
  ```prisma
  datasource db {
    provider = "sqlite"
    url      = env("DATABASE_URL")
  }
  ```

### 4. Run setup
```bash
pnpm install
pnpm db:push
pnpm seed:admin
```

### 5. Start development server
```bash
pnpm dev
```

### 6. Access the application
- **Main site**: http://localhost:3000
- **Admin login**: http://localhost:3000/login
  - Email: `admin@englishunleashed.com`
  - Password: `changeme123`

## Testing Without Stripe

To test the UI without Stripe:

1. Create packs in the admin dashboard
2. The payment link button will appear but won't work without Stripe keys
3. You can manually create test orders in Prisma Studio:
   ```bash
   pnpm db:studio
   ```

## Features to Test

### Admin Dashboard (/admin)
- ✅ Create new packs
- ✅ Edit existing packs
- ✅ Upload PDFs
- ✅ Create quizzes
- ✅ Copy payment links

### User Features
- ✅ Login/Register
- ✅ View purchases (/account)
- ✅ Download PDFs
- ✅ Take quizzes
- ✅ View quiz results

### Automatic Features
- ✅ YouTube video sync (every 15 min)
- ✅ Email notifications (console only in dev)
- ✅ Secure download links

## Adding Stripe (Optional)

1. Get test keys from https://dashboard.stripe.com/test/apikeys
2. Add to `.env.local`:
   ```
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   ```
3. Test webhook locally with Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```