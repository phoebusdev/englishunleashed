import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    console.log('Verifying checkout session:', sessionId)

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }

    // Get the session from Next-Auth if available
    const authSession = await getServerSession(authOptions)

    // Retrieve the Stripe session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items']
    })

    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Get pack IDs from metadata - handle both single packId and multiple packIds
    const packIds = stripeSession.metadata?.packIds?.split(',') || []
    let packId = packIds[0] // Use first pack as primary

    // Check if order already exists (to prevent duplicate processing)
    const existingOrder = await prisma.order.findFirst({
      where: { stripeId: sessionId }
    })

    if (existingOrder) {
      // Get pack info for existing order
      const existingPack = packId ? await prisma.pack.findUnique({
        where: { id: packId },
        include: {
          product: true,
          quiz: true
        }
      }) : null

      return NextResponse.json({
        success: true,
        order: {
          id: existingOrder.id,
          amount: existingOrder.amount,
          downloadExpiry: existingOrder.downloadExpiry,
          productTitle: existingPack?.product?.title,
          hasQuiz: !!existingPack?.quiz
        },
        message: 'Order already processed'
      })
    }

    // If no packId in metadata, try to find product by payment link ID
    if (!packId && stripeSession.payment_link) {
      console.log('No packId in metadata, looking up by payment link:', stripeSession.payment_link)

      const product = await prisma.product.findFirst({
        where: { stripePaymentLinkId: stripeSession.payment_link as string },
        include: { packs: { orderBy: { order: 'asc' } } }
      })

      if (product && product.packs.length > 0) {
        packId = product.packs[0].id
        console.log('Found pack via payment link:', packId)
      }
    }

    if (!packId) {
      return NextResponse.json(
        { error: 'Invalid session metadata - no pack ID found' },
        { status: 400 }
      )
    }

    // Get pack and product with quiz information
    const pack = await prisma.pack.findUnique({
      where: { id: packId },
      include: { 
        product: true,
        quiz: true
      }
    })

    if (!pack) {
      return NextResponse.json(
        { error: 'Pack not found' },
        { status: 404 }
      )
    }

    // Create or get user
    let user
    
    // First priority: authenticated user from session
    if (authSession?.user?.id) {
      user = await prisma.user.findUnique({
        where: { id: authSession.user.id }
      })
    }
    
    // Second priority: user ID from Stripe metadata (if user was authenticated during checkout)
    if (!user && stripeSession.metadata?.userId) {
      user = await prisma.user.findUnique({
        where: { id: stripeSession.metadata.userId }
      })
    }
    
    // Third priority: find or create by email
    if (!user) {
      const customerEmail = stripeSession.customer_email || stripeSession.customer_details?.email
      if (!customerEmail) {
        return NextResponse.json(
          { error: 'Customer email not found' },
          { status: 400 }
        )
      }

      user = await prisma.user.findUnique({
        where: { email: customerEmail }
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: customerEmail,
            name: stripeSession.customer_details?.name || null,
          }
        })
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        productId: pack.productId,
        amount: stripeSession.amount_total || 0,
        status: 'COMPLETED',
        stripeId: sessionId,
        // Set download expiry for 24 hours if guest
        downloadExpiry: user.password ? null : new Date(Date.now() + 24 * 60 * 60 * 1000),
        metadata: JSON.stringify({
          customerEmail: stripeSession.customer_email,
          packId: packId,
          packIds: packIds, // Store all pack IDs for reference
        })
      }
    })

    // Send purchase confirmation email
    try {
      const { sendPurchaseEmail } = await import('@/lib/email')
      await sendPurchaseEmail(user.email, {
        packTitle: pack.title,
        amount: `£${((stripeSession.amount_total || 0) / 100).toFixed(2)}`,
        hasAccount: !!user.password,
      })
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
      // Don't fail the order because of email issues
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        downloadExpiry: order.downloadExpiry,
        productTitle: pack.product?.title,
        hasQuiz: !!pack.quiz
      },
      message: 'Order created successfully'
    })

  } catch (error) {
    console.error('Checkout verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify checkout' },
      { status: 500 }
    )
  }
}