import { Metadata } from "next"
import { Footer } from "components/Footer/Footer"
import { Navigation } from "components/Navigation/Navigation"
import "styles/tailwind.css"
import { ThemeProvider } from "./providers"

export const metadata: Metadata = {
  metadataBase: new URL('https://englishunleashed.com'),
  title: {
    default: 'English Unleashed - Learn English with PDFs & Videos',
    template: '%s | English Unleashed'
  },
  description: 'Master English with our podcast transcripts, vocabulary guides, and shadowing exercises. Premium PDFs and YouTube videos for daily conversation practice.',
  keywords: ['learn English', 'English podcasts', 'English PDFs', 'vocabulary guides', 'conversation practice', 'English shadowing'],
  authors: [{ name: 'English Unleashed' }],
  creator: 'English Unleashed',
  publisher: 'English Unleashed',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://englishunleashed.com',
    siteName: 'English Unleashed',
    title: 'English Unleashed - Learn English with PDFs & Videos',
    description: 'Master English with our podcast transcripts, vocabulary guides, and shadowing exercises.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'English Unleashed - Learn English with PDFs & Videos',
    description: 'Master English with our podcast transcripts, vocabulary guides, and shadowing exercises.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Open+Sans:wght@300;400;600&family=Lora:wght@400;500&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <Navigation />
          <main className="min-h-screen pt-16">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
