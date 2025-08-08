import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUserQuizzes(userEmail: string) {
  console.log(`\n🔍 Checking quizzes for user: ${userEmail}\n`)
  
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        orders: {
          where: { status: 'COMPLETED' },
          include: {
            product: {
              include: {
                packs: {
                  include: {
                    quiz: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('✅ User found:')
    console.log('   - ID:', user.id)
    console.log('   - Name:', user.name || 'Not set')
    console.log('   - Email:', user.email)
    console.log('   - Created:', user.createdAt.toLocaleDateString())
    console.log('   - Is Admin:', user.isAdmin)
    
    console.log('\n📦 Orders:', user.orders.length)
    
    if (user.orders.length === 0) {
      console.log('   No completed orders found')
      return
    }

    // Check each order
    for (const order of user.orders) {
      console.log(`\n   Order ${order.id}:`)
      console.log(`   - Product: ${order.product.title}`)
      console.log(`   - Amount: £${(order.amount / 100).toFixed(2)}`)
      console.log(`   - Status: ${order.status}`)
      console.log(`   - Date: ${order.createdAt.toLocaleDateString()}`)
      console.log(`   - Packs: ${order.product.packs.length}`)
      
      for (const pack of order.product.packs) {
        console.log(`\n      Pack: ${pack.title}`)
        console.log(`      - Has PDF: ${pack.hasPdf}`)
        console.log(`      - Has Quiz: ${pack.hasQuiz}`)
        
        if (pack.quiz) {
          console.log(`      ✅ Quiz Available:`)
          console.log(`         - Quiz ID: ${pack.quiz.id}`)
          console.log(`         - Title: ${pack.quiz.title}`)
          console.log(`         - Passing Score: ${pack.quiz.passingScore}%`)
          
          // Check quiz attempts
          const attempts = await prisma.quizAttempt.findMany({
            where: {
              quizId: pack.quiz.id,
              userId: user.id
            },
            orderBy: { completedAt: 'desc' }
          })
          
          console.log(`         - Attempts: ${attempts.length}`)
          if (attempts.length > 0) {
            const scores = attempts.map(a => a.score)
            console.log(`         - Scores: ${scores.join('%, ')}%`)
            console.log(`         - Best Score: ${Math.max(...scores)}%`)
          }
        } else if (pack.hasQuiz) {
          console.log(`      ⚠️  Quiz marked as available but not found in database`)
        }
      }
    }
    
    // Summary
    const allQuizzes = user.orders
      .flatMap(o => o.product.packs)
      .filter(p => p.quiz)
      .map(p => p.quiz)
    
    console.log('\n📊 Summary:')
    console.log('   - Total Quizzes Available:', allQuizzes.length)
    
    if (allQuizzes.length > 0) {
      console.log('   - Quiz IDs:', allQuizzes.map(q => q?.id).join(', '))
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.log('Usage: npx tsx tests/check-user-quizzes.ts <email>')
  console.log('Example: npx tsx tests/check-user-quizzes.ts henripasha20@gmail.com')
  process.exit(1)
}

checkUserQuizzes(email)