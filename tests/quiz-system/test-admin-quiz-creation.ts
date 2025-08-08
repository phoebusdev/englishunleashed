import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface QuizQuestion {
  text: string
  options: string[]
  correctAnswer: string
  explanation: string
  order: number
}

export async function testAdminQuizCreation() {
  console.log('\n🧪 Testing Admin Quiz Creation...')
  
  try {
    // Find the test pack
    const pack = await prisma.pack.findFirst({
      where: { title: 'Test Pack - Beginner Lesson' }
    })
    
    if (!pack) {
      throw new Error('Test pack not found. Run setup-test-data.ts first')
    }

    console.log('📦 Found test pack:', pack.title)

    // Prepare quiz data
    const quizData = {
      packId: pack.id,
      title: 'Beginner English Quiz',
      description: 'Test your understanding of basic English concepts',
      passingScore: 70,
      questions: [
        {
          text: 'What is the correct form of the verb "to be" for "I"?',
          options: ['am', 'is', 'are', 'be'],
          correctAnswer: '0',
          explanation: 'With the pronoun "I", we always use "am" (I am)',
          order: 0
        },
        {
          text: 'Which article should be used before "apple"?',
          options: ['a', 'an', 'the', 'no article'],
          correctAnswer: '1',
          explanation: 'We use "an" before words starting with vowel sounds',
          order: 1
        },
        {
          text: 'Choose the correct plural form of "child"',
          options: ['childs', 'childes', 'children', 'childrens'],
          correctAnswer: '2',
          explanation: 'Child is an irregular noun, its plural is "children"',
          order: 2
        },
        {
          text: 'What is the past tense of "go"?',
          options: ['goed', 'went', 'gone', 'going'],
          correctAnswer: '1',
          explanation: 'Go is an irregular verb, its past tense is "went"',
          order: 3
        },
        {
          text: 'Which sentence is grammatically correct?',
          options: [
            'She don\'t like coffee',
            'She doesn\'t likes coffee',
            'She doesn\'t like coffee',
            'She don\'t likes coffee'
          ],
          correctAnswer: '2',
          explanation: 'With third person singular (she), we use "doesn\'t" + base verb',
          order: 4
        }
      ] as QuizQuestion[]
    }

    // Create the quiz
    console.log('🎯 Creating quiz with', quizData.questions.length, 'questions...')
    
    const quiz = await prisma.quiz.create({
      data: {
        packId: pack.id,
        title: quizData.title,
        description: quizData.description,
        passingScore: quizData.passingScore,
        questions: {
          create: quizData.questions.map(q => ({
            text: q.text,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            order: q.order
          }))
        }
      },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    })

    console.log('✅ Quiz created successfully!')
    console.log('   - Quiz ID:', quiz.id)
    console.log('   - Title:', quiz.title)
    console.log('   - Questions:', quiz.questions.length)
    console.log('   - Passing Score:', quiz.passingScore + '%')

    // Update pack to indicate it has a quiz
    await prisma.pack.update({
      where: { id: pack.id },
      data: { hasQuiz: true }
    })
    console.log('✅ Pack updated: hasQuiz = true')

    // Verify quiz structure
    console.log('\n📋 Verifying quiz structure:')
    for (const question of quiz.questions) {
      const options = JSON.parse(question.options as string)
      console.log(`   Q${question.order + 1}: ${question.text.substring(0, 50)}...`)
      console.log(`      - Options: ${options.length} choices`)
      console.log(`      - Correct: Option ${parseInt(question.correctAnswer) + 1} (${options[parseInt(question.correctAnswer)]})`)
      console.log(`      - Has explanation: ${question.explanation ? 'Yes' : 'No'}`)
    }

    // Test updating an existing quiz
    console.log('\n🔄 Testing quiz update...')
    
    const updatedQuiz = await prisma.quiz.update({
      where: { id: quiz.id },
      data: {
        description: 'Updated description for testing',
        passingScore: 75
      }
    })
    
    console.log('✅ Quiz updated:')
    console.log('   - New description:', updatedQuiz.description)
    console.log('   - New passing score:', updatedQuiz.passingScore + '%')

    return {
      success: true,
      quizId: quiz.id,
      questionsCreated: quiz.questions.length
    }

  } catch (error) {
    console.error('❌ Admin quiz creation test failed:', error)
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
  testAdminQuizCreation()
    .then(result => {
      console.log('\n📊 Test Result:', result)
      process.exit(result.success ? 0 : 1)
    })
    .catch(console.error)
}