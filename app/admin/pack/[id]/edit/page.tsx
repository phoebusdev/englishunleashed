/**
 * Edit Pack Page
 * Spec: specs/001-admin-dashboard-rebuild/specification.md#requirement-2
 */

import { requireAdmin } from '@/lib/admin/auth'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import PackForm from '../../PackForm'

export default async function EditPackPage({ params }: { params: { id: string } }) {
  await requireAdmin()

  const pack = await prisma.pack.findUnique({
    where: { id: params.id },
    include: {
      product: true,
      quiz: {
        select: {
          id: true,
          title: true
        }
      }
    }
  })

  if (!pack) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Pack</h1>
        <p className="mt-2 text-gray-600">
          Update pack details, upload PDF, and manage quiz content
        </p>
      </div>

      <PackForm mode="edit" pack={pack} />
    </div>
  )
}
