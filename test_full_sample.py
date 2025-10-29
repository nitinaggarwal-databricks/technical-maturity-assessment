#!/usr/bin/env python3
"""
Complete end-to-end test of sample assessment creation
"""
import requests
import json
import random

BASE_URL = 'http://localhost:5000/api'

def main():
    print("=== Full Sample Assessment Test ===\n")
    
    # 1. Create assessment
    print("1. Creating assessment...")
    create_response = requests.post(f'{BASE_URL}/assessment/start', json={
        'assessmentName': 'Python Full Test Sample',
        'organizationName': 'Test Org',
        'industry': 'Technology',
        'contactEmail': 'test@example.com'
    })
    assessment_id = create_response.json()['data']['assessmentId']
    print(f"✅ Assessment created: {assessment_id}\n")
    
    # 2. Get framework
    print("2. Getting framework...")
    framework_response = requests.get(f'{BASE_URL}/assessment/framework')
    framework_data = framework_response.json()
    framework = framework_data.get('data', framework_data)  # Handle both wrapped and unwrapped
    print(f"✅ Framework retrieved: {len(framework['assessmentAreas'])} areas\n")
    
    # 3. Generate responses
    print("3. Generating full responses...")
    responses = {}
    completed_categories = []
    
    for area in framework['assessmentAreas']:
        completed_categories.append(area['id'])
        
        for dimension in area['dimensions']:
            for question in dimension['questions']:
                q_id = question['id']
                
                # Random scores
                current = random.randint(2, 4)
                future = min(current + random.randint(1, 2), 5)
                
                responses[f'{q_id}_current_state'] = current
                responses[f'{q_id}_future_state'] = future
                responses[f'{q_id}_comment'] = f"Testing {question['question'][:30]}. Needs improvement."
                
                # Add pain points
                for persp in question.get('perspectives', []):
                    if persp['id'] == 'technical_pain':
                        options = persp.get('options', [])
                        if options:
                            num_pains = min(random.randint(1, 3), len(options))
                            selected = [opt['value'] for opt in random.sample(options, num_pains)]
                            responses[f'{q_id}_technical_pain'] = selected
                    
                    elif persp['id'] == 'business_pain':
                        options = persp.get('options', [])
                        if options:
                            num_pains = min(random.randint(1, 3), len(options))
                            selected = [opt['value'] for opt in random.sample(options, num_pains)]
                            responses[f'{q_id}_business_pain'] = selected
    
    print(f"✅ Generated {len(responses)} responses for {len(completed_categories)} pillars\n")
    
    # 4. Submit bulk
    print("4. Submitting bulk responses...")
    bulk_response = requests.post(
        f'{BASE_URL}/assessment/{assessment_id}/bulk-submit',
        json={
            'responses': responses,
            'completedCategories': completed_categories,
            'status': 'completed'
        }
    )
    print(f"✅ Bulk submit: {bulk_response.json()}\n")
    
    # 5. Verify saved
    print("5. Verifying responses saved...")
    status_response = requests.get(f'{BASE_URL}/assessment/{assessment_id}/status')
    saved_count = len(status_response.json()['data']['responses'])
    print(f"✅ Saved responses: {saved_count}\n")
    
    # 6. Get results
    print("6. Getting results...")
    results_response = requests.get(f'{BASE_URL}/assessment/{assessment_id}/results')
    results = results_response.json()
    
    # FIX: prioritizedActions is in data, not recommendations
    pa = results.get('data', {}).get('prioritizedActions', [])
    print(f"✅ prioritizedActions: {len(pa)}\n")
    
    if pa:
        print("📊 First Pillar Results:")
        first = pa[0]
        print(f"   Pillar: {first.get('pillarId')}")
        print(f"   - What's Working: {len(first.get('theGood', []))} items")
        print(f"   - Key Challenges: {len(first.get('theBad', []))} items")
        print(f"   - Recommendations: {len(first.get('recommendations', []))} items")
        print(f"   - Databricks Features: {len(first.get('databricksFeatures', []))} items")
        
        if first.get('databricksFeatures'):
            print(f"\n   First Feature: {first['databricksFeatures'][0].get('name', 'N/A')}")
        
        if first.get('theGood'):
            print(f"\n   Sample 'What's Working': {first['theGood'][0]}")
        
        if first.get('theBad'):
            print(f"   Sample 'Key Challenge': {first['theBad'][0]}")
        
        if first.get('recommendations'):
            print(f"   Sample Recommendation: {first['recommendations'][0][:100]}...")
    else:
        print("❌ No recommendations generated!")
    
    print(f"\n=== Test Complete ===")
    print(f"Assessment ID: {assessment_id}")
    print(f"View in browser: http://localhost:3000/results/{assessment_id}")

if __name__ == '__main__':
    main()

