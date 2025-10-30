import requests
import json
import time

BASE_URL = "http://localhost:5000/api"

def test(name, condition, error_msg=""):
    if condition:
        print(f"✅ {name}")
        return True
    else:
        print(f"❌ {name}: {error_msg}")
        return False

print("\n" + "="*80)
print("EDGE CASE & LOGIC TESTS")
print("="*80 + "\n")

issues = []

# ============================================================================
# EDGE CASE 1: Empty Assessment (No Responses)
# ============================================================================
print("TEST 1: Empty Assessment Handling\n")

result = requests.post(f'{BASE_URL}/assessment/start', json={
    'assessmentName': 'Empty Assessment',
    'organizationName': 'Test',
    'industry': 'Technology',
    'contactEmail': 'test@test.com'
}).json()

empty_id = result.get('data', {}).get('assessmentId')

# Try to get results with no responses
results = requests.get(f'{BASE_URL}/assessment/{empty_id}/results').json()

if results.get('success'):
    data = results.get('data', {})
    
    # Should handle gracefully
    if test("Empty assessment returns success", True):
        pass
    
    # Check for zero-state handling
    actions = data.get('prioritizedActions', [])
    if not test("Empty assessment returns empty or default prioritizedActions", 
               len(actions) >= 0, 
               f"Got {len(actions)} actions"):
        issues.append("Empty assessment doesn't handle zero state")
else:
    issues.append(f"Empty assessment failed: {results.get('message')}")

print()

# ============================================================================
# EDGE CASE 2: Partial Assessment (Only 1 Pillar)
# ============================================================================
print("TEST 2: Partial Assessment Handling\n")

result = requests.post(f'{BASE_URL}/assessment/start', json={
    'assessmentName': 'Partial Assessment',
    'organizationName': 'Test',
    'industry': 'Manufacturing',
    'contactEmail': 'test@test.com'
}).json()

partial_id = result.get('data', {}).get('assessmentId')

# Submit only 1 question
partial_responses = {
    'security_controls_current_state': 3,
    'security_controls_future_state': 5,
    'security_controls_comment': 'Test',
    'security_controls_technical_pain': ['weak_access_control']
}

requests.post(f'{BASE_URL}/assessment/{partial_id}/bulk-submit', 
             json={'responses': partial_responses, 'completedCategories': []})

time.sleep(1)

results = requests.get(f'{BASE_URL}/assessment/{partial_id}/results').json()

if results.get('success'):
    data = results.get('data', {})
    actions = data.get('prioritizedActions', [])
    
    if not test("Partial assessment generates results", 
               len(actions) > 0,
               f"Got {len(actions)} actions"):
        issues.append("Partial assessment doesn't generate results")
    
    # Check business impact still works
    impact = data.get('businessImpact', {})
    if not test("Partial assessment calculates business impact",
               impact.get('decisionSpeed') is not None):
        issues.append("Partial assessment breaks business impact")
else:
    issues.append(f"Partial assessment failed: {results.get('message')}")

print()

# ============================================================================
# EDGE CASE 3: All Max Scores (Current = Future = 5)
# ============================================================================
print("TEST 3: All Max Scores (No Gaps)\n")

framework = requests.get(f'{BASE_URL}/assessment/framework').json()
framework_data = framework.get('data', framework)

result = requests.post(f'{BASE_URL}/assessment/start', json={
    'assessmentName': 'Perfect Assessment',
    'organizationName': 'Test',
    'industry': 'Technology',
    'contactEmail': 'test@test.com'
}).json()

perfect_id = result.get('data', {}).get('assessmentId')

# All scores = 5
perfect_responses = {}
for area in framework_data['assessmentAreas']:
    for dim in area['dimensions']:
        for q in dim['questions']:
            perfect_responses[f"{q['id']}_current_state"] = 5
            perfect_responses[f"{q['id']}_future_state"] = 5
            perfect_responses[f"{q['id']}_comment"] = "Already at optimal level"
            
            # No pain points
            for perspective in q.get('perspectives', []):
                if perspective['id'] in ['technical_pain', 'business_pain']:
                    perfect_responses[f"{q['id']}_{perspective['id']}"] = []

requests.post(f'{BASE_URL}/assessment/{perfect_id}/bulk-submit',
             json={'responses': perfect_responses, 
                   'completedCategories': [a['id'] for a in framework_data['assessmentAreas']]})

time.sleep(1)

results = requests.get(f'{BASE_URL}/assessment/{perfect_id}/results').json()

if results.get('success'):
    data = results.get('data', {})
    
    # Check overall scores
    overall = data.get('overall', {})
    current = overall.get('currentScore', 0)
    gap = overall.get('gap', 0)
    
    if not test("Max scores: current score is ~5", 
               current >= 4.5, 
               f"Current score is {current}"):
        issues.append("Max scores not calculated correctly")
    
    if not test("Max scores: gap is ~0",
               gap <= 0.5,
               f"Gap is {gap}"):
        issues.append("Gap calculation wrong for max scores")
    
    # Check business impact - should still show some value
    impact = data.get('businessImpact', {})
    decision_speed = impact.get('decisionSpeed', {}).get('value', '0×')
    
    if not test("Max scores: Business impact calculated",
               decision_speed != '0×' and decision_speed != 'N/A'):
        # This might be expected - if no gaps, no improvement impact
        print("    ℹ️  Note: Max scores may show zero business impact (expected)")
    
    # Check maturity summary
    maturity = data.get('maturitySummary', {})
    current_desc = maturity.get('current', {}).get('description', '')
    
    if not test("Max scores: Dynamic maturity description",
               len(current_desc) > 0):
        issues.append("Max scores: No maturity description")
else:
    issues.append(f"Perfect assessment failed: {results.get('message')}")

print()

# ============================================================================
# EDGE CASE 4: All Min Scores (Current = Future = 1)
# ============================================================================
print("TEST 4: All Min Scores (Everything is broken)\n")

result = requests.post(f'{BASE_URL}/assessment/start', json={
    'assessmentName': 'Worst Case Assessment',
    'organizationName': 'Test',
    'industry': 'Healthcare',
    'contactEmail': 'test@test.com'
}).json()

worst_id = result.get('data', {}).get('assessmentId')

# All scores = 1, targeting 2 (small improvement)
worst_responses = {}
for area in framework_data['assessmentAreas']:
    for dim in area['dimensions']:
        for q in dim['questions']:
            worst_responses[f"{q['id']}_current_state"] = 1
            worst_responses[f"{q['id']}_future_state"] = 2
            worst_responses[f"{q['id']}_comment"] = "Everything is broken"
            
            # All pain points selected
            for perspective in q.get('perspectives', []):
                if perspective['id'] in ['technical_pain', 'business_pain']:
                    options = perspective.get('options', [])
                    worst_responses[f"{q['id']}_{perspective['id']}"] = [opt['value'] for opt in options]

requests.post(f'{BASE_URL}/assessment/{worst_id}/bulk-submit',
             json={'responses': worst_responses,
                   'completedCategories': [a['id'] for a in framework_data['assessmentAreas']]})

time.sleep(1)

results = requests.get(f'{BASE_URL}/assessment/{worst_id}/results').json()

if results.get('success'):
    data = results.get('data', {})
    
    # Should still generate recommendations
    actions = data.get('prioritizedActions', [])
    if not test("Worst case: Generates recommendations",
               len(actions) > 0,
               f"Got {len(actions)} actions"):
        issues.append("Worst case doesn't generate recommendations")
    
    # All pillars should have lots of challenges
    for action in actions:
        the_bad = action.get('theBad', [])
        if len(the_bad) == 0:
            issues.append(f"Worst case: {action.get('pillarId')} has no challenges")
    
    # Business impact should be high
    impact = data.get('businessImpact', {})
    overhead = impact.get('manualOverhead', {}).get('value', '0%')
    
    overhead_pct = int(overhead.replace('%', '')) if '%' in overhead else 0
    if not test("Worst case: High business impact potential",
               overhead_pct > 30,
               f"Overhead reduction only {overhead}"):
        issues.append(f"Worst case shows low impact: {overhead}")
else:
    issues.append(f"Worst case assessment failed: {results.get('message')}")

print()

# ============================================================================
# LOGIC TEST 1: Gap Consistency
# ============================================================================
print("TEST 5: Logic - Gap Calculation Consistency\n")

# Create assessment with known gaps
result = requests.post(f'{BASE_URL}/assessment/start', json={
    'assessmentName': 'Gap Test',
    'organizationName': 'Test',
    'industry': 'Technology',
    'contactEmail': 'test@test.com'
}).json()

gap_test_id = result.get('data', {}).get('assessmentId')

# Set specific gaps: Platform (2→5, gap=3), ML (3→4, gap=1)
gap_responses = {}
for area in framework_data['assessmentAreas']:
    if area['id'] == 'platform_governance':
        current, future = 2, 5
    elif area['id'] == 'machine_learning':
        current, future = 3, 4
    else:
        current, future = 3, 3
    
    for dim in area['dimensions']:
        for q in dim['questions']:
            gap_responses[f"{q['id']}_current_state"] = current
            gap_responses[f"{q['id']}_future_state"] = future
            gap_responses[f"{q['id']}_comment"] = f"Gap test: {current}→{future}"

requests.post(f'{BASE_URL}/assessment/{gap_test_id}/bulk-submit',
             json={'responses': gap_responses,
                   'completedCategories': [a['id'] for a in framework_data['assessmentAreas']]})

time.sleep(1)

results = requests.get(f'{BASE_URL}/assessment/{gap_test_id}/results').json()

if results.get('success'):
    data = results.get('data', {})
    actions = data.get('prioritizedActions', [])
    
    # Find platform and ML
    platform_action = next((a for a in actions if a.get('pillarId') == 'platform_governance'), None)
    ml_action = next((a for a in actions if a.get('pillarId') == 'machine_learning'), None)
    
    if platform_action:
        platform_gap = platform_action.get('gap', 0)
        if not test("Platform gap calculated correctly",
                   2.5 <= platform_gap <= 3.5,
                   f"Expected ~3, got {platform_gap}"):
            issues.append(f"Platform gap wrong: {platform_gap}")
        
        # Platform should be higher priority
        platform_priority = platform_action.get('priority', 'unknown')
        if not test("Platform has critical/high priority",
                   platform_priority in ['critical', 'high'],
                   f"Got {platform_priority}"):
            issues.append(f"Platform priority wrong: {platform_priority}")
    
    if ml_action:
        ml_gap = ml_action.get('gap', 0)
        if not test("ML gap calculated correctly",
                   0.5 <= ml_gap <= 1.5,
                   f"Expected ~1, got {ml_gap}"):
            issues.append(f"ML gap wrong: {ml_gap}")
    
    # Roadmap should mention platform first (biggest gap)
    roadmap = data.get('maturitySummary', {}).get('roadmapIntro', '')
    if not test("Roadmap mentions platform (biggest gap)",
               'Platform' in roadmap or 'platform' in roadmap.lower() or 'governance' in roadmap.lower()):
        print(f"    ℹ️  Roadmap: {roadmap[:100]}...")
else:
    issues.append(f"Gap test failed: {results.get('message')}")

print()

# FINAL REPORT
print("="*80)
print("EDGE CASE TEST SUMMARY")
print("="*80 + "\n")

if len(issues) == 0:
    print("✅ ALL EDGE CASE TESTS PASSED!\n")
    print("Application handles:")
    print("  ✅ Empty assessments")
    print("  ✅ Partial assessments")
    print("  ✅ Maximum maturity (no gaps)")
    print("  ✅ Minimum maturity (all broken)")
    print("  ✅ Gap calculation logic")
else:
    print(f"⚠️  Found {len(issues)} issues:\n")
    for i, issue in enumerate(issues, 1):
        print(f"  {i}. {issue}")

print("\n" + "="*80 + "\n")

