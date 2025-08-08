import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            404
          </h1>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        <div className="space-y-4">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center rounded-full bg-gradient-primary text-white font-medium px-6 py-3 shadow-md hover:shadow-lg hover:opacity-90 transition-all"
          >
            Go Home
          </Link>
          
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full bg-white text-gray-700 font-medium px-4 py-2 border border-gray-300 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all text-sm"
            >
              Browse PDFs
            </Link>
            <Link
              href="/videos"
              className="inline-flex items-center justify-center rounded-full bg-white text-gray-700 font-medium px-4 py-2 border border-gray-300 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all text-sm"
            >
              Watch Videos
            </Link>
          </div>
        </div>

        <div className="mt-12">
          <p className="text-sm text-gray-500 mb-4">
            Lost? Here are some helpful links:
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/about" className="text-primary hover:text-primary-dark">
              About
            </Link>
            <Link href="/contact" className="text-primary hover:text-primary-dark">
              Contact
            </Link>
            <a 
              href="https://www.youtube.com/@EnglishPodcastUnleashed" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-dark"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}