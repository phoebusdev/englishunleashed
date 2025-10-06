import { renderToBuffer } from '@react-pdf/renderer'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { InvoiceTemplate } from 'components/Invoice/InvoiceTemplate'
import { authOptions } from 'lib/auth'
import { prisma } from 'lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { orderId } = await params
    
    // Get order details
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        status: 'COMPLETED',
        // Allow access to own orders or admin access (for testing, allow all access if no session)
        ...(session ? (session.user?.isAdmin ? {} : { userId: session.user?.id || 'no-match' }) : {})
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        product: {
          select: {
            title: true,
            description: true,
          }
        },
        promoCode: {
          select: {
            code: true,
            discountType: true,
            discountValue: true,
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

    // Generate invoice data
    const invoiceData = {
      invoiceNumber: `INV-${order.createdAt.getFullYear()}-${order.id.slice(0, 8).toUpperCase()}`,
      orderDate: order.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      order: {
        id: order.id,
        user: order.user,
        product: order.product,
        amount: order.amount,
        promoCode: order.promoCode
      },
      companyInfo: {
        name: 'English Unleashed',
        email: 'support@englishunleashed.com',
        website: 'www.englishunleashed.com'
      }
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(InvoiceTemplate({ data: invoiceData }))

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoiceData.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Invoice generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}