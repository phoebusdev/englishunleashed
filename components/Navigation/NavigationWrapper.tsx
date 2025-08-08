'use client'

import { useSession } from 'next-auth/react'
import { NavigationWithAuth } from './NavigationWithAuth'
import { SimpleNavigation } from './SimpleNavigation'

export function NavigationWrapper() {
  const { data: session, status } = useSession()
  
  // Show SimpleNavigation while loading
  if (status === 'loading') {
    return <SimpleNavigation />
  }
  
  // Show NavigationWithAuth when user is authenticated
  if (session) {
    return <NavigationWithAuth />
  }
  
  // Show SimpleNavigation for unauthenticated users
  return <SimpleNavigation />
}