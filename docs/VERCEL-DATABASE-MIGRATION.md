# Vercel Database Migration - YouTube Videos Table

## ⚠️ IMPORTANT: Run This SQL in Vercel Database Query Tab

### Step-by-Step Instructions:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: englishunleashed
3. **Click on "Storage"** in the top menu
4. **Click on your PostgreSQL database**
5. **Click on "Data" or "Query"** tab
6. **Copy and paste this EXACT SQL**:

```sql
-- Drop table if exists (for clean migration)
DROP TABLE IF EXISTS "YouTubeVideo" CASCADE;

-- Create the YouTubeVideo table
CREATE TABLE "YouTubeVideo" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "videoId" TEXT NOT NULL UNIQUE,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "publishedAt" TIMESTAMPTZ NOT NULL,
    "thumbnailUrl" TEXT,
    "thumbnailWidth" INTEGER,
    "thumbnailHeight" INTEGER,
    "channelId" TEXT,
    "videoUrl" TEXT NOT NULL,
    "duration" TEXT,
    "viewCount" TEXT,
    "addedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT
);

-- Create indexes
CREATE INDEX "YouTubeVideo_publishedAt_idx" ON "YouTubeVideo"("publishedAt" DESC);
CREATE INDEX "YouTubeVideo_channelId_idx" ON "YouTubeVideo"("channelId");
CREATE INDEX "YouTubeVideo_addedAt_idx" ON "YouTubeVideo"("addedAt" DESC);

-- Verify table was created
SELECT 
    'Table created successfully!' as status,
    COUNT(*) as row_count 
FROM "YouTubeVideo";
```

7. **Click "Run Query"** or **"Execute"**

### Expected Result:
You should see:
```
status                      | row_count
----------------------------|----------
Table created successfully! | 0
```

### Alternative Method (If Above Doesn't Work):

If you get any errors, try this simpler version:

```sql
-- Simpler version without defaults
CREATE TABLE IF NOT EXISTS "YouTubeVideo" (
    "id" TEXT PRIMARY KEY,
    "videoId" TEXT NOT NULL UNIQUE,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "publishedAt" TIMESTAMP NOT NULL,
    "thumbnailUrl" TEXT,
    "thumbnailWidth" INTEGER,
    "thumbnailHeight" INTEGER,
    "channelId" TEXT,
    "videoUrl" TEXT NOT NULL,
    "duration" TEXT,
    "viewCount" TEXT,
    "addedAt" TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "lastSeenAt" TIMESTAMP,
    "metadata" TEXT
);
```

### Verify It Worked:

After running either SQL above, run this verification query:

```sql
SELECT 
    table_name,
    column_name,
    data_type
FROM 
    information_schema.columns
WHERE 
    table_name = 'YouTubeVideo'
ORDER BY 
    ordinal_position;
```

You should see a list of all columns if the table was created successfully.

### Still Having Issues?

If you're still getting errors:

1. **Check which schema you're in**:
```sql
SELECT current_schema();
```

2. **List all tables to see what exists**:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

3. **Try with explicit schema**:
```sql
CREATE TABLE IF NOT EXISTS public."YouTubeVideo" (
    -- ... same columns as above
);
```

### After Table is Created:

Once the table exists, go back to your site and:

1. Visit: https://englishunleashed-jhfxooqja-phoebusdevs-projects.vercel.app/videos
2. The page should now load videos!
3. Run the import command in console again to get full history

---

**Note**: The 500 error you're seeing is ONLY because the table doesn't exist. Once you create it with the SQL above, everything will work!