import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { env } from 'env.mjs'
import { generateDownloadToken } from '@/lib/jwt'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  // Check if Stripe is configured
  if (!stripe) {
    console.error('Stripe is not configured for webhook processing')
    return NextResponse.json(
      { error: 'Payment system not configured' },
      { status: 503 }
    )
  }

  // Check if webhook secret is configured
  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 503 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Debug logging
        console.log('[Webhook] Session details:', {
          id: session.id,
          payment_status: session.payment_status,
          payment_link: session.payment_link,
          metadata: session.metadata,
          customer_email: session.customer_email
        })

        // Get pack ID from metadata (handle both packId and packIds for backwards compatibility)
        let packId = session.metadata?.packId
        if (!packId && session.metadata?.packIds) {
          // Handle comma-separated packIds (use first pack)
          const packIds = session.metadata.packIds.split(',')
          packId = packIds[0]
        }

        // If no packId in metadata, try to find product by payment link ID
        if (!packId && session.payment_link) {
          // Handle both string ID and expanded object
          const paymentLinkId = typeof session.payment_link === 'string'
            ? session.payment_link
            : session.payment_link.id

          console.log('[Webhook] No packId in metadata, looking up by payment link:', paymentLinkId)

          const product = await prisma.product.findFirst({
            where: { stripePaymentLinkId: paymentLinkId },
            include: { packs: { orderBy: { order: 'asc' } } }
          })

          if (product && product.packs.length > 0) {
            packId = product.packs[0].id
            console.log('[Webhook] Found pack via payment link:', packId)
          } else {
            console.log('[Webhook] No product found with stripePaymentLinkId:', paymentLinkId)
          }
        }

        if (!packId) {
          console.error('[Webhook] No packId in session metadata or payment link')
          return NextResponse.json({ error: 'Missing packId' }, { status: 400 })
        }

        // Get pack and product
        const pack = await prisma.pack.findUnique({
          where: { id: packId },
          include: { product: true }
        })

        if (!pack) {
          console.error('Pack not found:', packId)
          return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
        }

        // Check if we have a userId in metadata (authenticated user)
        let user
        if (session.metadata?.userId) {
          user = await prisma.user.findUnique({
            where: { id: session.metadata.userId }
          })
        }
        
        // If no authenticated user, create or find by email
        if (!user) {
          user = await prisma.user.findUnique({
            where: { email: session.customer_email! }
          })
          
          if (!user) {
            // Create guest user
            user = await prisma.user.create({
              data: {
                email: session.customer_email!,
                name: session.customer_details?.name || null,
              }
            })
          }
        }

        // Create order
        const order = await prisma.order.create({
          data: {
            userId: user.id,
            productId: pack.productId,
            amount: session.amount_total!,
            status: 'COMPLETED',
            stripeId: session.id,
            // Set download expiry for 24 hours if guest
            downloadExpiry: user.password ? null : new Date(Date.now() + 24 * 60 * 60 * 1000),
            metadata: JSON.stringify({
              customerEmail: session.customer_email,
              paymentLinkId: session.metadata?.paymentLinkId,
            })
          }
        })

        console.log('Order created:', order.id)
        
        // Generate secure download token
        const downloadToken = generateDownloadToken(
          order.id,
          user.id,
          pack.id,
          user.password ? '7d' : '24h' // 7 days for registered users, 24h for guests
        )
        
        // Generate download URL with JWT token
        const baseUrl = env.NEXTAUTH_URL || 'http://localhost:3000'
        const downloadUrl = `${baseUrl}/api/download/${order.id}?token=${downloadToken}`
        
        // Send purchase confirmation email
        const { sendPurchaseEmail } = await import('@/lib/email')
        const customerEmail = session.customer_email!
        
        await sendPurchaseEmail(customerEmail, {
          packTitle: pack.title,
          amount: `£${(session.amount_total! / 100).toFixed(2)}`,
          hasAccount: !!user.password,
          downloadUrl: user.password ? undefined : downloadUrl // Only include for guests
        })
        break
      }

      case 'payment_link.created':
      case 'payment_link.updated': {
        // Handle payment link events if needed
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}