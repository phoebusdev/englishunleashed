# Troubleshooting Guide

## Database Issues

### Problem: "No products available" / "No videos available" on Vercel

#### Symptoms
- Shop page shows "No products available" despite having products in database
- Videos page shows "No videos available yet"
- Pages work locally but not on Vercel
- No error messages visible to users

#### Root Cause
**Database provider mismatch** - The #1 cause of this issue:
- Prisma schema.prisma has `provider = "sqlite"` (for local dev)
- But Vercel uses PostgreSQL database
- Prisma client generated for wrong database type

#### Solution
```bash
# 1. Check current provider
grep "provider" prisma/schema.prisma

# 2. If it shows "sqlite", fix immediately:
# Edit prisma/schema.prisma
datasource db {
  provider = "postgresql"  # MUST be postgresql for Vercel
  url      = env("DATABASE_URL")
}

# 3. Regenerate Prisma client
npx prisma generate

# 4. Commit and push
git add prisma/schema.prisma
git commit -m "Fix: Use PostgreSQL provider for production"
git push
```

#### Prevention
- **NEVER** change provider from PostgreSQL in schema.prisma
- Use separate local database setup instead of changing provider
- Always test with `NODE_ENV=production pnpm build` before deploying

---

### Problem: Database connection timeouts

#### Symptoms
- Slow page loads
- Intermittent 500 errors
- `/api/health` shows high query times or timeouts

#### Causes & Solutions

1. **Connection pool exhaustion**
   - Check if Prisma client is singleton (see `/lib/db.ts`)
   - Ensure not creating multiple Prisma instances

2. **Database location**
   - Ensure database is in same region as Vercel deployment
   - Check Vercel Functions region setting

3. **Connection string issues**
   ```
   # Correct format with connection pooling:
   postgresql://user:pass@host:5432/db?sslmode=require&connection_limit=1
   ```

---

### Problem: "Invalid `prisma.product.findMany()` invocation"

#### Symptoms
- TypeScript errors mentioning Prisma methods
- Runtime errors about invalid invocations
- Build succeeds but runtime fails

#### Cause
- Prisma client not regenerated after schema changes
- Client generated for wrong database provider

#### Solution
```bash
# Regenerate Prisma client
npx prisma generate

# Clear Next.js cache
rm -rf .next

# Rebuild
pnpm build
```

---

## Authentication Issues

### Problem: Can't log in after deployment

#### Symptoms
- Login fails with "Invalid credentials"
- Session not persisting
- Redirects not working

#### Checks
1. **Environment variables**
   ```
   NEXTAUTH_URL=https://your-domain.vercel.app  # Must match actual URL
   NEXTAUTH_SECRET=<random-32-chars>  # Must be set in Vercel
   ```

2. **Database has users**
   - Check if admin user exists
   - Run seed script if needed

3. **Password hashing**
   - Ensure bcrypt rounds match between environments

---

## Stripe Payment Issues

### Problem: Checkout fails or doesn't redirect

#### Symptoms
- "Payment processing failed"
- Stripe checkout doesn't load
- Webhook events not received

#### Checks

1. **API Keys**
   ```
   STRIPE_SECRET_KEY=sk_...  # Correct environment (test/live)
   STRIPE_PUBLISHABLE_KEY=pk_...  # Matches secret key environment
   ```

2. **Webhook configuration**
   - Endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`
   - Get webhook secret from Stripe dashboard

3. **Product configuration**
   - Products have Stripe Payment Link IDs
   - Payment Links are active in Stripe

---

## Build & Deployment Issues

### Problem: Build fails on Vercel but works locally

#### Common Causes

1. **Environment variables missing**
   - Check all required vars are in Vercel dashboard
   - No spaces or quotes in Vercel env values

2. **Database not accessible**
   - Database allows connections from Vercel IPs
   - SSL mode configured correctly

3. **Module resolution**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

---

## Performance Issues

### Problem: Slow page loads in production

#### Quick Checks

1. **Check database queries**
   ```typescript
   // Add logging to identify slow queries
   const startTime = Date.now()
   const result = await prisma.product.findMany()
   console.log(`Query took ${Date.now() - startTime}ms`)
   ```

2. **Enable Vercel Analytics**
   - Add to Vercel dashboard
   - Check Core Web Vitals

3. **Optimize database queries**
   ```typescript
   // Include relations in single query
   const products = await prisma.product.findMany({
     include: { packs: true }  // Avoid N+1 queries
   })
   ```

---

## Quick Diagnostic Commands

### Check deployment health
```bash
# Check database and basic health
curl https://your-domain.vercel.app/api/health

# Check if products load
curl https://your-domain.vercel.app/api/debug/db
```

### Test build locally with production settings
```bash
# Use production environment
NODE_ENV=production pnpm build

# Test with production database (carefully!)
DATABASE_URL="your-prod-connection-string" pnpm build
```

### Reset everything locally
```bash
# Nuclear option - full reset
rm -rf node_modules .next pnpm-lock.yaml
pnpm install
npx prisma generate
pnpm build
```

---

## Emergency Procedures

### Site is down - immediate actions

1. **Rollback in Vercel** (fastest)
   - Vercel Dashboard → Deployments → Instant Rollback

2. **Check critical services**
   - Database accessible?
   - Stripe API working?
   - DNS resolving correctly?

3. **Emergency code fix**
   ```bash
   # Revert to last known working state
   git log --oneline -5  # Find working commit
   git revert HEAD
   git push  # Triggers new deployment
   ```

### Data corruption or loss

1. **Stop writes immediately**
   - Set site to maintenance mode
   - Disable purchase endpoints

2. **Assess damage**
   ```sql
   -- Check recent orders
   SELECT * FROM "Order" ORDER BY "createdAt" DESC LIMIT 10;
   ```

3. **Restore from backup**
   - Contact database provider for backup restoration
   - Verify data integrity after restore

---

## Monitoring & Alerts

### Set up monitoring for

1. **Uptime monitoring**
   - Monitor `/api/health` endpoint
   - Alert if status != "healthy"

2. **Error tracking**
   - Vercel Analytics for errors
   - Check Function logs regularly

3. **Database metrics**
   - Connection count
   - Query performance
   - Storage usage

---

## Common Error Messages Decoded

| Error | Meaning | Fix |
|-------|---------|-----|
| "No products available" | Database query returned empty | Check provider in schema.prisma |
| "P1001: Can't reach database" | Connection failed | Verify DATABASE_URL and network |
| "P2002: Unique constraint" | Duplicate data | Check for existing records |
| "Invalid session" | Auth token expired | User needs to log in again |
| "Stripe is not defined" | Client-side Stripe not loaded | Check publishable key |

---

## Getting Help

1. **Check documentation**
   - `/docs/DATABASE-CONFIGURATION.md`
   - `/docs/DEPLOYMENT-CHECKLIST.md`
   - `/CLAUDE.md` for AI assistance

2. **Debug endpoints**
   - `/api/health` - System health
   - `/api/debug/db` - Database info (dev only)
   - `/api/debug/stripe` - Stripe config (dev only)

3. **Logs and monitoring**
   - Vercel Function logs
   - Stripe webhook logs
   - Database query logs

Remember: Most issues are caused by database provider mismatch. Always check schema.prisma first!