/**
 * Server-side Stripe configuration following industry best practices
 * This file should only be imported in server components/API routes
 */

import Stripe from 'stripe'

// Validate environment variables at build time
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn('Warning: STRIPE_WEBHOOK_SECRET not set - webhooks will not work')
}

// Initialize Stripe with best practices configuration
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  
  // TypeScript configuration
  typescript: true,
  
  // Network configuration
  maxNetworkRetries: 2, // Stripe recommends 2 retries
  timeout: 80000, // 80 seconds (Stripe default)
  
  // Telemetry helps Stripe improve their service
  telemetry: true,
  
  // App info for Stripe dashboard
  appInfo: {
    name: 'English Unleashed',
    version: '1.0.0',
    url: 'https://englishunleashed.com',
  },
})

/**
 * Create a Stripe Checkout Session with best practices
 */
export interface CreateCheckoutSessionParams {
  productId: string
  priceInCents: number
  productName: string
  productDescription?: string
  customerEmail?: string
  userId?: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
  promoCode?: string
}

export async function createCheckoutSession({
  productId,
  priceInCents,
  productName,
  productDescription,
  customerEmail,
  userId,
  successUrl,
  cancelUrl,
  metadata = {},
  promoCode,
}: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  // Build line items
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price_data: {
        currency: 'gbp',
        product_data: {
          name: productName,
          description: productDescription,
          // Add images if available
          // images: ['https://example.com/image.jpg'],
        },
        unit_amount: priceInCents,
      },
      quantity: 1,
    },
  ]

  // Build session parameters
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    
    // Customer configuration
    customer_email: customerEmail,
    
    // Payment methods - let Stripe determine based on amount/region
    payment_method_types: ['card'],
    
    // Billing address collection (recommended for fraud prevention)
    billing_address_collection: 'auto',
    
    // Shipping address if needed for digital goods tax compliance
    // shipping_address_collection: {
    //   allowed_countries: ['GB', 'US', 'CA'],
    // },
    
    // Metadata for webhook processing
    metadata: {
      productId,
      userId: userId || 'guest',
      ...metadata,
    },
    
    // Locale detection
    locale: 'auto',
    
    // Tax collection (if configured in Stripe)
    automatic_tax: {
      enabled: false, // Enable when tax settings are configured
    },
    
    // Customer creation for guest checkouts
    customer_creation: customerEmail ? undefined : 'always',
    
    // Invoice creation for business customers
    invoice_creation: {
      enabled: false,
      invoice_data: {
        description: `Purchase of ${productName}`,
        metadata,
        custom_fields: null,
        footer: 'Thank you for your purchase!',
      },
    },
    
    // Consent collection for marketing
    consent_collection: {
      terms_of_service: 'required',
      // promotions: 'auto',
    },
    
    // Phone number collection (optional but useful for support)
    phone_number_collection: {
      enabled: false,
    },
    
    // Allow promotion codes
    allow_promotion_codes: true,
    
    // Submit type
    submit_type: 'pay',
    
    // Expiry (30 minutes default, max 24 hours)
    expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
  }

  // Apply promo code if provided
  if (promoCode) {
    // In production, you'd look up the Stripe promotion code ID
    // sessionParams.discounts = [{ promotion_code: 'promo_id' }]
  }

  return await stripe.checkout.sessions.create(sessionParams)
}

/**
 * Retrieve a checkout session with expansion
 */
export async function retrieveCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session | null> {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer', 'payment_intent'],
    })
  } catch (error) {
    console.error('Failed to retrieve checkout session:', error)
    return null
  }
}

/**
 * Create a payment intent for custom payment flows
 */
export async function createPaymentIntent({
  amount,
  currency = 'gbp',
  metadata = {},
  customerEmail,
}: {
  amount: number
  currency?: string
  metadata?: Record<string, string>
  customerEmail?: string
}): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    receipt_email: customerEmail,
    automatic_payment_methods: {
      enabled: true,
    },
    // Idempotency key should be passed via headers in the API route
  })
}

/**
 * Verify webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

/**
 * Cancel a payment intent
 */
export async function cancelPaymentIntent(
  paymentIntentId: string,
  reason?: string
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.cancel(paymentIntentId, {
    cancellation_reason: 'requested_by_customer',
  })
}

/**
 * Create a refund
 */
export async function createRefund({
  paymentIntentId,
  amount,
  reason,
}: {
  paymentIntentId: string
  amount?: number // Partial refund if specified
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
}): Promise<Stripe.Refund> {
  return await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount,
    reason,
  })
}

/**
 * List all products
 */
export async function listProducts(
  limit = 100
): Promise<Stripe.Product[]> {
  const products = await stripe.products.list({
    limit,
    active: true,
  })
  return products.data
}

/**
 * Create a customer
 */
export async function createCustomer({
  email,
  name,
  metadata = {},
}: {
  email: string
  name?: string
  metadata?: Record<string, string>
}): Promise<Stripe.Customer> {
  return await stripe.customers.create({
    email,
    name,
    metadata,
  })
}

/**
 * Create a Stripe Price (for subscription or one-time products)
 */
export async function createPrice({
  productId,
  unitAmount,
  currency = 'gbp',
  recurring,
}: {
  productId: string
  unitAmount: number
  currency?: string
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year'
    interval_count?: number
  }
}): Promise<Stripe.Price> {
  return await stripe.prices.create({
    product: productId,
    unit_amount: unitAmount,
    currency,
    recurring,
  })
}