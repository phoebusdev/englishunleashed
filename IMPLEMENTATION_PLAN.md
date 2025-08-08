# English Unleashed Implementation Plan

## Overview
Integration plan for Gumroad checkout and YouTube video embeds.

## Core Principle: Keep It Simple
- All checkout happens on Gumroad (no cart, no payment processing)
- YouTube videos embedded directly
- Easy to add new products and videos

## 1. Enhanced Product Data Structure
```typescript
// Extend Product interface with:
gumroadUrl?: string        // Direct link to Gumroad product
youtubeVideoId?: string    // For video products or previews
previewVideoId?: string    // Short preview/trailer
episodeVideoIds?: string[] // Related YouTube episodes
```

## 2. Component Updates

### A. ProductCard Enhancement
- Change "Download Now" to "Buy on Gumroad" (opens in new tab)
- Add "Preview" button for products with preview videos
- Show episode links if available

### B. New VideoPlayer Component
```typescript
// Simple YouTube embed wrapper
- Responsive iframe
- Optional mini player mode
- Privacy-enhanced embed (youtube-nocookie.com)
```

### C. New VideoGrid Component
```typescript
// Display YouTube videos in grid
- Thumbnail preview
- Click to play in modal or inline
- Show related products
```

## 3. Page Enhancements

### Shop Page (`/shop/page.tsx`)
- Products link directly to Gumroad
- Preview buttons open video modal
- Related episodes section per product

### New Videos Page (`/app/videos/page.tsx`)
- Grid of all YouTube videos
- Categories: Lessons, Episodes, Tutorials
- Each video shows related products
- Embedded player with playlist support

### Product Detail Pages (`/app/shop/[productId]/page.tsx`)
- Full product info
- Embedded preview video
- Related YouTube episodes
- "Buy on Gumroad" CTA
- Customer testimonials

## 4. Data Management Strategy

### products.ts Enhancement:
```typescript
export const products: Product[] = [
  {
    id: 'daily-routines-vocabulary',
    // ... existing fields ...
    gumroadUrl: 'https://englishunleashed.gumroad.com/l/daily-routines',
    previewVideoId: 'abc123',  // YouTube video ID
    episodeVideoIds: ['ep45_id', 'ep46_id']
  }
]
```

### New videos.ts:
```typescript
export interface Video {
  id: string
  title: string
  youtubeId: string
  category: 'episode' | 'lesson' | 'tutorial'
  relatedProducts?: string[] // Product IDs
  description?: string
  publishedDate: string
}
```

## 5. Implementation Order

1. **Update Product interface** with Gumroad URLs
2. **Create VideoPlayer component** for embeds
3. **Update ProductCard** to use Gumroad links
4. **Add preview functionality** to products
5. **Create Videos page** with all content
6. **Add video-product connections**

## 6. Benefits of This Approach
- **Simple**: No complex cart or checkout
- **Scalable**: Easy to add products/videos
- **Maintainable**: All data in TypeScript files
- **Fast**: No API calls needed
- **SEO Friendly**: All content is static

## 7. Future Enhancements (Later)
- YouTube API for dynamic video info
- Gumroad API for sales badges
- Email capture before video play
- Video transcript PDFs
- Member-only video content