#!/usr/bin/env node

/**
 * END-TO-END USER WORKFLOW TEST
 * 
 * Simulates exactly how a user would interact with the application:
 * 1. Create new assessment
 * 2. Fill in Platform pillar questions
 * 3. View individual pillar results
 * 4. View overall results
 * 5. View executive summary
 * 6. Make changes to responses
 * 7. Verify all three views update correctly
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const API_BASE_URL = 'http://localhost:5000/api';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
}

async function apiCall(method, endpoint, data = null) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = { method, url };
    if (data) config.data = data;
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runUserWorkflow() {
  log('\n' + '='.repeat(80), colors.bright);
  log('🧪 END-TO-END USER WORKFLOW TEST', colors.bright + colors.magenta);
  log('='.repeat(80) + '\n', colors.bright);

  try {
    // ========================================================================
    // STEP 1: User creates a new assessment
    // ========================================================================
    log('📝 STEP 1: User creates a new assessment', colors.cyan + colors.bright);
    log('─'.repeat(80), colors.cyan);
    
    const createResult = await apiCall('POST', '/assessment/start', {
      assessmentName: 'User Workflow Test',
      organizationName: 'Test Company',
      contactEmail: 'user@test.com',
      industry: 'Technology'
    });

    if (!createResult.success) {
      log('❌ Failed to create assessment', colors.red);
      return;
    }

    const assessmentId = createResult.data.data.assessmentId;
    log(`✅ Assessment created: ${assessmentId}`, colors.green);

    // ========================================================================
    // STEP 2: User fills in Platform pillar (5 questions)
    // ========================================================================
    log('\n📝 STEP 2: User fills Platform pillar questions', colors.cyan + colors.bright);
    log('─'.repeat(80), colors.cyan);
    
    const platformQuestions = [
      { id: 'env_standardization', current: 2, future: 4, techPain: ['performance_issues'], bizPain: ['slow_time_to_insights'] },
      { id: 'scaling_effectiveness', current: 2, future: 4, techPain: ['scalability_concerns'], bizPain: ['limited_self_service'] },
      { id: 'auth_consistency', current: 3, future: 4, techPain: ['security_gaps'], bizPain: [] },
      { id: 'security_controls', current: 3, future: 5, techPain: ['security_gaps'], bizPain: ['compliance_challenges'] },
      { id: 'governance_centralization', current: 2, future: 4, techPain: ['governance_complexity'], bizPain: ['compliance_challenges'] }
    ];

    for (const q of platformQuestions) {
      await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
        questionId: q.id,
        perspectiveId: 'current_state',
        value: q.current.toString(),
        editorEmail: 'user@test.com'
      });
      
      await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
        questionId: q.id,
        perspectiveId: 'future_state',
        value: q.future.toString(),
        editorEmail: 'user@test.com'
      });
      
      if (q.techPain.length > 0) {
        await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
          questionId: q.id,
          perspectiveId: 'technical_pain',
          value: q.techPain,
          editorEmail: 'user@test.com'
        });
      }
      
      if (q.bizPain.length > 0) {
        await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
          questionId: q.id,
          perspectiveId: 'business_pain',
          value: q.bizPain,
          editorEmail: 'user@test.com'
        });
      }
      
      await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
        questionId: q.id,
        comment: `User note for ${q.id}`,
        editorEmail: 'user@test.com'
      });
      
      log(`  ✅ Saved ${q.id}: Current=${q.current}, Future=${q.future}`, colors.green);
    }

    log(`\n✅ Completed Platform pillar (5 questions)`, colors.green);

    // Wait for processing
    log('⏳ Waiting 3 seconds for backend processing...', colors.yellow);
    await delay(3000);

    // ========================================================================
    // STEP 3: User views individual pillar results
    // ========================================================================
    log('\n📊 STEP 3: User clicks "View Platform Results"', colors.cyan + colors.bright);
    log('─'.repeat(80), colors.cyan);
    
    const pillarResult = await apiCall('GET', `/assessment/${assessmentId}/pillar/platform_governance/results`);
    
    if (pillarResult.success && pillarResult.data.data) {
      const pillar = pillarResult.data.data;
      log(`✅ Pillar Results Retrieved:`, colors.green);
      log(`   Current Score: ${pillar.pillarDetails?.currentScore || 0}`, colors.cyan);
      log(`   Future Score: ${pillar.pillarDetails?.futureScore || 0}`, colors.cyan);
      log(`   Gap: ${pillar.pillarDetails?.gap || 0}`, colors.cyan);
      log(`   Recommendations: ${pillar.recommendations?.length || 0}`, colors.cyan);
      log(`   Summary Length: ${pillar.summary?.length || 0} chars`, colors.cyan);
    } else {
      log(`❌ Failed to get pillar results`, colors.red);
    }

    // ========================================================================
    // STEP 4: User clicks "View Overall Results"
    // ========================================================================
    log('\n📊 STEP 4: User clicks "View Overall Results"', colors.cyan + colors.bright);
    log('─'.repeat(80), colors.cyan);
    
    const overallResult1 = await apiCall('GET', `/assessment/${assessmentId}/results`);
    
    if (overallResult1.success && overallResult1.data.data) {
      const overall = overallResult1.data.data;
      log(`✅ Overall Results Retrieved:`, colors.green);
      log(`   Current Score: ${overall.overall?.currentScore || 0}`, colors.cyan);
      log(`   Future Score: ${overall.overall?.futureScore || 0}`, colors.cyan);
      log(`   Gap: ${overall.overall?.gap || 0}`, colors.cyan);
      log(`   Summary Length: ${overall.overall?.summary?.length || 0} chars`, colors.cyan);
      log(`   Recommendations: ${overall.prioritizedActions?.length || 0}`, colors.cyan);
      
      // Check if scores match pillar
      const pillarCurrent = pillarResult.data.data.pillarDetails?.currentScore || 0;
      const overallCurrent = overall.overall?.currentScore || 0;
      
      if (Math.abs(pillarCurrent - overallCurrent) > 0.5) {
        log(`\n⚠️  WARNING: Overall score (${overallCurrent}) doesn't match pillar score (${pillarCurrent})`, colors.yellow);
      } else {
        log(`\n✅ Overall score matches pillar score`, colors.green);
      }
    } else {
      log(`❌ Failed to get overall results`, colors.red);
    }

    // ========================================================================
    // STEP 5: User views Executive Summary
    // ========================================================================
    log('\n📄 STEP 5: User clicks "Executive Summary"', colors.cyan + colors.bright);
    log('─'.repeat(80), colors.cyan);
    
    // Executive summary is part of overall results
    if (overallResult1.success && overallResult1.data.data?.executiveSummary) {
      const execSummary = overallResult1.data.data.executiveSummary;
      log(`✅ Executive Summary Retrieved:`, colors.green);
      
      if (execSummary.currentState) {
        log(`   Current State Score: ${execSummary.currentState.score || 0}`, colors.cyan);
      }
      if (execSummary.desiredState) {
        log(`   Desired State Score: ${execSummary.desiredState.score || 0}`, colors.cyan);
      }
      if (execSummary.gap) {
        log(`   Gap: ${execSummary.gap.levels || 0} levels`, colors.cyan);
      }
      if (execSummary.keyPainPoints) {
        const techCount = execSummary.keyPainPoints.technical?.length || 0;
        const bizCount = execSummary.keyPainPoints.business?.length || 0;
        log(`   Technical Pain Points: ${techCount}`, colors.cyan);
        log(`   Business Pain Points: ${bizCount}`, colors.cyan);
      }
      if (execSummary.topPriorities) {
        log(`   Top Priorities: ${execSummary.topPriorities.length}`, colors.cyan);
      }
    } else {
      log(`⚠️  Executive summary not found in overall results`, colors.yellow);
    }

    // ========================================================================
    // STEP 6: User makes changes (updates to higher scores)
    // ========================================================================
    log('\n✏️  STEP 6: User edits responses (increases scores)', colors.cyan + colors.bright);
    log('─'.repeat(80), colors.cyan);
    
    const updatedQuestions = [
      { id: 'env_standardization', current: 4, future: 5 },
      { id: 'scaling_effectiveness', current: 4, future: 5 },
      { id: 'auth_consistency', current: 4, future: 5 },
      { id: 'security_controls', current: 4, future: 5 },
      { id: 'governance_centralization', current: 4, future: 5 }
    ];

    for (const q of updatedQuestions) {
      await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
        questionId: q.id,
        perspectiveId: 'current_state',
        value: q.current.toString(),
        editorEmail: 'user@test.com'
      });
      
      await apiCall('POST', `/assessment/${assessmentId}/save-progress`, {
        questionId: q.id,
        perspectiveId: 'future_state',
        value: q.future.toString(),
        editorEmail: 'user@test.com'
      });
      
      log(`  ✅ Updated ${q.id}: Current=${q.current}, Future=${q.future}`, colors.green);
    }

    log(`\n✅ Updated all 5 questions to higher scores (4→5)`, colors.green);

    // Wait for processing
    log('⏳ Waiting 3 seconds for backend processing...', colors.yellow);
    await delay(3000);

    // ========================================================================
    // STEP 7: Verify individual pillar results updated
    // ========================================================================
    log('\n🔄 STEP 7: User refreshes "Platform Results" page', colors.cyan + colors.bright);
    log('─'.repeat(80), colors.cyan);
    
    const pillarResult2 = await apiCall('GET', `/assessment/${assessmentId}/pillar/platform_governance/results`);
    
    if (pillarResult2.success && pillarResult2.data.data) {
      const pillar = pillarResult2.data.data;
      const newCurrent = pillar.pillarDetails?.currentScore || 0;
      const newFuture = pillar.pillarDetails?.futureScore || 0;
      const newGap = pillar.pillarDetails?.gap || 0;
      
      log(`✅ Updated Pillar Results:`, colors.green);
      log(`   Current Score: ${newCurrent} (was ${pillarResult.data.data.pillarDetails?.currentScore || 0})`, colors.cyan);
      log(`   Future Score: ${newFuture} (was ${pillarResult.data.data.pillarDetails?.futureScore || 0})`, colors.cyan);
      log(`   Gap: ${newGap} (was ${pillarResult.data.data.pillarDetails?.gap || 0})`, colors.cyan);
      
      if (newCurrent === 4 && newFuture === 5) {
        log(`\n✅ Pillar results updated correctly!`, colors.green);
      } else {
        log(`\n⚠️  WARNING: Pillar results may not have updated correctly`, colors.yellow);
        log(`   Expected: Current=4, Future=5`, colors.yellow);
        log(`   Got: Current=${newCurrent}, Future=${newFuture}`, colors.yellow);
      }
    }

    // ========================================================================
    // STEP 8: Verify overall results updated
    // ========================================================================
    log('\n🔄 STEP 8: User refreshes "Overall Results" page', colors.cyan + colors.bright);
    log('─'.repeat(80), colors.cyan);
    
    const overallResult2 = await apiCall('GET', `/assessment/${assessmentId}/results`);
    
    if (overallResult2.success && overallResult2.data.data) {
      const overall = overallResult2.data.data;
      const newOverallCurrent = overall.overall?.currentScore || 0;
      const newOverallFuture = overall.overall?.futureScore || 0;
      const newOverallGap = overall.overall?.gap || 0;
      
      const oldOverallCurrent = overallResult1.data.data.overall?.currentScore || 0;
      const oldOverallFuture = overallResult1.data.data.overall?.futureScore || 0;
      
      log(`✅ Updated Overall Results:`, colors.green);
      log(`   Current Score: ${newOverallCurrent} (was ${oldOverallCurrent})`, colors.cyan);
      log(`   Future Score: ${newOverallFuture} (was ${oldOverallFuture})`, colors.cyan);
      log(`   Gap: ${newOverallGap} (was ${overallResult1.data.data.overall?.gap || 0})`, colors.cyan);
      
      // Check if scores updated
      if (newOverallCurrent > oldOverallCurrent && newOverallFuture > oldOverallFuture) {
        log(`\n✅ Overall results UPDATED correctly!`, colors.green);
      } else if (newOverallCurrent === oldOverallCurrent && newOverallFuture === oldOverallFuture) {
        log(`\n❌ PROBLEM: Overall results DID NOT UPDATE!`, colors.red + colors.bright);
        log(`   Scores remained the same despite changes`, colors.red);
      } else {
        log(`\n⚠️  WARNING: Overall results updated partially`, colors.yellow);
      }
      
      // Check if summary changed
      const oldSummaryLength = overallResult1.data.data.overall?.summary?.length || 0;
      const newSummaryLength = overall.overall?.summary?.length || 0;
      
      if (oldSummaryLength !== newSummaryLength) {
        log(`   Summary changed: ${oldSummaryLength} → ${newSummaryLength} chars`, colors.cyan);
      } else {
        log(`   ⚠️  Summary unchanged (${oldSummaryLength} chars)`, colors.yellow);
      }
    } else {
      log(`❌ Failed to get updated overall results`, colors.red);
    }

    // ========================================================================
    // STEP 9: Verify executive summary updated
    // ========================================================================
    log('\n🔄 STEP 9: User refreshes "Executive Summary" page', colors.cyan + colors.bright);
    log('─'.repeat(80), colors.cyan);
    
    if (overallResult2.success && overallResult2.data.data?.executiveSummary) {
      const newExecSummary = overallResult2.data.data.executiveSummary;
      const oldExecSummary = overallResult1.data.data.executiveSummary;
      
      const newCurrentScore = newExecSummary.currentState?.score || 0;
      const oldCurrentScore = oldExecSummary?.currentState?.score || 0;
      
      const newDesiredScore = newExecSummary.desiredState?.score || 0;
      const oldDesiredScore = oldExecSummary?.desiredState?.score || 0;
      
      log(`✅ Updated Executive Summary:`, colors.green);
      log(`   Current State: ${newCurrentScore} (was ${oldCurrentScore})`, colors.cyan);
      log(`   Desired State: ${newDesiredScore} (was ${oldDesiredScore})`, colors.cyan);
      
      if (newCurrentScore > oldCurrentScore || newDesiredScore > oldDesiredScore) {
        log(`\n✅ Executive summary UPDATED correctly!`, colors.green);
      } else if (newCurrentScore === oldCurrentScore && newDesiredScore === oldDesiredScore) {
        log(`\n❌ PROBLEM: Executive summary DID NOT UPDATE!`, colors.red + colors.bright);
        log(`   Scores remained the same despite changes`, colors.red);
      } else {
        log(`\n⚠️  WARNING: Executive summary updated partially`, colors.yellow);
      }
    }

    // ========================================================================
    // FINAL SUMMARY
    // ========================================================================
    log('\n' + '='.repeat(80), colors.bright);
    log('📊 FINAL SUMMARY', colors.bright + colors.magenta);
    log('='.repeat(80), colors.bright);
    
    const pillarUpdated = pillarResult2.data.data.pillarDetails?.currentScore === 4;
    const overallUpdated = overallResult2.data.data.overall?.currentScore > overallResult1.data.data.overall?.currentScore;
    const execUpdated = overallResult2.data.data.executiveSummary?.currentState?.score > (overallResult1.data.data.executiveSummary?.currentState?.score || 0);
    
    log('');
    log(`Individual Pillar Results: ${pillarUpdated ? '✅ UPDATED' : '❌ NOT UPDATED'}`, pillarUpdated ? colors.green : colors.red);
    log(`Overall Results: ${overallUpdated ? '✅ UPDATED' : '❌ NOT UPDATED'}`, overallUpdated ? colors.green : colors.red);
    log(`Executive Summary: ${execUpdated ? '✅ UPDATED' : '❌ NOT UPDATED'}`, execUpdated ? colors.green : colors.red);
    
    log('');
    if (pillarUpdated && overallUpdated && execUpdated) {
      log('🎉 SUCCESS: All views updating correctly!', colors.green + colors.bright);
    } else if (pillarUpdated && !overallUpdated && !execUpdated) {
      log('⚠️  ISSUE CONFIRMED: Pillar works, but Overall & Executive Summary not updating', colors.red + colors.bright);
    } else {
      log('⚠️  PARTIAL ISSUE: Some views not updating correctly', colors.yellow + colors.bright);
    }
    
    log('');
    log('Assessment ID: ' + assessmentId, colors.cyan);
    log('You can view this assessment at:', colors.cyan);
    log(`  Overall: http://localhost:3000/results/${assessmentId}`, colors.cyan);
    log(`  Exec Summary: http://localhost:3000/executive-summary/${assessmentId}`, colors.cyan);
    log(`  Platform: http://localhost:3000/pillar-results/${assessmentId}/platform_governance`, colors.cyan);

  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`, colors.red);
    console.error(error);
  }
}

// Check server first
async function main() {
  try {
    await apiCall('GET', '/health');
    log('✓ Server is running\n', colors.green);
    await runUserWorkflow();
  } catch (error) {
    log('✗ Server is not accessible', colors.red);
    log('Please start the server: npm start\n', colors.yellow);
    process.exit(1);
  }
}

main();

