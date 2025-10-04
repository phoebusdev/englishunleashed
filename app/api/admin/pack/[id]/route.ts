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

    // Get pack to find product ID
    const pack = await prisma.pack.findUnique({
      where: { id },
      select: { productId: true }
    })

    if (!pack) {
      return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
    }

    // Delete pack (cascade deletes quiz and questions)
    await prisma.pack.delete({
      where: { id }
    })

    // Delete associated product
    await prisma.product.delete({
      where: { id: pack.productId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting pack:', error)
    return NextResponse.json(
      { error: 'Failed to delete pack' },
      { status: 500 }
    )
  }
}
