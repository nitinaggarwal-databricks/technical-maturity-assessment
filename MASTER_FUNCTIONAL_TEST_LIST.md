# Master Functional Test List

**Purpose:** Comprehensive list of ALL functional tests to execute after ANY code change  
**Scope:** Entire application including Dashboard  
**Time Required:** 25-30 minutes for complete suite  
**Pass Criteria:** 100% of critical tests must pass

---

## 📚 Test Documentation Index

This master list references all test checklists:

1. **REGRESSION_TEST_CHECKLIST.md** - Core application tests (100+ tests)
2. **DASHBOARD_TEST_CHECKLIST.md** - Dashboard-specific tests (35+ tests)
3. **HOME_PAGE_TEST_CHECKLIST.md** - Home page tests (200+ tests)
4. **NEW_DESIGNS_TEST_CHECKLIST.md** - New designs tests (500+ tests)
5. **FUNCTIONAL_TEST_CASES.md** - Original functional tests (100+ tests)

**Total Test Points:** 900+ across all checklists

---

## 🔴 CRITICAL PATH - MUST PASS (10 min)

Execute these tests after EVERY code change before declaring it complete.

### 1. Home Page & Navigation (2 min)
- [ ] Home page loads at `/`
- [ ] All sections visible (Hero, Why, Pillars, How It Works)
- [ ] "Start Assessment" button works
- [ ] "Try Sample Assessment" dropdown works (Minimal/Partial/Full)
- [ ] "Past Assessments" link works
- [ ] GlobalNav is visible with all links
- [ ] No console errors

### 2. Dashboard (2 min)
- [ ] Click "Dashboard" in GlobalNav
- [ ] Dashboard loads at `/insights-dashboard`
- [ ] All 6 KPI cards show numbers (not NaN)
- [ ] Radar chart renders
- [ ] Bar chart renders
- [ ] Customer portfolio table shows data
- [ ] Click a customer row → Goes to their results
- [ ] No console errors

### 3. Sample Assessment Generation (2 min)
- [ ] From home page, click "Try Sample Assessment" → "Full"
- [ ] Toast shows "Generating full sample assessment..."
- [ ] Redirects to Overall Results page
- [ ] Overall Results loads with data
- [ ] All 6 pillar cards show "The Good", "The Bad", "Recommendations"
- [ ] Strategic Roadmap section is visible
- [ ] No console errors

### 4. Overall Results Page (2 min)
- [ ] Page loads without "Results Not Available" error
- [ ] Header shows assessment name
- [ ] Overall current/future scores display
- [ ] All 6 pillar cards are visible
- [ ] Each pillar card has content (not generic)
- [ ] "View Detailed [Pillar] Results" buttons appear for completed pillars
- [ ] "Edit Assessment" button works
- [ ] "Export PDF" button works (downloads PDF)
- [ ] "Export to Excel" button works (downloads Excel)

### 5. Executive Summary Page (2 min)
- [ ] Click "Executive Summary" tab
- [ ] Page loads without blank screen
- [ ] "What this assessment reveals" section shows
- [ ] Current/Target maturity levels display
- [ ] Strategic situation text is NOT generic
- [ ] Critical constraints section shows pillar-specific data
- [ ] Transformation roadmap shows actual pillars (not hardcoded)
- [ ] "Edit Summary" button appears
- [ ] "Export PDF" works

---

## 🟡 IMPORTANT TESTS - SHOULD PASS (10 min)

Execute these tests for major features or after significant changes.

### 6. Individual Pillar Results (2 min)
- [ ] From Overall Results, click "View Detailed Platform & Governance Results"
- [ ] Page loads without "Results Not Available" error
- [ ] "Back to Assessment" button is VISIBLE (not hidden behind header)
- [ ] Pillar name displays
- [ ] Current/Future maturity scores show
- [ ] Maturity comparison chart renders
- [ ] Pain point recommendations section shows
- [ ] Gap-based actions section shows
- [ ] "Continue to Next Pillar" or "View Overall Results" button appears

### 7. Past Assessments Page (2 min)
- [ ] Click "Past Assessments" in GlobalNav
- [ ] Page loads with list of assessments
- [ ] Assessment cards show:
  - Name, organization, status, progress, date
- [ ] Click "Open" on an assessment → Goes to Overall Results
- [ ] Click "Edit" → Opens edit modal
- [ ] Click "Clone" → Creates duplicate
- [ ] Click "Delete" → Shows confirmation → Deletes

### 8. Assessment Questions Flow (2 min)
- [ ] Start a new assessment or continue existing
- [ ] Questions page loads for first pillar
- [ ] Answer 1 question (select current/future state, pain points, add comment)
- [ ] Auto-save toast appears
- [ ] Complete all questions in pillar
- [ ] Click "Complete [Pillar Name]"
- [ ] Redirects to that pillar's results page (NOT overall results)
- [ ] Pillar results show data
- [ ] "Continue to Next Pillar" button appears

### 9. Question Filtering (1 min)
- [ ] On questions page, filter dropdown shows options
- [ ] Select "Completed" → Only answered questions show
- [ ] Select "Not Started" → Only unanswered questions show
- [ ] Select "All" → All questions show
- [ ] Selected question responses are visible when filtering

### 10. PDF & Excel Export (2 min)
- [ ] From Overall Results, click "Export PDF"
- [ ] PDF downloads successfully (no error)
- [ ] Open PDF → Verify:
  - Cover page with org name, date, maturity level
  - Executive Summary page (text, not [object Object])
  - Maturity Overview page
  - Pillar details pages
  - No garbage characters
  - Professional formatting
- [ ] From Overall Results, click "Export to Excel"
- [ ] Excel downloads successfully
- [ ] Open Excel → Verify:
  - Overview sheet
  - Summary sheet
  - 6 pillar sheets
  - Data populated (not empty)

### 11. Edit Assessment (1 min)
- [ ] From Overall Results, click "Edit" button
- [ ] Modal opens with assessment details
- [ ] All fields are editable (name, org, industry, email)
- [ ] Change assessment name
- [ ] Click "Save Changes"
- [ ] Toast shows "Assessment updated successfully"
- [ ] Modal closes
- [ ] Changes reflected on page

---

## 🟢 COMPREHENSIVE TESTS - NICE TO HAVE (10 min)

Execute these tests for full regression or before major releases.

### 12. Manual Assessment Creation (2 min)
- [ ] From Past Assessments, click "New Assessment"
- [ ] If current assessment exists, warning banner shows
- [ ] Fill in all fields (org name, industry, email, assessment name)
- [ ] Click "Start Assessment"
- [ ] Redirects to first pillar questions
- [ ] Questions load correctly

### 13. Input Validation (1 min)
- [ ] On questions page, select current state = 3
- [ ] Try to set future state = 2 (lower than current)
- [ ] Error message appears: "Future state cannot be less than current state"
- [ ] Cannot proceed until fixed
- [ ] Set future state = 4 (higher than current)
- [ ] Error clears

### 14. Navigation Between Pages (2 min)
- [ ] From Overall Results → Click "Questions" tab → Goes to first pillar
- [ ] From Overall Results → Click "Executive Summary" → Goes to Exec Summary
- [ ] From Executive Summary → Click breadcrumb → Goes to Overall Results
- [ ] From Pillar Results → Click "Back to Assessment" → Goes to questions
- [ ] From Pillar Results → Click "View Overall Results" → Goes to Overall Results
- [ ] GlobalNav links work from any page

### 15. Sample Assessment Variations (2 min)
- [ ] Generate "Minimal" sample → Completion % is low (10-30%)
- [ ] Generate "Partial" sample → Completion % is medium (40-60%)
- [ ] Generate "Full" sample → Completion % is high (80-100%)
- [ ] View results for each → Scores are different
- [ ] Minimal score < Partial score < Full score

### 16. Dynamic Content Verification (1 min)
- [ ] Generate sample assessment A
- [ ] Note "The Good" content for Platform pillar
- [ ] Generate sample assessment B
- [ ] Note "The Good" content for Platform pillar
- [ ] Content should be DIFFERENT (not identical)
- [ ] Check Network tab → Verify `_isDynamic: true` flag

### 17. Error Handling - No Responses (1 min)
- [ ] Generate minimal sample (1-2 pillars only)
- [ ] Try to view pillar results for INCOMPLETE pillar
- [ ] Shows friendly message: "No Responses Yet for [Pillar Name]"
- [ ] Shows "Start [Pillar Name] Assessment" button
- [ ] NOT a harsh error or debug info

### 18. Mobile Responsiveness (1 min)
- [ ] Resize browser to mobile width (375px)
- [ ] Home page is readable (no horizontal scroll)
- [ ] Dashboard KPI cards stack vertically
- [ ] Overall Results pillar cards stack
- [ ] Executive Summary is readable
- [ ] All buttons are tappable
- [ ] Navigation menu works

---

## 🔵 AUTOMATED API TESTS (2 min)

Run the automated test suite to verify backend functionality.

### 19. Run Automated Test Suite
```bash
cd databricks-maturity-assessment
node comprehensive-validation-test.js
```

**Expected Results:**
- [ ] Health endpoint returns `status: 'ok'`
- [ ] Sample generation succeeds
- [ ] Sample has responses object
- [ ] Overall results have assessmentInfo, categoryDetails, prioritizedActions
- [ ] prioritizedActions have theGood/theBad fields
- [ ] Pillar results have pillarDetails, painPointRecommendations, gapBasedActions
- [ ] Manual assessment creation succeeds
- [ ] Assessment listing returns array
- [ ] Different assessments produce different results
- [ ] Error handling works (404s, 400s)

**Pass Criteria:** ≥ 90% tests passing (45+/49)

### 20. Test Dashboard API
```bash
curl http://localhost:5000/api/dashboard/stats
```

**Expected Response:**
- [ ] Status: 200 OK
- [ ] Valid JSON response
- [ ] Contains `success: true`
- [ ] Contains `data` object with all KPIs
- [ ] All KPI values are numbers (not NaN)

---

## 📊 VISUAL REGRESSION TESTS (3 min)

Verify visual consistency across the application.

### 21. Layout & Styling (1 min)
- [ ] Home page layout matches design
- [ ] Dashboard layout matches reference image
- [ ] Overall Results has professional report style
- [ ] Executive Summary has sidebar layout
- [ ] Pillar Results has clean layout
- [ ] No overlapping elements anywhere
- [ ] No cut-off text anywhere
- [ ] Consistent padding/margins

### 22. Color Scheme (1 min)
- [ ] Databricks brand colors used (blue, green)
- [ ] Status badges colored correctly:
  - Green: On Track
  - Yellow: At Risk
  - Red: Delayed
- [ ] Progress bars colored by completion level
- [ ] Trend indicators: Green (up), Red (down)
- [ ] Charts use consistent colors

### 23. Typography (1 min)
- [ ] Page titles are large and bold
- [ ] Section headings are medium and bold
- [ ] Body text is readable
- [ ] All fonts are consistent
- [ ] No font loading issues

---

## 🎯 INTEGRATION TESTS (3 min)

Test complete user workflows end-to-end.

### 24. Complete Assessment Workflow (2 min)
- [ ] Start on home page
- [ ] Click "Start Assessment"
- [ ] Fill in organization details
- [ ] Click "Start Assessment"
- [ ] Answer questions in first pillar
- [ ] Complete first pillar
- [ ] View pillar results
- [ ] Continue to next pillar
- [ ] Answer questions in second pillar
- [ ] Complete second pillar
- [ ] View overall results
- [ ] View executive summary
- [ ] Export PDF
- [ ] Export Excel
- [ ] Navigate to Dashboard
- [ ] Find assessment in customer portfolio
- [ ] Click to view results

### 25. Sample to Dashboard Workflow (1 min)
- [ ] Generate full sample assessment
- [ ] View overall results
- [ ] View executive summary
- [ ] Navigate to Dashboard
- [ ] Find sample in customer portfolio
- [ ] Verify completion is 100%
- [ ] Verify status is "On Track"
- [ ] Click to view results again

---

## 📋 MASTER TEST EXECUTION LOG

**Date:** _____________  
**Tester:** _____________  
**Build/Commit:** _____________  
**Fix Applied:** _____________

### Critical Path Tests (10 min)
- [ ] All 5 critical test groups passed
- [ ] Total tests passed: _____ / 5
- [ ] Issues found: _____________

### Important Tests (10 min)
- [ ] All 6 important test groups passed
- [ ] Total tests passed: _____ / 6
- [ ] Issues found: _____________

### Comprehensive Tests (10 min)
- [ ] All 7 comprehensive test groups passed
- [ ] Total tests passed: _____ / 7
- [ ] Issues found: _____________

### Automated Tests (2 min)
- [ ] Automated test suite passed (≥90%)
- [ ] Pass rate: _____ / 49 tests
- [ ] Dashboard API test passed
- [ ] Issues found: _____________

### Visual Regression Tests (3 min)
- [ ] All 3 visual test groups passed
- [ ] Total tests passed: _____ / 3
- [ ] Issues found: _____________

### Integration Tests (3 min)
- [ ] All 2 integration test groups passed
- [ ] Total tests passed: _____ / 2
- [ ] Issues found: _____________

### FINAL VERDICT
- [ ] ✅ ALL TESTS PASSED - Ready to deploy
- [ ] ⚠️  MINOR ISSUES - Mostly good, minor fixes needed
- [ ] ❌ MAJOR ISSUES - Critical bugs found, must fix before deploying

**Overall Pass Rate:** _____ / 28 test groups (_____ %)

**Notes:**
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

**Sign-off:** _____________  **Date:** _____________

---

## 🚀 QUICK SMOKE TEST (3 minutes)

**Use this for rapid verification after minor fixes:**

1. [ ] Home page loads
2. [ ] Dashboard loads with data
3. [ ] Generate full sample assessment
4. [ ] Overall Results shows data (The Good/The Bad populated)
5. [ ] Executive Summary shows data (not blank)
6. [ ] View one pillar result (loads correctly)
7. [ ] Export PDF (downloads without error)
8. [ ] Export Excel (downloads without error)
9. [ ] Dashboard shows updated data
10. [ ] No console errors anywhere

**If all 10 pass:** Likely safe to deploy  
**If any fail:** Run full test suite

---

## 🔧 TROUBLESHOOTING GUIDE

### Common Issues & Solutions

#### Issue: Tests failing after deployment
**Solutions:**
1. Wait 3-5 minutes for Railway deployment to complete
2. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+F5)
3. Clear browser cache completely
4. Try Incognito/Private mode
5. Check Railway logs for errors

#### Issue: Console errors appearing
**Solutions:**
1. Copy full error message
2. Check which file/line is causing error
3. Verify that file was deployed
4. Check if error is from old cached code
5. Review recent code changes

#### Issue: Data not updating
**Solutions:**
1. Check Network tab for failed API calls
2. Verify backend is running
3. Test API endpoints directly with curl
4. Check for caching issues
5. Verify database has data

#### Issue: Charts not rendering
**Solutions:**
1. Check console for Chart.js errors
2. Verify Chart.js is loaded (Network tab)
3. Check data format being passed to charts
4. Try different browser
5. Clear cache and reload

#### Issue: PDF/Excel export failing
**Solutions:**
1. Check console for export errors
2. Verify data structure is correct
3. Check for null/undefined values
4. Test with different assessment
5. Check browser download settings

---

## 📚 Reference Documentation

### Test Checklists
- **REGRESSION_TEST_CHECKLIST.md** - Core app regression tests
- **DASHBOARD_TEST_CHECKLIST.md** - Dashboard-specific tests
- **HOME_PAGE_TEST_CHECKLIST.md** - Home page tests
- **NEW_DESIGNS_TEST_CHECKLIST.md** - New designs tests
- **FUNCTIONAL_TEST_CASES.md** - Original functional tests

### Implementation Docs
- **DASHBOARD_IMPLEMENTATION_SUMMARY.md** - Dashboard feature details
- **DYNAMIC_RESULTS_SUMMARY.md** - Dynamic results implementation
- **SME_EDIT_FEATURE.md** - SME edit functionality
- **NAVIGATION_MAP.md** - Navigation flow diagram

### Test Results
- **TEST_RESULTS_SUMMARY.md** - Automated test results
- **PRODUCTION_READINESS_REPORT.md** - Production readiness status

---

## 🎯 TEST PRIORITY MATRIX

| Feature | Critical | Important | Comprehensive | Automated |
|---------|----------|-----------|---------------|-----------|
| Home Page | ✅ | | | |
| Dashboard | ✅ | ✅ | | ✅ |
| Sample Generation | ✅ | | ✅ | ✅ |
| Overall Results | ✅ | ✅ | | ✅ |
| Executive Summary | ✅ | ✅ | | ✅ |
| Pillar Results | | ✅ | ✅ | ✅ |
| PDF Export | | ✅ | | |
| Excel Export | | ✅ | | |
| Assessment Editing | | ✅ | ✅ | |
| Navigation | ✅ | ✅ | ✅ | |
| Past Assessments | | ✅ | ✅ | ✅ |
| Question Flow | | ✅ | ✅ | |
| Filtering | | ✅ | ✅ | |
| Validation | | | ✅ | |
| Error Handling | | | ✅ | ✅ |
| Mobile | | | ✅ | |
| Performance | | | ✅ | |

---

## 📊 TEST COVERAGE SUMMARY

**Total Test Points:** 900+  
**Critical Tests:** 50+  
**Important Tests:** 100+  
**Comprehensive Tests:** 750+  
**Automated Tests:** 49  

**Time Investment:**
- Quick Smoke Test: 3 minutes
- Critical Path: 10 minutes
- Important Tests: 10 minutes
- Comprehensive Tests: 10 minutes
- Full Suite: 30 minutes

**Recommended Frequency:**
- Quick Smoke Test: After every fix
- Critical Path: After every significant change
- Important Tests: After feature additions
- Comprehensive Tests: Before major releases
- Full Suite: Weekly or before production deployment

---

## 🏆 BEST PRACTICES

### Before Making Changes
1. Run Quick Smoke Test to establish baseline
2. Document current functionality
3. Plan test strategy for changes

### During Development
1. Test incrementally as you code
2. Use console logs for debugging
3. Check browser DevTools frequently
4. Test in multiple browsers

### After Making Changes
1. Run Quick Smoke Test immediately
2. If passes, run Critical Path tests
3. If Critical Path passes, run full suite
4. Document all test results
5. Fix any issues found
6. Retest until all pass

### Before Deploying
1. Run full test suite
2. Verify ≥95% pass rate
3. Document any known issues
4. Get sign-off from reviewer
5. Deploy to staging first
6. Retest on staging
7. Deploy to production
8. Retest on production

---

## END OF MASTER TEST LIST

**Remember:** Testing is not optional. It's the difference between a working application and a broken one. Invest the time to test thoroughly!

**Golden Rule:** If you don't have time to test it right, you'll have to make time to fix it later.

---

**Last Updated:** October 25, 2025  
**Version:** 1.0  
**Maintainer:** Development Team


