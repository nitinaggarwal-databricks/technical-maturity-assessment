# 🧪 Enhanced Author Role - Testing Guide

## Prerequisites

Before testing, ensure you have:
1. ✅ Local server running on `http://localhost:5001`
2. ✅ PostgreSQL database connected (or file-based storage)
3. ✅ Test users created:
   - `admin@test.com` / `admin123`
   - `author@test.com` / `author123`
   - `consumer@test.com` / `consumer123`
4. ✅ At least one assessment exists in the database

## Option 1: Automated Test Script (Recommended)

### Run the test script:

```bash
cd /Users/nitin.aggarwal/BMAD-METHOD

# Start the server (in one terminal)
npm start

# Run tests (in another terminal)
node test-author-role.js
```

### Expected Output:

```
═══════════════════════════════════════════════
🚀 Enhanced Author Role - API Endpoint Tests
═══════════════════════════════════════════════

🧪 Test 1: Admin Login
✅ Admin login successful

🧪 Test 2: Author Login
✅ Author login successful

🧪 Test 3: Get Existing Assessments
✅ Fetched assessments

🧪 Test 4: Assign Assessment to Author
✅ Assessment assigned to author

🧪 Test 5: Get Author Assignments
✅ Fetched author assignments

🧪 Test 6: Get Consumer Responses
✅ Fetched consumer responses

🧪 Test 7: Get Validation Status
✅ Fetched validation status

🧪 Test 8: Validate Response
✅ Response validated successfully

🧪 Test 9: Submit Assessment
⚠️  Expected failure: Assessment not ready for submission

═══════════════════════════════════════════════
📊 Test Results
═══════════════════════════════════════════════
✅ Passed: 9/9
❌ Failed: 0/9

🎉 All tests passed! Enhanced Author role is working correctly.
```

## Option 2: Manual API Testing with cURL

### 1. Login as Admin

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

Save the `sessionId` from the response.

### 2. Get Assessment List

```bash
curl -X GET http://localhost:5001/api/assessments \
  -H "x-session-id: YOUR_ADMIN_SESSION_ID"
```

Note an assessment ID to use for testing.

### 3. Get Users (to find Author ID)

```bash
curl -X GET http://localhost:5001/api/auth/users \
  -H "x-session-id: YOUR_ADMIN_SESSION_ID"
```

Find the author user's ID.

### 4. Assign Assessment to Author

```bash
curl -X POST http://localhost:5001/api/author/assign-to-author \
  -H "Content-Type: application/json" \
  -H "x-session-id: YOUR_ADMIN_SESSION_ID" \
  -d '{"assessmentId":"ASSESSMENT_ID","authorId":"AUTHOR_USER_ID"}'
```

### 5. Login as Author

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"author@test.com","password":"author123"}'
```

Save the author's `sessionId`.

### 6. Get Author's Assignments

```bash
curl -X GET http://localhost:5001/api/author/my-author-assignments \
  -H "x-session-id: YOUR_AUTHOR_SESSION_ID"
```

### 7. Get Consumer Responses

```bash
curl -X GET http://localhost:5001/api/author/consumer-responses/ASSESSMENT_ID \
  -H "x-session-id: YOUR_AUTHOR_SESSION_ID"
```

### 8. Get Validation Status

```bash
curl -X GET http://localhost:5001/api/author/validation-status/ASSESSMENT_ID \
  -H "x-session-id: YOUR_AUTHOR_SESSION_ID"
```

### 9. Validate a Response

```bash
curl -X POST http://localhost:5001/api/author/validate-response \
  -H "Content-Type: application/json" \
  -H "x-session-id: YOUR_AUTHOR_SESSION_ID" \
  -d '{"assignmentId":"ASSIGNMENT_ID","status":"approved","comments":"Looks good!"}'
```

### 10. Try to Submit Assessment

```bash
curl -X POST http://localhost:5001/api/author/submit-assessment/ASSESSMENT_ID \
  -H "Content-Type: application/json" \
  -H "x-session-id: YOUR_AUTHOR_SESSION_ID" \
  -d '{"submissionNotes":"Final submission"}'
```

## Option 3: Test with Postman/Insomnia

### Import this collection:

1. **Base URL**: `http://localhost:5001/api`
2. **Auth Header**: `x-session-id: {{sessionId}}`

### Requests to test:

| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| POST | `/auth/login` | `{"email":"admin@test.com","password":"admin123"}` | None |
| GET | `/assessments` | - | Admin |
| GET | `/auth/users` | - | Admin |
| POST | `/author/assign-to-author` | `{"assessmentId":"...","authorId":"..."}` | Admin |
| GET | `/author/my-author-assignments` | - | Author |
| GET | `/author/consumer-responses/:id` | - | Author |
| GET | `/author/validation-status/:id` | - | Author |
| POST | `/author/validate-response` | `{"assignmentId":"...","status":"approved"}` | Author |
| POST | `/author/submit-assessment/:id` | `{"submissionNotes":"..."}` | Author |

## Expected Results

### ✅ Success Scenarios:

1. **Admin Login** → Returns sessionId
2. **Get Assessments** → Returns list of assessments
3. **Assign to Author** → Returns assessment with `assigned_author_id`
4. **Author Login** → Returns sessionId
5. **Get Author Assignments** → Returns assessments assigned to author
6. **Get Consumer Responses** → Returns list of responses (may be empty)
7. **Get Validation Status** → Returns validation statistics
8. **Validate Response** → Updates validation status to "approved"

### ⚠️ Expected Failures:

1. **Submit Assessment (incomplete)** → 400 error: "Not all questions are completed"
2. **Submit Assessment (not validated)** → 400 error: "Not all responses are validated"
3. **Unauthorized access** → 401 error: "Authentication required"
4. **Consumer tries to access Author endpoints** → 403 error: "Author or admin access required"

## Troubleshooting

### Server won't start:
```bash
cd /Users/nitin.aggarwal/BMAD-METHOD
npm install
npm start
```

### Migration needed:
If using PostgreSQL, run:
```bash
node server/db/migrate.js
```

### No test users:
Check `server/migrations/007_add_test_users.sql` or create manually via User Management.

### No assessments:
Create a test assessment through the UI or via API:
```bash
curl -X POST http://localhost:5001/api/assessments \
  -H "Content-Type: application/json" \
  -H "x-session-id: YOUR_SESSION_ID" \
  -d '{"assessmentName":"Test Assessment","organizationName":"Test Org",...}'
```

## What to Look For

### 🎯 Key Features to Verify:

1. ✅ **Author Assignment**
   - Admin can assign assessment to author
   - Author sees assignment in their list
   - Assignment timestamp is recorded

2. ✅ **Response Review**
   - Author can view all consumer responses
   - Responses grouped by question
   - Shows completion status

3. ✅ **Validation Workflow**
   - Author can mark responses as approved/needs review
   - Validation status tracked per response
   - Validation comments saved

4. ✅ **Submission Control**
   - Can't submit until all validated
   - Submission locks the assessment
   - Submission tracked with timestamp

5. ✅ **Access Control**
   - Only assigned author can access
   - Admin has override access
   - Consumers can't access author endpoints

## Next Steps After Testing

If all tests pass:
1. ✅ Backend is production-ready
2. ⏳ Build frontend UI components
3. ⏳ Deploy to Railway
4. ⏳ Train users on new features

If tests fail:
1. 🔍 Review error messages
2. 🐛 Fix identified issues
3. 🔄 Re-run tests
4. 📝 Update documentation

## Questions?

Check these files for implementation details:
- `AUTHOR_ROLE_ENHANCEMENTS.md` - Full specification
- `AUTHOR_ROLE_STATUS.md` - Implementation status
- `server/routes/authorValidation.js` - API implementation
- `server/migrations/016_enhanced_author_role.sql` - Database schema

