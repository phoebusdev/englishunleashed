import "styles/tailwind.css"
import "styles/globals.css"
import { Metadata } from "next"
import { ThemeProvider, AuthProvider } from "./providers"
import { Navigation } from "../components/Navigation"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://englishunleashed.com'),
  title: {
    default: 'English Unleashed - Learn English with PDFs',
    template: '%s | English Unleashed'
  },
  description: 'Simple, clear English learning materials. Learn with PDFs, videos, and quizzes using our proven shadowing method.',
  keywords: ['english learning', 'pdf courses', 'english videos', 'shadowing method', 'learn english online'],
  authors: [{ name: 'English Unleashed' }],
  creator: 'English Unleashed',
  publisher: 'English Unleashed',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'English Unleashed',
    title: 'English Unleashed - Learn English with PDFs',
    description: 'Simple, clear English learning materials. Learn with PDFs, videos, and quizzes using our proven shadowing method.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'English Unleashed'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'English Unleashed - Learn English with PDFs',
    description: 'Simple, clear English learning materials. Learn with PDFs, videos, and quizzes.',
    images: ['/og-image.png'],
    creator: '@EnglishPodcastUnleashed'
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
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Open+Sans:wght@300;400;600&family=Lora:wght@400;500&family=Roboto+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            <Navigation />
            <main>{children}</main>
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}