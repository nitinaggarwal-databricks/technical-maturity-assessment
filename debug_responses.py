import requests
import json
import time
import random

BASE_URL = "http://localhost:5000/api"

print("DEBUG: Testing response saving\n" + "="*80 + "\n")

# Create assessment
assessment_data = {
    'assessmentName': 'Debug Test',
    'organizationName': 'Test Org',
    'industry': 'Technology',
    'contactEmail': 'test@example.com'
}

result = requests.post(f'{BASE_URL}/assessment/start', json=assessment_data).json()
assessment_id = result.get('data', {}).get('assessmentId') or result.get('assessmentId')

print(f"Created assessment: {assessment_id}\n")

# Create simple responses
responses = {
    'security_controls_current_state': 3,
    'security_controls_future_state': 4,
    'security_controls_comment': 'Test comment',
    'security_controls_technical_pain': ['weak_access_control']
}

print(f"Submitting {len(responses)} responses...")
submit_response = requests.post(
    f'{BASE_URL}/assessment/{assessment_id}/bulk-submit',
    json={'responses': responses, 'completedCategories': ['platform_governance']}
)

print(f"Submit response status: {submit_response.status_code}")
print(f"Submit response: {json.dumps(submit_response.json(), indent=2)}\n")

# Wait
time.sleep(2)

# Check status
print(f"Checking status...")
status_response = requests.get(f'{BASE_URL}/assessment/{assessment_id}/status')
status = status_response.json()

print(f"Status response: {json.dumps(status, indent=2)}\n")

# Extract responses
if 'data' in status:
    saved_responses = status['data'].get('responses', {})
else:
    saved_responses = status.get('responses', {})

print(f"Saved responses count: {len(saved_responses)}")
print(f"Saved responses keys: {list(saved_responses.keys())}")

if len(saved_responses) == len(responses):
    print("\n✅ All responses saved correctly!")
else:
    print(f"\n❌ Response mismatch: {len(saved_responses)} saved vs {len(responses)} expected")

