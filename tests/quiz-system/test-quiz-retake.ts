import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function testQuizRetake() {
  console.log('\n🧪 Testing Quiz Retake & Scoring...')
  
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
        }
      }
    })

    if (!quiz) {
      throw new Error('Quiz not found. Run test-admin-quiz-creation.ts first')
    }

    console.log('👤 User:', user.email)
    console.log('📝 Quiz:', quiz.title)
    console.log('🎯 Passing score:', quiz.passingScore + '%')

    // Simulate multiple attempts with different scores
    const attemptScenarios = [
      {
        name: 'First Attempt - Poor Performance',
        answers: ['1', '0', '0', '0', '0'], // 1/5 correct = 20%
        expectedScore: 20
      },
      {
        name: 'Second Attempt - Improvement',
        answers: ['0', '1', '1', '1', '0'], // 3/5 correct = 60%
        expectedScore: 60
      },
      {
        name: 'Third Attempt - Passing Score',
        answers: ['0', '1', '2', '1', '2'], // 5/5 correct = 100%
        expectedScore: 100
      },
      {
        name: 'Fourth Attempt - Regression',
        answers: ['0', '1', '2', '0', '1'], // 3/5 correct = 60%
        expectedScore: 60
      }
    ]

    const attempts = []
    
    for (const scenario of attemptScenarios) {
      console.log(`\n📝 ${scenario.name}`)
      
      // Build answers object
      const userAnswers: Record<string, string> = {}
      let correctCount = 0
      
      quiz.questions.forEach((question, index) => {
        const selectedAnswer = scenario.answers[index]
        userAnswers[question.id] = selectedAnswer
        
        if (selectedAnswer === question.correctAnswer) {
          correctCount++
        }
        
        const options = JSON.parse(question.options as string)
        const isCorrect = selectedAnswer === question.correctAnswer
        console.log(`   Q${index + 1}: Selected "${options[parseInt(selectedAnswer)]}" ${isCorrect ? '✅' : '❌'}`)
      })
      
      const score = Math.round((correctCount / quiz.questions.length) * 100)
      console.log(`   Score: ${score}% (${correctCount}/${quiz.questions.length} correct)`)
      console.log(`   Status: ${score >= (quiz.passingScore || 70) ? '✅ PASSED' : '❌ FAILED'}`)
      
      // Save attempt
      const attempt = await prisma.quizAttempt.create({
        data: {
          userId: user.id,
          quizId: quiz.id,
          score,
          answers: JSON.stringify(userAnswers),
          completedAt: new Date(Date.now() + attempts.length * 60000) // Stagger timestamps
        }
      })
      
      attempts.push(attempt)
      console.log(`   Saved as attempt #${attempts.length} (ID: ${attempt.id})`)
    }

    // Analyze all attempts
    console.log('\n📊 Analyzing User Progress:')
    
    const allAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId: user.id,
        quizId: quiz.id
      },
      orderBy: {
        completedAt: 'asc'
      }
    })
    
    console.log(`   Total attempts: ${allAttempts.length}`)
    
    // Calculate statistics
    const scores = allAttempts.map(a => a.score)
    const bestScore = Math.max(...scores)
    const worstScore = Math.min(...scores)
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length
    const latestScore = scores[scores.length - 1]
    const firstPassIndex = scores.findIndex(s => s >= (quiz.passingScore || 70))
    const passCount = scores.filter(s => s >= (quiz.passingScore || 70)).length
    
    console.log(`   Best score: ${bestScore}%`)
    console.log(`   Worst score: ${worstScore}%`)
    console.log(`   Average score: ${avgScore.toFixed(1)}%`)
    console.log(`   Latest score: ${latestScore}%`)
    console.log(`   First pass: ${firstPassIndex >= 0 ? `Attempt #${firstPassIndex + 1}` : 'Not yet'}`)
    console.log(`   Pass rate: ${passCount}/${allAttempts.length} (${(passCount/allAttempts.length*100).toFixed(0)}%)`)

    // Show score progression
    console.log('\n📈 Score Progression:')
    allAttempts.forEach((attempt, index) => {
      const trend = index > 0 
        ? (attempt.score > allAttempts[index-1].score ? '↗️' : 
           attempt.score < allAttempts[index-1].score ? '↘️' : '→')
        : ''
      console.log(`   Attempt ${index + 1}: ${attempt.score}% ${trend} ${attempt.score >= (quiz.passingScore || 70) ? '✅' : '❌'}`)
    })

    // Test score calculation accuracy
    console.log('\n🔍 Verifying Score Calculations:')
    
    for (let i = 0; i < Math.min(2, attempts.length); i++) {
      const attempt = attempts[i]
      const savedAnswers = JSON.parse(attempt.answers as string)
      let recalculatedCorrect = 0
      
      quiz.questions.forEach(question => {
        if (savedAnswers[question.id] === question.correctAnswer) {
          recalculatedCorrect++
        }
      })
      
      const recalculatedScore = Math.round((recalculatedCorrect / quiz.questions.length) * 100)
      const matches = recalculatedScore === attempt.score
      
      console.log(`   Attempt ${i + 1}: Saved=${attempt.score}%, Recalculated=${recalculatedScore}% ${matches ? '✅' : '❌'}`)
    }

    // Test improvement tracking
    console.log('\n📊 Improvement Analysis:')
    
    const firstScore = scores[0]
    const bestImprovement = bestScore - firstScore
    const currentImprovement = latestScore - firstScore
    
    console.log(`   Starting score: ${firstScore}%`)
    console.log(`   Best improvement: ${bestImprovement >= 0 ? '+' : ''}${bestImprovement}%`)
    console.log(`   Current improvement: ${currentImprovement >= 0 ? '+' : ''}${currentImprovement}%`)
    
    if (firstPassIndex >= 0) {
      console.log(`   Attempts to pass: ${firstPassIndex + 1}`)
    } else {
      console.log(`   Attempts to pass: Not achieved yet`)
    }

    return {
      success: true,
      totalAttempts: allAttempts.length,
      bestScore,
      worstScore,
      avgScore: parseFloat(avgScore.toFixed(1)),
      passRate: parseFloat((passCount/allAttempts.length*100).toFixed(0)),
      improvement: bestImprovement
    }

  } catch (error) {
    console.error('❌ Quiz retake test failed:', error)
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
  testQuizRetake()
    .then(result => {
      console.log('\n📊 Test Result:', result)
      process.exit(result.success ? 0 : 1)
    })
    .catch(console.error)
}