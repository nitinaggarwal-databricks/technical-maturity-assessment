import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiBarChart2, 
  FiCheckCircle, 
  FiTarget,
  FiTrendingUp,
  FiAlertCircle,
  FiZap,
  FiArrowRight
} from 'react-icons/fi';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import toast from 'react-hot-toast';
import * as assessmentService from '../services/assessmentService';
import LoadingSpinner from './LoadingSpinner';
import AssessmentHeader from './AssessmentHeader';
import assessmentFramework from '../data/assessmentFramework';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ResultsContainer = styled.div`
  min-height: calc(100vh - 80px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 20px;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const HeaderSection = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const BackButton = styled(motion.button)`
  position: absolute;
  top: 20px;
  left: 20px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #374151;
  transition: all 0.3s ease;

  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
    transform: translateX(-2px);
  }
`;

const ViewOverallButton = styled(motion.button)`
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 40px auto;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
  }
`;

const PillarTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const ScoreSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
`;

const ScoreCard = styled(motion.div)`
  background: ${props => props.bgColor || 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'};
  color: white;
  padding: 24px 32px;
  border-radius: 16px;
  text-align: center;
  min-width: 200px;
`;

const ChartSection = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
`;

const ChartContainer = styled.div`
  height: 400px;
  margin-top: 24px;
`;

const ScoreValue = styled.div`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 8px;
`;

const ScoreLabel = styled.div`
  font-size: 1.1rem;
  opacity: 0.9;
`;

const MaturityLevel = styled(motion.div)`
  background: ${props => props.color || '#10b981'};
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
`;

const RecommendationsSection = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RecommendationCard = styled(motion.div)`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  border-left: 4px solid ${props => props.priority === 'high' ? '#ef4444' : props.priority === 'medium' ? '#f59e0b' : '#10b981'};
`;

const RecommendationTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RecommendationDescription = styled.p`
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 16px;
`;

const ActionItems = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ActionItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  color: #374151;
  font-size: 0.95rem;

  &:before {
    content: "→";
    color: #3b82f6;
    font-weight: bold;
    margin-top: 2px;
  }
`;

const NavigationSection = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
`;

const NavButton = styled(motion.button)`
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  ${props => props.variant === 'primary' && `
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    }
  `}

  ${props => props.variant === 'secondary' && `
    background: white;
    color: #374151;
    border: 2px solid #e5e7eb;
    
    &:hover {
      border-color: #3b82f6;
      color: #3b82f6;
    }
  `}
`;

const PillarResults = () => {
  const { assessmentId, pillarId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPillarResults = async () => {
      try {
        setLoading(true);
        console.log('Loading pillar results for:', assessmentId, pillarId);
        const pillarResults = await assessmentService.getPillarResults(assessmentId, pillarId);
        console.log('Pillar results loaded:', pillarResults);
        setResults(pillarResults);
      } catch (error) {
        console.error('Error loading pillar results:', error);
        toast.error('Failed to load pillar results: ' + (error.response?.data?.message || error.message));
        // Don't navigate away - let user see error and try again
        setResults(null);
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId && pillarId) {
      loadPillarResults();
    } else {
      console.error('Missing assessmentId or pillarId');
      setLoading(false);
    }
  }, [assessmentId, pillarId]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <FiAlertCircle />;
      case 'medium': return <FiTarget />;
      case 'low': return <FiZap />;
      default: return <FiCheckCircle />;
    }
  };

  if (loading) {
    return (
      <ResultsContainer>
        <LoadingSpinner message="Generating pillar recommendations..." />
      </ResultsContainer>
    );
  }

  if (!results || !results.pillarDetails) {
    return (
      <ResultsContainer>
        <ContentWrapper>
          <HeaderSection>
            <h1>Results Not Available</h1>
            <p>Unable to load pillar results. Please try again.</p>
            <div style={{ marginTop: '20px', color: '#6b7280', fontSize: '0.9rem' }}>
              Debug info: assessmentId={assessmentId}, pillarId={pillarId}, 
              hasResults={!!results}, hasPillarDetails={!!results?.pillarDetails},
              hasPainPoints={!!results?.painPointRecommendations}
            </div>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Retry
            </button>
            <button 
              onClick={() => navigate(`/results/${assessmentId}`)} 
              style={{
                marginTop: '10px',
                marginLeft: '10px',
                padding: '12px 24px',
                background: 'white',
                color: '#374151',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Go to Overall Results
            </button>
          </HeaderSection>
        </ContentWrapper>
      </ResultsContainer>
    );
  }

  return (
    <>
      <AssessmentHeader
        assessmentId={assessmentId}
        assessmentName={results?.assessmentInfo?.assessmentName || assessment?.assessmentName || 'Pillar Results'}
        organizationName={results?.assessmentInfo?.organizationName || assessment?.organizationName}
        currentView="results"
        onAssessmentUpdate={(updatedData) => {
          if (updatedData.assessmentName) {
            // Reload pillar results after edit
            window.location.reload();
          }
        }}
        isSample={assessment?.name?.includes('Sample') || assessment?.organizationName?.includes('Sample')}
      />
      
      <ResultsContainer>
        <BackButton
          onClick={() => navigate(`/assessment/${assessmentId}/${pillarId}`)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
        <FiArrowLeft size={16} />
        Back to Assessment
      </BackButton>

      <ContentWrapper>
        <HeaderSection
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PillarTitle>
            <FiBarChart2 size={32} />
            {results.pillarDetails.name} Results
          </PillarTitle>
          
          <ScoreSection>
            <ScoreCard
              bgColor="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ScoreValue>{results.pillarDetails.currentScore || 0}</ScoreValue>
              <ScoreLabel>Current Maturity</ScoreLabel>
            </ScoreCard>
            
            <ScoreCard
              bgColor="linear-gradient(135deg, #10b981 0%, #059669 100%)"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <ScoreValue>{results.pillarDetails.futureScore || 0}</ScoreValue>
              <ScoreLabel>Future Vision</ScoreLabel>
            </ScoreCard>
            
            <MaturityLevel
              color={results.pillarDetails.maturityLevel.color}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {results.pillarDetails.maturityLevel.level}: {results.pillarDetails.maturityLevel.description}
            </MaturityLevel>
          </ScoreSection>

          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            Based on {results.pillarDetails.questionsAnswered} questions across {results.pillarDetails.dimensionsCompleted} dimensions
          </p>
        </HeaderSection>

        <ChartSection
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <SectionTitle>
            <FiBarChart2 />
            Maturity Comparison
          </SectionTitle>
          <ChartContainer>
            <Bar 
              data={{
                labels: ['Current State', 'Future Vision'],
                datasets: [{
                  label: results.pillarDetails.name,
                  data: [results.pillarDetails.currentScore || 0, results.pillarDetails.futureScore || 0],
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)'
                  ],
                  borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)'
                  ],
                  borderWidth: 2,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `Score: ${context.parsed.y}/5`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                      stepSize: 1
                    },
                    title: {
                      display: true,
                      text: 'Maturity Score'
                    }
                  }
                }
              }}
            />
          </ChartContainer>
        </ChartSection>

        <RecommendationsSection
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <SectionTitle>
            <FiTrendingUp />
            Adaptive Recommendations for {results.pillarDetails.name}
          </SectionTitle>

          {/* Pain Point Recommendations */}
          {results.painPointRecommendations && results.painPointRecommendations.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiAlertCircle size={20} style={{ color: '#ef4444' }} />
                Critical Pain Points to Address
              </h3>
              {results.painPointRecommendations.map((rec, idx) => (
                <RecommendationCard
                  priority={rec.priority}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + idx * 0.1 }}
                  key={idx}
                >
                  <RecommendationTitle>
                    {getPriorityIcon(rec.priority)}
                    {rec.title || rec.solution}
                  </RecommendationTitle>
                  <RecommendationDescription>
                    {/* Why Now - Pain Points Addressed */}
                    {(rec.whyNow || (rec.painPointNames && rec.painPointNames.length > 0)) && (
                      <div style={{ marginBottom: '12px', padding: '10px', background: '#fef3c7', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
                        <strong style={{ color: '#b45309' }}>🎯 Why This Matters:</strong>
                        <div style={{ marginTop: '4px', color: '#78350f' }}>
                          {rec.whyNow || `Addresses: ${rec.painPointNames.join(', ')}`}
                        </div>
                      </div>
                    )}

                    {/* Specific Actions */}
                    {rec.actions && rec.actions.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <strong style={{ color: '#1e40af', display: 'block', marginBottom: '8px' }}>📋 Implementation Steps:</strong>
                        <ol style={{ marginTop: '4px', marginLeft: '24px', lineHeight: '1.8' }}>
                          {rec.actions.map((action, actionIdx) => (
                            <li key={actionIdx} style={{ marginBottom: '6px', color: '#1e3a8a' }}>{action}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Prerequisites, Timeline, Team */}
                    <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
                      {rec.prerequisites && (
                        <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '6px' }}>
                          <strong style={{ color: '#1e40af' }}>Prerequisites:</strong>
                          <div style={{ marginTop: '4px', color: '#1e3a8a' }}>{rec.prerequisites}</div>
                        </div>
                      )}
                      {rec.timeline && (
                        <div style={{ padding: '8px', background: '#f0fdf4', borderRadius: '6px' }}>
                          <strong style={{ color: '#047857' }}>Timeline:</strong>
                          <div style={{ marginTop: '4px', color: '#065f46' }}>{rec.timeline}</div>
                        </div>
                      )}
                      {rec.teamRequired && (
                        <div style={{ padding: '8px', background: '#fef3c7', borderRadius: '6px' }}>
                          <strong style={{ color: '#b45309' }}>Team:</strong>
                          <div style={{ marginTop: '4px', color: '#78350f' }}>{rec.teamRequired}</div>
                        </div>
                      )}
                      {rec.successMetrics && (
                        <div style={{ padding: '8px', background: '#f5f3ff', borderRadius: '6px' }}>
                          <strong style={{ color: '#6b21a8' }}>Success Metrics:</strong>
                          <div style={{ marginTop: '4px', color: '#581c87' }}>{rec.successMetrics}</div>
                        </div>
                      )}
                    </div>

                    {/* Legacy Impact field */}
                    {rec.impact && !rec.whyNow && <div style={{ marginTop: '12px' }}><strong>Impact:</strong> {rec.impact}</div>}
                  </RecommendationDescription>
                  {rec.latestSolutions && rec.latestSolutions.length > 0 && (
                    <div style={{ marginTop: '12px', padding: '12px', background: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                      <strong style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiZap size={16} /> Latest Databricks Solutions:
                      </strong>
                      {rec.latestSolutions.map((sol, solIdx) => (
                        <div key={solIdx} style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                          <div style={{ fontWeight: 600, color: '#047857' }}>{sol.name}</div>
                          <div style={{ color: '#6b7280', marginTop: '4px' }}>{sol.description}</div>
                          {sol.benefit && <div style={{ color: '#059669', marginTop: '4px', fontStyle: 'italic' }}>✓ {sol.benefit}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#6b7280' }}>
                    <strong>Priority:</strong> <span style={{ color: getPriorityColor(rec.priority), fontWeight: 600 }}>{rec.priority.toUpperCase()}</span>
                  </div>
                </RecommendationCard>
              ))}
            </div>
          )}

          {/* Gap-Based Actions */}
          {results.gapBasedActions && results.gapBasedActions.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiTarget size={20} style={{ color: '#3b82f6' }} />
                Bridge the Gap: Current → Future
              </h3>
              {results.gapBasedActions.map((action, idx) => (
                <RecommendationCard
                  priority="medium"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 1.0 + idx * 0.1 }}
                  key={idx}
                >
                  <RecommendationTitle>
                    <FiArrowRight />
                    {action.dimension}
                  </RecommendationTitle>
                  <RecommendationDescription>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span><strong>Current:</strong> Level {action.current}/5</span>
                      <span><strong>Target:</strong> Level {action.future}/5</span>
                      <span><strong>Gap:</strong> {action.gap} levels</span>
                    </div>
                    <div><strong>Recommended Action:</strong> {action.recommendation}</div>
                  </RecommendationDescription>
                </RecommendationCard>
              ))}
            </div>
          )}

          {/* Comment-Based Insights */}
          {results.commentBasedInsights && results.commentBasedInsights.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiCheckCircle size={20} style={{ color: '#8b5cf6' }} />
                Insights from Your Notes
              </h3>
              {results.commentBasedInsights.map((insight, idx) => (
                <RecommendationCard
                  priority="low"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 1.2 + idx * 0.1 }}
                  key={idx}
                  style={{ background: '#faf5ff', borderLeft: '4px solid #8b5cf6' }}
                >
                  <RecommendationTitle style={{ color: '#7c3aed' }}>
                    <FiCheckCircle />
                    {insight.dimension}
                  </RecommendationTitle>
                  <RecommendationDescription>
                    <div style={{ fontStyle: 'italic', color: '#6b7280', marginBottom: '8px' }}>
                      "{insight.originalComment}"
                    </div>
                    <div><strong>Insight:</strong> {insight.insight}</div>
                  </RecommendationDescription>
                </RecommendationCard>
              ))}
            </div>
          )}

          {/* What's New from Databricks */}
          {results.whatsNew && results.whatsNew.relevantToYou && results.whatsNew.relevantToYou.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiZap size={20} style={{ color: '#10b981' }} />
                Latest Databricks Features Relevant to You
              </h3>
              {results.whatsNew.relevantToYou.map((feature, idx) => (
                <RecommendationCard
                  priority="high"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 1.4 + idx * 0.1 }}
                  key={idx}
                  style={{ background: '#f0fdf4', borderLeft: '4px solid #10b981' }}
                >
                  <RecommendationTitle style={{ color: '#059669' }}>
                    <FiZap />
                    {feature.name}
                  </RecommendationTitle>
                  <RecommendationDescription>
                    <div>{feature.description}</div>
                    {feature.benefit && (
                      <div style={{ marginTop: '8px', color: '#047857', fontWeight: 600 }}>
                        ✓ {feature.benefit}
                      </div>
                    )}
                    {feature.relevanceReason && (
                      <div style={{ marginTop: '8px', padding: '8px', background: 'white', borderRadius: '6px', fontSize: '0.9rem' }}>
                        <strong>Why this matters to you:</strong> {feature.relevanceReason}
                      </div>
                    )}
                    {feature.guide && (
                      <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#6b7280' }}>
                        <strong>Implementation:</strong> {feature.guide}
                      </div>
                    )}
                    <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#6b7280' }}>
                      <strong>Relevance Score:</strong> {feature.relevanceScore}/100 | <strong>Impact:</strong> {feature.impact} | <strong>Difficulty:</strong> {feature.difficulty}
                    </div>
                  </RecommendationDescription>
                </RecommendationCard>
              ))}
            </div>
          )}

          {/* Show message if no recommendations */}
          {(!results.painPointRecommendations || results.painPointRecommendations.length === 0) &&
           (!results.gapBasedActions || results.gapBasedActions.length === 0) &&
           (!results.commentBasedInsights || results.commentBasedInsights.length === 0) && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <FiCheckCircle size={48} style={{ marginBottom: '16px' }} />
              <h3>Excellent Work!</h3>
              <p>This pillar shows strong maturity. Continue monitoring and optimizing your current practices.</p>
            </div>
          )}
        </RecommendationsSection>

        <NavigationSection>
          {(() => {
            // Find current pillar index and next pillar
            const currentIndex = assessmentFramework.assessmentAreas.findIndex(area => area.id === pillarId);
            const nextPillar = currentIndex >= 0 && currentIndex < assessmentFramework.assessmentAreas.length - 1
              ? assessmentFramework.assessmentAreas[currentIndex + 1]
              : null;
            
            return (
              <>
                <NavButton
                  variant="secondary"
                  onClick={() => navigate(`/assessment/${assessmentId}/${pillarId}`)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiArrowLeft size={16} />
                  Edit This Pillar
                </NavButton>
                
                {nextPillar && (
                  <NavButton
                    variant="primary"
                    onClick={() => navigate(`/assessment/${assessmentId}/${nextPillar.id}`)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue to {nextPillar.name}
                    <FiArrowRight size={16} />
                  </NavButton>
                )}
                
                <NavButton
                  variant={nextPillar ? "secondary" : "primary"}
                  onClick={() => navigate(`/results/${assessmentId}`)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Overall Results
                  <FiArrowRight size={16} />
                </NavButton>
              </>
            );
          })()}
        </NavigationSection>
      </ContentWrapper>
    </ResultsContainer>
    </>
  );
};

export default PillarResults;
