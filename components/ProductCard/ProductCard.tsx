import { Button } from 'components/Button/Button'

interface ProductCardProps {
  title: string
  price: string
  category: string
  description: string
  href?: string
  featured?: boolean
}

export function ProductCard({ title, price, category, description, href = '#', featured = false }: ProductCardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-8 transition-all hover:shadow-xl ${featured ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
      {featured && (
        <span className="inline-block bg-gradient-primary text-white text-xs px-3 py-1 rounded-full mb-4 font-medium">
          Featured Product
        </span>
      )}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 capitalize">{category}</span>
          <span className="text-2xl font-bold text-primary">{price}</span>
        </div>
      </div>
      <p className="text-gray-600 mb-6 text-sm leading-relaxed line-clamp-3">{description}</p>
      <Button href={href} className="w-full" intent="primary">
        Download Now
      </Button>
    </div>
  )
}