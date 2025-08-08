import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json() as { componentType: string }
    const { componentType } = body

    // Create a draft product
    const product = await prisma.product.create({
      data: {
        title: 'Draft Pack - ' + new Date().toLocaleDateString(),
        description: 'Draft pack - add components in any order',
        price: 999, // Default $9.99
        type: 'PACK',
        active: false, // Not active until all components added
        metadata: JSON.stringify({
          isDraft: true,
          startedWith: componentType,
        })
      }
    })

    // Create a draft pack
    const pack = await prisma.pack.create({
      data: {
        productId: product.id,
        title: 'Draft Pack - ' + new Date().toLocaleDateString(),
        description: '',
        // All components start as null/false
        videoId: null,
        videoUrl: null,
        pdfUrl: null,
        hasPdf: false,
        hasQuiz: false,
      }
    })

    return NextResponse.json({ 
      packId: pack.id,
      productId: product.id 
    })
  } catch (error) {
    console.error('Error creating draft pack:', error)
    return NextResponse.json(
      { error: 'Failed to create draft pack' },
      { status: 500 }
    )
  }
}