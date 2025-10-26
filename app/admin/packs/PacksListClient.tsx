'use client'

/**
 * Packs List Client Component
 * Spec: specs/001-admin-dashboard-rebuild/specification.md#requirement-2
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AdminCard, AdminButton, DataTable, ConfirmDialog, useToast, type Column } from '@/components/admin/ui'

type Pack = {
  id: string
  title: string
  hasPdf: boolean
  hasQuiz: boolean
  pdfUrl: string | null
  product: {
    id: string
    title: string
    price: number
    active: boolean
  }
  quiz?: {
    id: string
    title: string
    _count: {
      questions: number
    }
  } | null
}

interface PacksListClientProps {
  packs: Pack[]
}

export default function PacksListClient({ packs: initialPacks }: PacksListClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [packs, setPacks] = useState(initialPacks)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [packToDelete, setPackToDelete] = useState<Pack | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!packToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/pack/${packToDelete.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        // Show detailed error message if available
        const errorMessage = data.details || data.error || 'Failed to delete pack'
        toast('error', 'Delete failed', errorMessage)
        return
      }

      setPacks(packs.filter(p => p.id !== packToDelete.id))
      toast('success', 'Pack deleted', `${packToDelete.title} has been deleted successfully`)
      setPackToDelete(null)
    } catch (error) {
      toast('error', 'Delete failed', 'Failed to delete pack. Please try again.')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const columns: Column<Pack>[] = [
    {
      header: 'Pack Title',
      accessor: 'title',
      sortable: true,
      cell: (pack) => (
        <div>
          <div className="font-medium text-gray-900">{pack.title}</div>
          <div className="text-sm text-gray-500">£{(pack.product.price / 100).toFixed(2)}</div>
        </div>
      )
    },
    {
      header: 'PDF',
      accessor: 'hasPdf',
      cell: (pack) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          pack.hasPdf ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {pack.hasPdf ? '✓ Uploaded' : '✗ Missing'}
        </span>
      )
    },
    {
      header: 'Quiz',
      accessor: 'hasQuiz',
      cell: (pack) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          pack.hasQuiz ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {pack.hasQuiz ? `✓ ${pack.quiz?._count.questions || 0} questions` : '✗ No quiz'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'product',
      cell: (pack) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          pack.product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {pack.product.active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (pack) => (
        <div className="flex gap-2">
          <Link href={`/admin/pack/${pack.id}/edit`}>
            <AdminButton variant="outline" size="sm">
              Edit
            </AdminButton>
          </Link>
          <AdminButton
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setPackToDelete(pack)
              setDeleteDialogOpen(true)
            }}
          >
            Delete
          </AdminButton>
        </div>
      )
    }
  ]

  return (
    <>
      <AdminCard
        actions={
          <Link href="/admin/pack/new">
            <AdminButton>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Pack
            </AdminButton>
          </Link>
        }
      >
        <DataTable
          data={packs}
          columns={columns}
          emptyMessage="No packs found"
          emptyDescription="Create your first pack to get started"
          pageSize={10}
        />
      </AdminCard>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Pack"
        description={`Are you sure you want to delete "${packToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  )
}
