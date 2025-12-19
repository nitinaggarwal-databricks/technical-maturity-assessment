import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiMessageSquare, FiFilter, FiRefreshCw, FiUser } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import authorValidationService from '../services/authorValidationService';
import authService from '../services/authService';
import LoadingSpinner from './LoadingSpinner';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #64748b;
  margin: 0;
`;

const FilterBar = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #475569;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
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

const ResponsesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ResponseCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${props => {
    if (props.$status === 'approved') return '#10b981';
    if (props.$status === 'needs_review') return '#f59e0b';
    if (props.$status === 'clarification_requested') return '#ef4444';
    return '#cbd5e1';
  }};
`;

const ResponseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
`;

const QuestionText = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
  min-width: 200px;
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
    if (props.$status === 'approved') return '#d1fae5';
    if (props.$status === 'needs_review') return '#fed7aa';
    if (props.$status === 'clarification_requested') return '#fee2e2';
    return '#f1f5f9';
  }};
  color: ${props => {
    if (props.$status === 'approved') return '#065f46';
    if (props.$status === 'needs_review') return '#92400e';
    if (props.$status === 'clarification_requested') return '#991b1b';
    return '#475569';
  }};
`;

const ConsumerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 16px;
`;

const ResponseText = styled.div`
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  color: #334155;
  line-height: 1.6;
`;

const CommentsSection = styled.div`
  margin-bottom: 16px;
`;

const CommentInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ExistingComments = styled.div`
  background: #fef3c7;
  padding: 12px;
  border-radius: 8px;
  margin-top: 8px;
  font-size: 0.9rem;
  color: #78350f;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ActionButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  
  ${props => props.$variant === 'approve' && `
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    &:hover {
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
  `}
  
  ${props => props.$variant === 'review' && `
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    &:hover {
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }
  `}
  
  ${props => props.$variant === 'clarify' && `
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    &:hover {
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
  `}
`;

const EmptyState = styled.div`
  background: white;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  color: #64748b;
`;

const ProgressBar = styled.div`
  background: #e2e8f0;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
`;

const ProgressFill = styled.div`
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  height: 100%;
  width: ${props => props.$percentage}%;
  transition: width 0.3s ease;
`;

const ResponseReviewPanel = () => {
  const { assessmentId } = useParams();
  const [responses, setResponses] = useState([]);
  const [filteredResponses, setFilteredResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterConsumer, setFilterConsumer] = useState('all');
  const [comments, setComments] = useState({});
  const [validating, setValidating] = useState({});

  const sessionId = authService.getSessionId();
  const consumers = [...new Set(responses.map(r => r.consumer_email).filter(Boolean))];

  useEffect(() => {
    loadResponses();
  }, [assessmentId]);

  useEffect(() => {
    filterResponses();
  }, [responses, filterStatus, filterConsumer]);

  const loadResponses = async () => {
    setLoading(true);
    try {
      const data = await authorValidationService.getConsumerResponses(assessmentId, sessionId);
      setResponses(data.responses || []);
    } catch (error) {
      toast.error('Failed to load responses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterResponses = () => {
    let filtered = [...responses];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.validation_status === filterStatus);
    }

    if (filterConsumer !== 'all') {
      filtered = filtered.filter(r => r.consumer_email === filterConsumer);
    }

    setFilteredResponses(filtered);
  };

  const handleValidate = async (assignmentId, status) => {
    setValidating(prev => ({ ...prev, [assignmentId]: true }));
    
    try {
      await authorValidationService.validateResponse(
        assignmentId,
        status,
        comments[assignmentId] || null,
        sessionId
      );
      
      toast.success(`Response ${status === 'approved' ? 'approved' : 'flagged for review'}!`);
      setComments(prev => ({ ...prev, [assignmentId]: '' }));
      await loadResponses();
    } catch (error) {
      toast.error('Failed to validate response');
      console.error(error);
    } finally {
      setValidating(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'approved') return <FiCheckCircle />;
    if (status === 'needs_review' || status === 'clarification_requested') return <FiAlertCircle />;
    return null;
  };

  const validatedCount = responses.filter(r => r.validation_status === 'approved').length;
  const totalCount = responses.length;
  const validationPercentage = totalCount > 0 ? (validatedCount / totalCount * 100) : 0;

  if (loading) {
    return (
      <Container>
        <LoadingSpinner message="Loading consumer responses..." />
      </Container>
    );
  }

  return (
    <Container>
      <ContentWrapper>
        <Header>
          <Title>
            <FiMessageSquare />
            Review Consumer Responses
          </Title>
          <Subtitle>
            Review and validate responses from consumers • {validatedCount}/{totalCount} approved ({validationPercentage.toFixed(0)}%)
          </Subtitle>
          <ProgressBar>
            <ProgressFill $percentage={validationPercentage} />
          </ProgressBar>
        </Header>

        <FilterBar>
          <FiFilter />
          <FilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="not_validated">Not Validated</option>
            <option value="approved">Approved</option>
            <option value="needs_review">Needs Review</option>
            <option value="clarification_requested">Clarification Requested</option>
          </FilterSelect>

          <FilterSelect value={filterConsumer} onChange={(e) => setFilterConsumer(e.target.value)}>
            <option value="all">All Consumers</option>
            {consumers.map(email => (
              <option key={email} value={email}>{email}</option>
            ))}
          </FilterSelect>

          <RefreshButton
            onClick={loadResponses}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiRefreshCw />
            Refresh
          </RefreshButton>
        </FilterBar>

        {filteredResponses.length === 0 ? (
          <EmptyState>
            <h3>No responses found</h3>
            <p>Try adjusting your filters or check back later.</p>
          </EmptyState>
        ) : (
          <ResponsesList>
            <AnimatePresence>
              {filteredResponses.map((response) => (
                <ResponseCard
                  key={response.assignment_id}
                  $status={response.validation_status}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ResponseHeader>
                    <QuestionText>{response.question_id}</QuestionText>
                    <StatusBadge $status={response.validation_status}>
                      {getStatusIcon(response.validation_status)}
                      {response.validation_status.replace('_', ' ')}
                    </StatusBadge>
                  </ResponseHeader>

                  <ConsumerInfo>
                    <FiUser />
                    {response.consumer_email || 'Unknown Consumer'}
                    {response.completed_at && ` • Completed: ${new Date(response.completed_at).toLocaleDateString()}`}
                  </ConsumerInfo>

                  <ResponseText>
                    {response.response_text || response.response_value || 'No response provided'}
                  </ResponseText>

                  {response.validation_comments && (
                    <ExistingComments>
                      <strong>Previous comments:</strong> {response.validation_comments}
                    </ExistingComments>
                  )}

                  <CommentsSection>
                    <CommentInput
                      placeholder="Add validation comments or request clarification..."
                      value={comments[response.assignment_id] || ''}
                      onChange={(e) => setComments(prev => ({
                        ...prev,
                        [response.assignment_id]: e.target.value
                      }))}
                    />
                  </CommentsSection>

                  <ActionButtons>
                    <ActionButton
                      $variant="approve"
                      onClick={() => handleValidate(response.assignment_id, 'approved')}
                      disabled={validating[response.assignment_id]}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiCheckCircle />
                      {validating[response.assignment_id] ? 'Approving...' : 'Approve'}
                    </ActionButton>

                    <ActionButton
                      $variant="review"
                      onClick={() => handleValidate(response.assignment_id, 'needs_review')}
                      disabled={validating[response.assignment_id]}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiAlertCircle />
                      Needs Review
                    </ActionButton>

                    <ActionButton
                      $variant="clarify"
                      onClick={() => handleValidate(response.assignment_id, 'clarification_requested')}
                      disabled={validating[response.assignment_id]}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiMessageSquare />
                      Request Clarification
                    </ActionButton>
                  </ActionButtons>
                </ResponseCard>
              ))}
            </AnimatePresence>
          </ResponsesList>
        )}
      </ContentWrapper>
    </Container>
  );
};

export default ResponseReviewPanel;

