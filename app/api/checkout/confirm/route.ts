import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentIntentId, email } = body

    console.log('Confirming payment intent:', paymentIntentId)

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID required' },
        { status: 400 }
      )
    }

    // Get the session from Next-Auth if available
    const authSession = await getServerSession(authOptions)

    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Get pack ID from metadata
    const packId = paymentIntent.metadata?.packId
    
    // Check if order already exists
    const existingOrder = await prisma.order.findFirst({
      where: { stripeId: paymentIntentId }
    })

    if (existingOrder) {
      const existingPack = await prisma.pack.findUnique({
        where: { id: packId },
        include: { 
          product: true,
          quiz: true
        }
      })
      
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
    
    if (!packId) {
      return NextResponse.json(
        { error: 'Invalid payment metadata' },
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
    
    // Second priority: user ID from payment intent metadata
    if (!user && paymentIntent.metadata?.userId) {
      user = await prisma.user.findUnique({
        where: { id: paymentIntent.metadata.userId }
      })
    }
    
    // Third priority: find or create by email (from payment method or provided email)
    const customerEmail = email || paymentIntent.receipt_email
    
    if (!user && customerEmail) {
      user = await prisma.user.findUnique({
        where: { email: customerEmail }
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: customerEmail,
            name: null,
          }
        })
      }
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user?.id || null,
        customerEmail: user ? null : customerEmail,
        productId: pack.productId,
        amount: paymentIntent.amount,
        status: 'COMPLETED',
        stripeId: paymentIntentId,
        // Set download expiry for 24 hours if guest
        downloadExpiry: user?.password ? null : new Date(Date.now() + 24 * 60 * 60 * 1000),
        metadata: JSON.stringify({
          customerEmail: customerEmail,
          packId: packId,
        })
      }
    })

    // Send purchase confirmation email
    try {
      const emailToSend = user?.email || customerEmail
      if (emailToSend && emailToSend !== 'guest@example.com') {
        const { sendPurchaseEmail } = await import('@/lib/email')
        await sendPurchaseEmail(emailToSend, {
          packTitle: pack.title,
          amount: `£${(paymentIntent.amount / 100).toFixed(2)}`,
          hasAccount: !!user?.password,
        })
      }
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
    console.error('Payment confirmation error:', error)
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}