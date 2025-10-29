#!/bin/bash

echo "🧪 Testing Adaptive Recommendation Engine"
echo "=========================================================="

# Step 1: Create assessment
echo ""
echo "📝 Step 1: Creating test assessment..."
ASSESSMENT=$(curl -s -X POST http://localhost:5000/api/assessment/start \
  -H "Content-Type: application/json" \
  -d '{
    "organizationName": "Test Corp",
    "contactEmail": "test@example.com",
    "industry": "Technology",
    "assessmentName": "Adaptive Engine Test",
    "assessmentDescription": "Testing adaptive recommendations"
  }')

ASSESSMENT_ID=$(echo $ASSESSMENT | jq -r '.data.assessmentId')
echo "✅ Assessment created: $ASSESSMENT_ID"

# Step 2: Submit sample responses
echo ""
echo "📊 Step 2: Submitting test responses..."
echo "   - Current State: Level 2"
echo "   - Future State: Level 4 (Gap: 2 levels)"
echo "   - Pain Points: Performance, Data Quality"
echo "   - Comment: URGENT data quality issues"

curl -s -X POST "http://localhost:5000/api/assessment/$ASSESSMENT_ID/save-progress" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "env_standardization",
    "perspectiveId": "current_state",
    "value": 2
  }' > /dev/null

curl -s -X POST "http://localhost:5000/api/assessment/$ASSESSMENT_ID/save-progress" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "env_standardization",
    "perspectiveId": "future_state",
    "value": 4
  }' > /dev/null

curl -s -X POST "http://localhost:5000/api/assessment/$ASSESSMENT_ID/save-progress" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "env_standardization",
    "perspectiveId": "technical_pain",
    "value": ["performance_issues", "data_quality_issues"]
  }' > /dev/null

curl -s -X POST "http://localhost:5000/api/assessment/$ASSESSMENT_ID/save-progress" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "env_standardization",
    "perspectiveId": "business_pain",
    "value": ["slow_time_to_insights", "compliance_challenges"]
  }' > /dev/null

curl -s -X POST "http://localhost:5000/api/assessment/$ASSESSMENT_ID/save-progress" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "env_standardization",
    "comment": "We have URGENT data quality problems affecting our regulatory reports. This needs immediate attention!"
  }' > /dev/null

echo "✅ Test responses submitted"

# Step 3: Get adaptive results
echo ""
echo "🎯 Step 3: Getting ADAPTIVE results..."
RESULTS=$(curl -s "http://localhost:5000/api/assessment/$ASSESSMENT_ID/adaptive-results")

echo "✅ Adaptive results generated"
echo ""
echo "=========================================================="
echo "📊 ADAPTIVE RECOMMENDATION ENGINE RESULTS"
echo "=========================================================="

# Parse and display results
echo "$RESULTS" | jq '.data | {
  overall: {
    currentScore: .overall.currentScore,
    futureScore: .overall.futureScore,
    gap: .overall.gap,
    summary: .overall.summary
  },
  painPointCount: (.painPointRecommendations | length),
  gapActionsCount: (.gapBasedActions | length),
  commentInsightsCount: (.commentBasedInsights | length),
  prioritizedActionsCount: (.prioritizedActions | length)
}'

echo ""
echo "=========================================================="
echo ""
echo "📋 View full results in JSON format? (y/n)"
read -t 5 answer || answer="n"
if [ "$answer" = "y" ]; then
  echo "$RESULTS" | jq '.data'
fi

echo ""
echo "✅ Test completed!"
echo ""
echo "🎯 Assessment ID: $ASSESSMENT_ID"
echo "   Use this ID to view results in browser:"
echo "   http://localhost:3000/assessment/$ASSESSMENT_ID/results"
echo ""
echo "📝 Or get results via API:"
echo "   curl http://localhost:5000/api/assessment/$ASSESSMENT_ID/adaptive-results | jq ."
echo ""
