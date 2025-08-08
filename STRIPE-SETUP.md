# Stripe Integration Setup Guide

## Quick Start

1. **Add your Stripe keys to `.env.local`:**
   ```bash
   # Add these to your .env.local file
   STRIPE_SECRET_KEY="sk_test_YOUR_SECRET_KEY"
   STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51RsTYMIXJgbHswroLtjlQu5DnDjV1J3iKzH6losuMq6gtjdGN84PUCERdhbpwpuBtxO1dL0bjZLGBNJpMWPL4c2x00b7gMUo7S"
   ```

2. **Initialize demo data:**
   Visit: http://localhost:3000/api/init-demo
   
   This creates:
   - Stripe products and prices
   - Database records for packs
   - Demo quizzes
   - Promo codes (DEMO20, SAVE5)

3. **Set up Stripe webhook (for production):**
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe
   
   # Login to Stripe
   stripe login
   
   # Forward webhooks to localhost
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   
   # Copy the webhook signing secret and add to .env.local
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

## How It Works

1. **Checkout Flow:**
   - User clicks "Buy Now" on a pack
   - Checkout page shows pack details and promo code field
   - User clicks "Complete Purchase"
   - API creates Stripe checkout session
   - User redirected to Stripe's hosted checkout
   - After payment, redirected to success page

2. **Order Processing:**
   - Stripe webhook receives `checkout.session.completed` event
   - Creates user account (or finds existing)
   - Creates order record
   - Sends email with download link
   - Guest users get 24-hour download access

3. **Features:**
   - Promo code support (percentage or fixed amount)
   - Guest checkout (no account required)
   - Automatic email notifications
   - PDF download management
   - Quiz access for registered users

## Testing Payments

Use Stripe's test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date and any 3-digit CVC

## Production Checklist

1. [ ] Replace test keys with live keys
2. [ ] Set up production webhook endpoint in Stripe dashboard
3. [ ] Configure email service (Resend/SendGrid)
4. [ ] Set up PDF storage (Vercel Blob/S3)
5. [ ] Enable SSL on production domain
6. [ ] Test full purchase flow end-to-end

## Troubleshooting

- **Webhook not working:** Check webhook secret is correct
- **Checkout fails:** Verify Stripe keys are set correctly
- **No email sent:** Email service needs configuration (currently logs to console)
- **PDF download fails:** Need to implement actual PDF storage/retrieval

## Next Steps

1. Configure email service (Resend API key)
2. Set up PDF storage (Vercel Blob)
3. Implement admin dashboard for order management
4. Add customer portal for account management