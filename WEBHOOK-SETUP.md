# Stripe Webhook Setup Guide

## Local Development Setup

### 1. Install Stripe CLI

**macOS (Homebrew):**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows (Scoop):**
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Linux:**
```bash
# Download from https://github.com/stripe/stripe-cli/releases/latest
# For Ubuntu/Debian:
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe
```

### 2. Login to Stripe CLI
```bash
stripe login
```
This will open your browser to authenticate.

### 3. Forward Webhooks to Local Server

In a **new terminal window**, run:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see output like:
```
Ready! Your webhook signing secret is whsec_abcd1234... (^C to quit)
```

### 4. Update Your Environment

Copy the webhook signing secret and update your `.env.local`:
```env
STRIPE_WEBHOOK_SECRET="whsec_YOUR_ACTUAL_SECRET_HERE"
```

### 5. Restart Your Dev Server
```bash
# Stop the server (Ctrl+C) and restart
pnpm dev
```

## Testing the Webhook

### Method 1: Trigger Test Events
```bash
# In another terminal, trigger a test event
stripe trigger checkout.session.completed
```

### Method 2: Complete a Real Test Payment
1. Go to http://localhost:3000/shop
2. Click "Buy Now" on any product
3. Complete checkout with test card: `4242 4242 4242 4242`
4. Check your terminal running `stripe listen` - you should see the event
5. Check your app logs - you should see "Order created: [orderId]"

## Production Setup

### 1. Add Webhook Endpoint in Stripe Dashboard

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed` (Required)
   - `payment_intent.succeeded` (Optional)
   - `payment_intent.payment_failed` (Optional)
5. Click "Add endpoint"

### 2. Get Production Webhook Secret

After creating the endpoint:
1. Click on the webhook endpoint you just created
2. Click "Reveal" under "Signing secret"
3. Copy the `whsec_...` value

### 3. Update Production Environment

Add to your production environment variables:
```env
STRIPE_WEBHOOK_SECRET="whsec_YOUR_PRODUCTION_SECRET"
```

### For Vercel deployment:
```bash
vercel env add STRIPE_WEBHOOK_SECRET
```

## Webhook Event Flow

1. **Customer completes payment** → Stripe sends `checkout.session.completed`
2. **Your webhook endpoint receives event** → Verifies signature
3. **Creates order in database** → Links to user (or creates guest user)
4. **Sends confirmation email** → With download link
5. **Returns success to Stripe** → Confirms receipt

## Troubleshooting

### "Invalid signature" error
- Make sure `STRIPE_WEBHOOK_SECRET` matches the one from `stripe listen`
- Ensure you're using the raw request body (not parsed JSON)

### Webhook not receiving events
- Check that `stripe listen` is running
- Verify the forward URL matches your app's port
- Check for any firewall/proxy issues

### Orders not being created
- Check database connection
- Verify pack IDs exist in database
- Check application logs for errors

## Security Best Practices

1. **Always verify webhook signatures** - Already implemented in the code
2. **Use HTTPS in production** - Required by Stripe
3. **Implement idempotency** - Handle duplicate events gracefully
4. **Log webhook events** - For debugging and audit trails
5. **Set up webhook event monitoring** - Use Stripe's webhook monitoring

## Monitoring Webhooks

In Stripe Dashboard:
- View recent events: [Events & Logs](https://dashboard.stripe.com/events)
- Monitor webhook health: [Webhook Endpoints](https://dashboard.stripe.com/webhooks)
- Set up alerts for failed webhooks

## Next Steps

1. ✅ Test the complete flow locally
2. ✅ Verify orders are created in your database
3. ✅ Check email notifications (console logs for now)
4. 🔲 Deploy to production
5. 🔲 Configure production webhook endpoint
6. 🔲 Test with live mode (with real card)