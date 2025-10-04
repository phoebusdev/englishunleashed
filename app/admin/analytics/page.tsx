/**
 * Admin Analytics Page
 * Spec: specs/001-admin-dashboard-rebuild/specification.md#requirement-5
 */

import { requireAdmin } from '@/lib/admin/auth'
import { prisma } from '@/lib/db'
import AnalyticsDashboardClient from './AnalyticsDashboardClient'

export default async function AdminAnalyticsPage() {
  await requireAdmin()

  // Get analytics data
  const [
    totalRevenue,
    recentOrders,
    topPacks,
    userGrowth
  ] = await Promise.all([
    // Total revenue
    prisma.order.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true }
    }),

    // Recent orders for revenue chart
    prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      select: {
        amount: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    }),

    // Top selling packs
    prisma.order.groupBy({
      by: ['productId'],
      where: { status: 'COMPLETED' },
      _count: { id: true },
      _sum: { amount: true },
      orderBy: {
        _count: { id: 'desc' }
      },
      take: 5
    }),

    // User growth
    prisma.user.findMany({
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
  ])

  // Get product details for top packs
  const productIds = topPacks.map(p => p.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true }
  })

  const topPacksWithDetails = topPacks.map(pack => ({
    ...pack,
    product: products.find(p => p.id === pack.productId)
  }))

  const analytics = {
    totalRevenue: totalRevenue._sum.amount || 0,
    recentOrders,
    topPacks: topPacksWithDetails,
    userGrowth
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Business performance metrics and insights
        </p>
      </div>

      <AnalyticsDashboardClient analytics={analytics} />
    </div>
  )
}
