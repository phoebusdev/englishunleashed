import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createPaymentLink } from '@/lib/stripe'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json() as {
      title: string
      description?: string
      videoUrl?: string
      videoId?: string
      price: number
    }
    const { title, description, videoUrl, videoId, price } = body

    // Create product
    const product = await prisma.product.create({
      data: {
        title,
        description: description || '',
        price,
        type: 'PACK',
        active: true,
      }
    })

    // Create pack
    const pack = await prisma.pack.create({
      data: {
        productId: product.id,
        title,
        description: description || '',
        videoId: videoId || null,
        videoUrl: videoUrl || null,
        hasPdf: false,
        hasQuiz: false,
      }
    })

    // Create Stripe payment link
    try {
      const paymentLink = await createPaymentLink({
        productName: title,
        price,
        packId: pack.id,
      })

      // Update product with payment link
      await prisma.product.update({
        where: { id: product.id },
        data: {
          stripePaymentLinkId: paymentLink.id,
          stripePaymentLinkUrl: paymentLink.url,
        }
      })
    } catch (stripeError) {
      console.error('Stripe error:', stripeError)
      // Continue even if Stripe fails - admin can retry later
    }

    return NextResponse.json({ pack })
  } catch (error) {
    console.error('Error creating pack:', error)
    return NextResponse.json(
      { error: 'Failed to create pack' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json() as {
      id: string
      title: string
      description?: string
      videoUrl?: string
      videoId?: string
      price: number
    }
    const { id, title, description, videoUrl, videoId, price } = body

    // Update pack
    const pack = await prisma.pack.update({
      where: { id },
      data: {
        title,
        description: description || '',
        videoId: videoId || null,
        videoUrl: videoUrl || null,
      },
      include: { product: true }
    })

    // Update product
    await prisma.product.update({
      where: { id: pack.productId },
      data: {
        title,
        description: description || '',
        price,
      }
    })

    return NextResponse.json({ pack })
  } catch (error) {
    console.error('Error updating pack:', error)
    return NextResponse.json(
      { error: 'Failed to update pack' },
      { status: 500 }
    )
  }
}