import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface UserAnswer {
  questionId: string
  selectedAnswer: string
  isCorrect: boolean
}

export async function testUserQuizTaking() {
  console.log('\n🧪 Testing User Quiz Taking...')
  
  try {
    // Find test user
    const user = await prisma.user.findUnique({
      where: { email: 'user@test.com' }
    })
    
    if (!user) {
      throw new Error('Test user not found. Run setup-test-data.ts first')
    }

    // Find the quiz
    const quiz = await prisma.quiz.findFirst({
      where: {
        pack: {
          title: 'Test Pack - Beginner Lesson'
        }
      },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        },
        pack: true
      }
    })

    if (!quiz) {
      throw new Error('Quiz not found. Run test-admin-quiz-creation.ts first')
    }

    console.log('👤 User:', user.name, '(' + user.email + ')')
    console.log('📝 Taking quiz:', quiz.title)
    console.log('📊 Questions:', quiz.questions.length)
    console.log('🎯 Passing score:', quiz.passingScore + '%')

    // Simulate user answering questions
    const userAnswers: Record<string, string> = {}
    const answerDetails: UserAnswer[] = []
    
    console.log('\n📝 Simulating user answers:')
    
    // Answer pattern: correct, correct, wrong, correct, wrong
    const answerPattern = ['0', '1', '1', '1', '1'] // 3 correct, 2 wrong = 60%
    
    quiz.questions.forEach((question, index) => {
      const selectedAnswer = answerPattern[index]
      const isCorrect = selectedAnswer === question.correctAnswer
      
      userAnswers[question.id] = selectedAnswer
      answerDetails.push({
        questionId: question.id,
        selectedAnswer,
        isCorrect
      })
      
      const options = JSON.parse(question.options as string)
      console.log(`   Q${index + 1}: ${question.text.substring(0, 50)}...`)
      console.log(`      Selected: ${options[parseInt(selectedAnswer)]} ${isCorrect ? '✅' : '❌'}`)
    })

    // Calculate score
    const correctAnswers = answerDetails.filter(a => a.isCorrect).length
    const score = Math.round((correctAnswers / quiz.questions.length) * 100)
    
    console.log('\n📊 Score Calculation:')
    console.log('   - Correct answers:', correctAnswers, '/', quiz.questions.length)
    console.log('   - Score:', score + '%')
    console.log('   - Passing score:', quiz.passingScore + '%')
    console.log('   - Result:', score >= (quiz.passingScore || 70) ? '✅ PASSED' : '❌ FAILED')

    // Submit quiz attempt
    console.log('\n💾 Saving quiz attempt...')
    
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId: quiz.id,
        score,
        answers: JSON.stringify(userAnswers),
        completedAt: new Date()
      }
    })
    
    console.log('✅ Quiz attempt saved!')
    console.log('   - Attempt ID:', attempt.id)
    console.log('   - Score:', attempt.score + '%')
    console.log('   - Timestamp:', attempt.completedAt.toISOString())

    // Verify attempt was saved correctly
    const savedAttempt = await prisma.quizAttempt.findUnique({
      where: { id: attempt.id },
      include: {
        quiz: {
          include: {
            questions: true
          }
        }
      }
    })

    if (!savedAttempt) {
      throw new Error('Failed to retrieve saved attempt')
    }

    // Parse and verify saved answers
    const savedAnswers = JSON.parse(savedAttempt.answers as string)
    console.log('\n🔍 Verifying saved data:')
    console.log('   - Answers saved:', Object.keys(savedAnswers).length)
    console.log('   - Score matches:', savedAttempt.score === score ? '✅' : '❌')
    
    // Get user's quiz history
    const userAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId: user.id,
        quizId: quiz.id
      },
      orderBy: {
        completedAt: 'desc'
      }
    })
    
    console.log('\n📚 User\'s quiz history:')
    console.log('   - Total attempts:', userAttempts.length)
    if (userAttempts.length > 0) {
      const bestScore = Math.max(...userAttempts.map(a => a.score))
      const avgScore = userAttempts.reduce((sum, a) => sum + a.score, 0) / userAttempts.length
      console.log('   - Best score:', bestScore + '%')
      console.log('   - Average score:', avgScore.toFixed(1) + '%')
    }

    return {
      success: true,
      attemptId: attempt.id,
      score,
      passed: score >= (quiz.passingScore || 70),
      correctAnswers,
      totalQuestions: quiz.questions.length
    }

  } catch (error) {
    console.error('❌ User quiz taking test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run if executed directly
if (require.main === module) {
  testUserQuizTaking()
    .then(result => {
      console.log('\n📊 Test Result:', result)
      process.exit(result.success ? 0 : 1)
    })
    .catch(console.error)
}