# Vercel Database Configuration

## Current Database Setup (as of deployment)

Your new Vercel database has been configured and populated with:

### Database URLs
- **For Application (with Prisma Accelerate)**: 
  ```
  DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XVEQ1aXhGZDlJUFY5YjFzZjViVTkiLCJhcGlfa2V5IjoiMDFLMjVHSEVEM1gwOUFCNFZXTTIyQjUyREEiLCJ0ZW5hbnRfaWQiOiI4Njg3ZDM4ZWJiMTkzYjBiZmU3YTRiZDdkZWRiNGY2NDU4YjY3ZmFlY2Y1NDYyYjJmNjVhNDA3ODVjYjY4NDk3IiwiaW50ZXJuYWxfc2VjcmV0IjoiNmExYmMwOTktY2UyNS00MTVmLTg3NzgtZThlMzQyZTdmZDJkIn0.ekWon_k4-Myi8eznTXlGEdrBPVQezkH-q3dkniCWV2Q"
  ```

### Admin Users Created
1. **Main Admin**
   - Email: `admin@englishunleashed.com`
   - Password: `changeme123`
   - Role: Admin

2. **Test Admin**
   - Email: `test@admin.com`
   - Password: `test123456`
   - Role: Admin

3. **Debug Admin**
   - Email: `debug@test.com`
   - Password: `password123`
   - Role: Admin

### Sample Content Added
- **Product**: Complete English Basics Bundle (£19.99)
  - Pack 1: Lesson 1: Introduction to English (Video: jNQXAC9IVRw)
  - Pack 2: Lesson 2: Daily Conversations (Video: dQw4w9WgXcQ)
  - Pack 3: Lesson 3: British Pronunciation (Video: 9bZkp7q19f0)
  - Pack 4: Free Lesson: English Greetings (Video: J7hHCnJ8Kf4)
  - Pack 5: Free Lesson: Numbers in English (Video: D0Ajq682yrA)

### Vercel Environment Variables

Set these in your Vercel project settings:

```bash
# Required
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XVEQ1aXhGZDlJUFY5YjFzZjViVTkiLCJhcGlfa2V5IjoiMDFLMjVHSEVEM1gwOUFCNFZXTTIyQjUyREEiLCJ0ZW5hbnRfaWQiOiI4Njg3ZDM4ZWJiMTkzYjBiZmU3YTRiZDdkZWRiNGY2NDU4YjY3ZmFlY2Y1NDYyYjJmNjVhNDA3ODVjYjY4NDk3IiwiaW50ZXJuYWxfc2VjcmV0IjoiNmExYmMwOTktY2UyNS00MTVmLTg3NzgtZThlMzQyZTdmZDJkIn0.ekWon_k4-Myi8eznTXlGEdrBPVQezkH-q3dkniCWV2Q"

NEXTAUTH_URL=https://[your-vercel-domain].vercel.app
NEXTAUTH_SECRET=K7xH9mPq2wRt5vBn8jCd3fGh6kLp4sWx1zQa9yEr0uIo

# Already set (keep these)
YOUTUBE_CHANNEL_ID=[already set]
YOUTUBE_CHANNEL_HANDLE=[already set]

# Add these
YOUTUBE_API_KEY=AIzaSyByBp3_4ZCgykLDzbz--qgjYJHApSZpRjs

# Stripe (use your test keys from Stripe Dashboard)
STRIPE_SECRET_KEY=[Your Stripe Secret Key - starts with sk_test_]
STRIPE_WEBHOOK_SECRET=[Your Stripe Webhook Secret - get after configuring webhook]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[Your Stripe Publishable Key - starts with pk_test_]

# Email
RESEND_API_KEY=re_cJVgWVmZ_H7CTsbUJynRSHBLy8Qg1rZ2p

# Security
CRON_SECRET=cron_xK9mN3pQ7rT2wY5vB8jH4fG6sL1dZ0aE
```

### Testing After Deployment

1. **Login Test**: Go to `/login` and use any of the admin credentials above
2. **Shop Page**: Should show "Complete English Basics Bundle" 
3. **Videos Page**: Should show 5 video lessons with actual YouTube embeds
4. **Admin Dashboard**: After login, go to `/admin`
5. **Debug Endpoint**: `/api/debug/db` to verify database connection

### Notes
- Database is hosted on Prisma's infrastructure
- Using Prisma Accelerate for connection pooling and better performance
- All passwords are properly hashed with bcrypt
- Sample videos use real YouTube video IDs for testing