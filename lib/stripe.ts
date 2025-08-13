import Stripe from 'stripe'

// Use process.env directly to avoid validation issues during initialization
const stripeKey = process.env.STRIPE_SECRET_KEY

// Initialize Stripe only if we have a valid key
let stripe: Stripe | null = null

if (stripeKey && stripeKey.length > 0) {
  // Validate the key format (basic check)
  if (!stripeKey.startsWith('sk_')) {
    console.warn('Warning: STRIPE_SECRET_KEY does not start with "sk_". Make sure you are using the correct secret key.')
  }
  
  try {
    stripe = new Stripe(stripeKey, {
      apiVersion: '2024-11-20.acacia',
      maxNetworkRetries: 3,
      timeout: 10000, // 10 seconds
    })
    console.log('✅ Stripe initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize Stripe:', error)
    stripe = null
  }
} else {
  console.warn('⚠️ STRIPE_SECRET_KEY is not set. Stripe functionality will be disabled.')
}

// Helper function to check if Stripe is configured
export function isStripeConfigured(): boolean {
  return stripe !== null
}

// Export a safe stripe object that checks for null
export { stripe }

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
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }
  
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
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }
  
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