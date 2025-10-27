# Sample Assessment Generator

## Overview
The sample assessment generator creates realistic, randomized assessments for testing, demos, and stakeholder presentations. It generates assessments with authentic-looking data that respects all validation rules and maturity frameworks.

---

## How to Use

### Frontend (User Interface)

1. **Navigate to Home Page**
   - Open the Databricks Maturity Assessment application
   - Click on the **"Try Sample Assessment"** button

2. **Select Completion Level**
   - **🎯 Full Assessment**: All 6 pillars completed (~60 questions answered)
   - **⚡ Partial Assessment**: 3-4 pillars completed
   - **🔍 Minimal Assessment**: 1-2 pillars completed

3. **Automatic Actions**
   - Assessment is generated with random company name
   - Random responses for current/future states (respects future >= current)
   - Random pain points selected
   - Realistic comments added
   - Automatically navigates to results page
   - All results (pillar, overall, executive summary) are immediately available

---

### Backend API

**Endpoint:** `POST /api/assessment/generate-sample`

**Request Body:**
```json
{
  "completionLevel": "full",  // 'full', 'partial', or 'minimal'
  "specificPillars": null      // Optional: array of pillar IDs
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sample assessment generated successfully",
  "assessment": {
    "id": "uuid-here",
    "name": "Acme Corporation - Maturity Assessment",
    "organizationName": "Acme Corporation",
    "status": "completed",  // or "in_progress"
    "completedAreas": ["platform_governance", "data_engineering", ...],
    "totalResponses": 120
  }
}
```

---

## Data Generation Details

### Current/Future State Selection
- **Current State**: Weighted towards levels 2-3 (Experiment/Formalize)
  - Level 1 (Explore): 5%
  - Level 2 (Experiment): 30%
  - Level 3 (Formalize): 40%
  - Level 4 (Optimize): 20%
  - Level 5 (Transform): 5%

- **Future State**: Always >= Current State
  - Gap of 0-2 levels (most common)
  - 15% chance of aiming for Level 5 (Transform) if current >= 3

### Pain Points
- Technical pain points: 60% probability per option
- Business pain points: 50% probability per option
- Realistic combinations selected randomly

### Comments
- 70% of questions get comments
- Comments reference current/future levels
- Include timeframes and strategic language

### Company Names
Randomly selected from:
- Acme Corporation
- Global Tech Industries
- Innovation Labs
- DataCorp Analytics
- Enterprise Solutions Inc
- TechVentures Group
- NextGen Systems
- Digital Transformation Co
- CloudScale Enterprises
- AI Innovations Inc

---

## Use Cases

### 1. **Quick Demos**
Generate a full sample assessment to show stakeholders:
```bash
# Click "Try Sample Assessment" → "Full Assessment"
# Immediately view results, pillar details, and executive summary
```

### 2. **Testing**
Test all result pages with different completion levels:
```bash
# Minimal: Tests partial assessment handling
# Partial: Tests mixed pillar display
# Full: Tests complete assessment flow
```

### 3. **Performance Testing**
Generate multiple assessments for load testing:
```bash
curl -X POST http://localhost:5000/api/assessment/generate-sample \
  -H "Content-Type: application/json" \
  -d '{"completionLevel": "full"}'
```

### 4. **Stakeholder Presentations**
Show realistic outputs without revealing real data:
```bash
# Full assessment with realistic scores
# Professional-looking results
# Redacted company names for privacy
```

---

## Validation Rules

All generated assessments respect:
✅ Future state >= Current state (enforced during generation)
✅ Numeric values 1-5 (valid maturity levels)
✅ Pain points selected from valid option lists
✅ Pillar completion tracking
✅ Response key naming conventions

---

## Testing

### Automated Test
Run the included test script:
```bash
cd databricks-maturity-assessment
node test-sample-generator.js
```

### Manual Test
1. Start local server: `npm start`
2. Open browser to `http://localhost:3000`
3. Click "Try Sample Assessment"
4. Select completion level
5. Verify results page displays correctly
6. Check pillar results pages
7. Check executive summary

---

## Technical Details

### Files Modified/Created
- **`server/utils/sampleAssessmentGenerator.js`** (NEW)
  - Core generation logic
  - Random data with realistic weights
  - Validation enforcement

- **`server/index.js`**
  - New endpoint: `/api/assessment/generate-sample`
  - Saves assessment to storage
  - Returns assessment metadata

- **`client/src/services/assessmentService.js`**
  - New method: `generateSampleAssessment()`
  - API integration

- **`client/src/components/HomePage.js`**
  - "Try Sample Assessment" button
  - Dropdown menu for completion levels
  - Navigation to results after generation

### Architecture
```
User clicks button
    ↓
Frontend calls API
    ↓
Backend: sampleAssessmentGenerator.generateSampleAssessment()
    ↓
Random responses generated (respecting validation)
    ↓
Assessment saved to storage
    ↓
Assessment ID returned
    ↓
Frontend navigates to /results/:id
    ↓
OpenAI generates fresh content
    ↓
Results displayed
```

---

## Future Enhancements

Potential additions:
- [ ] Specific pillar selection from UI
- [ ] Custom company name input
- [ ] Export sample data as JSON
- [ ] Bulk generation (create 10 samples at once)
- [ ] Seed-based generation for reproducible samples
- [ ] Industry-specific templates

---

## Notes

- Generated assessments are saved to storage (PostgreSQL or file-based)
- Each generation creates a unique assessment ID
- Results are calculated using the same logic as real assessments
- OpenAI content generation works identically to real assessments
- Sample assessments can be deleted like regular assessments

---

**Version:** 1.0
**Created:** October 17, 2025
**Dependencies:** 
- Backend: `uuid` package
- Frontend: `react-hot-toast`, `framer-motion`




