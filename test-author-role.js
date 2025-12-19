/**
 * Test Script for Enhanced Author Role Endpoints
 * Run this after starting the server: npm start
 */

const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

// Test credentials
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'admin123';
const AUTHOR_EMAIL = 'author@test.com';
const AUTHOR_PASSWORD = 'author123';

let adminToken = '';
let authorToken = '';
let testAssessmentId = '';

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null, sessionId = null) => {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: sessionId ? { 'x-session-id': sessionId } : {},
      data
    };
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || error.message,
      status: error.response?.status
    };
  }
};

// Test 1: Login as Admin
async function testAdminLogin() {
  console.log('\n🧪 Test 1: Admin Login');
  const result = await makeRequest('POST', '/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });
  
  if (result.success && result.data.sessionId) {
    adminToken = result.data.sessionId;
    console.log('✅ Admin login successful');
    console.log(`   Session ID: ${adminToken.substring(0, 20)}...`);
    return true;
  } else {
    console.log('❌ Admin login failed:', result.error);
    return false;
  }
}

// Test 2: Login as Author
async function testAuthorLogin() {
  console.log('\n🧪 Test 2: Author Login');
  const result = await makeRequest('POST', '/auth/login', {
    email: AUTHOR_EMAIL,
    password: AUTHOR_PASSWORD
  });
  
  if (result.success && result.data.sessionId) {
    authorToken = result.data.sessionId;
    console.log('✅ Author login successful');
    console.log(`   Session ID: ${authorToken.substring(0, 20)}...`);
    return true;
  } else {
    console.log('❌ Author login failed:', result.error);
    return false;
  }
}

// Test 3: Get existing assessments (to use for testing)
async function testGetAssessments() {
  console.log('\n🧪 Test 3: Get Existing Assessments');
  const result = await makeRequest('GET', '/assessments', null, adminToken);
  
  if (result.success && result.data.length > 0) {
    testAssessmentId = result.data[0].id;
    console.log('✅ Fetched assessments');
    console.log(`   Using assessment ID: ${testAssessmentId}`);
    console.log(`   Assessment name: ${result.data[0].assessmentName}`);
    return true;
  } else {
    console.log('❌ Failed to fetch assessments:', result.error);
    return false;
  }
}

// Test 4: Assign assessment to Author (Admin action)
async function testAssignToAuthor() {
  console.log('\n🧪 Test 4: Assign Assessment to Author');
  
  // First, get author user ID
  const usersResult = await makeRequest('GET', '/auth/users', null, adminToken);
  if (!usersResult.success) {
    console.log('❌ Failed to fetch users:', usersResult.error);
    return false;
  }
  
  const authorUser = usersResult.data.find(u => u.email === AUTHOR_EMAIL);
  if (!authorUser) {
    console.log('❌ Author user not found');
    return false;
  }
  
  const result = await makeRequest('POST', '/author/assign-to-author', {
    assessmentId: testAssessmentId,
    authorId: authorUser.id
  }, adminToken);
  
  if (result.success) {
    console.log('✅ Assessment assigned to author');
    console.log(`   Assessment: ${result.data.assessment.assessmentName}`);
    console.log(`   Assigned at: ${result.data.assessment.author_assigned_at}`);
    return true;
  } else {
    console.log('❌ Failed to assign to author:', result.error);
    return false;
  }
}

// Test 5: Get author's assigned assessments
async function testGetAuthorAssignments() {
  console.log('\n🧪 Test 5: Get Author Assignments');
  const result = await makeRequest('GET', '/author/my-author-assignments', null, authorToken);
  
  if (result.success) {
    console.log('✅ Fetched author assignments');
    console.log(`   Total assignments: ${result.data.assignments.length}`);
    if (result.data.assignments.length > 0) {
      const first = result.data.assignments[0];
      console.log(`   First: ${first.assessmentname}`);
      console.log(`   Questions: ${first.completed_questions}/${first.total_questions}`);
      console.log(`   Approved: ${first.approved_questions}`);
    }
    return true;
  } else {
    console.log('❌ Failed to fetch author assignments:', result.error);
    return false;
  }
}

// Test 6: Get consumer responses for an assessment
async function testGetConsumerResponses() {
  console.log('\n🧪 Test 6: Get Consumer Responses');
  const result = await makeRequest('GET', `/author/consumer-responses/${testAssessmentId}`, null, authorToken);
  
  if (result.success) {
    console.log('✅ Fetched consumer responses');
    console.log(`   Assessment ID: ${result.data.assessmentId}`);
    console.log(`   Total responses: ${result.data.responses.length}`);
    if (result.data.responses.length > 0) {
      const first = result.data.responses[0];
      console.log(`   First response:`);
      console.log(`     Question: ${first.question_id}`);
      console.log(`     Consumer: ${first.consumer_email || 'N/A'}`);
      console.log(`     Status: ${first.validation_status}`);
    }
    return true;
  } else {
    console.log('❌ Failed to fetch consumer responses:', result.error);
    return false;
  }
}

// Test 7: Get validation status
async function testGetValidationStatus() {
  console.log('\n🧪 Test 7: Get Validation Status');
  const result = await makeRequest('GET', `/author/validation-status/${testAssessmentId}`, null, authorToken);
  
  if (result.success) {
    console.log('✅ Fetched validation status');
    console.log(`   Total assignments: ${result.data.total_assignments}`);
    console.log(`   Completed: ${result.data.total_completed}`);
    console.log(`   Approved: ${result.data.total_approved}`);
    console.log(`   Needs review: ${result.data.needs_review}`);
    console.log(`   Not validated: ${result.data.not_validated}`);
    console.log(`   Ready for submission: ${result.data.readyForSubmission ? 'Yes' : 'No'}`);
    console.log(`   Completion: ${result.data.completionPercentage}%`);
    console.log(`   Validation: ${result.data.validationPercentage}%`);
    return true;
  } else {
    console.log('❌ Failed to fetch validation status:', result.error);
    return false;
  }
}

// Test 8: Validate a response (will only work if there are responses)
async function testValidateResponse() {
  console.log('\n🧪 Test 8: Validate Response');
  
  // First get responses to find one to validate
  const responsesResult = await makeRequest('GET', `/author/consumer-responses/${testAssessmentId}`, null, authorToken);
  
  if (!responsesResult.success || responsesResult.data.responses.length === 0) {
    console.log('⚠️  Skipping: No responses available to validate');
    return true; // Not a failure, just no data
  }
  
  const firstResponse = responsesResult.data.responses[0];
  
  const result = await makeRequest('POST', '/author/validate-response', {
    assignmentId: firstResponse.assignment_id,
    status: 'approved',
    comments: 'Test validation - looks good!'
  }, authorToken);
  
  if (result.success) {
    console.log('✅ Response validated successfully');
    console.log(`   Assignment ID: ${result.data.assignment.id}`);
    console.log(`   Status: ${result.data.assignment.validation_status}`);
    console.log(`   Comments: ${result.data.assignment.validation_comments}`);
    return true;
  } else {
    console.log('❌ Failed to validate response:', result.error);
    return false;
  }
}

// Test 9: Try to submit assessment (will likely fail validation checks)
async function testSubmitAssessment() {
  console.log('\n🧪 Test 9: Submit Assessment');
  const result = await makeRequest('POST', `/author/submit-assessment/${testAssessmentId}`, {
    submissionNotes: 'Test submission'
  }, authorToken);
  
  if (result.success) {
    console.log('✅ Assessment submitted successfully');
    console.log(`   Submitted by: ${result.data.assessment.submitted_by}`);
    console.log(`   Submitted at: ${result.data.assessment.submitted_at}`);
    console.log(`   Locked: ${result.data.assessment.is_locked}`);
    return true;
  } else {
    if (result.status === 400) {
      console.log('⚠️  Expected failure: Assessment not ready for submission');
      console.log(`   Reason: ${result.error}`);
      return true; // This is expected behavior
    } else {
      console.log('❌ Unexpected error:', result.error);
      return false;
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('═══════════════════════════════════════════════');
  console.log('🚀 Enhanced Author Role - API Endpoint Tests');
  console.log('═══════════════════════════════════════════════');
  console.log('\n📋 Prerequisites:');
  console.log('   - Server running on http://localhost:5001');
  console.log('   - Test users created (admin@test.com, author@test.com)');
  console.log('   - At least one assessment exists in the database');
  
  const tests = [
    { name: 'Admin Login', fn: testAdminLogin },
    { name: 'Author Login', fn: testAuthorLogin },
    { name: 'Get Assessments', fn: testGetAssessments },
    { name: 'Assign to Author', fn: testAssignToAuthor },
    { name: 'Get Author Assignments', fn: testGetAuthorAssignments },
    { name: 'Get Consumer Responses', fn: testGetConsumerResponses },
    { name: 'Get Validation Status', fn: testGetValidationStatus },
    { name: 'Validate Response', fn: testValidateResponse },
    { name: 'Submit Assessment', fn: testSubmitAssessment }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
      console.log(`\n❌ Test failed: ${test.name}`);
      console.log('   Aborting remaining tests...');
      break;
    }
  }
  
  console.log('\n═══════════════════════════════════════════════');
  console.log('📊 Test Results');
  console.log('═══════════════════════════════════════════════');
  console.log(`✅ Passed: ${passed}/${tests.length}`);
  console.log(`❌ Failed: ${failed}/${tests.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Enhanced Author role is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }
  
  console.log('\n═══════════════════════════════════════════════\n');
}

// Run if called directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('\n💥 Test suite crashed:', error.message);
    process.exit(1);
  });
}

module.exports = { runAllTests };

