'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function Analytics({ userId }: { userId?: string | null }) {
  const pathname = usePathname()
  const startTime = useRef<number>(Date.now())
  const sessionId = useRef<string>()

  // Get or create session ID
  useEffect(() => {
    const stored = sessionStorage.getItem('analytics_session')
    if (stored) {
      sessionId.current = stored
    } else {
      sessionId.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('analytics_session', sessionId.current)
    }
  }, [])

  // Track page view
  useEffect(() => {
    startTime.current = Date.now()

    const trackView = async () => {
      if (!sessionId.current) return

      try {
        // Get geographic location
        const geoResponse = await fetch('/api/analytics/geo')
        const geoData = await geoResponse.json()

        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pathname,
            sessionId: sessionId.current,
            userId,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            geo: geoData,
          }),
        })
      } catch (error) {
        console.error('Failed to track page view:', error)
      }
    }

    trackView()

    // Track time on page when leaving
    return () => {
      const duration = Math.floor((Date.now() - startTime.current) / 1000)
      
      // Use sendBeacon for reliability when page unloads
      if (navigator.sendBeacon) {
        const data = new Blob([JSON.stringify({
          pathname,
          sessionId: sessionId.current,
          duration,
        })], { type: 'application/json' })
        
        navigator.sendBeacon('/api/analytics/duration', data)
      }
    }
  }, [pathname, userId])

  return null
}