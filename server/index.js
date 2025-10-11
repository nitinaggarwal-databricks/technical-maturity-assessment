const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const assessmentFramework = require('./data/assessmentFramework');
const RecommendationEngine = require('./services/recommendationEngine');
const DataStore = require('./utils/dataStore');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Persistent storage for assessments
const dataFilePath = path.join(__dirname, 'data', 'assessments.json');
const assessments = new DataStore(dataFilePath);
const recommendationEngine = new RecommendationEngine();

// Routes

// Root status endpoint (for debugging)
app.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Databricks Maturity Assessment API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Get assessment framework
app.get('/api/assessment/framework', (req, res) => {
  try {
    res.json({
      success: true,
      data: assessmentFramework
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving assessment framework',
      error: error.message
    });
  }
});

// Start new assessment
app.post('/api/assessment/start', (req, res) => {
  try {
    const { organizationName, contactEmail, industry, assessmentName, assessmentDescription } = req.body;
    
    if (!contactEmail) {
      return res.status(400).json({
        success: false,
        message: 'Contact email is required'
      });
    }

    if (!assessmentName) {
      return res.status(400).json({
        success: false,
        message: 'Assessment name is required'
      });
    }

    const assessmentId = uuidv4();
    const assessment = {
      id: assessmentId,
      organizationName: organizationName || 'Not specified',
      contactEmail,
      industry: industry || 'Not specified',
      assessmentName,
      assessmentDescription: assessmentDescription || '',
      startedAt: new Date().toISOString(),
      status: 'in_progress',
      responses: {},
      completedCategories: [],
      currentCategory: assessmentFramework.assessmentAreas[0].id
    };

    assessments.set(assessmentId, assessment);

    res.json({
      success: true,
      data: {
      assessmentId,
      currentCategory: assessment.currentCategory,
      totalCategories: assessmentFramework.assessmentAreas.length,
      assessmentName,
      assessmentDescription
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error starting assessment',
      error: error.message
    });
  }
});

// Get assessment status
app.get('/api/assessment/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const assessment = assessments.get(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

        const progress = (assessment.completedCategories.length / assessmentFramework.assessmentAreas.length) * 100;

    res.json({
      success: true,
      data: {
        id: assessment.id,
        assessmentId: assessment.id, // Add for consistency with start endpoint
        organizationName: assessment.organizationName,
        status: assessment.status,
        progress: Math.round(progress),
        currentCategory: assessment.currentCategory,
        completedCategories: assessment.completedCategories,
        startedAt: assessment.startedAt,
        responses: assessment.responses // Include responses for progress calculation
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving assessment status',
      error: error.message
    });
  }
});

// Get questions for a specific assessment area
app.get('/api/assessment/:id/category/:categoryId', (req, res) => {
  try {
    const { id, categoryId } = req.params;
    const assessment = assessments.get(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    const area = assessmentFramework.assessmentAreas.find(a => a.id === categoryId);
    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'Assessment area not found'
      });
    }

    // Get existing responses for this area
    const areaResponses = {};
    
    // Handle new pillar structure with dimensions
    const questions = [];
    if (area.dimensions) {
      area.dimensions.forEach(dimension => {
        if (dimension.questions) {
          questions.push(...dimension.questions);
        }
      });
    } else if (area.questions) {
      // Fallback for old structure
      questions.push(...area.questions);
    }
    
    questions.forEach(question => {
      // Get responses for all perspectives of this question
      question.perspectives.forEach(perspective => {
        const responseKey = `${question.id}_${perspective.id}`;
        if (assessment.responses[responseKey]) {
          areaResponses[responseKey] = assessment.responses[responseKey];
        }
      });
      
      // Get comment responses
      const commentKey = `${question.id}_comment`;
      if (assessment.responses[commentKey]) {
        areaResponses[commentKey] = assessment.responses[commentKey];
      }
    });

    res.json({
      success: true,
      data: {
        area: {
          ...area,
          questions // Flatten questions for frontend compatibility
        },
        existingResponses: areaResponses,
        isCompleted: assessment.completedCategories.includes(categoryId)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving assessment area',
      error: error.message
    });
  }
});

// Submit responses for a category
app.post('/api/assessment/:id/category/:categoryId/submit', (req, res) => {
  try {
    const { id, categoryId } = req.params;
    const { responses } = req.body;
    
    const assessment = assessments.get(id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    const area = assessmentFramework.assessmentAreas.find(a => a.id === categoryId);
    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'Assessment area not found'
      });
    }

    // Validate responses - check that all perspectives have responses
    const requiredResponses = [];
    
    // Handle new pillar structure with dimensions
    const questions = [];
    if (area.dimensions) {
      area.dimensions.forEach(dimension => {
        if (dimension.questions) {
          questions.push(...dimension.questions);
        }
      });
    } else if (area.questions) {
      // Fallback for old structure
      questions.push(...area.questions);
    }
    
    questions.forEach(question => {
      question.perspectives.forEach(perspective => {
        requiredResponses.push(`${question.id}_${perspective.id}`);
      });
    });

    console.log('Received responses:', JSON.stringify(responses, null, 2));
    console.log('Required responses:', requiredResponses);

    // More lenient validation - just check if we have some responses
    const hasAnyResponses = Object.keys(responses).length > 0;
    
    if (!hasAnyResponses) {
      return res.status(400).json({
        success: false,
        message: 'No responses provided',
        receivedResponses: Object.keys(responses)
      });
    }

    // Log missing responses for debugging but don't fail
    const missingResponses = requiredResponses.filter(responseKey => {
      const response = responses[responseKey];
      return !response || (Array.isArray(response) && response.length === 0);
    });
    
    if (missingResponses.length > 0) {
      console.log('Missing responses (but allowing submission):', missingResponses);
    }

    // Save responses
    Object.keys(responses).forEach(questionId => {
      assessment.responses[questionId] = responses[questionId];
    });

    // Mark category as completed
    if (!assessment.completedCategories.includes(categoryId)) {
      assessment.completedCategories.push(categoryId);
    }

    // Update current category to next uncompleted one
    const nextArea = assessmentFramework.assessmentAreas.find(a => 
      !assessment.completedCategories.includes(a.id)
    );
    
    if (nextArea) {
      assessment.currentCategory = nextArea.id;
    } else {
      assessment.status = 'completed';
      assessment.completedAt = new Date().toISOString();
    }

    assessments.set(id, assessment);

    res.json({
      success: true,
      data: {
        progress: (assessment.completedCategories.length / assessmentFramework.assessmentAreas.length) * 100,
        nextCategory: nextArea ? nextArea.id : null,
        isCompleted: assessment.status === 'completed'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting category responses',
      error: error.message
    });
  }
});

// Auto-save individual question responses
app.post('/api/assessment/:id/save-progress', (req, res) => {
  try {
    const { id } = req.params;
    const { questionId, perspectiveId, value, comment, isSkipped } = req.body;
    
    const assessment = assessments.get(id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Handle skipped questions
    if (isSkipped !== undefined) {
      const skipKey = `${questionId}_skipped`;
      assessment.responses[skipKey] = isSkipped;
      
      // If question is being skipped, clear any existing responses
      if (isSkipped) {
        const perspectives = ['current_state', 'future_state', 'technical_pain', 'business_pain'];
        perspectives.forEach(perspective => {
          const responseKey = `${questionId}_${perspective}`;
          delete assessment.responses[responseKey];
        });
        const commentKey = `${questionId}_comment`;
        delete assessment.responses[commentKey];
      }
    }

    // Save the response (only if not skipped)
    if (questionId && perspectiveId && !assessment.responses[`${questionId}_skipped`]) {
      const responseKey = `${questionId}_${perspectiveId}`;
      assessment.responses[responseKey] = value;
    }

    // Save comment if provided (only if not skipped)
    if (comment !== undefined && !assessment.responses[`${questionId}_skipped`]) {
      const commentKey = `${questionId}_comment`;
      assessment.responses[commentKey] = comment;
    }

    // Update last saved timestamp
    assessment.lastSaved = new Date().toISOString();
    assessments.set(id, assessment);

    res.json({
      success: true,
      message: 'Progress saved',
      lastSaved: assessment.lastSaved
    });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving progress',
      error: error.message
    });
  }
});

// Generate assessment results and recommendations
app.get('/api/assessment/:id/results', (req, res) => {
  try {
    const { id } = req.params;
    const assessment = assessments.get(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Allow results even with no responses - will show zero state
    const hasAnyResponses = Object.keys(assessment.responses).length > 0;
    const hasCompletedCategories = assessment.completedCategories.length > 0;
    
    console.log('Generating results for assessment:', id);
    console.log('Assessment responses:', JSON.stringify(assessment.responses, null, 2));
    console.log('Has responses:', hasAnyResponses, 'Completed categories:', assessment.completedCategories.length);
    
    // Calculate total questions and answered questions
    const totalQuestions = assessmentFramework.assessmentAreas.reduce((total, area) => {
      return total + area.dimensions.reduce((dimTotal, dim) => {
        return dimTotal + (dim.questions?.length || 0);
      }, 0);
    }, 0);
    
    // Count answered questions (excluding comments and skipped)
    // Extract unique question IDs by removing perspective suffixes
    const questionIds = new Set();
    Object.keys(assessment.responses).forEach(key => {
      if (key.includes('_comment') || key.includes('_skipped')) return;
      
      // Remove perspective suffixes to get question ID
      let questionId = key;
      const perspectiveSuffixes = ['_current_state', '_future_state', '_technical_pain', '_business_pain'];
      for (const suffix of perspectiveSuffixes) {
        if (key.endsWith(suffix)) {
          questionId = key.substring(0, key.length - suffix.length);
          break;
        }
      }
      questionIds.add(questionId);
    });
    const answeredQuestions = questionIds.size;
    
    console.log(`Questions answered: ${answeredQuestions} of ${totalQuestions}`);
    
    // Find areas with any responses (completed or partial)
    const areasWithResponses = hasAnyResponses 
      ? assessmentFramework.assessmentAreas.filter(area => {
          // Check if there are any responses for this area
          const hasAreaResponses = Object.keys(assessment.responses).some(key => {
            // Skip comment and skipped keys
            if (key.includes('_comment') || key.includes('_skipped')) return false;
            
            // Extract question ID from response key (format: questionId_perspectiveId)
            // Perspective IDs are: current_state, future_state, technical_pain, business_pain
            let questionId = key;
            const perspectiveSuffixes = ['_current_state', '_future_state', '_technical_pain', '_business_pain'];
            for (const suffix of perspectiveSuffixes) {
              if (key.endsWith(suffix)) {
                questionId = key.substring(0, key.length - suffix.length);
                break;
              }
            }
            
            // Check if this question belongs to this area
            if (area.dimensions) {
              return area.dimensions.some(dim => 
                dim.questions && dim.questions.some(q => q.id === questionId)
              );
            } else if (area.questions) {
              return area.questions.some(q => q.id === questionId);
            }
            return false;
          });
          console.log(`Area ${area.id}: has responses = ${hasAreaResponses}`);
          return hasAreaResponses;
        })
      : []; // No responses yet
    
    console.log(`Total areas with responses: ${areasWithResponses.length}`);
    
    // Generate recommendations (for all areas with responses, or provide defaults)
    let recommendations;
    if (hasAnyResponses) {
      const areaIdsWithResponses = areasWithResponses.map(a => a.id);
      recommendations = recommendationEngine.generateRecommendations(
        assessment.responses, 
        areaIdsWithResponses.length > 0 ? areaIdsWithResponses : assessment.completedCategories
      );
      console.log('Generated recommendations successfully');
    } else {
      // Provide default empty recommendations structure
      recommendations = {
        overall: {
          score: 0,
          level: assessmentFramework.maturityLevels[1],
          summary: 'No responses yet. Start answering questions to see your maturity assessment results.'
        },
        categories: {},
        prioritizedActions: [],
        roadmap: { immediate: [], shortTerm: [], longTerm: [] },
        quickWins: [],
        riskAreas: []
      };
      console.log('No responses yet - using default empty state');
    }
    
    // Calculate detailed category scores (for all areas with responses)
    const categoryDetails = {};
    
    areasWithResponses.forEach(area => {
      const areaScore = recommendationEngine.calculateAreaScore(area, assessment.responses);
      const currentScore = recommendationEngine.calculateAreaScoreByPerspective(area, assessment.responses, 'current_state');
      const futureScore = recommendationEngine.calculateAreaScoreByPerspective(area, assessment.responses, 'future_state');
      const isCompleted = assessment.completedCategories.includes(area.id);
      
      categoryDetails[area.id] = {
        name: area.name,
        description: area.description,
        score: Math.round(areaScore),
        currentScore: Math.round(currentScore),
        futureScore: Math.round(futureScore),
        level: assessmentFramework.maturityLevels[Math.max(1, Math.min(5, Math.round(areaScore)))],
        weight: areasWithResponses.length > 0 ? 1 / areasWithResponses.length : 0,
        isPartial: !isCompleted
      };
    });

    const results = {
      assessmentInfo: {
        id: assessment.id,
        assessmentName: assessment.assessmentName,
        assessmentDescription: assessment.assessmentDescription,
        organizationName: assessment.organizationName,
        contactEmail: assessment.contactEmail,
        industry: assessment.industry,
        completedAt: assessment.completedAt,
        startedAt: assessment.startedAt,
        isPartialAssessment: areasWithResponses.length < assessmentFramework.assessmentAreas.length || assessment.completedCategories.length < assessmentFramework.assessmentAreas.length,
        completedPillars: assessment.completedCategories.length,
        totalPillars: assessmentFramework.assessmentAreas.length,
        pillarsWithResponses: areasWithResponses.length,
        questionsAnswered: answeredQuestions,
        totalQuestions: totalQuestions,
        completionPercentage: totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0
      },
      overallScore: recommendations.overall.score,
      overallLevel: recommendations.overall.level,
      summary: recommendations.overall.summary,
      categoryDetails,
      recommendations: recommendations.categories,
      prioritizedActions: recommendations.prioritizedActions,
      roadmap: recommendations.roadmap,
      quickWins: recommendations.quickWins,
      riskAreas: recommendations.riskAreas,
      pillarStatus: assessmentFramework.assessmentAreas.map(area => {
        const isCompleted = assessment.completedCategories.includes(area.id);
        const hasResponses = areasWithResponses.some(a => a.id === area.id);
        return {
          id: area.id,
          name: area.name,
          completed: isCompleted,
          hasResponses: hasResponses,
          isPartial: hasResponses && !isCompleted,
          score: hasResponses ? categoryDetails[area.id]?.score : null
        };
      })
    };

    // Cache results
    assessment.results = results;
    assessments.set(id, assessment);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Detailed error generating results:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error generating assessment results',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Databricks Maturity Assessment API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Get all assessments (for past assessments management)
app.get('/api/assessments', (req, res) => {
  try {
    const assessmentsList = Array.from(assessments.values()).map(assessment => ({
      id: assessment.id,
      organizationName: assessment.organizationName,
      contactEmail: assessment.contactEmail,
      industry: assessment.industry,
      assessmentName: assessment.assessmentName || 'Untitled Assessment',
      assessmentDescription: assessment.assessmentDescription || '',
      status: assessment.status,
      startedAt: assessment.startedAt,
      completedAt: assessment.completedAt,
      completedCategories: assessment.completedCategories,
      totalCategories: assessmentFramework.assessmentAreas.length,
      progress: Math.round((assessment.completedCategories.length / assessmentFramework.assessmentAreas.length) * 100)
    }));

    // Sort by most recent first
    assessmentsList.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

    res.json({
      success: true,
      data: assessmentsList
    });
  } catch (error) {
    console.error('Error retrieving assessments:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving assessments',
      error: error.message
    });
  }
});

// Clone an existing assessment
app.post('/api/assessment/:id/clone', (req, res) => {
  try {
    const { id } = req.params;
    const { organizationName, contactEmail, industry, assessmentName, assessmentDescription } = req.body;
    
    const originalAssessment = assessments.get(id);
    if (!originalAssessment) {
      return res.status(404).json({
        success: false,
        message: 'Original assessment not found'
      });
    }

    if (!assessmentName) {
      return res.status(400).json({
        success: false,
        message: 'Assessment name is required'
      });
    }

    // Create new assessment with cloned data
    const newAssessmentId = uuidv4();
    const clonedAssessment = {
      id: newAssessmentId,
      organizationName: organizationName || originalAssessment.organizationName,
      contactEmail: contactEmail || originalAssessment.contactEmail,
      industry: industry || originalAssessment.industry,
      assessmentName,
      assessmentDescription: assessmentDescription || '',
      startedAt: new Date().toISOString(),
      status: 'in_progress',
      responses: { ...originalAssessment.responses }, // Clone responses
      completedCategories: [...originalAssessment.completedCategories], // Clone completed categories
      currentCategory: originalAssessment.currentCategory,
      clonedFrom: id,
      clonedAt: new Date().toISOString()
    };

    assessments.set(newAssessmentId, clonedAssessment);

    res.json({
      success: true,
      data: {
        assessmentId: newAssessmentId,
        originalId: id,
        organizationName: clonedAssessment.organizationName,
        assessmentName: clonedAssessment.assessmentName,
        assessmentDescription: clonedAssessment.assessmentDescription,
        completedCategories: clonedAssessment.completedCategories.length,
        totalCategories: assessmentFramework.assessmentAreas.length
      }
    });
  } catch (error) {
    console.error('Error cloning assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Error cloning assessment',
      error: error.message
    });
  }
});

// Delete an assessment
app.delete('/api/assessment/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!assessments.has(id)) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    assessments.delete(id);

    res.json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting assessment',
      error: error.message
    });
  }
});

// Get pillar-specific results
app.get('/api/assessment/:id/pillar/:pillarId/results', (req, res) => {
  try {
    const { id, pillarId } = req.params;
    const assessment = assessments.get(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Find the specific pillar
    const pillar = assessmentFramework.assessmentAreas.find(area => area.id === pillarId);
    if (!pillar) {
      return res.status(404).json({
        success: false,
        message: 'Pillar not found'
      });
    }

    // Check if this pillar has been completed
    if (!assessment.completedCategories.includes(pillarId)) {
      return res.status(400).json({
        success: false,
        message: 'Pillar has not been completed yet'
      });
    }

    console.log(`Generating results for pillar: ${pillarId}`);

    // Generate recommendations for this specific pillar
    const recommendations = recommendationEngine.generateRecommendations(
      assessment.responses, 
      [pillarId] // Only analyze this pillar
    );

    // Calculate pillar-specific scores
    const overallScore = recommendationEngine.calculateAreaScore(pillar, assessment.responses);
    const currentScore = recommendationEngine.calculateAreaScoreByPerspective(pillar, assessment.responses, 'current_state');
    const futureScore = recommendationEngine.calculateAreaScoreByPerspective(pillar, assessment.responses, 'future_state');
    
    // Get pillar details
    const roundedScore = Math.round(overallScore);
    const pillarDetails = {
      id: pillar.id,
      name: pillar.name,
      description: pillar.description,
      score: roundedScore,
      currentScore: Math.round(currentScore),
      futureScore: Math.round(futureScore),
      maturityLevel: assessmentFramework.maturityLevels[Math.max(1, Math.min(5, roundedScore))],
      dimensionsCompleted: pillar.dimensions.length,
      questionsAnswered: pillar.dimensions.reduce((total, dim) => total + (dim.questions?.length || 0), 0)
    };

    res.json({
      success: true,
      data: {
        assessmentId: id,
        pillarId,
        pillarDetails,
        recommendations,
        generatedAt: new Date().toISOString(),
        isPillarSpecific: true
      }
    });
  } catch (error) {
    console.error('Error generating pillar results:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating pillar results',
      error: error.message
    });
  }
});

// Debug endpoint to manually complete an assessment for testing
app.post('/api/assessment/:id/debug/complete', (req, res) => {
  try {
    const { id } = req.params;
    const assessment = assessments.get(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Add some sample responses if none exist
    if (Object.keys(assessment.responses).length === 0) {
      assessment.responses = {
        'env_standardization_current_state': 3,
        'env_standardization_future_state': 4,
        'scaling_effectiveness_current_state': 2,
        'scaling_effectiveness_future_state': 5
      };
    }

    // Mark all categories as completed
    assessment.completedCategories = assessmentFramework.assessmentAreas.map(a => a.id);
    assessment.status = 'completed';
    assessment.completedAt = new Date().toISOString();
    
    assessments.set(id, assessment);

    res.json({
      success: true,
      message: 'Assessment marked as completed for testing',
      data: {
        status: assessment.status,
        completedCategories: assessment.completedCategories.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing assessment',
      error: error.message
    });
  }
});

// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  // Catch-all handler for non-API routes - must be LAST
  app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '../client/build', 'index.html');
    console.log(`Serving index.html from: ${indexPath}`);
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).send('Error loading application');
      }
    });
  });
}

// Start server (only if not in serverless environment)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Databricks Maturity Assessment API running on port ${PORT}`);
    console.log(`📊 Assessment framework loaded with ${assessmentFramework.assessmentAreas.length} areas`);
    console.log(`💾 ${assessments.size} assessment(s) loaded from persistent storage`);
    console.log(`🔗 API Health Check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;




