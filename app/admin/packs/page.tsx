/**
 * Admin Packs List Page
 * Spec: specs/001-admin-dashboard-rebuild/specification.md#requirement-2
 */

import { requireAdmin } from '@/lib/admin/auth'
import { prisma } from '@/lib/db'
import PacksListClient from './PacksListClient'

export default async function AdminPacksPage() {
  await requireAdmin()

  const packs = await prisma.pack.findMany({
    include: {
      product: true,
      quiz: {
        select: {
          id: true,
          title: true,
          _count: {
            select: { questions: true }
          }
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
        <h1 className="text-3xl font-bold text-gray-900">Pack Management</h1>
        <p className="mt-2 text-gray-600">
          Manage your educational packs, upload PDFs, and configure quizzes
        </p>
      </div>

      <PacksListClient packs={packs} />
    </div>
  )
}
