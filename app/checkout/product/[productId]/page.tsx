import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { CheckoutClient } from '../../[packId]/CheckoutClient'

export default async function ProductCheckoutPage({ 
  params 
}: { 
  params: Promise<{ productId: string }> 
}) {
  const { productId } = await params
  const session = await getServerSession(authOptions)
  
  // Get the product with all its packs
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      packs: {
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!product || !product.active || product.packs.length === 0) {
    redirect('/shop')
  }

  // If product has a valid Stripe payment link, use that
  if (product.stripePaymentLinkUrl && 
      product.stripePaymentLinkUrl.startsWith('https://buy.stripe.com/') &&
      !product.stripePaymentLinkUrl.includes('test_sample')) {
    // If user is logged in, append their email to the payment link
    const paymentUrl = new URL(product.stripePaymentLinkUrl)
    if (session?.user?.email) {
      paymentUrl.searchParams.set('prefilled_email', session.user.email)
    }
    redirect(paymentUrl.toString())
  }

  // For now, we'll use the first pack as the primary one
  // In the future, this could be enhanced to handle multiple packs
  const primaryPack = product.packs[0]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <CheckoutClient 
          pack={{
            id: primaryPack.id,
            title: product.title,
            description: product.description || `Includes ${product.packs.length} pack${product.packs.length > 1 ? 's' : ''}: ${product.packs.map(p => p.title).join(', ')}`
          }} 
          product={{
            id: product.id,
            price: product.price
          }} 
          userEmail={session?.user?.email}
          isProductCheckout={true}
        />
      </div>
    </div>
  )
}