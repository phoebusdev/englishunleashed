import { prisma } from '../lib/db'

async function createTestProducts() {
  try {
    // Create test products
    const product1 = await prisma.product.create({
      data: {
        title: 'Beginner English Conversations',
        description: 'Essential English conversations for beginners with PDF transcripts and interactive quiz',
        price: 999, // $9.99
        type: 'PACK',
        active: true,
      }
    })

    const pack1 = await prisma.pack.create({
      data: {
        productId: product1.id,
        title: 'Beginner English Conversations Pack',
        description: 'Complete beginner pack with video, PDF, and quiz',
        videoId: 'dQw4w9WgXcQ', // Example YouTube ID
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        pdfUrl: '/pdfs/beginner-conversations.pdf',
        hasPdf: true,
        hasQuiz: true,
      }
    })

    const product2 = await prisma.product.create({
      data: {
        title: 'Intermediate Business English',
        description: 'Professional English for workplace communication',
        price: 1499, // $14.99
        type: 'PACK',
        active: true,
      }
    })

    const pack2 = await prisma.pack.create({
      data: {
        productId: product2.id,
        title: 'Business English Pack',
        description: 'Professional communication skills pack',
        videoId: 'dQw4w9WgXcQ',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        pdfUrl: '/pdfs/business-english.pdf',
        hasPdf: true,
        hasQuiz: false,
      }
    })

    console.log('✅ Test products created successfully!')
    console.log(`Product 1: ${product1.title} - Pack ID: ${pack1.id}`)
    console.log(`Product 2: ${product2.title} - Pack ID: ${pack2.id}`)
    
  } catch (error) {
    console.error('Error creating test products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestProducts()