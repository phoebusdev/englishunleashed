# Database Configuration Guide

## ⚠️ CRITICAL: Production Database Configuration

**THE MOST IMPORTANT RULE**: The Prisma schema MUST ALWAYS use PostgreSQL provider for production deployments on Vercel.

```prisma
// ✅ CORRECT for production
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ❌ NEVER use this in production
datasource db {
  provider = "sqlite"  // THIS WILL BREAK VERCEL DEPLOYMENT
  url      = env("DATABASE_URL")
}
```

## Why This Matters

1. **Vercel uses PostgreSQL** - The production database on Vercel is PostgreSQL
2. **Prisma generates database-specific code** - The Prisma client is generated at build time for the specific database provider
3. **Mismatched providers cause silent failures** - Pages will load but show no data, with cryptic error messages

## The Problem That Occurred

In commit `0a13ff7`, the schema was changed from PostgreSQL to SQLite for local development convenience. This caused:
- ✅ Local development worked (using SQLite)
- ❌ Vercel deployment broke (expecting PostgreSQL but got SQLite client)
- Pages showed "No products available" even though data existed
- Error messages were vague and unhelpful

## Database Environments

### Production (Vercel)
- **Database**: PostgreSQL (via Vercel Postgres or external provider)
- **Provider**: Must be `postgresql` in schema.prisma
- **Connection String**: Set in Vercel dashboard environment variables
- **Example**: `postgresql://user:password@host:5432/database?sslmode=require`

### Local Development Options

#### Option 1: Use PostgreSQL Locally (Recommended for consistency)
```bash
# Install PostgreSQL locally or use Docker
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=englishunleashed \
  -p 5432:5432 \
  postgres:15

# Set in .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/englishunleashed"
```

#### Option 2: Use Different Schema Files
```bash
# For local development with SQLite
cp prisma/schema.prisma prisma/schema.local.prisma
# Edit schema.local.prisma to use sqlite provider

# Generate Prisma client for local
npx prisma generate --schema=prisma/schema.local.prisma

# NEVER commit schema.local.prisma
echo "prisma/schema.local.prisma" >> .gitignore
```

## Deployment Checklist

Before deploying to Vercel, ALWAYS verify:

1. **Check schema.prisma provider**
   ```bash
   grep "provider" prisma/schema.prisma
   # Should output: provider = "postgresql"
   ```

2. **Verify environment variables in Vercel**
   - DATABASE_URL is set and starts with `postgresql://` or `postgres://`
   - Not using `file:` or `sqlite:` URLs

3. **Test build locally with production settings**
   ```bash
   NODE_ENV=production pnpm build
   ```

## Common Issues and Solutions

### Issue: "No products available" on production but works locally
**Cause**: Schema provider mismatch
**Solution**: Ensure `provider = "postgresql"` in schema.prisma

### Issue: Build succeeds but pages show no data
**Cause**: Database connection failing silently
**Solution**: 
1. Check `/api/health` endpoint for database status
2. Verify DATABASE_URL in Vercel dashboard
3. Check Vercel function logs for connection errors

### Issue: TypeScript errors with Prisma client
**Cause**: Generated client doesn't match schema
**Solution**: 
```bash
npx prisma generate
pnpm typecheck
```

## Monitoring Database Health

### Health Check Endpoint
Visit `https://your-domain.vercel.app/api/health` to see:
- Database connection status
- Table counts (products, packs)
- Connection timing
- Error details

### Vercel Logs
Check Function logs in Vercel dashboard for:
- `[Shop Page] Database error:` messages
- `[Videos Page] Database error:` messages
- `[Health Check] Database error:` messages

## Emergency Recovery

If deployment is broken due to database issues:

1. **Immediate Fix**
   ```bash
   # Revert to PostgreSQL provider
   git checkout main -- prisma/schema.prisma
   npx prisma generate
   git add -A
   git commit -m "Emergency: Fix database provider for production"
   git push
   ```

2. **Verify Fix**
   - Wait for Vercel deployment
   - Check `/api/health`
   - Verify `/shop` and `/videos` pages load data

## Best Practices

1. **Never change the provider in schema.prisma** unless you're migrating databases
2. **Always test production builds** before deploying
3. **Use the health endpoint** to verify database connectivity
4. **Monitor Vercel logs** after deployment
5. **Keep DATABASE_URL in Vercel** - never commit it to code

## Database Migration Commands

### Push schema to database (creates/updates tables)
```bash
# Production (be careful!)
npx prisma db push

# With data loss acceptance (development only)
npx prisma db push --accept-data-loss
```

### Generate Prisma Client
```bash
npx prisma generate
```

### Open Prisma Studio (database GUI)
```bash
npx prisma studio
```

## Environment Variable Template

```env
# Production (Vercel)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Local PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/englishunleashed"

# NEVER use this in production
# DATABASE_URL="file:./dev.db"  # SQLite - breaks Vercel!
```

## Final Warning

⚠️ **THE GOLDEN RULE**: If you see `provider = "sqlite"` in schema.prisma and you're deploying to Vercel, STOP and fix it immediately. This single line has caused hours of debugging and broken deployments.

Remember: Vercel = PostgreSQL. Always.