/**
 * Modern Stripe Webhook Handler
 * Following security best practices
 */

import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { constructWebhookEvent } from '@/lib/stripe-server'
import { sendPurchaseEmail } from '@/lib/email'
import { generateDownloadToken } from '@/lib/jwt'

// Webhook endpoint secret from Stripe Dashboard
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  // Verify webhook secret is configured
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    )
  }
  
  // Get raw body and signature
  const body = await request.text()
  const signature = headers().get('stripe-signature')
  
  if (!signature) {
    console.error('No stripe-signature header')
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }
  
  let event: Stripe.Event
  
  try {
    // Verify webhook signature and construct event
    event = constructWebhookEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }
  
  // Log event for monitoring
  console.log('Webhook event received:', {
    id: event.id,
    type: event.type,
    created: new Date(event.created * 1000).toISOString(),
  })
  
  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
        
      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session)
        break
        
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
        
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // Handle subscription events if needed
        console.log('Subscription event:', event.type)
        break
        
      default:
        console.log('Unhandled event type:', event.type)
    }
    
    // Return success response
    return NextResponse.json(
      { received: true, processed: event.type },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Webhook processing error:', error)
    
    // Return success to prevent Stripe retries for processing errors
    // Log the error for manual investigation
    return NextResponse.json(
      { received: true, error: 'Processing failed but acknowledged' },
      { status: 200 }
    )
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing successful checkout:', session.id)
  
  // Extract metadata
  const { productId, packIds, userId } = session.metadata || {}
  
  if (!productId) {
    console.error('No productId in session metadata:', session.id)
    return
  }
  
  // Get or create user
  let user = null
  
  if (userId && userId !== 'guest') {
    user = await prisma.user.findUnique({
      where: { id: userId }
    })
  }
  
  // If no user found, create/find by email
  if (!user && session.customer_email) {
    user = await prisma.user.findUnique({
      where: { email: session.customer_email }
    })
    
    if (!user) {
      // Create guest user
      user = await prisma.user.create({
        data: {
          email: session.customer_email,
          name: session.customer_details?.name || null,
        }
      })
      console.log('Created guest user:', user.id)
    }
  }
  
  if (!user) {
    console.error('Could not find or create user for session:', session.id)
    return
  }
  
  // Check if order already exists (idempotency)
  const existingOrder = await prisma.order.findFirst({
    where: {
      stripeId: session.id
    }
  })
  
  if (existingOrder) {
    console.log('Order already exists:', existingOrder.id)
    return
  }
  
  // Create order
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      productId: productId,
      amount: session.amount_total || 0,
      status: 'COMPLETED',
      stripeId: session.id,
      // Set download expiry for guests (24 hours)
      downloadExpiry: user.password ? null : new Date(Date.now() + 24 * 60 * 60 * 1000),
      metadata: JSON.stringify({
        sessionId: session.id,
        paymentIntentId: session.payment_intent,
        customerEmail: session.customer_email,
        customerName: session.customer_details?.name,
        packIds: packIds?.split(',') || [],
      }),
    }
  })
  
  console.log('Order created:', order.id)
  
  // Get product details for email
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      packs: true
    }
  })
  
  if (!product) {
    console.error('Product not found:', productId)
    return
  }
  
  // Generate download token for guest users
  let downloadUrl: string | undefined
  
  if (!user.password && packIds) {
    const primaryPackId = packIds.split(',')[0]
    const downloadToken = generateDownloadToken(
      order.id,
      user.id,
      primaryPackId,
      '24h'
    )
    
    const baseUrl = process.env.NEXTAUTH_URL || 'https://englishunleashed.com'
    downloadUrl = `${baseUrl}/download?token=${downloadToken}`
  }
  
  // Send purchase confirmation email
  try {
    await sendPurchaseEmail(session.customer_email!, {
      packTitle: product.title,
      amount: `£${(session.amount_total! / 100).toFixed(2)}`,
      hasAccount: !!user.password,
      downloadUrl,
    })
    console.log('Purchase email sent to:', session.customer_email)
  } catch (error) {
    console.error('Failed to send purchase email:', error)
  }
  
  // Update analytics if needed
  // await updatePurchaseAnalytics(order, session)
}

/**
 * Handle expired checkout session
 */
async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  console.log('Checkout session expired:', session.id)
  
  // Could track abandoned carts here
  // await trackAbandonedCart(session)
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent succeeded:', paymentIntent.id)
  
  // This is usually handled via checkout.session.completed
  // But can be used for custom payment flows
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent failed:', paymentIntent.id)
  
  // Update order status if exists
  const order = await prisma.order.findFirst({
    where: {
      stripeId: paymentIntent.id
    }
  })
  
  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: { 
        status: 'FAILED',
        metadata: JSON.stringify({
          ...JSON.parse(order.metadata || '{}'),
          failureReason: paymentIntent.last_payment_error?.message,
          failedAt: new Date().toISOString(),
        })
      }
    })
    
    console.log('Order marked as failed:', order.id)
  }
}

// Disable body parsing for webhooks (need raw body)
export const config = {
  api: {
    bodyParser: false,
  },
}