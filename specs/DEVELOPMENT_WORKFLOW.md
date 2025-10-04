# Spec-Driven Development Workflow - English Unleashed

## Overview

This document defines the spec-driven development workflow for English Unleashed, ensuring consistent, well-documented feature development that maintains system quality and team alignment.

## Core Principles

### 1. Specification-First Development
- **Every feature starts with a specification** before any code is written
- **No implementation without documentation** of requirements and approach
- **Living documentation** that evolves with the codebase

### 2. Backwards Compatibility by Design
- **Never break existing APIs** without explicit justification and migration plan
- **Preserve user experience** while adding new capabilities
- **Database changes are additive** unless absolutely necessary

### 3. Quality Gates
- **All features must pass** TypeScript compilation, linting, and tests
- **Performance requirements** must be maintained (Lighthouse score > 80)
- **Security review** for any authentication or payment-related changes

## Workflow Phases

### Phase 1: Requirement Analysis
*Before creating any specification*

#### Prerequisites Check
```bash
# Verify you understand the current system
□ Read relevant sections of specs/000-baseline/specification.md
□ Review .claude/steering/ documents for context
□ Check existing similar features for patterns
□ Identify affected components using codebase structure guide
```

#### Stakeholder Input
```bash
# For significant features, gather input from:
□ Product requirements (business goals)
□ User feedback (pain points to address)
□ Technical constraints (performance, security)
□ Existing user workflows (compatibility requirements)
```

### Phase 2: Specification Creation

#### Step 1: Copy and Customize Template
```bash
# Create new spec directory
SPEC_NUMBER=$(find specs/ -name "[0-9]*" | wc -l | awk '{print $1+1}')
SPEC_NAME="subscription-model"  # Replace with your feature name

mkdir -p specs/$(printf "%03d" $SPEC_NUMBER)-$SPEC_NAME
cp specs/TEMPLATE/specification.md specs/$(printf "%03d" $SPEC_NUMBER)-$SPEC_NAME/

# Example: specs/003-subscription-model/specification.md
```

#### Step 2: Document Current State
```markdown
## Current State Analysis Checklist

□ **Existing Implementation**: What currently exists that this will modify?
□ **Affected Components**: List specific files, APIs, database models
□ **Current User Journey**: Step-by-step existing flow
□ **Technical Dependencies**: Libraries, services, integrations involved
□ **Data Flow**: How information currently moves through the system
□ **Performance Baseline**: Current metrics that must be maintained
```

#### Step 3: Define Proposed Changes
```markdown
## Requirements Definition Checklist

□ **User Stories**: Clear "As a [user], I want [goal] so that [benefit]"
□ **Functional Requirements**: Testable, specific behaviors
□ **Non-functional Requirements**: Performance, security, accessibility
□ **API Changes**: New endpoints, modified responses
□ **Database Changes**: Schema modifications, migrations
□ **UI/UX Changes**: New components, modified interfaces
```

#### Step 4: Plan Technical Implementation
```markdown
## Technical Planning Checklist

□ **Architecture Impact**: How this fits into existing system
□ **Database Design**: Schema changes with migration strategy
□ **API Design**: RESTful endpoints following existing patterns
□ **Component Architecture**: New/modified React components
□ **Integration Points**: External services, webhooks, etc.
□ **Security Considerations**: Authentication, authorization, data protection
□ **Performance Impact**: Load testing requirements, optimization needs
```

#### Step 5: Ensure Backwards Compatibility
```markdown
## Compatibility Preservation Checklist

□ **API Contracts**: Existing endpoints maintain response format
□ **Database Schema**: Additive changes only, or proper migration plan
□ **User Experience**: Existing workflows continue to function
□ **Data Integrity**: No data loss during migrations
□ **Third-party Integrations**: Stripe, YouTube, email services unaffected
□ **Mobile Compatibility**: Responsive design maintained
```

### Phase 3: Specification Review

#### Internal Review Process
```bash
# Create specification-only branch
git checkout -b spec/$(printf "%03d" $SPEC_NUMBER)-$SPEC_NAME
git add specs/$(printf "%03d" $SPEC_NUMBER)-$SPEC_NAME/
git commit -m "spec: add specification for $SPEC_NAME"

# Self-review checklist:
□ All template sections completed
□ References to existing code include file paths and line numbers
□ User stories are testable and specific
□ Technical approach aligns with existing patterns
□ Backwards compatibility explicitly addressed
□ Testing strategy covers unit, integration, and E2E
□ Rollout plan includes feature flags and monitoring
```

#### Specification Validation
```bash
# Validate specification completeness
□ Can a developer implement this without asking questions?
□ Are all breaking changes documented with justification?
□ Does the testing strategy cover all requirements?
□ Is the rollback plan feasible and tested?
□ Do the success metrics align with business goals?
```

### Phase 4: Implementation Planning

#### Pre-Implementation Setup
```bash
# Create implementation branch
git checkout -b feature/$(printf "%03d" $SPEC_NUMBER)-$SPEC_NAME

# Reference specification in commit messages
git commit -m "feat: implement user authentication for specs/003-subscription-model

- Add JWT token validation
- Implement subscription status checking
- Follows specs/003-subscription-model/specification.md#authentication-flow"
```

#### Implementation Order
```bash
# Recommended implementation sequence:
1. Database schema changes (migrations)
2. API endpoints (backend functionality)
3. Core business logic (utilities, services)
4. React components (UI implementation)
5. Integration testing
6. E2E testing
7. Performance optimization
```

### Phase 5: Development Execution

#### Code Implementation Guidelines
```typescript
// Reference specification in code comments
/**
 * Subscription validation middleware
 *
 * Implements user subscription checking per specs/003-subscription-model
 * Specification: specs/003-subscription-model/specification.md#authentication-flow
 *
 * @param request - Incoming request with user session
 * @returns Response with subscription status
 */
export async function validateSubscription(request: Request) {
  // Implementation follows spec requirements...
}
```

#### Quality Gates During Development
```bash
# Run these checks frequently during development
pnpm typecheck     # TypeScript compilation
pnpm lint          # Code quality checks
pnpm test          # Unit tests
pnpm build         # Production build verification

# Before each commit
pnpm prettier:fix  # Code formatting
git add . && git commit -m "feat: implement X per specs/003-feature"
```

#### Progress Tracking
```bash
# Update specification with implementation notes
## Implementation Status

### ✅ Completed
- Database schema migration
- User authentication API endpoints
- Subscription validation middleware

### 🚧 In Progress
- Payment integration with Stripe
- Subscription management UI

### ❌ Blocked
- Email notification system (waiting for Resend API key)
```

### Phase 6: Testing & Validation

#### Testing Sequence
```bash
# 1. Unit Tests
pnpm test -- --testPathPattern="subscription"

# 2. Integration Tests
pnpm test -- --testPathPattern="integration/subscription"

# 3. API Contract Tests
# Verify API responses match specification
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{"planId": "premium"}' | jq

# 4. E2E Tests
pnpm e2e:headless -- --grep "subscription flow"

# 5. Performance Tests
pnpm build && pnpm analyze
# Verify bundle size impact < 50KB
```

#### Specification Compliance Check
```bash
# Verify implementation matches specification
□ All user stories have corresponding tests
□ API endpoints match documented request/response format
□ Database schema matches specification
□ UI components implement specified functionality
□ Performance requirements are met
□ Security requirements are implemented
□ Error handling follows established patterns
```

### Phase 7: Documentation Updates

#### Update Affected Documentation
```bash
# After implementation, update relevant files:
□ specs/000-baseline/specification.md (if baseline changes)
□ .claude/steering/structure.md (if new directories added)
□ .claude/steering/tech.md (if new dependencies added)
□ .claude/steering/conventions.md (if new patterns introduced)
□ API documentation (if new endpoints added)
```

#### Implementation Documentation
```markdown
# Add to specification:
## Implementation Notes

### Decisions Made During Development
- Chose JWT over session cookies for subscription validation (better scalability)
- Implemented soft delete for subscription cancellations (data retention)
- Added caching layer for subscription status (performance optimization)

### Deviations from Original Spec
- Added subscription pause feature (user-requested during development)
- Simplified pricing tiers from 3 to 2 (business decision)

### Performance Optimizations
- Added Redis caching for subscription lookups (response time: 50ms → 10ms)
- Implemented lazy loading for subscription dashboard components
```

## Git Workflow Integration

### Branch Naming Convention
```bash
# Specification branches
spec/001-feature-name
spec/002-subscription-model
spec/003-adaptive-quizzes

# Implementation branches
feature/001-feature-name
feature/002-subscription-model
feature/003-adaptive-quizzes

# Bug fixes (no spec needed unless complex)
fix/quiz-timer-issue
fix/stripe-webhook-timeout
```

### Commit Message Format
```bash
# Specification commits
spec(subscriptions): add subscription model specification

# Implementation commits
feat(subscriptions): implement user subscription validation

Per specs/002-subscription-model/specification.md#validation-flow
- Add JWT subscription status checking
- Implement subscription expiry handling
- Add subscription renewal reminders

# Reference spec sections for clarity
fix(subscriptions): resolve subscription status caching issue

Addresses caching bug identified in specs/002-subscription-model
Cache invalidation now properly handles subscription updates
```

### Pull Request Process
```bash
# 1. Specification PR (optional for small features)
Title: "spec: Add subscription model specification"
Body: Links to business requirements, user feedback, technical constraints

# 2. Implementation PR
Title: "feat: Implement subscription model per specs/002-subscription-model"
Body:
- Link to specification
- Summary of implementation approach
- Testing coverage report
- Performance impact analysis
- Breaking changes (if any)
```

## Reference Management

### Specification References in Code
```typescript
// Use specific references to specification sections
/**
 * Implements subscription tier validation
 * Spec: specs/002-subscription-model/specification.md#tier-validation
 */

// Link to existing code from specifications
## Current Implementation
See: `app/api/auth/[...nextauth]/route.ts:45-67` for current authentication
See: `lib/stripe.ts:120-150` for payment processing
```

### Cross-Reference Updates
```bash
# When modifying existing functionality, update related specs
□ Update baseline specification if core behavior changes
□ Update feature specifications that depend on modified code
□ Update custom commands if debugging procedures change
□ Update steering documents if architectural patterns change
```

## Quality Assurance

### Pre-Commit Checklist
```bash
□ TypeScript compiles without errors
□ All tests pass (unit, integration, E2E)
□ Code follows established conventions
□ Performance benchmarks maintained
□ Security review completed (if applicable)
□ Specification updated with any implementation changes
□ Documentation reflects current behavior
```

### Pre-Release Checklist
```bash
□ Feature flag configured for gradual rollout
□ Monitoring and alerting set up
□ Rollback plan tested
□ User documentation updated
□ Admin training materials prepared (if applicable)
□ Performance impact assessed in staging environment
□ Security scan completed
□ Accessibility testing completed
```

## Maintenance Workflow

### Specification Lifecycle
```bash
# Specification states
DRAFT     → Being written, not yet approved
APPROVED  → Ready for implementation
ACTIVE    → Currently being implemented
COMPLETED → Implementation finished and deployed
ARCHIVED  → Feature deprecated or replaced
```

### Keeping Specifications Current
```bash
# Quarterly specification review
□ Update baseline specification with new features
□ Archive completed specifications
□ Update technical debt roadmap
□ Review and update steering documents
□ Clean up outdated custom commands
```

### Specification Evolution
```bash
# When requirements change during implementation
1. Update specification document
2. Document change reason and impact
3. Review backwards compatibility impact
4. Update tests to match new requirements
5. Communicate changes to stakeholders
```

This workflow ensures that English Unleashed maintains high code quality, clear documentation, and system reliability while enabling rapid feature development through structured specification-driven development.