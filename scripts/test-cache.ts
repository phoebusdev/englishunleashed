#!/usr/bin/env tsx

/**
 * Script to test cache invalidation locally
 * Usage: npm run test:cache
 */

import { fetchGumroadProducts } from '../lib/gumroad';

const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

async function testCacheInvalidation() {
  console.log(`${YELLOW}🔄 Starting cache invalidation test...${RESET}\n`);

  // First fetch - should hit API
  console.log('1️⃣  First fetch (should hit API)...');
  const start1 = Date.now();
  const products1 = await fetchGumroadProducts();
  const time1 = Date.now() - start1;
  console.log(`${GREEN}✓ Fetched ${products1.length} products in ${time1}ms${RESET}`);

  // Second fetch - should use cache
  console.log('\n2️⃣  Second fetch (should use cache)...');
  const start2 = Date.now();
  const products2 = await fetchGumroadProducts();
  const time2 = Date.now() - start2;
  console.log(`${GREEN}✓ Fetched ${products2.length} products in ${time2}ms${RESET}`);
  
  if (time2 < time1 / 2) {
    console.log(`${GREEN}✓ Cache is working! Second fetch was ${Math.round(time1/time2)}x faster${RESET}`);
  } else {
    console.log(`${RED}⚠️  Cache might not be working properly${RESET}`);
  }

  // Wait for cache to expire
  console.log(`\n⏳ Waiting 5 minutes for cache to expire...`);
  console.log('   (You can test manual invalidation by calling the /api/revalidate endpoint)');
  
  // Show countdown
  for (let i = 300; i > 0; i--) {
    process.stdout.write(`\r   ${Math.floor(i/60)}:${(i%60).toString().padStart(2, '0')} remaining...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Third fetch - should hit API again
  console.log('\n\n3️⃣  Third fetch (cache should be expired)...');
  const start3 = Date.now();
  const products3 = await fetchGumroadProducts();
  const time3 = Date.now() - start3;
  console.log(`${GREEN}✓ Fetched ${products3.length} products in ${time3}ms${RESET}`);

  if (time3 > time2 * 2) {
    console.log(`${GREEN}✓ Cache expiration is working! API was called again${RESET}`);
  } else {
    console.log(`${RED}⚠️  Cache might not have expired properly${RESET}`);
  }

  console.log(`\n${GREEN}✅ Test complete!${RESET}`);
}

// Test manual cache invalidation
async function testManualInvalidation() {
  console.log(`\n${YELLOW}🔄 Testing manual cache invalidation...${RESET}`);
  
  const apiKey = process.env.REVALIDATE_API_KEY;
  if (!apiKey) {
    console.log(`${RED}❌ REVALIDATE_API_KEY not set in environment${RESET}`);
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/revalidate', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey
      }
    });

    if (response.ok) {
      console.log(`${GREEN}✓ Manual cache invalidation successful!${RESET}`);
      const data = await response.json() as { timestamp?: string };
      console.log(`   Timestamp: ${data.timestamp}`);
    } else {
      console.log(`${RED}❌ Manual invalidation failed: ${response.status}${RESET}`);
    }
  } catch (error) {
    console.log(`${RED}❌ Error calling revalidation endpoint: ${error}${RESET}`);
  }
}

// Run tests
testCacheInvalidation().catch(console.error);

// Optional: Test manual invalidation
if (process.argv.includes('--manual')) {
  setTimeout(() => testManualInvalidation(), 10000);
}