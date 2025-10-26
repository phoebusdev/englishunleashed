/**
 * Admin Pack API - Single Pack Operations
 * Spec: specs/001-admin-dashboard-rebuild/specification.md#api-design
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = params

    // Get pack with product info
    const pack = await prisma.pack.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            _count: {
              select: {
                orders: true,
                promoCodes: true
              }
            }
          }
        }
      }
    })

    if (!pack) {
      return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
    }

    // Check if product has orders - prevent deletion to preserve purchase history
    if (pack.product._count.orders > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete pack with existing orders',
          details: `This pack has ${pack.product._count.orders} order(s). Mark the product as inactive instead.`
        },
        { status: 400 }
      )
    }

    // Check if product has promo codes
    if (pack.product._count.promoCodes > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete pack with promo codes',
          details: 'Remove associated promo codes first.'
        },
        { status: 400 }
      )
    }

    // Use transaction to ensure both delete or both rollback
    await prisma.$transaction([
      // Delete pack first (cascade deletes quiz and questions)
      prisma.pack.delete({
        where: { id }
      }),
      // Then delete product
      prisma.product.delete({
        where: { id: pack.product.id }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting pack:', error)
    return NextResponse.json(
      { error: 'Failed to delete pack' },
      { status: 500 }
    )
  }
}
