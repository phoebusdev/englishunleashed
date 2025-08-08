import Link from 'next/link'

export default function PublicNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="relative">
            <div className="text-[150px] font-bold text-gray-200 leading-none">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Oops!
              </span>
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          This page doesn't exist
        </h1>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Looks like you've followed a broken link or entered a URL that doesn't exist on our site.
        </p>

        <div className="bg-gradient-to-br from-teal-50 to-pink-50 rounded-2xl p-8 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">
            Try these instead:
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/shop"
              className="bg-white rounded-lg p-4 hover:shadow-md transition-all group"
            >
              <div className="text-2xl mb-2">📚</div>
              <div className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                PDF Shop
              </div>
            </Link>
            <Link
              href="/videos"
              className="bg-white rounded-lg p-4 hover:shadow-md transition-all group"
            >
              <div className="text-2xl mb-2">🎥</div>
              <div className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                Video Library
              </div>
            </Link>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-gradient-primary text-white font-medium px-8 py-3 shadow-md hover:shadow-lg hover:opacity-90 transition-all"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  )
}