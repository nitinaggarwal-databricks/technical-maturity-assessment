import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiLock, FiSend, FiArrowLeft } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import authorValidationService from '../services/authorValidationService';
import authService from '../services/authService';
import LoadingSpinner from './LoadingSpinner';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 120px 20px 40px 20px;

  @media (max-width: 768px) {
    padding: 100px 20px 40px 20px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #64748b;
  margin: 0;
`;

const ChecklistSection = styled.div`
  margin-bottom: 32px;
`;

const ChecklistTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
`;

const ChecklistItem = styled.div`
  display: flex;
  align-items: start;
  gap: 12px;
  padding: 16px;
  background: ${props => props.$passed ? '#d1fae5' : '#fee2e2'};
  border-radius: 8px;
  margin-bottom: 12px;
  border-left: 4px solid ${props => props.$passed ? '#10b981' : '#ef4444'};
`;

const ChecklistIcon = styled.div`
  font-size: 1.5rem;
  color: ${props => props.$passed ? '#059669' : '#dc2626'};
  flex-shrink: 0;
`;

const ChecklistText = styled.div`
  flex: 1;
`;

const ChecklistLabel = styled.div`
  font-weight: 600;
  color: ${props => props.$passed ? '#065f46' : '#991b1b'};
  margin-bottom: 4px;
`;

const ChecklistDetail = styled.div`
  font-size: 0.9rem;
  color: ${props => props.$passed ? '#047857' : '#b91c1c'};
`;

const NotesSection = styled.div`
  margin-bottom: 32px;
`;

const NotesLabel = styled.label`
  display: block;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const NotesTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const WarningBox = styled.div`
  background: #fef3c7;
  border: 2px solid #fbbf24;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 32px;
  display: flex;
  gap: 12px;
  align-items: start;
`;

const WarningIcon = styled.div`
  font-size: 1.5rem;
  color: #d97706;
  flex-shrink: 0;
`;

const WarningText = styled.div`
  color: #78350f;
  line-height: 1.6;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  
  ${props => props.$variant === 'submit' && `
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    &:hover:not(:disabled) {
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }
    &:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
    }
  `}
  
  ${props => props.$variant === 'back' && `
    background: #f1f5f9;
    color: #475569;
    &:hover {
      background: #e2e8f0;
    }
  `}
`;

const SubmissionWorkflow = () => {
  const { assessmentId } = useParams();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState('');
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
      toast.error('Failed to load assessment status');
      console.error(error);
      navigate('/author/assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!status.readyForSubmission) {
      toast.error('Assessment is not ready for submission');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to submit this assessment? This action will lock the assessment and prevent further edits.'
    );

    if (!confirmed) return;

    setSubmitting(true);
    try {
      await authorValidationService.submitAssessment(assessmentId, submissionNotes, sessionId);
      toast.success('Assessment submitted successfully!');
      navigate('/author/assignments');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit assessment');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner message="Loading submission checklist..." />
      </Container>
    );
  }

  if (!status) {
    return null;
  }

  const checks = [
    {
      label: 'All questions answered',
      detail: `${status.total_completed}/${status.total_assignments} questions completed`,
      passed: parseInt(status.total_completed) === parseInt(status.total_assignments)
    },
    {
      label: 'All responses validated',
      detail: `${status.total_approved}/${status.total_assignments} responses approved`,
      passed: parseInt(status.total_approved) === parseInt(status.total_assignments)
    },
    {
      label: 'No pending reviews',
      detail: `${status.needs_review} responses need review`,
      passed: parseInt(status.needs_review) === 0
    },
    {
      label: 'No clarifications pending',
      detail: `${status.clarification_requested} clarifications requested`,
      passed: parseInt(status.clarification_requested) === 0
    }
  ];

  const allChecksPassed = checks.every(check => check.passed);

  return (
    <Container>
      <ContentWrapper>
        <Card>
          <Header>
            <Title>Submit Assessment</Title>
            <Subtitle>Review the checklist before final submission</Subtitle>
          </Header>

          <ChecklistSection>
            <ChecklistTitle>Pre-Submission Checklist</ChecklistTitle>
            {checks.map((check, index) => (
              <ChecklistItem key={index} $passed={check.passed}>
                <ChecklistIcon $passed={check.passed}>
                  {check.passed ? <FiCheckCircle /> : <FiAlertCircle />}
                </ChecklistIcon>
                <ChecklistText>
                  <ChecklistLabel $passed={check.passed}>{check.label}</ChecklistLabel>
                  <ChecklistDetail $passed={check.passed}>{check.detail}</ChecklistDetail>
                </ChecklistText>
              </ChecklistItem>
            ))}
          </ChecklistSection>

          {allChecksPassed && (
            <>
              <NotesSection>
                <NotesLabel htmlFor="submission-notes">
                  Submission Notes (Optional)
                </NotesLabel>
                <NotesTextarea
                  id="submission-notes"
                  placeholder="Add any final notes or comments about this assessment..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                />
              </NotesSection>

              <WarningBox>
                <WarningIcon><FiLock /></WarningIcon>
                <WarningText>
                  <strong>Important:</strong> Submitting this assessment will lock it permanently. 
                  No further edits will be possible. Please ensure all responses have been reviewed 
                  and validated before proceeding.
                </WarningText>
              </WarningBox>
            </>
          )}

          <ActionButtons>
            <Button
              $variant="back"
              onClick={() => navigate('/author/assignments')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiArrowLeft />
              Back to Assignments
            </Button>

            <Button
              $variant="submit"
              onClick={handleSubmit}
              disabled={!allChecksPassed || submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiSend />
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </Button>
          </ActionButtons>

          {!allChecksPassed && (
            <WarningBox style={{ marginTop: '24px' }}>
              <WarningIcon><FiAlertCircle /></WarningIcon>
              <WarningText>
                This assessment cannot be submitted yet. Please complete all checklist items above.
              </WarningText>
            </WarningBox>
          )}
        </Card>
      </ContentWrapper>
    </Container>
  );
};

export default SubmissionWorkflow;

