'use client'

/**
 * Pack Form Component (Create/Edit)
 * Spec: specs/001-admin-dashboard-rebuild/specification.md#requirement-2
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AdminCard,
  AdminButton,
  FormInput,
  FormTextarea,
  useToast
} from '@/components/admin/ui'

type PackFormMode = 'create' | 'edit'

type Pack = {
  id: string
  title: string
  description: string | null
  videoId: string | null
  videoUrl: string | null
  pdfUrl: string | null
  hasPdf: boolean
  product: {
    id: string
    title: string
    price: number
    active: boolean
  }
  quiz?: {
    id: string
    title: string
  } | null
}

interface PackFormProps {
  mode: PackFormMode
  pack?: Pack
}

export default function PackForm({ mode, pack }: PackFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState(pack?.title || '')
  const [description, setDescription] = useState(pack?.description || '')
  const [price, setPrice] = useState(pack ? (pack.product.price / 100).toString() : '')
  const [videoUrl, setVideoUrl] = useState(pack?.videoUrl || '')
  const [videoId, setVideoId] = useState(pack?.videoId || '')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !price) {
      toast('error', 'Validation Error', 'Please fill in all required fields')
      return
    }

    const priceInCents = Math.round(parseFloat(price) * 100)
    if (isNaN(priceInCents) || priceInCents <= 0) {
      toast('error', 'Invalid Price', 'Please enter a valid price')
      return
    }

    setIsSubmitting(true)

    try {
      const endpoint = mode === 'create' ? '/api/admin/pack' : '/api/admin/pack'
      const method = mode === 'create' ? 'POST' : 'PUT'

      const body = mode === 'create'
        ? {
            title,
            description,
            price: priceInCents,
            videoUrl,
            videoId,
          }
        : {
            id: pack!.id,
            title,
            description,
            price: priceInCents,
            videoUrl,
            videoId,
          }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error('Failed to save pack')

      const { pack: savedPack } = await response.json()

      toast('success', mode === 'create' ? 'Pack Created' : 'Pack Updated', `${title} has been saved successfully`)

      // If there's a PDF file, upload it
      if (pdfFile) {
        await handlePdfUpload(savedPack.id)
      }

      // Redirect to pack list
      router.push('/admin/packs')
      router.refresh()
    } catch (error) {
      toast('error', 'Save Failed', 'Failed to save pack. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePdfUpload = async (packId: string) => {
    if (!pdfFile) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', pdfFile)
      formData.append('packId', packId)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to upload PDF')

      toast('success', 'PDF Uploaded', 'PDF has been uploaded successfully')
    } catch (error) {
      toast('error', 'Upload Failed', 'Failed to upload PDF. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <AdminCard title="Basic Information">
        <div className="space-y-4">
          <FormInput
            label="Pack Title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., English Grammar Fundamentals"
          />

          <FormTextarea
            label="Description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe what students will learn in this pack..."
          />

          <FormInput
            label="Price (£)"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            placeholder="9.99"
            helperText="Price in GBP (e.g., 9.99 for £9.99)"
          />
        </div>
      </AdminCard>

      {/* Video Content */}
      <AdminCard title="Video Content" description="Add a YouTube video to this pack">
        <div className="space-y-4">
          <FormInput
            label="Video URL"
            name="videoUrl"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            helperText="Full YouTube video URL"
          />

          <FormInput
            label="Video ID (optional)"
            name="videoId"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
            placeholder="dQw4w9WgXcQ"
            helperText="YouTube video ID (extracted automatically from URL)"
          />
        </div>
      </AdminCard>

      {/* PDF Upload */}
      <AdminCard
        title="PDF Content"
        description={pack?.hasPdf ? `Current PDF: ${pack.pdfUrl?.split('/').pop()}` : 'No PDF uploaded yet'}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload PDF
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-[#20b2aa] file:text-white
              hover:file:bg-[#0f8080]
              file:cursor-pointer cursor-pointer"
          />
          {pdfFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
      </AdminCard>

      {/* Quiz Link */}
      {mode === 'edit' && pack && (
        <AdminCard title="Quiz" description={pack.quiz ? `Quiz: ${pack.quiz.title}` : 'No quiz created yet'}>
          <div className="flex items-center gap-4">
            {pack.quiz ? (
              <Link href="/admin/quiz-builder">
                <AdminButton type="button" variant="outline">
                  Edit Quiz
                </AdminButton>
              </Link>
            ) : (
              <Link href="/admin/quiz-builder">
                <AdminButton type="button" variant="secondary">
                  Create Quiz
                </AdminButton>
              </Link>
            )}
          </div>
        </AdminCard>
      )}

      {/* Actions */}
      <AdminCard>
        <div className="flex justify-end gap-4">
          <Link href="/admin/packs">
            <AdminButton type="button" variant="outline">
              Cancel
            </AdminButton>
          </Link>
          <AdminButton
            type="submit"
            isLoading={isSubmitting || isUploading}
            disabled={isSubmitting || isUploading}
          >
            {mode === 'create' ? 'Create Pack' : 'Update Pack'}
          </AdminButton>
        </div>
      </AdminCard>
    </form>
  )
}
