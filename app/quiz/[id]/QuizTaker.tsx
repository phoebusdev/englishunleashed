'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Question {
  id: string
  text: string
  options: string
  correctAnswer: string
  explanation: string | null
}

interface Quiz {
  id: string
  title: string
  description: string | null
  passingScore: number | null
  questions: Question[]
}

interface QuizTakerProps {
  quiz: Quiz
  userId: string
  packTitle: string
}

export function QuizTaker({ quiz, userId, packTitle }: QuizTakerProps) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const questions = quiz.questions
  const question = questions[currentQuestion]
  const options = typeof question.options === 'string' 
    ? JSON.parse(question.options) 
    : question.options

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [question.id]: answer })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++
      }
    })
    return Math.round((correct / questions.length) * 100)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const finalScore = calculateScore()
    setScore(finalScore)

    try {
      await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quiz.id,
          userId,
          score: finalScore,
          answers
        })
      })
    } catch (error) {
      console.error('Failed to submit quiz:', error)
    }

    setShowResults(true)
    setIsSubmitting(false)
  }

  if (showResults) {
    const passed = quiz.passingScore ? score >= quiz.passingScore : true

    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-4">Quiz Results</h1>
        <p className="text-lg mb-6">{packTitle}</p>
        
        <div className={`text-4xl font-bold mb-4 ${passed ? 'text-green-600' : 'text-red-600'}`}>
          Score: {score}%
        </div>
        
        {quiz.passingScore && (
          <p className="text-gray-600 mb-6">
            {passed ? '✅ Passed' : '❌ Not Passed'} (Passing score: {quiz.passingScore}%)
          </p>
        )}

        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">Review Your Answers</h2>
          {questions.map((q, index) => {
            const userAnswer = answers[q.id]
            const isCorrect = userAnswer === q.correctAnswer
            const qOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options

            return (
              <div key={q.id} className="border rounded-lg p-4">
                <p className="font-medium mb-2">
                  {index + 1}. {q.text}
                </p>
                <p className={`text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  Your answer: {qOptions[parseInt(userAnswer)]} {isCorrect ? '✅' : '❌'}
                </p>
                {!isCorrect && (
                  <p className="text-sm text-gray-600">
                    Correct answer: {qOptions[parseInt(q.correctAnswer)]}
                  </p>
                )}
                {q.explanation && (
                  <p className="text-sm text-gray-500 mt-2">
                    Explanation: {q.explanation}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {
              setCurrentQuestion(0)
              setAnswers({})
              setShowResults(false)
              setScore(0)
            }}
            className="px-6 py-2 bg-[#20b2aa] text-white rounded-md hover:bg-[#0f8080] transition-colors"
          >
            Retake Quiz
          </button>
          <button
            onClick={() => router.push('/account')}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Account
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
        <p className="text-gray-600">{packTitle}</p>
        {quiz.description && (
          <p className="text-gray-500 mt-2">{quiz.description}</p>
        )}
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-500">
            {Object.keys(answers).length} answered
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-[#20b2aa] to-[#ff6b8a] h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{question.text}</h2>
        <div className="space-y-3">
          {(options as string[]).map((option: string, index: number) => (
            <label
              key={index}
              className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={index.toString()}
                checked={answers[question.id] === index.toString()}
                onChange={() => handleAnswer(index.toString())}
                className="mr-3"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {currentQuestion === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== questions.length || isSubmitting}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!answers[question.id]}
            className="px-6 py-2 bg-[#20b2aa] text-white rounded-md hover:bg-[#0f8080] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}