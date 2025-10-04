# Fix Stripe Webhook Issues

Complete guide for diagnosing and fixing Stripe webhook problems in English Unleashed.

## 1. Webhook Health Check

```bash
# Install Stripe CLI if not already installed
# macOS: brew install stripe/stripe-cli/stripe
# Linux: See https://stripe.com/docs/stripe-cli#install

# Login to Stripe account
stripe login

# List current webhooks
stripe webhooks list

# Check webhook endpoint status
curl -I https://your-domain.vercel.app/api/webhooks/stripe
```

## 2. Local Webhook Testing

### Setup Local Forwarding
```bash
# Forward Stripe webhooks to local development
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This will output a webhook secret like: whsec_1234...
# Copy this to your .env.local as STRIPE_WEBHOOK_SECRET
```

### Test Webhook Events
```bash
# Trigger test payment event
stripe trigger checkout.session.completed

# Trigger test payment intent
stripe trigger payment_intent.succeeded

# Check your local server logs for webhook processing
```

### Verify Local Processing
```bash
# Check if webhook is being processed
# Look for logs in your terminal:
# ✓ Webhook received: checkout.session.completed
# ✓ Order created: order_id_here
```

## 3. Common Webhook Issues

### Issue: Signature Verification Failed
**Error**: `No signatures found matching the expected signature for payload`

**Causes & Solutions**:

1. **Wrong Webhook Secret**:
```bash
# Verify webhook secret in Stripe dashboard
# Go to Developers > Webhooks > [Your Endpoint] > Signing secret

# Update your environment variable
STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

2. **Body Parser Issue**:
```typescript
// File: app/api/webhooks/stripe/route.ts
// Ensure you're getting raw body, not parsed JSON
export async function POST(req: Request) {
  const body = await req.text() // ✅ Use .text() for raw body
  // NOT: const body = await req.json() // ❌ This breaks signature verification

  const sig = req.headers.get('stripe-signature')

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    // Process event...
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return new Response('Webhook Error', { status: 400 })
  }
}
```

### Issue: Webhook Timeout
**Error**: Webhook endpoint returns timeout (>30 seconds)

**Solutions**:

1. **Optimize Database Operations**:
```typescript
// File: app/api/webhooks/stripe/route.ts
// Use transactions for multiple operations
await db.$transaction([
  db.order.update({
    where: { stripeId: paymentIntentId },
    data: { status: 'COMPLETED' }
  }),
  db.emailQueue.create({
    data: {
      userId: order.userId,
      type: 'PURCHASE_CONFIRMATION',
      data: JSON.stringify({ orderId: order.id })
    }
  })
])
```

2. **Move Heavy Operations to Background**:
```typescript
// Process immediately needed updates
const order = await db.order.update({
  where: { stripeId: paymentIntentId },
  data: { status: 'COMPLETED' }
})

// Queue heavy operations (email, analytics, etc.)
await db.emailQueue.create({
  data: {
    userId: order.userId,
    type: 'PURCHASE_CONFIRMATION',
    data: JSON.stringify({ orderId: order.id })
  }
})

// Return success immediately
return new Response('OK', { status: 200 })
```

### Issue: Duplicate Event Processing
**Problem**: Same webhook processed multiple times

**Solutions**:

1. **Implement Idempotency**:
```typescript
// File: app/api/webhooks/stripe/route.ts
const processedEvents = new Set()

export async function POST(req: Request) {
  const event = stripe.webhooks.constructEvent(body, sig, secret)

  // Check if we've already processed this event
  const existingProcessedEvent = await db.webhookEvent.findUnique({
    where: { stripeEventId: event.id }
  })

  if (existingProcessedEvent) {
    console.log('Event already processed:', event.id)
    return new Response('OK', { status: 200 })
  }

  // Process the event
  await processWebhookEvent(event)

  // Mark as processed
  await db.webhookEvent.create({
    data: {
      stripeEventId: event.id,
      eventType: event.type,
      processedAt: new Date()
    }
  })

  return new Response('OK', { status: 200 })
}
```

## 4. Production Webhook Debugging

### Check Vercel Function Logs
```bash
# Install Vercel CLI
npm i -g vercel

# View real-time logs
vercel logs --follow

# View recent logs for webhook function
vercel logs --since 1h app/api/webhooks/stripe
```

### Check Stripe Dashboard
1. Go to **Developers > Webhooks**
2. Click on your endpoint
3. View **Recent events** tab
4. Check response codes and error messages

### Monitor Webhook Performance
```typescript
// Add timing and logging to webhook handler
// File: app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const startTime = Date.now()

  try {
    const event = stripe.webhooks.constructEvent(body, sig, secret)

    console.log('Processing webhook:', {
      eventId: event.id,
      eventType: event.type,
      timestamp: new Date().toISOString()
    })

    await processWebhookEvent(event)

    const duration = Date.now() - startTime
    console.log('Webhook processed successfully:', {
      eventId: event.id,
      duration: `${duration}ms`
    })

    return new Response('OK', { status: 200 })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('Webhook processing failed:', {
      error: error.message,
      duration: `${duration}ms`,
      stack: error.stack
    })

    return new Response('Webhook Error', { status: 500 })
  }
}
```

## 5. Event Type Specific Issues

### Checkout Session Completed
```typescript
// Handle checkout.session.completed events
case 'checkout.session.completed': {
  const session = event.data.object

  // Find order by customer email or metadata
  const order = await db.order.findFirst({
    where: {
      OR: [
        { stripeId: session.payment_intent },
        { user: { email: session.customer_details.email } }
      ],
      status: 'PENDING'
    },
    include: { user: true, product: true }
  })

  if (!order) {
    console.error('Order not found for checkout session:', session.id)
    return new Response('Order not found', { status: 400 })
  }

  // Update order status
  await db.order.update({
    where: { id: order.id },
    data: {
      status: 'COMPLETED',
      stripeId: session.payment_intent as string
    }
  })

  break
}
```

### Payment Intent Succeeded
```typescript
// Handle payment_intent.succeeded events
case 'payment_intent.succeeded': {
  const paymentIntent = event.data.object

  // Update order with payment details
  const order = await db.order.findFirst({
    where: { stripeId: paymentIntent.id }
  })

  if (order) {
    await db.order.update({
      where: { id: order.id },
      data: {
        status: 'COMPLETED',
        amount: paymentIntent.amount_received
      }
    })
  }

  break
}
```

## 6. Testing Webhook Reliability

### Test Event Handling
```bash
# Create test script: scripts/test-webhook.ts
import { stripe } from '../lib/stripe'

async function testWebhook() {
  // Create test checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: 'https://your-domain.com/success',
    cancel_url: 'https://your-domain.com/cancel',
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: 'Test Product' },
        unit_amount: 2000
      },
      quantity: 1
    }]
  })

  console.log('Test checkout session:', session.url)
}

testWebhook()
```

### Load Test Webhooks
```bash
# Test multiple webhook events
for i in {1..10}; do
  stripe trigger checkout.session.completed &
done
wait

# Check if all events were processed correctly
```

## 7. Webhook Recovery

### Replay Failed Events
```bash
# Get failed events from Stripe
stripe events list --type checkout.session.completed --limit 100

# Replay specific event
stripe events resend evt_1234567890abcdef
```

### Manual Event Processing
```typescript
// Create script to manually process missing orders
// scripts/process-pending-orders.ts
import { db } from '../lib/db'
import { stripe } from '../lib/stripe'

async function processPendingOrders() {
  const pendingOrders = await db.order.findMany({
    where: {
      status: 'PENDING',
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24h
    },
    include: { user: true, product: true }
  })

  for (const order of pendingOrders) {
    if (order.stripeId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(order.stripeId)

        if (paymentIntent.status === 'succeeded') {
          await db.order.update({
            where: { id: order.id },
            data: { status: 'COMPLETED' }
          })
          console.log('Updated order:', order.id)
        }
      } catch (error) {
        console.error('Failed to check order:', order.id, error.message)
      }
    }
  }
}

processPendingOrders()
```

## 8. Monitoring & Alerts

### Add Webhook Monitoring
```typescript
// Create webhook monitoring endpoint
// File: app/api/admin/webhook-health/route.ts
export async function GET() {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const webhookStats = await db.$queryRaw`
    SELECT
      COUNT(*) as total_events,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_events,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_events
    FROM webhook_events
    WHERE created_at >= ${last24h}
  `

  return Response.json(webhookStats)
}
```

### Set Up Alerts
```typescript
// Add to webhook handler for critical failures
if (criticalError) {
  // Send alert to admin
  await sendAdminAlert({
    type: 'WEBHOOK_FAILURE',
    message: `Critical webhook failure: ${error.message}`,
    details: { eventId: event.id, eventType: event.type }
  })
}
```

This comprehensive guide should help you diagnose and resolve any Stripe webhook issues in English Unleashed.