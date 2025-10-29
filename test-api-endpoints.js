#!/usr/bin/env node

/**
 * Comprehensive API Endpoint Testing Script
 * Tests all backend endpoints for the Databricks Maturity Assessment
 */

const axios = require('axios');

// Configure based on environment
const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const TEST_MODE = process.env.TEST_MODE || 'local'; // 'local' or 'production'

console.log(`🧪 Testing API endpoints at: ${BASE_URL}`);
console.log(`📊 Test mode: ${TEST_MODE}\n`);

// Test state
let testAssessmentId = null;
let testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: []
};

// Helper function to run a test
async function runTest(name, testFn) {
  try {
    console.log(`\n▶️  ${name}`);
    await testFn();
    testResults.passed++;
    console.log(`✅ PASSED: ${name}`);
    return true;
  } catch (error) {
    testResults.failed++;
    testResults.errors.push({ test: name, error: error.message });
    console.error(`❌ FAILED: ${name}`);
    console.error(`   Error: ${error.message}`);
    if (error.response?.data) {
      console.error(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return false;
  }
}

// Test 1: Health Check
async function testHealthCheck() {
  const response = await axios.get(`${BASE_URL}/health`);
  if (!response.data.success) {
    throw new Error('Health check failed');
  }
}

// Test 2: Get Assessment Framework
async function testGetFramework() {
  const response = await axios.get(`${BASE_URL}/assessment/framework`);
  if (!response.data.data || !response.data.data.assessmentAreas || response.data.data.assessmentAreas.length === 0) {
    throw new Error('Framework has no assessment areas');
  }
  if (response.data.data.assessmentAreas.length !== 6) {
    throw new Error(`Expected 6 pillars, got ${response.data.data.assessmentAreas.length}`);
  }
}

// Test 3: Start New Assessment
async function testStartAssessment() {
  const assessmentData = {
    organizationName: 'Test Organization',
    assessmentName: 'API Test Assessment',
    assessmentDescription: 'Testing API endpoints',
    contactEmail: 'test@example.com',
    industry: 'Technology'
  };
  
  const response = await axios.post(`${BASE_URL}/assessment/start`, assessmentData);
  
  if (!response.data.data || !response.data.data.assessmentId) {
    throw new Error('No assessment ID returned');
  }
  
  testAssessmentId = response.data.data.assessmentId;
  console.log(`   📝 Created test assessment: ${testAssessmentId}`);
}

// Test 4: Get Assessment by ID
async function testGetAssessment() {
  if (!testAssessmentId) {
    throw new Error('No test assessment ID available');
  }
  
  const response = await axios.get(`${BASE_URL}/assessment/${testAssessmentId}`);
  
  if (response.data.id !== testAssessmentId) {
    throw new Error('Assessment ID mismatch');
  }
  
  if (response.data.organizationName !== 'Test Organization') {
    throw new Error('Organization name mismatch');
  }
}

// Test 5: List All Assessments
async function testListAssessments() {
  const response = await axios.get(`${BASE_URL}/assessments`);
  
  if (!Array.isArray(response.data)) {
    throw new Error('Response is not an array');
  }
  
  const foundTest = response.data.find(a => a.id === testAssessmentId);
  if (!foundTest) {
    throw new Error('Test assessment not found in list');
  }
  
  console.log(`   📋 Found ${response.data.length} assessments`);
}

// Test 6: Get Category Questions
async function testGetCategoryQuestions() {
  if (!testAssessmentId) {
    throw new Error('No test assessment ID available');
  }
  
  const response = await axios.get(`${BASE_URL}/assessment/${testAssessmentId}/category/platform_governance`);
  
  if (!response.data.area) {
    throw new Error('No area data returned');
  }
  
  if (!response.data.area.dimensions || response.data.area.dimensions.length === 0) {
    throw new Error('No dimensions returned');
  }
  
  console.log(`   📊 Found ${response.data.area.dimensions.length} dimensions`);
}

// Test 7: Save Progress
async function testSaveProgress() {
  if (!testAssessmentId) {
    throw new Error('No test assessment ID available');
  }
  
  const progressData = {
    questionId: 'env_standardization',
    perspectiveId: 'current_state',
    value: '3',
    comment: 'Test comment',
    editorEmail: 'test@example.com'
  };
  
  const response = await axios.post(`${BASE_URL}/assessment/${testAssessmentId}/save-progress`, progressData);
  
  if (!response.data.success) {
    throw new Error('Save progress failed');
  }
}

// Test 8: Submit Area
async function testSubmitArea() {
  if (!testAssessmentId) {
    throw new Error('No test assessment ID available');
  }
  
  // First, save multiple responses to complete the area
  const questions = [
    'env_standardization',
    'scaling_effectiveness',
    'auth_consistency',
    'security_controls',
    'governance_centralization'
  ];
  
  for (const questionId of questions) {
    await axios.post(`${BASE_URL}/assessment/${testAssessmentId}/save-progress`, {
      questionId,
      perspectiveId: 'current_state',
      value: '3',
      editorEmail: 'test@example.com'
    });
    
    await axios.post(`${BASE_URL}/assessment/${testAssessmentId}/save-progress`, {
      questionId,
      perspectiveId: 'future_state',
      value: '4',
      editorEmail: 'test@example.com'
    });
  }
  
  const response = await axios.post(`${BASE_URL}/assessment/${testAssessmentId}/submit-area`, {
    categoryId: 'platform_governance'
  });
  
  if (!response.data.success) {
    throw new Error('Submit area failed');
  }
}

// Test 9: Get Pillar Results
async function testGetPillarResults() {
  if (!testAssessmentId) {
    throw new Error('No test assessment ID available');
  }
  
  const response = await axios.get(`${BASE_URL}/assessment/${testAssessmentId}/pillar/platform_governance/results`);
  
  if (!response.data.data) {
    throw new Error('No pillar results data returned');
  }
  
  console.log(`   📈 Pillar score: ${response.data.data.score || 'N/A'}`);
}

// Test 10: Get Overall Results
async function testGetOverallResults() {
  if (!testAssessmentId) {
    throw new Error('No test assessment ID available');
  }
  
  const response = await axios.get(`${BASE_URL}/assessment/${testAssessmentId}/results`);
  
  if (!response.data.data) {
    throw new Error('No overall results data returned');
  }
  
  console.log(`   📊 Overall assessment data structure looks good`);
}

// Test 11: Get Executive Summary
async function testGetExecutiveSummary() {
  if (!testAssessmentId) {
    throw new Error('No test assessment ID available');
  }
  
  const response = await axios.get(`${BASE_URL}/assessment/${testAssessmentId}/executive-summary`);
  
  if (!response.data.data) {
    throw new Error('No executive summary data returned');
  }
}

// Test 12: Update Metadata
async function testUpdateMetadata() {
  if (!testAssessmentId) {
    throw new Error('No test assessment ID available');
  }
  
  const metadata = {
    assessmentName: 'Updated Test Assessment',
    organizationName: 'Updated Organization',
    editorEmail: 'test@example.com'
  };
  
  const response = await axios.put(`${BASE_URL}/assessment/${testAssessmentId}/metadata`, metadata);
  
  if (!response.data.success) {
    throw new Error('Update metadata failed');
  }
}

// Test 13: Generate Sample Assessment
async function testGenerateSample() {
  const response = await axios.post(`${BASE_URL}/assessment/generate-sample`, {
    level: 'minimal'
  });
  
  if (!response.data.success) {
    throw new Error('Generate sample failed');
  }
  
  if (!response.data.assessment || !response.data.assessment.id) {
    throw new Error('No assessment ID in sample response');
  }
  
  console.log(`   🎲 Generated sample: ${response.data.assessment.id}`);
}

// Test 14: Delete Assessment (Cleanup)
async function testDeleteAssessment() {
  if (!testAssessmentId) {
    throw new Error('No test assessment ID available');
  }
  
  const response = await axios.delete(`${BASE_URL}/assessment/${testAssessmentId}`);
  
  if (!response.data.success) {
    throw new Error('Delete assessment failed');
  }
  
  console.log(`   🗑️  Deleted test assessment: ${testAssessmentId}`);
}

// Main test runner
async function runAllTests() {
  console.log('=' .repeat(60));
  console.log('🚀 STARTING COMPREHENSIVE API TESTS');
  console.log('='.repeat(60));
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Get Assessment Framework', fn: testGetFramework },
    { name: 'Start New Assessment', fn: testStartAssessment },
    { name: 'Get Assessment by ID', fn: testGetAssessment },
    { name: 'List All Assessments', fn: testListAssessments },
    { name: 'Get Category Questions', fn: testGetCategoryQuestions },
    { name: 'Save Progress', fn: testSaveProgress },
    { name: 'Submit Area', fn: testSubmitArea },
    { name: 'Get Pillar Results', fn: testGetPillarResults },
    { name: 'Get Overall Results', fn: testGetOverallResults },
    { name: 'Get Executive Summary', fn: testGetExecutiveSummary },
    { name: 'Update Metadata', fn: testUpdateMetadata },
    { name: 'Generate Sample Assessment', fn: testGenerateSample },
    { name: 'Delete Assessment (Cleanup)', fn: testDeleteAssessment }
  ];
  
  for (const test of tests) {
    await runTest(test.name, test.fn);
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⏭️  Skipped: ${testResults.skipped}`);
  console.log(`📈 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.errors.forEach((err, idx) => {
      console.log(`${idx + 1}. ${err.test}: ${err.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('\n💥 FATAL ERROR:', error.message);
  process.exit(1);
});

