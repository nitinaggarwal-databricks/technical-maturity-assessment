import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiClock, FiMessageSquare, FiRefreshCw } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import authorValidationService from '../services/authorValidationService';
import authService from '../services/authService';
import LoadingSpinner from './LoadingSpinner';

const Container = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const RefreshButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: ${props => props.$gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  padding: 24px;
  border-radius: 12px;
  color: white;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 4px;
`;

const StatSubtext = styled.div`
  font-size: 0.875rem;
  opacity: 0.8;
`;

const ProgressSection = styled.div`
  margin-bottom: 24px;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.95rem;
  color: #475569;
`;

const ProgressBar = styled.div`
  background: #e2e8f0;
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  background: ${props => props.$gradient || 'linear-gradient(90deg, #10b981 0%, #059669 100%)'};
  height: 100%;
  width: ${props => props.$percentage}%;
  transition: width 0.3s ease;
`;

const StatusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatusItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid ${props => props.$color || '#cbd5e1'};
`;

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusIcon = styled.div`
  font-size: 1.25rem;
  color: ${props => props.$color || '#64748b'};
`;

const StatusText = styled.div`
  font-weight: 600;
  color: #1e293b;
`;

const StatusCount = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.$color || '#475569'};
`;

const ActionButton = styled(motion.button)`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 24px;
  
  &:hover {
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }
  
  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const ValidationDashboard = () => {
  const { assessmentId } = useParams();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const sessionId = authService.getSessionId();

  useEffect(() => {
    loadValidationStatus();
  }, [assessmentId]);

  const loadValidationStatus = async () => {
    setLoading(true);
    try {
      const data = await authorValidationService.getValidationStatus(assessmentId, sessionId);
      setStatus(data);
    } catch (error) {
      toast.error('Failed to load validation status');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResponses = () => {
    navigate(`/author/review-responses/${assessmentId}`);
  };

  if (loading) {
    return <LoadingSpinner message="Loading validation status..." />;
  }

  if (!status) {
    return <Container>No validation data available</Container>;
  }

  const completionPercentage = parseFloat(status.completionPercentage) || 0;
  const validationPercentage = parseFloat(status.validationPercentage) || 0;

  return (
    <Container>
      <Header>
        <Title>Validation Dashboard</Title>
        <RefreshButton
          onClick={loadValidationStatus}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiRefreshCw />
          Refresh
        </RefreshButton>
      </Header>

      <StatsGrid>
        <StatCard $gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)">
          <StatLabel>Total Questions</StatLabel>
          <StatValue>{status.total_assignments}</StatValue>
        </StatCard>

        <StatCard $gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)">
          <StatLabel>Approved</StatLabel>
          <StatValue>{status.total_approved}</StatValue>
          <StatSubtext>{validationPercentage.toFixed(0)}% validated</StatSubtext>
        </StatCard>

        <StatCard $gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)">
          <StatLabel>Completed</StatLabel>
          <StatValue>{status.total_completed}</StatValue>
          <StatSubtext>{completionPercentage.toFixed(0)}% complete</StatSubtext>
        </StatCard>
      </StatsGrid>

      <ProgressSection>
        <ProgressLabel>
          <span>Completion Progress</span>
          <span>{completionPercentage.toFixed(1)}%</span>
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
          <span>{validationPercentage.toFixed(1)}%</span>
        </ProgressLabel>
        <ProgressBar>
          <ProgressFill $percentage={validationPercentage} />
        </ProgressBar>
      </ProgressSection>

      <StatusList>
        <StatusItem $color="#cbd5e1">
          <StatusInfo>
            <StatusIcon $color="#64748b"><FiClock /></StatusIcon>
            <StatusText>Not Validated</StatusText>
          </StatusInfo>
          <StatusCount $color="#64748b">{status.not_validated}</StatusCount>
        </StatusItem>

        <StatusItem $color="#f59e0b">
          <StatusInfo>
            <StatusIcon $color="#d97706"><FiAlertCircle /></StatusIcon>
            <StatusText>Needs Review</StatusText>
          </StatusInfo>
          <StatusCount $color="#d97706">{status.needs_review}</StatusCount>
        </StatusItem>

        <StatusItem $color="#ef4444">
          <StatusInfo>
            <StatusIcon $color="#dc2626"><FiMessageSquare /></StatusIcon>
            <StatusText>Clarification Requested</StatusText>
          </StatusInfo>
          <StatusCount $color="#dc2626">{status.clarification_requested}</StatusCount>
        </StatusItem>

        <StatusItem $color="#10b981">
          <StatusInfo>
            <StatusIcon $color="#059669"><FiCheckCircle /></StatusIcon>
            <StatusText>Approved</StatusText>
          </StatusInfo>
          <StatusCount $color="#059669">{status.total_approved}</StatusCount>
        </StatusItem>
      </StatusList>

      <ActionButton
        onClick={handleViewResponses}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={status.total_assignments === 0}
      >
        <FiMessageSquare /> Review Responses
      </ActionButton>

      {status.readyForSubmission && (
        <ActionButton
          onClick={() => navigate(`/author/submit/${assessmentId}`)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ marginTop: '12px' }}
        >
          <FiCheckCircle /> Ready to Submit
        </ActionButton>
      )}
    </Container>
  );
};

export default ValidationDashboard;

