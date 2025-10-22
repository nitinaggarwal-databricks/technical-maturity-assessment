import * as XLSX from 'xlsx';
import api from './assessmentService';
import assessmentFramework from '../data/assessmentFramework';

/**
 * Export assessment data to Excel file
 * Includes all pillars, questions, responses, pain points, and notes
 */
export const exportAssessmentToExcel = async (assessmentId, assessmentName = 'Assessment') => {
  try {
    console.log('[Excel Export] Starting export for assessment:', assessmentId);

    // Fetch assessment data using configured API instance
    const assessment = await api.get(`/assessment/${assessmentId}`);
    
    console.log('[Excel Export] Assessment data loaded:', assessment);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Add metadata sheet
    addMetadataSheet(workbook, assessment);
    
    // Add summary sheet
    addSummarySheet(workbook, assessment);
    
    // Add detailed sheets for each pillar
    assessmentFramework.assessmentAreas.forEach(pillar => {
      addPillarSheet(workbook, assessment, pillar);
    });
    
    // Generate file name
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${assessmentName.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.xlsx`;
    
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

