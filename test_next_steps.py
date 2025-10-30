#!/usr/bin/env python3
"""
Test script to verify Next Steps are being generated correctly
"""

import requests
import json

BASE_URL = "https://web-production-76e27.up.railway.app/api"

def test_next_steps():
    print("🧪 Testing Next Steps Generation\n")
    print("="*80)
    
    # Step 1: Generate a new sample assessment
    print("\n📝 Step 1: Generating new sample assessment...")
    response = requests.post(f"{BASE_URL}/assessment/generate-sample")
    
    if response.status_code != 200:
        print(f"❌ Failed to generate sample: {response.status_code}")
        print(response.text)
        return
    
    data = response.json()
    # Handle both response formats
    assessment_id = (data.get('data', {}).get('id') or 
                     data.get('assessment', {}).get('id'))
    
    if not assessment_id:
        print(f"❌ No assessment ID in response")
        print(f"Available keys: {list(data.keys())}")
        return
    
    print(f"✅ Created assessment: {assessment_id}")
    
    # Step 2: Wait a moment for generation
    import time
    print("\n⏳ Waiting 3 seconds for generation...")
    time.sleep(3)
    
    # Step 3: Fetch results
    print(f"\n📊 Step 2: Fetching results for {assessment_id}...")
    response = requests.get(f"{BASE_URL}/assessment/{assessment_id}/results")
    
    if response.status_code != 200:
        print(f"❌ Failed to fetch results: {response.status_code}")
        print(response.text)
        return
    
    results = response.json()
    
    # Step 4: Check prioritizedActions
    print("\n🔍 Step 3: Analyzing Next Steps in prioritizedActions...")
    print("="*80)
    
    prioritized_actions = results.get('data', {}).get('prioritizedActions', [])
    
    if not prioritized_actions:
        print("❌ No prioritizedActions found!")
        print(f"Available keys: {list(results.get('data', {}).keys())}")
        return
    
    print(f"✅ Found {len(prioritized_actions)} pillar(s)\n")
    
    for idx, action in enumerate(prioritized_actions, 1):
        pillar_id = action.get('area') or action.get('pillarId') or action.get('pillar')
        specific_recs = action.get('specificRecommendations', [])
        
        print(f"\n{'='*80}")
        print(f"PILLAR {idx}: {pillar_id}")
        print(f"{'='*80}")
        
        print(f"\n📋 specificRecommendations count: {len(specific_recs)}")
        
        if specific_recs:
            print(f"\n🎯 NEXT STEPS:")
            for i, rec in enumerate(specific_recs, 1):
                # Truncate long recommendations
                rec_text = str(rec)[:150] + "..." if len(str(rec)) > 150 else str(rec)
                print(f"  {i}. {rec_text}")
                
                # Check if it's the new format
                if "**Workshop**" in str(rec) or "**Partner Engagement**" in str(rec):
                    print(f"     ✅ NEW FORMAT DETECTED!")
                elif "Quick Start Training" in str(rec) or "Technical Workshop" in str(rec):
                    print(f"     ⚠️ OLD FORMAT!")
        else:
            print("  ❌ NO NEXT STEPS FOUND!")
        
        # Also check other fields
        print(f"\n📦 Other fields:")
        print(f"  - theGood: {len(action.get('theGood', []))}")
        print(f"  - theBad: {len(action.get('theBad', []))}")
        print(f"  - recommendations: {len(action.get('recommendations', []))}")
        print(f"  - databricksFeatures: {len(action.get('databricksFeatures', []))}")
        print(f"  - _intelligentEngine: {action.get('_intelligentEngine', False)}")
    
    print(f"\n{'='*80}")
    print("🎉 Test Complete!")
    print(f"{'='*80}")

if __name__ == "__main__":
    test_next_steps()

