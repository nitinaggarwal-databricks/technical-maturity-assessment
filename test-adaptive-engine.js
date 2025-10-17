#!/usr/bin/env node
// Test script for Adaptive Recommendation Engine

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAdaptiveEngine() {
  console.log('🧪 Testing Adaptive Recommendation Engine\n');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Create a test assessment
    console.log('\n📝 Step 1: Creating test assessment...');
    const startResponse = await axios.post(`${API_BASE}/assessment/start`, {
      organizationName: 'Test Corp',
      contactEmail: 'test@example.com',
      industry: 'Technology',
      assessmentName: 'Adaptive Engine Test',
      assessmentDescription: 'Testing the adaptive recommendation engine'
    });
    
    const assessmentId = startResponse.data.data.assessmentId;
    console.log(`✅ Assessment created: ${assessmentId}`);
    
    // Step 2: Submit test responses with varying maturity levels and pain points
    console.log('\n📊 Step 2: Submitting test responses...');
    console.log('   - Current State: Level 2 (Developing)');
    console.log('   - Future State: Level 4 (Managed)');
    console.log('   - Technical Pain: Performance issues, Data quality');
    console.log('   - Business Pain: Slow insights, Compliance challenges');
    console.log('   - Comment: "We have URGENT data quality problems affecting regulatory reports"');
    
    const testResponses = {
      // Question 1: Environment Standardization (example)
      'env_standardization_current_state': 2,  // Developing
      'env_standardization_future_state': 4,   // Managed
      'env_standardization_technical_pain': ['performance_issues', 'data_quality_issues'],
      'env_standardization_business_pain': ['slow_time_to_insights', 'compliance_challenges'],
      'env_standardization_comment': 'We have URGENT data quality problems affecting our regulatory reports. This is causing significant compliance risk and needs immediate attention.',
      
      // Question 2: Scaling effectiveness
      'scaling_effectiveness_current_state': 2,
      'scaling_effectiveness_future_state': 4,
      'scaling_effectiveness_technical_pain': ['scalability_concerns', 'cost_management'],
      'scaling_effectiveness_business_pain': ['limited_self_service', 'roi_concerns'],
      'scaling_effectiveness_comment': 'Our current infrastructure cannot scale to meet growing demand. Performance degrades significantly under load.',
      
      // Question 3: Another example
      'data_lake_maturity_current_state': 1,
      'data_lake_maturity_future_state': 5,
      'data_lake_maturity_technical_pain': ['integration_complexity', 'lack_of_automation'],
      'data_lake_maturity_business_pain': ['data_silos', 'skill_gaps'],
      'data_lake_maturity_comment': 'Critical issue: We need to modernize quickly but lack the expertise. This is blocking strategic initiatives.'
    };
    
    // Submit responses
    await axios.post(`${API_BASE}/assessment/${assessmentId}/save-progress`, {
      responses: testResponses
    });
    console.log('✅ Test responses submitted');
    
    // Step 3: Get STANDARD results (old engine)
    console.log('\n📈 Step 3: Getting STANDARD results (old engine)...');
    const standardResults = await axios.get(`${API_BASE}/assessment/${assessmentId}/results`);
    console.log('✅ Standard results generated');
    console.log('   Structure:', Object.keys(standardResults.data.data));
    
    // Step 4: Get ADAPTIVE results (new engine)
    console.log('\n🎯 Step 4: Getting ADAPTIVE results (new engine)...');
    const adaptiveResults = await axios.get(`${API_BASE}/assessment/${assessmentId}/adaptive-results`);
    console.log('✅ Adaptive results generated');
    
    const data = adaptiveResults.data.data;
    
    // Display results
    console.log('\n' + '='.repeat(60));
    console.log('🎊 ADAPTIVE RECOMMENDATION ENGINE RESULTS');
    console.log('='.repeat(60));
    
    // Overall scores
    console.log('\n📊 OVERALL SCORES:');
    console.log(`   Current Score: ${data.overall.currentScore}/5 (${data.overall.level.name})`);
    console.log(`   Future Score: ${data.overall.futureScore}/5`);
    console.log(`   Gap: ${data.overall.gap} levels`);
    console.log(`\n   Summary: ${data.overall.summary}`);
    
    // Category breakdown
    console.log('\n📂 CATEGORY BREAKDOWN:');
    Object.entries(data.categories).forEach(([areaId, category]) => {
      console.log(`\n   ${category.name}:`);
      console.log(`      Current: ${category.currentScore}/5`);
      console.log(`      Future: ${category.futureScore}/5`);
      console.log(`      Gap: ${category.gap} levels`);
      console.log(`      Recommendations: ${category.recommendations.length}`);
    });
    
    // Pain point recommendations
    if (data.painPointRecommendations && data.painPointRecommendations.length > 0) {
      console.log('\n🔴 PAIN POINT RECOMMENDATIONS:');
      data.painPointRecommendations.slice(0, 3).forEach((rec, idx) => {
        console.log(`\n   ${idx + 1}. ${rec.title}`);
        console.log(`      Priority: ${rec.priority.toUpperCase()}`);
        console.log(`      Type: ${rec.type}`);
        console.log(`      Frequency: ${rec.frequency}x mentioned`);
        console.log(`      Impact: ${rec.impact}`);
        console.log(`      Actions: ${rec.actions.slice(0, 2).join(', ')}...`);
      });
    }
    
    // Gap-based actions
    if (data.gapBasedActions && data.gapBasedActions.length > 0) {
      console.log('\n📈 GAP-BASED ACTIONS:');
      data.gapBasedActions.slice(0, 3).forEach((action, idx) => {
        console.log(`\n   ${idx + 1}. ${action.title}`);
        console.log(`      Area: ${action.area}`);
        console.log(`      Gap: ${action.currentLevel} → ${action.targetLevel} (${action.gap} levels)`);
        console.log(`      Priority: ${action.priority.toUpperCase()}`);
        console.log(`      Timeline: ${action.timeline}`);
      });
    }
    
    // Comment insights
    if (data.commentBasedInsights && data.commentBasedInsights.length > 0) {
      console.log('\n💬 COMMENT INSIGHTS:');
      data.commentBasedInsights.forEach((insight, idx) => {
        console.log(`\n   ${idx + 1}. ${insight.areaName} - ${insight.questionTopic}`);
        console.log(`      Comment: "${insight.comment.substring(0, 80)}..."`);
        console.log(`      Urgency: ${insight.keywords.urgency ? '🚨 YES' : 'No'}`);
        console.log(`      Negative: ${insight.keywords.negative ? 'Yes' : 'No'}`);
        console.log(`      Cost-related: ${insight.keywords.cost ? 'Yes' : 'No'}`);
      });
    }
    
    // Prioritized actions
    if (data.prioritizedActions && data.prioritizedActions.length > 0) {
      console.log('\n⭐ TOP PRIORITIZED ACTIONS:');
      data.prioritizedActions.slice(0, 5).forEach((action, idx) => {
        console.log(`\n   ${idx + 1}. [${action.priority.toUpperCase()}] ${action.title}`);
        console.log(`      Category: ${action.category}`);
        if (action.gap) console.log(`      Gap: ${action.gap} levels`);
        console.log(`      ${action.impact || action.description || ''}`);
      });
    }
    
    // Executive Summary
    if (data.executiveSummary) {
      console.log('\n📋 EXECUTIVE SUMMARY:');
      const exec = data.executiveSummary;
      
      if (exec.currentState) {
        console.log(`\n   Current State: Level ${exec.currentState.score} - ${exec.currentState.level.name}`);
        console.log(`   ${exec.currentState.description}`);
      }
      
      if (exec.desiredState) {
        console.log(`\n   Desired State: Level ${exec.desiredState.score} - ${exec.desiredState.level.name}`);
        console.log(`   ${exec.desiredState.description}`);
      }
      
      if (exec.gap) {
        console.log(`\n   Gap Analysis: ${exec.gap.levels} levels`);
        console.log(`   ${exec.gap.description}`);
        console.log(`   Effort Required: ${exec.gap.effort}`);
      }
      
      if (exec.keyPainPoints) {
        console.log(`\n   Top Technical Pain Points:`);
        exec.keyPainPoints.technical.slice(0, 3).forEach(pp => {
          console.log(`      - ${pp.description} (${pp.count}x)`);
        });
        
        console.log(`\n   Top Business Pain Points:`);
        exec.keyPainPoints.business.slice(0, 3).forEach(pp => {
          console.log(`      - ${pp.description} (${pp.count}x)`);
        });
      }
      
      if (exec.estimatedTimeline) {
        console.log(`\n   Timeline: ${exec.estimatedTimeline}`);
      }
      
      if (exec.investmentLevel) {
        console.log(`   Investment: ${exec.investmentLevel}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test completed successfully!');
    console.log('='.repeat(60));
    
    console.log('\n📝 KEY DIFFERENCES FROM STANDARD ENGINE:');
    console.log('   ✓ Analyzes current vs. future state gaps');
    console.log('   ✓ Generates specific recommendations for each pain point');
    console.log('   ✓ Extracts insights and urgency from comments');
    console.log('   ✓ Prioritizes based on ALL inputs, not just scores');
    console.log('   ✓ Provides personalized rationale for each recommendation');
    console.log('   ✓ Includes verbatim quotes from user comments');
    console.log('   ✓ Comprehensive executive summary with all context');
    
    console.log('\n🎯 To use the adaptive engine in production:');
    console.log('   Replace endpoint: /api/assessment/:id/results');
    console.log('   With: /api/assessment/:id/adaptive-results');
    console.log('   Or update the results endpoint to use adaptiveRecommendationEngine\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testAdaptiveEngine().then(() => {
  console.log('\n✨ Done! Check the results above.\n');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});



