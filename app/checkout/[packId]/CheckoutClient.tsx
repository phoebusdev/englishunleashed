'use client'

import { StripeCheckout } from '@/components/StripeCheckout'

interface CheckoutClientProps {
  pack: {
    id: string
    title: string
    description: string | null
  }
  product: {
    id: string
    price: number
  }
  userEmail?: string
  isProductCheckout?: boolean
}

export function CheckoutClient({ pack, product, userEmail, isProductCheckout }: CheckoutClientProps) {
  return (
    <StripeCheckout 
      packId={pack.id}
      packTitle={pack.title}
      packDescription={pack.description || undefined}
      packPrice={product.price}
      productId={isProductCheckout ? product.id : undefined}
    />
  )
}