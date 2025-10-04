# Claude Code Context Prompt - English Unleashed

## Quick Start Commands

### For General Development
```bash
claude "You're working on English Unleashed, an e-commerce platform for English learning materials.

Current state: feature/quiz-system-final branch with comprehensive quiz system, YouTube integration, Stripe payments, and admin panel.

Architecture: Next.js 15 App Router + Prisma PostgreSQL + NextAuth JWT + Stripe Payment Links
Key patterns: Server Components default, centralized error handling, Zod validation, CVA component variants

Critical preservation:
- Never change database provider from PostgreSQL in schema.prisma
- Preserve /api/webhooks/stripe endpoint format (payment processing)
- Maintain guest checkout 24-hour token system
- Keep admin access via user.isAdmin flag

Development workflow:
- New features need spec in specs/[number]-[name]/ following TEMPLATE
- Run 'pnpm typecheck && pnpm lint && pnpm build' before commits
- Reference .claude/steering/ for architecture context
- Use .claude/commands/ for common debugging tasks

What would you like to work on?"
```

### For Feature Development
```bash
claude "I need to implement [FEATURE NAME] in English Unleashed.

Context: Read .claude/steering/ for full architecture understanding.
Process:
1. Review specs/000-baseline/specification.md for current state
2. Create specification using specs/TEMPLATE/specification.md
3. Follow specs/DEVELOPMENT_WORKFLOW.md phases
4. Ensure backwards compatibility per existing API contracts

Current branch: feature/quiz-system-final
Tech stack: Next.js 15, Prisma PostgreSQL, Stripe, NextAuth, Tailwind CSS v4

Please help me create a proper specification for this feature following our established patterns."
```

### For Debugging Issues
```bash
claude "I'm experiencing [ISSUE DESCRIPTION] in English Unleashed.

Check these resources first:
- .claude/commands/debug-quiz-issues.md for quiz problems
- .claude/commands/fix-stripe-webhooks.md for payment issues
- .claude/commands/sync-youtube-content.md for video problems

Current environment: feature/quiz-system-final branch
Error handling: Uses centralized system in /lib/errors
Logging: Enhanced logging via /lib/dev-utils
Validation: All inputs validated with Zod schemas in /lib/validation

Please help diagnose and resolve this issue following our debugging procedures."
```

### For Performance Optimization
```bash
claude "Help optimize [COMPONENT/FEATURE] performance in English Unleashed.

Current performance targets:
- Lighthouse score > 80 (currently ~82)
- Bundle size < 500KB (currently ~450KB)
- Page load < 2s globally
- Core Web Vitals within thresholds

Architecture considerations:
- Server Components by default for data fetching
- Client Components only for interactivity
- Next.js Image optimization for all images
- Prisma query optimization with proper includes

Tools available:
- 'pnpm analyze' for bundle analysis
- Built-in Next.js performance monitoring
- Vercel Analytics integration

Review performance guidelines in .claude/steering/tech.md and optimize following established patterns."
```

### For Security Reviews
```bash
claude "Review security for [FEATURE/COMPONENT] in English Unleashed.

Security requirements:
- All user inputs validated with Zod schemas (/lib/validation)
- SQL injection prevented via Prisma (never raw SQL)
- Authentication via NextAuth JWT tokens
- Protected routes using middleware.ts
- Stripe webhooks with signature verification
- File downloads via secure JWT tokens (24h expiry)

Critical security patterns:
- Use handleApiError() for consistent error handling
- Validate user sessions in API routes
- Encrypt sensitive data (passwords via bcrypt)
- Rate limiting on auth endpoints
- CSRF protection on mutations

Check implementation against security standards in .claude/steering/tech.md"
```

### For Deployment
```bash
claude "Help deploy [CHANGES] to production for English Unleashed.

Pre-deployment checklist from .claude/commands/deploy-production.md:
- Run pnpm typecheck && pnpm lint && pnpm build locally
- Database migrations ready (if any)
- Environment variables configured in Vercel
- Feature flags set for gradual rollout

Critical production settings:
- DATABASE_URL must be PostgreSQL (never SQLite)
- NEXTAUTH_SECRET must be 32+ characters
- Stripe keys must be live (sk_live_/pk_live_)
- All webhook secrets properly configured

Follow deployment guide completely - includes health checks, monitoring setup, and rollback procedures."
```

### For Code Review
```bash
claude "Review this code for English Unleashed following our standards:

[CODE TO REVIEW]

Check against:
- .claude/steering/conventions.md for coding standards
- .claude/steering/tech.md for architectural patterns
- TypeScript strict mode compliance
- Next.js App Router best practices
- Error handling via /lib/errors
- Validation via /lib/validation
- API response standardization via /lib/api/response

Ensure:
- No breaking changes to existing APIs
- Performance impact is minimal
- Security best practices followed
- Code follows established patterns
- Tests cover new functionality"
```

### For API Development
```bash
claude "Help create/modify API endpoint for English Unleashed.

Follow established API patterns:
- Use createSuccessResponse/createErrorResponse from /lib/api/response
- Validate inputs with Zod schemas from /lib/validation
- Handle errors with handleApiError from /lib/errors
- Authenticate users via getServerSession when needed
- Never break existing API contracts

Standard API route structure:
```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = validate(Schema, body)
    // Business logic
    return createSuccessResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
```

Reference .claude/steering/tech.md for complete API patterns."
```

### For Database Work
```bash
claude "Help with database changes for English Unleashed.

Critical constraints:
- NEVER change provider from PostgreSQL in schema.prisma
- Database changes must be additive (backwards compatible)
- Use Prisma migrations for schema changes
- Test migrations locally before production

Current schema: See prisma/schema.prisma and specs/000-baseline for relationships
Migration workflow: See .claude/commands/deploy-production.md for safe migration process

Patterns to follow:
- Use Prisma for all database operations (never raw SQL)
- Include relations explicitly in queries
- Use transactions for multi-table operations
- Implement proper error handling

What database changes do you need to make?"
```

### For Admin Panel Work
```bash
claude "Working on admin panel features for English Unleashed.

Admin panel structure:
- /app/admin/* - All admin routes (protected by middleware)
- /components/admin/* - Admin-specific components
- /app/api/admin/* - Admin-only API endpoints

Admin authentication:
- Protected by user.isAdmin flag in database
- Middleware checks admin status on all /admin routes
- API endpoints verify admin permissions

Common admin tasks:
- Pack creation: See .claude/commands/create-new-pack.md
- Quiz building: Uses quiz builder components
- Order management: View/modify orders
- Analytics: User engagement and sales data

Follow admin UI patterns established in existing admin components."
```

## Context-Aware Development Commands

### Feature Branch Commands
```bash
# Start new feature with specification
claude "Start new feature [NAME] with proper spec-driven workflow"

# Continue existing feature
claude "Continue feature implementation from specs/[NUMBER]-[NAME]"

# Review feature for completion
claude "Review [FEATURE] implementation against specification"
```

### Maintenance Commands
```bash
# Update baseline after major changes
claude "Update baseline specification after [CHANGES]"

# Review technical debt
claude "Review current tech debt using specs/tech-debt-roadmap.md"

# Update steering documents
claude "Update .claude/steering/ docs after [ARCHITECTURAL_CHANGE]"
```

### Emergency Commands
```bash
# Production issue
claude "URGENT: Production issue [DESCRIPTION]. Check .claude/commands/ for emergency procedures"

# Security incident
claude "SECURITY: Potential security issue [DESCRIPTION]. Review security patterns immediately"

# Performance degradation
claude "PERFORMANCE: [METRIC] degraded. Review optimization guidelines"
```

## AI Assistant Integration Notes

### For Cursor IDE Users
Create `.cursorrules` file with:
```
You are working on English Unleashed. Read .claude/steering/ for context.
Follow specs/DEVELOPMENT_WORKFLOW.md for all feature development.
Use .claude/commands/ for common debugging procedures.
Preserve backwards compatibility - never break existing APIs.
```

### For GitHub Copilot Users
Ensure these files are open for context:
- `.claude/steering/tech.md` (architecture patterns)
- `.claude/steering/conventions.md` (coding standards)
- `specs/000-baseline/specification.md` (current system state)

### For Other AI Tools
Always reference:
1. `.claude/steering/` for persistent context
2. `specs/000-baseline/` for current state understanding
3. `.claude/commands/` for task-specific procedures
4. `specs/DEVELOPMENT_WORKFLOW.md` for process guidance

## Quick Context Refresher

When starting any development session, AI assistants should understand:

**Project**: English Unleashed - E-commerce platform for English learning materials
**Current State**: feature/quiz-system-final branch with comprehensive quiz system
**Architecture**: Next.js 15 + Prisma PostgreSQL + Stripe + NextAuth + Tailwind CSS v4
**Key Principles**: Spec-driven development, backwards compatibility, performance-first
**Critical Constraints**: Never change DB provider, preserve API contracts, maintain security patterns

**Ready to develop!** 🚀