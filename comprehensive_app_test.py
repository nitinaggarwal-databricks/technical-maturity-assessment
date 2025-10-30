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

log_section("COMPREHENSIVE APPLICATION TEST")
log_info("Testing all functionality, APIs, and logic...")

# ============================================================================
# TEST 1: HEALTH CHECK
# ============================================================================
log_section("TEST 1: HEALTH CHECK")
try:
    response = requests.get(f'{BASE_URL}/health', timeout=5)
    if response.status_code == 200:
        log_success("Server is running")
    else:
        log_error(f"Server health check failed: {response.status_code}")
        issues.append("Health check failed")
except Exception as e:
    log_error(f"Cannot connect to server: {e}")
    issues.append(f"Server connection failed: {e}")
    exit(1)

# ============================================================================
# TEST 2: FRAMEWORK ENDPOINT
# ============================================================================
log_section("TEST 2: FRAMEWORK ENDPOINT")
try:
    response = requests.get(f'{BASE_URL}/assessment/framework')
    framework = response.json()
    
    # Check structure
    if not framework.get('success'):
        log_error("Framework endpoint doesn't return success flag")
        issues.append("Framework: Missing success flag")
    
    framework_data = framework.get('data', framework)
    
    if not framework_data.get('assessmentAreas'):
        log_error("Framework missing assessmentAreas")
        issues.append("Framework: Missing assessmentAreas")
    else:
        areas = framework_data['assessmentAreas']
        log_success(f"Framework loaded: {len(areas)} pillars")
        
        # Validate each pillar
        for area in areas:
            if not area.get('dimensions'):
                log_error(f"Pillar {area.get('id')} missing dimensions")
                issues.append(f"Framework: {area.get('id')} missing dimensions")
            else:
                total_questions = sum(len(dim.get('questions', [])) for dim in area['dimensions'])
                log_info(f"  {area.get('name')}: {len(area['dimensions'])} dimensions, {total_questions} questions")
                
                # Check for pain point options
                for dim in area['dimensions']:
                    for q in dim.get('questions', []):
                        perspectives = q.get('perspectives', [])
                        has_technical_pain = any(p['id'] == 'technical_pain' for p in perspectives)
                        has_business_pain = any(p['id'] == 'business_pain' for p in perspectives)
                        
                        if not has_technical_pain:
                            log_warning(f"Question {q.get('id')} missing technical_pain perspective")
                        if not has_business_pain:
                            log_warning(f"Question {q.get('id')} missing business_pain perspective")
        
except Exception as e:
    log_error(f"Framework test failed: {e}")
    issues.append(f"Framework test failed: {e}")

# ============================================================================
# TEST 3: CREATE ASSESSMENT
# ============================================================================
log_section("TEST 3: CREATE ASSESSMENT")
try:
    assessment_data = {
        'assessmentName': f'Comprehensive Test {time.time()}',
        'organizationName': 'Test Organization',
        'industry': 'Technology',
        'contactEmail': 'test@example.com'
    }
    
    response = requests.post(f'{BASE_URL}/assessment/start', json=assessment_data)
    result = response.json()
    
    if not result.get('success'):
        log_error(f"Assessment creation failed: {result.get('message')}")
        issues.append("Assessment creation failed")
        exit(1)
    
    assessment_id = result.get('data', {}).get('assessmentId') or result.get('assessmentId')
    
    if not assessment_id:
        log_error("No assessment ID returned")
        issues.append("Assessment creation: No ID returned")
        exit(1)
    
    log_success(f"Assessment created: {assessment_id}")
    
except Exception as e:
    log_error(f"Assessment creation failed: {e}")
    issues.append(f"Assessment creation failed: {e}")
    exit(1)

# ============================================================================
# TEST 4: SUBMIT RESPONSES (VARIED PATTERN)
# ============================================================================
log_section("TEST 4: SUBMIT RESPONSES")
try:
    # Create a realistic pattern:
    # - Platform & Data Engineering: Strong (4)
    # - Analytics: Medium (3)
    # - ML & GenAI: Weak (2)
    # - Operational Excellence: Medium (3)
    
    responses = {}
    completed_categories = []
    
    for area in framework_data['assessmentAreas']:
        pillar_id = area['id']
        
        # Assign different maturity patterns
        if pillar_id in ['platform_governance', 'data_engineering']:
            base_current = 4
        elif pillar_id in ['analytics_bi', 'operational_excellence']:
            base_current = 3
        else:  # ML, GenAI
            base_current = 2
        
        for dim in area['dimensions']:
            for q in dim['questions']:
                current = max(1, min(5, base_current + random.randint(-1, 1)))
                future = min(current + random.randint(1, 2), 5)
                
                responses[f"{q['id']}_current_state"] = current
                responses[f"{q['id']}_future_state"] = future
                responses[f"{q['id']}_comment"] = f"Currently at level {current}, targeting {future}"
                
                # Add pain points
                for perspective in q.get('perspectives', []):
                    if perspective['id'] in ['technical_pain', 'business_pain']:
                        options = perspective.get('options', [])
                        if options:
                            num_pains = min(random.randint(1, 3), len(options))
                            selected = random.sample([opt['value'] for opt in options], num_pains)
                            responses[f"{q['id']}_{perspective['id']}"] = selected
        
        completed_categories.append(pillar_id)
    
    log_info(f"Submitting {len(responses)} responses...")
    
    submit_response = requests.post(
        f'{BASE_URL}/assessment/{assessment_id}/bulk-submit',
        json={'responses': responses, 'completedCategories': completed_categories}
    )
    
    if submit_response.status_code != 200:
        log_error(f"Bulk submit failed: {submit_response.status_code}")
        issues.append(f"Bulk submit failed: {submit_response.text}")
    else:
        log_success("Responses submitted successfully")
    
    # Wait for file I/O
    time.sleep(2)
    
except Exception as e:
    log_error(f"Response submission failed: {e}")
    issues.append(f"Response submission failed: {e}")

# ============================================================================
# TEST 5: VERIFY RESPONSES SAVED
# ============================================================================
log_section("TEST 5: VERIFY RESPONSES SAVED")
try:
    status_response = requests.get(f'{BASE_URL}/assessment/{assessment_id}/status')
    status = status_response.json()
    
    saved_responses = status.get('responses', {})
    saved_count = len(saved_responses)
    expected_count = len(responses)
    
    if saved_count == 0:
        log_error("No responses saved!")
        issues.append("No responses were saved to backend")
    elif saved_count < expected_count:
        log_warning(f"Only {saved_count}/{expected_count} responses saved")
        issues.append(f"Response mismatch: {saved_count}/{expected_count}")
    else:
        log_success(f"All {saved_count} responses saved correctly")
    
except Exception as e:
    log_error(f"Status check failed: {e}")
    issues.append(f"Status check failed: {e}")

# ============================================================================
# TEST 6: GENERATE OVERALL RESULTS
# ============================================================================
log_section("TEST 6: GENERATE OVERALL RESULTS")
try:
    results_response = requests.get(f'{BASE_URL}/assessment/{assessment_id}/results')
    results = results_response.json()
    
    if not results.get('success'):
        log_error(f"Results generation failed: {results.get('message')}")
        issues.append("Results generation failed")
    else:
        data = results.get('data', {})
        
        # Check all expected fields
        required_fields = [
            'prioritizedActions',
            'roadmap',
            'businessImpact',
            'maturitySummary',
            'categoryDetails'
        ]
        
        for field in required_fields:
            if field not in data:
                log_error(f"Results missing '{field}'")
                issues.append(f"Results missing '{field}'")
            else:
                log_success(f"Results include '{field}'")
        
        # Validate prioritizedActions
        actions = data.get('prioritizedActions', [])
        if len(actions) == 0:
            log_error("No prioritizedActions generated")
            issues.append("No prioritizedActions")
        else:
            log_success(f"Generated {len(actions)} pillar actions")
            
            # Check each pillar action
            for action in actions:
                pillar_id = action.get('pillarId', 'unknown')
                
                # Check required fields in each action
                action_fields = ['theGood', 'theBad', 'recommendations', 'databricksFeatures']
                missing = []
                empty = []
                
                for field in action_fields:
                    if field not in action:
                        missing.append(field)
                    elif not action.get(field):
                        empty.append(field)
                
                if missing:
                    log_error(f"  {pillar_id}: Missing fields: {missing}")
                    issues.append(f"{pillar_id}: Missing {missing}")
                
                if empty:
                    log_warning(f"  {pillar_id}: Empty fields: {empty}")
                    issues.append(f"{pillar_id}: Empty {empty}")
                
                # Check content quality
                the_good = action.get('theGood', [])
                the_bad = action.get('theBad', [])
                features = action.get('databricksFeatures', [])
                
                if the_good:
                    # Check for generic content
                    generic_phrases = ['Version control', 'Testing is in place', 'Documentation is in place']
                    for phrase in generic_phrases:
                        if any(phrase in item for item in the_good):
                            log_warning(f"  {pillar_id}: Generic 'What's Working' content: {phrase}")
                
                if the_bad and features:
                    # Check if features solve challenges
                    bad_text = ' '.join(the_bad).lower()
                    feature_names = [f.get('name', '') for f in features if isinstance(f, dict)]
                    
                    # Just log for review, don't fail
                    log_info(f"  {pillar_id}: {len(the_bad)} challenges, {len(features)} features")
        
        # Validate roadmap
        roadmap = data.get('roadmap', {})
        phases = roadmap.get('phases', [])
        
        if len(phases) != 3:
            log_error(f"Roadmap should have 3 phases, has {len(phases)}")
            issues.append(f"Roadmap has {len(phases)} phases instead of 3")
        else:
            log_success("Roadmap has 3 phases")
            
            for phase in phases:
                items = phase.get('items', [])
                if len(items) == 0:
                    log_error(f"Phase {phase.get('title')} has no items")
                    issues.append(f"Empty roadmap phase: {phase.get('title')}")
        
        # Validate businessImpact
        impact = data.get('businessImpact', {})
        impact_metrics = ['decisionSpeed', 'costOptimization', 'manualOverhead']
        
        for metric in impact_metrics:
            if metric not in impact:
                log_error(f"BusinessImpact missing '{metric}'")
                issues.append(f"BusinessImpact missing '{metric}'")
            else:
                value = impact[metric].get('value')
                if not value or value in ['0×', '0%']:
                    log_warning(f"BusinessImpact {metric} is zero: {value}")
        
        # Validate maturitySummary
        maturity = data.get('maturitySummary', {})
        maturity_parts = ['current', 'target', 'improvement', 'roadmapIntro']
        
        for part in maturity_parts:
            if part not in maturity:
                log_error(f"MaturitySummary missing '{part}'")
                issues.append(f"MaturitySummary missing '{part}'")
            elif part == 'roadmapIntro':
                intro = maturity.get('roadmapIntro', '')
                if 'This roadmap outlines' in intro:
                    log_warning("Roadmap intro is still generic static text")
                    issues.append("Roadmap intro not dynamic")
            else:
                desc = maturity[part].get('description', '')
                if not desc:
                    log_error(f"MaturitySummary {part} has no description")
                    issues.append(f"MaturitySummary {part} empty")
                elif part in ['current', 'target']:
                    # Check for generic phrases
                    generic = ['Standardized processes', 'Governed, measurable maturity']
                    if any(phrase in desc for phrase in generic):
                        log_warning(f"MaturitySummary {part} is generic")
                        issues.append(f"MaturitySummary {part} is generic")
        
except Exception as e:
    log_error(f"Results test failed: {e}")
    issues.append(f"Results test failed: {e}")

# ============================================================================
# TEST 7: PILLAR-SPECIFIC RESULTS
# ============================================================================
log_section("TEST 7: PILLAR-SPECIFIC RESULTS")
try:
    test_pillars = ['platform_governance', 'machine_learning', 'generative_ai']
    
    for pillar_id in test_pillars:
        pillar_response = requests.get(f'{BASE_URL}/assessment/{assessment_id}/pillar/{pillar_id}/results')
        pillar_results = pillar_response.json()
        
        if not pillar_results.get('success'):
            log_error(f"Pillar {pillar_id} results failed")
            issues.append(f"Pillar {pillar_id} results failed")
        else:
            log_success(f"Pillar {pillar_id} results generated")
            
            # Check structure
            data = pillar_results
            if 'recommendations' not in data or 'databricksFeatures' not in data:
                log_error(f"Pillar {pillar_id} missing recommendations or features")
                issues.append(f"Pillar {pillar_id} incomplete results")
    
except Exception as e:
    log_error(f"Pillar results test failed: {e}")
    issues.append(f"Pillar results test failed: {e}")

# ============================================================================
# TEST 8: LIST ASSESSMENTS
# ============================================================================
log_section("TEST 8: LIST ASSESSMENTS")
try:
    list_response = requests.get(f'{BASE_URL}/assessments')
    assessments_list = list_response.json()
    
    if not isinstance(assessments_list, list):
        log_error("Assessments list is not an array")
        issues.append("Assessments list format error")
    else:
        log_success(f"Found {len(assessments_list)} assessments")
        
        # Find our assessment
        found = False
        for assess in assessments_list:
            if assess.get('id') == assessment_id:
                found = True
                break
        
        if not found:
            log_warning(f"Created assessment {assessment_id} not in list")
    
except Exception as e:
    log_error(f"List assessments test failed: {e}")
    issues.append(f"List assessments failed: {e}")

# ============================================================================
# FINAL REPORT
# ============================================================================
log_section("TEST SUMMARY")

if len(issues) == 0:
    log_success("ALL TESTS PASSED! No issues found.")
else:
    log_warning(f"Found {len(issues)} issues:\n")
    for i, issue in enumerate(issues, 1):
        print(f"  {i}. {issue}")

print(f"\n{'='*80}\n")

