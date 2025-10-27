/**
 * Test Suite: Gap-Based Actions for Pillar Results
 * 
 * Purpose: Verify that all pillars correctly display dimension-level gap-based actions
 * 
 * Bug Fixed:
 * - Gap-based actions were showing as empty []
 * - Current/Future values were undefined (Level /5)
 * - Gap showing floating point errors (1.1999999999999997)
 * 
 * Test Coverage:
 * 1. All 6 pillars display gap-based actions
 * 2. Each action has correct current/future/gap values
 * 3. No floating point precision errors
 * 4. Actions sorted by gap (largest first)
 * 5. Dimension names and recommendations are present
 */

const axios = require('axios');

const BASE_URL = process.env.RAILWAY_URL || 'http://localhost:5000';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(color, symbol, message) {
  console.log(`${color}${symbol} ${message}${colors.reset}`);
}

function logSuccess(message) {
  log(colors.green, '✅', message);
}

function logError(message, detail) {
  log(colors.red, '❌', message);
  if (detail) console.log(`${colors.yellow}   ${detail}${colors.reset}`);
}

function logInfo(message) {
  log(colors.blue, '📝', message);
}

function logSection(title) {
  console.log(`\n${colors.bold}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.bold}${'='.repeat(80)}${colors.reset}\n`);
}

// Pillar IDs
const PILLARS = [
  { id: 'platform_governance', name: '🧱 Platform' },
  { id: 'data_engineering', name: '💾 Data' },
  { id: 'analytics_bi', name: '📊 Analytics' },
  { id: 'machine_learning', name: '🤖 ML' },
  { id: 'generative_ai', name: '✨ GenAI' },
  { id: 'operational_excellence', name: '⚡ Operations' }
];

async function createTestAssessment() {
  const response = await axios.post(`${BASE_URL}/api/assessment/start`, {
    assessmentName: 'Gap Actions Test',
    organizationName: 'Test Org',
    contactEmail: 'test@test.com',
    industry: 'Technology'
  });
  return response.data.data.assessmentId;
}

async function fillPillarWithGaps(assessmentId, pillarId) {
  // Get pillar questions
  const response = await axios.get(`${BASE_URL}/api/assessment/${assessmentId}/category/${pillarId}`);
  const pillar = response.data.data.area;
  
  const responses = {};
  let questionCount = 0;
  
  // Fill first 3 questions of each dimension with gaps
  pillar.dimensions.forEach((dimension, dimIdx) => {
    dimension.questions.slice(0, 3).forEach((question, qIdx) => {
      const currentValue = 1 + dimIdx; // 1, 2, 3...
      const futureValue = 3 + dimIdx; // 3, 4, 5...
      
      responses[`${question.id}_current_state`] = currentValue;
      responses[`${question.id}_future_state`] = futureValue;
      questionCount++;
    });
  });
  
  // Submit responses
  await axios.post(`${BASE_URL}/api/assessment/${assessmentId}/save-progress`, {
    categoryId: pillarId,
    responses
  });
  
  // Mark as completed
  await axios.post(`${BASE_URL}/api/assessment/${assessmentId}/category/${pillarId}/submit`);
  
  return questionCount;
}

async function validateGapActions(assessmentId, pillar) {
  const response = await axios.get(`${BASE_URL}/api/assessment/${assessmentId}/pillar/${pillar.id}/results`);
  const results = response.data.data;
  
  const gapActions = results.gapBasedActions || [];
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Gap actions exist
  if (gapActions.length > 0) {
    logSuccess(`${pillar.name} has ${gapActions.length} gap-based actions`);
    passed++;
  } else {
    logError(`${pillar.name} has NO gap-based actions`, 'Expected at least 1 action');
    failed++;
    return { passed, failed };
  }
  
  // Test 2: All actions have required fields
  gapActions.forEach((action, idx) => {
    const hasAllFields = 
      action.dimension && 
      typeof action.current === 'number' && 
      typeof action.future === 'number' && 
      typeof action.gap === 'number' &&
      action.recommendation;
    
    if (hasAllFields) {
      passed++;
    } else {
      logError(`${pillar.name} Action #${idx + 1} missing fields`, 
        `Has: ${Object.keys(action).join(', ')}`);
      failed++;
    }
  });
  
  // Test 3: No floating point errors
  const hasFloatingPointError = gapActions.some(action => {
    const gapStr = action.gap.toString();
    return gapStr.includes('99999') || gapStr.includes('00000') || gapStr.length > 5;
  });
  
  if (!hasFloatingPointError) {
    logSuccess(`${pillar.name} gap values have correct precision`);
    passed++;
  } else {
    logError(`${pillar.name} has floating point errors`, 
      `Gaps: ${gapActions.map(a => a.gap).join(', ')}`);
    failed++;
  }
  
  // Test 4: Current < Future (sanity check)
  const allGapsPositive = gapActions.every(action => action.current < action.future);
  if (allGapsPositive) {
    logSuccess(`${pillar.name} all gaps are positive (current < future)`);
    passed++;
  } else {
    logError(`${pillar.name} has invalid gaps`, 
      `Some current >= future`);
    failed++;
  }
  
  // Test 5: Actions sorted by gap (descending)
  const isSorted = gapActions.every((action, idx) => {
    if (idx === 0) return true;
    return gapActions[idx - 1].gap >= action.gap;
  });
  
  if (isSorted) {
    logSuccess(`${pillar.name} actions sorted by gap (largest first)`);
    passed++;
  } else {
    logError(`${pillar.name} actions NOT sorted correctly`, 
      `Gaps: ${gapActions.map(a => a.gap).join(' → ')}`);
    failed++;
  }
  
  // Test 6: Display format check (no "Level /5")
  const firstAction = gapActions[0];
  const hasValidValues = 
    firstAction.current > 0 && 
    firstAction.current <= 5 &&
    firstAction.future > 0 && 
    firstAction.future <= 5;
  
  if (hasValidValues) {
    logSuccess(`${pillar.name} values are valid (1-5 range)`);
    logInfo(`   Example: Current=${firstAction.current}, Future=${firstAction.future}, Gap=${firstAction.gap}`);
    passed++;
  } else {
    logError(`${pillar.name} has invalid level values`, 
      `Current=${firstAction.current}, Future=${firstAction.future}`);
    failed++;
  }
  
  return { passed, failed };
}

async function runTests() {
  console.log(`\n${colors.bold}🧪 Gap-Based Actions Test Suite${colors.reset}`);
  console.log(`${colors.blue}Testing against: ${BASE_URL}${colors.reset}\n`);
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  try {
    logSection('SETUP: Creating Test Assessment');
    const assessmentId = await createTestAssessment();
    logSuccess(`Created assessment: ${assessmentId}`);
    
    logSection('STEP 1: Fill All Pillars with Gap Data');
    for (const pillar of PILLARS) {
      const questionCount = await fillPillarWithGaps(assessmentId, pillar.id);
      logSuccess(`${pillar.name} filled with ${questionCount} questions`);
    }
    
    logSection('STEP 2: Validate Gap-Based Actions for Each Pillar');
    for (const pillar of PILLARS) {
      console.log(`\n${colors.bold}Testing ${pillar.name}${colors.reset}`);
      const { passed, failed } = await validateGapActions(assessmentId, pillar);
      totalPassed += passed;
      totalFailed += failed;
    }
    
    logSection('TEST RESULTS SUMMARY');
    console.log(`${colors.green}✅ Passed: ${totalPassed}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${totalFailed}${colors.reset}`);
    console.log(`${colors.blue}📊 Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%${colors.reset}`);
    
    if (totalFailed === 0) {
      logSuccess('All gap-based action tests passed! 🎉');
      process.exit(0);
    } else {
      logError('Some tests failed. Please review the errors above.');
      process.exit(1);
    }
    
  } catch (error) {
    logError('Test suite failed with error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runTests();


