import { prisma } from './db'

// Check for orders that need notifications when content is added
export async function notifyContentReady(packId: string, contentType: 'pdf' | 'quiz') {
  // Get the pack and its product
  const pack = await prisma.pack.findUnique({
    where: { id: packId },
    include: { product: true }
  })

  if (!pack) return

  // Find all completed orders for this product
  const orders = await prisma.order.findMany({
    where: {
      productId: pack.productId,
      status: 'COMPLETED',
      ...(contentType === 'pdf' 
        ? { notifiedPdfReady: false }
        : { notifiedQuizReady: false }
      )
    },
    include: { user: true }
  })

  // In a real implementation, you'd send emails here
  // For now, we'll just update the notification status
  const orderIds = orders.map(order => order.id)
  
  if (orderIds.length > 0) {
    await prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: contentType === 'pdf' 
        ? { notifiedPdfReady: true }
        : { notifiedQuizReady: true }
    })
  }

  console.log(`Notified ${orders.length} users that ${contentType} is ready for ${pack.title}`)
  
  // Return the list of users notified (for admin dashboard)
  return orders.map(order => ({
    email: order.user.email,
    orderId: order.id,
    userId: order.userId
  }))
}