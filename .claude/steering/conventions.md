# Development Conventions - English Unleashed

## Git Workflow & Branch Management

### Branch Naming Strategy
```bash
# Feature development
feature/quiz-system-improvements
feature/stripe-checkout-optimization
feature/admin-dashboard-redesign

# Bug fixes
fix/video-loading-issue
fix/payment-webhook-timeout
fix/mobile-navigation-bug

# Chores and maintenance
chore/dependency-updates
chore/cleanup-unused-imports
chore/optimize-bundle-size

# Documentation
docs/api-documentation-update
docs/setup-instructions-revision

# Hotfixes (production issues)
hotfix/critical-payment-bug
hotfix/database-connection-issue
```

### Commit Message Convention (Conventional Commits)
```bash
# Format: type(scope): description
feat(quiz): add timer functionality with audio alerts
fix(auth): resolve session timeout on mobile devices
docs(api): update webhook endpoint documentation
style(ui): improve button hover states and animations
refactor(db): optimize quiz query performance
test(e2e): add purchase flow automation tests
chore(deps): update Next.js to version 15.3.1

# Breaking changes
feat(api)!: restructure quiz submission response format

BREAKING CHANGE: Quiz submission now returns { success, score, answers }
instead of legacy { result, grade } format.
```

### Commit Types
- **feat**: New features or functionality
- **fix**: Bug fixes
- **docs**: Documentation changes
- **style**: Code formatting, CSS changes
- **refactor**: Code restructuring without behavior change
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates
- **ci**: CI/CD configuration changes

### Pull Request Process
1. **Create feature branch** from latest main
2. **Develop with frequent commits** using conventional format
3. **Update relevant tests** (unit, integration, E2E)
4. **Run quality checks** locally before pushing
5. **Create PR** with descriptive title and body
6. **Request review** from team members
7. **Address feedback** and re-request review
8. **Merge** using squash and merge strategy

## Code Style & Formatting

### TypeScript Conventions
```typescript
// Prefer explicit return types for functions
export async function createQuizAttempt(
  quizId: string,
  userId: string,
  answers: QuizAnswer[]
): Promise<QuizAttempt> {
  // Implementation
}

// Use type assertions sparingly, prefer type guards
function isQuizComplete(quiz: Quiz | null): quiz is Quiz {
  return quiz !== null && quiz.questions.length > 0
}

// Prefer interfaces for object shapes
interface QuizSubmissionProps {
  quiz: Quiz
  onSubmit: (answers: QuizAnswer[]) => Promise<void>
  onCancel: () => void
}

// Use enums for fixed value sets
enum QuizStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived"
}

// Prefer type inference when obvious
const users = await db.user.findMany() // Type inferred as User[]
```

### React Component Patterns
```tsx
// Props interface before component
interface QuizCardProps {
  quiz: Quiz
  showProgress?: boolean
  onStart?: (quizId: string) => void
  className?: string
}

// Default export for pages, named export for components
export function QuizCard({
  quiz,
  showProgress = false,
  onStart,
  className
}: QuizCardProps) {
  return (
    <Card className={cn("quiz-card", className)}>
      {/* Component content */}
    </Card>
  )
}

// Server Component pattern (no "use client")
export default async function QuizListPage() {
  const quizzes = await db.quiz.findMany({
    include: { pack: true }
  })

  return (
    <div className="container mx-auto py-8">
      <QuizGrid quizzes={quizzes} />
    </div>
  )
}

// Client Component pattern (interactive only)
"use client"
export function QuizTimer({ duration, onTimeUp }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    // Timer logic
  }, [])

  return <div>{formatTime(timeLeft)}</div>
}
```

### CSS & Styling Conventions
```tsx
// Tailwind utility classes preferred over custom CSS
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">

// Use CVA for component variants
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
        destructive: "bg-red-600 text-white hover:bg-red-700"
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
)

// Use cn() for conditional classes
<Button
  className={cn(
    buttonVariants({ variant, size }),
    isLoading && "opacity-50 cursor-not-allowed",
    className
  )}
>
```

## API Design Conventions

### Request/Response Patterns
```typescript
// Standardized API response format
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    message: string
    code: string
    details?: Record<string, any>
  }
  meta?: {
    timestamp: string
    requestId: string
    pagination?: PaginationInfo
  }
}

// API route structure
export async function POST(request: Request) {
  try {
    // 1. Parse and validate input
    const body = await request.json()
    const validatedData = validate(QuizSubmissionSchema, body)

    // 2. Authenticate and authorize
    const session = await getServerSession(authOptions)
    if (!session) {
      return createErrorResponse("Unauthorized", 401)
    }

    // 3. Business logic
    const result = await processQuizSubmission(validatedData, session.user.id)

    // 4. Return standardized response
    return createSuccessResponse(result, "Quiz submitted successfully")

  } catch (error) {
    // 5. Centralized error handling
    return handleApiError(error)
  }
}
```

### Error Handling Standards
```typescript
// Use specific error types
throw new ValidationError("Invalid email format", { field: "email" })
throw new AuthenticationError("Invalid credentials")
throw new NotFoundError("Quiz not found")
throw new BusinessLogicError("Quiz already completed")

// Never expose internal errors to client
❌ return { error: error.message } // Might expose sensitive info
✅ return createErrorResponse("Something went wrong", 500) // Safe generic message

// Log errors with context
console.error('Quiz submission failed', {
  userId: session.user.id,
  quizId: validatedData.quizId,
  error: error.message,
  timestamp: new Date().toISOString()
})
```

## Database Conventions

### Prisma Query Patterns
```typescript
// Always include relations explicitly
const pack = await db.pack.findUnique({
  where: { id: packId },
  include: {
    product: { select: { title: true, price: true } },
    quiz: {
      include: {
        questions: {
          include: { answers: true },
          orderBy: { order: 'asc' }
        }
      }
    }
  }
})

// Use transactions for related operations
await db.$transaction([
  db.order.create({
    data: orderData
  }),
  db.emailQueue.create({
    data: emailNotificationData
  }),
  db.analytics.create({
    data: purchaseEventData
  })
])

// Prefer findUniqueOrThrow for required records
const quiz = await db.quiz.findUniqueOrThrow({
  where: { id: quizId },
  include: { questions: { include: { answers: true } } }
})

// Use proper error handling for database operations
try {
  const user = await db.user.create({ data: userData })
  return user
} catch (error) {
  if (error.code === 'P2002') {
    throw new ValidationError('Email already exists')
  }
  throw error
}
```

### Migration Practices
```sql
-- Always use descriptive migration names
-- Format: YYYYMMDD_description
-- Example: 20240315_add_quiz_timer_functionality

-- Add columns as nullable first
ALTER TABLE "Quiz" ADD COLUMN "timeLimit" INTEGER;

-- Then update existing records
UPDATE "Quiz" SET "timeLimit" = 1800 WHERE "timeLimit" IS NULL;

-- Finally make NOT NULL if needed (separate migration)
-- 20240316_make_quiz_time_limit_required
ALTER TABLE "Quiz" ALTER COLUMN "timeLimit" SET NOT NULL;
```

## Testing Conventions

### Test Structure
```typescript
// Descriptive test names following "should [behavior] when [condition]"
describe('QuizSubmission', () => {
  describe('validateAnswers', () => {
    it('should return valid when all questions are answered', () => {
      // Arrange
      const quiz = createMockQuiz(3)
      const answers = createCompleteAnswers(quiz.questions)

      // Act
      const result = validateAnswers(quiz, answers)

      // Assert
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return invalid when required questions are missing', () => {
      // Test implementation
    })
  })
})

// Use data-testid for E2E test selectors
<Button data-testid="submit-quiz-button" onClick={handleSubmit}>
  Submit Quiz
</Button>

// E2E test structure
test('complete quiz submission flow', async ({ page }) => {
  // Arrange
  await page.goto('/quiz/test-quiz-id')

  // Act
  await page.click('[data-testid="answer-option-1"]')
  await page.click('[data-testid="answer-option-2"]')
  await page.click('[data-testid="submit-quiz-button"]')

  // Assert
  await expect(page.locator('[data-testid="quiz-score"]')).toContainText('80%')
})
```

### Mock Patterns
```typescript
// Mock external services
jest.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({
        type: 'checkout.session.completed',
        data: { object: mockCheckoutSession }
      })
    }
  }
}))

// Mock database with realistic data
const mockDb = {
  quiz: {
    findUnique: jest.fn().mockResolvedValue(mockQuiz),
    create: jest.fn().mockResolvedValue(mockQuizAttempt)
  }
}
```

## File Organization Standards

### Import Order
```typescript
// 1. React and Next.js
import React, { useState, useEffect } from 'react'
import { NextRequest, NextResponse } from 'next/server'
import Image from 'next/image'

// 2. External libraries (alphabetical)
import { Button } from '@radix-ui/react-button'
import { z } from 'zod'
import { stripe } from 'stripe'

// 3. Internal utilities and configuration
import { cn } from '@/lib/utils'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// 4. Internal types
import type { Quiz, QuizAttempt } from '@/types/quiz.types'

// 5. Internal components (alphabetical)
import { QuizCard } from '@/components/quiz/QuizCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
```

### File Naming
```bash
# Components: PascalCase
QuizCard.tsx
UserDashboard.tsx
AdminSidebar.tsx

# Utilities: camelCase
formatPrice.ts
validateEmail.ts
calculateScore.ts

# Pages: Next.js convention
page.tsx
layout.tsx
loading.tsx
error.tsx
not-found.tsx

# API routes: Next.js convention
route.ts

# Types: PascalCase with .types.ts
quiz.types.ts
user.types.ts
api.types.ts

# Tests: Mirror source structure
QuizCard.test.tsx
formatPrice.test.ts
quiz-submission.e2e.ts
```

## Environment & Configuration

### Environment Variable Naming
```bash
# Database
DATABASE_URL=
DIRECT_DATABASE_URL=
PRISMA_ACCELERATE_URL=

# Authentication
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Third-party services
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
YOUTUBE_API_KEY=
RESEND_API_KEY=
BLOB_READ_WRITE_TOKEN=

# Feature flags
FEATURE_SUBSCRIPTIONS_ENABLED=false
FEATURE_LIVE_CHAT_ENABLED=false

# Security
CRON_SECRET=
ADMIN_API_KEY=
```

### Configuration File Standards
```typescript
// Use T3 Env for type-safe environment variables
export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(32),
    STRIPE_SECRET_KEY: z.string().startsWith("sk_")
  },
  client: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_")
  },
  runtimeEnv: process.env
})
```

## Performance Guidelines

### Code Splitting
```typescript
// Dynamic imports for heavy components
const AdminDashboard = dynamic(() => import('@/components/admin/AdminDashboard'), {
  loading: () => <AdminSkeleton />,
  ssr: false
})

// Route-level code splitting automatic with App Router
// Component-level splitting for optional features
const AdvancedQuizEditor = dynamic(() =>
  import('@/components/quiz/AdvancedQuizEditor')
    .then(mod => ({ default: mod.AdvancedQuizEditor }))
)
```

### Bundle Size Management
```bash
# Monitor bundle size
pnpm analyze

# Check individual component impact
pnpm build && ls -la .next/static/chunks/

# Keep core bundles under thresholds
# Main bundle: <300KB gzipped
# Individual pages: <100KB gzipped
# Shared chunks: <150KB gzipped
```

### Database Query Optimization
```typescript
// Select only needed fields
const users = await db.user.findMany({
  select: {
    id: true,
    email: true,
    name: true
    // Don't select password, large text fields, etc.
  }
})

// Use pagination for lists
const quizzes = await db.quiz.findMany({
  take: 20,
  skip: page * 20,
  orderBy: { createdAt: 'desc' }
})

// Batch related queries
const [packs, totalCount] = await db.$transaction([
  db.pack.findMany({ where: filters }),
  db.pack.count({ where: filters })
])
```

This comprehensive set of conventions ensures consistency, maintainability, and quality across the English Unleashed codebase.