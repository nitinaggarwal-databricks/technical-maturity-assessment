const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const assessmentFramework = require('./data/assessmentFramework');
const RecommendationEngine = require('./services/recommendationEngine');
const AdaptiveRecommendationEngine = require('./services/adaptiveRecommendationEngine');
const LiveDataEnhancer = require('./services/liveDataEnhancer');
const OpenAIContentGenerator = require('./services/openAIContentGenerator');
const DatabricksFeatureMapper = require('./services/databricksFeatureMapper');
const ContextAwareRecommendationEngine = require('./services/contextAwareRecommendationEngine');
const IntelligentRecommendationEngine = require('./services/intelligentRecommendationEngine_v2');
const StorageAdapter = require('./utils/storageAdapter');
const sampleAssessmentGenerator = require('./utils/sampleAssessmentGenerator');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Persistent storage for assessments
// Use Railway volume path if available, otherwise fallback to local path
console.log('🔍 DEBUG: Checking DATA_DIR environment variable...');
console.log('🔍 DEBUG: process.env.DATA_DIR =', process.env.DATA_DIR);
console.log('🔍 DEBUG: __dirname =', __dirname);
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
const dataFilePath = path.join(dataDir, 'assessments.json');
console.log(`📁 Data directory: ${dataDir}`);
console.log(`📄 Data file path: ${dataFilePath}`);

// Validate storage is writable on startup
const fs = require('fs');
try {
  if (!fs.existsSync(dataDir)) {
    console.log(`📁 Creating data directory: ${dataDir}`);
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Test write to ensure volume is mounted correctly
  const testFile = path.join(dataDir, '.write-test');
  fs.writeFileSync(testFile, 'test', 'utf8');
  fs.unlinkSync(testFile);
  console.log('✅ Storage is writable - data persistence confirmed');
  
  if (process.env.DATA_DIR) {
    console.log('✅ Using Railway persistent volume at:', process.env.DATA_DIR);
  } else {
    console.warn('⚠️  WARNING: DATA_DIR not set - using local storage (data will be lost on redeploy!)');
    console.warn('⚠️  Set DATA_DIR environment variable to use persistent storage');
  }
} catch (error) {
  console.error('❌ CRITICAL: Storage is NOT writable!');
  console.error('❌ Error:', error.message);
  console.error('❌ Data directory:', dataDir);
  console.error('⚠️  ALL DATA WILL BE LOST ON RESTART!');
}

// Initialize storage adapter (PostgreSQL with file-based fallback)
const assessments = new StorageAdapter(dataFilePath);
const recommendationEngine = new RecommendationEngine();
const adaptiveRecommendationEngine = new AdaptiveRecommendationEngine();
const liveDataEnhancer = new LiveDataEnhancer();
const openAIContentGenerator = new OpenAIContentGenerator();

// Initialize storage asynchronously
let storageReady = false;
assessments.initialize().then(() => {
  storageReady = true;
  console.log(`✅ Storage ready: ${assessments.getStorageType()}`);
}).catch(error => {
  console.error('❌ Failed to initialize storage:', error);
  process.exit(1);
});

// Routes

// Root status endpoint (for debugging)
app.get('/status', async (req, res) => {
  try {
    const fs = require('fs');
    const assessmentCount = await assessments.size();
    const stats = await assessments.getStats();
    const storageType = assessments.getStorageType();
    const dataFileExists = fs.existsSync(dataFilePath);
    
    res.json({
      success: true,
      message: 'Databricks Maturity Assessment API is running',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      storage: {
        type: storageType,
        assessmentCount: assessmentCount,
        stats: stats,
        // Keep legacy fields for compatibility
        dataDir: dataDir,
        dataFilePath: dataFilePath,
        dataFileExists: dataFileExists,
        volumeMounted: process.env.DATA_DIR ? true : false,
        dataDirEnv: process.env.DATA_DIR || 'not set (using default)',
        postgresConfigured: !!process.env.DATABASE_URL,
      },
      features: {
        liveDataEnabled: process.env.USE_LIVE_DATA === 'true',
        openAIConfigured: !!process.env.OPENAI_API_KEY,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get assessment framework
app.get('/api/assessment/framework', async (req, res) => {
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
app.post('/api/assessment/start', async (req, res) => {
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
      currentCategory: assessmentFramework.assessmentAreas[0].id,
      editHistory: []
    };

    await assessments.set(assessmentId, assessment);

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

// Get raw assessment data (for Excel export, etc.)
app.get('/api/assessment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await assessments.get(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Return the raw assessment data
    res.json(assessment);
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assessment',
      error: error.message
    });
  }
});

// Get assessment status
app.get('/api/assessment/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await assessments.get(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

        const progress = (assessment.completedCategories.length / assessmentFramework.assessmentAreas.length) * 100;

    // Ensure legacy assessments have default names
    if (!assessment.assessmentName) {
      assessment.assessmentName = `Databricks Maturity Assessment ${new Date(assessment.startedAt).toLocaleDateString()}`;
      await assessments.set(id, assessment);
    }

    res.json({
      success: true,
      data: {
        id: assessment.id,
        assessmentId: assessment.id, // Add for consistency with start endpoint
        assessmentName: assessment.assessmentName,
        assessmentDescription: assessment.assessmentDescription || '',
        organizationName: assessment.organizationName,
        contactEmail: assessment.contactEmail,
        industry: assessment.industry,
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
app.get('/api/assessment/:id/category/:categoryId', async (req, res) => {
  try {
    const { id, categoryId } = req.params;
    const assessment = await assessments.get(id);

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
app.post('/api/assessment/:id/category/:categoryId/submit', async (req, res) => {
  try {
    const { id, categoryId } = req.params;
    const { responses } = req.body;
    
    const assessment = await assessments.get(id);
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

    // Update assessment metadata for tracking
    assessment.lastModified = new Date().toISOString();

    await assessments.set(id, assessment);

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

// Bulk submit all responses at once (for sample assessments)
app.post('/api/assessment/:id/bulk-submit', async (req, res) => {
  try {
    const { id } = req.params;
    const { responses, completedCategories, status } = req.body;
    
    const assessment = await assessments.get(id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    console.log(`[Bulk Submit] Submitting ${Object.keys(responses).length} responses for assessment ${id}`);

    // Save all responses
    assessment.responses = { ...assessment.responses, ...responses };

    // Mark all categories as completed
    if (completedCategories && Array.isArray(completedCategories)) {
      assessment.completedCategories = completedCategories;
    }

    // Update assessment status
    if (status) {
      assessment.status = status;
      if (status === 'completed') {
        assessment.completedAt = new Date().toISOString();
      }
    }

    // Update assessment metadata
    assessment.lastModified = new Date().toISOString();

    await assessments.set(id, assessment);

    console.log(`[Bulk Submit] Successfully saved ${Object.keys(responses).length} responses`);

    res.json({
      success: true,
      data: {
        progress: 100,
        isCompleted: true,
        totalResponses: Object.keys(responses).length
      }
    });
  } catch (error) {
    console.error('[Bulk Submit] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting bulk responses',
      error: error.message
    });
  }
});

// Update assessment metadata (name, email, etc.)
app.patch('/api/assessment/:id/metadata', async (req, res) => {
  try {
    const { id } = req.params;
    const { assessmentName, organizationName, contactEmail, industry, assessmentDescription, editorEmail } = req.body;
    
    const assessment = await assessments.get(id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Initialize edit history if it doesn't exist
    if (!assessment.editHistory) {
      assessment.editHistory = [];
    }

    // Track what changed
    const changes = {};
    if (assessmentName && assessmentName !== assessment.assessmentName) {
      changes.assessmentName = { from: assessment.assessmentName, to: assessmentName };
      assessment.assessmentName = assessmentName;
    }
    if (organizationName && organizationName !== assessment.organizationName) {
      changes.organizationName = { from: assessment.organizationName, to: organizationName };
      assessment.organizationName = organizationName;
    }
    if (contactEmail && contactEmail !== assessment.contactEmail) {
      changes.contactEmail = { from: assessment.contactEmail, to: contactEmail };
      assessment.contactEmail = contactEmail;
    }
    if (industry && industry !== assessment.industry) {
      changes.industry = { from: assessment.industry, to: industry };
      assessment.industry = industry;
    }
    if (assessmentDescription !== undefined && assessmentDescription !== assessment.assessmentDescription) {
      changes.assessmentDescription = { from: assessment.assessmentDescription, to: assessmentDescription };
      assessment.assessmentDescription = assessmentDescription;
    }

    // Add to edit history
    if (Object.keys(changes).length > 0) {
      assessment.editHistory.push({
        timestamp: new Date().toISOString(),
        editorEmail: editorEmail || contactEmail || 'Unknown',
        changes: changes
      });
    }

    // Update last modified
    assessment.lastModified = new Date().toISOString();
    await assessments.set(id, assessment);

    res.json({
      success: true,
      message: 'Assessment metadata updated',
      data: {
        id: assessment.id,
        assessmentName: assessment.assessmentName,
        organizationName: assessment.organizationName,
        contactEmail: assessment.contactEmail,
        industry: assessment.industry,
        assessmentDescription: assessment.assessmentDescription,
        lastModified: assessment.lastModified,
        editHistory: assessment.editHistory
      }
    });
  } catch (error) {
    console.error('Error updating assessment metadata:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating assessment metadata',
      error: error.message
    });
  }
});

// Save edited Executive Summary content (SME reviews and refines AI-generated content)
app.put('/api/assessment/:id/edited-executive-summary', async (req, res) => {
  try {
    const { id } = req.params;
    const editedContent = req.body;
    
    const assessment = await assessments.get(id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Store edited content
    assessment.editedExecutiveSummary = editedContent;
    assessment.lastModified = new Date().toISOString();
    
    // Track edit in history
    if (!assessment.editHistory) {
      assessment.editHistory = [];
    }
    assessment.editHistory.push({
      timestamp: new Date().toISOString(),
      action: 'Executive Summary Edited',
      editor: req.body.editorEmail || assessment.contactEmail || 'SME'
    });
    
    await assessments.set(id, assessment);

    console.log(`✅ Executive Summary edited for assessment: ${id}`);

    res.json({
      success: true,
      message: 'Executive Summary content saved',
      data: {
        id: assessment.id,
        lastModified: assessment.lastModified
      }
    });
  } catch (error) {
    console.error('Error saving edited Executive Summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving edited content',
      error: error.message
    });
  }
});

// Auto-save individual question responses (with editor tracking)
app.post('/api/assessment/:id/save-progress', async (req, res) => {
  try {
    const { id } = req.params;
    const { questionId, perspectiveId, value, comment, isSkipped, editorEmail } = req.body;
    
    const assessment = await assessments.get(id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Track who made this edit
    if (editorEmail) {
      if (!assessment.editors) {
        assessment.editors = [];
      }
      if (!assessment.editors.includes(editorEmail)) {
        assessment.editors.push(editorEmail);
      }
      assessment.lastEditor = editorEmail;
      assessment.lastEditedAt = new Date().toISOString();
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
    
    // CRITICAL: Clear cached results when responses change
    delete assessment.results;
    
    await assessments.set(id, assessment);

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

// Generate adaptive assessment results (NEW - uses all inputs)
app.get('/api/assessment/:id/adaptive-results', async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await assessments.get(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    console.log('🎯 Generating ADAPTIVE results for assessment:', id);
    console.log('Using: Current state, Future state, Pain points, and Comments');
    
    const hasAnyResponses = Object.keys(assessment.responses).length > 0;
    
    if (!hasAnyResponses) {
      return res.json({
        success: true,
        data: {
          message: 'No responses yet',
          assessmentInfo: {
            id: assessment.id,
            assessmentName: assessment.assessmentName,
            startedAt: assessment.startedAt
          }
        }
      });
    }
    
    // Use adaptive engine
    let recommendations = adaptiveRecommendationEngine.generateAdaptiveRecommendations(
      assessment.responses,
      assessment.completedCategories.length > 0 ? assessment.completedCategories : null
    );
    
    console.log('✅ Adaptive recommendations generated successfully');
    console.log('Pain point recommendations:', recommendations.painPointRecommendations.length);
    console.log('Gap-based actions:', recommendations.gapBasedActions.length);
    console.log('Comment insights:', recommendations.commentBasedInsights.length);
    
    // Enhance with live data if enabled
    if (process.env.USE_LIVE_DATA === 'true') {
      console.log('🔄 Enhancing with live data...');
      try {
        recommendations = await liveDataEnhancer.enhanceRecommendations(
          recommendations,
          {
            currentScore: recommendations.overall.currentScore,
            painPoints: recommendations.painPointRecommendations,
            gaps: recommendations.gapBasedActions
          }
        );
        console.log('✅ Live data enhancement completed');
      } catch (error) {
        console.error('❌ Live data enhancement failed:', error);
        console.log('⚠️  Continuing with base recommendations');
      }
    }
    
    res.json({
      success: true,
      data: {
        assessmentInfo: {
          id: assessment.id,
          assessmentName: assessment.assessmentName,
          organizationName: assessment.organizationName,
          startedAt: assessment.startedAt,
          completedAt: assessment.completedAt
        },
        ...recommendations,
        _engineType: 'adaptive',
        _liveDataEnabled: process.env.USE_LIVE_DATA === 'true',
        _liveDataSource: recommendations.whatsNew?.lastUpdated ? 'active' : 'disabled'
      }
    });
  } catch (error) {
    console.error('❌ Error generating adaptive results:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error generating adaptive assessment results',
      error: error.message
    });
  }
});

// Generate assessment results and recommendations (ADAPTIVE with live data)
app.get('/api/assessment/:id/results', async (req, res) => {
  try {
    console.log(`🎯 [RESULTS ENDPOINT] Request for assessment: ${req.params.id}`);
    
    // CRITICAL: Prevent caching of dynamic results
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });

    const { id } = req.params;
    const assessment = await assessments.get(id);

    if (!assessment) {
      console.log(`❌ [RESULTS ENDPOINT] Assessment ${id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }
    
    console.log(`✅ [RESULTS ENDPOINT] Assessment ${id} found, has ${Object.keys(assessment.responses || {}).length} responses`);

    // DEBUG: Log what we retrieved
    console.log('🔍 Results endpoint - Retrieved assessment:', id);
    console.log('🔍 Assessment object keys:', Object.keys(assessment));
    console.log('🔍 Assessment.responses type:', typeof assessment.responses);
    console.log('🔍 Assessment.responses null/undefined?:', assessment.responses === null || assessment.responses === undefined);
    console.log('🔍 Assessment.responses is object?:', assessment.responses && typeof assessment.responses === 'object');

    // FIX: Ensure responses exists and is an object
    if (!assessment.responses || typeof assessment.responses !== 'object') {
      console.warn('⚠️  WARNING: Assessment responses is null/undefined or not an object! Initializing to empty object.');
      assessment.responses = {};
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
    
    // Generate content using OpenAI (dynamically generates ALL content based on assessment data)
    let recommendations;
    if (hasAnyResponses) {
      console.log('🤖 Generating content using OpenAI for overall assessment');
      console.log('Sending ALL assessment data: Current state, Future state, Pain points, Comments');
      
      // Use OpenAI to generate fresh content on every request
      recommendations = await openAIContentGenerator.generateAssessmentContent(assessment, null);
      
      console.log('✅ OpenAI content generation completed');
      console.log('Overall scores:', recommendations.overall);
      console.log('Recommendations:', recommendations.prioritizedActions?.length || 0);
      
      // 🎯 ENHANCE with real Databricks product features
      console.log('🔧 Enhancing recommendations with actual Databricks features...');
      try {
        // Enhance prioritizedActions with real Databricks features for each pillar
        if (recommendations.prioritizedActions && Array.isArray(recommendations.prioritizedActions)) {
          recommendations.prioritizedActions = recommendations.prioritizedActions.map(action => {
            const pillarId = action.pillarId || action.area || action.pillar;
            const maturityLevel = recommendations.areaScores?.[pillarId]?.currentScore || action.currentScore || 1;
            
            // Get contextualized Databricks features for this pillar
            const databricksRecs = DatabricksFeatureMapper.getRecommendationsForPillar(
              pillarId,
              Math.round(maturityLevel),
              assessment.responses
            );
            
            console.log(`🔧 Enhancing pillar ${pillarId} (level ${Math.round(maturityLevel)}) with ${databricksRecs.currentMaturity?.features?.length || 0} features`);
            
            // Enhance action with actual Databricks features
            return {
              ...action,
              databricksFeatures: databricksRecs.currentMaturity?.features || [],
              nextLevelFeatures: databricksRecs.nextLevel?.features || [],
              quickWins: databricksRecs.quickWins || [],
              strategicMoves: databricksRecs.strategicMoves || [],
              specificRecommendations: databricksRecs.quickWins || [], // Use quickWins for "Next Steps" (customer engagement)
              _source: 'Databricks Release Notes - October 2025',
              _docsUrl: 'https://docs.databricks.com/aws/en/release-notes/product/'
            };
          });
          console.log(`✅ Enhanced ${recommendations.prioritizedActions.length} pillar recommendations with Databricks features`);
          // Log first pillar for debugging
          if (recommendations.prioritizedActions.length > 0) {
            console.log(`📊 Sample enhanced pillar:`, {
              pillarId: recommendations.prioritizedActions[0].pillarId || recommendations.prioritizedActions[0].area,
              databricksFeatures: recommendations.prioritizedActions[0].databricksFeatures?.length || 0,
              quickWins: recommendations.prioritizedActions[0].quickWins?.length || 0,
              specificRecommendations: recommendations.prioritizedActions[0].specificRecommendations?.length || 0
            });
          }
        }
        
        // Add Databricks-specific quick wins to overall recommendations
        if (recommendations.quickWins) {
          const databricksQuickWins = [];
          Object.keys(recommendations.areaScores || {}).forEach(pillarId => {
            const level = Math.round(recommendations.areaScores[pillarId].currentScore || 1);
            const recs = DatabricksFeatureMapper.getRecommendationsForPillar(pillarId, level);
            if (recs.quickWins) {
              databricksQuickWins.push(...recs.quickWins);
            }
          });
          recommendations.databricksQuickWins = databricksQuickWins.slice(0, 5);
          console.log(`✅ Added ${databricksQuickWins.length} Databricks quick wins`);
        }
        
      } catch (error) {
        console.error('⚠️  Error enhancing with Databricks features:', error);
        console.log('Continuing with base recommendations');
      }
    } else {
      // Provide default empty recommendations structure
      recommendations = {
        overall: {
          currentScore: 0,
          futureScore: 0,
          gap: 0,
          level: assessmentFramework.maturityLevels[1],
          summary: 'No responses yet. Start answering questions to see your maturity assessment results.'
        },
        areaScores: {},
        categories: {},
        painPointRecommendations: [],
        gapBasedActions: [],
        commentBasedInsights: [],
        prioritizedActions: [],
        roadmap: { immediate: [], shortTerm: [], longTerm: [] },
        quickWins: [],
        riskAreas: [],
        executiveSummary: ''
      };
      console.log('No responses yet - using default empty state');
    }
    
    // Calculate detailed category scores from ADAPTIVE engine (for all areas with responses)
    const categoryDetails = {};
    
    // Ensure areaScores exists
    if (!recommendations.areaScores) {
      recommendations.areaScores = {};
    }
    
    console.log('🔍 DEBUG: recommendations.areaScores:', JSON.stringify(recommendations.areaScores, null, 2));
    console.log('🔍 DEBUG: areasWithResponses:', areasWithResponses.map(a => a.id));
    
    areasWithResponses.forEach(area => {
      const areaScore = recommendations.areaScores[area.id] || { current: 0, future: 0 };
      console.log(`🔍 DEBUG: Area ${area.id} - areaScore from recommendations:`, areaScore);
      const currentScore = areaScore.current || 0;
      const futureScore = areaScore.future || 0;
      const isCompleted = assessment.completedCategories.includes(area.id);
      
      // Calculate questions answered for this pillar AND dimension-level scores
      let questionsAnsweredForPillar = 0;
      let totalQuestionsForPillar = 0;
      const dimensionScores = {};
      
      area.dimensions.forEach(dimension => {
        let dimCurrentSum = 0;
        let dimFutureSum = 0;
        let dimQuestionCount = 0;
        let dimAnsweredCount = 0;
        
        dimension.questions.forEach(question => {
          totalQuestionsForPillar++;
          dimQuestionCount++;
          
          const currentKey = `${question.id}_current_state`;
          const futureKey = `${question.id}_future_state`;
          
          if (assessment.responses[currentKey] !== undefined) {
            questionsAnsweredForPillar++;
            dimAnsweredCount++;
            dimCurrentSum += assessment.responses[currentKey];
            dimFutureSum += assessment.responses[futureKey] || assessment.responses[currentKey];
          }
        });
        
        // Calculate dimension scores
        if (dimAnsweredCount > 0) {
          dimensionScores[dimension.id] = {
            id: dimension.id,
            name: dimension.name,
            currentScore: dimCurrentSum / dimAnsweredCount,
            futureScore: dimFutureSum / dimAnsweredCount,
            gap: (dimFutureSum / dimAnsweredCount) - (dimCurrentSum / dimAnsweredCount),
            questionsAnswered: dimAnsweredCount,
            totalQuestions: dimQuestionCount
          };
        }
      });
      
      categoryDetails[area.id] = {
        id: area.id,
        name: area.name,
        description: area.description,
        score: Math.round(currentScore), // Use current score as overall score
        currentScore: Math.round(currentScore),
        futureScore: Math.round(futureScore),
        gap: Math.round(futureScore - currentScore),
        level: adaptiveRecommendationEngine.getMaturityLevel(currentScore),
        weight: areasWithResponses.length > 0 ? 1 / areasWithResponses.length : 0,
        isPartial: !isCompleted,
        questionsAnswered: questionsAnsweredForPillar,
        totalQuestions: totalQuestionsForPillar,
        dimensions: dimensionScores // ADD dimension-level scores
      };
    });

    // 🔥 INTELLIGENT RECOMMENDATIONS: Generate customer-specific, actionable recommendations
    console.log('🧠 Generating intelligent, customer-specific recommendations...');
    const intelligentEngine = new IntelligentRecommendationEngine();
    
    // Enhance each pillar's prioritizedActions with intelligent, customer-specific recommendations
    if (recommendations.prioritizedActions && Array.isArray(recommendations.prioritizedActions)) {
      recommendations.prioritizedActions = recommendations.prioritizedActions.map(action => {
        const pillarId = action.pillarId || action.area || action.pillar;
        const pillarMaturity = categoryDetails[pillarId]?.score || 3;
        
        console.log(`🧠 Analyzing pillar: ${pillarId} (maturity: ${pillarMaturity})`);
        
        // Get the pillar framework data to pass actual question IDs
        const pillarFramework = assessmentFramework.assessmentAreas.find(a => a.id === pillarId);
        
        // Generate intelligent, customer-specific recommendations
        const intelligentRecs = intelligentEngine.generateRecommendations(
          assessment,
          pillarId,
          pillarFramework
        );
        
        console.log(`✅ Found ${intelligentRecs.recommendations.length} intelligent recommendations for ${pillarId}`);
        console.log(`✅ Found ${intelligentRecs.nextSteps.length} customer-specific next steps for ${pillarId}`);
        
        // DEBUG: Log intelligent recommendations
        if (intelligentRecs.recommendations.length > 0) {
          console.log(`📝 Intelligent recommendations for ${pillarId}:`, intelligentRecs.recommendations.slice(0, 1));
        }
        
        // Replace generic recommendations with intelligent, customer-specific ones
        return {
          ...action,
          // Override with intelligent recommendations based on actual pain points and comments
          theGood: intelligentRecs.theGood.length > 0 ? intelligentRecs.theGood : action.theGood,
          theBad: intelligentRecs.theBad.length > 0 ? intelligentRecs.theBad : action.theBad,
          recommendations: intelligentRecs.recommendations.length > 0 ? intelligentRecs.recommendations : action.recommendations,
          specificRecommendations: intelligentRecs.nextSteps.length > 0 ? intelligentRecs.nextSteps : action.specificRecommendations,
          databricksFeatures: intelligentRecs.databricksFeatures.length > 0 ? intelligentRecs.databricksFeatures : action.databricksFeatures,
          _intelligentEngine: true,
          _painPointsAnalyzed: intelligentRecs.theBad.length,
          _strengthsIdentified: intelligentRecs.theGood.length
        };
      });
      
      // 🗺️ GENERATE DYNAMIC STRATEGIC ROADMAP based on prioritized actions
      console.log('🗺️ Generating dynamic strategic roadmap...');
      const dynamicRoadmap = intelligentEngine.generateStrategicRoadmap(recommendations.prioritizedActions);
      recommendations.roadmap = dynamicRoadmap;
      console.log(`✅ Dynamic roadmap generated with ${dynamicRoadmap.phases?.length || 0} phases`);
      
      // 💰 CALCULATE BUSINESS IMPACT based on assessment gaps and features
      console.log('💰 Calculating dynamic business impact metrics...');
      const businessImpact = intelligentEngine.calculateBusinessImpact(
        assessment,
        recommendations.prioritizedActions,
        assessment.industry || 'Technology'
      );
      recommendations.businessImpact = businessImpact;
      console.log(`✅ Business impact calculated: ${businessImpact.decisionSpeed?.value}, ${businessImpact.costOptimization?.value}, ${businessImpact.manualOverhead?.value}`);
      
      // 📊 GENERATE DYNAMIC MATURITY SUMMARY based on assessment
      console.log('📊 Generating dynamic maturity summary...');
      const currentScore = recommendations.overall?.currentScore || 3;
      const targetScore = recommendations.overall?.futureScore || 4;
      const maturitySummary = intelligentEngine.generateMaturitySummary(
        assessment,
        recommendations.prioritizedActions,
        currentScore,
        targetScore,
        assessment.industry || 'Technology'
      );
      recommendations.maturitySummary = maturitySummary;
      console.log(`✅ Maturity summary generated: ${maturitySummary.current.level} → ${maturitySummary.target.level}`);
    }

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
        completionPercentage: totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0,
        lastModified: assessment.lastModified,
        lastEditor: assessment.lastEditor,
        editHistory: assessment.editHistory || []
      },
      overall: recommendations.overall, // ADAPTIVE: includes currentScore, futureScore, gap, level, summary
      categoryDetails,
      categories: recommendations.categories,
      painPointRecommendations: recommendations.painPointRecommendations || [], // ADAPTIVE: Critical pain points to address
      gapBasedActions: recommendations.gapBasedActions || [], // ADAPTIVE: Actions to bridge current → future gap
      commentBasedInsights: recommendations.commentBasedInsights || [], // ADAPTIVE: Insights from user notes
      prioritizedActions: recommendations.prioritizedActions,
      roadmap: recommendations.roadmap,
      businessImpact: recommendations.businessImpact, // DYNAMIC: Calculated based on gaps, industry, and features
      maturitySummary: recommendations.maturitySummary, // DYNAMIC: Descriptions of current, target, and improvement
      quickWins: recommendations.quickWins,
      riskAreas: recommendations.riskAreas,
      executiveSummary: recommendations.executiveSummary || '', // ADAPTIVE: Executive summary
      whatsNew: recommendations.whatsNew, // ADAPTIVE: Latest Databricks features
      pillarStatus: assessmentFramework.assessmentAreas.map(area => {
        const isCompleted = assessment.completedCategories.includes(area.id);
        const hasResponses = areasWithResponses.some(a => a.id === area.id);
        return {
          id: area.id,
          name: area.name,
          completed: isCompleted,
          hasResponses: hasResponses,
          isPartial: hasResponses && !isCompleted,
          score: hasResponses ? categoryDetails[area.id]?.score : null,
          currentScore: hasResponses ? categoryDetails[area.id]?.currentScore : null,
          futureScore: hasResponses ? categoryDetails[area.id]?.futureScore : null,
          gap: hasResponses ? categoryDetails[area.id]?.gap : null
        };
      }),
      _engineType: 'openai',
      _contentSource: 'openai-generated',
      _generatedAt: new Date().toISOString(), // Track when this was generated
      _isDynamic: true // Flag indicating this is ALWAYS dynamically generated, NEVER cached
    };

    // ⚠️ NO CACHING - Results are ALWAYS generated fresh from current assessment data
    // Every API call regenerates results using OpenAI based on latest responses
    console.log('✅ Results generated dynamically - NO CACHING');

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

// Submit NPS feedback
app.post('/api/assessment/:id/nps-feedback', async (req, res) => {
  try {
    const { id } = req.params;
    const { score, comment, assessmentName } = req.body;
    
    console.log(`[NPS Feedback] Received for assessment ${id}:`, { score, comment });
    
    // Validate score
    if (score === null || score === undefined || score < 0 || score > 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid NPS score. Must be between 0 and 10.'
      });
    }
    
    const assessment = await assessments.get(id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }
    
    // Add NPS feedback to assessment
    assessment.npsFeedback = {
      score: parseInt(score, 10),
      comment: comment || '',
      submittedAt: new Date().toISOString(),
      category: score >= 9 ? 'Promoter' : score >= 7 ? 'Passive' : 'Detractor'
    };
    
    await assessments.set(id, assessment);
    
    console.log(`[NPS Feedback] Saved successfully for ${id}`);
    
    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: assessment.npsFeedback
    });
  } catch (error) {
    console.error('Error submitting NPS feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
});

// Helper functions for NPS calculation
function calculateNPS(assessments) {
  const withFeedback = assessments.filter(a => a.npsFeedback && a.npsFeedback.score !== null && a.npsFeedback.score !== undefined);
  
  if (withFeedback.length === 0) {
    return 'N/A'; // No feedback yet
  }
  
  const promoters = withFeedback.filter(a => a.npsFeedback.score >= 9).length;
  const detractors = withFeedback.filter(a => a.npsFeedback.score <= 6).length;
  const total = withFeedback.length;
  
  // NPS = (% Promoters - % Detractors)
  const nps = ((promoters / total) * 100) - ((detractors / total) * 100);
  
  return nps.toFixed(1);
}

function calculateNPSTrend(allAssessments, recentAssessments, previousAssessments) {
  const recentNPS = calculateNPS(recentAssessments);
  const previousNPS = calculateNPS(previousAssessments);
  
  if (recentNPS === 'N/A' || previousNPS === 'N/A') {
    return '0.0';
  }
  
  const trend = parseFloat(recentNPS) - parseFloat(previousNPS);
  return trend.toFixed(1);
}

function getNPSBreakdown(assessments) {
  const withFeedback = assessments.filter(a => a.npsFeedback && a.npsFeedback.score !== null && a.npsFeedback.score !== undefined);
  
  if (withFeedback.length === 0) {
    return {
      promoters: 0,
      passives: 0,
      detractors: 0,
      total: 0,
      promotersPercent: 0,
      passivesPercent: 0,
      detractorsPercent: 0
    };
  }
  
  const promoters = withFeedback.filter(a => a.npsFeedback.score >= 9).length;
  const passives = withFeedback.filter(a => a.npsFeedback.score >= 7 && a.npsFeedback.score <= 8).length;
  const detractors = withFeedback.filter(a => a.npsFeedback.score <= 6).length;
  const total = withFeedback.length;
  
  return {
    promoters,
    passives,
    detractors,
    total,
    promotersPercent: ((promoters / total) * 100).toFixed(1),
    passivesPercent: ((passives / total) * 100).toFixed(1),
    detractorsPercent: ((detractors / total) * 100).toFixed(1)
  };
}

// Dashboard statistics endpoint - ALL DYNAMIC DATA
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const allAssessments = await assessments.values();
    console.log(`[Dashboard Stats] Processing ${allAssessments.length} assessments`);
    
    // Sort assessments by date for trend calculations
    const sortedByDate = [...allAssessments].sort((a, b) => 
      new Date(a.startedAt) - new Date(b.startedAt)
    );
    
    // Calculate date ranges for trends (last 30 days vs previous 30 days)
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);
    
    const recentAssessments = allAssessments.filter(a => 
      new Date(a.startedAt).getTime() >= thirtyDaysAgo
    );
    const previousAssessments = allAssessments.filter(a => 
      new Date(a.startedAt).getTime() >= sixtyDaysAgo && 
      new Date(a.startedAt).getTime() < thirtyDaysAgo
    );
    
    // 1. TOTAL ASSESSMENTS with trend
    const totalAssessments = allAssessments.length;
    const totalAssessmentsTrend = recentAssessments.length - previousAssessments.length;
    
    // 2. ACTIVE CUSTOMERS with trend
    const activeCustomers = new Set(allAssessments.map(a => a.organizationName)).size;
    const recentCustomers = new Set(recentAssessments.map(a => a.organizationName)).size;
    const previousCustomers = new Set(previousAssessments.map(a => a.organizationName)).size;
    const activeCustomersTrend = recentCustomers - previousCustomers;
    
    // 3. AVERAGE COMPLETION TIME with trend
    const completedAssessments = allAssessments.filter(a => a.completedAt);
    const recentCompleted = completedAssessments.filter(a => 
      new Date(a.completedAt).getTime() >= thirtyDaysAgo
    );
    const previousCompleted = completedAssessments.filter(a => 
      new Date(a.completedAt).getTime() >= sixtyDaysAgo && 
      new Date(a.completedAt).getTime() < thirtyDaysAgo
    );
    
    const calcAvgTime = (assessments) => {
      if (assessments.length === 0) return 0;
      return assessments.reduce((sum, a) => {
        const hours = (new Date(a.completedAt) - new Date(a.startedAt)) / (1000 * 60 * 60);
        return sum + hours;
      }, 0) / assessments.length;
    };
    
    const avgCompletionTime = calcAvgTime(completedAssessments);
    const recentAvgTime = calcAvgTime(recentCompleted);
    const previousAvgTime = calcAvgTime(previousCompleted);
    const avgCompletionTimeTrend = previousAvgTime > 0 ? 
      (previousAvgTime - recentAvgTime).toFixed(1) : '0.0';
    
    // 4. AVERAGE MATURITY LEVEL with trend
    const calcAvgMaturity = (assessments) => {
      let totalMaturity = 0;
      let count = 0;
      assessments.forEach(assessment => {
        if (assessment.responses && Object.keys(assessment.responses).length > 0) {
          const currentStates = Object.keys(assessment.responses)
            .filter(key => key.endsWith('_current_state'))
            .map(key => parseInt(assessment.responses[key], 10))
            .filter(val => !isNaN(val));
          
          if (currentStates.length > 0) {
            totalMaturity += currentStates.reduce((a, b) => a + b, 0) / currentStates.length;
            count++;
          }
        }
      });
      return count > 0 ? totalMaturity / count : 0;
    };
    
    const avgMaturityLevel = calcAvgMaturity(allAssessments);
    const recentAvgMaturity = calcAvgMaturity(recentAssessments);
    const previousAvgMaturity = calcAvgMaturity(previousAssessments);
    const avgMaturityLevelTrend = previousAvgMaturity > 0 ? 
      (recentAvgMaturity - previousAvgMaturity).toFixed(1) : '0.0';
    
    // 5. AVERAGE IMPROVEMENT POTENTIAL with trend
    const calcAvgImprovement = (assessments) => {
      let totalImprovement = 0;
      let count = 0;
      assessments.forEach(assessment => {
        if (assessment.responses && Object.keys(assessment.responses).length > 0) {
          const keys = Object.keys(assessment.responses);
          const questionIds = new Set();
          keys.forEach(key => {
            if (key.endsWith('_current_state') || key.endsWith('_future_state')) {
              const qId = key.replace('_current_state', '').replace('_future_state', '');
              questionIds.add(qId);
            }
          });
          
          questionIds.forEach(qId => {
            const current = parseInt(assessment.responses[`${qId}_current_state`], 10);
            const future = parseInt(assessment.responses[`${qId}_future_state`], 10);
            if (!isNaN(current) && !isNaN(future)) {
              totalImprovement += (future - current);
              count++;
            }
          });
        }
      });
      return count > 0 ? totalImprovement / count : 0;
    };
    
    const avgImprovementPotential = calcAvgImprovement(allAssessments);
    const recentAvgImprovement = calcAvgImprovement(recentAssessments);
    const previousAvgImprovement = calcAvgImprovement(previousAssessments);
    const avgImprovementPotentialTrend = previousAvgImprovement > 0 ? 
      (recentAvgImprovement - previousAvgImprovement).toFixed(1) : '0.0';
    
    // 6. PILLAR-SPECIFIC MATURITY (dynamic by pillar)
    const pillarIds = ['platform_governance', 'data_engineering', 'analytics_bi', 'ml_mlops', 'genai_agentic', 'operational_excellence'];
    const pillarMaturityCurrent = [];
    const pillarMaturityTarget = [];
    
    pillarIds.forEach(pillarId => {
      let pillarCurrentTotal = 0;
      let pillarFutureTotal = 0;
      let pillarCount = 0;
      
      allAssessments.forEach(assessment => {
        if (assessment.responses) {
          const pillarKeys = Object.keys(assessment.responses).filter(key => 
            key.startsWith(pillarId) && (key.endsWith('_current_state') || key.endsWith('_future_state'))
          );
          
          const currentStates = pillarKeys
            .filter(key => key.endsWith('_current_state'))
            .map(key => parseInt(assessment.responses[key], 10))
            .filter(val => !isNaN(val));
          
          const futureStates = pillarKeys
            .filter(key => key.endsWith('_future_state'))
            .map(key => parseInt(assessment.responses[key], 10))
            .filter(val => !isNaN(val));
          
          if (currentStates.length > 0) {
            pillarCurrentTotal += currentStates.reduce((a, b) => a + b, 0) / currentStates.length;
            pillarCount++;
          }
          
          if (futureStates.length > 0) {
            pillarFutureTotal += futureStates.reduce((a, b) => a + b, 0) / futureStates.length;
          }
        }
      });
      
      pillarMaturityCurrent.push(pillarCount > 0 ? (pillarCurrentTotal / pillarCount).toFixed(1) : 3.0);
      pillarMaturityTarget.push(pillarCount > 0 ? (pillarFutureTotal / pillarCount).toFixed(1) : 4.0);
    });
    
    // 7. WEEKLY COMPLETIONS (last 6 weeks) - DYNAMIC
    const weeklyCompletions = { labels: [], counts: [], avgHours: [] };
    const weeksAgo = 6;
    
    for (let i = weeksAgo - 1; i >= 0; i--) {
      const weekStart = now - ((i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = now - (i * 7 * 24 * 60 * 60 * 1000);
      
      const weekCompleted = completedAssessments.filter(a => {
        const completedTime = new Date(a.completedAt).getTime();
        return completedTime >= weekStart && completedTime < weekEnd;
      });
      
      const weekLabel = `W${weeksAgo - i}`;
      const weekCount = weekCompleted.length;
      const weekAvgHours = calcAvgTime(weekCompleted);
      
      weeklyCompletions.labels.push(weekLabel);
      weeklyCompletions.counts.push(weekCount);
      weeklyCompletions.avgHours.push(weekAvgHours > 0 ? parseFloat(weekAvgHours.toFixed(1)) : 0);
    }
    
    // 8. CUSTOMER PORTFOLIO with dynamic key gaps
    const customerPortfolio = allAssessments
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
      .slice(0, 10)
      .map(assessment => {
        const completion = Math.round((assessment.completedCategories?.length || 0) / 6 * 100);
        let status = 'On Track';
        if (completion < 50) status = 'Delayed';
        else if (completion < 80) status = 'At Risk';
        
        // Calculate maturity and target from responses
        let maturity = 0;
        let target = 0;
        if (assessment.responses && Object.keys(assessment.responses).length > 0) {
          const currentStates = Object.keys(assessment.responses)
            .filter(key => key.endsWith('_current_state'))
            .map(key => parseInt(assessment.responses[key], 10))
            .filter(val => !isNaN(val));
          
          const futureStates = Object.keys(assessment.responses)
            .filter(key => key.endsWith('_future_state'))
            .map(key => parseInt(assessment.responses[key], 10))
            .filter(val => !isNaN(val));
          
          if (currentStates.length > 0) {
            maturity = currentStates.reduce((a, b) => a + b, 0) / currentStates.length;
          }
          
          if (futureStates.length > 0) {
            target = futureStates.reduce((a, b) => a + b, 0) / futureStates.length;
          }
        }
        
        // Calculate key gaps dynamically (pillars with largest gaps)
        const pillarGaps = [];
        const pillarNames = {
          'platform_governance': 'Platform',
          'data_engineering': 'Data Eng',
          'analytics_bi': 'Analytics',
          'ml_mlops': 'ML/MLOps',
          'genai_agentic': 'GenAI',
          'operational_excellence': 'Ops'
        };
        
        pillarIds.forEach(pillarId => {
          if (assessment.responses) {
            const pillarKeys = Object.keys(assessment.responses).filter(key => key.startsWith(pillarId));
            const currentStates = pillarKeys
              .filter(key => key.endsWith('_current_state'))
              .map(key => parseInt(assessment.responses[key], 10))
              .filter(val => !isNaN(val));
            const futureStates = pillarKeys
              .filter(key => key.endsWith('_future_state'))
              .map(key => parseInt(assessment.responses[key], 10))
              .filter(val => !isNaN(val));
            
            if (currentStates.length > 0 && futureStates.length > 0) {
              const avgCurrent = currentStates.reduce((a, b) => a + b, 0) / currentStates.length;
              const avgFuture = futureStates.reduce((a, b) => a + b, 0) / futureStates.length;
              const gap = avgFuture - avgCurrent;
              pillarGaps.push({ pillar: pillarNames[pillarId], gap });
            }
          }
        });
        
        // Get top 2 gaps
        const keyGaps = pillarGaps
          .sort((a, b) => b.gap - a.gap)
          .slice(0, 2)
          .map(g => g.pillar);
        
        return {
          name: assessment.organizationName || 'Unknown',
          assessmentId: assessment.id,
          maturity: maturity > 0 ? maturity.toFixed(1) : '0.0',
          target: target > 0 ? target.toFixed(1) : '0.0',
          completion: completion,
          keyGaps: keyGaps.length > 0 ? keyGaps : ['N/A'],
          status: status
        };
      });
    
    // 9. FASTEST COMPLETIONS (top 2)
    const fastest = completedAssessments
      .map(a => ({
        ...a,
        completionTime: (new Date(a.completedAt) - new Date(a.startedAt)) / (1000 * 60 * 60)
      }))
      .sort((a, b) => a.completionTime - b.completionTime)
      .slice(0, 2)
      .map(a => ({
        name: a.organizationName || 'Unknown',
        assessmentId: a.id,
        detail: `${a.completionTime.toFixed(1)} hrs • Owner: ${a.contactEmail?.split('@')[0] || 'Unknown'}`
      }));
    
    // 10. BIGGEST IMPROVEMENTS (top 2 by gap)
    const improvementList = allAssessments
      .map(a => {
        const improvement = calcAvgImprovement([a]);
        return { ...a, improvement };
      })
      .filter(a => a.improvement > 0)
      .sort((a, b) => b.improvement - a.improvement)
      .slice(0, 2)
      .map(a => ({
        name: a.organizationName || 'Unknown',
        assessmentId: a.id,
        detail: `+${a.improvement.toFixed(1)} gap • Owner: ${a.contactEmail?.split('@')[0] || 'Unknown'}`
      }));
    
    // 11. STALLED ASSESSMENTS (not completed, oldest first)
    const stalled = allAssessments
      .filter(a => !a.completedAt)
      .map(a => ({
        ...a,
        stalledTime: (now - new Date(a.startedAt).getTime()) / (1000 * 60 * 60)
      }))
      .sort((a, b) => b.stalledTime - a.stalledTime)
      .slice(0, 2)
      .map(a => ({
        name: a.organizationName || 'Unknown',
        assessmentId: a.id,
        detail: `${a.stalledTime.toFixed(0)} hrs stalled • Owner: ${a.contactEmail?.split('@')[0] || 'Unknown'}`
      }));
    
    console.log('[Dashboard Stats] Calculations complete');
    
    res.json({
      success: true,
      data: {
        totalAssessments,
        totalAssessmentsTrend,
        activeCustomers,
        activeCustomersTrend,
        avgCompletionTime: avgCompletionTime > 0 ? avgCompletionTime.toFixed(1) : '0.0',
        avgCompletionTimeTrend,
        avgMaturityLevel: avgMaturityLevel > 0 ? avgMaturityLevel.toFixed(1) : '0.0',
        avgMaturityLevelTrend,
        avgImprovementPotential: avgImprovementPotential > 0 ? avgImprovementPotential.toFixed(1) : '0.0',
        avgImprovementPotentialTrend,
        feedbackNPS: calculateNPS(allAssessments),
        feedbackNPSTrend: calculateNPSTrend(allAssessments, recentAssessments, previousAssessments),
        npsBreakdown: getNPSBreakdown(allAssessments),
        avgMaturityByPillar: {
          current: pillarMaturityCurrent,
          target: pillarMaturityTarget
        },
        weeklyCompletions,
        customerPortfolio,
        fastest: fastest.length > 0 ? fastest : [{ name: 'No data', assessmentId: null, detail: 'Complete assessments to see data' }],
        improvement: improvementList.length > 0 ? improvementList : [{ name: 'No data', assessmentId: null, detail: 'Complete assessments to see data' }],
        stalled: stalled.length > 0 ? stalled : [{ name: 'No data', assessmentId: null, detail: 'All assessments completed' }]
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  res.json({
    status: 'ok',
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
app.get('/api/assessments', async (req, res) => {
  try {
    const allAssessments = await assessments.values(); // Await the async call
    const assessmentsList = allAssessments.map(assessment => ({
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
app.post('/api/assessment/:id/clone', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationName, contactEmail, industry, assessmentName, assessmentDescription } = req.body;
    
    const originalAssessment = await assessments.get(id);
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

    await assessments.set(newAssessmentId, clonedAssessment);

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
app.delete('/api/assessment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!await assessments.has(id)) {
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

// Get pillar-specific ADAPTIVE results (uses all inputs + latest features)
app.get('/api/assessment/:id/pillar/:pillarId/results', async (req, res) => {
  try {
    // CRITICAL: Prevent caching of dynamic pillar results
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });

    const { id, pillarId } = req.params;
    const assessment = await assessments.get(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // DEBUG: Log what we retrieved for pillar
    console.log('🔍 Pillar endpoint - Retrieved assessment:', id);
    console.log('🔍 Assessment.responses type:', typeof assessment.responses);
    console.log('🔍 Assessment.responses null/undefined?:', assessment.responses === null || assessment.responses === undefined);

    // FIX: Ensure responses exists and is an object
    if (!assessment.responses || typeof assessment.responses !== 'object') {
      console.warn('⚠️  WARNING: Assessment responses is null/undefined or not an object! Initializing to empty object.');
      assessment.responses = {};
    }

    // Find the specific pillar
    const pillar = assessmentFramework.assessmentAreas.find(area => area.id === pillarId);
    if (!pillar) {
      return res.status(404).json({
        success: false,
        message: 'Pillar not found'
      });
    }

    // Check if this pillar has responses (don't require it to be "completed")
    const pillarResponses = Object.keys(assessment.responses || {}).filter(key => {
      if (key.includes('_comment') || key.includes('_skipped')) return false;
      // Check if this response belongs to this pillar
      const pillarQuestions = pillar.dimensions.flatMap(d => d.questions).map(q => q.id);
      const questionId = key.split('_current_state')[0].split('_future_state')[0].split('_technical_pain')[0].split('_business_pain')[0];
      return pillarQuestions.includes(questionId);
    });
    
    if (pillarResponses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No responses found for this pillar yet. Please answer some questions first.'
      });
    }
    
    console.log(`Found ${pillarResponses.length} responses for pillar ${pillarId}`);

    console.log(`🤖 Generating content using OpenAI for pillar: ${pillarId}`);
    console.log('Sending ALL assessment data for this pillar to OpenAI');

    // Use OpenAI to generate fresh content for this specific pillar
    let pillarResults = await openAIContentGenerator.generateAssessmentContent(assessment, pillarId);

    console.log('✅ OpenAI pillar content generation completed:', pillarId);

    // Extract scores from the pillar results
    const currentScore = pillarResults.pillar.currentScore || 0;
    const futureScore = pillarResults.pillar.futureScore || 0;
    const gap = pillarResults.pillar.gap || 0;
    
    // 🎯 ENHANCE with real Databricks product features
    console.log(`🔧 Enhancing pillar ${pillarId} with actual Databricks features...`);
    try {
      const databricksRecs = DatabricksFeatureMapper.getRecommendationsForPillar(
        pillarId,
        Math.round(currentScore),
        assessment.responses
      );
      
      // Add Databricks features to pillar results
      pillarResults.databricksFeatures = databricksRecs.currentMaturity?.features || [];
      pillarResults.nextLevelFeatures = databricksRecs.nextLevel?.features || [];
      pillarResults.quickWins = databricksRecs.quickWins || [];
      pillarResults.strategicMoves = databricksRecs.strategicMoves || [];
      pillarResults.specificRecommendations = databricksRecs.quickWins || []; // Use quickWins for "Next Steps" (customer engagement)
      pillarResults._source = 'Databricks Release Notes - October 2025';
      pillarResults._docsUrl = 'https://docs.databricks.com/aws/en/release-notes/product/';
      
      console.log(`✅ Enhanced pillar ${pillarId} with ${pillarResults.databricksFeatures.length} Databricks features`);
    } catch (error) {
      console.error('⚠️  Error enhancing pillar with Databricks features:', error);
      pillarResults.databricksFeatures = [];
    }
    
    // 🔥 INTELLIGENT RECOMMENDATIONS: Generate customer-specific, actionable solutions
    console.log(`🧠 Generating intelligent recommendations for pillar ${pillarId}...`);
    try {
      const intelligentEngine = new IntelligentRecommendationEngine();
      const intelligentRecs = intelligentEngine.generateRecommendations(
        assessment,
        pillarId,
        pillar // Pass the pillar framework structure
      );
      
      console.log(`✅ Generated ${intelligentRecs.recommendations.length} intelligent recommendations`);
      console.log(`✅ Generated ${intelligentRecs.nextSteps.length} customer-specific next steps`);
      console.log(`✅ Identified ${intelligentRecs.theGood.length} strengths and ${intelligentRecs.theBad.length} challenges`);
      
      // Replace with intelligent, customer-specific recommendations
      if (intelligentRecs.theGood.length > 0) {
        pillarResults.theGood = intelligentRecs.theGood;
      }
      if (intelligentRecs.theBad.length > 0) {
        pillarResults.theBad = intelligentRecs.theBad;
      }
      if (intelligentRecs.recommendations.length > 0) {
        pillarResults.recommendations = intelligentRecs.recommendations;
      }
      if (intelligentRecs.nextSteps.length > 0) {
        pillarResults.specificRecommendations = intelligentRecs.nextSteps;
        pillarResults.quickWins = intelligentRecs.nextSteps;
      }
      if (intelligentRecs.databricksFeatures.length > 0) {
        pillarResults.databricksFeatures = intelligentRecs.databricksFeatures;
      }
      
      pillarResults._intelligentEngine = true;
      pillarResults._painPointsAnalyzed = intelligentRecs.theBad.length;
      pillarResults._strengthsIdentified = intelligentRecs.theGood.length;
    } catch (error) {
      console.error('⚠️  Error in intelligent recommendation generation:', error);
    }
    
    // Use pillar details from OpenAI
    const pillarDetails = {
      id: pillar.id,
      name: pillar.name,
      description: pillar.description,
      score: Math.round(currentScore),
      currentScore: Math.round(currentScore),
      futureScore: Math.round(futureScore),
      gap: Math.round(gap),
      maturityLevel: pillarResults.pillar.level,
      dimensionsCompleted: pillar.dimensions.length,
      questionsAnswered: pillar.dimensions.reduce((total, dim) => total + (dim.questions?.length || 0), 0)
    };

    res.json({
      success: true,
      pillarDetails,
      summary: pillarResults.summary || '',
      recommendations: pillarResults.recommendations || [],
      // NEW: Databricks-specific features
      databricksFeatures: pillarResults.databricksFeatures || [],
      nextLevelFeatures: pillarResults.nextLevelFeatures || [],
      quickWins: pillarResults.quickWins || [],
      strategicMoves: pillarResults.strategicMoves || [],
      specificRecommendations: pillarResults.specificRecommendations || [],
      _source: pillarResults._source || null,
      _docsUrl: pillarResults._docsUrl || null,
      // Original fields
      painPointRecommendations: pillarResults.painPointRecommendations || [],
      gapBasedActions: pillarResults.gapBasedActions || [],
      commentBasedInsights: pillarResults.commentBasedInsights || [],
      prioritizedActions: pillarResults.recommendations || [],
      assessmentId: id,
      pillarId,
      generatedAt: new Date().toISOString(),
      isPillarSpecific: true,
      _engineType: 'openai',
      _contentSource: 'openai-generated'
    });
  } catch (error) {
    console.error('❌ Error generating pillar results:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error generating pillar results',
      error: error.message
    });
  }
});

// Debug endpoint to manually complete an assessment for testing
app.post('/api/assessment/:id/debug/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await assessments.get(id);

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
    
    await assessments.set(id, assessment);

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

// Create new assessment
app.post('/api/assessment', async (req, res) => {
  try {
    const { organizationName, industry, contactEmail, assessmentName } = req.body;
    
    if (!organizationName || !assessmentName) {
      return res.status(400).json({
        success: false,
        message: 'Organization name and assessment name are required'
      });
    }
    
    const newAssessment = {
      id: `assessment_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      assessmentName,
      organizationName,
      industry: industry || '',
      contactEmail: contactEmail || '',
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      responses: {},
      completedCategories: [],
      editHistory: []
    };
    
    await assessments.set(newAssessment.id, newAssessment);
    
    console.log(`✅ New assessment created: ${newAssessment.id} (${newAssessment.assessmentName})`);
    
    res.json({
      success: true,
      message: 'Assessment created successfully',
      id: newAssessment.id,
      assessmentName: newAssessment.assessmentName,
      organizationName: newAssessment.organizationName
    });
  } catch (error) {
    console.error('❌ Error creating assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating assessment',
      error: error.message
    });
  }
});

// Generate sample assessment with random realistic data
app.post('/api/assessment/generate-sample', async (req, res) => {
  try {
    const { completionLevel = 'full', specificPillars = null } = req.body;
    
    console.log(`🎲 Generating sample assessment with completion level: ${completionLevel}`);
    
    // Generate sample assessment
    const sampleAssessment = sampleAssessmentGenerator.generateSampleAssessment({
      completionLevel,
      specificPillars
    });
    
    // Save to storage (use set method, not save)
    await assessments.set(sampleAssessment.id, sampleAssessment);
    
    console.log(`✅ Sample assessment created: ${sampleAssessment.id} (${sampleAssessment.assessmentName})`);
    console.log(`   Completed pillars: ${sampleAssessment.completedCategories.length}/6`);
    console.log(`   Total responses: ${Object.keys(sampleAssessment.responses).length}`);
    
    res.json({
      success: true,
      message: 'Sample assessment generated successfully',
      assessment: {
        id: sampleAssessment.id,
        assessmentName: sampleAssessment.assessmentName,
        organizationName: sampleAssessment.organizationName,
        status: sampleAssessment.status,
        completedCategories: sampleAssessment.completedCategories,
        responses: sampleAssessment.responses,  // Include responses for validation
        totalResponses: Object.keys(sampleAssessment.responses).length
      }
    });
  } catch (error) {
    console.error('❌ Error generating sample assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating sample assessment',
      error: error.message
    });
  }
});

// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files (JS, CSS, images, manifest.json, etc.) - must be BEFORE catch-all
  app.use(express.static(path.join(__dirname, '../client/build'), {
    setHeaders: (res, filePath) => {
      // Set proper content types
      if (filePath.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json');
      }
    }
  }));
  
  // Catch-all handler for non-API routes - must be LAST
  app.get('*', async (req, res) => {
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
  app.listen(PORT, async () => {
    console.log(`🚀 Databricks Maturity Assessment API running on port ${PORT}`);
    console.log(`📊 Assessment framework loaded with ${assessmentFramework.assessmentAreas.length} areas`);
    
    // Get assessment count asynchronously
    try {
      const count = await assessments.size();
      console.log(`💾 ${count} assessment(s) loaded from persistent storage`);
    } catch (error) {
      console.log(`💾 Assessment storage initialized (count unavailable)`);
    }
    
    console.log(`🔗 API Health Check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;




