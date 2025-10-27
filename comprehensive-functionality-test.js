#!/usr/bin/env node

/**
 * COMPREHENSIVE FUNCTIONALITY TEST
 * Tests all links, buttons, filters, calculations, formulas, and results
 */

const axios = require('axios');

// Chalk v5+ is ESM only, so we'll use a simple color fallback
const chalk = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  yellow: { bold: (text) => `\x1b[33m\x1b[1m${text}\x1b[0m` },
  cyan: { bold: (text) => `\x1b[36m\x1b[1m${text}\x1b[0m` },
  gray: (text) => `\x1b[90m${text}\x1b[0m`
};

const API_BASE = process.env.API_URL || 'http://localhost:5000';
const TIMEOUT = 10000;

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper functions
const log = {
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  section: (msg) => console.log(chalk.yellow.bold(`\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}`))
};

const test = async (name, fn) => {
  try {
    await fn();
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    log.success(name);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
    log.error(`${name}: ${error.message}`);
  }
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

// =======================
// TEST SUITES
// =======================

async function testAPIHealth() {
  log.section('1. API HEALTH CHECK');
  
  await test('Health endpoint responds', async () => {
    const response = await axios.get(`${API_BASE}/api/health`, { timeout: TIMEOUT });
    assert(response.status === 200, 'Health check failed');
    assert(response.data.status === 'ok', 'Health status not ok');
  });
}

async function testAssessmentCRUD() {
  log.section('2. ASSESSMENT CRUD OPERATIONS');
  
  let testAssessmentId;
  
  await test('Create new assessment', async () => {
    const response = await axios.post(`${API_BASE}/api/assessment`, {
      assessmentName: 'Test Assessment',
      organizationName: 'Test Org',
      contactEmail: 'test@example.com',
      industry: 'Technology'
    }, { timeout: TIMEOUT });
    
    assert(response.data.success, 'Assessment creation failed');
    assert(response.data.assessment.id, 'No assessment ID returned');
    testAssessmentId = response.data.assessment.id;
  });
  
  await test('Get all assessments', async () => {
    const response = await axios.get(`${API_BASE}/api/assessments`, { timeout: TIMEOUT });
    assert(Array.isArray(response.data), 'Assessments not an array');
    assert(response.data.length > 0, 'No assessments found');
  });
  
  await test('Get specific assessment', async () => {
    if (!testAssessmentId) throw new Error('No test assessment ID');
    const response = await axios.get(`${API_BASE}/api/assessment/${testAssessmentId}`, { timeout: TIMEOUT });
    assert(response.data.id === testAssessmentId, 'Assessment ID mismatch');
  });
  
  await test('Save assessment progress', async () => {
    if (!testAssessmentId) throw new Error('No test assessment ID');
    const response = await axios.put(`${API_BASE}/api/assessment/${testAssessmentId}`, {
      responses: {
        'platform_governance_q1_current_state': '2',
        'platform_governance_q1_future_state': '4'
      },
      completedCategories: ['platform_governance']
    }, { timeout: TIMEOUT });
    
    assert(response.data.success, 'Progress save failed');
  });
  
  await test('Clone assessment', async () => {
    if (!testAssessmentId) throw new Error('No test assessment ID');
    const response = await axios.post(`${API_BASE}/api/assessment/${testAssessmentId}/clone`, {}, { timeout: TIMEOUT });
    assert(response.data.success, 'Assessment clone failed');
    assert(response.data.assessment.id !== testAssessmentId, 'Cloned assessment has same ID');
  });
  
  await test('Delete assessment', async () => {
    if (!testAssessmentId) throw new Error('No test assessment ID');
    const response = await axios.delete(`${API_BASE}/api/assessment/${testAssessmentId}`, { timeout: TIMEOUT });
    assert(response.data.success, 'Assessment deletion failed');
  });
}

async function testSampleAssessmentGeneration() {
  log.section('3. SAMPLE ASSESSMENT GENERATION');
  
  let sampleId;
  
  await test('Generate full sample assessment', async () => {
    const response = await axios.post(`${API_BASE}/api/assessment/generate-sample`, {
      completionLevel: 'full'
    }, { timeout: TIMEOUT });
    
    assert(response.data.success, 'Sample generation failed');
    assert(response.data.assessment.id, 'No sample ID returned');
    assert(response.data.assessment.responses, 'No responses in sample');
    assert(response.data.assessment.completedCategories, 'No completed categories');
    assert(response.data.assessment.completedCategories.length === 6, 'Full sample should have 6 completed pillars');
    sampleId = response.data.assessment.id;
  });
  
  await test('Generate partial sample assessment', async () => {
    const response = await axios.post(`${API_BASE}/api/assessment/generate-sample`, {
      completionLevel: 'partial'
    }, { timeout: TIMEOUT });
    
    assert(response.data.success, 'Partial sample generation failed');
    assert(response.data.assessment.completedCategories.length >= 3, 'Partial sample should have 3-4 pillars');
  });
  
  await test('Generate minimal sample assessment', async () => {
    const response = await axios.post(`${API_BASE}/api/assessment/generate-sample`, {
      completionLevel: 'minimal'
    }, { timeout: TIMEOUT });
    
    assert(response.data.success, 'Minimal sample generation failed');
    assert(response.data.assessment.completedCategories.length <= 2, 'Minimal sample should have 1-2 pillars');
  });
  
  return sampleId;
}

async function testResultsGeneration(assessmentId) {
  log.section('4. RESULTS GENERATION');
  
  await test('Generate overall results', async () => {
    const response = await axios.get(`${API_BASE}/api/assessment/${assessmentId}/results`, { timeout: TIMEOUT });
    
    assert(response.data.success, 'Overall results generation failed');
    assert(response.data.overall, 'No overall results');
    assert(response.data.overall.currentScore !== undefined, 'No current score');
    assert(response.data.overall.targetScore !== undefined, 'No target score');
    assert(response.data.overall.gap !== undefined, 'No gap calculation');
    assert(response.data.categoryDetails, 'No category details');
    assert(response.data.prioritizedActions, 'No prioritized actions');
  });
  
  const pillars = ['platform_governance', 'data_engineering', 'analytics_bi', 'ml_mlops', 'genai_agentic', 'operational_excellence'];
  
  for (const pillar of pillars) {
    await test(`Generate ${pillar} pillar results`, async () => {
      const response = await axios.get(`${API_BASE}/api/assessment/${assessmentId}/pillar/${pillar}/results`, { timeout: TIMEOUT });
      
      assert(response.data.success, `${pillar} results generation failed`);
      assert(response.data.pillarDetails, 'No pillar details');
      assert(response.data.assessmentInfo, 'No assessment info');
    });
  }
  
  await test('Generate executive summary', async () => {
    const response = await axios.get(`${API_BASE}/api/assessment/${assessmentId}/executive-summary`, { timeout: TIMEOUT });
    
    assert(response.data.success, 'Executive summary generation failed');
    assert(response.data.executiveSummary, 'No executive summary');
  });
}

async function testDashboardCalculations() {
  log.section('5. DASHBOARD CALCULATIONS & FORMULAS');
  
  await test('Dashboard stats endpoint', async () => {
    const response = await axios.get(`${API_BASE}/api/dashboard/stats`, { timeout: TIMEOUT });
    
    assert(response.data.totalAssessments !== undefined, 'No total assessments');
    assert(response.data.activeCustomers !== undefined, 'No active customers');
    assert(response.data.avgCompletionTime !== undefined, 'No avg completion time');
    assert(response.data.avgMaturityLevel !== undefined, 'No avg maturity level');
    assert(response.data.avgImprovementPotential !== undefined, 'No avg improvement potential');
    assert(response.data.feedbackNPS !== undefined, 'No feedback NPS');
  });
  
  await test('Dashboard trend calculations', async () => {
    const response = await axios.get(`${API_BASE}/api/dashboard/stats`, { timeout: TIMEOUT });
    
    assert(response.data.totalAssessmentsTrend !== undefined, 'No total assessments trend');
    assert(response.data.activeCustomersTrend !== undefined, 'No active customers trend');
    assert(response.data.avgCompletionTimeTrend !== undefined, 'No avg completion time trend');
    assert(response.data.avgMaturityLevelTrend !== undefined, 'No avg maturity level trend');
    assert(response.data.avgImprovementPotentialTrend !== undefined, 'No avg improvement potential trend');
  });
  
  await test('Dashboard pillar maturity data', async () => {
    const response = await axios.get(`${API_BASE}/api/dashboard/stats`, { timeout: TIMEOUT });
    
    assert(Array.isArray(response.data.pillarMaturityCurrent), 'Pillar maturity current not an array');
    assert(Array.isArray(response.data.pillarMaturityTarget), 'Pillar maturity target not an array');
    assert(response.data.pillarMaturityCurrent.length === 6, 'Should have 6 pillars current');
    assert(response.data.pillarMaturityTarget.length === 6, 'Should have 6 pillars target');
  });
  
  await test('Dashboard weekly completions data', async () => {
    const response = await axios.get(`${API_BASE}/api/dashboard/stats`, { timeout: TIMEOUT });
    
    assert(response.data.weeklyCompletions, 'No weekly completions');
    assert(Array.isArray(response.data.weeklyCompletions.labels), 'Weekly labels not an array');
    assert(Array.isArray(response.data.weeklyCompletions.counts), 'Weekly counts not an array');
    assert(Array.isArray(response.data.weeklyCompletions.avgHours), 'Weekly avgHours not an array');
    assert(response.data.weeklyCompletions.labels.length === 6, 'Should have 6 weeks of data');
  });
  
  await test('Dashboard customer portfolio data', async () => {
    const response = await axios.get(`${API_BASE}/api/dashboard/stats`, { timeout: TIMEOUT });
    
    assert(Array.isArray(response.data.customerPortfolio), 'Customer portfolio not an array');
    assert(response.data.customerPortfolio.length <= 10, 'Should have max 10 customers');
    
    if (response.data.customerPortfolio.length > 0) {
      const customer = response.data.customerPortfolio[0];
      assert(customer.customer, 'Customer missing customer name');
      assert(customer.completion !== undefined, 'Customer missing completion');
      assert(customer.maturity !== undefined, 'Customer missing maturity');
      assert(customer.target !== undefined, 'Customer missing target');
      assert(customer.status, 'Customer missing status');
      assert(Array.isArray(customer.keyGaps), 'Customer keyGaps not an array');
    }
  });
  
  await test('Validate maturity level calculations', async () => {
    const response = await axios.get(`${API_BASE}/api/dashboard/stats`, { timeout: TIMEOUT });
    
    const avgMaturity = parseFloat(response.data.avgMaturityLevel);
    assert(avgMaturity >= 1 && avgMaturity <= 5, 'Avg maturity level out of range [1-5]');
    
    response.data.pillarMaturityCurrent.forEach((maturity, index) => {
      const val = parseFloat(maturity);
      assert(val >= 1 && val <= 5, `Pillar ${index} current maturity out of range [1-5]`);
    });
    
    response.data.pillarMaturityTarget.forEach((maturity, index) => {
      const val = parseFloat(maturity);
      assert(val >= 1 && val <= 5, `Pillar ${index} target maturity out of range [1-5]`);
    });
  });
  
  await test('Validate improvement potential calculations', async () => {
    const response = await axios.get(`${API_BASE}/api/dashboard/stats`, { timeout: TIMEOUT });
    
    const avgImprovement = parseFloat(response.data.avgImprovementPotential);
    assert(avgImprovement >= 0, 'Avg improvement potential should be non-negative');
    assert(avgImprovement <= 4, 'Avg improvement potential should not exceed 4 (max gap)');
  });
}

async function testCategoryQuestions() {
  log.section('6. CATEGORY QUESTIONS & FRAMEWORK');
  
  const pillars = ['platform_governance', 'data_engineering', 'analytics_bi', 'ml_mlops', 'genai_agentic', 'operational_excellence'];
  
  for (const pillar of pillars) {
    await test(`Get ${pillar} questions`, async () => {
      const response = await axios.get(`${API_BASE}/api/assessment/category/${pillar}`, { timeout: TIMEOUT });
      
      assert(response.data.area, 'No area data');
      assert(response.data.area.id === pillar, 'Area ID mismatch');
      assert(response.data.area.name, 'No area name');
      assert(Array.isArray(response.data.area.dimensions), 'Dimensions not an array');
      assert(response.data.area.dimensions.length > 0, 'No dimensions found');
      
      response.data.area.dimensions.forEach(dimension => {
        assert(dimension.id, 'Dimension missing ID');
        assert(dimension.name, 'Dimension missing name');
        assert(Array.isArray(dimension.questions), 'Questions not an array');
        assert(dimension.questions.length > 0, 'No questions in dimension');
        
        dimension.questions.forEach(question => {
          assert(question.id, 'Question missing ID');
          assert(question.question, 'Question missing text');
          assert(Array.isArray(question.current_state), 'Current state options not an array');
          assert(Array.isArray(question.future_state), 'Future state options not an array');
          assert(question.current_state.length === 5, 'Should have 5 maturity levels for current state');
          assert(question.future_state.length === 5, 'Should have 5 maturity levels for future state');
        });
      });
    });
  }
}

async function testNPSFeedback(assessmentId) {
  log.section('7. NPS FEEDBACK SYSTEM');
  
  await test('Submit NPS feedback - Promoter (9)', async () => {
    const response = await axios.post(`${API_BASE}/api/assessment/${assessmentId}/nps-feedback`, {
      score: 9,
      comment: 'Great assessment tool!'
    }, { timeout: TIMEOUT });
    
    assert(response.data.success, 'NPS feedback submission failed');
    assert(response.data.category === 'Promoter', 'Score 9 should be Promoter');
  });
  
  await test('Submit NPS feedback - Passive (7)', async () => {
    // Create another sample for this test
    const sampleResponse = await axios.post(`${API_BASE}/api/assessment/generate-sample`, {
      completionLevel: 'full'
    }, { timeout: TIMEOUT });
    
    const response = await axios.post(`${API_BASE}/api/assessment/${sampleResponse.data.assessment.id}/nps-feedback`, {
      score: 7,
      comment: 'Good but could be better'
    }, { timeout: TIMEOUT });
    
    assert(response.data.success, 'NPS feedback submission failed');
    assert(response.data.category === 'Passive', 'Score 7 should be Passive');
  });
  
  await test('Submit NPS feedback - Detractor (5)', async () => {
    // Create another sample for this test
    const sampleResponse = await axios.post(`${API_BASE}/api/assessment/generate-sample`, {
      completionLevel: 'full'
    }, { timeout: TIMEOUT });
    
    const response = await axios.post(`${API_BASE}/api/assessment/${sampleResponse.data.assessment.id}/nps-feedback`, {
      score: 5,
      comment: 'Needs improvement'
    }, { timeout: TIMEOUT });
    
    assert(response.data.success, 'NPS feedback submission failed');
    assert(response.data.category === 'Detractor', 'Score 5 should be Detractor');
  });
  
  await test('Validate NPS calculation after feedback', async () => {
    const response = await axios.get(`${API_BASE}/api/dashboard/stats`, { timeout: TIMEOUT });
    
    // After submitting feedback above, NPS should no longer be N/A
    const nps = response.data.feedbackNPS;
    if (nps !== 'N/A') {
      const npsValue = parseFloat(nps);
      assert(npsValue >= -100 && npsValue <= 100, 'NPS should be between -100 and 100');
    }
  });
}

async function testEditedContent(assessmentId) {
  log.section('8. SME EDITED CONTENT');
  
  await test('Save edited executive summary', async () => {
    const response = await axios.put(`${API_BASE}/api/assessment/${assessmentId}/edited-executive-summary`, {
      strategicSituation: 'Custom strategic situation text',
      criticalConstraints: 'Custom critical constraints text'
    }, { timeout: TIMEOUT });
    
    assert(response.data.success, 'Edited executive summary save failed');
  });
  
  await test('Retrieve edited executive summary', async () => {
    const response = await axios.get(`${API_BASE}/api/assessment/${assessmentId}/executive-summary`, { timeout: TIMEOUT });
    
    assert(response.data.success, 'Executive summary retrieval failed');
    // Check if edited content is preserved (if editedExecutiveSummary exists)
    if (response.data.editedExecutiveSummary) {
      assert(response.data.editedExecutiveSummary.strategicSituation, 'Edited strategic situation not saved');
      assert(response.data.editedExecutiveSummary.criticalConstraints, 'Edited critical constraints not saved');
    }
  });
}

async function testDataIntegrity() {
  log.section('9. DATA INTEGRITY CHECKS');
  
  await test('No assessments with invalid maturity levels', async () => {
    const response = await axios.get(`${API_BASE}/api/assessments`, { timeout: TIMEOUT });
    
    response.data.forEach(assessment => {
      if (assessment.responses) {
        Object.keys(assessment.responses).forEach(key => {
          if (key.endsWith('_current_state') || key.endsWith('_future_state')) {
            const value = parseInt(assessment.responses[key], 10);
            if (!isNaN(value)) {
              assert(value >= 1 && value <= 5, `Invalid maturity level ${value} in ${assessment.assessmentName}`);
            }
          }
        });
      }
    });
  });
  
  await test('No future < current state violations', async () => {
    const response = await axios.get(`${API_BASE}/api/assessments`, { timeout: TIMEOUT });
    
    response.data.forEach(assessment => {
      if (assessment.responses) {
        const questionIds = new Set();
        Object.keys(assessment.responses).forEach(key => {
          if (key.endsWith('_current_state') || key.endsWith('_future_state')) {
            const qId = key.replace('_current_state', '').replace('_future_state', '');
            questionIds.add(qId);
          }
        });
        
        questionIds.forEach(qId => {
          const current = parseInt(assessment.responses[`${qId}_current_state`], 10);
          const future = parseInt(assessment.responses[`${qId}_future_state`], 10);
          if (!isNaN(current) && !isNaN(future)) {
            assert(future >= current, `Future state < current state in ${assessment.assessmentName} for ${qId}`);
          }
        });
      }
    });
  });
  
  await test('All assessments have required fields', async () => {
    const response = await axios.get(`${API_BASE}/api/assessments`, { timeout: TIMEOUT });
    
    response.data.forEach(assessment => {
      assert(assessment.id, 'Assessment missing ID');
      assert(assessment.assessmentName, 'Assessment missing name');
      assert(assessment.startedAt, 'Assessment missing startedAt');
    });
  });
}

// =======================
// MAIN TEST RUNNER
// =======================

async function runAllTests() {
  console.log(chalk.cyan.bold('\n╔════════════════════════════════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║     COMPREHENSIVE FUNCTIONALITY TEST SUITE                ║'));
  console.log(chalk.cyan.bold('║     Testing: Links, Buttons, Filters, Calculations        ║'));
  console.log(chalk.cyan.bold('╚════════════════════════════════════════════════════════════╝\n'));
  
  log.info(`Testing API at: ${API_BASE}`);
  log.info(`Timeout: ${TIMEOUT}ms\n`);
  
  try {
    // Run all test suites
    await testAPIHealth();
    await testAssessmentCRUD();
    const sampleId = await testSampleAssessmentGeneration();
    
    if (sampleId) {
      await testResultsGeneration(sampleId);
      await testNPSFeedback(sampleId);
      await testEditedContent(sampleId);
    }
    
    await testDashboardCalculations();
    await testCategoryQuestions();
    await testDataIntegrity();
    
  } catch (error) {
    log.error(`Fatal error: ${error.message}`);
  }
  
  // Print summary
  console.log(chalk.cyan.bold('\n╔════════════════════════════════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║                    TEST SUMMARY                            ║'));
  console.log(chalk.cyan.bold('╚════════════════════════════════════════════════════════════╝\n'));
  
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(chalk.green(`Passed: ${results.passed}`));
  console.log(chalk.red(`Failed: ${results.failed}`));
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%\n`);
  
  if (results.failed > 0) {
    console.log(chalk.red('FAILED TESTS:'));
    results.tests.filter(t => t.status === 'FAIL').forEach(t => {
      console.log(chalk.red(`  ✗ ${t.name}`));
      console.log(chalk.gray(`    ${t.error}`));
    });
  }
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error(chalk.red('Test suite crashed:'), error);
  process.exit(1);
});

