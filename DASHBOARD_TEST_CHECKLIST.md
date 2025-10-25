# Dashboard Test Checklist

**Purpose:** Comprehensive testing for the new Insights Dashboard  
**Time Required:** 10-15 minutes  
**Pass Criteria:** All critical tests must pass

---

## 🔴 CRITICAL TESTS (Must Pass - 5 min)

### 1. Dashboard Access & Loading
- [ ] Navigate to home page
- [ ] Click "Dashboard" link in global navigation
- [ ] Dashboard page loads at `/insights-dashboard`
- [ ] No console errors on page load
- [ ] Loading state appears briefly
- [ ] All sections render without errors

### 2. Header & Actions
- [ ] Page title displays: "Assessment Insights Dashboard"
- [ ] "Export" button is visible
- [ ] "Share" button is visible
- [ ] Clicking "Export" shows toast: "Exporting dashboard data..."
- [ ] Clicking "Share" shows toast: "Share link copied to clipboard!"
- [ ] GlobalNav is visible at top
- [ ] "Dashboard" link is highlighted in nav

### 3. Filters Section
- [ ] Filters section is visible with white background
- [ ] Time range dropdown shows "Last 6 weeks" (default)
- [ ] Time range options available:
  - Last week
  - Last 2 weeks
  - Last 4 weeks
  - Last 6 weeks (selected)
  - Last 3 months
  - Last 6 months
- [ ] Region filter shows "All regions" (default)
- [ ] Region options available:
  - All regions (selected)
  - North America
  - EMEA
  - APAC
- [ ] "Advanced filters" button is visible

### 4. KPI Cards (All 6 Must Display)
- [ ] **Total Assessments** card shows:
  - Label: "Total Assessments"
  - Value: Number (e.g., 126)
  - Trend: Green up arrow with number (e.g., +12)
- [ ] **Active Customers** card shows:
  - Label: "Active Customers"
  - Value: Number (e.g., 34)
  - Trend: Green up arrow with number (e.g., +4)
- [ ] **Avg Completion Time** card shows:
  - Label: "Avg Completion Time"
  - Value: Number with "hrs" (e.g., 2.8 hrs)
  - Trend: Red down arrow with number (e.g., -0.3)
- [ ] **Avg Maturity Level** card shows:
  - Label: "Avg Maturity Level"
  - Value: Number (e.g., 3.2)
  - Trend: Green up arrow with number (e.g., +0.2)
- [ ] **Avg Improvement Potential** card shows:
  - Label: "Avg Improvement Potential"
  - Value: Number with + sign (e.g., +0.8)
  - Trend: Green up arrow with number (e.g., +0.1)
- [ ] **Feedback (NPS)** card shows:
  - Label: "Feedback (NPS)"
  - Value: Number (e.g., 8.6)
  - Trend: Green up arrow with number (e.g., +0.4)

### 5. Charts Section
- [ ] Two charts are visible side-by-side (desktop)
- [ ] **Radar Chart** (left):
  - Title: "Average Maturity by Pillar"
  - 6 axes visible: Platform, Data, Analytics, ML, GenAI, Ops
  - Two data series: "Current" (blue) and "Target" (green)
  - Legend at bottom
  - Chart renders without errors
- [ ] **Bar + Line Chart** (right):
  - Title: "Assessment Completions & Avg Time"
  - X-axis: W1, W2, W3, W4, W5, W6
  - Blue bars: # completed
  - Green line: avg hours
  - Two Y-axes (left and right)
  - Legend at bottom
  - Chart renders without errors

---

## 🟡 IMPORTANT TESTS (Should Pass - 5 min)

### 6. Customer Portfolio Table
- [ ] Table title: "Customer Portfolio"
- [ ] "Columns" button is visible
- [ ] Table headers visible:
  - Customer
  - Maturity
  - Target
  - Completion
  - Key Gaps
  - Status
- [ ] At least 1 customer row is displayed
- [ ] Each customer row shows:
  - Customer name (bold)
  - Maturity score (number)
  - Target score (number)
  - Progress bar with percentage
  - Progress bar color matches completion level:
    - Green: ≥90%
    - Blue: ≥70%
    - Orange: ≥50%
    - Red: <50%
  - Key gaps as badges (e.g., "Governance", "GenAI")
  - Status badge with color:
    - Green "On Track"
    - Yellow "At Risk"
    - Red "Delayed"

### 7. Customer Row Interaction
- [ ] Hover over a customer row
- [ ] Cursor changes to pointer
- [ ] Click on a customer row
- [ ] Navigates to `/results/:assessmentId`
- [ ] Overall Results page loads for that assessment
- [ ] Use browser back button
- [ ] Returns to Dashboard

### 8. Tabbed Bottom Section
- [ ] Three tabs are visible:
  - Fastest Completion (default active)
  - Biggest Improvement
  - Stalled Assessments
- [ ] "Fastest Completion" tab is active (blue underline)
- [ ] At least 1 item is displayed under active tab
- [ ] Each item shows:
  - Customer name (bold)
  - Detail text (hours • Owner: name)
- [ ] Click "Biggest Improvement" tab
- [ ] Tab becomes active
- [ ] Content changes to show improvement items
- [ ] Click "Stalled Assessments" tab
- [ ] Tab becomes active
- [ ] Content changes to show stalled items
- [ ] Click back to "Fastest Completion"
- [ ] Tab becomes active again

### 9. Bottom Section Item Interaction
- [ ] Hover over an item in bottom section
- [ ] Background changes to light gray
- [ ] Cursor changes to pointer
- [ ] Click on an item
- [ ] Navigates to `/results/:assessmentId`
- [ ] Overall Results page loads
- [ ] Use browser back button
- [ ] Returns to Dashboard

### 10. Footer Information
- [ ] Footer text is visible at bottom
- [ ] Shows: "Updated just now • Data source: Assessment Platform"
- [ ] Text is small and gray

---

## 🟢 COMPREHENSIVE TESTS (Nice to Have - 5 min)

### 11. Data Accuracy - KPIs
- [ ] Generate 3 sample assessments (Full)
- [ ] Navigate to Dashboard
- [ ] Total Assessments count increases by 3
- [ ] Active Customers count reflects unique organizations
- [ ] Avg Maturity Level is between 1.0 and 5.0
- [ ] Avg Improvement Potential is positive number
- [ ] All KPI values are numbers (not NaN or undefined)

### 12. Data Accuracy - Customer Portfolio
- [ ] Customer names match actual assessment organizations
- [ ] Maturity scores are between 1.0 and 5.0
- [ ] Target scores are higher than maturity scores
- [ ] Completion percentages match actual progress:
  - 0% for new assessments
  - 17% for 1 pillar completed
  - 33% for 2 pillars completed
  - 50% for 3 pillars completed
  - 67% for 4 pillars completed
  - 83% for 5 pillars completed
  - 100% for all 6 pillars completed
- [ ] Status reflects completion:
  - "Delayed" for <50%
  - "At Risk" for 50-79%
  - "On Track" for ≥80%

### 13. Filter Functionality - Time Range
- [ ] Change time range to "Last week"
- [ ] Dashboard data refreshes (loading state appears)
- [ ] Data updates (may show different numbers)
- [ ] No errors in console
- [ ] Change to "Last 3 months"
- [ ] Dashboard data refreshes again
- [ ] Change back to "Last 6 weeks"

### 14. Filter Functionality - Region
- [ ] Change region to "North America"
- [ ] Dashboard data refreshes
- [ ] No errors in console
- [ ] Change to "EMEA"
- [ ] Dashboard data refreshes
- [ ] Change back to "All regions"

### 15. Responsive Design - Mobile
- [ ] Resize browser to mobile width (375px)
- [ ] KPI cards stack vertically (1 per row)
- [ ] Charts stack vertically (1 per row)
- [ ] Radar chart is readable
- [ ] Bar chart is readable
- [ ] Table scrolls horizontally if needed
- [ ] All text is readable (not too small)
- [ ] Buttons are tappable (not too small)
- [ ] No horizontal page scroll

### 16. Responsive Design - Tablet
- [ ] Resize browser to tablet width (768px)
- [ ] KPI cards show 2 per row
- [ ] Charts stack vertically
- [ ] Table is readable
- [ ] All interactions work

### 17. Responsive Design - Desktop
- [ ] Resize browser to desktop width (1200px+)
- [ ] KPI cards show 3 per row
- [ ] Charts show side-by-side
- [ ] Table shows all columns without scroll
- [ ] Layout is balanced and professional

### 18. Empty State - No Assessments
- [ ] Delete all assessments (or test with fresh database)
- [ ] Navigate to Dashboard
- [ ] Dashboard loads without errors
- [ ] KPI cards show 0 or default values
- [ ] Charts render with default/empty data
- [ ] Customer portfolio table is empty or shows "No data"
- [ ] No console errors

### 19. Error Handling - API Failure
- [ ] Stop the backend server
- [ ] Navigate to Dashboard
- [ ] Loading state appears
- [ ] Error toast shows: "Failed to load dashboard data"
- [ ] Page shows "No data available" message
- [ ] No console errors (error is caught)
- [ ] Restart backend server
- [ ] Refresh page
- [ ] Dashboard loads correctly

### 20. Navigation - GlobalNav
- [ ] From Dashboard, click "Why Assessment" in nav
- [ ] Navigates to home page, scrolls to Why section
- [ ] Click "Dashboard" in nav
- [ ] Returns to Dashboard
- [ ] Click "Explore Framework" in nav
- [ ] Navigates to home page, scrolls to Pillars section
- [ ] Click "Dashboard" in nav
- [ ] Returns to Dashboard
- [ ] Click "Past Assessments" in nav
- [ ] Navigates to Assessments page
- [ ] Click "Dashboard" in nav
- [ ] Returns to Dashboard

### 21. Performance - Load Time
- [ ] Clear browser cache
- [ ] Navigate to Dashboard
- [ ] Measure load time (should be <5 seconds)
- [ ] All KPIs appear quickly
- [ ] Charts render smoothly (no lag)
- [ ] No performance warnings in console

### 22. Chart Interactions - Radar
- [ ] Hover over radar chart
- [ ] Tooltip appears showing values
- [ ] Hover over different points
- [ ] Tooltips update correctly
- [ ] Click legend items
- [ ] Data series toggle on/off

### 23. Chart Interactions - Bar
- [ ] Hover over bar chart bars
- [ ] Tooltip appears showing count
- [ ] Hover over line points
- [ ] Tooltip appears showing hours
- [ ] Click legend items
- [ ] Data series toggle on/off

### 24. Browser Compatibility - Chrome
- [ ] Open Dashboard in Chrome
- [ ] All features work
- [ ] Charts render correctly
- [ ] No console errors

### 25. Browser Compatibility - Safari
- [ ] Open Dashboard in Safari
- [ ] All features work
- [ ] Charts render correctly
- [ ] No console errors

### 26. Browser Compatibility - Firefox
- [ ] Open Dashboard in Firefox
- [ ] All features work
- [ ] Charts render correctly
- [ ] No console errors

---

## 🔵 BACKEND API TESTS

### 27. API Endpoint - Dashboard Stats
```bash
# Test the dashboard stats endpoint
curl http://localhost:5000/api/dashboard/stats
```

**Expected Response:**
- [ ] Status: 200 OK
- [ ] Response is valid JSON
- [ ] Contains `success: true`
- [ ] Contains `data` object with:
  - `totalAssessments` (number)
  - `activeCustomers` (number)
  - `avgCompletionTime` (string)
  - `avgMaturityLevel` (string)
  - `avgImprovementPotential` (string)
  - `feedbackNPS` (string)
  - `avgMaturityByPillar` (object with current/target arrays)
  - `weeklyCompletions` (object with labels/counts/avgHours)
  - `customerPortfolio` (array of customer objects)
  - `fastest` (array)
  - `improvement` (array)
  - `stalled` (array)

### 28. API Endpoint - Error Handling
```bash
# Test with invalid request
curl http://localhost:5000/api/dashboard/stats?invalid=true
```

**Expected Response:**
- [ ] Status: 200 OK (endpoint doesn't use query params, so ignores them)
- [ ] Response is valid JSON
- [ ] No server crash

---

## 📊 VISUAL REGRESSION TESTS

### 29. Layout Consistency
- [ ] Dashboard layout matches reference image
- [ ] KPI cards are evenly spaced
- [ ] Charts are properly aligned
- [ ] Table columns are well-proportioned
- [ ] No overlapping elements
- [ ] No cut-off text
- [ ] Consistent padding/margins

### 30. Color Scheme
- [ ] KPI cards: White background
- [ ] Trend indicators: Green for positive, Red for negative
- [ ] Charts: Blue and Green colors
- [ ] Status badges:
  - Green for "On Track"
  - Yellow for "At Risk"
  - Red for "Delayed"
- [ ] Progress bars:
  - Green: ≥90%
  - Blue: ≥70%
  - Orange: ≥50%
  - Red: <50%
- [ ] Overall color scheme is professional

### 31. Typography
- [ ] Page title is large and bold
- [ ] KPI labels are small and gray
- [ ] KPI values are large and bold
- [ ] Table headers are small and gray
- [ ] Table data is readable
- [ ] All text is legible
- [ ] Font sizes are consistent

### 32. Icons
- [ ] Export icon (FiDownload) is visible
- [ ] Share icon (FiShare2) is visible
- [ ] Clock icon (FiClock) in filters is visible
- [ ] Filter icon (FiFilter) is visible
- [ ] Trend up icons (FiTrendingUp) are visible
- [ ] Trend down icons (FiTrendingDown) are visible
- [ ] All icons are properly sized

---

## 🎯 INTEGRATION TESTS

### 33. Dashboard → Assessment Flow
- [ ] Start on Dashboard
- [ ] Click a customer in portfolio table
- [ ] View their Overall Results
- [ ] Click "Executive Summary" tab
- [ ] View Executive Summary
- [ ] Click "Dashboard" in GlobalNav
- [ ] Return to Dashboard
- [ ] Customer is still in portfolio table

### 34. Assessment → Dashboard Flow
- [ ] Generate a new sample assessment
- [ ] Complete the assessment
- [ ] Navigate to Dashboard
- [ ] New assessment appears in Customer Portfolio
- [ ] Total Assessments count increased
- [ ] Active Customers count may increase
- [ ] Avg metrics updated

### 35. Multi-Assessment Scenario
- [ ] Generate 5 sample assessments (mix of Full/Partial/Minimal)
- [ ] Navigate to Dashboard
- [ ] Total Assessments shows 5+
- [ ] Customer Portfolio shows all 5
- [ ] Different completion percentages visible
- [ ] Different status badges visible
- [ ] Charts reflect aggregated data

---

## 📋 TEST EXECUTION LOG

**Date:** _____________  
**Tester:** _____________  
**Build/Commit:** _____________

### Critical Tests (5 min)
- [ ] All 5 critical tests passed
- [ ] Issues found: _____________

### Important Tests (5 min)
- [ ] All 5 important tests passed
- [ ] Issues found: _____________

### Comprehensive Tests (5 min)
- [ ] All 27 comprehensive tests passed
- [ ] Issues found: _____________

### FINAL VERDICT
- [ ] ✅ ALL TESTS PASSED - Dashboard is production-ready
- [ ] ⚠️  MINOR ISSUES - Dashboard mostly works, minor fixes needed
- [ ] ❌ MAJOR ISSUES - Dashboard has critical bugs, must fix

**Notes:**
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

**Sign-off:** _____________  **Date:** _____________

---

## 🚀 QUICK SMOKE TEST (2 minutes)

**Use this for rapid verification:**

1. [ ] Click "Dashboard" in nav → Page loads
2. [ ] All 6 KPI cards show numbers
3. [ ] Radar chart renders
4. [ ] Bar chart renders
5. [ ] Customer portfolio table shows data
6. [ ] Click a customer → Goes to their results
7. [ ] No console errors

**If all 7 pass:** Dashboard is working  
**If any fail:** Run full test suite

---

## 🔧 TROUBLESHOOTING

### Issue: Dashboard shows "No data available"
**Possible causes:**
- Backend not running
- Database empty
- API endpoint error

**Solutions:**
1. Check backend is running: `curl http://localhost:5000/api/health`
2. Check dashboard endpoint: `curl http://localhost:5000/api/dashboard/stats`
3. Generate sample assessments
4. Check browser console for errors

### Issue: Charts not rendering
**Possible causes:**
- Chart.js not loaded
- Invalid data format
- Browser compatibility

**Solutions:**
1. Check console for Chart.js errors
2. Verify data structure in Network tab
3. Try different browser
4. Clear cache and reload

### Issue: Customer portfolio empty
**Possible causes:**
- No assessments in database
- API not returning data
- Frontend not parsing data

**Solutions:**
1. Generate sample assessments
2. Check API response in Network tab
3. Check console for parsing errors

### Issue: KPIs show NaN or undefined
**Possible causes:**
- Invalid calculation
- Missing data fields
- Type mismatch

**Solutions:**
1. Check backend calculation logic
2. Verify assessment data structure
3. Check console for errors

---

## END OF CHECKLIST

**Total Test Points:** 35 (Critical: 5, Important: 5, Comprehensive: 25)  
**Time Required:** 10-15 minutes (full suite)  
**Quick Smoke Test:** 2 minutes (7 checks)

**Remember:** The Dashboard is a high-visibility feature. Thorough testing ensures a great user experience!

