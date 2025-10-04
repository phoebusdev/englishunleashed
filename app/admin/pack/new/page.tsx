/**
 * Create Pack Page
 * Spec: specs/001-admin-dashboard-rebuild/specification.md#requirement-2
 */

import { requireAdmin } from '@/lib/admin/auth'
import PackForm from '../PackForm'

export default async function CreatePackPage() {
  await requireAdmin()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Pack</h1>
        <p className="mt-2 text-gray-600">
          Create a new educational pack with video, PDF, and quiz content
        </p>
      </div>

      <PackForm mode="create" />
    </div>
  )
}
