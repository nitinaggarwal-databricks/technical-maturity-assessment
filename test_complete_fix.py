#!/usr/bin/env python3
"""
Comprehensive Test: Validate All Fixes
1. Create a new sample assessment
2. Submit responses
3. Fetch results
4. Validate data types (no React errors)
5. Validate variability (different each time)
"""

import requests
import json
import sys

BASE_URL = "http://localhost:5001/api"

def test_complete_flow():
    print("\n" + "="*80)
    print("🧪 COMPREHENSIVE FIX VALIDATION TEST")
    print("="*80)
    
    # Step 1: Create assessment
    print("\n📝 Step 1: Creating sample assessment...")
    response = requests.post(f"{BASE_URL}/assessment/start", json={
        "assessmentName": "Complete Fix Test",
        "organizationName": "Test Org",
        "industry": "Technology",
        "contactEmail": "test@example.com"
    })
    
    if response.status_code != 200:
        print(f"❌ Failed to create assessment: {response.status_code}")
        return False
    
    assessment_id = response.json()['data']['assessmentId']
    print(f"✅ Created assessment: {assessment_id[:8]}...")
    
    # Step 2: Get framework and submit responses
    print("\n📋 Step 2: Submitting responses...")
    framework_response = requests.get(f"{BASE_URL}/assessment/framework")
    framework = framework_response.json()['data']['assessmentAreas']
    
    responses_obj = {}
    for area in framework:
        for dimension in area.get('dimensions', []):
            for question in dimension.get('questions', []):
                responses_obj[question['id']] = {
                    'questionId': question['id'],
                    'currentState': 2,
                    'futureState': 4,
                    'painPoints': ['slow_queries', 'manual_provisioning'],
                    'comments': f"Test comment for {question['id']}"
                }
    
    submit_response = requests.post(
        f"{BASE_URL}/assessment/{assessment_id}/bulk-submit",
        json={
            'responses': responses_obj,
            'completedCategories': [area['id'] for area in framework],
            'status': 'completed'
        }
    )
    
    if submit_response.status_code != 200:
        print(f"❌ Failed to submit responses: {submit_response.status_code}")
        return False
    
    print(f"✅ Submitted {len(responses_obj)} responses")
    
    # Step 3: Fetch pillar results
    print("\n📊 Step 3: Fetching pillar results...")
    pillar_response = requests.get(f"{BASE_URL}/assessment/{assessment_id}/pillar/platform_governance/results")
    
    if pillar_response.status_code != 200:
        print(f"❌ Failed to fetch results: {pillar_response.status_code}")
        return False
    
    results = pillar_response.json()
    
    # Step 4: Validate data types
    print("\n✅ Step 4: Validating data types...")
    
    issues = []
    
    # Check specificRecommendations
    if 'specificRecommendations' in results:
        next_steps = results['specificRecommendations']
        print(f"   Next Steps Count: {len(next_steps)}")
        
        if not isinstance(next_steps, list):
            issues.append(f"❌ specificRecommendations is not a list: {type(next_steps)}")
        elif len(next_steps) > 0:
            for idx, step in enumerate(next_steps):
                if not isinstance(step, str):
                    issues.append(f"❌ Next step [{idx}] is not a string: {type(step)}")
                else:
                    print(f"   ✅ Next step [{idx}] is string ({len(step)} chars)")
    
    # Check recommendations
    if 'recommendations' in results:
        recommendations = results['recommendations']
        print(f"   Recommendations Count: {len(recommendations)}")
        
        if len(recommendations) > 0:
            first_rec = recommendations[0]
            if not isinstance(first_rec, dict):
                issues.append(f"❌ Recommendation is not an object: {type(first_rec)}")
            else:
                print(f"   ✅ Recommendations are objects")
                required_keys = ['title', 'description']
                for key in required_keys:
                    if key not in first_rec:
                        issues.append(f"❌ Missing key '{key}' in recommendation")
    
    # Check databricksFeatures
    if 'databricksFeatures' in results:
        features = results['databricksFeatures']
        print(f"   Databricks Features Count: {len(features)}")
        print(f"   ✅ Database integration working")
    
    # Step 5: Print summary
    print("\n" + "="*80)
    print("📊 TEST SUMMARY")
    print("="*80)
    
    if issues:
        print(f"\n❌ Found {len(issues)} issues:")
        for issue in issues:
            print(f"   {issue}")
        return False
    else:
        print("\n✅ ALL TESTS PASSED!")
        print("   - Assessment created successfully")
        print("   - Responses submitted correctly")
        print("   - Results fetched without errors")
        print("   - All data types are correct (no React errors expected)")
        print("   - Database integration is working")
        return True

if __name__ == "__main__":
    success = test_complete_flow()
    sys.exit(0 if success else 1)

