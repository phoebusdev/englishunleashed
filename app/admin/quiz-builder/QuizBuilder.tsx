'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Question {
  text: string
  options: string[]
  correctAnswer: string
  explanation: string
  order: number
}

interface Pack {
  id: string
  title: string
  product: {
    title: string
  }
  quiz?: {
    id: string
    title: string
    description: string | null
    questions: Array<{
      id: string
      text: string
      options: string
      correctAnswer: string
      explanation: string | null
      order: number
    }>
  }
}

export default function QuizBuilder({ packs }: { packs: Pack[] }) {
  const router = useRouter()
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null)
  const [quizTitle, setQuizTitle] = useState('')
  const [quizDescription, setQuizDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handlePackSelect = (pack: Pack) => {
    setSelectedPack(pack)
    setError('')
    setSuccess('')
    
    if (pack.quiz) {
      // Load existing quiz data
      setQuizTitle(pack.quiz.title)
      setQuizDescription(pack.quiz.description || '')
      setQuestions(
        pack.quiz.questions.map(q => ({
          text: q.text,
          options: JSON.parse(q.options),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          order: q.order
        }))
      )
    } else {
      // Reset for new quiz
      setQuizTitle(`${pack.title} Quiz`)
      setQuizDescription('')
      setQuestions([{
        text: '',
        options: ['', '', '', ''],
        correctAnswer: '0',
        explanation: '',
        order: 0
      }])
    }
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        options: ['', '', '', ''],
        correctAnswer: '0',
        explanation: '',
        order: questions.length
      }
    ])
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    }
    setQuestions(updatedQuestions)
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].options[optionIndex] = value
    setQuestions(updatedQuestions)
  }

  const handleSubmit = async () => {
    if (!selectedPack) {
      setError('Please select a pack')
      return
    }

    if (!quizTitle) {
      setError('Please enter a quiz title')
      return
    }

    if (questions.length === 0) {
      setError('Please add at least one question')
      return
    }

    // Validate all questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.text) {
        setError(`Question ${i + 1} is missing text`)
        return
      }
      if (q.options.some(opt => !opt)) {
        setError(`Question ${i + 1} has empty options`)
        return
      }
    }

    setIsSubmitting(true)
    setError('')

    try {
      const endpoint = selectedPack.quiz 
        ? '/api/admin/quiz'
        : '/api/admin/quiz'
      
      const method = selectedPack.quiz ? 'PUT' : 'POST'
      
      const body = selectedPack.quiz
        ? { id: selectedPack.quiz.id, title: quizTitle, description: quizDescription, questions }
        : { packId: selectedPack.id, title: quizTitle, description: quizDescription, questions }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error('Failed to save quiz')
      }

      setSuccess(selectedPack.quiz ? 'Quiz updated successfully!' : 'Quiz created successfully!')
      
      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (err) {
      setError('Failed to save quiz. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Pack Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Select Pack</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packs.map((pack) => (
            <button
              key={pack.id}
              onClick={() => handlePackSelect(pack)}
              className={`p-4 border rounded-lg text-left transition-all ${
                selectedPack?.id === pack.id
                  ? 'border-[#20b2aa] bg-[#20b2aa]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold">{pack.product.title}</h3>
              <p className="text-sm text-gray-600">{pack.title}</p>
              {pack.quiz && (
                <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                  Has Quiz ({pack.quiz.questions.length} questions)
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedPack && (
        <>
          {/* Quiz Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Quiz Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quiz Title
                </label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#20b2aa]"
                  placeholder="Enter quiz title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#20b2aa]"
                  rows={3}
                  placeholder="Enter quiz description"
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Questions</h2>
              <button
                onClick={addQuestion}
                className="px-4 py-2 bg-[#20b2aa] text-white rounded-md hover:bg-[#0f8080] transition-colors"
              >
                Add Question
              </button>
            </div>

            <div className="space-y-6">
              {questions.map((question, qIndex) => (
                <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold">Question {qIndex + 1}</h3>
                    {questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Text
                      </label>
                      <textarea
                        value={question.text}
                        onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#20b2aa]"
                        rows={2}
                        placeholder="Enter question text"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Answer Options
                      </label>
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={question.correctAnswer === oIndex.toString()}
                              onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex.toString())}
                              className="flex-shrink-0"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#20b2aa]"
                              placeholder={`Option ${oIndex + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Select the radio button next to the correct answer
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Explanation (optional)
                      </label>
                      <textarea
                        value={question.explanation}
                        onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#20b2aa]"
                        rows={2}
                        placeholder="Explain why this answer is correct"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
                {success}
              </div>
            )}
            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#20b2aa] text-white rounded-md hover:bg-[#0f8080] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Saving...' : selectedPack.quiz ? 'Update Quiz' : 'Create Quiz'}
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}