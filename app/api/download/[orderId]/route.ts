import { NextRequest , NextResponse } from 'next/server'
import { verifyDownloadToken } from 'lib/jwt'
import { prisma } from 'lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 })
  }

  try {
    // Get order with pack info
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        status: 'COMPLETED',
      },
      include: {
        product: {
          include: {
            packs: true,
          },
        },
        user: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Verify JWT token
    const payload = verifyDownloadToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }
    
    // Verify token matches this order
    if (payload.orderId !== order.id || payload.userId !== order.userId) {
      return NextResponse.json({ error: 'Token mismatch' }, { status: 401 })
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

    // Get the pack (assuming one pack per product for now)
    const pack = order.product.packs[0]
    if (!pack || !pack.pdfUrl) {
      return NextResponse.json(
        { error: 'PDF not available yet' },
        { status: 404 }
      )
    }

    // Track download analytics
    try {
      await prisma.downloadLog.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          packId: pack.id,
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown',
          referrer: req.headers.get('referer') || null,
          fileType: 'pdf',
          fileName: pack.title + '.pdf',
        }
      })
    } catch (error) {
      // Don't fail the download if analytics fails
      console.error('Failed to track download:', error)
    }

    // Redirect to the PDF URL
    return NextResponse.redirect(pack.pdfUrl)
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to process download' },
      { status: 500 }
    )
  }
}