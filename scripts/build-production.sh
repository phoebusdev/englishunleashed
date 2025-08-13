#!/bin/bash

# Build script for production deployment
# This script ensures the correct Prisma schema is used for production

echo "🚀 Starting production build..."

# Check if we're in production environment
if [ "$NODE_ENV" = "production" ] || [ "$VERCEL" = "1" ]; then
  echo "📦 Production environment detected"
  
  # Backup the original schema
  if [ -f "prisma/schema.prisma" ]; then
    cp prisma/schema.prisma prisma/schema.backup.prisma
    echo "✅ Backed up original schema"
  fi
  
  # Use production schema if it exists
  if [ -f "prisma/schema.production.prisma" ]; then
    cp prisma/schema.production.prisma prisma/schema.prisma
    echo "✅ Switched to production schema (PostgreSQL)"
  fi
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run the build
echo "🏗️ Building application..."
npm run build

echo "✅ Production build complete!"