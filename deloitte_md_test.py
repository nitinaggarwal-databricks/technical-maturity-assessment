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
    MAGENTA = '\033[95m'
    END = '\033[0m'

def log_critical(msg):
    print(f"{Colors.RED}🚨 CRITICAL: {msg}{Colors.END}")

def log_major(msg):
    print(f"{Colors.YELLOW}⚠️  MAJOR: {msg}{Colors.END}")

def log_minor(msg):
    print(f"{Colors.BLUE}ℹ️  MINOR: {msg}{Colors.END}")

def log_good(msg):
    print(f"{Colors.GREEN}✅ GOOD: {msg}{Colors.END}")

def log_section(msg):
    print(f"\n{'='*80}")
    print(f"{Colors.MAGENTA}{msg}{Colors.END}")
    print(f"{'='*80}\n")

# Track issues by severity
critical_issues = []
major_issues = []
minor_issues = []

log_section("DELOITTE MD PERSPECTIVE: EXECUTIVE READINESS TEST")
print("Testing from the lens of a Managing Director presenting to C-suite\n")

# Create a realistic enterprise assessment
log_section("SETUP: Creating Enterprise Assessment")

assessment_data = {
    'assessmentName': 'Global Financial Services Corp Evaluation',
    'organizationName': 'Global Financial Services Corporation',
    'industry': 'Financial Services',
    'contactEmail': 'cio@globalfinance.com'
}

result = requests.post(f'{BASE_URL}/assessment/start', json=assessment_data).json()
assessment_id = result.get('data', {}).get('assessmentId')

# Get framework
framework = requests.get(f'{BASE_URL}/assessment/framework').json()
framework_data = framework.get('data', framework)

# Create realistic enterprise pattern:
# Strong governance (4), Weak ML/GenAI (2), Medium everything else (3)
responses = {}
for area in framework_data['assessmentAreas']:
    if area['id'] == 'platform_governance':
        base_current = 4
    elif area['id'] in ['machine_learning', 'generative_ai']:
        base_current = 2
    else:
        base_current = 3
    
    for dim in area['dimensions']:
        for q in dim['questions']:
            current = max(1, min(5, base_current + random.randint(-1, 1)))
            future = min(current + random.randint(1, 2), 5)
            
            responses[f"{q['id']}_current_state"] = current
            responses[f"{q['id']}_future_state"] = future
            responses[f"{q['id']}_comment"] = f"Currently operating at level {current}. Strategic initiative to reach level {future} by Q2 2026."
            
            for perspective in q.get('perspectives', []):
                if perspective['id'] in ['technical_pain', 'business_pain']:
                    options = perspective.get('options', [])
                    if options:
                        num_pains = min(random.randint(2, 4), len(options))
                        selected = random.sample([opt['value'] for opt in options], num_pains)
                        responses[f"{q['id']}_{perspective['id']}"] = selected

requests.post(f'{BASE_URL}/assessment/{assessment_id}/bulk-submit',
             json={'responses': responses, 'completedCategories': [a['id'] for a in framework_data['assessmentAreas']]})

time.sleep(2)

# Get results
results = requests.get(f'{BASE_URL}/assessment/{assessment_id}/results').json()
data = results.get('data', {})

# ============================================================================
# MD TEST 1: EXECUTIVE SUMMARY QUALITY
# ============================================================================
log_section("MD TEST 1: EXECUTIVE SUMMARY - C-SUITE READINESS")

maturity = data.get('maturitySummary', {})
current_desc = maturity.get('current', {}).get('description', '')
target_desc = maturity.get('target', {}).get('description', '')
improvement_desc = maturity.get('improvement', {}).get('description', '')

print(f"Current Maturity Description:\n  \"{current_desc}\"\n")
print(f"Target Maturity Description:\n  \"{target_desc}\"\n")
print(f"Improvement Description:\n  \"{improvement_desc}\"\n")

# Check for professional language
unprofessional_phrases = [
    'still in early stages',
    'manual processes',
    'everything is broken',
    'not yet',
    'weak',
    'poor',
    'lacking'
]

found_unprofessional = []
all_descriptions = f"{current_desc} {target_desc} {improvement_desc}"
for phrase in unprofessional_phrases:
    if phrase.lower() in all_descriptions.lower():
        found_unprofessional.append(phrase)

if found_unprofessional:
    log_major(f"Unprofessional language: {found_unprofessional}")
    major_issues.append(f"Executive summary uses negative framing: {found_unprofessional}")
    print("  💡 Recommendation: Use forward-looking, opportunity-based language")
else:
    log_good("Executive summary uses professional, forward-looking language")

# Check for specificity
if 'Platform' in all_descriptions or 'ML' in all_descriptions or 'GenAI' in all_descriptions:
    log_good("Descriptions are specific to actual capabilities")
else:
    log_critical("Descriptions are too generic - no specific pillar/capability mentions")
    critical_issues.append("Executive summary lacks specificity for C-suite presentation")

# Check for business value framing
business_keywords = ['efficiency', 'ROI', 'competitive', 'strategic', 'revenue', 'cost', 'transformation', 'innovation']
has_business_framing = any(keyword in all_descriptions.lower() for keyword in business_keywords)

if not has_business_framing:
    log_major("Missing business value framing in executive summary")
    major_issues.append("Executive summary is too technical, lacks business context")
    print("  💡 Recommendation: Add business outcome language (cost reduction, revenue acceleration, etc.)")

# ============================================================================
# MD TEST 2: RECOMMENDATIONS DEPTH & ACTIONABILITY
# ============================================================================
log_section("MD TEST 2: RECOMMENDATIONS - DEPTH & ACTIONABILITY")

actions = data.get('prioritizedActions', [])
ml_action = next((a for a in actions if 'machine_learning' in a.get('pillarId', '')), None)

if ml_action:
    print(f"Sample Pillar: {ml_action.get('pillarName')}")
    print(f"Gap: {ml_action.get('gap')} levels\n")
    
    recommendations = ml_action.get('recommendations', [])
    databricks_features = ml_action.get('databricksFeatures', [])
    next_steps = ml_action.get('specificRecommendations', [])
    
    print(f"Recommendations ({len(recommendations)}):")
    for i, rec in enumerate(recommendations[:3], 1):
        if isinstance(rec, dict):
            print(f"  {i}. {rec.get('title', rec.get('name', 'N/A'))}")
        else:
            print(f"  {i}. {rec[:100]}...")
    
    print(f"\nDatabricks Features ({len(databricks_features)}):")
    for i, feat in enumerate(databricks_features[:3], 1):
        if isinstance(feat, dict):
            print(f"  {i}. {feat.get('name', 'N/A')}")
        else:
            print(f"  {i}. {feat}")
    
    print(f"\nNext Steps ({len(next_steps)}):")
    for i, step in enumerate(next_steps[:3], 1):
        if isinstance(step, dict):
            print(f"  {i}. {step.get('title', step.get('name', 'N/A'))}")
        else:
            print(f"  {i}. {step[:80]}...")
    
    print()
    
    # Check for actionability
    actionable_keywords = ['implement', 'deploy', 'establish', 'configure', 'migrate', 'workshop', 'pilot', 'POC']
    has_actionable = False
    
    for step in next_steps:
        step_text = step if isinstance(step, str) else str(step)
        if any(keyword in step_text.lower() for keyword in actionable_keywords):
            has_actionable = True
            break
    
    if not has_actionable:
        log_major("Next Steps lack actionable verbs (implement, deploy, establish)")
        major_issues.append("Recommendations not immediately actionable for project planning")
        print("  💡 Recommendation: Each step should start with action verb + timeline")
    else:
        log_good("Next Steps are actionable with clear action verbs")
    
    # Check for business case
    if len(recommendations) > 0 and len(databricks_features) > 0:
        # Do features align with challenges?
        challenges = ml_action.get('theBad', [])
        if challenges:
            log_good(f"Found {len(challenges)} challenges to address")
            
            # Check if features solve challenges
            challenge_text = ' '.join(challenges).lower()
            feature_names = [f.get('name', '') if isinstance(f, dict) else f for f in databricks_features]
            
            # This is hard to validate automatically, but we can check if there's variety
            if len(set(feature_names)) < len(feature_names) * 0.5:
                log_major("Feature recommendations show repetition - may lack depth")
                major_issues.append("Databricks features lack variety/depth for enterprise engagement")

# ============================================================================
# MD TEST 3: BUSINESS IMPACT CREDIBILITY
# ============================================================================
log_section("MD TEST 3: BUSINESS IMPACT - CREDIBILITY & DEFENSIBILITY")

impact = data.get('businessImpact', {})

for metric_name, metric_label in [
    ('decisionSpeed', 'Decision Speed'),
    ('costOptimization', 'Cost Optimization'),
    ('manualOverhead', 'Manual Overhead Reduction')
]:
    metric = impact.get(metric_name, {})
    value = metric.get('value', 'N/A')
    drivers = metric.get('drivers', [])
    
    print(f"{metric_label}: {value}")
    print(f"  Drivers: {drivers}")
    print()
    
    # Check for extreme values
    if metric_name == 'decisionSpeed':
        multiplier = float(value.replace('×', '')) if '×' in value else 0
        if multiplier > 5.0:
            log_critical(f"Decision Speed {value} is unrealistic for C-suite presentation")
            critical_issues.append(f"Business impact {value} will not be credible to CFO/CEO")
            print("  💡 Recommendation: Cap at 3-4× maximum for credibility")
    
    if metric_name == 'costOptimization':
        pct = int(value.replace('%', '')) if '%' in value else 0
        if pct > 40:
            log_critical(f"Cost optimization {value} will be challenged by finance team")
            critical_issues.append(f"Cost savings {value} lacks credibility without detailed business case")
            print("  💡 Recommendation: Cap at 25-30% unless backed by industry benchmarks")
    
    if metric_name == 'manualOverhead':
        pct = int(value.replace('%', '')) if '%' in value else 0
        if pct > 65:
            log_major(f"Overhead reduction {value} is aggressive - needs validation")
            major_issues.append(f"Overhead reduction {value} may be questioned in exec review")
            print("  💡 Recommendation: Provide case study references for >50% claims")
    
    # Check for driver specificity
    if len(drivers) == 0:
        log_critical(f"{metric_label} has no drivers - cannot defend to CFO")
        critical_issues.append(f"{metric_label} lacks justification/methodology")
    elif len(drivers) < 2:
        log_major(f"{metric_label} has only 1 driver - analysis may seem shallow")
        major_issues.append(f"{metric_label} needs more comprehensive analysis")
    else:
        log_good(f"{metric_label} has {len(drivers)} drivers for credibility")

# ============================================================================
# MD TEST 4: STRATEGIC ROADMAP - EXECUTIVE ALIGNMENT
# ============================================================================
log_section("MD TEST 4: STRATEGIC ROADMAP - EXECUTIVE ALIGNMENT")

roadmap = data.get('roadmap', {})
roadmap_intro = maturity.get('roadmapIntro', '')

print(f"Roadmap Introduction:\n  \"{roadmap_intro}\"\n")

# Check for strategic framing
strategic_keywords = ['strategic', 'initiative', 'transformation', 'capability', 'competitive', 'advantage']
has_strategic_framing = any(keyword in roadmap_intro.lower() for keyword in strategic_keywords)

if not has_strategic_framing:
    log_major("Roadmap intro lacks strategic/transformational framing")
    major_issues.append("Roadmap not positioned as strategic initiative for board-level buy-in")
    print("  💡 Recommendation: Frame as transformation/strategic initiative, not just tech upgrade")

phases = roadmap.get('phases', [])
for phase in phases:
    title = phase.get('title', '')
    items = phase.get('items', [])
    
    print(f"{title}:")
    for item in items:
        print(f"  • {item}")
    print()
    
    # Check for technical jargon overload
    jargon_words = ['API', 'SDK', 'CLI', 'YAML', 'JSON', 'REST', 'HTTP']
    jargon_count = sum(1 for item in items for word in jargon_words if word in item)
    
    if jargon_count > 3:
        log_major(f"{title} has excessive technical jargon ({jargon_count} instances)")
        major_issues.append(f"{title}: Too technical for C-suite presentation")
        print("  💡 Recommendation: Use business language (e.g., 'governance platform' vs 'Unity Catalog API')")
    
    # Check for business outcomes
    outcome_keywords = ['reduce', 'increase', 'improve', 'accelerate', 'enable', 'achieve']
    has_outcomes = any(any(keyword in item.lower() for keyword in outcome_keywords) for item in items)
    
    if not has_outcomes and items:
        log_minor(f"{title} focuses on activities vs outcomes")
        minor_issues.append(f"{title}: Add business outcomes to each phase")

# ============================================================================
# MD TEST 5: DATA QUALITY & DEPTH
# ============================================================================
log_section("MD TEST 5: DATA QUALITY - DEPTH OF ANALYSIS")

# Check pillar coverage
print(f"Assessment Coverage: {len(actions)} pillars\n")

for action in actions:
    pillar_name = action.get('pillarName', 'Unknown')
    gap = action.get('gap', 0)
    priority = action.get('priority', 'unknown')
    
    the_good = action.get('theGood', [])
    the_bad = action.get('theBad', [])
    features = action.get('databricksFeatures', [])
    
    print(f"{pillar_name}:")
    print(f"  Gap: {gap} levels | Priority: {priority.upper()}")
    print(f"  What's Working: {len(the_good)} items")
    print(f"  Key Challenges: {len(the_bad)} items")
    print(f"  Databricks Features: {len(features)} recommendations")
    
    # Check for depth
    if len(the_good) < 2:
        log_minor(f"{pillar_name}: Shallow 'What's Working' analysis ({len(the_good)} items)")
        minor_issues.append(f"{pillar_name}: Add more strengths for balanced view")
    
    if len(the_bad) < 3:
        log_major(f"{pillar_name}: Insufficient challenge identification ({len(the_bad)} items)")
        major_issues.append(f"{pillar_name}: Needs deeper challenge analysis for consulting credibility")
    
    if len(features) < 2:
        log_major(f"{pillar_name}: Limited recommendations ({len(features)} features)")
        major_issues.append(f"{pillar_name}: Provide more solution options for client choice")
    
    # Check for balance (shouldn't be all bad or all good)
    if len(the_good) == 0 and len(the_bad) > 0:
        log_major(f"{pillar_name}: All negative - lacks balanced perspective")
        major_issues.append(f"{pillar_name}: Show strengths to build on, not just problems")
    
    print()

# ============================================================================
# MD TEST 6: PRESENTATION POLISH
# ============================================================================
log_section("MD TEST 6: PRESENTATION QUALITY - CLIENT READINESS")

# Check for placeholder text (as standalone words, not substrings)
import re
placeholder_phrases = {
    'lorem': r'\blorem\b',
    'ipsum': r'\bipsum\b', 
    'TODO': r'\bTODO\b',
    'FIXME': r'\bFIXME\b',
    'placeholder': r'\bplaceholder\b',
    'N/A': r'\bN/A\b',
    'TBD': r'\bTBD\b',
    'test data': r'\btest\s+data\b',
    'sample data': r'\bsample\s+data\b'
}
found_placeholders = []

all_content = json.dumps(data)
for phrase, pattern in placeholder_phrases.items():
    if re.search(pattern, all_content, re.IGNORECASE):
        found_placeholders.append(phrase)

if found_placeholders:
    log_critical(f"Found placeholder text: {set(found_placeholders)}")
    critical_issues.append(f"Placeholder text present - NOT CLIENT-READY: {found_placeholders}")
else:
    log_good("No placeholder text detected")

# Check for consistent terminology
terminology_check = {
    'GenAI vs Generative AI': all_content.count('GenAI') > 0 and all_content.count('Generative AI') > 0,
    'ML vs Machine Learning': all_content.count(' ML ') > 0 and all_content.count('Machine Learning') > 0,
}

inconsistent_terms = [k for k, v in terminology_check.items() if v]
if inconsistent_terms:
    log_minor(f"Inconsistent terminology: {inconsistent_terms}")
    minor_issues.append(f"Standardize terminology: {inconsistent_terms}")
else:
    log_good("Terminology is consistent")

# ============================================================================
# FINAL MD REVIEW
# ============================================================================
log_section("MANAGING DIRECTOR FINAL REVIEW")

total_issues = len(critical_issues) + len(major_issues) + len(minor_issues)

print(f"Issue Summary:")
print(f"  🚨 Critical (Client-Blocking): {len(critical_issues)}")
print(f"  ⚠️  Major (Quality Issues): {len(major_issues)}")
print(f"  ℹ️  Minor (Polish Items): {len(minor_issues)}")
print(f"\n  Total Issues: {total_issues}\n")

if critical_issues:
    print(f"{Colors.RED}CRITICAL ISSUES - DO NOT PRESENT TO CLIENT:{Colors.END}\n")
    for i, issue in enumerate(critical_issues, 1):
        print(f"  {i}. {issue}")
    print()

if major_issues:
    print(f"{Colors.YELLOW}MAJOR ISSUES - NEED FIXING BEFORE EXEC REVIEW:{Colors.END}\n")
    for i, issue in enumerate(major_issues, 1):
        print(f"  {i}. {issue}")
    print()

if minor_issues:
    print(f"{Colors.BLUE}MINOR ISSUES - POLISH BEFORE CLIENT DELIVERY:{Colors.END}\n")
    for i, issue in enumerate(minor_issues, 1):
        print(f"  {i}. {issue}")
    print()

# Final verdict
print("="*80)
if len(critical_issues) > 0:
    print(f"{Colors.RED}VERDICT: NOT READY FOR C-SUITE PRESENTATION{Colors.END}")
    print("Critical issues must be resolved before client engagement.")
elif len(major_issues) > 5:
    print(f"{Colors.YELLOW}VERDICT: NEEDS SIGNIFICANT IMPROVEMENT{Colors.END}")
    print("Major quality issues need addressing for Deloitte standards.")
elif len(major_issues) > 0:
    print(f"{Colors.YELLOW}VERDICT: GOOD, BUT NEEDS POLISH{Colors.END}")
    print("Address major issues to ensure client confidence.")
else:
    print(f"{Colors.GREEN}VERDICT: EXECUTIVE-READY{Colors.END}")
    print("Quality meets consulting firm standards for C-suite delivery.")
print("="*80 + "\n")

