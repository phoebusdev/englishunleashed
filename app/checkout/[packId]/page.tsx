import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { CheckoutClient } from './CheckoutClient'

export default async function CheckoutPage({ 
  params 
}: { 
  params: Promise<{ packId: string }> 
}) {
  const { packId } = await params
  const session = await getServerSession(authOptions)
  
  // Get the pack/product
  const pack = await prisma.pack.findUnique({
    where: { id: packId },
    include: {
      product: true
    }
  })

  if (!pack || !pack.product) {
    redirect('/shop')
  }

  // If product has a Stripe payment link, use that
  if (pack.product.stripePaymentLinkUrl) {
    // If user is logged in, append their email to the payment link
    const paymentUrl = new URL(pack.product.stripePaymentLinkUrl)
    if (session?.user?.email) {
      paymentUrl.searchParams.set('prefilled_email', session.user.email)
    }
    redirect(paymentUrl.toString())
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <CheckoutClient pack={pack} product={pack.product} userEmail={session?.user?.email} />
      </div>
    </div>
  )
}