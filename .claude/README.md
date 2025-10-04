# English Unleashed - Quick Reference Card

## 🚨 Critical Facts - NEVER FORGET

1. **Database Provider**: PostgreSQL ONLY in schema.prisma (NEVER change to SQLite in production)
2. **Payment Endpoint**: /api/webhooks/stripe format is SACRED (breaking this breaks payments)
3. **Guest Access**: 24-hour JWT tokens for downloads (preserve this system)
4. **Admin Authentication**: user.isAdmin flag required for admin panel access
5. **Current Branch**: feature/quiz-system-final (comprehensive quiz system implemented)

## ⚡ Most Important Commands

```bash
# Development essentials
pnpm dev                    # Start dev server (port 3000)
pnpm build                  # MUST pass before any deployment
pnpm typecheck             # TypeScript validation
pnpm lint                  # Code quality checks
pnpm test                  # Unit tests

# Database management
pnpm db:studio             # Visual database browser
pnpm seed:admin            # Create admin user (email: admin@example.com)
pnpm db:push               # Push schema changes (dev only)

# Quality gates (run before commits)
pnpm typecheck && pnpm lint && pnpm build
```

## 📁 Code Location Cheat Sheet

### Where to Find Things
| What You Need | Location |
|---------------|----------|
| **Homepage** | `app/(public)/page.tsx` |
| **Quiz System** | `app/quiz/[id]/page.tsx` + `components/quiz/*` |
| **Admin Panel** | `app/admin/*` |
| **API Routes** | `app/api/*` |
| **Database Queries** | Server components + API routes |
| **Payment Webhooks** | `app/api/webhooks/stripe/route.ts` |
| **User Dashboard** | `app/account/*` |
| **Pack Management** | `app/admin/packs/*` |
| **Authentication Config** | `lib/auth.ts` |
| **Database Schema** | `prisma/schema.prisma` |
| **Error Handling** | `lib/errors/*` |
| **Validation Schemas** | `lib/validation/*` |

### Where to Add Things
| New Feature | Add Here |
|-------------|----------|
| **New Page** | `app/[route]/page.tsx` |
| **New API** | `app/api/[route]/route.ts` |
| **New Component** | `components/[category]/ComponentName.tsx` |
| **New Database Model** | `prisma/schema.prisma` |
| **New Validation** | `lib/validation/schemaName.ts` |
| **New Feature Spec** | `specs/[number]-[name]/specification.md` |

## ⚠️ Critical Pitfalls & How to Avoid Them

### Database Disasters
❌ **DON'T**: Change database provider in schema.prisma
✅ **DO**: Always use PostgreSQL for production

❌ **DON'T**: Modify existing column types without migration plan
✅ **DO**: Add new nullable columns, then backfill data

❌ **DON'T**: Delete columns directly
✅ **DO**: Mark as deprecated, then remove in future release

### Payment System Failures
❌ **DON'T**: Modify webhook signature verification
✅ **DO**: Use existing Stripe webhook validation exactly as-is

❌ **DON'T**: Change order status enum values
✅ **DO**: Add new statuses only, preserve existing ones

❌ **DON'T**: Store credit card data
✅ **DO**: Let Stripe handle all payment data

### Authentication Mistakes
❌ **DON'T**: Hardcode user IDs in API routes
✅ **DO**: Extract user ID from session: `session.user.id`

❌ **DON'T**: Skip session validation in protected routes
✅ **DO**: Always check session exists and user is authenticated

❌ **DON'T**: Store passwords in plain text
✅ **DO**: Use bcrypt hashing (already implemented)

### Performance Killers
❌ **DON'T**: Fetch data in client components
✅ **DO**: Use server components for data fetching

❌ **DON'T**: Import heavy libraries on client side
✅ **DO**: Use dynamic imports: `const Heavy = dynamic(() => import('./Heavy'))`

❌ **DON'T**: Load all quiz questions at once
✅ **DO**: Consider pagination for large quizzes

## 🎯 Development Patterns

### API Route Pattern
```typescript
// ALWAYS use this pattern for API routes
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = validate(Schema, body)        // Validate input
    const session = await getServerSession()   // Check auth if needed
    const result = await businessLogic(data)   // Core logic
    return createSuccessResponse(result)       // Standard response
  } catch (error) {
    return handleApiError(error)              // Centralized error handling
  }
}
```

### Component Pattern
```tsx
// Server Component (default - for data fetching)
export default async function PackList() {
  const packs = await db.pack.findMany()
  return <PackGrid packs={packs} />
}

// Client Component (for interactivity)
"use client"
export function QuizInterface({ quiz }: Props) {
  const [answers, setAnswers] = useState()
  return <div>{/* Interactive quiz */}</div>
}
```

### Error Handling Pattern
```typescript
// Use specific error types
throw new ValidationError("Invalid email", { field: "email" })
throw new AuthenticationError("Login required")
throw new NotFoundError("Pack not found")

// Assertions for business logic
assert(user.isAdmin, "Admin access required")
const order = ensureExists(await getOrder(id), "Order")
```

## 🧪 Testing Approach

### Before Every Commit
```bash
# The Holy Trinity (must all pass)
pnpm typecheck    # TypeScript compilation
pnpm lint        # ESLint + Prettier
pnpm build       # Production build

# Bonus points
pnpm test        # Unit tests
```

### Testing Critical Paths
1. **Pack Purchase Flow**: Homepage → Pack → Stripe → Download access
2. **Quiz Taking**: Pack → Quiz → Submit → Results
3. **Admin Pack Creation**: Admin login → Create pack → Upload PDF → Add quiz
4. **Mobile Experience**: All features work on phone/tablet

### Test Data
```bash
# Create admin user for testing
pnpm seed:admin
# Login: admin@example.com / admin-password

# Use Stripe test cards
# Card: 4242 4242 4242 4242
# Any future expiry, any CVC, any ZIP
```

## 🔧 Environment Quick Setup

### Required for Development
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[32+ character secret]"
```

### Required for Payments (Optional)
```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### Required for Videos (Optional)
```env
YOUTUBE_API_KEY="..."
YOUTUBE_CHANNEL_ID="..."
```

## 🚀 Deployment Checklist

### Pre-Deploy Validation
- [ ] `pnpm build` passes locally
- [ ] All tests pass (`pnpm test`)
- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Database migrations tested

### Production Environment
- [ ] DATABASE_URL is PostgreSQL (not SQLite!)
- [ ] All environment variables set in Vercel
- [ ] Stripe webhook endpoint configured
- [ ] Domain and SSL configured

### Post-Deploy Testing
- [ ] Homepage loads
- [ ] Can browse packs
- [ ] Purchase flow redirects to Stripe
- [ ] Admin panel accessible
- [ ] API health check passes

## 📊 Project Statistics

- **Framework**: Next.js 15.3.1 with App Router
- **Language**: TypeScript 5.8.3 (strict mode)
- **Database**: Prisma + PostgreSQL
- **Styling**: Tailwind CSS v4
- **Auth**: NextAuth with JWT
- **Payments**: Stripe Payment Links
- **Package Manager**: pnpm 9.1.0
- **Current Bundle**: ~450KB (target: <500KB)
- **Lighthouse Score**: ~82 (target: >80)
- **Test Coverage**: ~45% (target: >70%)

## 🆘 Emergency Procedures

### Production is Down
1. Check Vercel deployment status
2. Review recent commits for breaking changes
3. Use `.claude/commands/deploy-production.md` rollback procedures
4. Check database connectivity
5. Verify environment variables

### Payments Not Working
1. Check Stripe webhook logs in dashboard
2. Use `.claude/commands/fix-stripe-webhooks.md` guide
3. Verify webhook signature and secret
4. Test with Stripe CLI locally

### Quiz System Issues
1. Use `.claude/commands/debug-quiz-issues.md` procedures
2. Check database for quiz/question data integrity
3. Verify user session and authentication
4. Test quiz submission API endpoints

## 🎓 Learning Resources

### Project Architecture
- Read `.claude/steering/tech.md` for technical patterns
- Review `.claude/steering/structure.md` for codebase organization
- Study `specs/000-baseline/specification.md` for current system

### Development Process
- Follow `specs/DEVELOPMENT_WORKFLOW.md` for new features
- Use `specs/TEMPLATE/specification.md` for feature specs
- Reference `.claude/commands/` for common tasks

### Best Practices
- Check `.claude/steering/conventions.md` for coding standards
- Review existing components for patterns
- Study error handling in `/lib/errors`

---

**Remember**: This is an educational platform helping people learn English. Every feature should enhance the learning experience while maintaining system reliability and performance. When in doubt, prioritize user experience and backwards compatibility! 🎯