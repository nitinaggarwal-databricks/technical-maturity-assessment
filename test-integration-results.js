#!/usr/bin/env node

/**
 * Comprehensive Integration Test: Assessment Results Accuracy & Consistency
 * 
 * Tests:
 * 1. Partial assessment → View results → Add more data → Verify results update
 * 2. Full assessment → View results → Change input → Verify results reflect changes
 * 3. Repeat 10 times to ensure consistency
 * 4. Verify all 3 output types: Individual Pillar, Overall Results, Executive Summary
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

// Helper to wait
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get framework
let frameworkCache = null;
async function getFramework() {
  if (frameworkCache) return frameworkCache;
  const result = await apiCall('GET', '/assessment/framework');
  frameworkCache = result.data.data;
  return frameworkCache;
}

// Create assessment with specific data
async function createAssessment(name, email) {
  const result = await apiCall('POST', '/assessment/start', {
    assessmentName: name,
    contactEmail: email,
    organizationName: 'Test Organization',
    industry: 'Technology'
  });
  
  if (!result.success) {
    throw new Error(`Failed to create assessment: ${JSON.stringify(result.error)}`);
  }
  
  return result.data.data.assessmentId;
}

// Fill questions with specific values
async function fillQuestions(assessmentId, pillarId, numQuestions, currentScore, futureScore, painPoints = {}) {
  const framework = await getFramework();
  const pillar = framework.assessmentAreas.find(a => a.id === pillarId);
  
  if (!pillar) {
    throw new Error(`Pillar ${pillarId} not found`);
  }
  
  const questions = [];
  pillar.dimensions.forEach(dim => {
    questions.push(...dim.questions);
  });
  
  const questionsToFill = questions.slice(0, Math.min(numQuestions, questions.length));
  
  for (const question of questionsToFill) {
    // Current state
    await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
      questionId: question.id,
      perspectiveId: 'current_state',
      value: currentScore.toString(),
      editorEmail: 'test@example.com'
    });
    
    // Future state
    await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
      questionId: question.id,
      perspectiveId: 'future_state',
      value: futureScore.toString(),
      editorEmail: 'test@example.com'
    });
    
    // Pain points (if provided)
    if (painPoints.technical && painPoints.technical.length > 0) {
      await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
        questionId: question.id,
        perspectiveId: 'technical_pain',
        value: painPoints.technical,
        editorEmail: 'test@example.com'
      });
    }
    
    if (painPoints.business && painPoints.business.length > 0) {
      await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
        questionId: question.id,
        perspectiveId: 'business_pain',
        value: painPoints.business,
        editorEmail: 'test@example.com'
      });
    }
    
    // Add comment
    await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
      questionId: question.id,
      comment: `Test comment for ${question.topic} - Current: ${currentScore}, Future: ${futureScore}`,
      editorEmail: 'test@example.com'
    });
  }
  
  return questionsToFill.length;
}

// Get all 3 result types
async function getAllResults(assessmentId, pillarId) {
  const results = {};
  
  // 1. Overall results
  const overallResult = await apiCall('GET', `/assessment/${assessmentId}/results`);
  if (overallResult.success) {
    results.overall = overallResult.data.data;
  } else {
    results.overall = { error: overallResult.error };
  }
  
  // 2. Pillar results
  const pillarResult = await apiCall('GET', `/assessment/${assessmentId}/pillar/${pillarId}/results`);
  if (pillarResult.success) {
    results.pillar = pillarResult.data.data;
  } else {
    results.pillar = { error: pillarResult.error };
  }
  
  // 3. Executive summary (from overall results)
  if (results.overall && results.overall.overall && results.overall.overall.summary) {
    results.executiveSummary = results.overall.overall.summary;
  } else {
    results.executiveSummary = { error: 'No executive summary found' };
  }
  
  return results;
}

// Extract key metrics from results
function extractMetrics(results) {
  const metrics = {
    overall: {
      currentScore: results.overall?.overall?.currentScore || 0,
      futureScore: results.overall?.overall?.futureScore || 0,
      gap: results.overall?.overall?.gap || 0,
      summaryLength: results.executiveSummary?.length || 0
    },
    pillar: {
      currentScore: results.pillar?.pillarDetails?.currentScore || 0,
      futureScore: results.pillar?.pillarDetails?.futureScore || 0,
      gap: results.pillar?.pillarDetails?.gap || 0,
      recommendationsCount: results.pillar?.recommendations?.length || 0
    }
  };
  
  return metrics;
}

// Compare metrics to verify changes
function compareMetrics(before, after, expectedChange) {
  const issues = [];
  
  // Check if overall scores changed as expected
  if (expectedChange.overall) {
    if (expectedChange.overall.currentScore !== undefined) {
      const actualChange = after.overall.currentScore - before.overall.currentScore;
      const expectedDelta = expectedChange.overall.currentScore - before.overall.currentScore;
      if (Math.abs(actualChange - expectedDelta) > 0.5) {
        issues.push(`Overall current score: Expected change to ${expectedChange.overall.currentScore}, got ${after.overall.currentScore}`);
      }
    }
  }
  
  // Check if pillar scores changed as expected
  if (expectedChange.pillar) {
    if (expectedChange.pillar.currentScore !== undefined) {
      const actualChange = after.pillar.currentScore - before.pillar.currentScore;
      const expectedDelta = expectedChange.pillar.currentScore - before.pillar.currentScore;
      if (Math.abs(actualChange - expectedDelta) > 0.5) {
        issues.push(`Pillar current score: Expected change to ${expectedChange.pillar.currentScore}, got ${after.pillar.currentScore}`);
      }
    }
  }
  
  // Check if executive summary changed
  if (expectedChange.summaryChanged) {
    if (before.overall.summaryLength === after.overall.summaryLength) {
      issues.push(`Executive summary did not change (length: ${after.overall.summaryLength})`);
    }
  }
  
  return issues;
}

// Verify results accuracy
function verifyResultsAccuracy(results, expectedScores) {
  const issues = [];
  
  // Check overall scores
  if (results.overall?.overall) {
    const { currentScore, futureScore, gap } = results.overall.overall;
    
    if (expectedScores.current !== undefined) {
      if (Math.abs(currentScore - expectedScores.current) > 0.5) {
        issues.push(`Overall current score: Expected ~${expectedScores.current}, got ${currentScore}`);
      }
    }
    
    if (expectedScores.future !== undefined) {
      if (Math.abs(futureScore - expectedScores.future) > 0.5) {
        issues.push(`Overall future score: Expected ~${expectedScores.future}, got ${futureScore}`);
      }
    }
    
    const expectedGap = expectedScores.future - expectedScores.current;
    if (Math.abs(gap - expectedGap) > 0.5) {
      issues.push(`Overall gap: Expected ~${expectedGap}, got ${gap}`);
    }
  } else {
    issues.push('Overall results missing');
  }
  
  // Check pillar scores
  if (results.pillar?.pillarDetails) {
    const { currentScore, futureScore, gap } = results.pillar.pillarDetails;
    
    if (expectedScores.current !== undefined) {
      if (Math.abs(currentScore - expectedScores.current) > 0.5) {
        issues.push(`Pillar current score: Expected ~${expectedScores.current}, got ${currentScore}`);
      }
    }
    
    if (expectedScores.future !== undefined) {
      if (Math.abs(futureScore - expectedScores.future) > 0.5) {
        issues.push(`Pillar future score: Expected ~${expectedScores.future}, got ${futureScore}`);
      }
    }
  } else {
    issues.push('Pillar results missing');
  }
  
  // Check executive summary exists
  if (!results.executiveSummary || results.executiveSummary.length < 100) {
    issues.push('Executive summary too short or missing');
  }
  
  return issues;
}

// Main test scenarios
async function testPartialAssessment() {
  log('\n' + '='.repeat(80), colors.bright);
  log('🧪 TEST 1: PARTIAL ASSESSMENT → ADD MORE DATA → VERIFY UPDATES', colors.bright + colors.cyan);
  log('='.repeat(80) + '\n', colors.bright);
  
  const testName = `Partial Test ${Date.now()}`;
  const pillarId = 'platform_governance';
  
  try {
    // Step 1: Create assessment with 3 questions answered
    log('📝 Step 1: Create assessment with 3 questions (Current: 2, Future: 4)', colors.yellow);
    const assessmentId = await createAssessment(testName, 'partial-test@example.com');
    log(`✓ Assessment created: ${assessmentId}`, colors.green);
    
    await fillQuestions(assessmentId, pillarId, 3, 2, 4, {
      technical: ['data_quality_issues'],
      business: ['slow_time_to_insights']
    });
    log('✓ Filled 3 questions', colors.green);
    
    // Step 2: Get initial results
    log('\n📊 Step 2: Get initial results (all 3 types)', colors.yellow);
    const initialResults = await getAllResults(assessmentId, pillarId);
    const initialMetrics = extractMetrics(initialResults);
    
    log(`Initial Metrics:`, colors.cyan);
    log(`  Overall: Current=${initialMetrics.overall.currentScore}, Future=${initialMetrics.overall.futureScore}, Gap=${initialMetrics.overall.gap}`, colors.cyan);
    log(`  Pillar:  Current=${initialMetrics.pillar.currentScore}, Future=${initialMetrics.pillar.futureScore}, Gap=${initialMetrics.pillar.gap}`, colors.cyan);
    log(`  Executive Summary: ${initialMetrics.overall.summaryLength} chars`, colors.cyan);
    log(`  Recommendations: ${initialMetrics.pillar.recommendationsCount} items`, colors.cyan);
    
    // Verify initial accuracy
    const initialIssues = verifyResultsAccuracy(initialResults, { current: 2, future: 4 });
    if (initialIssues.length > 0) {
      log('\n⚠️  Initial Results Accuracy Issues:', colors.yellow);
      initialIssues.forEach(issue => log(`  • ${issue}`, colors.yellow));
    } else {
      log('✓ Initial results are accurate', colors.green);
    }
    
    // Step 3: Add more questions with DIFFERENT scores
    log('\n📝 Step 3: Add 4 more questions (Current: 4, Future: 5)', colors.yellow);
    await fillQuestions(assessmentId, pillarId, 7, 4, 5, {
      technical: ['performance_issues', 'scalability_concerns'],
      business: ['limited_self_service']
    });
    log('✓ Filled 4 more questions (total: 7)', colors.green);
    
    // Wait for processing
    await delay(2000);
    
    // Step 4: Get updated results
    log('\n📊 Step 4: Get updated results', colors.yellow);
    const updatedResults = await getAllResults(assessmentId, pillarId);
    const updatedMetrics = extractMetrics(updatedResults);
    
    log(`Updated Metrics:`, colors.cyan);
    log(`  Overall: Current=${updatedMetrics.overall.currentScore}, Future=${updatedMetrics.overall.futureScore}, Gap=${updatedMetrics.overall.gap}`, colors.cyan);
    log(`  Pillar:  Current=${updatedMetrics.pillar.currentScore}, Future=${updatedMetrics.pillar.futureScore}, Gap=${updatedMetrics.pillar.gap}`, colors.cyan);
    log(`  Executive Summary: ${updatedMetrics.overall.summaryLength} chars`, colors.cyan);
    log(`  Recommendations: ${updatedMetrics.pillar.recommendationsCount} items`, colors.cyan);
    
    // Step 5: Verify changes
    log('\n✅ Step 5: Verify results changed correctly', colors.yellow);
    
    const changes = [];
    
    // Scores should have increased (mix of 2→4 and 4→5 should average higher)
    if (updatedMetrics.overall.currentScore > initialMetrics.overall.currentScore) {
      log(`✓ Overall current score increased: ${initialMetrics.overall.currentScore} → ${updatedMetrics.overall.currentScore}`, colors.green);
    } else {
      log(`✗ Overall current score did NOT increase: ${initialMetrics.overall.currentScore} → ${updatedMetrics.overall.currentScore}`, colors.red);
      changes.push('Overall current score should increase');
    }
    
    if (updatedMetrics.pillar.currentScore > initialMetrics.pillar.currentScore) {
      log(`✓ Pillar current score increased: ${initialMetrics.pillar.currentScore} → ${updatedMetrics.pillar.currentScore}`, colors.green);
    } else {
      log(`✗ Pillar current score did NOT increase: ${initialMetrics.pillar.currentScore} → ${updatedMetrics.pillar.currentScore}`, colors.red);
      changes.push('Pillar current score should increase');
    }
    
    // Executive summary should have changed
    if (updatedMetrics.overall.summaryLength !== initialMetrics.overall.summaryLength) {
      log(`✓ Executive summary changed: ${initialMetrics.overall.summaryLength} → ${updatedMetrics.overall.summaryLength} chars`, colors.green);
    } else {
      log(`✗ Executive summary did NOT change (length: ${updatedMetrics.overall.summaryLength})`, colors.red);
      changes.push('Executive summary should change');
    }
    
    // Recommendations should have changed
    if (updatedMetrics.pillar.recommendationsCount !== initialMetrics.pillar.recommendationsCount) {
      log(`✓ Recommendations changed: ${initialMetrics.pillar.recommendationsCount} → ${updatedMetrics.pillar.recommendationsCount} items`, colors.green);
    } else {
      log(`⚠️  Recommendations count unchanged: ${updatedMetrics.pillar.recommendationsCount} items`, colors.yellow);
    }
    
    if (changes.length === 0) {
      log('\n🎉 TEST 1 PASSED: Results updated correctly!', colors.green + colors.bright);
      return true;
    } else {
      log('\n❌ TEST 1 FAILED: Issues found:', colors.red + colors.bright);
      changes.forEach(issue => log(`  • ${issue}`, colors.red));
      return false;
    }
    
  } catch (error) {
    log(`\n❌ TEST 1 FAILED WITH ERROR: ${error.message}`, colors.red + colors.bright);
    console.error(error);
    return false;
  }
}

// Test full assessment with changes (10 iterations)
async function testFullAssessmentConsistency() {
  log('\n' + '='.repeat(80), colors.bright);
  log('🧪 TEST 2: FULL ASSESSMENT CONSISTENCY (10 ITERATIONS)', colors.bright + colors.cyan);
  log('='.repeat(80) + '\n', colors.bright);
  
  const pillarId = 'platform_governance';
  const iterations = 10;
  let passCount = 0;
  let failCount = 0;
  
  for (let i = 1; i <= iterations; i++) {
    log(`\n${'─'.repeat(60)}`, colors.cyan);
    log(`📋 Iteration ${i}/${iterations}`, colors.bright + colors.cyan);
    log('─'.repeat(60), colors.cyan);
    
    try {
      const testName = `Full Test Iteration ${i}`;
      
      // Create assessment
      const assessmentId = await createAssessment(testName, `full-test-${i}@example.com`);
      log(`✓ Assessment created: ${assessmentId}`, colors.green);
      
      // Fill with initial values (Current: 3, Future: 4)
      await fillQuestions(assessmentId, pillarId, 10, 3, 4, {
        technical: ['data_quality_issues', 'performance_issues'],
        business: ['slow_time_to_insights']
      });
      log(`✓ Filled 10 questions (Current: 3, Future: 4)`, colors.green);
      
      // Get initial results
      const initialResults = await getAllResults(assessmentId, pillarId);
      const initialMetrics = extractMetrics(initialResults);
      
      log(`Initial: Overall Current=${initialMetrics.overall.currentScore}, Future=${initialMetrics.overall.futureScore}`, colors.cyan);
      
      // Verify initial accuracy
      const initialIssues = verifyResultsAccuracy(initialResults, { current: 3, future: 4 });
      if (initialIssues.length > 0) {
        log(`⚠️  Initial accuracy issues: ${initialIssues.length}`, colors.yellow);
      }
      
      // Wait a bit
      await delay(1500);
      
      // Change values (Current: 2, Future: 5)
      log(`\n🔄 Changing all responses (Current: 2, Future: 5)`, colors.yellow);
      await fillQuestions(assessmentId, pillarId, 10, 2, 5, {
        technical: ['security_gaps', 'cost_management'],
        business: ['compliance_challenges', 'skill_gaps']
      });
      
      // Wait for processing
      await delay(2000);
      
      // Get updated results
      const updatedResults = await getAllResults(assessmentId, pillarId);
      const updatedMetrics = extractMetrics(updatedResults);
      
      log(`Updated: Overall Current=${updatedMetrics.overall.currentScore}, Future=${updatedMetrics.overall.futureScore}`, colors.cyan);
      
      // Verify changes
      let passed = true;
      const issues = [];
      
      // Current score should have decreased (3 → 2)
      if (updatedMetrics.overall.currentScore < initialMetrics.overall.currentScore) {
        log(`✓ Overall current score decreased correctly`, colors.green);
      } else {
        log(`✗ Overall current score should decrease: ${initialMetrics.overall.currentScore} → ${updatedMetrics.overall.currentScore}`, colors.red);
        issues.push('Current score did not decrease');
        passed = false;
      }
      
      // Future score should have increased (4 → 5)
      if (updatedMetrics.overall.futureScore > initialMetrics.overall.futureScore) {
        log(`✓ Overall future score increased correctly`, colors.green);
      } else {
        log(`✗ Overall future score should increase: ${initialMetrics.overall.futureScore} → ${updatedMetrics.overall.futureScore}`, colors.red);
        issues.push('Future score did not increase');
        passed = false;
      }
      
      // Executive summary should change
      if (updatedMetrics.overall.summaryLength !== initialMetrics.overall.summaryLength) {
        log(`✓ Executive summary changed`, colors.green);
      } else {
        log(`✗ Executive summary did NOT change`, colors.red);
        issues.push('Executive summary unchanged');
        passed = false;
      }
      
      // Verify final accuracy (should be close to 2 and 5)
      const finalIssues = verifyResultsAccuracy(updatedResults, { current: 2, future: 5 });
      if (finalIssues.length > 0) {
        log(`⚠️  Final accuracy issues: ${finalIssues.length}`, colors.yellow);
        finalIssues.forEach(issue => log(`  • ${issue}`, colors.yellow));
      }
      
      if (passed) {
        log(`\n✅ Iteration ${i} PASSED`, colors.green + colors.bright);
        passCount++;
      } else {
        log(`\n❌ Iteration ${i} FAILED`, colors.red + colors.bright);
        issues.forEach(issue => log(`  • ${issue}`, colors.red));
        failCount++;
      }
      
    } catch (error) {
      log(`\n❌ Iteration ${i} FAILED WITH ERROR: ${error.message}`, colors.red + colors.bright);
      failCount++;
    }
  }
  
  // Summary
  log('\n' + '='.repeat(80), colors.bright);
  log('📊 CONSISTENCY TEST SUMMARY', colors.bright + colors.cyan);
  log('='.repeat(80), colors.bright);
  log(`Total Iterations: ${iterations}`, colors.cyan);
  log(`Passed: ${passCount} (${(passCount/iterations*100).toFixed(1)}%)`, passCount === iterations ? colors.green : colors.yellow);
  log(`Failed: ${failCount} (${(failCount/iterations*100).toFixed(1)}%)`, failCount === 0 ? colors.green : colors.red);
  
  if (passCount === iterations) {
    log('\n🎉 TEST 2 PASSED: All iterations consistent!', colors.green + colors.bright);
    return true;
  } else {
    log('\n⚠️  TEST 2 PARTIAL: Some iterations failed', colors.yellow + colors.bright);
    return false;
  }
}

// Main runner
async function runIntegrationTests() {
  log('\n' + '='.repeat(80), colors.bright);
  log('🔬 COMPREHENSIVE INTEGRATION TEST: RESULTS ACCURACY & CONSISTENCY', colors.bright + colors.magenta);
  log('='.repeat(80) + '\n', colors.bright);
  
  log('Testing against: ' + API_BASE_URL, colors.yellow);
  log('Timestamp: ' + new Date().toISOString(), colors.yellow);
  
  // Check server
  try {
    await apiCall('GET', '/health');
    log('✓ Server is running\n', colors.green);
  } catch (error) {
    log('✗ Server is not accessible', colors.red);
    log('Please start the server: npm start\n', colors.yellow);
    process.exit(1);
  }
  
  const results = {
    test1: false,
    test2: false
  };
  
  // Run tests
  try {
    results.test1 = await testPartialAssessment();
    results.test2 = await testFullAssessmentConsistency();
  } catch (error) {
    log(`\n❌ FATAL ERROR: ${error.message}`, colors.red + colors.bright);
    console.error(error);
  }
  
  // Final summary
  log('\n' + '='.repeat(80), colors.bright);
  log('🏁 FINAL TEST RESULTS', colors.bright + colors.magenta);
  log('='.repeat(80), colors.bright);
  
  log('\nTest 1 - Partial Assessment: ' + (results.test1 ? 'PASSED ✓' : 'FAILED ✗'), results.test1 ? colors.green : colors.red);
  log('Test 2 - Consistency (10x): ' + (results.test2 ? 'PASSED ✓' : 'FAILED ✗'), results.test2 ? colors.green : colors.red);
  
  const allPassed = results.test1 && results.test2;
  
  log('\n' + '='.repeat(80), colors.bright);
  if (allPassed) {
    log('🎉 ALL INTEGRATION TESTS PASSED!', colors.green + colors.bright);
    log('Results are accurate and consistent across all scenarios.', colors.green);
    process.exit(0);
  } else {
    log('⚠️  SOME INTEGRATION TESTS FAILED', colors.red + colors.bright);
    log('Please review the results above for details.', colors.yellow);
    process.exit(1);
  }
}

// Run
runIntegrationTests().catch(error => {
  log(`\n❌ FATAL ERROR: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});

