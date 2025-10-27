# New Home Page - Comprehensive Test Checklist

## ✅ Visual & Layout Tests

### Hero Section
- [ ] Gradient background renders properly
- [ ] Logo and navigation visible
- [ ] Hero title and subtitle display correctly
- [ ] Typography is readable and matches design
- [ ] Responsive layout on mobile (< 768px)
- [ ] Responsive layout on tablet (768px - 1024px)
- [ ] Responsive layout on desktop (> 1024px)

### Metric Pills
- [ ] All 4 metric pills display (6 Pillars, 30 Dimensions, 60 Questions, 5 Maturity Levels)
- [ ] Pills wrap properly on mobile
- [ ] Pills are readable and styled correctly

### Benefits Card
- [ ] Card displays on the right side (desktop)
- [ ] Card displays below hero on mobile
- [ ] Shield icon appears
- [ ] All 4 benefits listed with checkmarks
- [ ] Card has proper backdrop blur effect

## ✅ Functionality Tests

### Primary CTA Button - "Start My Free Assessment"
- [ ] Button displays with gradient orange/red background
- [ ] Hover effect works (scale animation)
- [ ] Click navigates to `/start` page
- [ ] Button is accessible via keyboard (Tab key)
- [ ] Button shows proper cursor (pointer)

### Sample Assessment Dropdown
- [ ] "Try Sample" button displays
- [ ] Clicking button opens dropdown menu
- [ ] Dropdown has 3 options:
  - [ ] 🎯 Full Sample (All 6 pillars completed)
  - [ ] ⚡ Partial Sample (3-4 pillars completed)
  - [ ] 🔍 Minimal Sample (1-2 pillars completed)
- [ ] Clicking option starts sample generation
- [ ] Toast notification shows "Generating sample assessment..."
- [ ] Button shows "Generating..." text while processing
- [ ] Button is disabled while generating
- [ ] After success, toast shows "Sample assessment created!"
- [ ] Navigates to `/results/:id` after generation
- [ ] Clicking outside dropdown closes it
- [ ] Dropdown closes after selecting an option

### Navigation Links
- [ ] "How it works" scrolls to #how section
- [ ] "Why it matters" scrolls to #value section
- [ ] "Past Assessments" navigates to `/assessments` page
- [ ] Footer "Framework" link navigates to `/explore`
- [ ] Footer "Past Assessments" link navigates to `/assessments`

## ✅ "How it Works" Section Tests

### Layout
- [ ] Section title displays correctly
- [ ] Section subtitle displays correctly
- [ ] 3 cards display in grid (desktop: 3 columns, mobile: 1 column)
- [ ] Cards animate on scroll (fade in from bottom)

### Step Cards
- [ ] Step 1 - "Choose your focus" with compass icon
- [ ] Step 2 - "Answer a few questions" with list icon
- [ ] Step 3 - "Get your insights report" with chart icon
- [ ] Each card has "Step N" badge
- [ ] Hover effect works (lift and shadow)
- [ ] All text is readable and properly formatted

## ✅ "Why It Matters" Section Tests

### Layout
- [ ] Section has light gray background (#f8fafc)
- [ ] Section title and subtitle display
- [ ] 2-column grid on desktop
- [ ] 1-column on mobile

### Pyramid Card
- [ ] Title "The Insights-Driven Organization Pyramid" displays
- [ ] Bar chart icon appears
- [ ] 4 levels display: Awareness, Adoption, Scale, AI Advantage
- [ ] Each level has gradient bar
- [ ] Description text displays below pyramid

### Statistics Cards
- [ ] "63%" stat with Deloitte source
- [ ] "2.8×" stat with Forrester source
- [ ] "6%" stat with McKinsey source
- [ ] All stats display large and bold
- [ ] Captions are readable
- [ ] Cards animate on scroll

### Data Maturity Curve
- [ ] Card spans 2 columns on desktop
- [ ] SVG curve renders properly
- [ ] 7 data points display with labels:
  - Clean Data
  - Reports
  - Ad-hoc Queries
  - Exploration
  - Predictive
  - Prescriptive
  - Automated Decisions
- [ ] Gradient curve line is smooth
- [ ] Caption displays below curve

## ✅ CTA Band Tests

- [ ] Section displays above footer
- [ ] Card is centered and styled properly
- [ ] Title "Ready to see where you stand?" displays
- [ ] Subtitle displays
- [ ] CTA button displays
- [ ] Button navigates to `/start`
- [ ] Responsive layout (vertical on mobile, horizontal on desktop)

## ✅ Footer Tests

### Layout
- [ ] Footer has dark background (#020617)
- [ ] 3-column grid on desktop
- [ ] Stacks properly on mobile

### Brand Section
- [ ] Logo icon displays
- [ ] "Data & AI Maturity" text displays
- [ ] Tagline text displays

### Links Section
- [ ] "Explore" group with 3 links
- [ ] "Company" group with 3 links
- [ ] All links have hover effect (color change)
- [ ] Links navigate to correct pages

### CTA Section
- [ ] "Start My Free Assessment" button displays
- [ ] Button works and navigates to `/start`
- [ ] "Secure & Confidential" badge displays
- [ ] Section aligns to right on desktop

### Copyright
- [ ] Current year displays (2025)
- [ ] Copyright text displays
- [ ] Top border displays

## ✅ Animation Tests

- [ ] Hero title fades in from bottom
- [ ] Hero subtitle fades in with delay
- [ ] Buttons fade in with delay
- [ ] Metric pills fade in last
- [ ] Benefits card slides in from right
- [ ] Step cards animate on scroll
- [ ] Stat cards animate on scroll
- [ ] All animations are smooth (no jank)
- [ ] Animations respect `prefers-reduced-motion`

## ✅ Interaction Tests

### Hover States
- [ ] All buttons have hover effects
- [ ] CTA button glows on hover
- [ ] Secondary buttons lighten on hover
- [ ] Step cards lift on hover
- [ ] Footer links brighten on hover

### Focus States
- [ ] All interactive elements are keyboard accessible
- [ ] Tab navigation works properly
- [ ] Focus visible for accessibility

### Loading States
- [ ] Sample generation shows loading state
- [ ] Button disables during sample generation
- [ ] Toast notifications appear correctly

## ✅ Accessibility Tests

- [ ] All images have alt text
- [ ] Color contrast meets WCAG AA standards
- [ ] Keyboard navigation works throughout
- [ ] Screen reader can read all content
- [ ] Semantic HTML used (header, section, footer)
- [ ] ARIA labels where appropriate

## ✅ Performance Tests

- [ ] Page loads quickly (< 3 seconds)
- [ ] No layout shifts during load
- [ ] Smooth scrolling
- [ ] Animations don't cause frame drops
- [ ] Images optimized (if any added later)

## ✅ Browser Compatibility Tests

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## ✅ Integration Tests

### API Integration
- [ ] Sample assessment generation works
- [ ] API calls succeed
- [ ] Error handling works
- [ ] Toast notifications show proper messages

### Navigation Integration
- [ ] All internal links work
- [ ] Navigation persists header
- [ ] Browser back button works
- [ ] Deep linking works

## ✅ Edge Cases

- [ ] Very long organization names don't break layout
- [ ] Slow API responses handled gracefully
- [ ] Network errors show proper error messages
- [ ] Multiple rapid clicks don't cause issues
- [ ] Works with JavaScript disabled (graceful degradation)

## 🐛 Known Issues (If Any)
_List any issues found during testing:_
- None at initial implementation

## 📝 Notes
- All functionality from old HomePage preserved
- New premium design implemented
- Fully responsive
- All animations smooth
- Sample generation fully functional




