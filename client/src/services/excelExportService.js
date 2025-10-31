import * as XLSX from 'xlsx';
import api from './assessmentService';
import assessmentFramework from '../data/assessmentFramework';

/**
 * Export assessment data to Excel file
 * Includes all pillars, questions, responses, pain points, notes, AND results
 */
export const exportAssessmentToExcel = async (assessmentId, assessmentName = 'Assessment') => {
  try {
    console.log('[Excel Export] Starting export for assessment:', assessmentId);

    // Fetch assessment data using configured API instance
    const assessment = await api.get(`/assessment/${assessmentId}`);
    
    console.log('[Excel Export] Assessment data loaded:', assessment);

    // Fetch results data (recommendations, scores, etc.)
    let resultsData = null;
    try {
      resultsData = await api.get(`/assessment/${assessmentId}/results`);
      console.log('[Excel Export] Results data loaded:', resultsData);
    } catch (error) {
      console.warn('[Excel Export] Could not load results:', error);
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Add metadata sheet
    addMetadataSheet(workbook, assessment);
    
    // Add summary sheet
    addSummarySheet(workbook, assessment);
    
    // Add results sheets if available
    if (resultsData) {
      addResultsOverviewSheet(workbook, resultsData);
      addBusinessImpactSheet(workbook, resultsData);
      addDatabricksRecommendationsSheet(workbook, resultsData);
      addOverallNextStepsSheet(workbook, resultsData);
      
      // Add pillar-specific results
      if (resultsData.prioritizedActions) {
        resultsData.prioritizedActions.forEach(pillarResult => {
          addPillarResultsSheet(workbook, pillarResult);
        });
      }
    }
    
    // Add detailed question/response sheets for each pillar
    assessmentFramework.assessmentAreas.forEach(pillar => {
      addPillarSheet(workbook, assessment, pillar);
    });
    
    // Generate file name
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${assessmentName.replace(/[^a-z0-9]/gi, '_')}_Complete_${timestamp}.xlsx`;
    
    // Write file
    XLSX.writeFile(workbook, fileName);
    
    console.log('[Excel Export] Export completed:', fileName);
    return { success: true, fileName };
    
  } catch (error) {
    console.error('[Excel Export] Error:', error);
    throw error;
  }
};

/**
 * Add metadata sheet with assessment overview
 */
function addMetadataSheet(workbook, assessment) {
  const metadata = [
    ['Data & AI Technical Maturity Assessment'],
    [''],
    ['Assessment Details', ''],
    ['Assessment Name', assessment.assessmentName || 'N/A'],
    ['Organization', assessment.organizationName || 'N/A'],
    ['Industry', assessment.industry || 'N/A'],
    ['Created Date', new Date(assessment.createdAt).toLocaleDateString()],
    ['Last Updated', new Date(assessment.updatedAt).toLocaleDateString()],
    [''],
    ['Completed Pillars', assessment.completedCategories?.length || 0],
    ['Total Pillars', assessmentFramework.assessmentAreas.length],
    [''],
    ['Export Details', ''],
    ['Export Date', new Date().toLocaleString()],
    ['File Format', 'Excel (.xlsx)'],
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(metadata);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 25 },
    { wch: 40 }
  ];
  
  XLSX.utils.book_append_sheet(workbook, ws, 'Overview');
}

/**
 * Add summary sheet with overall maturity scores
 */
function addSummarySheet(workbook, assessment) {
  const responses = assessment.responses || {};
  const completedCategories = assessment.completedCategories || [];
  
  const summaryData = [
    ['Pillar Summary'],
    [''],
    ['Pillar', 'Status', 'Completion']
  ];
  
  // Simple summary based on completed pillars
  assessmentFramework.assessmentAreas.forEach(pillar => {
    const isCompleted = completedCategories.includes(pillar.id);
    summaryData.push([
      pillar.name,
      isCompleted ? 'Completed' : 'In Progress',
      isCompleted ? '100%' : '0%'
    ]);
  });
  
  const ws = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 30 },
    { wch: 20 },
    { wch: 15 }
  ];
  
  XLSX.utils.book_append_sheet(workbook, ws, 'Summary');
}

/**
 * Add detailed sheet for a specific pillar
 */
function addPillarSheet(workbook, assessment, pillar) {
  const responses = assessment.responses || {};
  
  const pillarData = [
    [`${pillar.name} - Detailed Responses`],
    [''],
    [
      'Dimension',
      'Question',
      'Current State',
      'Current Level',
      'Future State',
      'Future Level',
      'Gap',
      'Technical Pain Points',
      'Business Pain Points',
      'Notes/Comments'
    ]
  ];
  
  // Find all response keys for this pillar and extract unique question IDs
  const questionIds = new Set();
  Object.keys(responses).forEach(key => {
    // Extract base question ID (remove _current_state, _future_state, etc.)
    const questionId = key.replace(/_current_state|_future_state|_technical_pain|_business_pain|_comment$/g, '');
    questionIds.add(questionId);
  });
  
  // Add each question's data
  questionIds.forEach(questionId => {
    const currentKey = `${questionId}_current_state`;
    const futureKey = `${questionId}_future_state`;
    const techPainKey = `${questionId}_technical_pain`;
    const bizPainKey = `${questionId}_business_pain`;
    const commentKey = `${questionId}_comment`;
    
    // Only add if this pillar has data
    if (responses[currentKey] !== undefined || responses[futureKey] !== undefined) {
      const currentValue = parseInt(responses[currentKey]) || '';
      const futureValue = parseInt(responses[futureKey]) || '';
      const gap = (currentValue && futureValue) ? futureValue - currentValue : '';
      
      // Get maturity level labels
      const currentLevel = getMaturityLabel(currentValue);
      const futureLevel = getMaturityLabel(futureValue);
      
      // Get pain points
      const techPain = responses[techPainKey];
      const bizPain = responses[bizPainKey];
      
      const techPainText = Array.isArray(techPain) ? techPain.join('; ') : (techPain || '');
      const bizPainText = Array.isArray(bizPain) ? bizPain.join('; ') : (bizPain || '');
      
      const comment = responses[commentKey] || '';
      
      pillarData.push([
        questionId,
        'Question',  // Placeholder since we don't have the full question text
        currentValue,
        currentLevel,
        futureValue,
        futureLevel,
        gap,
        techPainText,
        bizPainText,
        comment
      ]);
    }
  });
  
  const ws = XLSX.utils.aoa_to_sheet(pillarData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 25 }, // Dimension
    { wch: 50 }, // Question
    { wch: 12 }, // Current State
    { wch: 15 }, // Current Level
    { wch: 12 }, // Future State
    { wch: 15 }, // Future Level
    { wch: 8 },  // Gap
    { wch: 40 }, // Technical Pain
    { wch: 40 }, // Business Pain
    { wch: 50 }  // Notes
  ];
  
  // Sanitize sheet name (max 31 chars, no special characters)
  const sheetName = pillar.name.substring(0, 31).replace(/[:\\/?*\[\]]/g, '_');
  
  XLSX.utils.book_append_sheet(workbook, ws, sheetName);
}

/**
 * Get maturity level label for a value
 */
function getMaturityLabel(value) {
  const levels = {
    1: 'Explore',
    2: 'Experiment',
    3: 'Formalize',
    4: 'Optimize',
    5: 'Transform'
  };
  return levels[value] || '';
}

/**
 * Add Results Overview sheet with maturity scores and executive summary
 */
function addResultsOverviewSheet(workbook, resultsData) {
  const overviewData = [
    ['ASSESSMENT RESULTS OVERVIEW'],
    [''],
    ['Overall Maturity'],
    ['Current Level', resultsData.overall?.currentScore || 'N/A', getMaturityLabel(resultsData.overall?.currentScore)],
    ['Target Level', resultsData.overall?.futureScore || 'N/A', getMaturityLabel(resultsData.overall?.futureScore)],
    ['Improvement Gap', resultsData.overall?.gap || 'N/A'],
    [''],
    ['Executive Summary'],
    [resultsData.executiveSummary || 'No executive summary available'],
    [''],
    ['Pillar Scores'],
    ['Pillar', 'Current', 'Target', 'Gap']
  ];
  
  if (resultsData.prioritizedActions) {
    resultsData.prioritizedActions.forEach(pillar => {
      overviewData.push([
        pillar.pillarName || pillar.pillar,
        pillar.currentScore || 'N/A',
        pillar.targetScore || 'N/A',
        pillar.gap || 'N/A'
      ]);
    });
  }
  
  const ws = XLSX.utils.aoa_to_sheet(overviewData);
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, ws, 'Results Overview');
}

/**
 * Add Business Impact sheet with all 6 impact metrics
 */
function addBusinessImpactSheet(workbook, resultsData) {
  const impactData = [
    ['EXPECTED BUSINESS IMPACT'],
    [''],
    ['Metric', 'Value', 'Description', 'Key Drivers']
  ];
  
  if (resultsData.businessImpact) {
    Object.entries(resultsData.businessImpact).forEach(([key, metric]) => {
      const drivers = Array.isArray(metric.drivers) ? metric.drivers.join('; ') : '';
      impactData.push([
        formatMetricName(key),
        metric.value || 'N/A',
        metric.label || '',
        drivers
      ]);
    });
  }
  
  const ws = XLSX.utils.aoa_to_sheet(impactData);
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 50 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(workbook, ws, 'Business Impact');
}

/**
 * Add Databricks Recommendations sheet with all recommended features
 */
function addDatabricksRecommendationsSheet(workbook, resultsData) {
  const recsData = [
    ['DATABRICKS RECOMMENDATIONS BY PILLAR'],
    [''],
    ['Pillar', 'Feature/Product', 'Description']
  ];
  
  if (resultsData.prioritizedActions) {
    resultsData.prioritizedActions.forEach(pillar => {
      if (pillar.databricksFeatures && pillar.databricksFeatures.length > 0) {
        pillar.databricksFeatures.forEach((feature, idx) => {
          recsData.push([
            idx === 0 ? (pillar.pillarName || pillar.pillar) : '', // Only show pillar name once
            feature.name || feature,
            feature.description || ''
          ]);
        });
      }
    });
  }
  
  const ws = XLSX.utils.aoa_to_sheet(recsData);
  ws['!cols'] = [{ wch: 30 }, { wch: 35 }, { wch: 70 }];
  XLSX.utils.book_append_sheet(workbook, ws, 'Databricks Features');
}

/**
 * Add Overall Next Steps sheet with all recommended next steps
 */
function addOverallNextStepsSheet(workbook, resultsData) {
  const stepsData = [
    ['RECOMMENDED NEXT STEPS BY PILLAR'],
    [''],
    ['Pillar', 'Priority', 'Next Step']
  ];
  
  if (resultsData.prioritizedActions) {
    resultsData.prioritizedActions.forEach(pillar => {
      if (pillar.specificRecommendations && pillar.specificRecommendations.length > 0) {
        pillar.specificRecommendations.forEach((step, idx) => {
          stepsData.push([
            idx === 0 ? (pillar.pillarName || pillar.pillar) : '', // Only show pillar name once
            `${idx + 1}`,
            step
          ]);
        });
      }
    });
  }
  
  const ws = XLSX.utils.aoa_to_sheet(stepsData);
  ws['!cols'] = [{ wch: 30 }, { wch: 10 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(workbook, ws, 'Next Steps');
}

/**
 * Add Pillar Results sheet with what's working, challenges, and recommendations
 */
function addPillarResultsSheet(workbook, pillarResult) {
  const pillarName = pillarResult.pillarName || pillarResult.pillar;
  const pillarData = [
    [`${pillarName} - Analysis & Recommendations`],
    [''],
    ['MATURITY SCORES'],
    ['Current Score', pillarResult.currentScore || 'N/A'],
    ['Target Score', pillarResult.targetScore || 'N/A'],
    ['Gap', pillarResult.gap || 'N/A'],
    ['Priority', pillarResult.priority || 'N/A'],
    [''],
    ["WHAT'S WORKING WELL"]
  ];
  
  if (pillarResult.theGood && pillarResult.theGood.length > 0) {
    pillarResult.theGood.forEach((item, idx) => {
      pillarData.push([`${idx + 1}. ${item}`]);
    });
  } else {
    pillarData.push(['No strengths identified']);
  }
  
  pillarData.push([''], ['KEY CHALLENGES']);
  
  if (pillarResult.theBad && pillarResult.theBad.length > 0) {
    pillarResult.theBad.forEach((item, idx) => {
      pillarData.push([`${idx + 1}. ${item}`]);
    });
  } else {
    pillarData.push(['No challenges identified']);
  }
  
  pillarData.push([''], ['DATABRICKS RECOMMENDATIONS']);
  
  if (pillarResult.databricksFeatures && pillarResult.databricksFeatures.length > 0) {
    pillarResult.databricksFeatures.forEach((feature, idx) => {
      const featureName = typeof feature === 'string' ? feature : feature.name;
      const featureDesc = typeof feature === 'object' ? feature.description : '';
      pillarData.push([`${idx + 1}. ${featureName}`]);
      if (featureDesc) {
        pillarData.push([`   ${featureDesc}`]);
      }
    });
  } else {
    pillarData.push(['No specific features recommended']);
  }
  
  pillarData.push([''], ['NEXT STEPS']);
  
  if (pillarResult.specificRecommendations && pillarResult.specificRecommendations.length > 0) {
    pillarResult.specificRecommendations.forEach((step, idx) => {
      pillarData.push([`${idx + 1}. ${step}`]);
    });
  } else {
    pillarData.push(['No next steps defined']);
  }
  
  const ws = XLSX.utils.aoa_to_sheet(pillarData);
  ws['!cols'] = [{ wch: 100 }];
  
  // Sanitize sheet name (max 31 chars, no special characters)
  const sheetName = `${pillarName} Results`.substring(0, 31).replace(/[:\\/?*\[\]]/g, '_');
  
  XLSX.utils.book_append_sheet(workbook, ws, sheetName);
}

/**
 * Format metric name to be human-readable
 */
function formatMetricName(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Export only completed pillars to Excel
 */
export const exportCompletedPillarsToExcel = async (assessmentId, assessmentName = 'Assessment') => {
  try {
    console.log('[Excel Export] Starting export for completed pillars:', assessmentId);

    // Fetch assessment data using configured API instance
    const assessment = await api.get(`/assessment/${assessmentId}`);
    
    const completedPillars = assessmentFramework.assessmentAreas.filter(pillar => 
      assessment.completedCategories?.includes(pillar.id)
    );
    
    if (completedPillars.length === 0) {
      throw new Error('No completed pillars to export');
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Add metadata sheet
    addMetadataSheet(workbook, assessment);
    
    // Add summary sheet (only completed pillars)
    const summaryData = [
      ['Completed Pillars Summary'],
      [''],
      ['Pillar', 'Questions Answered', 'Avg Current State', 'Avg Future State', 'Gap']
    ];
    
    completedPillars.forEach(pillar => {
      const responses = assessment.responses || {};
      let currentTotal = 0;
      let futureTotal = 0;
      let answeredCount = 0;
      
      pillar.dimensions.forEach(dimension => {
        dimension.questions.forEach(question => {
          const currentKey = `${question.id}_current_state`;
          const futureKey = `${question.id}_future_state`;
          
          if (responses[currentKey] !== undefined || responses[futureKey] !== undefined) {
            answeredCount++;
            currentTotal += parseInt(responses[currentKey]) || 0;
            futureTotal += parseInt(responses[futureKey]) || 0;
          }
        });
      });
      
      const avgCurrent = answeredCount > 0 ? (currentTotal / answeredCount).toFixed(1) : 'N/A';
      const avgFuture = answeredCount > 0 ? (futureTotal / answeredCount).toFixed(1) : 'N/A';
      const gap = answeredCount > 0 ? ((futureTotal - currentTotal) / answeredCount).toFixed(1) : 'N/A';
      
      summaryData.push([
        pillar.name,
        answeredCount,
        avgCurrent,
        avgFuture,
        gap
      ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    ws['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(workbook, ws, 'Summary');
    
    // Add detailed sheets for completed pillars only
    completedPillars.forEach(pillar => {
      addPillarSheet(workbook, assessment, pillar);
    });
    
    // Generate file name
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${assessmentName.replace(/[^a-z0-9]/gi, '_')}_Completed_${timestamp}.xlsx`;
    
    // Write file
    XLSX.writeFile(workbook, fileName);
    
    console.log('[Excel Export] Export completed:', fileName);
    return { success: true, fileName };
    
  } catch (error) {
    console.error('[Excel Export] Error:', error);
    throw error;
  }
};

