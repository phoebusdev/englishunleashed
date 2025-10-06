import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { CheckoutClient } from '../../[packId]/CheckoutClient'

export default async function ProductCheckoutPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id: productId } = await params
  const session = await getServerSession(authOptions)

  // Get the product with its packs
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      packs: {
        orderBy: {
          order: 'asc'
        }
      }
    }
  })

  if (!product || !product.active) {
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

  // Use the first pack for checkout (or we could show a pack selector)
  const primaryPack = product.packs[0]

  if (!primaryPack) {
    redirect('/shop')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <CheckoutClient
          pack={primaryPack}
          product={product}
          userEmail={session?.user?.email}
          isProductCheckout={true}
        />
      </div>
    </div>
  )
}
