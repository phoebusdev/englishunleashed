import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gradient-light border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <h4 className="font-bold text-gray-900 mb-2">English Unleashed</h4>
            <p className="text-sm text-gray-600 mb-4">
              Digital Learning Resources
            </p>
            <p className="text-sm text-gray-600">
              Download PDFs to practice English every day. Premium learning materials designed to complement the English Unleashed YouTube channel and help you master daily conversations.
            </p>
            <div className="flex gap-4 mt-4">
              <a 
                href="https://www.youtube.com/@EnglishPodcastUnleashed" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                YouTube
              </a>
              <a 
                href="https://podcasts.apple.com/podcast/english-unleashed" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Podcast
              </a>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-gray-900 mb-4">Shop</h5>
            <ul className="space-y-2">
              <li><Link href="/shop" className="text-sm text-gray-600 hover:text-primary transition-colors">All PDFs</Link></li>
              <li><Link href="/shop?category=vocabulary" className="text-sm text-gray-600 hover:text-primary transition-colors">Daily Routines</Link></li>
              <li><Link href="/shop?category=conversation" className="text-sm text-gray-600 hover:text-primary transition-colors">Small Talk</Link></li>
              <li><Link href="/shop?category=pronunciation" className="text-sm text-gray-600 hover:text-primary transition-colors">Pronunciation</Link></li>
              <li><Link href="/shop?category=business" className="text-sm text-gray-600 hover:text-primary transition-colors">Business English</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-gray-900 mb-4">Support</h5>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-gray-600 hover:text-primary transition-colors">About</Link></li>
              <li><Link href="/videos" className="text-sm text-gray-600 hover:text-primary transition-colors">Videos</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-600 hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="text-sm text-gray-600 hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/privacy" className="text-sm text-gray-600 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-600 hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2024 English Unleashed. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <span className="text-sm text-gray-600">🎧 Listen on YouTube</span>
              <span className="text-sm text-gray-600">📚 Premium PDFs Available</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}