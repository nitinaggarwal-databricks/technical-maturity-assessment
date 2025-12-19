import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiClock, FiAlertCircle, FiEye, FiSend, FiRefreshCw } from 'react-icons/fi';
import authorValidationService from '../services/authorValidationService';
import authService from '../services/authService';
import LoadingSpinner from './LoadingSpinner';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 120px 20px 40px 20px;

  @media (max-width: 768px) {
    padding: 100px 20px 40px 20px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #64748b;
  margin: 0;
`;

const RefreshButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
`;

const AssignmentsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
`;

const AssignmentCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-top: 4px solid #667eea;
`;

const AssessmentName = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
`;

const AssessmentInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  color: #64748b;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InfoLabel = styled.span`
  font-weight: 600;
`;

const InfoValue = styled.span`
  color: #475569;
`;

const ProgressSection = styled.div`
  margin-bottom: 16px;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: #475569;
`;

const ProgressBar = styled.div`
  background: #e2e8f0;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  background: ${props => props.$gradient || 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'};
  height: 100%;
  width: ${props => props.$percentage}%;
  transition: width 0.3s ease;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => {
    if (props.$percentage === 100) return '#d1fae5';
    if (props.$percentage >= 50) return '#fef3c7';
    return '#fee2e2';
  }};
  color: ${props => {
    if (props.$percentage === 100) return '#065f46';
    if (props.$percentage >= 50) return '#78350f';
    return '#991b1b';
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ActionButton = styled(motion.button)`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 0.9rem;
  
  ${props => props.$variant === 'primary' && `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    &:hover {
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
  `}
  
  ${props => props.$variant === 'success' && `
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    &:hover {
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
  `}
`;

const EmptyState = styled.div`
  background: white;
  border-radius: 16px;
  padding: 60px 20px;
  text-align: center;
  color: #64748b;
`;

const AuthorAssignmentsList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const sessionId = authService.getSessionId();

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const data = await authorValidationService.getMyAuthorAssignments(sessionId);
      setAssignments(data.assignments || []);
    } catch (error) {
      toast.error('Failed to load your assignments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateValidationPercentage = (assignment) => {
    const total = parseInt(assignment.total_questions) || 0;
    const approved = parseInt(assignment.approved_questions) || 0;
    return total > 0 ? (approved / total * 100) : 0;
  };

  const calculateCompletionPercentage = (assignment) => {
    const total = parseInt(assignment.total_questions) || 0;
    const completed = parseInt(assignment.completed_questions) || 0;
    return total > 0 ? (completed / total * 100) : 0;
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner message="Loading your author assignments..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Title>My Author Assignments</Title>
          <Subtitle>
            Assessments assigned to you for coordination and validation • {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
          </Subtitle>
          <RefreshButton
            onClick={loadAssignments}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiRefreshCw />
            Refresh
          </RefreshButton>
        </Header>

        {assignments.length === 0 ? (
          <EmptyState>
            <FiClock size={48} style={{ marginBottom: '16px', color: '#94a3b8' }} />
            <h3>No Assignments Yet</h3>
            <p>You don't have any assessments assigned to you yet.</p>
            <p>Check back later or contact your administrator.</p>
          </EmptyState>
        ) : (
          <AssignmentsList>
            {assignments.map((assignment) => {
              const validationPercentage = calculateValidationPercentage(assignment);
              const completionPercentage = calculateCompletionPercentage(assignment);
              const isReadyToSubmit = validationPercentage === 100 && completionPercentage === 100;

              return (
                <AssignmentCard
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AssessmentName>{assignment.assessmentname}</AssessmentName>
                  
                  <AssessmentInfo>
                    <InfoRow>
                      <InfoLabel>Organization:</InfoLabel>
                      <InfoValue>{assignment.organizationname || 'N/A'}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Industry:</InfoLabel>
                      <InfoValue>{assignment.industry || 'N/A'}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Assigned:</InfoLabel>
                      <InfoValue>
                        {assignment.author_assigned_at 
                          ? new Date(assignment.author_assigned_at).toLocaleDateString()
                          : 'N/A'}
                      </InfoValue>
                    </InfoRow>
                  </AssessmentInfo>

                  <ProgressSection>
                    <ProgressLabel>
                      <span>Completion Progress</span>
                      <span>{completionPercentage.toFixed(0)}%</span>
                    </ProgressLabel>
                    <ProgressBar>
                      <ProgressFill 
                        $percentage={completionPercentage}
                        $gradient="linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)"
                      />
                    </ProgressBar>
                  </ProgressSection>

                  <ProgressSection>
                    <ProgressLabel>
                      <span>Validation Progress</span>
                      <span>{validationPercentage.toFixed(0)}%</span>
                    </ProgressLabel>
                    <ProgressBar>
                      <ProgressFill 
                        $percentage={validationPercentage}
                        $gradient="linear-gradient(90deg, #10b981 0%, #059669 100%)"
                      />
                    </ProgressBar>
                  </ProgressSection>

                  <StatusBadge $percentage={validationPercentage}>
                    {isReadyToSubmit ? <FiCheckCircle /> : <FiClock />}
                    {isReadyToSubmit ? 'Ready to Submit' : 'In Progress'}
                  </StatusBadge>

                  <ActionButtons style={{ marginTop: '16px' }}>
                    <ActionButton
                      $variant="primary"
                      onClick={() => navigate(`/author/review-responses/${assignment.id}`)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiEye />
                      Review
                    </ActionButton>

                    {isReadyToSubmit && (
                      <ActionButton
                        $variant="success"
                        onClick={() => navigate(`/author/submit/${assignment.id}`)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FiSend />
                        Submit
                      </ActionButton>
                    )}
                  </ActionButtons>
                </AssignmentCard>
              );
            })}
          </AssignmentsList>
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

export default AuthorAssignmentsList;

