#!/usr/bin/env python3
"""
Test Sample Assessment Variability
Ensure each sample generates different inputs and results
"""

import requests
import json
import time
from collections import defaultdict

BASE_URL = "http://localhost:5001/api"

def test_sample_variability():
    print("\n" + "="*80)
    print("🧪 TESTING SAMPLE ASSESSMENT VARIABILITY")
    print("="*80)
    
    samples = []
    
    # Generate 5 sample assessments
    for i in range(1, 6):
        print(f"\n📝 Creating Sample Assessment {i}/5...")
        
        response = requests.post(f"{BASE_URL}/assessment/start", json={
            "assessmentName": f"Variability Test {i}",
            "organizationName": f"Test Org {i}",
            "industry": "Technology",
            "contactEmail": f"test{i}@example.com"
        })
        
        if response.status_code != 200:
            print(f"❌ Failed: {response.status_code}")
            continue
        
        data = response.json()['data']
        assessment_id = data.get('assessmentId')
        
        # Get framework
        framework_response = requests.get(f"{BASE_URL}/assessment/framework")
        framework = framework_response.json()['data']['assessmentAreas']
        
        # Generate and submit responses
        all_responses = []
        for area in framework:
            for dimension in area.get('dimensions', []):
                for question in dimension.get('questions', []):
                    # Use different random seed for each sample
                    seed = hash(assessment_id + question['id']) % 100
                    
                    current_state = 1 + (seed % 4)
                    future_state = min(current_state + 1 + (seed % 2), 5)
                    
                    # Get pain points
                    pain_points = []
                    for perspective in question.get('perspectives', []):
                        if perspective.get('id') == 'technical_pain':
                            options = perspective.get('options', [])
                            if options:
                                # Select different pain points based on seed
                                idx = seed % len(options)
                                pain_points = [options[idx]['value']]
                    
                    all_responses.append({
                        'questionId': question['id'],
                        'currentState': current_state,
                        'futureState': future_state,
                        'painPoints': pain_points,
                        'comments': f"Assessment {i} - Technical insight for {question['question'][:30]}"
                    })
        
        # Convert array to object keyed by questionId
        responses_obj = {}
        for resp in all_responses:
            responses_obj[resp['questionId']] = resp
        
        # Submit responses
        submit_response = requests.post(
            f"{BASE_URL}/assessment/{assessment_id}/bulk-submit",
            json={
                'responses': responses_obj,
                'completedCategories': [area['id'] for area in framework],
                'status': 'completed'
            }
        )
        
        if submit_response.status_code != 200:
            print(f"❌ Submit failed: {submit_response.status_code}")
            continue
        
        time.sleep(2)
        
        # Get results
        results_response = requests.get(f"{BASE_URL}/assessment/{assessment_id}/results")
        
        if results_response.status_code != 200:
            print(f"❌ Results failed: {results_response.status_code}")
            continue
        
        results = results_response.json()['data']
        
        # Extract key metrics
        sample_data = {
            'id': assessment_id,
            'overall_current_score': results['overall']['currentScore'],
            'overall_future_score': results['overall']['futureScore'],
            'overall_gap': results['overall']['gap'],
            'prioritized_actions_count': len(results.get('prioritizedActions', [])),
            'next_steps_count': len(results.get('nextSteps', [])),
            'databricks_features_count': len(results.get('databricksFeatures', [])),
            'pillar_scores': {},
            'first_3_recommendations': []
        }
        
        # Get pillar scores
        for pillar_id, pillar_data in results.get('categories', {}).items():
            sample_data['pillar_scores'][pillar_id] = {
                'current': pillar_data.get('currentScore', 0),
                'future': pillar_data.get('futureScore', 0),
                'gap': pillar_data.get('gap', 0)
            }
        
        # Get first 3 recommendation titles
        for action in results.get('prioritizedActions', [])[:3]:
            sample_data['first_3_recommendations'].append(action.get('title', 'Unknown'))
        
        samples.append(sample_data)
        
        print(f"✅ Sample {i} completed")
        print(f"   Overall: Current={sample_data['overall_current_score']}, Future={sample_data['overall_future_score']}, Gap={sample_data['overall_gap']}")
        print(f"   Recommendations: {sample_data['prioritized_actions_count']}")
    
    # Analyze variability
    print(f"\n{'='*80}")
    print(f"📊 VARIABILITY ANALYSIS")
    print(f"{'='*80}")
    
    # Check score variability
    current_scores = [s['overall_current_score'] for s in samples]
    future_scores = [s['overall_future_score'] for s in samples]
    gaps = [s['overall_gap'] for s in samples]
    
    print(f"\n📈 Overall Score Variability:")
    print(f"   Current Scores: {set(current_scores)} (unique: {len(set(current_scores))})")
    print(f"   Future Scores: {set(future_scores)} (unique: {len(set(future_scores))})")
    print(f"   Gaps: {set(gaps)} (unique: {len(set(gaps))})")
    
    # Check recommendation variability
    all_recommendations = []
    for s in samples:
        all_recommendations.extend(s['first_3_recommendations'])
    
    print(f"\n💡 Recommendation Variability:")
    print(f"   Total recommendations across 5 samples: {len(all_recommendations)}")
    print(f"   Unique recommendations: {len(set(all_recommendations))}")
    
    if len(samples) >= 2:
        overlap = set(samples[0]['first_3_recommendations']) & set(samples[1]['first_3_recommendations'])
        print(f"   Overlap between sample 1 and 2: {len(overlap)}/3 recommendations")
    
    # Check pillar score variability
    print(f"\n🏗️ Pillar Score Variability:")
    pillar_variance = defaultdict(list)
    for sample in samples:
        for pillar_id, scores in sample['pillar_scores'].items():
            pillar_variance[pillar_id].append(scores['current'])
    
    for pillar_id, scores in pillar_variance.items():
        unique = len(set(scores))
        print(f"   {pillar_id}: {unique} unique current scores")
    
    # Verdict
    print(f"\n{'='*80}")
    print(f"🎯 VERDICT")
    print(f"{'='*80}")
    
    issues = []
    
    if len(set(current_scores)) <= 1:
        issues.append("❌ All samples have identical overall current scores")
    else:
        print(f"✅ Overall current scores vary across samples")
    
    if len(set(future_scores)) <= 1:
        issues.append("❌ All samples have identical overall future scores")
    else:
        print(f"✅ Overall future scores vary across samples")
    
    if len(set(all_recommendations)) < len(all_recommendations) * 0.5:
        issues.append("❌ Recommendations have >50% overlap (not enough variety)")
    else:
        print(f"✅ Recommendations show good variety")
    
    if issues:
        print(f"\n⚠️ Issues Found:")
        for issue in issues:
            print(f"   {issue}")
        return False
    else:
        print(f"\n✅ All variability tests passed!")
        return True

if __name__ == "__main__":
    success = test_sample_variability()
    exit(0 if success else 1)

