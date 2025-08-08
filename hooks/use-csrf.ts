'use client'

import { useEffect, useState } from 'react'

export function useCsrf() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)

  useEffect(() => {
    // Fetch CSRF token from API endpoint
    fetch('/api/csrf')
      .then(res => res.json())
      .then(data => setCsrfToken(data.token))
      .catch(err => console.error('Failed to fetch CSRF token:', err))
  }, [])

  return csrfToken
}

/**
 * Adds CSRF token to fetch headers
 */
export function withCsrf(headers: HeadersInit = {}): HeadersInit {
  const token = getCsrfTokenFromCookie()
  
  if (token) {
    return {
      ...headers,
      'x-csrf-token': token,
    }
  }
  
  return headers
}

/**
 * Gets CSRF token from cookie
 */
function getCsrfTokenFromCookie(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  const match = document.cookie.match(new RegExp('(^| )csrf-token=([^;]+)'))
  return match ? match[2] : null
}