import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notifyContentReady } from '@/lib/notifications'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const packId = formData.get('packId') as string

    if (!file || !packId) {
      return NextResponse.json(
        { error: 'Missing file or pack ID' },
        { status: 400 }
      )
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      )
    }

    // Upload to Vercel Blob (or fake it in local dev)
    let blobUrl: string
    
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`pdfs/${packId}-${file.name}`, file, {
        access: 'public',
        addRandomSuffix: true,
      })
      blobUrl = blob.url
    } else {
      // In local dev without Blob storage, just create a fake URL
      blobUrl = `/api/mock-pdf/${packId}/${file.name}`
      console.log('Local dev: PDF would be uploaded to:', blobUrl)
    }

    // Update pack with PDF URL
    const pack = await prisma.pack.update({
      where: { id: packId },
      data: {
        pdfUrl: blobUrl,
        hasPdf: true,
      },
    })

    // Notify users who have already purchased
    await notifyContentReady(packId, 'pdf')

    return NextResponse.json({
      success: true,
      url: blobUrl,
      pack,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}