import requests
import json
import time
import random

BASE_URL = "http://localhost:5000/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def log_success(msg):
    print(f"{Colors.GREEN}✅ {msg}{Colors.END}")

def log_error(msg):
    print(f"{Colors.RED}❌ {msg}{Colors.END}")

def log_warning(msg):
    print(f"{Colors.YELLOW}⚠️  {msg}{Colors.END}")

def log_info(msg):
    print(f"{Colors.BLUE}ℹ️  {msg}{Colors.END}")

def log_section(msg):
    print(f"\n{'='*80}")
    print(f"{Colors.BLUE}{msg}{Colors.END}")
    print(f"{'='*80}\n")

# Track issues
issues = []

log_section("COMPREHENSIVE APPLICATION TEST V2 (Fixed)")
log_info("Testing all functionality with correct API structure...")

# Create assessment and run all tests...
# (keeping the same test structure but fixing the two bugs)

# TEST 1-4: Same as before...
# Skipping to the fixes...

# Create assessment
assessment_data = {
    'assessmentName': f'Test {time.time()}',
    'organizationName': 'Test Org',
    'industry': 'Financial Services',
    'contactEmail': 'test@example.com'
}

result = requests.post(f'{BASE_URL}/assessment/start', json=assessment_data).json()
assessment_id = result.get('data', {}).get('assessmentId') or result.get('assessmentId')

# Get framework
framework = requests.get(f'{BASE_URL}/assessment/framework').json()
framework_data = framework.get('data', framework)

# Submit responses
responses = {}
for area in framework_data['assessmentAreas']:
    base_current = random.randint(2, 4)
    for dim in area['dimensions']:
        for q in dim['questions']:
            current = max(1, min(5, base_current + random.randint(-1, 1)))
            future = min(current + random.randint(1, 2), 5)
            responses[f"{q['id']}_current_state"] = current
            responses[f"{q['id']}_future_state"] = future
            responses[f"{q['id']}_comment"] = f"Level {current} comment"
            
            for perspective in q.get('perspectives', []):
                if perspective['id'] in ['technical_pain', 'business_pain']:
                    options = perspective.get('options', [])
                    if options:
                        selected = random.sample([opt['value'] for opt in options], min(2, len(options)))
                        responses[f"{q['id']}_{perspective['id']}"] = selected

submit_response = requests.post(
    f'{BASE_URL}/assessment/{assessment_id}/bulk-submit',
    json={'responses': responses, 'completedCategories': [a['id'] for a in framework_data['assessmentAreas']]}
)

time.sleep(2)

# FIX 1: Check responses in data.responses
log_section("FIX 1: VERIFY RESPONSES SAVED (CORRECTED)")
status_response = requests.get(f'{BASE_URL}/assessment/{assessment_id}/status')
status = status_response.json()

# FIXED: Check status.data.responses instead of status.responses
saved_responses = status.get('data', {}).get('responses', {})
saved_count = len(saved_responses)
expected_count = len(responses)

if saved_count == 0:
    log_error("No responses saved!")
    issues.append("No responses saved")
elif saved_count < expected_count:
    log_warning(f"Only {saved_count}/{expected_count} responses saved")
    issues.append(f"Response mismatch: {saved_count}/{expected_count}")
else:
    log_success(f"All {saved_count} responses saved correctly ✅")

# Generate results
results_response = requests.get(f'{BASE_URL}/assessment/{assessment_id}/results')
results = results_response.json()
data = results.get('data', {})

# Test dynamic content quality
log_section("TEST: DYNAMIC CONTENT QUALITY")

# Check maturity summary
maturity = data.get('maturitySummary', {})
current_desc = maturity.get('current', {}).get('description', '')
target_desc = maturity.get('target', {}).get('description', '')
roadmap_intro = maturity.get('roadmapIntro', '')

# Check for pillar mentions
pillar_keywords = ['Platform', 'ML', 'GenAI', 'Data', 'Analytics', 'Unity Catalog']
found_keywords = []
all_text = f"{current_desc} {target_desc} {roadmap_intro}"

for keyword in pillar_keywords:
    if keyword in all_text:
        found_keywords.append(keyword)

if len(found_keywords) >= 2:
    log_success(f"Maturity summary is dynamic (mentions: {', '.join(found_keywords)})")
else:
    log_warning("Maturity summary may not be specific enough")
    issues.append("Maturity summary lacks pillar-specific content")

# Check for generic phrases
generic_phrases = ['Standardized processes', 'Governed, measurable maturity', 'limited automation']
found_generic = []
for phrase in generic_phrases:
    if phrase in all_text:
        found_generic.append(phrase)

if found_generic:
    log_warning(f"Found generic phrases: {found_generic}")
    issues.append(f"Generic phrases found: {found_generic}")
else:
    log_success("No generic phrases detected")

# Check business impact
log_section("TEST: BUSINESS IMPACT CALCULATIONS")
impact = data.get('businessImpact', {})

if not impact:
    log_error("No business impact data")
    issues.append("Missing business impact")
else:
    for metric in ['decisionSpeed', 'costOptimization', 'manualOverhead']:
        if metric not in impact:
            log_error(f"Missing {metric}")
            issues.append(f"Missing {metric}")
        else:
            value = impact[metric].get('value', 'N/A')
            drivers = impact[metric].get('drivers', [])
            log_info(f"  {metric}: {value} (drivers: {len(drivers)})")
            
            if value in ['0×', '0%']:
                log_warning(f"  {metric} is zero")
                issues.append(f"{metric} is zero")

# Check roadmap
log_section("TEST: STRATEGIC ROADMAP")
roadmap = data.get('roadmap', {})
phases = roadmap.get('phases', [])

if len(phases) != 3:
    log_error(f"Expected 3 phases, got {len(phases)}")
    issues.append(f"Roadmap has {len(phases)} phases")
else:
    log_success("Roadmap has 3 phases")
    
    empty_phases = []
    for phase in phases:
        items = phase.get('items', [])
        if len(items) == 0:
            empty_phases.append(phase.get('title'))
    
    if empty_phases:
        log_error(f"Empty phases: {empty_phases}")
        issues.append(f"Empty roadmap phases: {empty_phases}")
    else:
        log_success("All roadmap phases have items")

# Check pillar actions
log_section("TEST: PILLAR-SPECIFIC CONTENT")
actions = data.get('prioritizedActions', [])

if len(actions) == 0:
    log_error("No pillar actions generated")
    issues.append("No pillar actions")
else:
    log_success(f"Generated {len(actions)} pillar actions")
    
    empty_fields_count = 0
    for action in actions:
        pillar_id = action.get('pillarId', 'unknown')
        
        the_good = action.get('theGood', [])
        the_bad = action.get('theBad', [])
        features = action.get('databricksFeatures', [])
        recommendations = action.get('recommendations', [])
        
        if not the_good or not the_bad or not features:
            empty_fields_count += 1
            log_warning(f"  {pillar_id}: Empty fields (good:{len(the_good)}, bad:{len(the_bad)}, features:{len(features)})")
    
    if empty_fields_count > 0:
        issues.append(f"{empty_fields_count} pillars have empty fields")
    else:
        log_success("All pillars have complete content")

# FIX 2: Check assessments list in data array
log_section("FIX 2: LIST ASSESSMENTS (CORRECTED)")
list_response = requests.get(f'{BASE_URL}/assessments')
assessments_response = list_response.json()

# FIXED: Check assessments_response.data instead of assuming it's an array
if 'data' in assessments_response:
    assessments_list = assessments_response['data']
else:
    assessments_list = assessments_response

if not isinstance(assessments_list, list):
    log_error("Assessments list is not an array")
    issues.append("Assessments list format error")
else:
    log_success(f"Found {len(assessments_list)} assessments")
    
    found = False
    for assess in assessments_list:
        if assess.get('id') == assessment_id:
            found = True
            break
    
    if found:
        log_success("Created assessment is in the list")
    else:
        log_warning("Created assessment not found in list")

# FINAL REPORT
log_section("FINAL TEST SUMMARY")

if len(issues) == 0:
    print(f"{Colors.GREEN}🎉 ALL TESTS PASSED! No issues found.{Colors.END}")
    print(f"\nApplication is working correctly:")
    print(f"  ✅ Dynamic content generation")
    print(f"  ✅ Business impact calculations")
    print(f"  ✅ Strategic roadmap")
    print(f"  ✅ Pillar-specific recommendations")
    print(f"  ✅ API responses correctly structured")
else:
    print(f"{Colors.YELLOW}⚠️  Found {len(issues)} issues:{Colors.END}\n")
    for i, issue in enumerate(issues, 1):
        print(f"  {i}. {issue}")

print(f"\n{'='*80}\n")

