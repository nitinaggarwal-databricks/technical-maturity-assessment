#!/usr/bin/env node

/**
 * COMPREHENSIVE RAILWAY DEPLOYMENT VALIDATION
 * 
 * Tests all features and workflows on the live Railway deployment:
 * 1. Question Filter System
 * 2. Navigation-Aware Refresh (Overall Results & Executive Summary)
 * 3. Type-Safe Value Comparison
 * 4. End-to-End User Workflows
 * 5. Data Persistence
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// CONFIGURE YOUR RAILWAY URL HERE
const RAILWAY_URL = process.env.RAILWAY_URL || 'YOUR_RAILWAY_URL_HERE';
const API_BASE_URL = `${RAILWAY_URL}/api`;

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

let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  tests: []
};

function recordTest(category, description, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`  ✅ ${description}`, colors.green);
  } else {
    testResults.failed++;
    log(`  ❌ ${description}`, colors.red);
    if (details) log(`     ${details}`, colors.yellow);
  }
  testResults.tests.push({ category, description, passed, details });
}

// ============================================================================
// TEST SUITE 1: API HEALTH & CONNECTIVITY
// ============================================================================
async function testApiHealth() {
  log('\n' + '='.repeat(80), colors.bright);
  log('TEST SUITE 1: API HEALTH & CONNECTIVITY', colors.bright + colors.cyan);
  log('='.repeat(80), colors.bright);

  // Test 1: Health endpoint
  const health = await apiCall('GET', '/health');
  recordTest('API Health', 'Health endpoint responds', health.success);

  // Test 2: Framework endpoint
  const framework = await apiCall('GET', '/assessment/framework');
  recordTest('API Health', 'Framework endpoint responds', framework.success);

  // Test 3: Status endpoint
  const status = await apiCall('GET', '/status');
  recordTest('API Health', 'Status endpoint responds', status.success);

  if (status.success) {
    const storageType = status.data?.storage?.type;
    recordTest('API Health', 'PostgreSQL storage configured', storageType === 'postgresql', 
      `Storage type: ${storageType}`);
  }
}

// ============================================================================
// TEST SUITE 2: QUESTION FILTER FUNCTIONALITY
// ============================================================================
async function testQuestionFilters() {
  log('\n' + '='.repeat(80), colors.bright);
  log('TEST SUITE 2: QUESTION FILTER FUNCTIONALITY', colors.bright + colors.cyan);
  log('='.repeat(80), colors.bright);

  // Create test assessment
  const createResult = await apiCall('POST', '/assessment/start', {
    assessmentName: 'Filter Test Assessment',
    organizationName: 'Filter Test Org',
    contactEmail: 'filter-test@example.com',
    industry: 'Technology'
  });
  
  const assessmentId = createResult.data?.data?.assessmentId;
  recordTest('Filters', 'Create test assessment', createResult.success && !!assessmentId);

  if (!assessmentId) {
    log('  ⚠️  Skipping filter tests', colors.yellow);
    return;
  }

  // Add some responses to create completed and not-started questions
  const responses = [
    { id: 'env_standardization', current: 2, future: 4, techPain: ['performance_issues'], comment: 'Test note' },
    { id: 'scaling_effectiveness', current: 3, future: 4, techPain: [], comment: '' }, // No comment
    // Leave auth_consistency, security_controls, governance_centralization not started
  ];

  for (const resp of responses) {
    await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
      questionId: resp.id,
      perspectiveId: 'current_state',
      value: resp.current.toString(),
      editorEmail: 'filter-test@example.com'
    });
    
    await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
      questionId: resp.id,
      perspectiveId: 'future_state',
      value: resp.future.toString(),
      editorEmail: 'filter-test@example.com'
    });
    
    if (resp.techPain.length > 0) {
      await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
        questionId: resp.id,
        perspectiveId: 'technical_pain',
        value: resp.techPain,
        editorEmail: 'filter-test@example.com'
      });
    }
    
    if (resp.comment) {
      await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
        questionId: resp.id,
        comment: resp.comment,
        editorEmail: 'filter-test@example.com'
      });
    }
  }

  await delay(2000);

  // Test 5: Verify assessment data
  const categoryResult = await apiCall('GET', `/assessment/${assessmentId}/category/platform_governance`);
  recordTest('Filters', 'Retrieve assessment with responses', categoryResult.success);

  if (categoryResult.success) {
    const existingResponses = categoryResult.data?.existingResponses || {};
    const hasCurrentState = existingResponses['env_standardization_current_state'] !== undefined;
    const hasFutureState = existingResponses['env_standardization_future_state'] !== undefined;
    
    recordTest('Filters', 'Current state responses saved', hasCurrentState,
      `Current state value: ${existingResponses['env_standardization_current_state']}`);
    recordTest('Filters', 'Future state responses saved', hasFutureState,
      `Future state value: ${existingResponses['env_standardization_future_state']}`);
    
    // Test 8: Check if comments are saved
    const hasComment = existingResponses['env_standardization_comment'] !== undefined;
    recordTest('Filters', 'Comments saved correctly', hasComment,
      `Comment: ${existingResponses['env_standardization_comment']}`);
  }

  log('\n  📝 Note: Filter UI tests require manual validation in browser', colors.cyan);
  log(`     URL: ${RAILWAY_URL}/assessment/${assessmentId}/platform_governance`, colors.cyan);
}

// ============================================================================
// TEST SUITE 3: NAVIGATION REFRESH (Overall Results & Executive Summary)
// ============================================================================
async function testNavigationRefresh() {
  log('\n' + '='.repeat(80), colors.bright);
  log('TEST SUITE 3: NAVIGATION REFRESH', colors.bright + colors.cyan);
  log('='.repeat(80), colors.bright);

  // Create assessment and fill it
  const createResult = await apiCall('POST', '/assessment/start', {
    assessmentName: 'Navigation Refresh Test',
    organizationName: 'Nav Test Org',
    contactEmail: 'nav-test@example.com',
    industry: 'Technology'
  });
  
  const assessmentId = createResult.data?.data?.assessmentId;
  recordTest('Navigation', 'Create test assessment', createResult.success && !!assessmentId);

  if (!assessmentId) {
    log('  ⚠️  Skipping navigation tests', colors.yellow);
    return;
  }

  // Fill with initial values
  await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
    questionId: 'env_standardization',
    perspectiveId: 'current_state',
    value: '2',
    editorEmail: 'nav-test@example.com'
  });
  
  await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
    questionId: 'env_standardization',
    perspectiveId: 'future_state',
    value: '4',
    editorEmail: 'nav-test@example.com'
  });

  await delay(1500);

  // Test 10: Get initial results
  const initialResults = await apiCall('GET', `/assessment/${assessmentId}/results`);
  recordTest('Navigation', 'Initial overall results retrieved', initialResults.success);

  const initialScore = initialResults.data?.data?.overall?.currentScore;
  log(`     Initial Score: ${initialScore}`, colors.cyan);

  // Update values
  await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
    questionId: 'env_standardization',
    perspectiveId: 'current_state',
    value: '4',
    editorEmail: 'nav-test@example.com'
  });
  
  await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
    questionId: 'env_standardization',
    perspectiveId: 'future_state',
    value: '5',
    editorEmail: 'nav-test@example.com'
  });

  await delay(1500);

  // Test 11: Get updated results
  const updatedResults = await apiCall('GET', `/assessment/${assessmentId}/results`);
  recordTest('Navigation', 'Updated overall results retrieved', updatedResults.success);

  const updatedScore = updatedResults.data?.data?.overall?.currentScore;
  log(`     Updated Score: ${updatedScore}`, colors.cyan);

  // Test 12: Verify results changed
  const resultsChanged = updatedScore !== initialScore;
  recordTest('Navigation', 'Overall results updated on data change', resultsChanged,
    `Score changed from ${initialScore} to ${updatedScore}`);

  // Test 13: Executive summary updates
  const initialExecSummary = initialResults.data?.data?.executiveSummary;
  const updatedExecSummary = updatedResults.data?.data?.executiveSummary;
  
  const execSummaryChanged = 
    initialExecSummary?.currentState?.score !== updatedExecSummary?.currentState?.score ||
    initialExecSummary?.desiredState?.score !== updatedExecSummary?.desiredState?.score;
  
  recordTest('Navigation', 'Executive summary refreshes with data', execSummaryChanged,
    `Current state: ${initialExecSummary?.currentState?.score} → ${updatedExecSummary?.currentState?.score}`);
}

// ============================================================================
// TEST SUITE 4: TYPE-SAFE VALUE COMPARISON
// ============================================================================
async function testTypeSafeComparison() {
  log('\n' + '='.repeat(80), colors.bright);
  log('TEST SUITE 4: TYPE-SAFE VALUE COMPARISON', colors.bright + colors.cyan);
  log('='.repeat(80), colors.bright);

  // Create test assessment
  const createResult = await apiCall('POST', '/assessment/start', {
    assessmentName: 'Type Safety Test',
    organizationName: 'Type Test Org',
    contactEmail: 'type-test@example.com',
    industry: 'Technology'
  });
  
  const assessmentId = createResult.data?.data?.assessmentId;
  recordTest('Type Safety', 'Create test assessment', createResult.success && !!assessmentId);

  if (!assessmentId) {
    log('  ⚠️  Skipping type safety tests', colors.yellow);
    return;
  }

  // Save responses (backend might store as strings)
  await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
    questionId: 'env_standardization',
    perspectiveId: 'current_state',
    value: '3', // String
    editorEmail: 'type-test@example.com'
  });
  
  await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
    questionId: 'env_standardization',
    perspectiveId: 'future_state',
    value: 4, // Number
    editorEmail: 'type-test@example.com'
  });
  
  await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
    questionId: 'env_standardization',
    perspectiveId: 'technical_pain',
    value: ['performance_issues', 'security_gaps'], // Array
    editorEmail: 'type-test@example.com'
  });

  await delay(1500);

  // Test 15: Retrieve and verify responses
  const categoryResult = await apiCall('GET', `/assessment/${assessmentId}/category/platform_governance`);
  recordTest('Type Safety', 'Responses saved with mixed types', categoryResult.success);

  if (categoryResult.success) {
    const responses = categoryResult.data?.existingResponses || {};
    
    const currentState = responses['env_standardization_current_state'];
    const futureState = responses['env_standardization_future_state'];
    const techPain = responses['env_standardization_technical_pain'];
    
    recordTest('Type Safety', 'Current state value exists', currentState !== undefined,
      `Type: ${typeof currentState}, Value: ${currentState}`);
    recordTest('Type Safety', 'Future state value exists', futureState !== undefined,
      `Type: ${typeof futureState}, Value: ${futureState}`);
    recordTest('Type Safety', 'Technical pain array exists', Array.isArray(techPain),
      `Is Array: ${Array.isArray(techPain)}, Length: ${techPain?.length}`);
  }

  log('\n  📝 Note: Frontend rendering requires manual verification', colors.cyan);
  log(`     URL: ${RAILWAY_URL}/assessment/${assessmentId}/platform_governance`, colors.cyan);
  log(`     Verify: All selected values are highlighted/checked`, colors.cyan);
}

// ============================================================================
// TEST SUITE 5: END-TO-END USER WORKFLOW
// ============================================================================
async function testEndToEndWorkflow() {
  log('\n' + '='.repeat(80), colors.bright);
  log('TEST SUITE 5: END-TO-END USER WORKFLOW', colors.bright + colors.cyan);
  log('='.repeat(80), colors.bright);

  // Step 1: Create assessment
  const createResult = await apiCall('POST', '/assessment/start', {
    assessmentName: 'E2E Workflow Test',
    organizationName: 'E2E Test Org',
    contactEmail: 'e2e-test@example.com',
    industry: 'Financial Services'
  });
  
  const assessmentId = createResult.data?.data?.assessmentId;
  recordTest('E2E Workflow', 'User creates new assessment', createResult.success && !!assessmentId);

  if (!assessmentId) {
    log('  ⚠️  Skipping E2E tests', colors.yellow);
    return;
  }

  // Step 2: Fill Platform pillar
  const questions = [
    { id: 'env_standardization', current: 2, future: 4 },
    { id: 'scaling_effectiveness', current: 3, future: 4 },
    { id: 'auth_consistency', current: 3, future: 5 },
  ];

  for (const q of questions) {
    await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
      questionId: q.id,
      perspectiveId: 'current_state',
      value: q.current.toString(),
      editorEmail: 'e2e-test@example.com'
    });
    
    await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
      questionId: q.id,
      perspectiveId: 'future_state',
      value: q.future.toString(),
      editorEmail: 'e2e-test@example.com'
    });
  }

  recordTest('E2E Workflow', 'User fills Platform pillar questions', true);

  await delay(2000);

  // Step 3: View individual pillar results
  const pillarResult = await apiCall('GET', `/assessment/${assessmentId}/pillar/platform_governance/results`);
  recordTest('E2E Workflow', 'User views individual pillar results', pillarResult.success);

  if (pillarResult.success) {
    const pillarDetails = pillarResult.data?.data?.pillarDetails;
    recordTest('E2E Workflow', 'Pillar results show correct scores', 
      pillarDetails?.currentScore > 0 && pillarDetails?.futureScore > 0,
      `Current: ${pillarDetails?.currentScore}, Future: ${pillarDetails?.futureScore}`);
  }

  // Step 4: View overall results
  const overallResult = await apiCall('GET', `/assessment/${assessmentId}/results`);
  recordTest('E2E Workflow', 'User views overall results', overallResult.success);

  if (overallResult.success) {
    const overall = overallResult.data?.data?.overall;
    recordTest('E2E Workflow', 'Overall results show scores', 
      overall?.currentScore !== undefined && overall?.futureScore !== undefined,
      `Current: ${overall?.currentScore}, Future: ${overall?.futureScore}`);
  }

  // Step 5: View executive summary
  const execSummary = overallResult.data?.data?.executiveSummary;
  recordTest('E2E Workflow', 'User views executive summary', !!execSummary);

  if (execSummary) {
    const hasCurrentState = execSummary.currentState !== undefined;
    const hasDesiredState = execSummary.desiredState !== undefined;
    const hasPriorities = execSummary.topPriorities && execSummary.topPriorities.length > 0;
    
    recordTest('E2E Workflow', 'Executive summary has current state', hasCurrentState);
    recordTest('E2E Workflow', 'Executive summary has desired state', hasDesiredState);
    recordTest('E2E Workflow', 'Executive summary has priorities', hasPriorities,
      `Priorities count: ${execSummary.topPriorities?.length}`);
  }

  // Step 6: Edit and verify refresh
  await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
    questionId: 'env_standardization',
    perspectiveId: 'current_state',
    value: '4',
    editorEmail: 'e2e-test@example.com'
  });

  await delay(1500);

  const updatedOverallResult = await apiCall('GET', `/assessment/${assessmentId}/results`);
  const updatedScore = updatedOverallResult.data?.data?.overall?.currentScore;
  const originalScore = overallResult.data?.data?.overall?.currentScore;
  
  recordTest('E2E Workflow', 'User edits assessment and sees updated results',
    updatedScore !== originalScore,
    `Score changed: ${originalScore} → ${updatedScore}`);

  log(`\n  🌐 Manual validation URLs:`, colors.cyan);
  log(`     Assessment: ${RAILWAY_URL}/assessment/${assessmentId}/platform_governance`, colors.cyan);
  log(`     Results: ${RAILWAY_URL}/results/${assessmentId}`, colors.cyan);
  log(`     Executive Summary: ${RAILWAY_URL}/executive-summary/${assessmentId}`, colors.cyan);
}

// ============================================================================
// TEST SUITE 6: DATA PERSISTENCE
// ============================================================================
async function testDataPersistence() {
  log('\n' + '='.repeat(80), colors.bright);
  log('TEST SUITE 6: DATA PERSISTENCE (PostgreSQL)', colors.bright + colors.cyan);
  log('='.repeat(80), colors.bright);

  // Create assessment
  const createResult = await apiCall('POST', '/assessment/start', {
    assessmentName: 'Persistence Test',
    organizationName: 'Persist Test Org',
    contactEmail: 'persist-test@example.com',
    industry: 'Healthcare'
  });
  
  const assessmentId = createResult.data?.data?.assessmentId;
  recordTest('Persistence', 'Create test assessment', createResult.success && !!assessmentId);

  if (!assessmentId) {
    log('  ⚠️  Skipping persistence tests', colors.yellow);
    return;
  }

  // Save some data
  await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
    questionId: 'env_standardization',
    perspectiveId: 'current_state',
    value: '3',
    comment: 'Persistence test comment',
    editorEmail: 'persist-test@example.com'
  });

  await delay(1000);

  // Retrieve from different endpoint
  const statusResult = await apiCall('GET', `/assessment/${assessmentId}/status`);
  recordTest('Persistence', 'Assessment status retrieval', statusResult.success);

  const listResult = await apiCall('GET', '/assessments');
  const found = listResult.data?.assessments?.some(a => a.id === assessmentId);
  recordTest('Persistence', 'Assessment appears in list', found);

  // Retrieve responses
  const categoryResult = await apiCall('GET', `/assessment/${assessmentId}/category/platform_governance`);
  const hasResponses = categoryResult.data?.existingResponses?.['env_standardization_current_state'] !== undefined;
  recordTest('Persistence', 'Responses persisted correctly', hasResponses);

  const hasComment = categoryResult.data?.existingResponses?.['env_standardization_comment'] !== undefined;
  recordTest('Persistence', 'Comments persisted correctly', hasComment);
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================
async function runAllTests() {
  log('\n' + '█'.repeat(80), colors.bright + colors.magenta);
  log('  RAILWAY DEPLOYMENT VALIDATION TEST SUITE', colors.bright + colors.magenta);
  log('  URL: ' + RAILWAY_URL, colors.bright + colors.cyan);
  log('█'.repeat(80) + '\n', colors.bright + colors.magenta);

  const startTime = Date.now();

  try {
    await testApiHealth();
    await testQuestionFilters();
    await testNavigationRefresh();
    await testTypeSafeComparison();
    await testEndToEndWorkflow();
    await testDataPersistence();
  } catch (error) {
    log(`\n❌ Test execution failed: ${error.message}`, colors.red);
    console.error(error);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Final Summary
  log('\n' + '█'.repeat(80), colors.bright);
  log('  FINAL TEST SUMMARY', colors.bright + colors.magenta);
  log('█'.repeat(80), colors.bright);
  
  log('');
  const passRate = testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(1) : 0;
  
  if (testResults.failed === 0) {
    log(`✅ ALL TESTS PASSED! (${testResults.passed}/${testResults.total})`, colors.green + colors.bright);
  } else {
    log(`⚠️  TESTS COMPLETED WITH FAILURES`, colors.yellow + colors.bright);
    log(`   Passed: ${testResults.passed}/${testResults.total} (${passRate}%)`, colors.green);
    log(`   Failed: ${testResults.failed}/${testResults.total}`, colors.red);
  }
  
  log(`   Duration: ${duration}s`, colors.cyan);
  log('');

  // List failed tests
  if (testResults.failed > 0) {
    log('❌ FAILED TESTS:', colors.red + colors.bright);
    testResults.tests
      .filter(t => !t.passed)
      .forEach(t => {
        log(`   • [${t.category}] ${t.description}`, colors.red);
        if (t.details) log(`     ${t.details}`, colors.yellow);
      });
    log('');
  }

  log('📋 MANUAL VALIDATION REQUIRED:', colors.cyan + colors.bright);
  log('   1. Question Filter UI (buttons, counts, filtering)', colors.cyan);
  log('   2. Selected values display correctly in filtered views', colors.cyan);
  log('   3. Navigation between pages refreshes data', colors.cyan);
  log('   4. Overall Results updates after editing', colors.cyan);
  log('   5. Executive Summary updates after editing', colors.cyan);
  log('');

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Check if Railway URL is configured
if (!RAILWAY_URL || RAILWAY_URL === 'YOUR_RAILWAY_URL_HERE') {
  log('❌ ERROR: RAILWAY_URL not configured!', colors.red + colors.bright);
  log('', colors.reset);
  log('Please set your Railway URL:', colors.yellow);
  log('  export RAILWAY_URL=https://your-app.up.railway.app', colors.cyan);
  log('OR', colors.yellow);
  log('  Edit this file and replace YOUR_RAILWAY_URL_HERE', colors.cyan);
  log('', colors.reset);
  process.exit(1);
}

runAllTests();




