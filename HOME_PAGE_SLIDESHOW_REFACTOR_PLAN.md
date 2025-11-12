# Home Page Slideshow & Print Refactor Plan

## Objective
Replace the current HomePageNew slideshow implementation with the same pattern used in AssessmentResultsNew for consistency and better UX.

## Current State
- 3 slides: Hero, Why & How, Pillars
- White background slides
- Bottom navigation bar
- No print functionality
- Simple slide transitions

## Target State (Match AssessmentResultsNew)
- Blue gradient background: `linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)`
- Hover navigation buttons on left/right sides
- Click areas for navigation (left 50% = previous, right 50% = next)
- Slide heading at top left
- Slide counter at bottom right
- Exit button at top right
- Full print support with `@media print` rules
- Proper ESC key handling

## Implementation Steps

### 1. Update Styled Components (Lines 678-852)

**Replace:**
- `SlideshowOverlay` → Remove, use `SlideContainer` directly
- `SlideContainer` → Update to fixed positioning with blue gradient
- `SlideContent` → Update padding and remove white background
- `SlideNavigation` → Remove bottom navigation bar
- `NavButton` → Replace with `NavigationButton` (hover buttons)
- `SlideCounter` → Move to bottom right, absolute positioning
- `ExitButton` → Move to top right, update styling

**Add:**
- `PrintSlide` → For print media queries
- `SlideHeading` → Top left heading
- `ClickArea` → Left/right click zones
- `NavigationButton` → Hover buttons with proper styling

### 2. Update Component Logic (Lines 858-931)

**Current:**
```javascript
const [presentationMode, setPresentationMode] = useState(false);
const [currentSlide, setCurrentSlide] = useState(0);
```

**Add:**
```javascript
const [isSlideshow, setIsSlideshow] = useState(false);
const [currentSlide, setCurrentSlide] = useState(0);
const totalSlides = 3;
```

**Update handlers:**
- `startPresentation()` → `startSlideshow()`
- `exitPresentation()` → `exitSlideshow()`
- Add click area handlers
- Add auto-exit on last slide forward navigation
- Improve ESC key handling

### 3. Update Slideshow JSX (Lines 1462-1741)

**Current Structure:**
```jsx
<SlideshowOverlay>
  <ExitButton />
  <SlideContainer>
    <SlideContent>
      {/* Slide content */}
    </SlideContent>
  </SlideContainer>
  <SlideNavigation>
    <NavButton />
    <SlideCounter />
    <NavButton />
  </SlideNavigation>
</SlideshowOverlay>
```

**New Structure:**
```jsx
<AnimatePresence>
  {isSlideshow && (
    <SlideContainer>
      <SlideHeading>Databricks Maturity Assessment</SlideHeading>
      <SlideCounter>{currentSlide + 1} / {totalSlides}</SlideCounter>
      
      <ClickArea $direction="left" onClick={previousSlide} />
      <ClickArea $direction="right" onClick={nextSlide} />
      
      <NavigationButton 
        $direction="left" 
        onClick={previousSlide}
        disabled={currentSlide === 0}
      >
        <FiChevronLeft />
      </NavigationButton>
      
      <NavigationButton 
        $direction="right" 
        onClick={currentSlide === totalSlides - 1 ? exitSlideshow : nextSlide}
        disabled={false}
      >
        <FiChevronRight />
      </NavigationButton>
      
      <ExitButton onClick={exitSlideshow}>×</ExitButton>
      
      <SlideContent>
        {/* Slide content */}
      </SlideContent>
    </SlideContainer>
  )}
</AnimatePresence>
```

### 4. Add Print Functionality

**Add Print Slides (after main content, before closing PageContainer):**
```jsx
{/* Print-only slides */}
<div style={{ display: 'none' }}>
  <PrintSlide>
    <SlideHeading>Databricks Maturity Assessment</SlideHeading>
    {/* Slide 1 content */}
  </PrintSlide>
  <PrintSlide>
    <SlideHeading>Why Take This Assessment?</SlideHeading>
    {/* Slide 2 content */}
  </PrintSlide>
  <PrintSlide>
    <SlideHeading>Assessment Pillars</SlideHeading>
    {/* Slide 3 content */}
  </PrintSlide>
</div>
```

**Add Print Button:**
```jsx
<PrintButton onClick={() => window.print()}>
  <FiPrinter />
  Print / Save PDF
</PrintButton>
```

### 5. Update Slide Content Styling

**For each slide:**
- Remove white backgrounds
- Use white text color
- Add proper spacing for blue gradient background
- Ensure cards/content are visible on blue background
- Update Grid and Card components for slideshow context

### 6. Test Checklist

- [ ] Slideshow opens with blue gradient background
- [ ] Left/right click areas work
- [ ] Hover navigation buttons appear and work
- [ ] ESC key exits slideshow
- [ ] Slide counter shows correct numbers
- [ ] Exit button works
- [ ] Last slide forward button exits slideshow
- [ ] Print button opens print dialog
- [ ] Print preview shows all 3 slides correctly
- [ ] Print has blue gradient backgrounds
- [ ] Print has no navigation buttons/counters
- [ ] Responsive design works on mobile

## Files to Modify

1. `/client/src/components/HomePageNew.js` (1747 lines)
   - Lines 678-852: Styled components
   - Lines 858-931: Component logic
   - Lines 1454-1741: Slideshow JSX

## Estimated Changes

- ~200 lines of styled components
- ~50 lines of logic
- ~300 lines of JSX
- Total: ~550 lines modified/added

## Dependencies

- Already imported: `motion`, `AnimatePresence`, `FiChevronLeft`, `FiChevronRight`, `FiX`
- Need to add: `FiPrinter` (for print button)

## Risks

- Large file (1747 lines) - careful search/replace needed
- Multiple slide content sections to update
- Print CSS needs thorough testing
- Responsive design considerations

## Next Steps

1. Backup current implementation
2. Update styled components section by section
3. Update component logic
4. Update slideshow JSX
5. Add print functionality
6. Test thoroughly
7. Commit and push

## Reference Implementation

See `/client/src/components/AssessmentResultsNew.js` lines 1384-2000 for the target pattern.


