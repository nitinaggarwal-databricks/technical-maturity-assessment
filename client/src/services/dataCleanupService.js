import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5001/api' : '/api');

const dataCleanupService = {
  /**
   * Get all corrupted assessments
   */
  getCorruptedAssessments: async () => {
    try {
      const response = await axios.get(`${API_URL}/data-cleanup/corrupted-assessments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching corrupted assessments:', error);
      throw error;
    }
  },

  /**
   * Get data quality statistics
   */
  getDataQualityStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/data-cleanup/data-quality-stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching data quality stats:', error);
      throw error;
    }
  },

  /**
   * Delete a specific assessment
   */
  deleteAssessment: async (assessmentId) => {
    try {
      const response = await axios.delete(`${API_URL}/data-cleanup/assessment/${assessmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting assessment:', error);
      throw error;
    }
  },

  /**
   * Bulk delete corrupted assessments
   */
  bulkDeleteCorrupted: async (assessmentIds) => {
    try {
      const response = await axios.post(`${API_URL}/data-cleanup/bulk-delete-corrupted`, {
        assessmentIds
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting assessments:', error);
      throw error;
    }
  }
};

export default dataCleanupService;

