import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5001/api' : '/api');

/**
 * Enhanced Author Role API Service
 * Handles all author-specific operations: response review, validation, and submission
 */
const authorValidationService = {
  
  /**
   * Get all consumer responses for an assessment
   * @param {string} assessmentId - Assessment ID
   * @param {string} sessionId - Author session ID
   * @returns {Promise} List of responses with validation status
   */
  getConsumerResponses: async (assessmentId, sessionId) => {
    try {
      const response = await axios.get(`${API_URL}/author/consumer-responses/${assessmentId}`, {
        headers: { 'x-session-id': sessionId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching consumer responses:', error);
      throw error;
    }
  },

  /**
   * Validate a consumer response
   * @param {string} assignmentId - Question assignment ID
   * @param {string} status - Validation status (approved, needs_review, clarification_requested)
   * @param {string} comments - Validation comments
   * @param {string} sessionId - Author session ID
   * @returns {Promise} Updated assignment
   */
  validateResponse: async (assignmentId, status, comments, sessionId) => {
    try {
      const response = await axios.post(`${API_URL}/author/validate-response`, {
        assignmentId,
        status,
        comments
      }, {
        headers: { 'x-session-id': sessionId }
      });
      return response.data;
    } catch (error) {
      console.error('Error validating response:', error);
      throw error;
    }
  },

  /**
   * Get validation status for an assessment
   * @param {string} assessmentId - Assessment ID
   * @param {string} sessionId - Author session ID
   * @returns {Promise} Validation statistics and readiness status
   */
  getValidationStatus: async (assessmentId, sessionId) => {
    try {
      const response = await axios.get(`${API_URL}/author/validation-status/${assessmentId}`, {
        headers: { 'x-session-id': sessionId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching validation status:', error);
      throw error;
    }
  },

  /**
   * Submit a completed assessment
   * @param {string} assessmentId - Assessment ID
   * @param {string} submissionNotes - Final submission notes
   * @param {string} sessionId - Author session ID
   * @returns {Promise} Submitted assessment data
   */
  submitAssessment: async (assessmentId, submissionNotes, sessionId) => {
    try {
      const response = await axios.post(`${API_URL}/author/submit-assessment/${assessmentId}`, {
        submissionNotes
      }, {
        headers: { 'x-session-id': sessionId }
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting assessment:', error);
      throw error;
    }
  },

  /**
   * Get assessments assigned to current author
   * @param {string} sessionId - Author session ID
   * @returns {Promise} List of assigned assessments
   */
  getMyAuthorAssignments: async (sessionId) => {
    try {
      const response = await axios.get(`${API_URL}/author/my-author-assignments`, {
        headers: { 'x-session-id': sessionId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching author assignments:', error);
      throw error;
    }
  },

  /**
   * Assign assessment to author (Admin only)
   * @param {string} assessmentId - Assessment ID
   * @param {string} authorId - Author user ID
   * @param {string} sessionId - Admin session ID
   * @returns {Promise} Updated assessment
   */
  assignToAuthor: async (assessmentId, authorId, sessionId) => {
    try {
      const response = await axios.post(`${API_URL}/author/assign-to-author`, {
        assessmentId,
        authorId
      }, {
        headers: { 'x-session-id': sessionId }
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning to author:', error);
      throw error;
    }
  }
};

export default authorValidationService;

