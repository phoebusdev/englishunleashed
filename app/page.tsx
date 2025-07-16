import { Metadata } from "next"
import { Button } from "components/Button/Button"
import { ProductCard } from "components/ProductCard/ProductCard"
import { getFeaturedProducts } from "data/products"

export const metadata: Metadata = {
  title: "English Unleashed - Learn English with PDFs",
  description: "Simple, clear English learning materials you can download and use anywhere. Learn with our proven shadowing method.",
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    url: "https://englishunleashed.com/",
    title: "English Unleashed - Learn English with PDFs",
    description: "Simple, clear English learning materials you can download and use anywhere.",
  },
}

export default function Web() {
  const featuredProduct = getFeaturedProducts()[0]
  
  return (
    <>
      <section className="relative bg-gradient-primary text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center lg:py-32">
          <div className="mx-auto max-w-3xl">
            <span className="inline-block mb-4 text-sm font-medium text-white/90 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              🎧 English Unleashed: The Podcast
            </span>
            <h1 className="mb-6 text-4xl leading-tight font-bold tracking-tight md:text-5xl xl:text-7xl">
              Learn English<br />with PDFs
            </h1>
            <p className="mb-8 text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto">
              Simple, clear English learning materials you can download and use anywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href={`/shop#${featuredProduct.id}`} intent="secondary" size="lg" className="bg-white text-gray-800 hover:bg-gray-100">
                Get One PDF - {featuredProduct.price}
              </Button>
              <Button href="/shop" size="lg" className="bg-white/20 text-white border-2 border-white/50 hover:bg-white/30 backdrop-blur-sm">
                Shop All PDFs
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <section className="bg-gradient-light">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Start Learning Today
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Download our most popular English learning PDF
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <ProductCard
              title={featuredProduct.title.replace(' - English Unleashed Edition', '')}
              price={featuredProduct.price}
              category={featuredProduct.category}
              description={featuredProduct.description}
              href={`/shop#${featuredProduct.id}`}
              featured={true}
            />
            <div className="text-center mt-8">
              <a href="/shop" className="inline-flex items-center text-primary hover:text-secondary font-medium transition-colors">
                See All PDFs 
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
