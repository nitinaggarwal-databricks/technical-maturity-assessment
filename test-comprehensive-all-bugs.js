#!/usr/bin/env node

/**
 * COMPREHENSIVE TEST SUITE: All Bug Fixes + Integration Tests
 * 
 * This test suite covers:
 * 1. Critical Bug #1: Null responses object
 * 2. Critical Bug #2: String-to-number type mismatch
 * 3. Critical Bug #3: Missing getStats method
 * 4. Integration tests: Partial and full assessments
 * 5. Data persistence and retrieval
 * 6. Save progress functionality
 * 7. Results accuracy and consistency
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const API_BASE_URL = 'http://localhost:5000/api';

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
}

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  tests: []
};

function recordTest(category, name, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`  ✅ ${name}`, colors.green);
  } else {
    testResults.failed++;
    log(`  ❌ ${name}`, colors.red);
    if (details) log(`     ${details}`, colors.yellow);
  }
  testResults.tests.push({ category, name, passed, details });
}

// Helper to make API calls
async function apiCall(method, endpoint, data = null) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = { method, url };
    if (data) config.data = data;
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let frameworkCache = null;
async function getFramework() {
  if (frameworkCache) return frameworkCache;
  const result = await apiCall('GET', '/assessment/framework');
  frameworkCache = result.data.data;
  return frameworkCache;
}

// ============================================================================
// TEST CATEGORY 1: API HEALTH & INFRASTRUCTURE
// ============================================================================
async function testApiHealth() {
  log('\n' + '='.repeat(80), colors.bright);
  log('TEST CATEGORY 1: API HEALTH & INFRASTRUCTURE', colors.bright + colors.cyan);
  log('='.repeat(80), colors.bright);

  // Test 1: Server is running
  const health = await apiCall('GET', '/health');
  recordTest('API Health', 'Server responds to health check', health.success && health.status === 200);

  // Test 2: Status endpoint works (Bug #3 fix)
  const status = await apiCall('GET', '/../status');
  recordTest('API Health', 'Status endpoint works without errors', status.success && !status.data.error, 
    status.success ? '' : `Error: ${JSON.stringify(status.error)}`);

  // Test 3: Status returns proper structure
  const hasStorageInfo = status.success && status.data.storage;
  recordTest('API Health', 'Status returns storage information', hasStorageInfo);

  // Test 4: Assessment framework loads
  const framework = await getFramework();
  const hasAreas = framework && framework.assessmentAreas && framework.assessmentAreas.length === 6;
  recordTest('API Health', 'Assessment framework loads with 6 pillars', hasAreas);
}

// ============================================================================
// TEST CATEGORY 2: BUG FIX #1 - NULL RESPONSES HANDLING
// ============================================================================
async function testNullResponsesHandling() {
  log('\n' + '='.repeat(80), colors.bright);
  log('TEST CATEGORY 2: NULL RESPONSES HANDLING (Bug Fix #1)', colors.bright + colors.cyan);
  log('='.repeat(80), colors.bright);

  // Test 5: Create assessment with no responses
  const createResult = await apiCall('POST', '/assessment/start', {
    assessmentName: 'Null Test',
    organizationName: 'Test Org',
    contactEmail: 'null-test@example.com',
    industry: 'Technology'
  });
  
  const assessmentId = createResult.data?.data?.assessmentId;
  recordTest('Null Handling', 'Create assessment succeeds', createResult.success && !!assessmentId);

  if (!assessmentId) {
    log('  ⚠️  Skipping remaining null handling tests due to creation failure', colors.yellow);
    return;
  }

  // Test 6: Get results with no responses (should not crash)
  await delay(500);
  const emptyResults = await apiCall('GET', `/assessment/${assessmentId}/results`);
  const noError = emptyResults.success && !emptyResults.data.error;
  recordTest('Null Handling', 'Get results with no responses does not crash', noError);

  // Test 7: Scores default to 0 for empty assessment
  const scoresAreZero = emptyResults.data?.data?.overall?.currentScore === 0 &&
                        emptyResults.data?.data?.overall?.futureScore === 0;
  recordTest('Null Handling', 'Empty assessment returns 0 scores (not null/undefined)', scoresAreZero);

  // Test 8: Executive summary exists even with no data
  const hasSummary = emptyResults.data?.data?.overall?.summary?.length > 0;
  recordTest('Null Handling', 'Executive summary generated even with no responses', hasSummary);

  // Test 9: Pillar results handle empty responses
  const pillarResult = await apiCall('GET', `/assessment/${assessmentId}/pillar/platform_governance/results`);
  const pillarNoData = !pillarResult.success && pillarResult.status === 400; // Should return 400 with message
  recordTest('Null Handling', 'Pillar results properly handle no responses', pillarNoData);
}

// ============================================================================
// TEST CATEGORY 3: BUG FIX #2 - STRING TO NUMBER CONVERSION
// ============================================================================
async function testStringToNumberConversion() {
  log('\n' + '='.repeat(80), colors.bright);
  log('TEST CATEGORY 3: STRING-TO-NUMBER CONVERSION (Bug Fix #2)', colors.bright + colors.cyan);
  log('='.repeat(80), colors.bright);

  // Create test assessment
  const createResult = await apiCall('POST', '/assessment/start', {
    assessmentName: 'String Test',
    organizationName: 'Test Org',
    contactEmail: 'string-test@example.com',
    industry: 'Technology'
  });
  
  const assessmentId = createResult.data?.data?.assessmentId;
  recordTest('String Conversion', 'Create test assessment', createResult.success && !!assessmentId);

  if (!assessmentId) {
    log('  ⚠️  Skipping string conversion tests', colors.yellow);
    return;
  }

  // Test 10: Save string value "3"
  const saveString = await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
    questionId: 'env_standardization',
    perspectiveId: 'current_state',
    value: '3', // STRING
    editorEmail: 'test@example.com'
  });
  recordTest('String Conversion', 'Save progress with string value "3"', saveString.success);

  // Test 11: Save number value 4
  const saveNumber = await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
    questionId: 'env_standardization',
    perspectiveId: 'future_state',
    value: 4, // NUMBER
    editorEmail: 'test@example.com'
  });
  recordTest('String Conversion', 'Save progress with number value 4', saveNumber.success);

  await delay(1000);

  // Test 12: Scores calculate correctly from string "3"
  const results = await apiCall('GET', `/assessment/${assessmentId}/results`);
  const currentScore = results.data?.data?.overall?.currentScore;
  const scoreIsValid = currentScore > 0 && currentScore <= 5;
  recordTest('String Conversion', 'String "3" converts to valid score (not 0)', scoreIsValid,
    `Current score: ${currentScore}`);

  // Test 13: Scores calculate correctly from number 4
  const futureScore = results.data?.data?.overall?.futureScore;
  const futureIsValid = futureScore > 0 && futureScore <= 5;
  recordTest('String Conversion', 'Number 4 converts to valid score (not 0)', futureIsValid,
    `Future score: ${futureScore}`);

  // Test 14: Mixed string/number responses work together
  const mixedValid = currentScore === 3 && futureScore === 4;
  recordTest('String Conversion', 'Mixed string/number responses calculate correctly', mixedValid,
    `Expected: current=3, future=4; Got: current=${currentScore}, future=${futureScore}`);
}

// ============================================================================
// TEST CATEGORY 4: SAVE PROGRESS & DATA PERSISTENCE
// ============================================================================
async function testSaveProgressAndPersistence() {
  log('\n' + '='.repeat(80), colors.bright);
  log('TEST CATEGORY 4: SAVE PROGRESS & DATA PERSISTENCE', colors.bright + colors.cyan);
  log('='.repeat(80), colors.bright);

  // Create test assessment
  const createResult = await apiCall('POST', '/assessment/start', {
    assessmentName: 'Save Test',
    organizationName: 'Test Org',
    contactEmail: 'save-test@example.com',
    industry: 'Technology'
  });
  
  const assessmentId = createResult.data?.data?.assessmentId;
  recordTest('Save & Persist', 'Create assessment for save tests', createResult.success && !!assessmentId);

  if (!assessmentId) {
    log('  ⚠️  Skipping save/persist tests', colors.yellow);
    return;
  }

  // Test 15: Save current state
  const saveCurrent = await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
    questionId: 'env_standardization',
    perspectiveId: 'current_state',
    value: '2',
    editorEmail: 'test@example.com'
  });
  recordTest('Save & Persist', 'Save current state', saveCurrent.success);

  // Test 16: Save future state
  const saveFuture = await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
    questionId: 'env_standardization',
    perspectiveId: 'future_state',
    value: '5',
    editorEmail: 'test@example.com'
  });
  recordTest('Save & Persist', 'Save future state', saveFuture.success);

  // Test 17: Save technical pain points (array)
  const savePain = await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
    questionId: 'env_standardization',
    perspectiveId: 'technical_pain',
    value: ['performance_issues', 'scalability_concerns'],
    editorEmail: 'test@example.com'
  });
  recordTest('Save & Persist', 'Save technical pain points (array)', savePain.success);

  // Test 18: Save comment
  const saveComment = await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
    questionId: 'env_standardization',
    comment: 'Test comment for persistence',
    editorEmail: 'test@example.com'
  });
  recordTest('Save & Persist', 'Save comment', saveComment.success);

  await delay(1000);

  // Test 19: Retrieve assessment and verify data persisted
  const statusResult = await apiCall('GET', `/assessment/${assessmentId}/status`);
  const hasResponses = statusResult.data?.data?.responses && 
                       Object.keys(statusResult.data.data.responses || {}).length > 0;
  recordTest('Save & Persist', 'Assessment status shows saved responses', hasResponses);

  // Test 20: Verify responses are retrievable for score calculation
  const results = await apiCall('GET', `/assessment/${assessmentId}/results`);
  const scoresReflectData = results.data?.data?.overall?.currentScore === 2 &&
                            results.data?.data?.overall?.futureScore === 5;
  recordTest('Save & Persist', 'Saved responses used in score calculation', scoresReflectData,
    `Expected: current=2, future=5; Got: current=${results.data?.data?.overall?.currentScore}, future=${results.data?.data?.overall?.futureScore}`);
}

// ============================================================================
// TEST CATEGORY 5: PARTIAL ASSESSMENT → ADD DATA → VERIFY UPDATES
// ============================================================================
async function testPartialAssessmentUpdates() {
  log('\n' + '='.repeat(80), colors.bright);
  log('TEST CATEGORY 5: PARTIAL ASSESSMENT → ADD DATA → VERIFY UPDATES', colors.bright + colors.cyan);
  log('='.repeat(80), colors.bright);

  const framework = await getFramework();
  const pillarId = 'platform_governance';
  const pillar = framework.assessmentAreas.find(a => a.id === pillarId);

  // Create assessment
  const createResult = await apiCall('POST', '/assessment/start', {
    assessmentName: 'Partial Test',
    organizationName: 'Test Org',
    contactEmail: 'partial@example.com',
    industry: 'Technology'
  });
  
  const assessmentId = createResult.data?.data?.assessmentId;
  recordTest('Partial Updates', 'Create partial assessment', createResult.success && !!assessmentId);

  if (!assessmentId) {
    log('  ⚠️  Skipping partial assessment tests', colors.yellow);
    return;
  }

  // Test 21: Fill 3 questions with score 2→4
  const questions = pillar.dimensions.flatMap(d => d.questions).slice(0, 3);
  for (const q of questions) {
    await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
      questionId: q.id,
      perspectiveId: 'current_state',
      value: '2',
      editorEmail: 'test@example.com'
    });
    await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
      questionId: q.id,
      perspectiveId: 'future_state',
      value: '4',
      editorEmail: 'test@example.com'
    });
  }

  await delay(1500);

  const initialResults = await apiCall('GET', `/assessment/${assessmentId}/results`);
  const initialCurrent = initialResults.data?.data?.overall?.currentScore;
  const initialFuture = initialResults.data?.data?.overall?.futureScore;
  
  recordTest('Partial Updates', 'Initial scores after 3 questions (2→4)', 
    initialCurrent === 2 && initialFuture === 4,
    `Got: current=${initialCurrent}, future=${initialFuture}`);

  // Test 22: Add 4 more questions with score 4→5
  const moreQuestions = pillar.dimensions.flatMap(d => d.questions).slice(3, 7);
  for (const q of moreQuestions) {
    await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
      questionId: q.id,
      perspectiveId: 'current_state',
      value: '4',
      editorEmail: 'test@example.com'
    });
    await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
      questionId: q.id,
      perspectiveId: 'future_state',
      value: '5',
      editorEmail: 'test@example.com'
    });
  }

  await delay(1500);

  const updatedResults = await apiCall('GET', `/assessment/${assessmentId}/results`);
  const updatedCurrent = updatedResults.data?.data?.overall?.currentScore;
  const updatedFuture = updatedResults.data?.data?.overall?.futureScore;

  recordTest('Partial Updates', 'Scores increased after adding 4 more questions',
    updatedCurrent > initialCurrent && updatedFuture > initialFuture,
    `Initial: ${initialCurrent}→${initialFuture}; Updated: ${updatedCurrent}→${updatedFuture}`);

  // Test 23: Executive summary changed
  const initialSummary = initialResults.data?.data?.overall?.summary || '';
  const updatedSummary = updatedResults.data?.data?.overall?.summary || '';
  const summaryChanged = initialSummary !== updatedSummary;
  recordTest('Partial Updates', 'Executive summary updated with new data', summaryChanged);
}

// ============================================================================
// TEST CATEGORY 6: FULL ASSESSMENT CONSISTENCY (3 ITERATIONS)
// ============================================================================
async function testFullAssessmentConsistency() {
  log('\n' + '='.repeat(80), colors.bright);
  log('TEST CATEGORY 6: FULL ASSESSMENT CONSISTENCY (3 ITERATIONS)', colors.bright + colors.cyan);
  log('='.repeat(80), colors.bright);

  const framework = await getFramework();
  const pillarId = 'platform_governance';
  const pillar = framework.assessmentAreas.find(a => a.id === pillarId);
  const questions = pillar.dimensions.flatMap(d => d.questions);

  let iterationsPassed = 0;

  for (let i = 1; i <= 3; i++) {
    log(`\n  Iteration ${i}/3:`, colors.cyan);

    // Create assessment
    const createResult = await apiCall('POST', '/assessment/start', {
      assessmentName: `Full Test ${i}`,
      organizationName: 'Test Org',
      contactEmail: `full-${i}@example.com`,
      industry: 'Technology'
    });
    
    const assessmentId = createResult.data?.data?.assessmentId;
    if (!assessmentId) {
      recordTest('Full Consistency', `Iteration ${i}: Create assessment`, false);
      continue;
    }

    // Fill with 3→4
    for (const q of questions) {
      await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
        questionId: q.id,
        perspectiveId: 'current_state',
        value: '3',
        editorEmail: 'test@example.com'
      });
      await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
        questionId: q.id,
        perspectiveId: 'future_state',
        value: '4',
        editorEmail: 'test@example.com'
      });
    }

    await delay(1500);

    const initial = await apiCall('GET', `/assessment/${assessmentId}/results`);
    const initialCurrent = initial.data?.data?.overall?.currentScore;
    const initialFuture = initial.data?.data?.overall?.futureScore;

    // Change to 2→5
    for (const q of questions) {
      await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
        questionId: q.id,
        perspectiveId: 'current_state',
        value: '2',
        editorEmail: 'test@example.com'
      });
      await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
        questionId: q.id,
        perspectiveId: 'future_state',
        value: '5',
        editorEmail: 'test@example.com'
      });
    }

    await delay(1500);

    const updated = await apiCall('GET', `/assessment/${assessmentId}/results`);
    const updatedCurrent = updated.data?.data?.overall?.currentScore;
    const updatedFuture = updated.data?.data?.overall?.futureScore;

    const passed = initialCurrent === 3 && initialFuture === 4 &&
                   updatedCurrent === 2 && updatedFuture === 5;

    if (passed) {
      iterationsPassed++;
      log(`    ✅ Scores: 3→4 changed to 2→5 correctly`, colors.green);
    } else {
      log(`    ❌ Scores incorrect: Initial ${initialCurrent}→${initialFuture}, Updated ${updatedCurrent}→${updatedFuture}`, colors.red);
    }
  }

  recordTest('Full Consistency', `All 3 iterations show consistent behavior (${iterationsPassed}/3 passed)`,
    iterationsPassed === 3);
}

// ============================================================================
// TEST CATEGORY 7: EDGE CASES & ERROR HANDLING
// ============================================================================
async function testEdgeCasesAndErrorHandling() {
  log('\n' + '='.repeat(80), colors.bright);
  log('TEST CATEGORY 7: EDGE CASES & ERROR HANDLING', colors.bright + colors.cyan);
  log('='.repeat(80), colors.bright);

  // Test 24: Get non-existent assessment
  const notFound = await apiCall('GET', '/assessment/non-existent-id/status');
  recordTest('Edge Cases', 'Non-existent assessment returns 404', notFound.status === 404);

  // Test 25: Save progress to non-existent assessment
  const saveToNonExistent = await apiCall('POST', '/assessment/non-existent-id/save-progress', {
    questionId: 'test',
    perspectiveId: 'current_state',
    value: '3'
  });
  recordTest('Edge Cases', 'Save to non-existent assessment fails gracefully', !saveToNonExistent.success);

  // Test 26: Get results for non-existent pillar
  const createResult = await apiCall('POST', '/assessment/start', {
    assessmentName: 'Edge Test',
    organizationName: 'Test Org',
    contactEmail: 'edge@example.com',
    industry: 'Technology'
  });
  
  const assessmentId = createResult.data?.data?.assessmentId;
  if (assessmentId) {
    const badPillar = await apiCall('GET', `/assessment/${assessmentId}/pillar/non-existent-pillar/results`);
    recordTest('Edge Cases', 'Non-existent pillar returns 404', badPillar.status === 404);
  }

  // Test 27: Skip a question
  if (assessmentId) {
    const skipResult = await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
      questionId: 'env_standardization',
      isSkipped: true,
      editorEmail: 'test@example.com'
    });
    recordTest('Edge Cases', 'Skip question works', skipResult.success);
  }

  // Test 28: Save with invalid score value (should still save as string)
  if (assessmentId) {
    const invalidScore = await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
      questionId: 'scaling_effectiveness',
      perspectiveId: 'current_state',
      value: '999', // Invalid but should save
      editorEmail: 'test@example.com'
    });
    recordTest('Edge Cases', 'Invalid score value handled gracefully', invalidScore.success);
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================
async function runAllTests() {
  log('\n' + '='.repeat(80), colors.bright);
  log('🧪 COMPREHENSIVE TEST SUITE: ALL BUG FIXES + INTEGRATION', colors.bright + colors.magenta);
  log('='.repeat(80) + '\n', colors.bright);
  
  log('Testing against: ' + API_BASE_URL, colors.yellow);
  log('Timestamp: ' + new Date().toISOString(), colors.yellow);
  log('', colors.reset);

  // Check server
  try {
    await apiCall('GET', '/health');
    log('✓ Server is running\n', colors.green);
  } catch (error) {
    log('✗ Server is not accessible', colors.red);
    log('Please start the server: npm start\n', colors.yellow);
    process.exit(1);
  }

  const startTime = Date.now();

  try {
    await testApiHealth();
    await testNullResponsesHandling();
    await testStringToNumberConversion();
    await testSaveProgressAndPersistence();
    await testPartialAssessmentUpdates();
    await testFullAssessmentConsistency();
    await testEdgeCasesAndErrorHandling();
  } catch (error) {
    log(`\n❌ FATAL ERROR: ${error.message}`, colors.red + colors.bright);
    console.error(error);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Final summary
  log('\n' + '='.repeat(80), colors.bright);
  log('📊 FINAL TEST RESULTS', colors.bright + colors.magenta);
  log('='.repeat(80), colors.bright);
  
  log(`\nTotal Tests: ${testResults.total}`, colors.cyan);
  log(`Passed: ${testResults.passed} (${(testResults.passed/testResults.total*100).toFixed(1)}%)`, 
    testResults.passed === testResults.total ? colors.green : colors.yellow);
  log(`Failed: ${testResults.failed} (${(testResults.failed/testResults.total*100).toFixed(1)}%)`, 
    testResults.failed === 0 ? colors.green : colors.red);
  log(`Duration: ${duration}s`, colors.cyan);

  // Group results by category
  log('\n📋 Results by Category:', colors.cyan);
  const categories = {};
  testResults.tests.forEach(test => {
    if (!categories[test.category]) {
      categories[test.category] = { passed: 0, total: 0 };
    }
    categories[test.category].total++;
    if (test.passed) categories[test.category].passed++;
  });

  Object.entries(categories).forEach(([category, stats]) => {
    const icon = stats.passed === stats.total ? '✅' : '⚠️';
    log(`  ${icon} ${category}: ${stats.passed}/${stats.total}`, 
      stats.passed === stats.total ? colors.green : colors.yellow);
  });

  log('\n' + '='.repeat(80), colors.bright);
  
  if (testResults.failed === 0) {
    log('🎉 ALL TESTS PASSED!', colors.green + colors.bright);
    log('All bug fixes verified and integration tests successful.', colors.green);
    process.exit(0);
  } else {
    log('⚠️  SOME TESTS FAILED', colors.red + colors.bright);
    log('Please review the failures above.', colors.yellow);
    
    // List failed tests
    log('\nFailed Tests:', colors.red);
    testResults.tests.filter(t => !t.passed).forEach(test => {
      log(`  • [${test.category}] ${test.name}`, colors.red);
      if (test.details) log(`    ${test.details}`, colors.yellow);
    });
    
    process.exit(1);
  }
}

// Run
runAllTests().catch(error => {
  log(`\n❌ FATAL ERROR: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});

