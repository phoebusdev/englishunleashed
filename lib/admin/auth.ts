/**
 * Admin Authentication Helper
 * Spec: specs/001-admin-dashboard-rebuild/specification.md#security-considerations
 *
 * Centralized admin authentication to eliminate duplicated code across admin pages
 */

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * Requires admin authentication for server components
 * Redirects to login if not authenticated, to /account if not admin
 *
 * @returns The authenticated admin user
 * @throws Redirects if authentication fails
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true,
      createdAt: true,
    },
  })

  if (!user?.isAdmin) {
    redirect('/account')
  }

  return user
}

/**
 * Checks if current user is admin (for API routes)
 * Returns null if not authenticated or not admin
 *
 * @returns The authenticated admin user or null
 */
export async function getAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true,
    },
  })

  if (!user?.isAdmin) {
    return null
  }

  return user
}
