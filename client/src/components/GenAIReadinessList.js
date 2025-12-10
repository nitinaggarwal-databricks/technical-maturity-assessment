import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GenAIReadinessList.css';

const GenAIReadinessList = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, completed, incomplete
  const [sortBy, setSortBy] = useState('date'); // date, score, name

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const response = await axios.get('/api/genai-readiness/assessments');
      setAssessments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading assessments:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) {
      return;
    }

    try {
      await axios.delete(`/api/genai-readiness/assessments/${id}`);
      setAssessments(assessments.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting assessment:', error);
      alert('Failed to delete assessment');
    }
  };

  const getMaturityColor = (level) => {
    const colors = {
      'Initial': '#dc3545',
      'Developing': '#fd7e14',
      'Defined': '#ffc107',
      'Managed': '#20c997',
      'Optimizing': '#28a745'
    };
    return colors[level] || '#6c757d';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredAndSortedAssessments = () => {
    let filtered = [...assessments];

    // Filter
    if (filter === 'completed') {
      filtered = filtered.filter(a => a.totalScore > 0);
    } else if (filter === 'incomplete') {
      filtered = filtered.filter(a => a.totalScore === 0);
    }

    // Sort
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'score') {
      filtered.sort((a, b) => b.totalScore - a.totalScore);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.customerName.localeCompare(b.customerName));
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="genai-list-container">
        <div className="loading">Loading assessments...</div>
      </div>
    );
  }

  const filteredAssessments = getFilteredAndSortedAssessments();

  return (
    <div className="genai-list-container">
      <div className="genai-list-header">
        <div className="header-top">
          <h1>🤖 Gen AI Readiness Assessments</h1>
          <button 
            className="btn-primary"
            onClick={() => navigate('/genai-readiness')}
          >
            + New Assessment
          </button>
        </div>

        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-value">{assessments.length}</div>
            <div className="stat-label">Total Assessments</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {assessments.filter(a => a.totalScore > 0).length}
            </div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {assessments.length > 0 
                ? Math.round(assessments.reduce((sum, a) => sum + a.totalScore, 0) / assessments.length)
                : 0}
            </div>
            <div className="stat-label">Average Score</div>
          </div>
        </div>

        <div className="header-controls">
          <div className="filter-group">
            <label>Filter:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Assessments</option>
              <option value="completed">Completed Only</option>
              <option value="incomplete">In Progress</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Date (Newest First)</option>
              <option value="score">Score (Highest First)</option>
              <option value="name">Customer Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {filteredAssessments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h2>No assessments found</h2>
          <p>
            {filter === 'all' 
              ? 'Get started by creating your first Gen AI Readiness assessment'
              : `No ${filter} assessments found. Try changing the filter.`
            }
          </p>
          <button 
            className="btn-primary"
            onClick={() => navigate('/genai-readiness')}
          >
            Start New Assessment
          </button>
        </div>
      ) : (
        <div className="assessments-grid">
          {filteredAssessments.map(assessment => (
            <div key={assessment.id} className="assessment-card">
              <div className="card-header">
                <h3>{assessment.customerName}</h3>
                {assessment.maturityLevel && (
                  <div 
                    className="maturity-badge"
                    style={{ backgroundColor: getMaturityColor(assessment.maturityLevel) }}
                  >
                    {assessment.maturityLevel}
                  </div>
                )}
              </div>

              <div className="card-body">
                <div className="score-display">
                  <div className="score-value">
                    {assessment.totalScore}/{assessment.maxScore}
                  </div>
                  <div className="score-label">Score</div>
                </div>

                <div className="assessment-meta">
                  <div className="meta-item">
                    <span className="meta-label">Completed:</span>
                    <span className="meta-value">
                      {formatDate(assessment.completedAt)}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Progress:</span>
                    <span className="meta-value">
                      {assessment.totalScore > 0 ? '100%' : '0%'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="btn-view"
                  onClick={() => navigate(`/genai-readiness/report/${assessment.id}`)}
                >
                  View Report
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(assessment.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenAIReadinessList;

