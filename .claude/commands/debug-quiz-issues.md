# Debug Quiz System Issues

When quiz-related problems occur, follow this systematic debugging process.

## 1. Quick Health Check

```bash
# Check if quiz exists in database
pnpm db:studio
# Navigate to Quiz table and verify quiz record exists

# Test quiz API endpoint directly
curl http://localhost:3000/api/quiz/[quiz-id] | jq

# Check quiz questions and answers
curl http://localhost:3000/api/quiz/[quiz-id] | jq '.questions[].answers'
```

## 2. Common Quiz Issues & Solutions

### Issue: Quiz Not Loading
**Symptoms**: Blank quiz page, loading spinner never stops

**Debug Steps**:
1. Check browser console for JavaScript errors
2. Verify quiz ID is valid: `app/quiz/[id]/page.tsx:line 15`
3. Check database for quiz record
4. Verify pack.hasQuiz is true

**Fix Commands**:
```bash
# Check if quiz exists
npx tsx -e "
import { db } from './lib/db'
const quiz = await db.quiz.findUnique({
  where: { id: 'quiz-id' },
  include: { questions: { include: { answers: true } } }
})
console.log(quiz)
"

# Enable quiz for pack
npx tsx -e "
import { db } from './lib/db'
await db.pack.update({
  where: { id: 'pack-id' },
  data: { hasQuiz: true }
})
"
```

### Issue: Quiz Submission Failing
**Symptoms**: Error on submit, answers not saving

**Debug Steps**:
1. Check network tab for failed API calls
2. Verify user authentication: `lib/auth.ts:line 45`
3. Check answer validation: `lib/validation/quiz.schemas.ts`
4. Review submission format in `app/api/quiz/submit/route.ts`

**Test Submission Format**:
```bash
# Test valid submission format
curl -X POST http://localhost:3000/api/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{
    "quizId": "clx123...",
    "answers": [
      {"questionId": "clx456...", "answerId": "clx789..."}
    ],
    "startTime": 1640000000000,
    "endTime": 1640000300000
  }'
```

### Issue: Incorrect Scoring
**Symptoms**: Wrong scores displayed, calculation errors

**Debug Steps**:
1. Check scoring logic in `app/api/quiz/submit/route.ts:line 67`
2. Verify answer.isCorrect flags in database
3. Review QuizAttempt creation logic

**Verify Answer Correctness**:
```sql
-- Run in Prisma Studio or database client
SELECT
  q.text as question,
  a.text as answer,
  a.isCorrect
FROM Question q
JOIN Answer a ON a.questionId = q.id
WHERE q.quizId = 'your-quiz-id'
ORDER BY q.order, a.id;
```

## 3. Performance Issues

### Quiz Loading Slowly
**Problem**: Large quizzes take too long to load

**Solutions**:
```typescript
// Check if quiz has too many questions
// File: app/quiz/[id]/page.tsx
const quiz = await db.quiz.findUnique({
  where: { id },
  include: {
    questions: {
      include: { answers: true },
      orderBy: { order: 'asc' }
    }
  }
})

// If quiz has >50 questions, consider pagination
if (quiz.questions.length > 50) {
  // Implement pagination in quiz component
}
```

### Database Query Optimization
```typescript
// Optimize quiz queries
// File: app/api/quiz/[id]/route.ts
const quiz = await db.quiz.findUnique({
  where: { id },
  select: {
    id: true,
    title: true,
    timeLimit: true,
    questions: {
      select: {
        id: true,
        text: true,
        order: true,
        answers: {
          select: {
            id: true,
            text: true,
            // Don't select isCorrect for security
          }
        }
      },
      orderBy: { order: 'asc' }
    }
  }
})
```

## 4. Data Integrity Checks

### Orphaned Questions/Answers
```bash
# Check for questions without quizzes
npx tsx -e "
import { db } from './lib/db'
const orphaned = await db.question.findMany({
  where: { quiz: null },
  include: { answers: true }
})
console.log('Orphaned questions:', orphaned.length)
"

# Check for answers without questions
npx tsx -e "
import { db } from './lib/db'
const orphaned = await db.answer.findMany({
  where: { question: null }
})
console.log('Orphaned answers:', orphaned.length)
"
```

### Missing Correct Answers
```bash
# Check for questions without correct answers
npx tsx -e "
import { db } from './lib/db'
const questionsWithoutCorrectAnswers = await db.question.findMany({
  where: {
    answers: {
      none: { isCorrect: true }
    }
  },
  include: { quiz: true }
})
console.log('Questions without correct answers:', questionsWithoutCorrectAnswers)
"
```

## 5. Reset Quiz Data (Development Only)

```bash
# Clear all quiz attempts for testing
npx tsx -e "
import { db } from './lib/db'
if (process.env.NODE_ENV !== 'production') {
  await db.quizAttempt.deleteMany()
  console.log('All quiz attempts cleared')
} else {
  console.log('Cannot clear data in production')
}
"

# Reset specific user's quiz attempts
npx tsx -e "
import { db } from './lib/db'
const userId = 'user-id-here'
await db.quizAttempt.deleteMany({
  where: { userId }
})
console.log(\`Cleared quiz attempts for user \${userId}\`)
"
```

## 6. Quiz Builder Issues

### Quiz Builder Not Saving
**Problem**: Admin can't save new quizzes

**Debug Steps**:
1. Check admin authentication: `app/admin/layout.tsx:line 12`
2. Verify form validation: `components/admin/QuizBuilder.tsx`
3. Check API endpoint: `app/api/admin/quizzes/route.ts`

**Test Quiz Creation**:
```bash
# Test quiz creation API
curl -X POST http://localhost:3000/api/admin/quizzes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [admin-jwt]" \
  -d '{
    "packId": "pack-id",
    "title": "Test Quiz",
    "questions": [
      {
        "text": "Test question?",
        "answers": [
          {"text": "Option A", "isCorrect": false},
          {"text": "Option B", "isCorrect": true}
        ]
      }
    ]
  }'
```

## 7. Monitor Quiz Performance

```bash
# Check quiz completion rates
npx tsx -e "
import { db } from './lib/db'
const stats = await db.quizAttempt.groupBy({
  by: ['quizId'],
  _count: { id: true },
  _avg: { score: true }
})
console.log('Quiz completion stats:', stats)
"

# Check average quiz duration
npx tsx -e "
import { db } from './lib/db'
const attempts = await db.quizAttempt.findMany({
  select: {
    startTime: true,
    endTime: true,
    quiz: { select: { title: true } }
  }
})
const durations = attempts.map(a => ({
  quiz: a.quiz.title,
  duration: a.endTime.getTime() - a.startTime.getTime()
}))
console.log('Average durations (ms):', durations)
"
```

## 8. Emergency Quiz Fixes

### Disable Problematic Quiz
```bash
# Temporarily disable quiz
npx tsx -e "
import { db } from './lib/db'
await db.pack.update({
  where: { id: 'pack-id' },
  data: { hasQuiz: false }
})
console.log('Quiz disabled for pack')
"
```

### Fix Quiz Timer Issues
```typescript
// Check timer logic in QuizTimer component
// File: components/quiz/QuizTimer.tsx:line 23
// Ensure timer doesn't go negative
const timeLeft = Math.max(0, timeRemaining)
```

Use this debugging guide to systematically identify and resolve quiz-related issues in English Unleashed.