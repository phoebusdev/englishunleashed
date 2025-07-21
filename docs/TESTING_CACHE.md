# Testing Cache Invalidation

This guide explains how to test the 5-minute cache invalidation without affecting production.

## Testing Methods

### 1. Local Development Testing

Run the cache test script to verify timing:

```bash
# Basic cache test (waits 5 minutes)
npm run test:cache

# Test with manual invalidation
REVALIDATE_API_KEY=your-key npm run test:cache:manual
```

This script will:
- Fetch products (hits API)
- Fetch again immediately (uses cache)
- Wait 5 minutes
- Fetch again (should hit API)

### 2. Manual Cache Testing

While running `npm run dev`:

```bash
# Check cache status (dev only)
curl http://localhost:3000/api/debug/cache

# Clear all caches manually
curl -X POST http://localhost:3000/api/debug/cache \
  -H "Content-Type: application/json" \
  -d '{"action": "clear-all"}'

# Test product revalidation
curl -X POST http://localhost:3000/api/debug/cache \
  -H "Content-Type: application/json" \
  -d '{"action": "test-products"}'
```

### 3. Staging Environment Testing

Deploy to a Vercel preview URL with debug enabled:

```bash
# Deploy with staging config
vercel --prod --env-file .env.staging

# Or use preview deployments
git push origin your-branch
```

Preview deployments will have debug endpoints enabled.

### 4. Using the Revalidation API

Test the production-ready endpoint:

```bash
# Set in .env.local
REVALIDATE_API_KEY=your-secret-key

# Call revalidation endpoint
curl -X POST https://your-preview-url.vercel.app/api/revalidate \
  -H "x-api-key: your-secret-key"
```

## Testing Workflow

1. **Start local dev server**: `npm run dev`
2. **Open browser**: http://localhost:3000/shop
3. **Note product count**
4. **Add/modify product in Gumroad**
5. **Wait 5 minutes OR trigger manual revalidation**
6. **Refresh page** - new products should appear

## Monitoring Cache Behavior

Watch the terminal for cache logs:
- "Fetching Gumroad products..." = API call
- No log = using cache

## Preview URL Testing

Every PR gets a preview URL where you can:
1. Test without affecting production
2. Share with team for validation
3. Run automated tests

## Automated Testing

The GitHub Action runs on every push to verify:
- TypeScript compilation
- Build process
- Cache configuration

This ensures changes work before merging to production.