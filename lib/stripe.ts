import Stripe from 'stripe'
import { env } from 'env.mjs'

export const stripe = new Stripe(env.STRIPE_SECRET_KEY || '', {
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
          url: `${env.NEXTAUTH_URL}/success?packId=${packId}`,
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