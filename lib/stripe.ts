import Stripe from 'stripe'

// Use process.env directly to avoid validation issues during initialization
const stripeKey = process.env.STRIPE_SECRET_KEY || ''

if (!stripeKey || stripeKey === '') {
  console.error('Warning: STRIPE_SECRET_KEY is not set. Stripe functionality will not work.')
}

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-11-20.acacia',
})

interface CreatePaymentLinkParams {
  productName: string
  price: number // in cents
  packId: string
  promoCode?: string
}

export async function createPaymentLink({
  productName,
  price,
  packId,
  promoCode
}: CreatePaymentLinkParams) {
  try {
    // Create a Stripe product
    const product = await stripe.products.create({
      name: productName,
      metadata: {
        packId,
      }
    })

    // Create a price for the product
    const priceObj = await stripe.prices.create({
      product: product.id,
      unit_amount: price,
      currency: 'gbp',
    })

    // Create payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{
        price: priceObj.id,
        quantity: 1,
      }],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/success?packId=${packId}`,
        },
      },
      metadata: {
        packId,
        promoCode: promoCode || '',
      },
      // Allow promo codes if configured
      allow_promotion_codes: true,
    })

    return {
      url: paymentLink.url,
      id: paymentLink.id,
    }
  } catch (error) {
    console.error('Error creating payment link:', error)
    throw error
  }
}

// Update payment link (e.g., when pack details change)
export async function updatePaymentLink(
  paymentLinkId: string,
  active: boolean
) {
  try {
    const updated = await stripe.paymentLinks.update(paymentLinkId, {
      active,
    })
    return updated
  } catch (error) {
    console.error('Error updating payment link:', error)
    throw error
  }
}