import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { DownloadButton } from '@/components/DownloadButton'

export default async function AccountPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      orders: {
        include: {
          product: {
            include: {
              packs: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account</h1>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Account Information</h2>
              <p className="text-gray-600">Name: {user.name || 'Not set'}</p>
              <p className="text-gray-600">Email: {user.email}</p>
              <p className="text-gray-600">Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
              {user.isAdmin && (
                <Link 
                  href="/admin"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">My Purchases</h2>
              {user.orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't made any purchases yet.</p>
                  <Link 
                    href="/shop"
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Browse Products →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{order.product.title}</h3>
                          <p className="text-sm text-gray-500">
                            Purchased on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Status: <span className={`font-medium ${
                              order.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'
                            }`}>{order.status}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">£{(order.amount / 100).toFixed(2)}</p>
                          {order.status === 'COMPLETED' && order.product.packs.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {order.product.packs.map((pack) => (
                                <div key={pack.id} className="flex items-center gap-3">
                                  {pack.hasPdf && (
                                    <DownloadButton
                                      orderId={order.id}
                                      packId={pack.id}
                                      packTitle={pack.title}
                                    />
                                  )}
                                  {pack.hasQuiz && (
                                    <Link
                                      href={`/quiz/${pack.id}`}
                                      className="text-sm text-purple-600 hover:text-purple-700"
                                    >
                                      Take Quiz
                                    </Link>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}