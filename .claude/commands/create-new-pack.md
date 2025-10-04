# Create New Pack

Complete guide for creating and publishing new educational packs in English Unleashed.

## 1. Quick Pack Creation

### Admin Panel Method (Recommended)
```bash
# 1. Start development server
pnpm dev

# 2. Login to admin panel
open http://localhost:3000/admin
# Use admin credentials created with: pnpm seed:admin

# 3. Navigate to Pack Management
# Click "Packs" in admin sidebar → "Create New Pack"
```

### Command Line Method
```bash
# Create pack via script
npx tsx scripts/create-pack.ts \
  --title "Advanced Business English" \
  --description "Master professional communication skills" \
  --price 3999 \
  --video-id "dQw4w9WgXcQ" \
  --stripe-link "https://buy.stripe.com/test_123abc"
```

## 2. Pack Content Preparation

### Content Checklist
```markdown
Before creating a pack, prepare:

□ **Video Content**
  - YouTube video uploaded and public
  - Video ID extracted from URL
  - Video title and description optimized
  - Thumbnail looks professional

□ **PDF Materials**
  - PDF file size < 10MB
  - High-quality formatting
  - Print-friendly layout
  - Searchable text (not scanned images)

□ **Quiz Questions**
  - 10-20 multiple choice questions
  - Questions test video content
  - One clearly correct answer per question
  - Distractors are plausible but incorrect

□ **Pricing & Payment**
  - Price determined (in cents: $29.99 = 2999)
  - Stripe Payment Link created
  - Payment Link tested with test cards
```

### Video Content Guidelines
```bash
# Extract YouTube video ID from URL
# https://www.youtube.com/watch?v=dQw4w9WgXcQ → dQw4w9WgXcQ
# https://youtu.be/dQw4w9WgXcQ → dQw4w9WgXcQ

# Verify video is accessible
curl -I "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
# Should return 200 OK

# Check video metadata
npx tsx -e "
import { youtube } from './lib/youtube'
const response = await youtube.videos.list({
  part: ['snippet', 'statistics'],
  id: ['dQw4w9WgXcQ']
})
console.log(response.data.items[0])
"
```

## 3. Step-by-Step Pack Creation

### Step 1: Create Product Record
```typescript
// Via admin panel or script
const product = await db.product.create({
  data: {
    title: "Advanced Business English",
    description: "Master professional communication skills for the modern workplace",
    price: 3999, // $39.99 in cents
    type: "PACK",
    active: false, // Start inactive
    stripePaymentLinkUrl: "https://buy.stripe.com/test_123abc"
  }
})
```

### Step 2: Create Pack Record
```typescript
const pack = await db.pack.create({
  data: {
    productId: product.id,
    title: product.title,
    description: product.description,
    videoId: "dQw4w9WgXcQ",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    hasPdf: false, // Will be true after PDF upload
    hasQuiz: false, // Will be true after quiz creation
    order: 1 // Display order on homepage
  }
})
```

### Step 3: Upload PDF Materials
```bash
# Via admin panel:
# 1. Go to Pack edit page
# 2. Click "Upload PDF" button
# 3. Select PDF file (max 10MB)
# 4. Wait for upload to Vercel Blob
# 5. Verify PDF URL is saved

# Manual upload via API:
curl -X POST http://localhost:3000/api/admin/upload/pdf \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/file.pdf" \
  -F "packId=pack-id-here"
```

### Step 4: Create Quiz
```typescript
// Navigate to Quiz Builder in admin panel
const quiz = await db.quiz.create({
  data: {
    packId: pack.id,
    title: `${pack.title} Quiz`,
    timeLimit: 1800, // 30 minutes in seconds
    questions: {
      create: [
        {
          text: "What is the most important aspect of business communication?",
          order: 1,
          answers: {
            create: [
              { text: "Clarity and conciseness", isCorrect: true },
              { text: "Using complex vocabulary", isCorrect: false },
              { text: "Speaking loudly", isCorrect: false },
              { text: "Using lots of jargon", isCorrect: false }
            ]
          }
        }
        // Add more questions...
      ]
    }
  }
})
```

## 4. Stripe Payment Setup

### Create Payment Link
```bash
# Login to Stripe Dashboard
# https://dashboard.stripe.com/test/payment-links

# Create Payment Link with:
# - Product name: "Advanced Business English"
# - Price: $39.99
# - Success URL: https://yourdomain.com/checkout/success
# - Cancel URL: https://yourdomain.com/checkout/cancel

# Copy the Payment Link URL
# Example: https://buy.stripe.com/test_14k5l04X62Hn123abc
```

### Test Payment Flow
```bash
# Test with Stripe test cards
# Card: 4242 4242 4242 4242
# Expiry: Any future date
# CVC: Any 3 digits
# ZIP: Any valid ZIP

# Complete test purchase and verify:
# 1. Order created in database
# 2. Webhook processed successfully
# 3. User receives access
# 4. Download links work
```

## 5. Pack Configuration

### Pack Settings
```typescript
// File: app/admin/packs/[packId]/page.tsx
interface PackSettings {
  title: string
  description: string
  price: number // in cents
  videoId: string
  pdfUrl?: string
  stripePaymentLinkUrl: string
  order: number // display order
  active: boolean // published status
  hasPdf: boolean
  hasQuiz: boolean
}

// Update pack settings
await db.pack.update({
  where: { id: packId },
  data: {
    title: "Updated Pack Title",
    description: "Updated description",
    order: 2, // Move to second position
    active: true // Publish pack
  }
})
```

### SEO Optimization
```typescript
// Ensure pack has good SEO metadata
const seoOptimizedPack = {
  title: "Advanced Business English - Professional Communication Course",
  description: "Master professional English communication skills with video lessons, downloadable materials, and interactive quizzes. Perfect for business professionals.",
  // Description should be 150-160 characters for optimal SEO
}
```

## 6. Quality Assurance Testing

### Pre-Launch Testing Checklist
```bash
# Content Testing
□ Video plays correctly on all devices
□ Video thumbnail displays properly
□ PDF downloads successfully
□ PDF is readable and well-formatted
□ Quiz questions are clear and accurate
□ Quiz scoring works correctly

# Purchase Flow Testing
□ Pack appears on homepage
□ Pack detail page loads correctly
□ Purchase button redirects to Stripe
□ Test payment completes successfully
□ User receives download access
□ Guest checkout works (24-hour access)
□ Registered user gets permanent access

# Mobile Testing
□ Pack displays correctly on mobile
□ Video is responsive
□ Quiz interface works on touch devices
□ Download links work on mobile browsers

# Performance Testing
□ Page load time < 2 seconds
□ Images are optimized
□ No console errors
□ Lighthouse score > 80
```

### Automated Testing
```typescript
// Create E2E test for new pack
// File: tests/e2e/pack-creation.spec.ts
import { test, expect } from '@playwright/test'

test('new pack creation flow', async ({ page }) => {
  // Login as admin
  await page.goto('/admin/login')
  await page.fill('[data-testid="email"]', 'admin@example.com')
  await page.fill('[data-testid="password"]', 'admin-password')
  await page.click('[data-testid="login-button"]')

  // Create new pack
  await page.goto('/admin/packs/create')
  await page.fill('[data-testid="pack-title"]', 'Test Pack')
  await page.fill('[data-testid="pack-description"]', 'Test description')
  await page.fill('[data-testid="pack-price"]', '2999')
  await page.fill('[data-testid="video-id"]', 'dQw4w9WgXcQ')
  await page.click('[data-testid="create-pack-button"]')

  // Verify pack was created
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible()

  // Verify pack appears on homepage
  await page.goto('/')
  await expect(page.locator('text=Test Pack')).toBeVisible()
})
```

## 7. Publishing Process

### Soft Launch (Limited Testing)
```typescript
// Create pack but keep inactive
await db.pack.update({
  where: { id: packId },
  data: {
    active: false, // Not visible on homepage
    // Share direct link for testing: /shop/pack-id
  }
})

// Test with beta users using direct link
const directLink = `https://yourdomain.com/shop/${packId}`
```

### Full Launch
```typescript
// Activate pack for public visibility
await db.pack.update({
  where: { id: packId },
  data: {
    active: true,
    order: 1 // Featured position
  }
})

// Verify pack appears on homepage
// Clear any caches if using Redis/CDN
```

## 8. Post-Launch Monitoring

### Analytics Setup
```typescript
// Track pack-specific metrics
// File: lib/analytics.ts
export async function trackPackView(packId: string, userId?: string) {
  await db.analytics.create({
    data: {
      type: 'PACK_VIEW',
      packId,
      userId,
      metadata: {
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      }
    }
  })
}

export async function trackPackPurchase(packId: string, orderId: string) {
  await db.analytics.create({
    data: {
      type: 'PACK_PURCHASE',
      packId,
      orderId,
      metadata: {
        timestamp: new Date().toISOString()
      }
    }
  })
}
```

### Performance Monitoring
```bash
# Monitor pack performance
npx tsx -e "
import { db } from './lib/db'

const packStats = await db.pack.findMany({
  include: {
    _count: {
      select: {
        product: {
          orders: true
        }
      }
    }
  }
})

console.log('Pack performance:', packStats.map(pack => ({
  title: pack.title,
  orders: pack._count.product.orders,
  active: pack.active
})))
"
```

## 9. Pack Management

### Update Existing Pack
```typescript
// Update pack content
await db.pack.update({
  where: { id: packId },
  data: {
    title: "Updated Title",
    description: "Updated description",
    videoId: "newVideoId", // Change video
    order: 3 // Change display order
  }
})

// Update pricing
await db.product.update({
  where: { id: productId },
  data: {
    price: 4999, // Update to $49.99
    // Note: Update Stripe Payment Link separately
  }
})
```

### Archive Pack
```typescript
// Soft delete - hide but preserve data
await db.pack.update({
  where: { id: packId },
  data: {
    active: false,
    order: 999 // Move to end
  }
})

// Users who already purchased can still access
// New users cannot see or purchase
```

### Pack Duplication
```typescript
// Duplicate existing pack as template
const originalPack = await db.pack.findUnique({
  where: { id: originalPackId },
  include: {
    product: true,
    quiz: {
      include: {
        questions: {
          include: { answers: true }
        }
      }
    }
  }
})

// Create new pack based on original
const newPack = await db.pack.create({
  data: {
    title: `${originalPack.title} - Part 2`,
    description: originalPack.description,
    // ... copy other relevant fields
    active: false // Start inactive
  }
})
```

This comprehensive guide covers all aspects of creating, testing, and managing educational packs in English Unleashed.