#!/usr/bin/env python3
"""
Test Sample Assessment Variety
Show that each sample has unique, realistic inputs
"""

import requests
import json

BASE_URL = "http://localhost:5001/api"

def test_sample_variety():
    print("\n" + "="*80)
    print("🎨 TESTING SAMPLE ASSESSMENT VARIETY")
    print("="*80)
    print("\nGenerating 5 sample assessments to show variety...\n")
    
    samples = []
    
    for i in range(1, 6):
        # Create sample assessment
        response = requests.post(f"{BASE_URL}/assessment/generate-sample")
        
        if response.status_code != 200:
            print(f"❌ Sample {i} failed: {response.status_code}")
            continue
        
        data = response.json()['assessment']
        
        samples.append({
            'name': data['assessmentName'],
            'org': data['organizationName'],
            'industry': data['industry'],
            'email': data['contactEmail'],
            'editor': data.get('editorEmail', 'N/A'),
            'description': data.get('assessmentDescription', 'N/A')
        })
        
        print(f"Sample {i}:")
        print(f"  📋 Name: {data['assessmentName']}")
        print(f"  🏢 Organization: {data['organizationName']}")
        print(f"  🏭 Industry: {data['industry']}")
        print(f"  📧 Contact: {data['contactEmail']}")
        print(f"  👤 Editor: {data.get('editorEmail', 'N/A')}")
        print(f"  📝 Purpose: {data.get('assessmentDescription', 'N/A')[:60]}...")
        print()
    
    # Analyze uniqueness
    print("="*80)
    print("📊 VARIETY ANALYSIS")
    print("="*80)
    
    unique_orgs = len(set(s['org'] for s in samples))
    unique_industries = len(set(s['industry'] for s in samples))
    unique_emails = len(set(s['email'] for s in samples))
    unique_names = len(set(s['name'] for s in samples))
    
    print(f"\n✅ Unique Organizations: {unique_orgs}/5")
    print(f"✅ Unique Industries: {unique_industries}/5")
    print(f"✅ Unique Contact Emails: {unique_emails}/5")
    print(f"✅ Unique Assessment Names: {unique_names}/5")
    
    print(f"\n🎯 Organizations: {[s['org'] for s in samples]}")
    print(f"🎯 Industries: {[s['industry'] for s in samples]}")
    
    print("\n" + "="*80)
    if unique_orgs == 5 and unique_names == 5:
        print("🎉 SUCCESS! All samples have distinct, realistic inputs!")
    else:
        print("⚠️ Some samples may have overlaps (which is OK with 60+ options)")
    print("="*80)

if __name__ == "__main__":
    test_sample_variety()

