/**
 * Centralized Validation Schemas
 * 
 * This module provides comprehensive validation schemas using Zod for the entire application.
 * All input validation, API contracts, and data transformations are defined here.
 * 
 * Benefits:
 * - Single source of truth for data shapes
 * - Runtime type checking
 * - Automatic TypeScript type inference
 * - Consistent error messages
 * - Data transformation and sanitization
 * 
 * Usage:
 * ```typescript
 * // Validate API input
 * const data = UserCreateSchema.parse(request.body)
 * 
 * // Safe parsing with error handling
 * const result = UserCreateSchema.safeParse(request.body)
 * if (!result.success) {
 *   return handleValidationError(result.error)
 * }
 * 
 * // Type inference
 * type UserCreateInput = z.infer<typeof UserCreateSchema>
 * ```
 * 
 * @module lib/validation
 */

import { z } from 'zod'

/**
 * Custom error messages for consistent user experience
 */
const ErrorMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  url: 'Please enter a valid URL',
  min: (min: number) => `Must be at least ${min} characters`,
  max: (max: number) => `Must be at most ${max} characters`,
  password: 'Password must be at least 8 characters with one uppercase, one lowercase, and one number',
  positive: 'Must be a positive number',
  integer: 'Must be a whole number',
} as const

/**
 * Common field schemas for reuse across different models
 */

/**
 * Email schema with normalization
 * - Converts to lowercase
 * - Trims whitespace
 * - Validates format
 */
export const EmailSchema = z
  .string()
  .min(1, ErrorMessages.required)
  .email(ErrorMessages.email)
  .toLowerCase()
  .trim()
  .describe('User email address')

/**
 * Password schema with security requirements
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - Optional: special character
 */
export const PasswordSchema = z
  .string()
  .min(8, ErrorMessages.min(8))
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    ErrorMessages.password
  )
  .describe('User password with security requirements')

/**
 * Weak password for legacy support
 * Used during migration or for guest accounts
 */
export const WeakPasswordSchema = z
  .string()
  .min(6, ErrorMessages.min(6))
  .describe('Legacy password format')

/**
 * MongoDB ObjectId pattern
 * Used for database IDs
 */
export const ObjectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ID format')
  .describe('MongoDB ObjectId')

/**
 * CUID pattern for Prisma IDs
 */
export const CuidSchema = z
  .string()
  .regex(/^c[a-z0-9]{24}$/, 'Invalid ID format')
  .describe('CUID identifier')

/**
 * Generic ID schema that accepts both formats
 */
export const IdSchema = z
  .string()
  .min(1, ErrorMessages.required)
  .describe('Resource identifier')

/**
 * URL schema with protocol validation
 */
export const UrlSchema = z
  .string()
  .url(ErrorMessages.url)
  .describe('Full URL with protocol')

/**
 * YouTube video ID extraction
 */
export const YouTubeVideoIdSchema = z
  .string()
  .regex(/^[a-zA-Z0-9_-]{11}$/, 'Invalid YouTube video ID')
  .describe('YouTube video identifier')

/**
 * Price in cents (positive integer)
 */
export const PriceSchema = z
  .number()
  .int(ErrorMessages.integer)
  .positive(ErrorMessages.positive)
  .describe('Price in cents')

/**
 * Pagination schemas
 */
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.enum(['asc', 'desc']).default('desc'),
  sortBy: z.string().optional(),
})

/**
 * User Authentication Schemas
 */

export const UserLoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, ErrorMessages.required),
}).describe('User login credentials')

export const UserSignupSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  name: z.string().min(1, ErrorMessages.required).max(100).trim().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).describe('New user registration')

export const UserUpdateSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  email: EmailSchema.optional(),
  currentPassword: z.string().optional(),
  newPassword: PasswordSchema.optional(),
}).refine(
  (data) => {
    // If changing password, current password is required
    if (data.newPassword && !data.currentPassword) {
      return false
    }
    return true
  },
  {
    message: 'Current password is required to set a new password',
    path: ['currentPassword'],
  }
).describe('User profile update')

export const PasswordResetRequestSchema = z.object({
  email: EmailSchema,
}).describe('Password reset request')

export const PasswordResetSchema = z.object({
  token: z.string().min(1, ErrorMessages.required),
  password: PasswordSchema,
}).describe('Password reset with token')

/**
 * Product and Pack Schemas
 */

export const ProductTypeSchema = z.enum(['PACK', 'SUBSCRIPTION', 'BUNDLE'])

export const ProductCreateSchema = z.object({
  title: z.string().min(1, ErrorMessages.required).max(200).trim(),
  description: z.string().max(1000).trim().optional(),
  price: PriceSchema,
  type: ProductTypeSchema.default('PACK'),
  active: z.boolean().default(true),
}).describe('New product creation')

export const PackCreateSchema = z.object({
  title: z.string().min(1, ErrorMessages.required).max(200).trim(),
  description: z.string().max(1000).trim().optional(),
  videoUrl: UrlSchema.optional(),
  videoId: YouTubeVideoIdSchema.optional(),
  price: PriceSchema,
}).describe('New pack creation')

export const PackUpdateSchema = z.object({
  id: IdSchema,
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(1000).trim().optional(),
  videoUrl: UrlSchema.optional(),
  videoId: YouTubeVideoIdSchema.optional(),
  pdfUrl: UrlSchema.optional(),
  hasPdf: z.boolean().optional(),
  hasQuiz: z.boolean().optional(),
  order: z.number().int().optional(),
}).describe('Pack update')

/**
 * Quiz Schemas
 */

export const QuizAnswerOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, ErrorMessages.required),
  isCorrect: z.boolean().default(false),
}).describe('Quiz answer option')

export const QuizQuestionSchema = z.object({
  id: z.string().optional(), // Optional for new questions
  text: z.string().min(1, ErrorMessages.required).max(500),
  options: z.array(QuizAnswerOptionSchema).min(2).max(6),
  correctAnswer: z.string().min(1, ErrorMessages.required),
  explanation: z.string().max(500).optional(),
  order: z.number().int().default(0),
}).refine(
  (data) => {
    // Ensure exactly one correct answer
    const correctCount = data.options.filter(opt => opt.isCorrect).length
    return correctCount === 1
  },
  {
    message: 'Each question must have exactly one correct answer',
    path: ['options'],
  }
).describe('Quiz question')

export const QuizCreateSchema = z.object({
  packId: IdSchema,
  title: z.string().min(1, ErrorMessages.required).max(200).trim(),
  description: z.string().max(500).trim().optional(),
  passingScore: z.number().int().min(0).max(100).optional(),
  questions: z.array(QuizQuestionSchema).min(1),
}).describe('New quiz creation')

export const QuizSubmissionSchema = z.object({
  quizId: IdSchema,
  answers: z.array(z.object({
    questionId: IdSchema,
    answerId: z.string(),
  })),
  timeSpent: z.number().int().positive().optional(), // Time in seconds
}).describe('Quiz submission')

/**
 * Order and Payment Schemas
 */

export const OrderStatusSchema = z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'])

export const CheckoutSessionSchema = z.object({
  packId: IdSchema,
  promoCode: z.string().optional(),
  returnUrl: UrlSchema.optional(),
}).describe('Checkout session creation')

export const StripeWebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.record(z.any()),
  }),
}).describe('Stripe webhook event')

/**
 * Admin Schemas
 */

export const AdminUserUpdateSchema = z.object({
  userId: IdSchema,
  isAdmin: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  banned: z.boolean().optional(),
}).describe('Admin user update')

export const AdminStatsQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional(),
}).describe('Admin statistics query')

/**
 * File Upload Schemas
 */

export const FileUploadSchema = z.object({
  filename: z.string().regex(/^[\w\-. ]+$/, 'Invalid filename'),
  mimetype: z.enum([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ]),
  size: z.number().positive().max(10 * 1024 * 1024), // 10MB max
}).describe('File upload validation')

/**
 * Email Schemas
 */

export const EmailSendSchema = z.object({
  to: EmailSchema,
  subject: z.string().min(1).max(200),
  template: z.enum(['welcome', 'purchase', 'password-reset', 'quiz-complete']),
  data: z.record(z.any()).optional(),
}).describe('Email send request')

/**
 * API Response Schemas
 */

export const SuccessResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
  })

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
})

export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    hasMore: z.boolean(),
  })

/**
 * Helper Functions
 */

/**
 * Validates data against a schema and throws ValidationError if invalid
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated and transformed data
 * @throws ValidationError if validation fails
 */
export function validate<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    // Import here to avoid circular dependency
    const { ValidationError } = require('../errors')
    throw new ValidationError(
      'Validation failed',
      {
        errors: result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      }
    )
  }
  
  return result.data
}

/**
 * Creates a validated API endpoint handler
 * 
 * @example
 * export const POST = createValidatedHandler(
 *   UserCreateSchema,
 *   async (data) => {
 *     // data is fully typed and validated
 *     const user = await createUser(data)
 *     return { user }
 *   }
 * )
 */
export function createValidatedHandler<T extends z.ZodType>(
  schema: T,
  handler: (data: z.infer<T>, req: Request) => Promise<any>
) {
  return async (req: Request) => {
    try {
      const body = await req.json()
      const data = validate(schema, body)
      const result = await handler(data, req)
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      // Import here to avoid circular dependency
      const { handleApiError } = require('../errors')
      return handleApiError(error)
    }
  }
}

/**
 * Sanitizes user input by removing potentially dangerous content
 * 
 * @param input - User input to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '') // Remove event handlers
    .replace(/on\w+\s*=\s*'[^']*'/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim()
}

/**
 * Type guards for runtime type checking
 */

export const isValidEmail = (value: unknown): value is string => {
  return EmailSchema.safeParse(value).success
}

export const isValidId = (value: unknown): value is string => {
  return IdSchema.safeParse(value).success
}

export const isValidPrice = (value: unknown): value is number => {
  return PriceSchema.safeParse(value).success
}

/**
 * Export type inferences for use in other modules
 */
export type UserLogin = z.infer<typeof UserLoginSchema>
export type UserSignup = z.infer<typeof UserSignupSchema>
export type UserUpdate = z.infer<typeof UserUpdateSchema>
export type ProductCreate = z.infer<typeof ProductCreateSchema>
export type PackCreate = z.infer<typeof PackCreateSchema>
export type PackUpdate = z.infer<typeof PackUpdateSchema>
export type QuizCreate = z.infer<typeof QuizCreateSchema>
export type QuizSubmission = z.infer<typeof QuizSubmissionSchema>
export type CheckoutSession = z.infer<typeof CheckoutSessionSchema>
export type Pagination = z.infer<typeof PaginationSchema>