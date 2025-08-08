import { Metadata } from "next"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Shop Test - English Learning Materials",
  description: "Test shop page without database",
}

export default async function ShopTestPage() {
  let products: any[] = []
  let error: string | null = null
  
  try {
    // Try dynamic import to avoid build issues
    const { prisma } = await import('@/lib/db')
    
    products = await prisma.product.findMany({
      where: {
        active: true
      },
      include: {
        packs: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  } catch (e: any) {
    console.error('Shop page error:', e)
    error = e.message
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Shop Test Page
          </h1>
          <p className="text-lg text-gray-600">
            Testing database connection
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            <h3 className="font-bold">Database Error:</h3>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-6">
              <p>✅ Database connected successfully</p>
              <p>Found {products.length} products</p>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No products available</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-3">
                        {product.title}
                      </h3>
                      
                      {product.description && (
                        <p className="text-gray-600 text-sm mb-4">
                          {product.description}
                        </p>
                      )}

                      <div className="mb-4">
                        <p className="text-sm text-gray-700">
                          Includes {product.packs.length} packs
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">
                          £{(product.price / 100).toFixed(2)}
                        </span>
                        <Link
                          href={`/checkout/${product.packs[0]?.id || product.id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Buy Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}