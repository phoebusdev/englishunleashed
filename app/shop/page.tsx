'use client'

import { useState } from 'react'
import { ProductCard } from "components/ProductCard/ProductCard"
import { getProductsByCategory } from "data/products"

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'vocabulary', name: 'Vocabulary' },
  { id: 'conversation', name: 'Conversation' },
  { id: 'pronunciation', name: 'Pronunciation' },
  { id: 'business', name: 'Business' }
]

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const filteredProducts = getProductsByCategory(selectedCategory)

  return (
    <>
      <section className="bg-gradient-primary text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <span className="inline-block mb-4 text-sm font-medium text-white/90 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
            📚 Digital PDF Shop
          </span>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
            English PDF Materials
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Download PDF guides to practice English. Simple learning materials from English Unleashed.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-primary text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <p className="text-center mt-6 text-gray-600 font-medium">
              {filteredProducts.length} PDFs
            </p>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {filteredProducts.map((product) => (
                <div key={product.id} id={product.id}>
                  <ProductCard
                    title={product.title.replace(/ - English Unleashed.*$/, '')}
                    price={product.price}
                    category={product.category}
                    description={product.description}
                    href="#"
                    featured={product.featured}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No products found
                </h3>
                <p className="text-gray-600 mb-8">
                  Try adjusting your search criteria or browse all categories.
                </p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="px-8 py-3 bg-gradient-primary text-white rounded-full font-medium hover:opacity-90 transition-opacity"
                >
                  Show All PDFs
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}