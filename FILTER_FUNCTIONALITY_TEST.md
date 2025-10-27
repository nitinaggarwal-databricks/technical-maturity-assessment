# Filter Functionality Test Checklist

## Test Date: October 27, 2025
## Feature: Past Assessments Page - Complete Filter Implementation

---

## 🎯 PILLAR FILTER

### Test 1: Pillar Dropdown Population
- [ ] Navigate to Past Assessments page
- [ ] Click on "All pillars" dropdown
- [ ] Verify all 6 pillars are listed:
  - Platform & Governance
  - Data Engineering
  - Analytics & BI
  - ML & MLOps
  - GenAI & Agentic
  - Operational Excellence

### Test 2: Pillar Filter Functionality
- [ ] Select "Platform & Governance"
- [ ] Verify only assessments with Platform & Governance completed are shown
- [ ] Select "Data Engineering"
- [ ] Verify only assessments with Data Engineering completed are shown
- [ ] Select "All pillars"
- [ ] Verify all assessments are shown again

### Test 3: Pillar Filter with Other Filters
- [ ] Set status to "In Progress"
- [ ] Set pillar to "ML & MLOps"
- [ ] Verify only in-progress assessments with ML & MLOps completed are shown
- [ ] Clear filters and verify all assessments return

---

## 👤 OWNER FILTER

### Test 4: Owner Dropdown Population
- [ ] Click on "All owners" dropdown
- [ ] Verify dropdown shows unique list of all assessment owners
- [ ] Verify owner names are extracted from email (before @ symbol)

### Test 5: Owner Filter Functionality
- [ ] Select first owner from dropdown
- [ ] Verify only that owner's assessments are shown
- [ ] Select different owner
- [ ] Verify only that owner's assessments are shown
- [ ] Select "All owners"
- [ ] Verify all assessments are shown again

---

## 🎛️ MORE FILTERS

### Test 6: More Filters Toggle
- [ ] Click "More filters" button
- [ ] Verify panel expands with smooth animation
- [ ] Verify panel shows:
  - Industry dropdown
  - Completion Range dropdown
  - Clear All Filters button
- [ ] Click "More filters" again
- [ ] Verify panel collapses with smooth animation

### Test 7: Industry Filter
- [ ] Expand "More filters"
- [ ] Click "Industry" dropdown
- [ ] Verify dropdown shows unique list of industries from assessments
- [ ] Select an industry
- [ ] Verify only assessments from that industry are shown
- [ ] Select "All industries"
- [ ] Verify all assessments are shown

### Test 8: Completion Range Filter
- [ ] Expand "More filters"
- [ ] Select "0-25%" completion range
- [ ] Verify only assessments with 0-25% progress are shown
- [ ] Select "26-50%"
- [ ] Verify only assessments with 26-50% progress are shown
- [ ] Select "51-75%"
- [ ] Verify only assessments with 51-75% progress are shown
- [ ] Select "76-100%"
- [ ] Verify only assessments with 76-100% progress are shown
- [ ] Select "All ranges"
- [ ] Verify all assessments are shown

### Test 9: Clear All Filters Button
- [ ] Set multiple filters:
  - Search: "test"
  - Status: "In Progress"
  - Pillar: "Data Engineering"
  - Owner: Select any owner
  - Industry: Select any industry
  - Completion Range: "26-50%"
- [ ] Verify filtered results are shown
- [ ] Click "Clear All Filters" button
- [ ] Verify ALL filters are reset:
  - Search box is empty
  - Status is "All"
  - Pillar is "All pillars"
  - Owner is "All owners"
  - Industry is "All industries"
  - Completion Range is "All ranges"
- [ ] Verify all assessments are shown

---

## 🔍 COMBINED FILTER TESTS

### Test 10: Multiple Filters Together
- [ ] Set Status: "In Progress"
- [ ] Set Pillar: "Platform & Governance"
- [ ] Set Owner: Select any owner
- [ ] Verify only in-progress assessments with Platform & Governance completed by that owner are shown
- [ ] Add Industry filter
- [ ] Verify results are further narrowed
- [ ] Add Completion Range filter
- [ ] Verify results are further narrowed
- [ ] Remove filters one by one and verify results expand accordingly

### Test 11: Search with Filters
- [ ] Enter search term
- [ ] Set Pillar filter
- [ ] Verify results match both search AND pillar filter
- [ ] Set Owner filter
- [ ] Verify results match search AND pillar AND owner
- [ ] Clear search
- [ ] Verify pillar and owner filters still active

### Test 12: No Results Scenario
- [ ] Set filters that would return no results (e.g., specific pillar + specific owner that don't overlap)
- [ ] Verify "0 assessments found" is displayed
- [ ] Verify no assessment cards are shown
- [ ] Verify filters remain active
- [ ] Clear filters and verify assessments return

---

## 📱 RESPONSIVE TESTS

### Test 13: Mobile View (< 768px)
- [ ] Resize browser to mobile width
- [ ] Verify filter dropdowns stack vertically
- [ ] Verify "More filters" button is accessible
- [ ] Verify expanded "More filters" panel is readable
- [ ] Test all filters work on mobile

### Test 14: Tablet View (768px - 1024px)
- [ ] Resize browser to tablet width
- [ ] Verify filter layout adapts appropriately
- [ ] Test all filters work on tablet

---

## 🎨 UI/UX TESTS

### Test 15: Visual Feedback
- [ ] Verify selected filter values are visible in dropdowns
- [ ] Verify "More filters" button shows ▼ when collapsed
- [ ] Verify "More filters" button shows ▲ when expanded
- [ ] Verify smooth animations when expanding/collapsing
- [ ] Verify no layout shifts when toggling "More filters"

### Test 16: Filter Persistence
- [ ] Set multiple filters
- [ ] Navigate to an assessment
- [ ] Use browser back button to return to Past Assessments
- [ ] Verify filters are cleared (expected behavior for fresh page load)

---

## 🐛 EDGE CASES

### Test 17: Empty Data
- [ ] Test filters when no assessments exist
- [ ] Verify dropdowns show only default options
- [ ] Verify no errors in console

### Test 18: Special Characters
- [ ] Test search with special characters
- [ ] Test owner names with special characters
- [ ] Verify no crashes or errors

### Test 19: Very Long Lists
- [ ] If many unique owners/industries exist, verify dropdowns are scrollable
- [ ] Verify performance is acceptable

---

## ✅ ACCEPTANCE CRITERIA

All tests must pass for feature to be considered complete:

- [ ] All pillar filter tests pass (Tests 1-3)
- [ ] All owner filter tests pass (Tests 4-5)
- [ ] All more filters tests pass (Tests 6-9)
- [ ] All combined filter tests pass (Tests 10-12)
- [ ] All responsive tests pass (Tests 13-14)
- [ ] All UI/UX tests pass (Tests 15-16)
- [ ] All edge case tests pass (Tests 17-19)
- [ ] No console errors
- [ ] No visual glitches
- [ ] Smooth animations
- [ ] Fast performance (< 1s filter response)

---

## 🚀 DEPLOYMENT VERIFICATION

After deployment to production:

1. [ ] Clear browser cache
2. [ ] Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
3. [ ] Run all tests above on production URL
4. [ ] Verify with real production data
5. [ ] Test on multiple browsers:
   - [ ] Chrome
   - [ ] Safari
   - [ ] Firefox
   - [ ] Edge

---

## 📊 TEST RESULTS

**Tester:** _________________  
**Date:** _________________  
**Environment:** _________________  
**Result:** ☐ PASS  ☐ FAIL  

**Notes:**



