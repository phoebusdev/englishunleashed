#!/usr/bin/env npx tsx

import { setupTestData } from './setup-test-data'
import { testAdminQuizCreation } from './test-admin-quiz-creation'
import { testUserQuizTaking } from './test-user-quiz-taking'
import { testQuizAccess } from './test-quiz-access'
import { testQuizRetake } from './test-quiz-retake'

interface TestResult {
  name: string
  success: boolean
  duration: number
  error?: string
}

async function runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    const result = await testFn()
    const duration = Date.now() - startTime
    
    return {
      name,
      success: result.success !== false,
      duration
    }
  } catch (error) {
    const duration = Date.now() - startTime
    return {
      name,
      success: false,
      duration,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function runAllTests() {
  console.log('🚀 QUIZ SYSTEM TEST SUITE')
  console.log('=' .repeat(50))
  
  const results: TestResult[] = []
  
  // Run tests in sequence
  const tests = [
    { name: '1. Setup Test Data', fn: setupTestData },
    { name: '2. Admin Quiz Creation', fn: testAdminQuizCreation },
    { name: '3. User Quiz Taking', fn: testUserQuizTaking },
    { name: '4. Quiz Access Control', fn: testQuizAccess },
    { name: '5. Quiz Retake & Scoring', fn: testQuizRetake }
  ]
  
  for (const test of tests) {
    console.log(`\n${'-'.repeat(50)}`)
    console.log(`Running: ${test.name}`)
    console.log('-'.repeat(50))
    
    const result = await runTest(test.name, test.fn)
    results.push(result)
    
    if (!result.success) {
      console.error(`\n❌ Test failed: ${test.name}`)
      if (result.error) {
        console.error(`   Error: ${result.error}`)
      }
      console.log('\nStopping test suite due to failure.')
      break
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(50))
  
  const passedTests = results.filter(r => r.success).length
  const failedTests = results.filter(r => !r.success).length
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)
  
  console.log('\nResults:')
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL'
    const time = `(${result.duration}ms)`
    console.log(`  ${status} ${result.name} ${time}`)
    if (result.error) {
      console.log(`       Error: ${result.error}`)
    }
  })
  
  console.log('\nStatistics:')
  console.log(`  Total Tests: ${results.length}`)
  console.log(`  Passed: ${passedTests}`)
  console.log(`  Failed: ${failedTests}`)
  console.log(`  Duration: ${totalDuration}ms`)
  console.log(`  Success Rate: ${((passedTests / results.length) * 100).toFixed(0)}%`)
  
  const allPassed = failedTests === 0
  
  if (allPassed) {
    console.log('\n✨ All tests passed successfully!')
  } else {
    console.log('\n❌ Some tests failed. Please review the output above.')
  }
  
  return allPassed
}

// Run the test suite
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error('Fatal error running tests:', error)
      process.exit(1)
    })
}