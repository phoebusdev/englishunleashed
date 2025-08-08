import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from 'lib/auth'
import { prisma } from 'lib/db'
import Link from 'next/link'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user?.isAdmin) {
    redirect('/account')
  }

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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
            <p className="text-2xl font-bold text-gray-900">{userCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
            <p className="text-2xl font-bold text-gray-900">{orderCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Packs</h3>
            <p className="text-2xl font-bold text-gray-900">{packCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">
              £{((revenue._sum.amount || 0) / 100).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/pack/new"
              className="px-4 py-2 bg-[#20b2aa] text-white rounded-md text-center hover:bg-[#0f8080] transition-colors"
            >
              Create Pack
            </Link>
            <Link
              href="/admin/quiz-builder"
              className="px-4 py-2 bg-[#ff6b8a] text-white rounded-md text-center hover:bg-[#ff5577] transition-colors"
            >
              Quiz Builder
            </Link>
            <Link
              href="/admin/users"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-center hover:bg-blue-700 transition-colors"
            >
              Manage Users
            </Link>
            <Link
              href="/admin/orders"
              className="px-4 py-2 bg-green-600 text-white rounded-md text-center hover:bg-green-700 transition-colors"
            >
              View Orders
            </Link>
          </div>
        </div>

        {/* Pack Management */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Pack Management</h2>
            <Link
              href="/admin/pack/new"
              className="px-4 py-2 bg-[#20b2aa] text-white rounded-md hover:bg-[#0f8080] transition-colors"
            >
              New Pack
            </Link>
          </div>
          <Link
            href="/admin/packs"
            className="text-purple-600 hover:text-purple-700"
          >
            View all packs →
          </Link>
        </div>
      </div>
    </div>
  )
}