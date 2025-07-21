#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 Generating secure environment variables...\n');

// Generate different formats
const webhookSecret = crypto.randomBytes(32).toString('hex');
const revalidateApiKey = crypto.randomBytes(32).toString('base64url'); // base64url is URL-safe

console.log('WEBHOOK_SECRET=' + webhookSecret);
console.log('REVALIDATE_API_KEY=' + revalidateApiKey);

console.log('\n📋 Copy these to your Vercel environment variables:');
console.log('1. Go to your Vercel project dashboard');
console.log('2. Navigate to Settings → Environment Variables');
console.log('3. Add these variables for Production environment');
console.log('\n⚠️  Keep these values secret and never commit them to Git!');

// Also create a .env.local.example file
const exampleContent = `# Copy this file to .env.local and fill in your values

# YouTube API Configuration
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_CHANNEL_ID=your_channel_id_here
YOUTUBE_CHANNEL_HANDLE=@your_channel_handle

# Gumroad API Configuration
GUMROAD_ACCESS_TOKEN=your_gumroad_access_token_here

# Security Keys (generate with: node scripts/generate-secrets.js)
WEBHOOK_SECRET=${webhookSecret}
REVALIDATE_API_KEY=${revalidateApiKey}
`;

require('fs').writeFileSync('.env.local.example', exampleContent);
console.log('\n✅ Created .env.local.example file with generated secrets');