/**
 * Admin Orders Page
 * Spec: specs/001-admin-dashboard-rebuild/specification.md#requirement-4
 */

import { requireAdmin } from '@/lib/admin/auth'
import { prisma } from '@/lib/db'
import OrdersListClient from './OrdersListClient'

export default async function AdminOrdersPage() {
  await requireAdmin()

  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      },
      product: {
        select: {
          id: true,
          title: true
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
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="mt-2 text-gray-600">
          View and manage customer orders
        </p>
      </div>

      <OrdersListClient orders={orders} />
    </div>
  )
}
