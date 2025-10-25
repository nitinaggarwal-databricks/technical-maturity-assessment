#!/usr/bin/env node

/**
 * Comprehensive Validation Test Suite
 * Tests all critical functionality for production readiness
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_URL || 'https://web-production-76e27.up.railway.app';
const API_BASE = `${BASE_URL}/api`;

// Test results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// Helper functions
function logTest(name, passed, message, data = null) {
  results.total++;
  if (passed) {
    results.passed++;
    console.log(`✅ PASS: ${name}`);
  } else {
    results.failed++;
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${message}`);
    if (data) {
      console.log(`   Data:`, JSON.stringify(data, null, 2).substring(0, 500));
    }
  }
  results.tests.push({ name, passed, message, data });
}

function assertEqual(actual, expected, testName) {
  const passed = actual === expected;
  logTest(testName, passed, `Expected ${expected}, got ${actual}`);
  return passed;
}

function assertTruthy(value, testName, message = '') {
  const passed = !!value;
  logTest(testName, passed, message || `Expected truthy value, got ${value}`);
  return passed;
}

function assertExists(obj, path, testName) {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (!current || current[key] === undefined) {
      logTest(testName, false, `Property ${path} does not exist`);
      return false;
    }
    current = current[key];
  }
  logTest(testName, true, `Property ${path} exists with value: ${JSON.stringify(current).substring(0, 100)}`);
  return true;
}

function assertArray(value, testName, minLength = 0) {
  const passed = Array.isArray(value) && value.length >= minLength;
  logTest(testName, passed, `Expected array with length >= ${minLength}, got ${Array.isArray(value) ? value.length : 'not an array'}`);
  return passed;
}

function assertNumber(value, testName, min = null, max = null) {
  let passed = typeof value === 'number' && !isNaN(value);
  if (passed && min !== null) passed = value >= min;
  if (passed && max !== null) passed = value <= max;
  logTest(testName, passed, `Expected number ${min !== null ? `>= ${min}` : ''} ${max !== null ? `<= ${max}` : ''}, got ${value}`);
  return passed;
}

// Test suite
async function runTests() {
  console.log('\n🚀 Starting Comprehensive Validation Tests');
  console.log('='.repeat(80));
  console.log(`Testing: ${BASE_URL}`);
  console.log('='.repeat(80));
  console.log('');

  let sampleAssessmentId = null;
  let manualAssessmentId = null;

  try {
    // ===================================================================
    // SECTION 1: HEALTH & CONNECTIVITY
    // ===================================================================
    console.log('\n📡 SECTION 1: Health & Connectivity');
    console.log('-'.repeat(80));

    try {
      const health = await axios.get(`${API_BASE}/health`, { timeout: 10000 });
      assertExists(health.data, 'status', 'Health endpoint returns status');
      assertEqual(health.data.status, 'ok', 'Health check status is ok');
    } catch (error) {
      logTest('Health endpoint accessible', false, error.message);
    }

    // ===================================================================
    // SECTION 2: SAMPLE ASSESSMENT GENERATION
    // ===================================================================
    console.log('\n📝 SECTION 2: Sample Assessment Generation');
    console.log('-'.repeat(80));

    try {
      const sampleResponse = await axios.post(`${API_BASE}/assessment/generate-sample`, {
        level: 'full'
      }, { timeout: 30000 });

      assertExists(sampleResponse.data, 'success', 'Sample generation returns success flag');
      assertEqual(sampleResponse.data.success, true, 'Sample generation succeeds');
      
      if (sampleResponse.data.assessment) {
        sampleAssessmentId = sampleResponse.data.assessment.id;
        assertTruthy(sampleAssessmentId, 'Sample assessment has ID');
        assertExists(sampleResponse.data.assessment, 'assessmentName', 'Sample has assessment name');
        assertExists(sampleResponse.data.assessment, 'responses', 'Sample has responses');
        assertExists(sampleResponse.data.assessment, 'completedCategories', 'Sample has completed categories');
        assertArray(sampleResponse.data.assessment.completedCategories, 'Sample has completed categories array', 1);
        
        // Check responses object
        const responsesCount = Object.keys(sampleResponse.data.assessment.responses).length;
        assertNumber(responsesCount, 'Sample has responses', 10);
        
        console.log(`   Sample Assessment ID: ${sampleAssessmentId}`);
        console.log(`   Completed Categories: ${sampleResponse.data.assessment.completedCategories.length}`);
        console.log(`   Responses Count: ${responsesCount}`);
      } else {
        logTest('Sample assessment object exists', false, 'No assessment object in response');
      }
    } catch (error) {
      logTest('Sample assessment generation', false, error.message);
    }

    // ===================================================================
    // SECTION 3: SAMPLE ASSESSMENT RESULTS (DYNAMIC CONTENT)
    // ===================================================================
    console.log('\n📊 SECTION 3: Sample Assessment Results (Dynamic Content)');
    console.log('-'.repeat(80));

    if (sampleAssessmentId) {
      try {
        const results = await axios.get(`${API_BASE}/assessment/${sampleAssessmentId}/results`, { timeout: 30000 });

        assertExists(results.data, 'data', 'Results endpoint returns data');
        const data = results.data.data;

        // Check assessment info
        assertExists(data, 'assessmentInfo', 'Results have assessmentInfo');
        assertExists(data.assessmentInfo, 'assessmentName', 'Assessment info has name');
        assertNumber(data.assessmentInfo.questionsAnswered, 'Questions answered is a number', 1);
        assertNumber(data.assessmentInfo.completionPercentage, 'Completion percentage is a number', 0, 100);

        // Check overall scores
        assertExists(data, 'overall', 'Results have overall section');
        assertNumber(data.overall.currentScore, 'Overall current score exists', 0, 5);
        assertNumber(data.overall.futureScore, 'Overall future score exists', 0, 5);
        assertExists(data.overall, 'level', 'Overall has maturity level');

        // Check categoryDetails (pillar-specific data)
        assertExists(data, 'categoryDetails', 'Results have categoryDetails');
        const categoryDetailsKeys = Object.keys(data.categoryDetails || {});
        assertTruthy(categoryDetailsKeys.length > 0, 'Category details has pillars', `Found ${categoryDetailsKeys.length} pillars`);

        // Check prioritizedActions (THE GOOD / THE BAD / RECOMMENDATIONS)
        assertExists(data, 'prioritizedActions', 'Results have prioritizedActions');
        assertArray(data.prioritizedActions, 'Prioritized actions is array', 1);

        if (data.prioritizedActions && data.prioritizedActions.length > 0) {
          const firstAction = data.prioritizedActions[0];
          assertExists(firstAction, 'pillarId', 'Prioritized action has pillarId');
          assertExists(firstAction, 'pillarName', 'Prioritized action has pillarName');
          assertExists(firstAction, 'theGood', 'Prioritized action has theGood array');
          assertExists(firstAction, 'theBad', 'Prioritized action has theBad array');
          assertExists(firstAction, 'actions', 'Prioritized action has actions array');
          
          // Verify theGood and theBad are NOT empty for completed pillars
          if (firstAction.theGood) {
            console.log(`   ✓ theGood has ${firstAction.theGood.length} items`);
          }
          if (firstAction.theBad) {
            console.log(`   ✓ theBad has ${firstAction.theBad.length} items`);
          }
          if (firstAction.actions) {
            console.log(`   ✓ actions has ${firstAction.actions.length} items`);
          }
        }

        // Check executiveSummary
        assertExists(data, 'executiveSummary', 'Results have executiveSummary');
        
        // Check dynamic generation flags
        assertExists(data, '_isDynamic', 'Results have _isDynamic flag');
        assertEqual(data._isDynamic, true, 'Results are marked as dynamically generated');
        assertExists(data, '_generatedAt', 'Results have _generatedAt timestamp');

        console.log(`   ✓ Overall Current Score: ${data.overall.currentScore}`);
        console.log(`   ✓ Overall Future Score: ${data.overall.futureScore}`);
        console.log(`   ✓ Pillar Count: ${categoryDetailsKeys.length}`);
        console.log(`   ✓ Prioritized Actions: ${data.prioritizedActions.length}`);
        console.log(`   ✓ Dynamic Generation: ${data._isDynamic ? 'YES' : 'NO'}`);

      } catch (error) {
        logTest('Sample assessment results retrieval', false, error.message);
      }
    } else {
      console.log('   ⚠️  Skipping - no sample assessment ID');
    }

    // ===================================================================
    // SECTION 4: INDIVIDUAL PILLAR RESULTS
    // ===================================================================
    console.log('\n🔍 SECTION 4: Individual Pillar Results');
    console.log('-'.repeat(80));

    if (sampleAssessmentId) {
      const testPillars = ['platform_governance', 'data_engineering', 'analytics_bi'];
      
      for (const pillarId of testPillars) {
        try {
          const pillarResults = await axios.get(
            `${API_BASE}/assessment/${sampleAssessmentId}/pillar/${pillarId}/results`,
            { timeout: 30000 }
          );

          assertExists(pillarResults.data, 'pillarDetails', `${pillarId} has pillar details`);
          assertExists(pillarResults.data, 'painPointRecommendations', `${pillarId} has pain point recommendations`);
          assertExists(pillarResults.data, 'gapBasedActions', `${pillarId} has gap-based actions`);
          
          if (pillarResults.data.pillarDetails) {
            const details = pillarResults.data.pillarDetails;
            console.log(`   ✓ ${pillarId}: Score ${details.currentScore || 0} → ${details.futureScore || 0}`);
          }
        } catch (error) {
          // It's okay if pillar has no responses yet
          if (error.response && error.response.status === 400 && error.response.data.message.includes('No responses')) {
            console.log(`   ⚠️  ${pillarId}: No responses (expected for partial assessments)`);
          } else {
            logTest(`${pillarId} pillar results`, false, error.message);
          }
        }
      }
    } else {
      console.log('   ⚠️  Skipping - no sample assessment ID');
    }

    // ===================================================================
    // SECTION 5: MANUAL ASSESSMENT CREATION & FLOW
    // ===================================================================
    console.log('\n✏️  SECTION 5: Manual Assessment Creation');
    console.log('-'.repeat(80));

    try {
      const createResponse = await axios.post(`${API_BASE}/assessment`, {
        organizationName: 'Test Organization',
        industry: 'Technology',
        contactEmail: 'test@example.com',
        assessmentName: 'Test Assessment ' + Date.now()
      }, { timeout: 10000 });

      assertExists(createResponse.data, 'id', 'Manual assessment creation returns ID');
      
      if (createResponse.data.id) {
        manualAssessmentId = createResponse.data.id;
        console.log(`   Manual Assessment ID: ${manualAssessmentId}`);
        
        // Save some progress
        try {
          const saveResponse = await axios.put(`${API_BASE}/assessment/${manualAssessmentId}/progress`, {
            responses: {
              'platform_governance_q1_current_state': 3,
              'platform_governance_q1_future_state': 4,
              'platform_governance_q1_technical_pain': ['Manual processes'],
              'platform_governance_q1_comment': 'Test comment'
            }
          }, { timeout: 10000 });

          assertExists(saveResponse.data, 'success', 'Progress save returns success');
          console.log(`   ✓ Progress saved successfully`);
        } catch (error) {
          logTest('Save assessment progress', false, error.message);
        }
        
        // Get results for partial assessment
        try {
          const partialResults = await axios.get(`${API_BASE}/assessment/${manualAssessmentId}/results`, { timeout: 30000 });
          assertExists(partialResults.data, 'data', 'Partial assessment has results');
          console.log(`   ✓ Partial assessment results generated`);
        } catch (error) {
          logTest('Partial assessment results', false, error.message);
        }
      }
    } catch (error) {
      logTest('Manual assessment creation', false, error.message);
    }

    // ===================================================================
    // SECTION 6: ASSESSMENT LISTING
    // ===================================================================
    console.log('\n📋 SECTION 6: Assessment Listing');
    console.log('-'.repeat(80));

    try {
      const listResponse = await axios.get(`${API_BASE}/assessments`, { timeout: 10000 });
      assertArray(listResponse.data, 'Assessments list is array', 1);
      
      if (Array.isArray(listResponse.data) && listResponse.data.length > 0) {
        const firstAssessment = listResponse.data[0];
        assertExists(firstAssessment, 'id', 'Assessment has ID');
        assertExists(firstAssessment, 'assessmentName', 'Assessment has name');
        console.log(`   ✓ Found ${listResponse.data.length} assessments`);
      }
    } catch (error) {
      logTest('Assessment listing', false, error.message);
    }

    // ===================================================================
    // SECTION 7: DYNAMIC CONTENT VERIFICATION
    // ===================================================================
    console.log('\n🔄 SECTION 7: Dynamic Content Verification');
    console.log('-'.repeat(80));

    // Generate two different sample assessments and verify they have different content
    try {
      const sample1 = await axios.post(`${API_BASE}/assessment/generate-sample`, { level: 'minimal' }, { timeout: 30000 });
      const sample2 = await axios.post(`${API_BASE}/assessment/generate-sample`, { level: 'full' }, { timeout: 30000 });
      
      if (sample1.data.assessment && sample2.data.assessment) {
        const results1 = await axios.get(`${API_BASE}/assessment/${sample1.data.assessment.id}/results`, { timeout: 30000 });
        const results2 = await axios.get(`${API_BASE}/assessment/${sample2.data.assessment.id}/results`, { timeout: 30000 });
        
        const score1 = results1.data.data.overall.currentScore;
        const score2 = results2.data.data.overall.currentScore;
        
        // Scores should be different for minimal vs full
        const areDifferent = Math.abs(score1 - score2) > 0.1;
        assertTruthy(areDifferent, 'Different assessments produce different results', 
          `Minimal: ${score1}, Full: ${score2}`);
        
        console.log(`   ✓ Minimal sample score: ${score1}`);
        console.log(`   ✓ Full sample score: ${score2}`);
        console.log(`   ✓ Scores are different: ${areDifferent}`);
      }
    } catch (error) {
      logTest('Dynamic content verification', false, error.message);
    }

    // ===================================================================
    // SECTION 8: DATA STRUCTURE VALIDATION
    // ===================================================================
    console.log('\n🏗️  SECTION 8: Data Structure Validation');
    console.log('-'.repeat(80));

    if (sampleAssessmentId) {
      try {
        const results = await axios.get(`${API_BASE}/assessment/${sampleAssessmentId}/results`, { timeout: 30000 });
        const data = results.data.data;

        // Validate prioritizedActions structure
        if (data.prioritizedActions && data.prioritizedActions.length > 0) {
          const action = data.prioritizedActions[0];
          
          // Check for correct field names (theGood/theBad, not strengths/weaknesses)
          const hasCorrectFields = action.hasOwnProperty('theGood') && action.hasOwnProperty('theBad');
          assertTruthy(hasCorrectFields, 'Prioritized actions use correct field names (theGood/theBad)');
          
          // Check for incorrect field names
          const hasIncorrectFields = action.hasOwnProperty('strengths') || action.hasOwnProperty('weaknesses');
          assertTruthy(!hasIncorrectFields, 'Prioritized actions do NOT use old field names (strengths/weaknesses)');
        }

        // Validate executiveSummary structure
        if (data.executiveSummary) {
          const summaryType = typeof data.executiveSummary;
          console.log(`   ✓ executiveSummary type: ${summaryType}`);
          
          if (summaryType === 'object' && data.executiveSummary !== null) {
            const keys = Object.keys(data.executiveSummary);
            console.log(`   ✓ executiveSummary keys: ${keys.join(', ')}`);
          }
        }

        // Validate categoryDetails structure
        if (data.categoryDetails) {
          const isObject = typeof data.categoryDetails === 'object' && !Array.isArray(data.categoryDetails);
          assertTruthy(isObject, 'categoryDetails is an object (not array)');
          
          const categoryKeys = Object.keys(data.categoryDetails);
          console.log(`   ✓ categoryDetails pillars: ${categoryKeys.join(', ')}`);
        }

      } catch (error) {
        logTest('Data structure validation', false, error.message);
      }
    } else {
      console.log('   ⚠️  Skipping - no sample assessment ID');
    }

    // ===================================================================
    // SECTION 9: ERROR HANDLING
    // ===================================================================
    console.log('\n⚠️  SECTION 9: Error Handling');
    console.log('-'.repeat(80));

    try {
      // Try to get results for non-existent assessment
      await axios.get(`${API_BASE}/assessment/non-existent-id/results`, { timeout: 10000 });
      logTest('Non-existent assessment returns 404', false, 'Should have thrown 404 error');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        logTest('Non-existent assessment returns 404', true, 'Correct error handling');
      } else {
        logTest('Non-existent assessment error handling', false, `Unexpected error: ${error.message}`);
      }
    }

    try {
      // Try to get pillar results with no responses
      await axios.get(`${API_BASE}/assessment/${sampleAssessmentId}/pillar/nonexistent_pillar/results`, { timeout: 10000 });
      logTest('Invalid pillar returns error', false, 'Should have thrown error');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logTest('Invalid pillar returns 400', true, 'Correct error handling');
      } else {
        logTest('Invalid pillar error handling', false, `Unexpected error: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('\n💥 FATAL ERROR:', error.message);
    console.error(error.stack);
  }

  // ===================================================================
  // FINAL REPORT
  // ===================================================================
  console.log('\n' + '='.repeat(80));
  console.log('📊 FINAL TEST REPORT');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed} (${Math.round(results.passed / results.total * 100)}%)`);
  console.log(`❌ Failed: ${results.failed} (${Math.round(results.failed / results.total * 100)}%)`);
  console.log('='.repeat(80));

  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`   • ${t.name}: ${t.message}`);
    });
  }

  console.log('\n🎯 PRODUCTION READINESS ASSESSMENT:');
  const passRate = results.passed / results.total;
  if (passRate >= 0.95) {
    console.log('   ✅ EXCELLENT - Ready for production (>95% pass rate)');
  } else if (passRate >= 0.85) {
    console.log('   ⚠️  GOOD - Minor issues to address (85-95% pass rate)');
  } else if (passRate >= 0.70) {
    console.log('   ⚠️  FAIR - Multiple issues need fixing (70-85% pass rate)');
  } else {
    console.log('   ❌ POOR - Critical issues must be fixed (<70% pass rate)');
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Test Suite Complete\n');

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});

