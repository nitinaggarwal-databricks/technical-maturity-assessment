# Databricks Maturity Assessment - Navigation Map

## 🎯 Navigation Philosophy
**Every page should allow users to navigate to any key destination with ONE click.**

---

## 📍 Current Navigation Structure

### Global Navigation (Available on ALL pages)
Located at top: `GlobalNav` component (fixed position)
- **Logo** → Home Page
- **Why Assessment** → Home Page #why-section
- **Explore Framework** → Framework explanation
- **How It Works** → Home Page #how-section
- **Past Assessments** → Assessments List

---

## 🗺️ Page-by-Page Navigation

### 1. Home Page (`/`)
**Available Actions:**
- ✅ Start New Assessment → `/start`
- ✅ Generate Sample (Full/Partial/Minimal) → Auto-opens assessment
- ✅ Past Assessments → `/assessments`
- ✅ Explore Framework → Pillar details
- ✅ Global Nav (Why, How It Works, etc.)

**Status:** ✅ Excellent - all key actions available

---

### 2. Assessment Start (`/start`)
**Available Actions:**
- ✅ Fill organization details
- ✅ Begin assessment → First pillar
- ✅ Global Nav

**Needs:**
- 🔧 "Back to Home" button
- 🔧 "Load Existing Assessment" option

---

### 3. Assessment Questions (`/assessment/:assessmentId/:categoryId`)
**Current Navigation:**
- ✅ Left Sidebar (NavigationPanel):
  - All 6 pillars (collapsible)
  - Dimensions within each pillar
  - Individual Pillar Results buttons (6) - **ENABLED ONLY if pillar completed**
  - Overall Results button - **ENABLED if any pillar completed**
  - Executive Summary button
- ✅ Edit Assessment (top of sidebar)
- ✅ Question filters (All, Completed, Not Started, Without Notes)
- ✅ Next/Back navigation
- ✅ Auto-save status
- ✅ Global Nav

**KEY ISSUE:** 🚨 **When sample assessment is generated, pillar result links may not be enabled immediately**

**Status:** ⚠️ Needs verification that `completedCategories` is properly refreshed

---

### 4. Individual Pillar Results (`/pillar-results/:assessmentId/:categoryId`)
**Current Navigation:**
- ✅ AssessmentHeader:
  - Export to Excel
  - Edit Assessment
  - Questions tab
  - Overall Results tab
  - Executive Summary tab
- ✅ NEW: Pillar Navigation Bar (Jump to other pillar results)
- ✅ "Edit This Pillar" button → Back to questions
- ✅ "Continue to Next Pillar" button (if next exists) → Next pillar questions
- ✅ "View Overall Results" button → Overall results page
- ✅ Global Nav

**Status:** ✅ Excellent - comprehensive navigation

---

### 5. Overall Results (`/results/:assessmentId`)
**Current Navigation:**
- ✅ AssessmentHeader:
  - Export to Excel
  - Export PDF
  - Edit Assessment
  - Questions tab
  - Executive Summary tab
- ✅ Global Nav

**Needs:**
- 🔧 Direct links to individual pillar results from each pillar card
- 🔧 "Edit Pillar" buttons for each pillar

---

### 6. Executive Summary (`/executive-summary/:assessmentId`)
**Current Navigation:**
- ✅ AssessmentHeader:
  - Export to Excel
  - Export PDF
  - Edit Assessment
  - Questions tab
  - Overall Results tab
- ✅ Sidebar navigation
- ✅ Global Nav

**Status:** ✅ Good

---

### 7. Past Assessments List (`/assessments`)
**Current Navigation:**
- ✅ Search, filters, sort
- ✅ Open Assessment → Questions (first pillar)
- ✅ View Results → Overall Results
- ✅ Resume Assessment → Questions (current pillar)
- ✅ Clone Assessment
- ✅ Delete Assessment
- ✅ Global Nav

**Needs:**
- 🔧 Quick link to Executive Summary from each card
- 🔧 "View Pillar Results" dropdown for completed pillars

---

## 🚨 Critical Issues to Fix

### Issue 1: Sample Assessment Pillar Links Not Enabled
**Problem:** When generating a sample assessment, `completedCategories` is set in the backend, but the frontend NavigationPanel may not refresh to show enabled pillar result links.

**Solution:**
1. Ensure `completedCategories` is properly returned from `/api/assessment/:id/status`
2. Verify `currentAssessment` state is refreshed in App.js after sample generation
3. Add explicit reload/refresh after sample generation completes

---

### Issue 2: No Direct Pillar Results Links from Overall Results
**Problem:** Users viewing overall results cannot directly jump to individual pillar results.

**Solution:** Add "View [Pillar Name] Details" buttons to each pillar card in AssessmentResultsNew.js

---

### Issue 3: No "Home" in Global Nav
**Problem:** Users cannot easily return to home page from deep pages.

**Solution:** Add "Home" icon/link to GlobalNav (left side near logo)

---

## 🎯 Recommended Navigation Enhancements

### Priority 1: Fix Sample Assessment Links ✅
- Verify completedCategories is properly set
- Force NavigationPanel refresh
- Test thoroughly

### Priority 2: Add Pillar Links to Overall Results ✅
- Each pillar card → "View Details" button → Individual pillar results

### Priority 3: Add Home Link to GlobalNav ✅
- Logo clickable → Home
- Or add explicit "Home" link

### Priority 4: Add Pillar Results Links to Past Assessments ✅
- Dropdown or expandable section showing completed pillars
- Quick access to any pillar result

---

## ✅ Navigation Success Criteria

**A user should be able to:**
1. ✅ Go from any page to Home in 1 click
2. ✅ Go from any page to Past Assessments in 1 click (GlobalNav)
3. ✅ Go from Overall Results to any Individual Pillar Result in 1 click
4. ✅ Go from any Pillar Result to any other Pillar Result in 1 click
5. ✅ Go from any Pillar Result to Overall Results in 1 click
6. ✅ Go from any Pillar Result to Executive Summary in 1 click
7. ✅ Go from Questions to any completed Pillar Result in 1 click
8. 🚨 **CRITICAL:** Sample assessment should show all pillar result links enabled immediately

---

## 🔧 Implementation Tasks

1. [x] Add pillar navigation to Individual Pillar Results pages
2. [ ] Add "View Details" buttons to Overall Results pillar cards
3. [ ] Verify sample assessment completedCategories handling
4. [ ] Test full navigation flow end-to-end
5. [ ] Add loading states for navigation panel refresh
6. [ ] Add pillar results dropdown to Past Assessments cards

---

**Last Updated:** 2025-10-24
**Status:** In Progress


