# Deployment Checklist for English Unleashed

## Pre-Deployment Verification

### 🔴 CRITICAL: Database Configuration
- [ ] **Verify schema.prisma has PostgreSQL provider**
  ```bash
  grep "provider" prisma/schema.prisma
  # MUST output: provider = "postgresql"
  # NOT: provider = "sqlite"
  ```

### Environment Variables (Vercel Dashboard)
- [ ] `DATABASE_URL` - PostgreSQL connection string (starts with `postgresql://`)
- [ ] `NEXTAUTH_URL` - Your production URL (e.g., `https://englishunleashed.vercel.app`)
- [ ] `NEXTAUTH_SECRET` - Random 32+ character string
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key (starts with `sk_`)
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook endpoint secret
- [ ] `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (starts with `pk_`)
- [ ] `RESEND_API_KEY` - Email service API key (if using)
- [ ] `YOUTUBE_API_KEY` - YouTube Data API key (if using)

### Code Quality Checks
- [ ] Run TypeScript check
  ```bash
  pnpm typecheck
  ```
- [ ] Run ESLint
  ```bash
  pnpm lint
  ```
- [ ] Run production build locally
  ```bash
  NODE_ENV=production pnpm build
  ```

### Database Preparation
- [ ] Ensure database migrations are up to date
  ```bash
  npx prisma generate
  ```
- [ ] Verify database has required data:
  - [ ] At least one admin user exists
  - [ ] Products are created and active
  - [ ] Packs are linked to products

## Deployment Steps

### 1. Final Code Check
- [ ] All changes committed
  ```bash
  git status
  ```
- [ ] No sensitive data in code (API keys, passwords)
- [ ] schema.prisma uses PostgreSQL provider

### 2. Push to GitHub
```bash
git push origin main
# or
git push origin feature/your-branch
```

### 3. Vercel Deployment
- [ ] Vercel auto-deploys from GitHub push
- [ ] Monitor build logs in Vercel dashboard
- [ ] Check for any build warnings or errors

## Post-Deployment Verification

### Immediate Checks (Within 5 minutes)
- [ ] **Database Health Check**
  ```
  https://your-domain.vercel.app/api/health
  ```
  Should show:
  - `status: "healthy"`
  - `database: true`
  - Product and pack counts

- [ ] **Critical Pages Load**
  - [ ] Homepage (`/`)
  - [ ] Shop page (`/shop`) - MUST show products
  - [ ] Videos page (`/videos`) - MUST show videos or fallback
  - [ ] Login page (`/login`)

### Functional Testing
- [ ] **Shop Functionality**
  - [ ] Products display with prices
  - [ ] "Buy Now" buttons work
  - [ ] Checkout redirects to Stripe

- [ ] **Authentication**
  - [ ] Can log in with existing account
  - [ ] Can create new account
  - [ ] Protected pages redirect when not logged in

- [ ] **Payment Flow** (if Stripe is configured)
  - [ ] Can proceed to checkout
  - [ ] Stripe payment page loads
  - [ ] Webhook receives events (check Stripe dashboard)

### Error Monitoring
- [ ] Check Vercel Function logs for errors
- [ ] Look for patterns:
  - `[Shop Page] Database error:`
  - `[Videos Page] Database error:`
  - Database connection timeouts
  - 500 errors

## Troubleshooting Quick Fixes

### "No products available" on Shop page
1. Check `/api/health` - is database connected?
2. Verify schema.prisma has `provider = "postgresql"`
3. Check DATABASE_URL in Vercel environment variables
4. Redeploy after fixing

### Pages load but no data shows
```bash
# Emergency fix
git checkout main -- prisma/schema.prisma
npx prisma generate
git add -A
git commit -m "Fix: Revert database to PostgreSQL"
git push
```

### Build fails on Vercel
1. Check build logs for specific error
2. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Module not found errors
3. Fix locally first:
   ```bash
   NODE_ENV=production pnpm build
   ```

### Database connection errors
1. Verify DATABASE_URL format:
   ```
   postgresql://user:password@host:5432/database?sslmode=require
   ```
2. Check database is accessible from Vercel's IP
3. Ensure SSL is configured if required

## Rollback Procedure

If deployment causes critical issues:

1. **Instant Rollback in Vercel**
   - Go to Vercel dashboard
   - Click "Instant Rollback" to previous working deployment

2. **Code Rollback**
   ```bash
   # Find last working commit
   git log --oneline -10
   
   # Revert to working commit
   git revert HEAD
   git push
   ```

3. **Database Schema Rollback** (if schema changed)
   ```bash
   # Revert schema file
   git checkout <last-working-commit> -- prisma/schema.prisma
   npx prisma generate
   git add -A
   git commit -m "Rollback: Revert database schema"
   git push
   ```

## Success Indicators

✅ Deployment is successful when:
- `/api/health` returns `status: "healthy"`
- Shop page shows products
- Videos page loads without errors
- Can complete a test purchase
- No errors in Vercel logs for 10 minutes
- Page load times are under 3 seconds

## Monthly Maintenance

- [ ] Review and clean up old deployments in Vercel
- [ ] Check database size and optimize if needed
- [ ] Review error logs for patterns
- [ ] Update dependencies (carefully, with testing)
- [ ] Backup database before major updates

## Contact for Issues

If deployment issues persist:
1. Check docs/DATABASE-CONFIGURATION.md
2. Review Vercel function logs
3. Test locally with production settings
4. Check GitHub issues for similar problems

Remember: **Never change provider from PostgreSQL in production!**