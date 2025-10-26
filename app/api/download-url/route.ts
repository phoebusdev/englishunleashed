import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateDownloadToken } from '@/lib/jwt'
import { env } from 'env.mjs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json() as { orderId?: string; packId?: string }
    const { orderId, packId } = body

    if (!orderId || !packId) {
      return NextResponse.json(
        { error: 'Missing orderId or packId' },
        { status: 400 }
      )
    }

    // Verify user owns this order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
        status: 'COMPLETED'
      },
      include: {
        product: {
          include: {
            packs: true
          }
        },
        user: {
          select: {
            password: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or access denied' },
        { status: 404 }
      )
    }

    // Verify the pack belongs to this product
    const packBelongsToProduct = order.product.packs.some((p: any) => p.id === packId)
    if (!packBelongsToProduct) {
      return NextResponse.json(
        { error: 'Pack not found in this order' },
        { status: 404 }
      )
    }

    // Check if download has expired for guest users
    if (!order.user.password && order.downloadExpiry) {
      if (new Date() > order.downloadExpiry) {
        return NextResponse.json(
          { error: 'Download link expired. Please create an account for permanent access.' },
          { status: 410 }
        )
      }
    }

    // Generate secure download token
    // 7 days for registered users, 24h for guests
    const expiresIn = order.user.password ? '7d' : '24h'
    const downloadToken = generateDownloadToken(
      order.id,
      session.user.id,
      packId,
      expiresIn
    )

    // Generate download URL
    const baseUrl = env.NEXTAUTH_URL || 'http://localhost:3000'
    const downloadUrl = `${baseUrl}/api/download/${order.id}?token=${downloadToken}&packId=${packId}`

    return NextResponse.json({
      downloadUrl,
      expiresIn
    })
  } catch (error) {
    console.error('Download URL generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    )
  }
}
