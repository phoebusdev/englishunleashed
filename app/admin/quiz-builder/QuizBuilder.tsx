'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AdminCard,
  AdminButton,
  FormInput,
  FormTextarea,
  ConfirmDialog,
  EmptyState,
  NoDataIcon,
  useToast
} from '@/components/admin/ui'

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
  const { toast } = useToast()
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null)
  const [quizTitle, setQuizTitle] = useState('')
  const [quizDescription, setQuizDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null)

  const handlePackSelect = (pack: Pack) => {
    setSelectedPack(pack)
    
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

  const handleDeleteQuestion = (index: number) => {
    setQuestionToDelete(index)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteQuestion = () => {
    if (questionToDelete !== null) {
      setQuestions(questions.filter((_, i) => i !== questionToDelete))
      setQuestionToDelete(null)
      toast('success', 'Question deleted', 'Question removed from quiz')
    }
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
      toast('error', 'Validation Error', 'Please select a pack')
      return
    }

    if (!quizTitle) {
      toast('error', 'Validation Error', 'Please enter a quiz title')
      return
    }

    if (questions.length === 0) {
      toast('error', 'Validation Error', 'Please add at least one question')
      return
    }

    // Validate all questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q?.text) {
        toast('error', 'Validation Error', `Question ${i + 1} is missing text`)
        return
      }
      if (q.options.some(opt => !opt)) {
        toast('error', 'Validation Error', `Question ${i + 1} has empty options`)
        return
      }
    }

    setIsSubmitting(true)

    try {
      const endpoint = '/api/admin/quiz'
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

      toast(
        'success',
        selectedPack.quiz ? 'Quiz Updated' : 'Quiz Created',
        `${quizTitle} has been saved successfully`
      )

      // Refresh the page
      router.refresh()
    } catch (err) {
      toast('error', 'Save Failed', 'Failed to save quiz. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (packs.length === 0) {
    return (
      <EmptyState
        title="No packs available"
        description="Create a pack first before building quizzes"
        icon={<NoDataIcon />}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Pack Selection */}
      <AdminCard title="Select Pack" description="Choose a pack to create or edit its quiz">
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
      </AdminCard>

      {selectedPack && (
        <>
          {/* Quiz Details */}
          <AdminCard title="Quiz Details" description="Basic quiz information">
            <div className="space-y-4">
              <FormInput
                label="Quiz Title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Enter quiz title"
                required
              />
              <FormTextarea
                label="Description (optional)"
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                rows={3}
                placeholder="Enter quiz description"
              />
            </div>
          </AdminCard>

          {/* Questions */}
          <AdminCard
            title="Questions"
            description={`${questions.length} question${questions.length !== 1 ? 's' : ''} in quiz`}
            actions={
              <AdminButton onClick={addQuestion} size="sm">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Question
              </AdminButton>
            }
          >

            <div className="space-y-6">
              {questions.map((question, qIndex) => (
                <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold">Question {qIndex + 1}</h3>
                    {questions.length > 1 && (
                      <AdminButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteQuestion(qIndex)}
                      >
                        Remove
                      </AdminButton>
                    )}
                  </div>

                  <div className="space-y-4">
                    <FormTextarea
                      label="Question Text"
                      value={question.text}
                      onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                      rows={2}
                      placeholder="Enter question text"
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Answer Options <span className="text-red-500">*</span>
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

                    <FormTextarea
                      label="Explanation (optional)"
                      value={question.explanation}
                      onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                      rows={2}
                      placeholder="Explain why this answer is correct"
                    />
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>

          {/* Actions */}
          <AdminCard>
            <div className="flex justify-end gap-4">
              <AdminButton
                variant="outline"
                onClick={() => router.push('/admin')}
              >
                Cancel
              </AdminButton>
              <AdminButton
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {selectedPack.quiz ? 'Update Quiz' : 'Create Quiz'}
              </AdminButton>
            </div>
          </AdminCard>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Question"
        description={`Are you sure you want to delete question ${(questionToDelete ?? 0) + 1}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDeleteQuestion}
      />
    </div>
  )
}