import { Pack, Product } from '@prisma/client'

export interface PackWithProduct extends Pack {
  product: Product
}

export function getPackStatus(pack: PackWithProduct) {
  const isPreOrder = !pack.hasPdf || !pack.hasQuiz
  const isComplete = pack.hasPdf && pack.hasQuiz
  const hasSomething = pack.hasPdf || pack.hasQuiz

  return {
    isPreOrder,
    isComplete,
    hasSomething,
    availableContent: {
      video: true, // Always available
      pdf: pack.hasPdf,
      quiz: pack.hasQuiz
    },
    statusText: isComplete 
      ? 'Complete Pack' 
      : isPreOrder 
        ? 'Pre-Order - Video Available Now!'
        : 'Partial Content Available'
  }
}

export function getPackPrice(pack: PackWithProduct, isPreOrder: boolean) {
  // Could implement pre-order discounts here
  // For now, same price
  return pack.product.price
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}