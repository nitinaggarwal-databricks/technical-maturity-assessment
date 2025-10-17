# Comprehensive Functional Test Cases
## Databricks Technical Maturity Assessment Framework

Based on all bugs encountered and fixed during development, these 116 test cases ensure the application works correctly.

---

## 1. Assessment Creation & Management (15 tests)

### TC-001: Create New Assessment
**Steps:**
1. Click "New Assessment" or "Create Your First Assessment"
2. Fill: Name, Email, Organization, Industry
3. Click "Start Assessment"

**Expected:** Assessment created with unique ID, navigates to first pillar

---

### TC-002: Assessment Name Required
**Steps:**
1. Try to create assessment without name
2. Submit

**Expected:** Validation error "Assessment name is required"

---

### TC-003: Email Required
**Steps:**
1. Try to create assessment without email
2. Submit

**Expected:** Validation error "Contact email is required"

---

### TC-004: Edit Assessment Metadata
**Steps:**
1. Open existing assessment
2. Click "Edit" button in navigation
3. Change name, email, organization
4. Save

**Expected:** Changes saved, edit history tracked with timestamp

---

### TC-005: Assessment List Shows All Assessments
**Steps:**
1. Navigate to `/assessments`
2. View list

**Expected:** All assessments displayed with name, organization, progress%, status, date

---

### TC-006: Filter Assessments by Search
**Steps:**
1. Go to assessments page
2. Type in search box (name, org, or email)

**Expected:** List filters to matching assessments only

---

### TC-007: Clone Existing Assessment
**Steps:**
1. Find assessment
2. Click "Clone"
3. Provide new name, email

**Expected:** New assessment created with same responses as original

---

### TC-008: Delete Assessment
**Steps:**
1. Select assessment
2. Click delete
3. Confirm

**Expected:** Assessment removed from list

---

### TC-009: Assessment Shows Correct Progress
**Steps:**
1. Complete 10/60 questions
2. Check progress indicator

**Expected:** Shows "17%" or "10/60 questions"

---

### TC-010: Completed Pillars Count Correctly
**Steps:**
1. Complete Platform pillar (10 questions)
2. Check status

**Expected:** Shows "1/6 pillars completed"

---

### TC-011: Assessment Name Shows in Navigation
**Steps:**
1. Create assessment named "Test Assessment"
2. Check top-left of navigation panel

**Expected:** Shows "Test Assessment" not "Assessment Navigation"

---

### TC-012: Edit Button Opens Modal
**Steps:**
1. Click "Edit" in navigation
2. Modal appears

**Expected:** Modal shows current assessment name, email, org, industry

---

### TC-013: Past Assessments Load from Database
**Steps:**
1. Create assessment
2. Redeploy application
3. Check assessments list

**Expected:** Previously created assessment still appears (PostgreSQL persistence)

---

### TC-014: Assessment Status Transitions
**Steps:**
1. Create assessment (status: in_progress)
2. Complete all 6 pillars
3. Check status

**Expected:** Status changes to "completed", completedAt timestamp set

---

### TC-015: Multiple Users Can Create Assessments
**Steps:**
1. Create assessment with email1@test.com
2. Create assessment with email2@test.com
3. View assessments list

**Expected:** Both assessments exist independently

---

## 2. Question Navigation & Responses (20 tests)

### TC-016: Load First Question
**Steps:**
1. Start assessment
2. First pillar loads

**Expected:** Shows question 1/10 for Platform pillar

---

### TC-017: Navigate Next Question
**Steps:**
1. Answer current question
2. Click "Next"

**Expected:** Moves to question 2/10, previous answer saved

---

### TC-018: Navigate Previous Question
**Steps:**
1. On question 3
2. Click "Back"

**Expected:** Returns to question 2 with saved answers visible

---

### TC-019: Navigate to Different Pillar
**Steps:**
1. In Platform pillar
2. Click "Data" in navigation

**Expected:** Navigates to Data pillar, Platform responses saved

---

### TC-020: Skip Question
**Steps:**
1. Check "Skip this question"
2. Click Next

**Expected:** Question marked as skipped, moves to next question

---

### TC-021: Unskip Question
**Steps:**
1. Skip question
2. Go back
3. Uncheck skip
4. Provide answers

**Expected:** Skip cleared, answers saved

---

### TC-022: All Perspectives Required
**Steps:**
1. Fill only "Current State"
2. Try to proceed

**Expected:** Can proceed (lenient validation), but ideally all perspectives filled

---

### TC-023: Current State Saves
**Steps:**
1. Select "Level 3" for current state
2. Navigate away and back

**Expected:** Level 3 still selected

---

### TC-024: Future State Saves
**Steps:**
1. Select "Level 5" for future state
2. Navigate away and back

**Expected:** Level 5 still selected

---

### TC-025: Technical Pain Points Save
**Steps:**
1. Select multiple technical pain checkboxes
2. Navigate away and back

**Expected:** Selected checkboxes still checked

---

### TC-026: Business Pain Points Save
**Steps:**
1. Select multiple business pain checkboxes
2. Navigate away and back

**Expected:** Selected checkboxes still checked

---

### TC-027: Comments Save
**Steps:**
1. Enter comment text
2. Navigate away and back

**Expected:** Comment text preserved

---

### TC-028: Auto-Save Indicator Shows
**Steps:**
1. Change an answer
2. Wait 1 second

**Expected:** Green "Saved" indicator appears

---

### TC-029: Auto-Save Failure Handled
**Steps:**
1. Disconnect network
2. Change answer

**Expected:** Shows error indicator (red), data preserved in browser

---

### TC-030: Complete Pillar Button Works
**Steps:**
1. Answer all 10 questions in Platform
2. On question 10, click "Next"

**Expected:** Shows success toast, navigates to next pillar (Data)

---

### TC-031: Partial Pillar Can Be Resumed
**Steps:**
1. Answer 5/10 questions in Platform
2. Navigate to Data pillar
3. Return to Platform

**Expected:** Shows questions 6-10 still unanswered

---

### TC-032: Question Dimensions Load Correctly
**Steps:**
1. View any question

**Expected:** All dimensions display (current state, future state, pain points, comments)

---

### TC-033: Pain Point Descriptions Show
**Steps:**
1. Hover or view technical pain point option

**Expected:** Shows description of the pain point

---

### TC-034: Comment Field Accepts Long Text
**Steps:**
1. Enter 500+ character comment
2. Save

**Expected:** Full comment saved and retrieved

---

### TC-035: Email Prompt for Existing Assessment
**Steps:**
1. Open existing assessment with responses
2. Try to edit

**Expected:** Prompts for editor email before allowing edits

---

## 3. Results & Recommendations (25 tests)

### TC-036: Overall Results Load
**Steps:**
1. Complete at least 1 pillar
2. Click "View Overall Results"

**Expected:** Results page loads with maturity scores

---

### TC-037: Overall Results Show Current Score
**Steps:**
1. Complete assessment with avg current = 3
2. View results

**Expected:** Shows "Current: 3" on maturity journey

---

### TC-038: Overall Results Show Future Score
**Steps:**
1. Complete assessment with avg future = 4
2. View results

**Expected:** Shows "Future: 4" on maturity journey

---

### TC-039: Gap Calculated Correctly
**Steps:**
1. Current = 2, Future = 4
2. View results

**Expected:** Gap shows "2 levels"

---

### TC-040: Maturity Level Shown
**Steps:**
1. Current score = 3
2. View results

**Expected:** Shows "Level 3 - Defined: Structured approach with established processes"

---

### TC-041: Pillar Assessment Cards Display
**Steps:**
1. Complete 2 pillars
2. View overall results

**Expected:** Shows 2 completed pillar cards with scores

---

### TC-042: Individual Pillar Results Link Works
**Steps:**
1. Click "View Details" on Platform pillar card
2. Navigate

**Expected:** Goes to `/results/:id/pillar/platform_governance`

---

### TC-043: Pillar Results Show Correct Scores
**Steps:**
1. Platform: Current=2, Future=4
2. View pillar results

**Expected:** Shows Current: 2, Future: 4 specifically for Platform

---

### TC-044: Pain Point Recommendations Display
**Steps:**
1. Select pain points in assessment
2. View results

**Expected:** Shows recommendations addressing selected pain points

---

### TC-045: Gap-Based Actions Display
**Steps:**
1. Create 2-level gap (Current=2, Future=4)
2. View results

**Expected:** Shows gap-based actions to bridge the gap

---

### TC-046: Comment-Based Insights Display
**Steps:**
1. Add detailed comments with keywords ("urgent", "slow")
2. View results

**Expected:** Shows insights extracted from comments

---

### TC-047: Latest Databricks Features Show
**Steps:**
1. Complete assessment
2. View results (with USE_LIVE_DATA=true)

**Expected:** "What's New" section shows recent Databricks features

---

### TC-048: Recommendations Prioritized
**Steps:**
1. View recommendations

**Expected:** High priority items show red badge, at top of list

---

### TC-049: Quick Wins Identified
**Steps:**
1. Complete assessment
2. Check recommendations

**Expected:** Shows 3-5 quick win recommendations

---

### TC-050: Roadmap Shows Phases
**Steps:**
1. View results

**Expected:** Roadmap shows Phase 1 (0-3 months), Phase 2 (3-6), Phase 3 (6-12)

---

### TC-051: Executive Summary Loads
**Steps:**
1. Complete assessment
2. Click "Executive Summary"

**Expected:** Summary page loads with strategic narrative

---

### TC-052: Executive Summary Shows Strategic Situation
**Steps:**
1. View executive summary

**Expected:** Section "Strategic Situation & Business Value" with current/target maturity

---

### TC-053: Executive Summary Shows Pain Points
**Steps:**
1. Select pain points
2. View executive summary

**Expected:** Section "Critical Constraints" lists pain points by pillar

---

### TC-054: Executive Summary Shows Transformation Roadmap
**Steps:**
1. View executive summary

**Expected:** Section "Transformation Roadmap" with priority initiatives

---

### TC-055: Roadmap Includes Databricks Features
**Steps:**
1. Platform pillar incomplete
2. View executive summary

**Expected:** Shows "Implement Unity Catalog, enable audit logging, deploy RBAC"

---

### TC-056: Expected Business Outcomes Listed
**Steps:**
1. View executive summary

**Expected:** Shows 5+ business outcomes (reliability, speed, automation, cost, compliance)

---

### TC-057: Refresh Button Regenerates Results
**Steps:**
1. View results
2. Click "Refresh"
3. Check data

**Expected:** Results regenerated with fresh data (no cache)

---

### TC-058: Edit Assessment Button Works
**Steps:**
1. On results page
2. Click "Edit Assessment"

**Expected:** Navigates back to first incomplete pillar

---

### TC-059: Export Report Button Works
**Steps:**
1. Click "Export Report"

**Expected:** Downloads PDF with all results and recommendations

---

### TC-060: Results Update When Responses Change
**Steps:**
1. View results (Current: 2)
2. Go back, change answer to increase score
3. View results again

**Expected:** Shows updated current score (e.g., Current: 3)

---

## 4. Data Persistence & Caching (15 tests)

### TC-061: PostgreSQL Connection Works
**Steps:**
1. Check `/status` endpoint

**Expected:** Shows `"type": "postgresql"`, `"postgresConfigured": true`

---

### TC-062: Responses Saved to Database
**Steps:**
1. Answer question
2. Check PostgreSQL database

**Expected:** Response exists in `assessments.responses` JSONB column

---

### TC-063: Data Survives Redeploy
**Steps:**
1. Create assessment, fill questions
2. Redeploy app on Railway
3. Check assessment

**Expected:** All responses still present

---

### TC-064: Cache Cleared on Response Change
**Steps:**
1. View results (triggers cache)
2. Change answer
3. View results again

**Expected:** Results regenerated, not from cache

---

### TC-065: HTTP Cache Headers Prevent Stale Data
**Steps:**
1. View results
2. Check HTTP response headers

**Expected:** Headers include `Cache-Control: no-store, no-cache, must-revalidate`

---

### TC-066: Query Parameters Bust Cache
**Steps:**
1. Check network request to `/api/assessment/:id/results`

**Expected:** URL includes `?_=<timestamp>` cache-buster

---

### TC-067: Assessment Metadata Updates Persist
**Steps:**
1. Edit assessment name
2. Redeploy
3. Check assessment

**Expected:** New name persists

---

### TC-068: Edit History Tracked
**Steps:**
1. Edit assessment metadata with editor email
2. Check assessment object

**Expected:** `editHistory` array has entry with timestamp, editor, changes

---

### TC-069: Completed Categories Persist
**Steps:**
1. Complete Platform pillar
2. Reload page

**Expected:** Platform still marked as completed

---

### TC-070: File Storage Fallback Works
**Steps:**
1. Remove DATABASE_URL environment variable
2. Restart app
3. Create assessment

**Expected:** Falls back to file storage, assessment saves to JSON file

---

### TC-071: Migration Script Works
**Steps:**
1. Have assessments in JSON file
2. Run `npm run migrate`

**Expected:** All assessments imported to PostgreSQL

---

### TC-072: No Data Loss on Error
**Steps:**
1. Simulate database write error
2. Check memory

**Expected:** Data still in memory, warning logged

---

### TC-073: Atomic Writes Prevent Corruption
**Steps:**
1. Simulate crash during write

**Expected:** Backup file exists, data recoverable

---

### TC-074: Auto-Save Debounced
**Steps:**
1. Type comment rapidly

**Expected:** Only saves after 1 second pause (not on every keystroke)

---

### TC-075: Concurrent Edits Tracked
**Steps:**
1. Two users edit same assessment
2. Check edit history

**Expected:** Both edits recorded with different editor emails

---

## 5. API & Backend (15 tests)

### TC-076: Framework Endpoint Works
**Steps:**
1. GET `/api/assessment/framework`

**Expected:** Returns all 6 pillars with questions

---

### TC-077: Start Assessment Endpoint
**Steps:**
1. POST `/api/assessment/start` with name, email

**Expected:** Returns 200, assessment ID

---

### TC-078: Get Assessment Status
**Steps:**
1. GET `/api/assessment/:id/status`

**Expected:** Returns progress, completed pillars, current category

---

### TC-079: Save Progress Endpoint
**Steps:**
1. POST `/api/assessment/:id/save-progress`

**Expected:** Returns 200, lastSaved timestamp

---

### TC-080: Submit Category Endpoint
**Steps:**
1. POST `/api/assessment/:id/category/:categoryId/submit`

**Expected:** Returns 200, nextCategory ID

---

### TC-081: Get Results Endpoint
**Steps:**
1. GET `/api/assessment/:id/results`

**Expected:** Returns overall scores, recommendations, summary

---

### TC-082: Get Pillar Results Endpoint
**Steps:**
1. GET `/api/assessment/:id/pillar/:pillarId/results`

**Expected:** Returns pillar-specific scores, recommendations

---

### TC-083: Update Metadata Endpoint
**Steps:**
1. PATCH `/api/assessment/:id/metadata`

**Expected:** Returns 200, updated assessment

---

### TC-084: Get All Assessments
**Steps:**
1. GET `/api/assessments`

**Expected:** Returns array of all assessments

---

### TC-085: Error Handling - Not Found
**Steps:**
1. GET `/api/assessment/invalid-id/status`

**Expected:** Returns 404, error message

---

### TC-086: Error Handling - Validation
**Steps:**
1. POST `/api/assessment/start` without required fields

**Expected:** Returns 400, validation error

---

### TC-087: CORS Headers Present
**Steps:**
1. Make cross-origin request

**Expected:** Response includes CORS headers

---

### TC-088: Status Endpoint Shows Health
**Steps:**
1. GET `/status`

**Expected:** Returns storage type, assessment count, features status

---

### TC-089: Adaptive Engine Generates Recommendations
**Steps:**
1. Complete assessment
2. Check results

**Expected:** painPointRecommendations, gapBasedActions, commentBasedInsights all populated

---

### TC-090: OpenAI Integration Works (if enabled)
**Steps:**
1. Set USE_LIVE_DATA=true, OPENAI_API_KEY
2. View results

**Expected:** whatsNew section has latest Databricks features

---

## 6. UI/UX & Edge Cases (10 tests)

### TC-091: Mobile Responsive
**Steps:**
1. View on mobile device (375px width)

**Expected:** Layout adapts, no horizontal scroll, buttons accessible

---

### TC-092: Loading States Show
**Steps:**
1. Navigate to results page
2. Watch during load

**Expected:** Shows loading spinner with message

---

### TC-093: Error States Show
**Steps:**
1. Simulate API error
2. Try to load results

**Expected:** Shows error message, retry button

---

### TC-094: Toast Notifications Work
**Steps:**
1. Save progress

**Expected:** Green toast appears: "Progress saved"

---

### TC-095: Empty State Handling
**Steps:**
1. View results with 0 responses

**Expected:** Shows "Complete questions to see results" message

---

### TC-096: Long Text Doesn't Break Layout
**Steps:**
1. Enter 1000-character comment
2. View in UI

**Expected:** Text wraps, doesn't overflow container

---

### TC-097: Special Characters in Name
**Steps:**
1. Create assessment with name "Test & Co. <Test>"
2. Save

**Expected:** Name saved correctly, displays without HTML injection

---

### TC-098: Concurrent Requests Don't Conflict
**Steps:**
1. Rapidly click between pillars

**Expected:** Requests handled independently, no race conditions

---

### TC-099: Browser Back Button Works
**Steps:**
1. Navigate through assessment
2. Press browser back

**Expected:** Returns to previous question, state preserved

---

### TC-100: Session Timeout Handling
**Steps:**
1. Leave assessment open for 24+ hours
2. Try to save

**Expected:** Data saves successfully (PostgreSQL, not session-based)

---

## 11. Gap-Based Actions Display (8 tests)

### TC-101: Gap-Based Actions Display for All Pillars
**Steps:**
1. Complete assessment with different Current/Future states
2. View each pillar's individual results
3. Check "Bridge the Gap: Current → Future" section

**Expected:** 
- All 6 pillars show gap-based actions (not empty [])
- Each action has dimension name, current/future levels, gap value

**Bug Fixed:** Gap-based actions were showing as empty array []

---

### TC-102: Current and Future Values Not Undefined
**Steps:**
1. Complete a pillar with gaps (e.g., Current=2, Future=4)
2. View pillar results
3. Check gap-based action cards

**Expected:** 
- Shows "Current: Level 2/5" (not "Level /5")
- Shows "Future: Level 4/5" (not "Level /5")
- Shows "Gap: 2 levels" (not undefined)

**Bug Fixed:** Current/Future values were undefined causing "Level /5" display

---

### TC-103: No Floating Point Precision Errors in Gap
**Steps:**
1. Complete pillar with Current=3, Future=4
2. View gap-based actions
3. Check gap value

**Expected:** 
- Gap shows as "1" or "1.0"
- NOT "1.1999999999999997" or similar floating point errors

**Bug Fixed:** Gap calculation had floating point precision errors

---

### TC-104: Gap Actions Sorted by Gap Size
**Steps:**
1. Complete pillar with varying gaps (1, 2, 3 levels)
2. View gap-based actions list

**Expected:** 
- Actions sorted with largest gap first
- Example order: Gap 3 → Gap 2 → Gap 1

---

### TC-105: Dimension Names Display Correctly
**Steps:**
1. Complete Platform pillar
2. View pillar results
3. Check gap-based actions

**Expected:** 
- Each action shows dimension name (e.g., "Environment Architecture & Scalability")
- Dimension name is not empty or undefined

---

### TC-106: Maturity Level Labels in Gap Actions
**Steps:**
1. Complete pillar with Current=1, Future=3
2. View gap-based actions

**Expected:** 
- Shows level names: "Explore" → "Formalize"
- Not just numbers, but descriptive labels

---

### TC-107: Gap Actions for Standardized Maturity Levels
**Steps:**
1. Complete assessment using new standardized levels (Explore, Experiment, Formalize, Optimize, Transform)
2. View pillar results
3. Verify gap actions reference correct level names

**Expected:** 
- Level 1 = Explore
- Level 2 = Experiment  
- Level 3 = Formalize
- Level 4 = Optimize
- Level 5 = Transform

**Related:** Standardized maturity levels across all 60 questions

---

### TC-108: Gap Actions with No Gaps
**Steps:**
1. Complete pillar with Current=Future (no gaps)
2. View pillar results

**Expected:** 
- Gap-based actions section either hidden or shows message
- No actions with Gap=0 displayed

---

## 12. Overall Results Display (6 tests)

### TC-109: Overall Results Show Pillar Assessment Cards
**Steps:**
1. Complete 1 or more pillars
2. Navigate to "View Overall Results"
3. Check "Pillar Assessment" section

**Expected:** 
- Shows pillar cards for each completed pillar
- Each card displays pillarName, currentScore, targetScore, gap
- Cards sorted by gap (largest first)
- Not showing skeleton/empty content

**Bug Fixed:** Overall results page was showing empty skeleton with no consolidated results

---

### TC-110: Pillar Cards Show The Good/Bad/Recommendations
**Steps:**
1. Complete Platform pillar with gaps and pain points
2. View overall results
3. Check pillar card content

**Expected:** 
- "The Good" section lists positive achievements
- "The Bad" section lists pain points and gaps
- "Recommendations" section provides actionable steps
- All three sections populated with relevant content

**Bug Fixed:** Pillar cards weren't displaying because backend returned wrong data structure

---

### TC-111: Partial Assessment Shows Available Results
**Steps:**
1. Complete only 1 of 6 pillars (17%)
2. View overall results

**Expected:** 
- Shows results for the 1 completed pillar
- "Continue Assessment" banner displays
- Shows completion percentage (17%)
- Pillar status grid shows 1 completed, 5 pending
- NOT showing "no data" or blank page

**Bug Fixed:** Partial assessments weren't displaying any consolidated results

---

### TC-112: Overall Scores Reflect Completed Pillars Only
**Steps:**
1. Complete 2 of 6 pillars
2. View overall results header
3. Check "Overall Current Score" and "Overall Future Score"

**Expected:** 
- Scores calculated from completed pillars only
- Maturity level displays correctly
- Gap calculation accurate

---

### TC-113: Roadmap to Success Displays for Partial Assessments
**Steps:**
1. Complete 1-3 pillars
2. View overall results
3. Scroll to "Roadmap to Success" section

**Expected:** 
- Shows pillar-specific recommendations for completed pillars
- Recommendations prioritized by gap and priority
- NOT empty or hidden

**Bug Fixed:** Roadmap section was empty due to data structure mismatch

---

### TC-114: Multiple Pillars Display in Priority Order
**Steps:**
1. Complete 3 pillars with different gaps:
   - Pillar A: Gap 3 (critical)
   - Pillar B: Gap 1 (medium)
   - Pillar C: Gap 2 (high)
2. View overall results

**Expected:** 
- Pillars displayed in order: A (gap 3), C (gap 2), B (gap 1)
- Priority badges show: Critical, High, Medium
- Largest gaps listed first

---

### TC-115: Pillars with Zero Gap Display Correctly
**Steps:**
1. Complete pillar with Current=3, Future=3 (gap=0)
2. View overall results

**Expected:** 
- Pillar displays on overall results page
- Shows "Achieved target maturity level" messaging
- Priority badge shows "Low"
- Different recommendations than gap>0 (maintain vs. progress)
- Actions focus on "Maintain capabilities" not "Progress to next level"

**Bug Fixed:** Pillars with gap=0 were filtered out, causing empty results page

---

### TC-116: All Completed Pillars Display Regardless of Gap
**Steps:**
1. Complete 3 pillars:
   - Pillar A: Current=2, Future=4 (gap=2)
   - Pillar B: Current=3, Future=3 (gap=0)
   - Pillar C: Current=1, Future=3 (gap=2)
2. View overall results

**Expected:** 
- ALL 3 pillars display
- Pillar B (gap=0) shows with different messaging
- Sorted: Pillar A/C (gap 2), then Pillar B (gap 0)
- Page not empty or blank

**Bug Fixed:** Only pillars with gap>0 were showing, causing missing content

---

## Test Execution Priority

### Critical (Must Pass Before Release):
TC-001-015, TC-036-060, TC-061-069, TC-101-103, TC-109-111, TC-115-116

### High (Should Pass):
TC-016-035, TC-076-090, TC-104-106, TC-112-113

### Medium (Nice to Have):
TC-091-100, TC-107-108, TC-114

---

## Automated Testing Recommendations

### Unit Tests:
- Adaptive recommendation engine logic
- Score calculation formulas
- Pain point analysis

### Integration Tests:
- API endpoints with PostgreSQL
- Results generation pipeline
- Cache invalidation logic

### End-to-End Tests:
- Complete assessment flow
- Results viewing and export
- Multi-user scenarios

---

## Known Issues & Workarounds

1. **Refresh button requires hard refresh**: Fixed with cache-busting query parameters
2. **Results show stale data**: Fixed with HTTP no-cache headers + backend cache clearing
3. **Assessment name not showing**: Fixed by passing assessmentName to NavigationPanel
4. **Email prompt on every open**: Fixed to only show for existing assessments
5. **Progress not saving**: Fixed with auto-save debouncing and error handling
6. **PostgreSQL connection**: Fixed with fallback to file storage
7. **Executive summary "nonsense"**: Fixed with CTO-friendly strategic narrative
8. **Gap-based actions empty or undefined**: Fixed by generating dimension-level gaps for all pillars
9. **Floating point errors in gap values**: Fixed with parseFloat(gap.toFixed(1))
10. **Standardized maturity levels**: All 60 questions now use Explore→Experiment→Formalize→Optimize→Transform
11. **Overall results page showing skeleton/empty**: Fixed by generating pillar-structured prioritizedActions with proper data model
12. **Pillars with zero gap not displaying**: Fixed by removing gap>0 filter - all completed pillars now show with appropriate messaging

---

**Version:** 1.3
**Last Updated:** October 17, 2025
**Coverage:** Based on all bugs encountered during development (116 test cases)



