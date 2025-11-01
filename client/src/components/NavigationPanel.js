import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiChevronDown, 
  FiChevronRight, 
  FiCheckCircle, 
  FiCircle, 
  FiTarget,
  FiBarChart2,
  FiPlay,
  FiEdit3,
  FiSend
} from 'react-icons/fi';
import EditAssessmentModal from './EditAssessmentModal';
import * as assessmentService from '../services/assessmentService';

const NavigationContainer = styled.div`
  width: 350px;
  height: calc(100vh - 80px);
  background: white;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  position: fixed;
  left: 0;
  top: 80px;
  z-index: 100;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
`;

const NavigationHeader = styled.div`
  padding: 24px 20px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8f9fa;
`;

const NavigationTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const NavigationTitle = styled.h3`
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EditButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }
`;

const NavigationSubtitle = styled.p`
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 14px;
`;

const PillarList = styled.div`
  padding: 16px 0;
`;

const PillarItem = styled.div`
  margin-bottom: 8px;
`;

const PillarHeader = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;

  &:hover {
    background: #f3f4f6;
  }

  ${props => props.isActive && `
    background: #eff6ff;
    border-left-color: #3b82f6;
  `}

  ${props => props.isCompleted && `
    background: #f0fdf4;
    border-left-color: #10b981;
  `}
`;

const PillarIcon = styled.div`
  margin-right: 12px;
  display: flex;
  align-items: center;
`;

const PillarInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PillarName = styled.div`
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  line-height: 1.2;
  margin-bottom: 2px;
`;

const PillarProgress = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const ExpandIcon = styled(motion.div)`
  margin-left: 8px;
  color: #6b7280;
`;

const DimensionList = styled(motion.div)`
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
`;

const DimensionItem = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 10px 20px 10px 52px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;

  &:hover {
    background: #f3f4f6;
  }

  ${props => props.isActive && `
    background: #eff6ff;
    border-left-color: #3b82f6;
  `}

  ${props => props.isCompleted && `
    background: #f0fdf4;
    border-left-color: #10b981;
  `}
`;

const DimensionIcon = styled.div`
  margin-right: 10px;
  display: flex;
  align-items: center;
`;

const DimensionName = styled.div`
  font-size: 13px;
  color: #374151;
  font-weight: 500;
`;

const ActionButtonsContainer = styled.div`
  padding: 20px;
  border-top: 2px solid #e5e7eb;
  background: linear-gradient(135deg, #f8f9fa 0%, #e5e7eb 100%);
  margin-top: auto;
`;

const ResultsSection = styled.div`
  margin-bottom: 16px;
`;

const ResultsSectionTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled(motion.button)`
  width: 100%;
  padding: 16px 20px;
  margin-bottom: 8px;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  ${props => props.variant === 'primary' && `
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }
  `}

  ${props => props.variant === 'secondary' && `
    background: #10b981;
    color: white;
    
    &:hover {
      background: #059669;
    }
  `}

  ${props => props.variant === 'accent' && `
    background: #f59e0b;
    color: white;
    
    &:hover {
      background: #d97706;
    }
  `}

  &:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
    box-shadow: none;
    opacity: 0.6;
  }
`;

const PillarResultButton = styled(motion.button)`
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 8px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  transition: all 0.3s ease;
  background: ${props => props.isCompleted ? 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' : '#f3f4f6'};
  color: ${props => props.isCompleted ? '#f97316' : '#9ca3af'};
  border: 2px solid ${props => props.isCompleted ? '#f97316' : '#e5e7eb'};

  &:hover {
    ${props => props.isCompleted && `
      background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
      transform: translateX(2px);
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
    `}
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const NavigationPanel = ({ framework, currentAssessment, onAssessmentUpdate }) => {
  const navigate = useNavigate();
  const { categoryId, assessmentId: routeAssessmentId } = useParams();
  // Use currentAssessment.assessmentId if routeAssessmentId is not available
  const assessmentId = routeAssessmentId || currentAssessment?.assessmentId;
  const [expandedPillars, setExpandedPillars] = useState(new Set());
  const [pillarProgress, setPillarProgress] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);

  // Initialize expanded state and progress
  useEffect(() => {
    if (framework && categoryId) {
      setExpandedPillars(new Set([categoryId]));
    }
    
    if (currentAssessment) {
      // Calculate progress for each pillar
      const progress = {};
      framework?.assessmentAreas?.forEach(pillar => {
        const totalDimensions = pillar.dimensions?.length || 0;
        const completedDimensions = 0; // TODO: Calculate based on responses
        progress[pillar.id] = {
          completed: currentAssessment.completedCategories?.includes(pillar.id) || false,
          progress: totalDimensions > 0 ? `${completedDimensions}/${totalDimensions}` : '0/0'
        };
      });
      setPillarProgress(progress);
    }
  }, [framework, categoryId, currentAssessment]);

  const togglePillar = (pillarId) => {
    const newExpanded = new Set(expandedPillars);
    if (newExpanded.has(pillarId)) {
      newExpanded.delete(pillarId);
    } else {
      newExpanded.add(pillarId);
    }
    setExpandedPillars(newExpanded);
  };

  const navigateToPillar = (pillarId) => {
    if (!assessmentId) {
      console.error('No assessment ID available');
      return;
    }
    // Navigate to first dimension of the pillar
    const pillar = framework?.assessmentAreas?.find(p => p.id === pillarId);
    if (pillar && pillar.dimensions && pillar.dimensions.length > 0) {
      navigate(`/assessment/${assessmentId}/${pillarId}`);
    }
  };

  const navigateToDimension = (pillarId, dimensionIndex) => {
    if (!assessmentId) {
      console.error('No assessment ID available');
      return;
    }
    navigate(`/assessment/${assessmentId}/${pillarId}?dimension=${dimensionIndex}`);
  };

  const navigateToOverallResults = () => {
    if (!assessmentId) {
      console.error('No assessment ID available');
      return;
    }
    navigate(`/results/${assessmentId}`);
  };

  const handleSubmitAssessment = async () => {
    if (!assessmentId) {
      toast.error('No assessment ID available');
      return;
    }

    if (!hasAnyCompletedPillars) {
      toast.error('Please complete at least one pillar before submitting');
      return;
    }

    try {
      toast.loading('Submitting assessment...', { id: 'submit-assessment' });
      
      // Call API to mark assessment as submitted
      await assessmentService.submitAssessment(assessmentId);
      
      toast.success('Assessment submitted successfully! You can now view results.', { 
        id: 'submit-assessment',
        duration: 4000
      });
      
      // Refresh assessment status to update the UI
      if (onAssessmentUpdate) {
        const updatedAssessment = await assessmentService.getAssessmentStatus(assessmentId);
        onAssessmentUpdate(updatedAssessment);
      } else {
        // Force page reload to update currentAssessment
        window.location.reload();
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('Failed to submit assessment. Please try again.', { id: 'submit-assessment' });
    }
  };

  if (!framework) {
    return null;
  }

  const hasAnyCompletedPillars = currentAssessment?.completedCategories?.length > 0;
  const isSubmitted = currentAssessment?.status === 'submitted';

  return (
    <NavigationContainer>
      <NavigationHeader>
        <NavigationTitleRow>
          <NavigationTitle title={currentAssessment?.assessmentName}>
            {currentAssessment?.assessmentName || 'Assessment Navigation'}
          </NavigationTitle>
          {currentAssessment && (
            <EditButton onClick={() => setShowEditModal(true)} title="Edit assessment information">
              <FiEdit3 size={12} />
              Edit
            </EditButton>
          )}
        </NavigationTitleRow>
        <NavigationSubtitle>
          {currentAssessment?.organizationName && `${currentAssessment.organizationName} • `}
          {currentAssessment?.completedCategories?.length || 0} of {framework.assessmentAreas?.length || 0} pillars completed
        </NavigationSubtitle>
      </NavigationHeader>

      {showEditModal && currentAssessment && (
        <EditAssessmentModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          assessment={currentAssessment}
          onUpdate={(updatedData) => {
            if (onAssessmentUpdate) {
              onAssessmentUpdate(updatedData);
            }
            // Refresh the page to show updated data
            window.location.reload();
          }}
        />
      )}

      <PillarList>
        {framework.assessmentAreas?.map((pillar) => {
          const isExpanded = expandedPillars.has(pillar.id);
          const isActive = categoryId === pillar.id;
          const isCompleted = pillarProgress[pillar.id]?.completed || false;
          
          // 🆕 Calculate pillar progress percentage
          const totalDimensions = pillar.dimensions?.length || 0;
          const answeredDimensions = pillar.dimensions?.filter(dim => {
            // Check if any question in this dimension has been answered
            return dim.questions?.some(q => {
              const responses = currentAssessment?.responses || {};
              return responses[`${q.id}_current_state`] || responses[`${q.id}_future_state`];
            });
          }).length || 0;
          const progressPercent = totalDimensions > 0 ? Math.round((answeredDimensions / totalDimensions) * 100) : 0;
          
          // 🆕 Pillar icons
          const pillarIcons = {
            'platform_governance': '🧱',
            'data_engineering': '💾',
            'analytics_bi': '📊',
            'machine_learning': '🤖',
            'generative_ai': '✨',
            'operational_excellence': '⚡'
          };
          const pillarIcon = pillarIcons[pillar.id] || '📋';
          
          return (
            <PillarItem key={pillar.id}>
              <PillarHeader
                isActive={isActive}
                isCompleted={isCompleted}
                onClick={() => togglePillar(pillar.id)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <PillarIcon>
                  {isCompleted ? (
                    <FiCheckCircle size={20} color="#10b981" />
                  ) : (
                    <FiCircle size={20} color="#6b7280" />
                  )}
                </PillarIcon>
                
                <PillarInfo>
                  <PillarName>
                    <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>{pillarIcon}</span>
                    {pillar.name}
                  </PillarName>
                  <PillarProgress>
                    {/* 🆕 Progress circles */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        display: 'flex', 
                        gap: '4px',
                        fontSize: '0.7rem'
                      }}>
                        {Array.from({ length: totalDimensions }, (_, idx) => (
                          <span 
                            key={idx}
                            style={{ 
                              width: '8px', 
                              height: '8px', 
                              borderRadius: '50%',
                              background: idx < answeredDimensions ? '#10b981' : '#e5e7eb',
                              display: 'inline-block'
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>
                        {answeredDimensions}/{totalDimensions} {progressPercent}%
                      </span>
                    </div>
                  </PillarProgress>
                </PillarInfo>
                
                <ExpandIcon
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiChevronRight size={16} />
                </ExpandIcon>
              </PillarHeader>

              <AnimatePresence>
                {isExpanded && (
                  <DimensionList
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Start Pillar Button */}
                    <DimensionItem
                      onClick={() => navigateToPillar(pillar.id)}
                      whileHover={{ x: 2 }}
                      style={{ 
                        background: '#e0f2fe', 
                        borderLeftColor: '#0284c7',
                        fontWeight: 600 
                      }}
                    >
                      <DimensionIcon>
                        <FiPlay size={14} color="#0284c7" />
                      </DimensionIcon>
                      <DimensionName style={{ color: '#0284c7' }}>
                        Start {pillar.name.split(' ')[0]} Assessment
                      </DimensionName>
                    </DimensionItem>

                    {/* Individual Dimensions */}
                    {pillar.dimensions?.map((dimension, index) => (
                      <DimensionItem
                        key={dimension.id}
                        onClick={() => navigateToDimension(pillar.id, index)}
                        whileHover={{ x: 2 }}
                      >
                        <DimensionIcon>
                          <FiTarget size={14} color="#6b7280" />
                        </DimensionIcon>
                        <DimensionName>{dimension.name}</DimensionName>
                      </DimensionItem>
                    ))}

                  </DimensionList>
                )}
              </AnimatePresence>
            </PillarItem>
          );
        })}
      </PillarList>

      <ActionButtonsContainer>
        {/* Submit Assessment Button */}
        {hasAnyCompletedPillars && !isSubmitted && (
          <ResultsSection style={{ marginBottom: '16px' }}>
            <ResultsSectionTitle>
              <FiSend size={14} />
              Ready to Submit?
            </ResultsSectionTitle>
            <ActionButton
              variant="accent"
              onClick={handleSubmitAssessment}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiSend size={18} />
              <span style={{ flex: 1, textAlign: 'left' }}>Submit Assessment</span>
            </ActionButton>
            <div style={{ 
              fontSize: '12px', 
              color: '#6b7280', 
              marginTop: '8px',
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              Submit to generate your results report
            </div>
          </ResultsSection>
        )}

        {/* View Report Button - Only enabled after submission */}
        <ActionButton
          variant="primary"
          onClick={navigateToOverallResults}
          disabled={!isSubmitted}
          whileHover={{ scale: isSubmitted ? 1.05 : 1 }}
          whileTap={{ scale: isSubmitted ? 0.95 : 1 }}
        >
          <FiBarChart2 size={18} />
          <span style={{ flex: 1, textAlign: 'left' }}>View Report</span>
        </ActionButton>
      </ActionButtonsContainer>
    </NavigationContainer>
  );
};

export default NavigationPanel;
