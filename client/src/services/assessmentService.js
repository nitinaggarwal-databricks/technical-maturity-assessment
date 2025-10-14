import axios from 'axios';

// Use relative URLs by default (works in production when served from same domain)
// For local development with separate servers, set REACT_APP_API_URL=http://localhost:5000/api in .env
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'Server error occurred';
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

// Assessment Service Functions

/**
 * Get the assessment framework with all categories and questions
 */
export const getAssessmentFramework = async () => {
  try {
    const response = await api.get('/assessment/framework');
    return response.data;
  } catch (error) {
    console.error('Error fetching assessment framework:', error);
    throw error;
  }
};

/**
 * Start a new assessment
 */
export const startAssessment = async (organizationInfo) => {
  try {
    const response = await api.post('/assessment/start', organizationInfo);
    return response.data;
  } catch (error) {
    console.error('Error starting assessment:', error);
    throw error;
  }
};

/**
 * Get assessment status and progress
 */
export const getAssessmentStatus = async (assessmentId) => {
  try {
    const response = await api.get(`/assessment/${assessmentId}/status`);
    // Backend returns { success: true, data: { ... } }
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    // Fallback for backwards compatibility
    return response.data;
  } catch (error) {
    console.error('Error fetching assessment status:', error);
    throw error;
  }
};

/**
 * Get questions for a specific category
 */
export const getCategoryQuestions = async (assessmentId, categoryId) => {
  try {
    const response = await api.get(`/assessment/${assessmentId}/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category questions:', error);
    throw error;
  }
};

/**
 * Submit responses for a category
 */
export const submitCategoryResponses = async (assessmentId, categoryId, responses) => {
  try {
    const response = await api.post(`/assessment/${assessmentId}/category/${categoryId}/submit`, {
      responses
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting category responses:', error);
    throw error;
  }
};

/**
 * Get assessment results and recommendations
 */
export const getAssessmentResults = async (assessmentId) => {
  try {
    const response = await api.get(`/assessment/${assessmentId}/results`);
    // Backend returns data directly for results endpoint
    return response.data;
  } catch (error) {
    console.error('Error fetching assessment results:', error);
    throw error;
  }
};

/**
 * Auto-save progress for individual question responses
 */
export const saveProgress = async (assessmentId, questionId, perspectiveId, value, comment, isSkipped, editorEmail) => {
  try {
    const response = await api.post(`/assessment/${assessmentId}/save-progress`, {
      questionId,
      perspectiveId,
      value,
      comment,
      isSkipped,
      editorEmail
    });
    return response.data;
  } catch (error) {
    console.error('Error saving progress:', error);
    // Don't throw error for auto-save failures to avoid disrupting user experience
    return { success: false, error: error.message };
  }
};

/**
 * Get all assessments for management
 */
export const getAllAssessments = async () => {
  try {
    const response = await api.get('/assessments');
    // Handle different response structures and ensure we always return an array
    if (response && response.data) {
      return Array.isArray(response.data) ? response.data : [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching assessments:', error);
    // Return empty array instead of throwing to prevent UI crash
    return [];
  }
};

/**
 * Clone an existing assessment
 */
export const cloneAssessment = async (assessmentId, organizationData = {}) => {
  try {
    const response = await api.post(`/assessment/${assessmentId}/clone`, organizationData);
    return response.data.data;
  } catch (error) {
    console.error('Error cloning assessment:', error);
    throw error;
  }
};

/**
 * Delete an assessment
 */
export const deleteAssessment = async (assessmentId) => {
  try {
    const response = await api.delete(`/assessment/${assessmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting assessment:', error);
    throw error;
  }
};

/**
 * Update assessment metadata (name, email, etc.)
 */
export const updateAssessmentMetadata = async (assessmentId, metadata) => {
  try {
    const response = await api.patch(`/assessment/${assessmentId}/metadata`, metadata);
    return response;
  } catch (error) {
    console.error('Error updating assessment metadata:', error);
    throw error;
  }
};

/**
 * Get pillar-specific results and recommendations
 */
export const getPillarResults = async (assessmentId, pillarId) => {
  try {
    console.log(`[getPillarResults] Fetching for assessment: ${assessmentId}, pillar: ${pillarId}`);
    const response = await api.get(`/assessment/${assessmentId}/pillar/${pillarId}/results`);
    console.log('[getPillarResults] Raw response:', response);
    console.log('[getPillarResults] Response data:', response.data);
    
    // Backend returns { success: true, data: { pillarDetails, ... } }
    if (response.data && response.data.success && response.data.data) {
      console.log('[getPillarResults] Returning response.data.data');
      return response.data.data;
    }
    
    // Fallback: if response.data has pillarDetails directly
    if (response.data && response.data.pillarDetails) {
      console.log('[getPillarResults] Returning response.data directly');
      return response.data;
    }
    
    console.error('[getPillarResults] Unexpected response structure:', response);
    console.error('[getPillarResults] Expected: { success: true, data: { pillarDetails, ... } }');
    throw new Error('API returned unexpected response structure');
  } catch (error) {
    console.error('[getPillarResults] Error fetching pillar results:', error);
    console.error('[getPillarResults] Error response:', error.response?.data);
    throw error;
  }
};

/**
 * Health check
 */
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

// Utility functions

/**
 * Calculate progress percentage
 */
export const calculateProgress = (completedCategories, totalCategories) => {
  if (!totalCategories || totalCategories === 0) return 0;
  return Math.round((completedCategories / totalCategories) * 100);
};

/**
 * Format assessment duration
 */
export const formatDuration = (startTime, endTime) => {
  if (!startTime) return 'Unknown';
  
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const diffMs = end - start;
  
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Get maturity level color
 */
export const getMaturityColor = (score) => {
  const colors = {
    1: '#ff4444',
    2: '#ff8800',
    3: '#ffaa00',
    4: '#88cc00',
    5: '#00cc44'
  };
  return colors[score] || '#cccccc';
};

/**
 * Get priority color
 */
export const getPriorityColor = (priority) => {
  const colors = {
    'critical': '#ff4444',
    'high': '#ff8800',
    'medium': '#ffaa00',
    'low': '#88cc00'
  };
  return colors[priority] || '#cccccc';
};

/**
 * Validate assessment responses
 */
export const validateResponses = (questions, responses) => {
  const errors = [];
  
  questions.forEach(question => {
    const response = responses[question.id];
    
    if (!response) {
      errors.push(`Response required for: ${question.question}`);
    } else if (question.type === 'multiple_choice' && (!Array.isArray(response) || response.length === 0)) {
      errors.push(`At least one option must be selected for: ${question.question}`);
    }
  });
  
  return errors;
};

export default api;




