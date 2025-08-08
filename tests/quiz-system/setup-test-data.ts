import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function setupTestData() {
  console.log('🔧 Setting up test data...')
  
  try {
    // Clean up existing test data
    await prisma.quizAttempt.deleteMany({
      where: { user: { email: { contains: '@test.com' } } }
    })
    await prisma.question.deleteMany({})
    await prisma.quiz.deleteMany({})
    await prisma.order.deleteMany({
      where: { user: { email: { contains: '@test.com' } } }
    })
    await prisma.pack.deleteMany({
      where: { title: { contains: 'Test Pack' } }
    })
    await prisma.product.deleteMany({
      where: { title: { contains: 'Test Product' } }
    })
    await prisma.user.deleteMany({
      where: { email: { contains: '@test.com' } }
    })

    // Create test admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: await bcrypt.hash('testpass123', 10),
        name: 'Test Admin',
        isAdmin: true,
        emailVerified: new Date()
      }
    })
    console.log('✅ Created admin user:', adminUser.email)

    // Create test regular user
    const regularUser = await prisma.user.create({
      data: {
        email: 'user@test.com',
        password: await bcrypt.hash('testpass123', 10),
        name: 'Test User',
        isAdmin: false,
        emailVerified: new Date()
      }
    })
    console.log('✅ Created regular user:', regularUser.email)

    // Create test product
    const product = await prisma.product.create({
      data: {
        title: 'Test Product - English Course',
        description: 'Test product for quiz functionality',
        price: 2999, // $29.99
        type: 'PACK',
        active: true
      }
    })
    console.log('✅ Created test product:', product.title)

    // Create test pack (without quiz initially)
    const pack = await prisma.pack.create({
      data: {
        productId: product.id,
        title: 'Test Pack - Beginner Lesson',
        description: 'Test pack for quiz testing',
        videoId: 'test-video-123',
        videoUrl: 'https://youtube.com/watch?v=test-video-123',
        pdfUrl: 'https://example.com/test.pdf',
        hasPdf: true,
        hasQuiz: false, // Will be updated when quiz is created
        order: 1
      }
    })
    console.log('✅ Created test pack:', pack.title)

    // Create a completed order for the regular user
    const order = await prisma.order.create({
      data: {
        userId: regularUser.id,
        productId: product.id,
        amount: 2999,
        status: 'COMPLETED',
        stripeId: 'test_stripe_payment_' + Date.now()
      }
    })
    console.log('✅ Created completed order for user')

    // Create another pack without user access (for testing access control)
    const restrictedProduct = await prisma.product.create({
      data: {
        title: 'Test Product - Restricted',
        description: 'Product user has not purchased',
        price: 3999,
        type: 'PACK',
        active: true
      }
    })

    const restrictedPack = await prisma.pack.create({
      data: {
        productId: restrictedProduct.id,
        title: 'Test Pack - Restricted Access',
        description: 'Pack user should not have access to',
        videoId: 'restricted-video-123',
        hasQuiz: true,
        hasPdf: true,
        order: 2
      }
    })

    // Add a quiz to the restricted pack for testing access denial
    const restrictedQuiz = await prisma.quiz.create({
      data: {
        packId: restrictedPack.id,
        title: 'Restricted Quiz',
        description: 'User should not be able to access this',
        passingScore: 70,
        questions: {
          create: [
            {
              text: 'This question should not be accessible',
              options: JSON.stringify(['Option A', 'Option B', 'Option C', 'Option D']),
              correctAnswer: '0',
              order: 0
            }
          ]
        }
      }
    })
    console.log('✅ Created restricted pack with quiz for access testing')

    return {
      adminUser,
      regularUser,
      product,
      pack,
      order,
      restrictedPack,
      restrictedQuiz
    }

  } catch (error) {
    console.error('❌ Error setting up test data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if executed directly
if (require.main === module) {
  setupTestData()
    .then(() => console.log('✨ Test data setup complete'))
    .catch(console.error)
}