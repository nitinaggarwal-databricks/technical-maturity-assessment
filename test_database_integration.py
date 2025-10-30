#!/usr/bin/env python3
"""
Test Database Integration for Recommendations
Verifies that recommendations are generated from PostgreSQL database features.
"""

import requests
import json
import time

BASE_URL = "http://localhost:5001/api"

def test_database_integration():
    print("\n" + "="*80)
    print("🧪 TESTING DATABASE INTEGRATION FOR RECOMMENDATIONS")
    print("="*80)
    
    # Step 1: Create a sample assessment
    print("\n📝 Step 1: Creating sample assessment...")
    
    # Use the start endpoint with sample=true
    response = requests.post(f"{BASE_URL}/assessment/start", json={
        "assessmentName": "Database Integration Test",
        "organizationName": "Test Company",
        "industry": "Technology",
        "contactEmail": "test@example.com"
    })
    
    if response.status_code != 200:
        print(f"❌ Failed to create sample assessment: {response.status_code}")
        print(response.text)
        return False
    
    assessment_data = response.json()
    print(f"📦 Response data: {json.dumps(assessment_data, indent=2)}")
    
    if not assessment_data.get('success'):
        print(f"❌ Sample creation failed: {assessment_data.get('error')}")
        return False
    
    # Handle both wrapped and direct response formats
    assessment_id = assessment_data.get('data', {}).get('assessmentId') or assessment_data.get('data', {}).get('id')
    
    if not assessment_id:
        print(f"❌ No assessment ID found in response")
        return False
    
    print(f"✅ Sample assessment created: {assessment_id}")
    
    # Step 2: Get framework and populate with sample responses
    print("\n📋 Step 2: Fetching assessment framework...")
    response = requests.get(f"{BASE_URL}/assessment/framework")
    framework_data = response.json()['data']
    assessment_areas = framework_data.get('assessmentAreas', [])
    
    print(f"✅ Framework loaded: {len(assessment_areas)} assessment areas")
    
    # Step 3: Generate and submit sample responses
    print("\n✍️  Step 3: Populating assessment with sample data...")
    
    all_responses = []
    for area in assessment_areas:
        for dimension in area.get('dimensions', []):
            for question in dimension.get('questions', []):
                # Random current state (1-3)
                current_state = 1 + (hash(question['id']) % 3)
                # Random future state (current + 1 to 4)
                future_state = min(current_state + 1 + (hash(question['id'] + 'future') % 2), 4)
                
                # Random pain points from technical_pain perspective
                pain_points = []
                for perspective in question.get('perspectives', []):
                    if perspective.get('id') == 'technical_pain':
                        available_pain_points = perspective.get('options', [])
                        if available_pain_points:
                            # Select 1-2 random pain points
                            pain_points = [available_pain_points[hash(question['id'] + 'pain') % len(available_pain_points)]['value']]
                
                all_responses.append({
                    'questionId': question['id'],
                    'currentState': current_state,
                    'futureState': future_state,
                    'painPoints': pain_points,
                    'comments': f"Sample comment for {question['question'][:50]}... focusing on technical challenges and improvement opportunities."
                })
    
    # Submit all responses in bulk
    response = requests.post(
        f"{BASE_URL}/assessment/{assessment_id}/bulk-submit",
        json={'responses': all_responses}
    )
    
    if response.status_code != 200:
        print(f"❌ Failed to submit responses: {response.status_code}")
        print(response.text)
        return False
    
    print(f"✅ Submitted {len(all_responses)} responses")
    
    # Step 4: Wait for processing
    print("\n⏳ Step 4: Waiting for results generation...")
    time.sleep(3)
    
    # Step 5: Fetch overall results
    print("\n📊 Step 5: Fetching overall results...")
    response = requests.get(f"{BASE_URL}/assessment/{assessment_id}/results")
    
    if response.status_code != 200:
        print(f"❌ Failed to fetch results: {response.status_code}")
        print(response.text)
        return False
    
    results = response.json()
    if not results.get('success'):
        print(f"❌ Results fetch failed: {results.get('error')}")
        return False
    
    data = results['data']
    
    # Step 6: Analyze recommendations
    print("\n" + "="*80)
    print("🔍 ANALYZING RECOMMENDATIONS")
    print("="*80)
    
    # Check prioritized actions
    prioritized_actions = data.get('prioritizedActions', [])
    print(f"\n📋 Prioritized Actions: {len(prioritized_actions)} items")
    
    if not prioritized_actions:
        print("⚠️  WARNING: No prioritized actions found!")
        print("\n🔍 Full data structure:")
        print(json.dumps(data, indent=2))
        return False
    
    # Analyze each recommendation
    database_count = 0
    hardcoded_count = 0
    
    for i, action in enumerate(prioritized_actions[:5], 1):
        print(f"\n{'─'*80}")
        print(f"📌 Recommendation {i}: {action.get('title', 'No title')}")
        print(f"   Category: {action.get('category', 'Unknown')}")
        print(f"   Description: {action.get('description', 'No description')[:100]}...")
        
        # Check if it has database indicators
        has_ga_status = action.get('gaStatus') is not None
        has_release_date = action.get('releaseDate') is not None
        has_use_cases = action.get('useCases') is not None
        has_technical_details = action.get('technicalDetails') is not None
        
        if has_ga_status or has_release_date or has_use_cases or has_technical_details:
            print(f"   ✅ DATABASE-SOURCED")
            if has_ga_status:
                print(f"      GA Status: {action.get('gaStatus')}")
            if has_release_date:
                print(f"      Release: {action.get('releaseDate')}")
            if has_use_cases:
                print(f"      Use Cases: {len(action.get('useCases', []))} defined")
            if has_technical_details:
                complexity = action.get('technicalDetails', {}).get('complexity')
                print(f"      Complexity: {complexity}")
            database_count += 1
        else:
            print(f"   ⚠️  HARDCODED/FALLBACK")
            hardcoded_count += 1
    
    # Check Next Steps
    print(f"\n{'='*80}")
    print(f"🚀 Next Steps Analysis")
    print(f"{'='*80}")
    
    next_steps = data.get('nextSteps', [])
    print(f"\n📋 Next Steps: {len(next_steps)} items")
    
    for i, step in enumerate(next_steps[:3], 1):
        print(f"\n{'─'*80}")
        print(f"🎯 Step {i}: {step.get('title', 'No title')}")
        print(f"   Type: {step.get('type', 'Unknown')}")
        print(f"   Duration: {step.get('duration', 'Unknown')}")
        
        stakeholders = step.get('stakeholders', [])
        if stakeholders:
            print(f"   Stakeholders: {', '.join(stakeholders[:3])}")
    
    # Check Databricks Features
    print(f"\n{'='*80}")
    print(f"🏗️ Databricks Features")
    print(f"{'='*80}")
    
    databricks_features = data.get('databricksFeatures', [])
    print(f"\n📋 Features: {len(databricks_features)} items")
    
    for i, feature in enumerate(databricks_features[:3], 1):
        print(f"\n{'─'*80}")
        print(f"💎 Feature {i}: {feature.get('name', 'No name')}")
        print(f"   Description: {feature.get('description', 'No description')[:100]}...")
        
        benefits = feature.get('benefits', [])
        if benefits:
            print(f"   Benefits: {len(benefits)} defined")
            for benefit in benefits[:2]:
                print(f"      • {benefit[:80]}...")
    
    # Final Summary
    print(f"\n{'='*80}")
    print(f"📊 INTEGRATION SUMMARY")
    print(f"{'='*80}")
    print(f"✅ Database-sourced recommendations: {database_count}")
    print(f"⚠️  Hardcoded/fallback recommendations: {hardcoded_count}")
    print(f"📊 Next Steps: {len(next_steps)}")
    print(f"💎 Databricks Features: {len(databricks_features)}")
    
    if database_count > 0:
        print(f"\n✅ SUCCESS: Database integration is working!")
        print(f"   Recommendations are being generated from PostgreSQL features.")
        return True
    else:
        print(f"\n❌ FAILURE: No database-sourced recommendations found!")
        print(f"   All recommendations appear to be from hardcoded fallback logic.")
        return False

if __name__ == "__main__":
    success = test_database_integration()
    exit(0 if success else 1)

