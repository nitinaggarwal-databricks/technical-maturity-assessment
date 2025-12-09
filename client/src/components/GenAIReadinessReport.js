import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import './GenAIReadinessReport.css';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const GenAIReadinessReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [framework, setFramework] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [assessmentRes, frameworkRes] = await Promise.all([
        axios.get(`/api/genai-readiness/assessments/${id}`),
        axios.get('/api/genai-readiness/framework')
      ]);
      setAssessment(assessmentRes.data);
      setFramework(frameworkRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const getRecommendations = (dimensionId, score, maxScore) => {
    if (!framework) return [];
    
    const percentage = (score / maxScore) * 100;
    const recommendations = framework.recommendations[dimensionId];
    
    if (!recommendations) return [];
    
    if (percentage < 40) return recommendations.low || [];
    if (percentage < 70) return recommendations.medium || [];
    return recommendations.high || [];
  };

  const getMaturityLevel = () => {
    if (!framework || !assessment) return null;
    return framework.maturityLevels.find(level => 
      assessment.totalScore >= level.min && assessment.totalScore <= level.max
    );
  };

  const getRadarChartData = () => {
    if (!assessment || !framework) return null;

    const labels = framework.dimensions.map(d => d.name);
    const scores = framework.dimensions.map(d => {
      const dimScore = assessment.scores[d.id];
      return dimScore ? (dimScore.score / dimScore.maxScore) * 5 : 0; // Normalize to 0-5 scale
    });

    return {
      labels,
      datasets: [
        {
          label: assessment.customerName,
          data: scores,
          backgroundColor: 'rgba(102, 126, 234, 0.2)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 3,
          pointBackgroundColor: 'rgba(102, 126, 234, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(102, 126, 234, 1)',
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ]
    };
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 5,
        min: 0,
        ticks: {
          stepSize: 1,
          font: {
            size: 12
          }
        },
        pointLabels: {
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#2d3748'
        },
        grid: {
          color: '#e2e8f0'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const dimensionIndex = context.dataIndex;
            const dimension = framework.dimensions[dimensionIndex];
            const score = assessment.scores[dimension.id];
            return `${dimension.name}: ${score.score}/${score.maxScore} (${score.percentage}%)`;
          }
        }
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // For now, just trigger print. In production, you'd use jsPDF or similar
    window.print();
  };

  if (loading) {
    return (
      <div className="report-container">
        <div className="loading">Loading report...</div>
      </div>
    );
  }

  if (!assessment || !framework) {
    return (
      <div className="report-container">
        <div className="error">Report not found</div>
        <button className="btn-primary" onClick={() => navigate('/genai-readiness')}>
          Start New Assessment
        </button>
      </div>
    );
  }

  const maturityLevel = getMaturityLevel();
  const radarData = getRadarChartData();

  return (
    <div className="report-container">
      {/* Report Header */}
      <div className="report-header">
        <div className="report-title-section">
          <h1>Survey summary {assessment.customerName}</h1>
          <p className="report-date">{formatDate(assessment.completedAt)}</p>
        </div>
        
        <div className="report-actions no-print">
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <button className="btn-secondary" onClick={handlePrint}>
            🖨️ Print
          </button>
          <button className="btn-primary" onClick={handleDownloadPDF}>
            📄 Download PDF
          </button>
        </div>
      </div>

      {/* Final Assessment Score */}
      <div className="score-section">
        <h2>Final assessment score</h2>
        
        <div className="score-cards">
          <div className="score-card">
            <div className="score-value">Score : {assessment.totalScore}/{framework.totalPoints}</div>
          </div>
          
          {maturityLevel && (
            <div className="maturity-card" style={{ backgroundColor: maturityLevel.color }}>
              <div className="maturity-label">Maturity level</div>
              <div className="maturity-value">{maturityLevel.label}</div>
            </div>
          )}
        </div>
      </div>

      {/* Radar Analysis */}
      <div className="radar-section">
        <h2>Radar analysis</h2>
        
        <div className="radar-content">
          <div className="radar-chart-container">
            <div className="radar-chart-title">{assessment.customerName}</div>
            {radarData && (
              <div className="radar-chart">
                <Radar data={radarData} options={radarOptions} />
              </div>
            )}
          </div>
          
          <div className="radar-summary">
            <h3>{assessment.customerName} alone</h3>
            <div className="dimension-scores">
              {framework.dimensions.map(dimension => {
                const score = assessment.scores[dimension.id];
                return (
                  <div key={dimension.id} className="dimension-score-item">
                    <strong>{dimension.name} ({score.score}/{score.maxScore}) :</strong> {dimension.description}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Recommendations */}
      <div className="recommendations-section">
        <h2>Detailed Recommendations</h2>
        
        {framework.dimensions.map(dimension => {
          const score = assessment.scores[dimension.id];
          const recommendations = getRecommendations(dimension.id, score.score, score.maxScore);
          
          return (
            <div key={dimension.id} className="recommendation-card">
              <div className="recommendation-header">
                <h3>{dimension.name}</h3>
                <div className="dimension-score-badge">
                  {score.score}/{score.maxScore} ({score.percentage}%)
                </div>
              </div>
              
              <p className="dimension-description">{dimension.description}</p>
              
              <div className="recommendation-level">
                <strong>Current Status:</strong>{' '}
                {score.percentage < 40 && 'Foundation building required'}
                {score.percentage >= 40 && score.percentage < 70 && 'Good progress, needs enhancement'}
                {score.percentage >= 70 && 'Strong capabilities, optimize for excellence'}
              </div>
              
              <div className="recommendations-list">
                <h4>Action Items:</h4>
                <ul>
                  {recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Maturity Description */}
      {maturityLevel && (
        <div className="maturity-description-section">
          <h2>About Your Maturity Level</h2>
          <div className="maturity-description-card">
            <div className="maturity-level-badge" style={{ backgroundColor: maturityLevel.color }}>
              {maturityLevel.level} - {maturityLevel.label}
            </div>
            <p className="maturity-description-text">{maturityLevel.description}</p>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="next-steps-section">
        <h2>🚀 Next Steps</h2>
        <div className="next-steps-content">
          <ol>
            <li>
              <strong>Prioritize Quick Wins:</strong> Review the recommendations for dimensions with the lowest scores and identify 2-3 high-impact, low-effort initiatives to start immediately.
            </li>
            <li>
              <strong>Build Executive Alignment:</strong> Share this report with leadership to secure buy-in and resources for your GenAI roadmap.
            </li>
            <li>
              <strong>Create a 90-Day Plan:</strong> Select specific action items from each dimension and assign owners with clear timelines.
            </li>
            <li>
              <strong>Establish Metrics:</strong> Define KPIs to track progress in each dimension and schedule quarterly reassessments.
            </li>
            <li>
              <strong>Engage Databricks:</strong> Connect with your Databricks account team to explore how our platform can accelerate your GenAI journey.
            </li>
          </ol>
        </div>
      </div>

      {/* Footer */}
      <div className="report-footer no-print">
        <button className="btn-primary btn-large" onClick={() => navigate('/genai-readiness')}>
          Start New Assessment
        </button>
        <button className="btn-secondary btn-large" onClick={() => navigate('/dashboard')}>
          View All Assessments
        </button>
      </div>
    </div>
  );
};

export default GenAIReadinessReport;

