#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

console.log('🚀 Setting up local development environment...\n')

// Check if .env.local exists
const envPath = join(process.cwd(), '.env.local')
if (!existsSync(envPath)) {
  console.log('❌ .env.local not found!')
  console.log('Please copy .env.example to .env.local and fill in the values')
  process.exit(1)
}

// Read .env.local
const envContent = readFileSync(envPath, 'utf-8')
const hasDatabase = envContent.includes('DATABASE_URL=') && !envContent.includes('DATABASE_URL=""')

if (!hasDatabase) {
  console.log('📝 No database URL found. Using Prisma local development database...')
  
  // Update .env.local with local Prisma dev database
  const updatedEnv = envContent.replace(
    'DATABASE_URL=""',
    'DATABASE_URL="file:./dev.db"'
  )
  writeFileSync(envPath, updatedEnv)
}

console.log('📦 Installing dependencies...')
execSync('pnpm install', { stdio: 'inherit' })

console.log('\n🗄️  Setting up database...')
try {
  // Generate Prisma client
  execSync('pnpm prisma generate', { stdio: 'inherit' })
  
  // Push schema to database
  execSync('pnpm prisma db push', { stdio: 'inherit' })
  
  console.log('\n👤 Creating admin user...')
  execSync('pnpm seed:admin', { stdio: 'inherit' })
} catch (error) {
  console.error('Database setup failed:', error)
  console.log('\nTip: Make sure PostgreSQL is running or use SQLite for local dev')
}

console.log('\n✅ Setup complete!')
console.log('\n📋 Next steps:')
console.log('1. Get Stripe test keys from https://dashboard.stripe.com/test/apikeys')
console.log('2. Add them to .env.local')
console.log('3. Run: pnpm dev')
console.log('4. Login at http://localhost:3000/login')
console.log('   Email: admin@englishunleashed.com')
console.log('   Password: changeme123')
console.log('\n💡 For testing without Stripe:')
console.log('   - You can create packs but payment links won\'t work')
console.log('   - Manually create orders in the database to test the full flow')