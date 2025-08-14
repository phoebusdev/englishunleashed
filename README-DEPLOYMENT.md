# English Unleashed - Deployment Guide

## ⚠️ CRITICAL WARNING ⚠️

**The #1 cause of deployment failure: Wrong database provider in schema.prisma**

```prisma
// ✅ ALWAYS use this for production:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ❌ NEVER commit this to main branch:
datasource db {
  provider = "sqlite"  // THIS BREAKS VERCEL!
  url      = env("DATABASE_URL")
}
```

## Quick Start Deployment

### 1. Pre-flight Check
```bash
# MUST output: provider = "postgresql"
grep "provider" prisma/schema.prisma

# If it shows "sqlite", fix NOW:
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
npx prisma generate
```

### 2. Deploy to Vercel
```bash
git add -A
git commit -m "Deploy: Your changes"
git push origin main
```

### 3. Verify Deployment
```bash
# Check system health
curl https://your-app.vercel.app/api/health

# Should return:
# { "status": "healthy", "database": true, ... }
```

## Required Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

```env
# Database (PostgreSQL only!)
DATABASE_URL=postgresql://user:pass@host:5432/database?sslmode=require

# Authentication
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-random-32-chars

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional
YOUTUBE_API_KEY=...
RESEND_API_KEY=...
```

## Common Issues & Solutions

### "No products available" on production
**Cause**: Database provider is set to SQLite instead of PostgreSQL
**Fix**: See Critical Warning above

### Build fails on Vercel
**Cause**: Missing environment variables or TypeScript errors
**Fix**: Run `pnpm build` locally first

### Pages load but no data
**Cause**: Database connection failed
**Fix**: Check DATABASE_URL format and `/api/health` endpoint

## Documentation

- **[Database Configuration](./docs/DATABASE-CONFIGURATION.md)** - Detailed database setup
- **[Deployment Checklist](./docs/DEPLOYMENT-CHECKLIST.md)** - Step-by-step deployment
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and fixes
- **[CLAUDE.md](./CLAUDE.md)** - AI assistant instructions

## Quick Commands

```bash
# Local development
pnpm dev

# Type check before deploying
pnpm typecheck

# Build for production
NODE_ENV=production pnpm build

# Database commands
npx prisma generate  # Generate client
npx prisma db push   # Push schema to database
npx prisma studio    # Open database GUI
```

## Rollback Procedure

If deployment breaks production:

1. **Instant Rollback** in Vercel Dashboard
2. **Or revert commit**:
   ```bash
   git revert HEAD
   git push
   ```

## The Golden Rules

1. **Never change database provider from PostgreSQL**
2. **Always run `pnpm typecheck` before deploying**
3. **Check `/api/health` after deployment**
4. **Keep production DATABASE_URL in Vercel, never in code**

## Support

If issues persist after following this guide:
1. Check `/api/health` for detailed diagnostics
2. Review Vercel Function logs
3. Consult [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)

---

Remember: PostgreSQL for production, ALWAYS! 🚀