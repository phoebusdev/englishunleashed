import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from 'lib/auth'
import { prisma } from 'lib/db'
import { ToastProvider } from '@/components/admin/ui'
import { AdminNavigation } from '@/components/admin/AdminNavigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-100">
        <AdminNavigation />
        <main>{children}</main>
      </div>
    </ToastProvider>
  )
}