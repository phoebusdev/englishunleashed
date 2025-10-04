'use client'

/**
 * Analytics Dashboard Client Component
 * Spec: specs/001-admin-dashboard-rebuild/specification.md#requirement-5
 */

import { useMemo } from 'react'
import { AdminCard } from '@/components/admin/ui'

type Analytics = {
  totalRevenue: number
  recentOrders: Array<{
    amount: number
    createdAt: Date
  }>
  topPacks: Array<{
    productId: string
    _count: { id: number }
    _sum: { amount: number | null }
    product?: {
      id: string
      title: string
    }
  }>
  userGrowth: Array<{
    createdAt: Date
  }>
}

interface AnalyticsDashboardClientProps {
  analytics: Analytics
}

export default function AnalyticsDashboardClient({ analytics }: AnalyticsDashboardClientProps) {
  // Calculate metrics
  const metrics = useMemo(() => {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const revenueLastMonth = analytics.recentOrders.reduce((sum, order) => sum + order.amount, 0)
    const ordersLastMonth = analytics.recentOrders.length
    const averageOrderValue = ordersLastMonth > 0 ? revenueLastMonth / ordersLastMonth : 0

    const newUsersLastMonth = analytics.userGrowth.filter(
      u => new Date(u.createdAt) >= last30Days
    ).length

    return {
      totalRevenue: analytics.totalRevenue,
      revenueLastMonth,
      ordersLastMonth,
      averageOrderValue,
      totalUsers: analytics.userGrowth.length,
      newUsersLastMonth
    }
  }, [analytics])

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminCard>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              £{(metrics.totalRevenue / 100).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">All time</p>
          </div>
        </AdminCard>

        <AdminCard>
          <div>
            <p className="text-sm font-medium text-gray-600">Last 30 Days</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              £{(metrics.revenueLastMonth / 100).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">{metrics.ordersLastMonth} orders</p>
          </div>
        </AdminCard>

        <AdminCard>
          <div>
            <p className="text-sm font-medium text-gray-600">Average Order Value</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              £{(metrics.averageOrderValue / 100).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Per transaction</p>
          </div>
        </AdminCard>

        <AdminCard>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {metrics.totalUsers}
            </p>
            <p className="text-sm text-green-600 mt-1">+{metrics.newUsersLastMonth} this month</p>
          </div>
        </AdminCard>
      </div>

      {/* Top Selling Packs */}
      <AdminCard title="Top Selling Packs" description="Best performing products by order count">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.topPacks.map((pack, index) => (
                <tr key={pack.productId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-[#20b2aa] rounded-full flex items-center justify-center text-white font-semibold">
                        {index + 1}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {pack.product?.title || 'Unknown Product'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{pack._count.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      £{((pack._sum.amount || 0) / 100).toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {analytics.topPacks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No sales data available yet
            </div>
          )}
        </div>
      </AdminCard>

      {/* Recent Revenue Trend */}
      <AdminCard title="Revenue Trend (Last 30 Days)" description="Daily revenue visualization">
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">Chart visualization coming soon</p>
            <p className="text-xs text-gray-400">Install recharts or chart.js for visual charts</p>
          </div>
        </div>
      </AdminCard>
    </div>
  )
}
