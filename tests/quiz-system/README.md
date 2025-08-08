# Quiz System Test Suite

This test suite verifies the complete quiz functionality including creation, taking, access control, and retaking.

## Test Files

1. **setup-test-data.ts** - Creates test users, products, packs, and orders
2. **test-admin-quiz-creation.ts** - Tests admin quiz creation and updating
3. **test-user-quiz-taking.ts** - Tests user taking a quiz and score calculation
4. **test-quiz-access.ts** - Tests access control and permissions
5. **test-quiz-retake.ts** - Tests multiple attempts and progress tracking
6. **run-all-tests.ts** - Orchestrates all tests in sequence

## Running Tests

### Run All Tests
```bash
npx tsx tests/quiz-system/run-all-tests.ts
```

### Run Individual Tests
```bash
# Setup test data first
npx tsx tests/quiz-system/setup-test-data.ts

# Then run individual tests
npx tsx tests/quiz-system/test-admin-quiz-creation.ts
npx tsx tests/quiz-system/test-user-quiz-taking.ts
npx tsx tests/quiz-system/test-quiz-access.ts
npx tsx tests/quiz-system/test-quiz-retake.ts
```

## Test Scenarios

### Admin Quiz Creation
- Creates a quiz with 5 multiple-choice questions
- Sets passing score to 70%
- Adds explanations for each answer
- Updates pack to indicate quiz availability
- Tests quiz update functionality

### User Quiz Taking
- Verifies user has purchased the pack
- Simulates answering questions (3 correct, 2 incorrect)
- Calculates score (60% - failing grade)
- Saves attempt to database
- Displays quiz history

### Access Control
- User accessing purchased quiz ✅
- User accessing unpurchased quiz ❌
- Admin bypassing access restrictions ✅
- Pending vs completed order verification
- User progress tracking

### Retake & Scoring
- Simulates 5 attempts with varying scores
- Tracks improvement over time
- Calculates statistics (best, worst, average)
- Tests concurrent attempt handling
- Verifies score persistence

## Expected Results

All tests should pass with the following outcomes:

1. **Setup**: Creates 2 users, 2 products, 2 packs, 1 order
2. **Quiz Creation**: Creates quiz with 5 questions
3. **Quiz Taking**: User scores 60% (3/5 correct)
4. **Access Control**: 6 access scenarios verified
5. **Retake**: Multiple attempts tracked correctly

## Test Users

- **Admin**: admin@test.com (password: testpass123)
- **User**: user@test.com (password: testpass123)

## Cleanup

Test data uses `@test.com` email domain for easy identification. The setup script automatically cleans up previous test data before creating new data.