# Client Instructions for English Unleashed Site

## How to Update Your Products

### 1. Updating Product Information

All product data is stored in the file: `/data/products.ts`

To update your products:

1. Open the `data/products.ts` file
2. Find the product you want to update
3. Update the following fields as needed:

```typescript
{
  id: 'unique-product-id',           // Don't change this
  title: 'Your Product Title',       // Update with your product name
  price: '£24.99',                   // Update with your price
  category: 'vocabulary',            // Choose: 'vocabulary' | 'conversation' | 'pronunciation' | 'business'
  type: 'PDF',                       // Choose: 'PDF' | 'Video' | 'Bundle'
  description: 'Product description', // Your sales copy
  features: [                        // List of features/benefits
    'Feature 1',
    'Feature 2'
  ],
  featured: true,                    // true to show on homepage
  relatedEpisode: 'Episode #45',     // Related podcast episode
  gumroadUrl: 'https://englishunleashed.gumroad.com/l/your-product', // YOUR GUMROAD LINK
  
  // Optional video fields (uncomment and add IDs when you have videos):
  // youtubeVideoId: 'abc123',      // Full video course ID
  // previewVideoId: 'xyz789',      // Preview/trailer video ID
  // episodeVideoIds: ['vid1', 'vid2'] // Related episode video IDs
}
```

### 2. Adding Gumroad Products

For each product, update the `gumroadUrl` field with your actual Gumroad product link.

Example:
```typescript
gumroadUrl: 'https://englishunleashed.gumroad.com/l/your-product-slug'
```

### 3. Adding YouTube Videos (Optional)

When you have YouTube videos for your products:

1. Get the video ID from YouTube (the part after `v=` in the URL)
2. Uncomment the relevant video fields and add the IDs:

```typescript
youtubeVideoId: 'dQw4w9WgXcQ',     // Main video
previewVideoId: 'abc123xyz',       // Preview video
episodeVideoIds: ['vid1', 'vid2']  // Related episodes
```

### 4. After Making Changes

1. Save the file
2. Commit your changes to git
3. Push to your repository
4. Vercel will automatically deploy the changes

### 5. Testing Your Changes

Visit your live site to verify:
- Products appear correctly
- Gumroad links work
- Videos display (if added)
- Prices and descriptions are accurate

## Need Help?

If you need to:
- Add new products
- Change the site design
- Add new features

Contact your developer with specific requirements.