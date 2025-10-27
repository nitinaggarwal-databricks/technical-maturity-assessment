#!/usr/bin/env node

/**
 * Comprehensive Bug Hunting Test Suite
 * Tests all API endpoints and critical workflows
 */

const axios = require('axios');

// Simple console colors fallback
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

const BASE_URL = process.env.API_URL || 'https://technical-maturity-assessment-production.up.railway.app';

let testResults = {
  passed: 0,
  failed: 0,
  bugs: []
};

let createdAssessmentIds = [];

// Helper functions
const log = {
  section: (text) => console.log('\n' + colors.bold(colors.cyan(`${'='.repeat(60)}\n${text}\n${'='.repeat(60)}`))),
  test: (text) => console.log(colors.blue(`\n▶ Testing: ${text}`)),
  pass: (text) => {
    testResults.passed++;
    console.log(colors.green(`  ✓ ${text}`));
  },
  fail: (text, error) => {
    testResults.failed++;
    testResults.bugs.push({ test: text, error: error.message || error });
    console.log(colors.red(`  ✗ ${text}`));
    console.log(colors.red(`    Error: ${error.message || error}`));
  },
  info: (text) => console.log(colors.yellow(`    ℹ ${text}`)),
  data: (label, data) => console.log(colors.cyan(`    ${label}:`), JSON.stringify(data, null, 2)),
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test functions
async function testHealthEndpoint() {
  log.test('Health endpoint returns 200');
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    if (response.status === 200 && response.data.status === 'ok') {
      log.pass('Health endpoint working');
      log.data('Response', response.data);
    } else {
      log.fail('Health endpoint returned unexpected response', new Error(`Status: ${response.status}`));
    }
  } catch (error) {
    log.fail('Health endpoint failed', error);
  }
}

async function testAssessmentFramework() {
  log.test('Assessment framework loads');
  try {
    const response = await axios.get(`${BASE_URL}/api/assessment-framework`);
    if (response.data && response.data.assessmentAreas) {
      log.pass('Assessment framework loaded');
      log.info(`Found ${response.data.assessmentAreas.length} assessment areas`);
    } else {
      log.fail('Assessment framework missing assessmentAreas', new Error('Invalid structure'));
    }
  } catch (error) {
    log.fail('Assessment framework failed to load', error);
  }
}

async function testCreateAssessment() {
  log.test('Create new assessment');
  try {
    const response = await axios.post(`${BASE_URL}/api/assessment`, {
      contactEmail: 'test@bugtest.com',
      assessmentName: 'Bug Hunt Test Assessment',
      assessmentDescription: 'Testing for bugs'
    });
    
    if (response.data && (response.data.assessmentId || response.data.id)) {
      const assessmentId = response.data.assessmentId || response.data.id;
      createdAssessmentIds.push(assessmentId);
      log.pass('Assessment created successfully');
      log.info(`Assessment ID: ${assessmentId}`);
      return assessmentId;
    } else {
      log.fail('Assessment creation returned invalid response', new Error('Missing ID'));
    }
  } catch (error) {
    log.fail('Assessment creation failed', error);
  }
  return null;
}

async function testSampleAssessmentGeneration() {
  log.test('Generate sample assessments (full, partial, minimal)');
  
  const levels = ['full', 'partial', 'minimal'];
  
  for (const level of levels) {
    try {
      const response = await axios.post(`${BASE_URL}/api/assessment/generate-sample`, {
        level: level
      });
      
      if (response.data && response.data.success && response.data.assessment) {
        const assessmentId = response.data.assessment.id || response.data.assessment.assessmentId;
        createdAssessmentIds.push(assessmentId);
        log.pass(`${level} sample generated`);
        log.info(`Assessment ID: ${assessmentId}`);
        log.info(`Completed pillars: ${response.data.assessment.completedCategories?.length || 0}`);
        
        // Check if responses exist
        if (!response.data.assessment.responses || Object.keys(response.data.assessment.responses).length === 0) {
          log.fail(`${level} sample missing responses`, new Error('No responses in assessment'));
        }
      } else {
        log.fail(`${level} sample generation returned invalid response`, new Error('Missing assessment data'));
      }
      
      await sleep(1000); // Rate limiting
    } catch (error) {
      log.fail(`${level} sample generation failed`, error);
    }
  }
}

async function testGetAssessmentsList() {
  log.test('Get all assessments list');
  try {
    const response = await axios.get(`${BASE_URL}/api/assessments`);
    
    if (Array.isArray(response.data) || Array.isArray(response.data.data)) {
      const assessments = Array.isArray(response.data) ? response.data : response.data.data;
      log.pass('Assessments list retrieved');
      log.info(`Found ${assessments.length} assessments`);
    } else {
      log.fail('Assessments list returned invalid format', new Error('Not an array'));
    }
  } catch (error) {
    log.fail('Get assessments list failed', error);
  }
}

async function testGetAssessmentById(assessmentId) {
  if (!assessmentId) return;
  
  log.test(`Get assessment by ID: ${assessmentId}`);
  try {
    const response = await axios.get(`${BASE_URL}/api/assessment/${assessmentId}`);
    
    if (response.data && response.data.id) {
      log.pass('Assessment retrieved successfully');
      log.info(`Name: ${response.data.assessmentName || 'N/A'}`);
      log.info(`Status: ${response.data.status || 'N/A'}`);
      log.info(`Responses: ${Object.keys(response.data.responses || {}).length}`);
    } else {
      log.fail('Assessment retrieval returned invalid data', new Error('Missing id'));
    }
  } catch (error) {
    log.fail('Get assessment by ID failed', error);
  }
}

async function testGetCategoryQuestions() {
  log.test('Get category questions (platform_governance)');
  try {
    const response = await axios.get(`${BASE_URL}/api/assessment/categories/platform_governance/questions`);
    
    if (response.data && response.data.area) {
      log.pass('Category questions retrieved');
      log.info(`Area: ${response.data.area.name}`);
      log.info(`Dimensions: ${response.data.area.dimensions?.length || 0}`);
    } else {
      log.fail('Category questions returned invalid structure', new Error('Missing area'));
    }
  } catch (error) {
    log.fail('Get category questions failed', error);
  }
}

async function testSaveProgress(assessmentId) {
  if (!assessmentId) return;
  
  log.test(`Save assessment progress for ${assessmentId}`);
  try {
    const response = await axios.post(`${BASE_URL}/api/assessment/${assessmentId}/progress`, {
      responses: {
        'test_question_current_state': '3',
        'test_question_future_state': '4',
        'test_question_technical_pain': 'Performance issues',
        'test_question_business_pain': 'Slow queries'
      },
      completedCategories: ['platform_governance']
    });
    
    if (response.data && (response.data.success || response.data.message)) {
      log.pass('Progress saved successfully');
    } else {
      log.fail('Save progress returned invalid response', new Error('Unexpected response format'));
    }
  } catch (error) {
    log.fail('Save progress failed', error);
  }
}

async function testGetOverallResults(assessmentId) {
  if (!assessmentId) return;
  
  log.test(`Get overall results for ${assessmentId}`);
  try {
    const response = await axios.get(`${BASE_URL}/api/assessment/${assessmentId}/results`);
    
    if (response.data && response.data.overall) {
      log.pass('Overall results retrieved');
      log.info(`Current Score: ${response.data.overall.currentScore || 'N/A'}`);
      log.info(`Target Score: ${response.data.overall.targetScore || 'N/A'}`);
      log.info(`Gap: ${response.data.overall.gap || 'N/A'}`);
      
      // Check if results are dynamic
      if (response.data._isDynamic) {
        log.pass('Results marked as dynamically generated');
      } else {
        log.fail('Results not marked as dynamic', new Error('May be using cached data'));
      }
    } else {
      log.fail('Overall results returned invalid structure', new Error('Missing overall'));
    }
  } catch (error) {
    log.fail('Get overall results failed', error);
  }
}

async function testGetPillarResults(assessmentId) {
  if (!assessmentId) return;
  
  log.test(`Get pillar results for ${assessmentId} (platform_governance)`);
  try {
    const response = await axios.get(`${BASE_URL}/api/assessment/${assessmentId}/pillar/platform_governance/results`);
    
    if (response.data && response.data.success !== false) {
      log.pass('Pillar results retrieved');
      
      // Check structure based on actual backend response
      const hasData = response.data.pillarDetails || response.data.data?.pillarDetails;
      
      if (hasData) {
        log.info(`Structure valid`);
      } else {
        log.fail('Pillar results missing pillarDetails', new Error('Invalid structure'));
      }
    } else {
      log.fail('Pillar results returned error', new Error(response.data?.error || 'Unknown error'));
    }
  } catch (error) {
    log.fail('Get pillar results failed', error);
  }
}

async function testCloneAssessment(assessmentId) {
  if (!assessmentId) return;
  
  log.test(`Clone assessment ${assessmentId}`);
  try {
    const response = await axios.post(`${BASE_URL}/api/assessment/${assessmentId}/clone`);
    
    if (response.data && response.data.success && response.data.clonedAssessment) {
      const clonedId = response.data.clonedAssessment.id || response.data.clonedAssessment.assessmentId;
      createdAssessmentIds.push(clonedId);
      log.pass('Assessment cloned successfully');
      log.info(`Cloned ID: ${clonedId}`);
    } else {
      log.fail('Clone assessment returned invalid response', new Error('Missing cloned assessment'));
    }
  } catch (error) {
    log.fail('Clone assessment failed', error);
  }
}

async function testDashboardStats() {
  log.test('Get dashboard statistics');
  try {
    const response = await axios.get(`${BASE_URL}/api/dashboard/stats`);
    
    if (response.data) {
      log.pass('Dashboard stats retrieved');
      log.info(`Total Assessments: ${response.data.totalAssessments || 0}`);
      log.info(`Active Customers: ${response.data.activeCustomers || 0}`);
      log.info(`Avg Maturity: ${response.data.avgMaturityLevel || 'N/A'}`);
      
      // Check if data seems real vs hardcoded
      if (response.data.totalAssessments > 0) {
        log.pass('Dashboard shows real data');
      } else {
        log.info('Dashboard shows 0 assessments (may need test data)');
      }
    } else {
      log.fail('Dashboard stats returned invalid data', new Error('Missing data'));
    }
  } catch (error) {
    log.fail('Get dashboard stats failed', error);
  }
}

async function testEditExecutiveSummary(assessmentId) {
  if (!assessmentId) return;
  
  log.test(`Edit executive summary for ${assessmentId}`);
  try {
    const response = await axios.put(`${BASE_URL}/api/assessment/${assessmentId}/edited-executive-summary`, {
      strategicSituation: 'EDITED: Test strategic situation',
      criticalConstraints: 'EDITED: Test critical constraints'
    });
    
    if (response.data && response.data.success) {
      log.pass('Executive summary edited successfully');
    } else {
      log.fail('Edit executive summary returned invalid response', new Error('Unexpected response'));
    }
  } catch (error) {
    log.fail('Edit executive summary failed', error);
  }
}

async function testDeleteAssessment(assessmentId) {
  if (!assessmentId) return;
  
  log.test(`Delete assessment ${assessmentId}`);
  try {
    const response = await axios.delete(`${BASE_URL}/api/assessment/${assessmentId}`);
    
    if (response.data && response.data.success) {
      log.pass('Assessment deleted successfully');
      // Remove from our tracking array
      createdAssessmentIds = createdAssessmentIds.filter(id => id !== assessmentId);
    } else {
      log.fail('Delete assessment returned invalid response', new Error('Unexpected response'));
    }
  } catch (error) {
    log.fail('Delete assessment failed', error);
  }
}

async function cleanup() {
  if (createdAssessmentIds.length === 0) return;
  
  log.section('CLEANUP: Deleting test assessments');
  
  for (const id of createdAssessmentIds) {
    try {
      await axios.delete(`${BASE_URL}/api/assessment/${id}`);
      log.info(`Deleted assessment ${id}`);
    } catch (error) {
      log.info(`Failed to delete ${id}: ${error.message}`);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log(colors.bold(colors.cyan('\n╔════════════════════════════════════════════════════════════╗')));
  console.log(colors.bold(colors.cyan('║        COMPREHENSIVE BUG HUNTING TEST SUITE               ║')));
  console.log(colors.bold(colors.cyan('╚════════════════════════════════════════════════════════════╝')));
  console.log(colors.yellow(`\nTarget: ${BASE_URL}\n`));
  
  try {
    // Basic endpoint tests
    log.section('BASIC ENDPOINT TESTS');
    await testHealthEndpoint();
    await testAssessmentFramework();
    await testGetAssessmentsList();
    await testGetCategoryQuestions();
    
    // Assessment creation and manipulation
    log.section('ASSESSMENT CREATION & MANIPULATION');
    const testAssessmentId = await testCreateAssessment();
    await sleep(500);
    
    if (testAssessmentId) {
      await testGetAssessmentById(testAssessmentId);
      await testSaveProgress(testAssessmentId);
      await testGetOverallResults(testAssessmentId);
      await testGetPillarResults(testAssessmentId);
      await testEditExecutiveSummary(testAssessmentId);
      await testCloneAssessment(testAssessmentId);
    }
    
    // Sample assessment generation
    log.section('SAMPLE ASSESSMENT GENERATION');
    await testSampleAssessmentGeneration();
    
    // Test results with a sample assessment
    if (createdAssessmentIds.length > 1) {
      const sampleId = createdAssessmentIds[createdAssessmentIds.length - 1];
      await testGetOverallResults(sampleId);
      await testGetPillarResults(sampleId);
    }
    
    // Dashboard tests
    log.section('DASHBOARD & ANALYTICS');
    await testDashboardStats();
    
    // Cleanup
    await cleanup();
    
  } catch (error) {
    console.error(colors.red('\nUnexpected error during test execution:'), error);
  }
  
  // Print summary
  log.section('TEST SUMMARY');
  console.log(colors.bold(`\nTotal Tests: ${testResults.passed + testResults.failed}`));
  console.log(colors.green(`Passed: ${testResults.passed}`));
  console.log(colors.red(`Failed: ${testResults.failed}`));
  
  if (testResults.bugs.length > 0) {
    console.log(colors.bold(colors.red('\n🐛 BUGS FOUND:\n')));
    testResults.bugs.forEach((bug, index) => {
      console.log(colors.red(`${index + 1}. ${bug.test}`));
      console.log(colors.yellow(`   └─ ${bug.error}\n`));
    });
  } else {
    console.log(colors.bold(colors.green('\n✨ NO BUGS FOUND! Application is stable.\n')));
  }
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error(colors.red('Fatal error:'), error);
  process.exit(1);
});

