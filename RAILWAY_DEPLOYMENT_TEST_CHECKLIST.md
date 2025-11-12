# Railway Deployment Testing Checklist

## Deployment Information
- **Branch:** main
- **Last Commit:** `1497058` - "fix: Hide role switching options when admin is already in normal mode"
- **Railway URL:** [Your Railway URL]
- **Date:** November 12, 2025

---

## Pre-Testing Setup

### 1. Verify Deployment Status
- [ ] Railway build completed successfully
- [ ] Railway deployment is live
- [ ] Health check endpoint responding: `/api/health`
- [ ] No build errors in Railway logs

### 2. Environment Variables Check
- [ ] `DATABASE_URL` configured
- [ ] `PORT` set (default: 5001)
- [ ] `NODE_ENV=production`
- [ ] `SENDGRID_API_KEY` configured (optional for email)
- [ ] `SENDER_EMAIL` configured (optional for email)

---

## Critical Bug Fixes Testing

### ✅ Fix #1: Assessment Start Endpoint (500 Error)
**Issue:** `/api/assessment/start` returned 500 error due to undefined `assessment.currentCategory`

**Test Steps:**
1. [ ] Navigate to home page
2. [ ] Click "Try Sample" button
3. [ ] Verify no 500 error in console
4. [ ] Verify redirects to assessment questions page
5. [ ] Verify assessment ID is generated

**Expected:** Assessment creates successfully, no errors

---

### ✅ Fix #2: Dashboard toFixed() Error
**Issue:** Dashboard crashed with `Cannot read properties of undefined (reading 'toFixed')`

**Test Steps:**
1. [ ] Login as admin
2. [ ] Navigate to Dashboard (`/insights-dashboard`)
3. [ ] Verify dashboard loads without errors
4. [ ] Check browser console for any `toFixed()` errors
5. [ ] Verify all metrics display correctly
6. [ ] Verify pillar breakdown chart renders

**Expected:** Dashboard loads completely, all metrics visible, no console errors

---

### ✅ Fix #3: View Report Button Logic
**Issue:** "View Report" enabled for 0% progress assessments

**Test Steps:**
1. [ ] Navigate to "All Assessments" page
2. [ ] Find an assessment with 0% progress or "Not Started" status
3. [ ] Verify "View Report" button is **disabled** (grayed out)
4. [ ] Hover over button to see tooltip: "Complete at least one pillar to view report"
5. [ ] Try clicking - should not navigate
6. [ ] Find an assessment with >0% progress
7. [ ] Verify "View Report" button is **enabled**
8. [ ] Click and verify navigates to results page

**Expected:** Button disabled for 0%, enabled for >0%

---

### ✅ Fix #4: Admin Role Switching
**Issue:** Admin dropdown showed both "Switch to Author/Consumer" AND "Switch Back to Admin" simultaneously

**Test Steps:**
1. [ ] Login as admin@databricks.com
2. [ ] Click on Admin dropdown (top right)
3. [ ] Verify shows: "Switch to Author", "Switch to Consumer", "Change Password", "Logout"
4. [ ] Verify does NOT show "Switch Back to Admin"
5. [ ] Click "Switch to Author"
6. [ ] Verify page reloads with Author role
7. [ ] Click Admin dropdown again
8. [ ] Verify shows: "Switch Back to Admin", "Change Password", "Logout"
9. [ ] Verify does NOT show "Switch to Author/Consumer"
10. [ ] Click "Switch Back to Admin"
11. [ ] Verify returns to Admin role

**Expected:** Only relevant role switching options shown based on current mode

---

### ✅ Fix #5: Dashboard Button Position
**Issue:** Dashboard button was after Assessments dropdown

**Test Steps:**
1. [ ] Login as admin or author
2. [ ] Look at navigation header
3. [ ] Verify order is: **Dashboard** → Assessments → Assignments → User
4. [ ] Verify Dashboard button is before Assessments dropdown

**Expected:** Dashboard button appears first in navigation

---

## Core Functionality Testing

### 🔐 Authentication & Authorization

#### Admin Login
- [ ] Navigate to home page
- [ ] Click "Login" button
- [ ] Enter admin credentials
- [ ] Verify successful login
- [ ] Verify redirects to appropriate page
- [ ] Verify "Admin" displayed in header

#### Author Login
- [ ] Logout from admin
- [ ] Login with author credentials
- [ ] Verify limited navigation (no "Manage Users")
- [ ] Verify "Author" displayed in header

#### Consumer Login
- [ ] Logout from author
- [ ] Login with consumer credentials
- [ ] Verify very limited navigation (only "Start Assessment", "My Assessments")
- [ ] Verify "Dashboard" and "Try Sample" are hidden
- [ ] Verify "Consumer" displayed in header

---

### 📊 Assessment Creation & Management

#### Create Assessment via "Try Sample"
1. [ ] Login as admin
2. [ ] Click "Try Sample"
3. [ ] Verify "Generating Report" popup appears
4. [ ] Wait for completion
5. [ ] Verify redirects to results page (not questions page)
6. [ ] Verify assessment appears in "All Assessments"
7. [ ] Verify assessment has sample data

#### Create Assessment via "Start Assessment"
1. [ ] Click "Start Assessment"
2. [ ] Fill in organization details
3. [ ] Submit form
4. [ ] Verify redirects to questions page
5. [ ] Verify assessment appears in "All Assessments" with 0% progress

#### View All Assessments
1. [ ] Navigate to "Assessments" → "All Assessments"
2. [ ] Verify all assessments are listed
3. [ ] Verify each card shows:
   - [ ] Assessment name
   - [ ] Organization name
   - [ ] Industry
   - [ ] Creator name (not "Unknown")
   - [ ] Created date
   - [ ] Updated date
   - [ ] Status badge
   - [ ] Progress percentage
4. [ ] Verify action buttons: Edit, Clone, Delete, View Report

---

### 👥 User Management (Admin Only)

#### View All Users
1. [ ] Login as admin
2. [ ] Navigate to "Assignments" → "Manage Users"
3. [ ] Verify all users are displayed
4. [ ] Verify can see admins, authors, and consumers

#### Create Test User
1. [ ] Click "Create Test User" button
2. [ ] Verify user is created with default consumer role
3. [ ] Verify user appears in list

#### Edit User Role
1. [ ] Find a consumer user
2. [ ] Click edit
3. [ ] Change role to "Author"
4. [ ] Save
5. [ ] Verify role is updated and reflected in list

---

### 📋 Assignment Workflow

#### Assign Assessment to Consumer
1. [ ] Login as admin or author
2. [ ] Navigate to "Assignments" → "Assign Users"
3. [ ] Select or create new assessment
4. [ ] Select or create new consumer
5. [ ] Click "Assign"
6. [ ] Verify success message
7. [ ] Verify assignment appears in "Assignments" page

#### Consumer Receives Assignment
1. [ ] Login as the assigned consumer
2. [ ] Navigate to "My Assessments"
3. [ ] Verify assigned assessment is visible
4. [ ] Verify shows "Assigned to: [Consumer Name]"
5. [ ] Verify "Start Assessment" button is enabled

#### Consumer Completes Assessment
1. [ ] Click "Start Assessment"
2. [ ] Navigate to first pillar
3. [ ] Answer questions
4. [ ] Mark pillar as complete
5. [ ] Verify progress updates (17%)
6. [ ] Complete all 6 pillars
7. [ ] Verify progress shows 100%
8. [ ] Submit assessment

#### Author/Admin Reviews & Releases
1. [ ] Login as author/admin
2. [ ] Navigate to "Assignments"
3. [ ] Find submitted assessment
4. [ ] Verify status shows "Submitted"
5. [ ] Click "Review" (if available)
6. [ ] Click "Release"
7. [ ] Verify status changes to "Released"

#### Consumer Views Results
1. [ ] Login as consumer
2. [ ] Navigate to "My Assessments"
3. [ ] Verify status shows "Results Available"
4. [ ] Click "View Results"
5. [ ] Verify can access all report pages

---

### 📈 Reports & Visualizations

#### Maturity Report
1. [ ] Open an assessment with data
2. [ ] Click "View Report"
3. [ ] Verify report loads without errors
4. [ ] Check all sections:
   - [ ] Executive summary
   - [ ] Overall maturity score
   - [ ] Maturity snapshot chart
   - [ ] All 6 pillar sections
   - [ ] Each pillar shows: What's Working, Key Challenges, Recommendations
5. [ ] Test "Slideshow" button
6. [ ] Test "Print / Save PDF" button

#### Executive Command Center
1. [ ] Navigate to Executive Command Center
2. [ ] Verify loads without errors
3. [ ] Check all sections present
4. [ ] Test slideshow functionality
5. [ ] Test print functionality

#### Deep Dive
1. [ ] Navigate to Deep Dive page
2. [ ] Verify loads without errors
3. [ ] Check all sections present
4. [ ] Test slideshow functionality
5. [ ] Test print functionality

#### Industry Benchmarking
1. [ ] Navigate to Industry Benchmarking
2. [ ] Verify loads without errors
3. [ ] Check all sections present
4. [ ] Test slideshow functionality
5. [ ] Test print functionality

#### Insights Dashboard
1. [ ] Navigate to Insights Dashboard
2. [ ] Verify all metrics load
3. [ ] Verify charts render correctly
4. [ ] Test slideshow button (bottom left)

---

### 🖨️ Print Functionality

#### Print Maturity Report
1. [ ] Open any assessment report
2. [ ] Click "Print / Save PDF"
3. [ ] Verify print dialog opens
4. [ ] Check print preview:
   - [ ] Background graphics enabled
   - [ ] Headers and footers disabled
   - [ ] One slide per page
   - [ ] All content visible
   - [ ] No text cutoff
   - [ ] No blank pages after last slide
   - [ ] Blue gradient backgrounds visible
5. [ ] Save as PDF
6. [ ] Open PDF and verify quality

#### Test Print for All Reports
- [ ] Maturity Report
- [ ] Executive Command Center
- [ ] Deep Dive
- [ ] Industry Benchmarking

---

### 🎬 Slideshow Functionality

#### Test Slideshow Navigation
1. [ ] Open any report
2. [ ] Click "Slideshow" button
3. [ ] Verify:
   - [ ] Blue gradient background appears
   - [ ] Slide heading visible at top left
   - [ ] Slide counter visible at bottom right
   - [ ] Exit button visible at top right
   - [ ] Hover navigation buttons appear on left/right
4. [ ] Test navigation:
   - [ ] Click right button → advances to next slide
   - [ ] Click left button → goes to previous slide
   - [ ] Press → arrow key → advances
   - [ ] Press ← arrow key → goes back
   - [ ] Press ESC → exits slideshow
   - [ ] Click exit button → exits slideshow
5. [ ] On last slide:
   - [ ] Click right button → exits slideshow
   - [ ] Verify returns to normal view

#### Test Slideshow Content
1. [ ] Go through all slides
2. [ ] Verify all content is visible
3. [ ] Verify no text cutoff
4. [ ] Verify charts/images render correctly
5. [ ] Verify white text on blue background is readable

---

## Data Integrity Tests

### PostgreSQL Data Persistence
1. [ ] Create new assessment
2. [ ] Add responses to questions
3. [ ] Note the assessment ID
4. [ ] Restart Railway service (if possible)
5. [ ] Navigate back to assessment
6. [ ] Verify all data is still present
7. [ ] Verify responses are saved

### Assessment Progress Calculation
1. [ ] Start new assessment
2. [ ] Complete 1 of 6 pillars
3. [ ] Verify shows 17% progress
4. [ ] Complete 2 of 6 pillars
5. [ ] Verify shows 33% progress
6. [ ] Complete 3 of 6 pillars
7. [ ] Verify shows 50% progress
8. [ ] Complete all 6 pillars
9. [ ] Verify shows 100% progress

### Assessment ID Routing
1. [ ] Create 3 assessments with different progress (33%, 67%, 100%)
2. [ ] Navigate to first assessment (33%)
3. [ ] Verify correct data loads
4. [ ] Navigate to second assessment (67%)
5. [ ] Verify correct data loads (not cached from first)
6. [ ] Navigate back to first assessment
7. [ ] Verify still shows 33% (not 67%)

---

## Error Handling Tests

### Invalid Assessment ID
1. [ ] Navigate to `/results/invalid-id-12345`
2. [ ] Verify shows "Assessment not found" error
3. [ ] Verify doesn't crash

### Expired Session
1. [ ] Login
2. [ ] Wait for session timeout (or clear session manually)
3. [ ] Try to access protected route
4. [ ] Verify redirects to login
5. [ ] Verify shows appropriate message

### Network Interruption
1. [ ] Start answering assessment questions
2. [ ] Disable network
3. [ ] Try to save answer
4. [ ] Verify shows error message
5. [ ] Re-enable network
6. [ ] Verify auto-save resumes

---

## Performance Tests

### Page Load Times
- [ ] Home page: < 2 seconds
- [ ] Dashboard: < 3 seconds
- [ ] Assessment questions: < 2 seconds
- [ ] Report generation: < 5 seconds

### Auto-Save Performance
1. [ ] Answer questions rapidly
2. [ ] Verify no duplicate saves
3. [ ] Verify no race conditions
4. [ ] Check network tab for reasonable request frequency

---

## Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Samsung Internet

### Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## Known Issues to Verify Fixed

### ✅ Previously Reported Issues
1. [ ] "Try Sample" no longer causes 500 error
2. [ ] Dashboard no longer crashes with toFixed() error
3. [ ] "View Report" disabled for 0% assessments
4. [ ] Admin dropdown no longer shows duplicate options
5. [ ] Assessment routing no longer loads wrong data
6. [ ] Progress percentage displays correctly
7. [ ] All assessments show in "All Assessments" page (not just file storage)
8. [ ] PostgreSQL is primary storage (no file storage dependencies)

---

## Post-Testing Actions

### If All Tests Pass ✅
- [ ] Document any minor issues found
- [ ] Create tickets for enhancements
- [ ] Proceed with Home Page slideshow refactoring
- [ ] Plan next feature development

### If Critical Issues Found ❌
- [ ] Document all issues with screenshots
- [ ] Create detailed bug reports
- [ ] Prioritize fixes (P0, P1, P2)
- [ ] Fix critical issues before proceeding
- [ ] Re-test after fixes

---

## Testing Notes

**Tester:**  
**Date:**  
**Railway URL:**  
**Build Version:**  

**Issues Found:**
1. 
2. 
3. 

**Overall Status:** ⬜ Pass | ⬜ Pass with Minor Issues | ⬜ Fail

**Next Steps:**

