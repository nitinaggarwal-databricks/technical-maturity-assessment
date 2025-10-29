#!/bin/bash

echo "=== Creating Full Sample Assessment ==="
echo

# 1. Create assessment
echo "1. Creating assessment..."
CREATE_RESULT=$(curl -s -X POST http://localhost:5000/api/assessment/start \
  -H "Content-Type: application/json" \
  -d '{
    "assessmentName": "Full Test Sample",
    "organizationName": "Test Org",
    "industry": "Technology",
    "contactEmail": "test@example.com"
  }')

ASSESSMENT_ID=$(echo "$CREATE_RESULT" | python3 -c "import json, sys; data=json.load(sys.stdin); print(data.get('data', {}).get('assessmentId', ''))")

if [ -z "$ASSESSMENT_ID" ]; then
  echo "❌ Failed to create assessment"
  echo "$CREATE_RESULT"
  exit 1
fi

echo "✅ Assessment created: $ASSESSMENT_ID"
echo

# 2. Get framework
echo "2. Getting framework..."
FRAMEWORK=$(curl -s http://localhost:5000/api/assessment/framework)
echo "✅ Framework retrieved"
echo

# 3. Generate responses using Node.js
echo "3. Generating full responses..."
node << 'NODESCRIPT'
const framework = JSON.parse(process.env.FRAMEWORK);
const assessmentId = process.env.ASSESSMENT_ID;

const responses = {};
const completedCategories = [];

framework.assessmentAreas.forEach(area => {
  completedCategories.push(area.id);
  
  area.dimensions.forEach(dim => {
    dim.questions.forEach(q => {
      // Random scores
      const current = Math.floor(Math.random() * 3) + 2; // 2-4
      const future = Math.min(current + Math.floor(Math.random() * 2) + 1, 5); // current+1 to 5
      
      responses[`${q.id}_current_state`] = current;
      responses[`${q.id}_future_state`] = future;
      responses[`${q.id}_comment`] = `Testing ${q.question.substring(0, 30)}. Current state needs improvement.`;
      
      // Add pain points
      const techPain = q.perspectives?.find(p => p.id === 'technical_pain');
      if (techPain && techPain.options && techPain.options.length > 0) {
        const numPains = Math.min(Math.floor(Math.random() * 3) + 1, techPain.options.length);
        const selected = [];
        for (let i = 0; i < numPains; i++) {
          selected.push(techPain.options[i].value);
        }
        responses[`${q.id}_technical_pain`] = selected;
      }
      
      const bizPain = q.perspectives?.find(p => p.id === 'business_pain');
      if (bizPain && bizPain.options && bizPain.options.length > 0) {
        const numPains = Math.min(Math.floor(Math.random() * 3) + 1, bizPain.options.length);
        const selected = [];
        for (let i = 0; i < numPains; i++) {
          selected.push(bizPain.options[i].value);
        }
        responses[`${q.id}_business_pain`] = selected;
      }
    });
  });
});

console.log(JSON.stringify({
  responses,
  completedCategories,
  status: 'completed'
}));
NODESCRIPT

PAYLOAD=$(FRAMEWORK="$FRAMEWORK" ASSESSMENT_ID="$ASSESSMENT_ID" node << 'NODESCRIPT'
const framework = JSON.parse(process.env.FRAMEWORK);
const assessmentId = process.env.ASSESSMENT_ID;

const responses = {};
const completedCategories = [];

framework.assessmentAreas.forEach(area => {
  completedCategories.push(area.id);
  
  area.dimensions.forEach(dim => {
    dim.questions.forEach(q => {
      const current = Math.floor(Math.random() * 3) + 2;
      const future = Math.min(current + Math.floor(Math.random() * 2) + 1, 5);
      
      responses[`${q.id}_current_state`] = current;
      responses[`${q.id}_future_state`] = future;
      responses[`${q.id}_comment`] = `Testing ${q.question.substring(0, 30)}`;
      
      const techPain = q.perspectives?.find(p => p.id === 'technical_pain');
      if (techPain && techPain.options && techPain.options.length > 0) {
        const numPains = Math.min(2, techPain.options.length);
        responses[`${q.id}_technical_pain`] = techPain.options.slice(0, numPains).map(o => o.value);
      }
      
      const bizPain = q.perspectives?.find(p => p.id === 'business_pain');
      if (bizPain && bizPain.options && bizPain.options.length > 0) {
        const numPains = Math.min(2, bizPain.options.length);
        responses[`${q.id}_business_pain`] = bizPain.options.slice(0, numPains).map(o => o.value);
      }
    });
  });
});

console.log(JSON.stringify({
  responses,
  completedCategories,
  status: 'completed'
}));
NODESCRIPT
)

RESPONSE_COUNT=$(echo "$PAYLOAD" | python3 -c "import json, sys; data=json.load(sys.stdin); print(len(data.get('responses', {})))")
echo "✅ Generated $RESPONSE_COUNT responses for all pillars"
echo

# 4. Submit bulk
echo "4. Submitting bulk responses..."
BULK_RESULT=$(curl -s -X POST "http://localhost:5000/api/assessment/$ASSESSMENT_ID/bulk-submit" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

echo "Bulk submit result:"
echo "$BULK_RESULT" | python3 -m json.tool
echo

# 5. Verify saved
echo "5. Verifying responses saved..."
STATUS=$(curl -s "http://localhost:5000/api/assessment/$ASSESSMENT_ID/status")
SAVED_COUNT=$(echo "$STATUS" | python3 -c "import json, sys; data=json.load(sys.stdin); print(len(data.get('data', {}).get('responses', {})))")
echo "✅ Saved responses: $SAVED_COUNT"
echo

# 6. Get results
echo "6. Getting results..."
RESULTS=$(curl -s "http://localhost:5000/api/assessment/$ASSESSMENT_ID/results")
PA_COUNT=$(echo "$RESULTS" | python3 -c "import json, sys; data=json.load(sys.stdin); print(len(data.get('recommendations', {}).get('prioritizedActions', [])))")
echo "✅ prioritizedActions: $PA_COUNT"

if [ "$PA_COUNT" -gt 0 ]; then
  echo
  echo "First pillar action:"
  echo "$RESULTS" | python3 -c "
import json, sys
data = json.load(sys.stdin)
pa = data.get('recommendations', {}).get('prioritizedActions', [])
if pa:
    first = pa[0]
    print(f'  Pillar: {first.get(\"pillarId\")}')
    print(f'  - theGood: {len(first.get(\"theGood\", []))}')
    print(f'  - theBad: {len(first.get(\"theBad\", []))}')
    print(f'  - recommendations: {len(first.get(\"recommendations\", []))}')
    print(f'  - databricksFeatures: {len(first.get(\"databricksFeatures\", []))}')
    if first.get('databricksFeatures'):
        print(f'  - First feature: {first[\"databricksFeatures\"][0].get(\"name\", \"N/A\")}')
"
fi

echo
echo "=== Test Complete ==="
echo "Assessment ID: $ASSESSMENT_ID"
echo "View in browser: http://localhost:3000/results/$ASSESSMENT_ID"

