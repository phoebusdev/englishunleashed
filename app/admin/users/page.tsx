/**
 * Admin Users Page
 * Spec: specs/001-admin-dashboard-rebuild/specification.md#requirement-3
 */

import { requireAdmin } from '@/lib/admin/auth'
import { prisma } from '@/lib/db'
import UsersListClient from './UsersListClient'

export default async function AdminUsersPage() {
  await requireAdmin()

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          orders: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-2 text-gray-600">
          Manage user accounts and permissions
        </p>
      </div>

      <UsersListClient users={users} />
    </div>
  )
}
