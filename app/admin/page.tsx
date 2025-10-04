import { requireAdmin } from '@/lib/admin/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { AdminCard, AdminButton } from '@/components/admin/ui'

export default async function AdminDashboard() {
  await requireAdmin()

  // Get dashboard stats
  const [userCount, orderCount, packCount, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.order.count({ where: { status: 'COMPLETED' } }),
    prisma.pack.count(),
    prisma.order.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true }
    })
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to the admin control panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <AdminCard>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{userCount}</p>
          </div>
        </AdminCard>
        <AdminCard>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{orderCount}</p>
          </div>
        </AdminCard>
        <AdminCard>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Packs</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{packCount}</p>
          </div>
        </AdminCard>
        <AdminCard>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              £{((revenue._sum.amount || 0) / 100).toFixed(2)}
            </p>
          </div>
        </AdminCard>
      </div>

      {/* Quick Actions */}
      <AdminCard title="Quick Actions" description="Common admin tasks">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/pack/new">
            <AdminButton className="w-full">Create Pack</AdminButton>
          </Link>
          <Link href="/admin/quiz-builder">
            <AdminButton variant="secondary" className="w-full">Quiz Builder</AdminButton>
          </Link>
          <Link href="/admin/users">
            <AdminButton variant="outline" className="w-full">Manage Users</AdminButton>
          </Link>
          <Link href="/admin/orders">
            <AdminButton variant="outline" className="w-full">View Orders</AdminButton>
          </Link>
        </div>
      </AdminCard>

      {/* Management Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <AdminCard
          title="Pack Management"
          description="Create, edit, and manage educational packs"
          actions={
            <Link href="/admin/pack/new">
              <AdminButton size="sm">New Pack</AdminButton>
            </Link>
          }
        >
          <Link href="/admin/packs" className="text-[#20b2aa] hover:text-[#0f8080] font-medium">
            View all packs →
          </Link>
        </AdminCard>

        <AdminCard
          title="Analytics"
          description="View business metrics and insights"
        >
          <Link href="/admin/analytics" className="text-[#20b2aa] hover:text-[#0f8080] font-medium">
            View analytics dashboard →
          </Link>
        </AdminCard>
      </div>
    </div>
  )
}