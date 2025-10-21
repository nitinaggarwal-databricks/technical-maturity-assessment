import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiSave, FiWifi, FiWifiOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as assessmentService from '../services/assessmentService';
import UserEmailPrompt from './UserEmailPrompt';
import NavigationPanel from './NavigationPanel';

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const AssessmentContainer = styled.div`
  height: calc(100vh - 80px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  overflow: hidden;
`;

const ContentWrapper = styled.div`
  flex: 1;
  margin-left: 350px;
  height: 100%;
  max-width: calc(100vw - 370px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
`;

const ProgressSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const AutoSaveStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: ${props => {
    switch (props.status) {
      case 'saving': return '#ff8800';
      case 'saved': return '#00cc44';
      case 'error': return '#ff4444';
      default: return '#666';
    }
  }};
`;

const AreaTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DimensionSubtitle = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  color: #666;
  margin-top: 4px;
`;

const ProgressText = styled.span`
  font-size: 1rem;
  color: #666;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #ff6b35, #f7931e);
  width: ${props => props.progress}%;
  transition: width 0.5s ease;
`;

const QuestionCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const QuestionHeader = styled.div`
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
`;

const QuestionContent = styled.div`
  flex: 1;
  text-align: center;
`;

const QuestionTopic = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: #ff6b35;
  margin-bottom: 6px;
`;

const QuestionText = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
`;

const SkipToggleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
  padding: 8px 12px;
  background: ${props => props.isSkipped ? '#fef3c7' : '#f8f9fa'};
  border-radius: 8px;
  border: 2px solid ${props => props.isSkipped ? '#fbbf24' : '#e5e7eb'};
  transition: all 0.3s ease;
`;

const SkipToggle = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  color: ${props => props.isSkipped ? '#f59e0b' : '#6b7280'};
  transition: color 0.3s ease;
  white-space: nowrap;

  input {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
`;

const SkipMessage = styled.div`
  font-style: italic;
  color: #f59e0b;
  font-size: 0.75rem;
  text-align: right;
  max-width: 180px;
  line-height: 1.3;
`;

const PerspectivesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 0;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const PerspectiveColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const PerspectiveHeader = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
`;

const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const OptionButton = styled.button`
  padding: 10px 12px;
  border: 2px solid ${props => props.selected ? '#ff6b35' : '#e0e0e0'};
  border-radius: 8px;
  background: ${props => props.selected ? '#fff5f2' : 'white'};
  color: ${props => props.selected ? '#ff6b35' : '#333'};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  height: 60px;
  display: flex;
  align-items: center;
  width: 100%;
  
  &:hover {
    border-color: #ff6b35;
    background: #fff5f2;
  }
`;

const MultiSelectOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 2px solid ${props => props.selected ? '#ff6b35' : '#e0e0e0'};
  border-radius: 8px;
  background: ${props => props.selected ? '#fff5f2' : 'white'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  height: 60px;
  width: 100%;
  
  &:hover {
    border-color: #ff6b35;
    background: #fff5f2;
  }
  
  input[type="checkbox"] {
    margin: 0;
    flex-shrink: 0;
  }
`;

const CommentSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const CommentHeader = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
`;

const CommentInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  height: 316px;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.85rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #ff6b35;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const NavigationSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 16px 20px;
  border-top: 2px solid #e5e7eb;
  flex-shrink: 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
`;

const NavButton = styled(motion.button)`
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BackButton = styled(NavButton)`
  background: #f8f9fa;
  color: #666;
  
  &:hover:not(:disabled) {
    background: #e9ecef;
  }
`;

const NextButton = styled(NavButton)`
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e0e0e0;
    border-top: 4px solid #ff6b35;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const FilterSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterLabel = styled.span`
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: 2px solid ${props => props.active ? '#ff6b35' : '#e5e7eb'};
  background: ${props => props.active ? '#ff6b35' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  font-weight: ${props => props.active ? '600' : '500'};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    border-color: #ff6b35;
    ${props => !props.active && 'background: #fff5f2;'}
  }
`;

const FilterBadge = styled.span`
  background: ${props => props.active ? 'rgba(255,255,255,0.3)' : '#f3f4f6'};
  color: ${props => props.active ? 'white' : '#666'};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const AssessmentQuestion = ({ framework, currentAssessment, onUpdateStatus }) => {
  const { assessmentId, categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [currentArea, setCurrentArea] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [skippedQuestions, setSkippedQuestions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [editorEmail, setEditorEmail] = useState(null);
  const [questionFilter, setQuestionFilter] = useState('all'); // 'all', 'completed', 'not_started', 'without_notes'

  // Get dimension from query parameter
  const targetDimensionIndex = searchParams.get('dimension') ? parseInt(searchParams.get('dimension')) : null;

  // Reset question index when filter changes
  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [questionFilter]);

  // Check for editor email in session storage on mount
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('assessmentEditorEmail');
    if (storedEmail) {
      setEditorEmail(storedEmail);
    } else if (currentAssessment) {
      // Only show email prompt if this is an EXISTING assessment with responses
      // (not a brand new assessment that was just created)
      const hasExistingResponses = currentAssessment.responses && 
                                    Object.keys(currentAssessment.responses).length > 0;
      
      if (hasExistingResponses) {
        // Show email prompt after a short delay to let page load
        setTimeout(() => setShowEmailPrompt(true), 500);
      }
    }
  }, [currentAssessment]);

  // Calculate and update progress
  const updateProgress = useCallback(() => {
    if (framework && currentAssessment && onUpdateStatus) {
      const totalQuestions = framework.assessmentAreas.reduce((total, area) => {
        return total + (area.dimensions?.reduce((dimTotal, dim) => {
          return dimTotal + (dim.questions?.length || 0);
        }, 0) || 0);
      }, 0);
      
      const answeredQuestions = Object.keys(responses).filter(key => 
        !key.includes('_comment') && !key.includes('_skipped') && responses[key]
      ).length;
      
      const progress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
      
      onUpdateStatus({
        ...currentAssessment,
        progress,
        responses
      });
    }
  }, [framework, currentAssessment, responses, onUpdateStatus]);

  // Load existing responses and area data when component mounts or area changes
  useEffect(() => {
    const loadAreaData = async () => {
      if (assessmentId && categoryId) {
        try {
          setLoading(true);
          const areaData = await assessmentService.getCategoryQuestions(assessmentId, categoryId);
          
          // Set the area data from API (includes flattened questions)
          setCurrentArea(areaData.area);
          
          // Load existing responses
          if (areaData.existingResponses) {
            setResponses(areaData.existingResponses);
            
            // Extract skipped questions from responses
            const skipped = {};
            Object.keys(areaData.existingResponses).forEach(key => {
              if (key.includes('_skipped')) {
                const questionId = key.replace('_skipped', '');
                skipped[questionId] = areaData.existingResponses[key];
              }
            });
            setSkippedQuestions(skipped);
            
            setAutoSaveStatus('saved');
          }
          
          // Reset question index for new area or set to specific dimension
          if (targetDimensionIndex !== null && areaData.area.dimensions) {
            // Calculate question index for specific dimension
            let questionIndex = 0;
            console.log('Calculating question index for dimension:', targetDimensionIndex);
            console.log('Available dimensions:', areaData.area.dimensions.length);
            
            for (let i = 0; i < targetDimensionIndex && i < areaData.area.dimensions.length; i++) {
              const questionsInDimension = areaData.area.dimensions[i].questions?.length || 0;
              console.log(`Dimension ${i} has ${questionsInDimension} questions`);
              questionIndex += questionsInDimension;
            }
            
            console.log('Setting question index to:', questionIndex);
            setCurrentQuestionIndex(questionIndex);
          } else {
            console.log('No target dimension, setting index to 0');
            setCurrentQuestionIndex(0);
          }
          setLoading(false);
        } catch (error) {
          console.error('Error loading area data:', error);
          setLoading(false);
        }
      }
    };

    loadAreaData();
  }, [assessmentId, categoryId, targetDimensionIndex]);

  // Log current state for debugging
  useEffect(() => {
    console.log('Current area:', currentArea);
    console.log('Questions available:', currentArea?.questions?.length || 0);
    console.log('Current question index:', currentQuestionIndex);
  }, [currentArea, currentQuestionIndex]);

  // Additional safety check to ensure question index is valid
  useEffect(() => {
    if (currentArea && currentArea.questions) {
      const maxIndex = currentArea.questions.length - 1;
      if (currentQuestionIndex > maxIndex) {
        console.log(`Question index ${currentQuestionIndex} is too high, resetting to 0`);
        setCurrentQuestionIndex(0);
      }
    }
  }, [currentArea, currentQuestionIndex]);

  const totalQuestions = currentArea?.questions?.length || 0;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  // Check if a question is completed (has all required perspective responses)
  const isQuestionCompleted = (question) => {
    if (!question) return false;
    
    // Check if all perspectives have responses
    const allPerspectivesAnswered = question.perspectives.every(perspective => {
      const responseKey = `${question.id}_${perspective.id}`;
      const response = responses[responseKey];
      return response && (Array.isArray(response) ? response.length > 0 : true);
    });
    
    return allPerspectivesAnswered;
  };

  // Check if question has notes/comments
  const hasNotes = (question) => {
    const commentKey = `${question.id}_comment`;
    return responses[commentKey] && responses[commentKey].trim().length > 0;
  };

  // Get filtered questions based on selected filter
  const getFilteredQuestions = () => {
    if (!currentArea?.questions) return [];
    
    return currentArea.questions.filter((question, index) => {
      const isCompleted = isQuestionCompleted(question);
      const hasComment = hasNotes(question);
      
      switch (questionFilter) {
        case 'completed':
          return isCompleted;
        case 'not_started':
          return !isCompleted;
        case 'without_notes':
          return isCompleted && !hasComment;
        case 'all':
        default:
          return true;
      }
    });
  };

  // Calculate filter statistics
  const getFilterStats = () => {
    if (!currentArea?.questions) return { completed: 0, notStarted: 0, withoutNotes: 0, total: 0 };
    
    let completed = 0;
    let notStarted = 0;
    let withoutNotes = 0;
    
    currentArea.questions.forEach(question => {
      const isCompleted = isQuestionCompleted(question);
      const hasComment = hasNotes(question);
      
      if (isCompleted) {
        completed++;
        if (!hasComment) withoutNotes++;
      } else {
        notStarted++;
      }
    });
    
    return {
      completed,
      notStarted,
      withoutNotes,
      total: currentArea.questions.length
    };
  };

  const filteredQuestions = getFilteredQuestions();
  const filterStats = getFilterStats();
  
  // Get the actual current question from filtered list or original list
  const currentQuestion = questionFilter === 'all' 
    ? currentArea?.questions?.[currentQuestionIndex]
    : filteredQuestions[currentQuestionIndex >= filteredQuestions.length ? 0 : currentQuestionIndex];

  // Get current dimension for display
  const getCurrentDimension = () => {
    if (!currentArea?.dimensions || !currentQuestion) return null;
    
    let questionCount = 0;
    for (const dimension of currentArea.dimensions) {
      const dimensionQuestionCount = dimension.questions?.length || 0;
      if (currentQuestionIndex < questionCount + dimensionQuestionCount) {
        return dimension;
      }
      questionCount += dimensionQuestionCount;
    }
    return null;
  };

  const currentDimension = getCurrentDimension();

  // Auto-save function with debouncing
  const autoSave = async (questionId, perspectiveId, value, comment, isSkipped) => {
    if (!assessmentId || !questionId) return;
    
    setAutoSaveStatus('saving');
    
    try {
      const result = await assessmentService.saveProgress(
        assessmentId, 
        questionId, 
        perspectiveId, 
        value, 
        comment,
        isSkipped,
        editorEmail // Track who made the change
      );
      
      if (result.success) {
        setAutoSaveStatus('saved');
        setLastSaved(result.lastSaved);
        // Optional: Show subtle success toast
        // toast.success('Progress saved', { duration: 1000 });
      } else {
        setAutoSaveStatus('error');
        console.error('Auto-save failed:', result.error);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
    }
  };

  // Debounced auto-save for comments
  const debouncedAutoSave = useCallback(
    debounce((questionId, perspectiveId, value, comment, isSkipped) => {
      autoSave(questionId, perspectiveId, value, comment, isSkipped);
    }, 1000),
    [assessmentId, editorEmail]
  );

  const handlePerspectiveResponse = (questionId, perspectiveId, value, isMultiple = false) => {
    const responseKey = `${questionId}_${perspectiveId}`;
    
    // VALIDATION: Future state cannot be less than current state
    if (perspectiveId === 'future_state') {
      const currentStateKey = `${questionId}_current_state`;
      const currentStateValue = responses[currentStateKey];
      
      if (currentStateValue !== undefined && currentStateValue !== null) {
        const currentNum = typeof currentStateValue === 'string' ? parseInt(currentStateValue, 10) : currentStateValue;
        const futureNum = typeof value === 'string' ? parseInt(value, 10) : value;
        
        if (futureNum < currentNum) {
          toast.error('Future state cannot be lower than current state', {
            icon: '⚠️',
            duration: 3000,
            position: 'top-center'
          });
          return; // Don't update if validation fails
        }
      }
    }
    
    // VALIDATION: Current state cannot be greater than future state
    if (perspectiveId === 'current_state') {
      const futureStateKey = `${questionId}_future_state`;
      const futureStateValue = responses[futureStateKey];
      
      if (futureStateValue !== undefined && futureStateValue !== null) {
        const futureNum = typeof futureStateValue === 'string' ? parseInt(futureStateValue, 10) : futureStateValue;
        const currentNum = typeof value === 'string' ? parseInt(value, 10) : value;
        
        if (currentNum > futureNum) {
          toast.error('Current state cannot be higher than future state', {
            icon: '⚠️',
            duration: 3000,
            position: 'top-center'
          });
          return; // Don't update if validation fails
        }
      }
    }
    
    setResponses(prev => {
      const newResponses = { ...prev };
      if (isMultiple) {
        const currentValues = prev[responseKey] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        newResponses[responseKey] = newValues;
      } else {
        newResponses[responseKey] = value;
      }
      
      // Auto-save immediately for selections
      autoSave(questionId, perspectiveId, newResponses[responseKey]);
      
      return newResponses;
    });
  };

  const handleCommentChange = (questionId, comment) => {
    const commentKey = `${questionId}_comment`;
    setResponses(prev => ({ ...prev, [commentKey]: comment }));
    
    // Auto-save comment with debouncing
    debouncedAutoSave(questionId, null, null, comment);
  };

  // Handle skip toggle
  const handleSkipToggle = async (questionId, isSkipped) => {
    setSkippedQuestions(prev => ({
      ...prev,
      [questionId]: isSkipped
    }));

    // Auto-save skip status
    try {
      await assessmentService.saveProgress(assessmentId, questionId, 'skip_status', '', '', isSkipped, editorEmail);
      setAutoSaveStatus('saved');
      setLastSaved(new Date());
    } catch (error) {
      setAutoSaveStatus('error');
    }

    // Automatically move to next question if skipped
    if (isSkipped) {
      setTimeout(() => {
        if (currentQuestionIndex < totalQuestions - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          handleSubmitArea();
        }
      }, 300); // Small delay for better UX
    }
  };

  const validateCurrentQuestion = () => {
    if (!currentQuestion) return false;
    
    // If question is skipped, it's considered valid
    if (skippedQuestions[currentQuestion.id]) return true;
    
    // Check if all perspectives have responses
    for (const perspective of currentQuestion.perspectives) {
      const responseKey = `${currentQuestion.id}_${perspective.id}`;
      const response = responses[responseKey];
      
      if (!response || (Array.isArray(response) && response.length === 0)) {
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) {
      toast.error('Please answer all perspectives for this question');
      return;
    }

    const maxIndex = (questionFilter === 'all' ? totalQuestions : filteredQuestions.length) - 1;
    if (currentQuestionIndex < maxIndex) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      if (questionFilter === 'all') {
        handleSubmitArea();
      } else {
        toast('You have reached the end of filtered questions. Switch to "All" to submit the pillar.', {
          icon: 'ℹ️',
          duration: 4000
        });
      }
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      // Navigate to previous area or start page
      navigate('/start');
    }
  };

  const handleSubmitArea = async () => {
    setIsSubmitting(true);
    
    try {
      // Submit responses for this area
      const result = await assessmentService.submitCategoryResponses(
        assessmentId, 
        categoryId, 
        responses
      );
      
      toast.success('Pillar completed successfully! View your results.');
      
      // NEW FLOW: After completing a pillar, show THAT pillar's results
      // User can then continue to next pillar from the results page
      navigate(`/pillar-results/${assessmentId}/${categoryId}`);
      
      // Update assessment status (non-blocking - don't let this fail the whole operation)
      if (onUpdateStatus) {
        try {
          await onUpdateStatus(assessmentId);
        } catch (statusError) {
          console.warn('Failed to update status, but submission succeeded:', statusError);
          // Don't show error toast since the main operation succeeded
        }
      }
    } catch (error) {
      console.error('Error submitting area responses:', error);
      toast.error('Failed to submit responses. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AssessmentContainer>
        <LoadingSpinner message="Loading assessment area..." />
      </AssessmentContainer>
    );
  }

  if (!framework) {
    return (
      <AssessmentContainer>
        <ContentWrapper>
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <h2>Loading framework...</h2>
            <p>Please wait while we load the assessment framework.</p>
          </div>
        </ContentWrapper>
      </AssessmentContainer>
    );
  }

  if (!currentArea) {
    return (
      <AssessmentContainer>
        <ContentWrapper>
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <h2>Assessment area not found</h2>
            <p>Available areas: {framework?.assessmentAreas?.map(a => a.id).join(', ')}</p>
            <p>Looking for: {categoryId}</p>
            <button onClick={() => navigate('/start')}>Return to Start</button>
          </div>
        </ContentWrapper>
      </AssessmentContainer>
    );
  }

  if (!currentQuestion) {
    return (
      <AssessmentContainer>
        <ContentWrapper>
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <h2>Question not found</h2>
            <p>Area: {currentArea.name}</p>
            <p>Question index: {currentQuestionIndex}</p>
            <p>Total questions: {totalQuestions}</p>
            <button onClick={() => navigate('/start')}>Return to Start</button>
          </div>
        </ContentWrapper>
      </AssessmentContainer>
    );
  }

  return (
    <AssessmentContainer>
      <NavigationPanel 
        framework={framework}
        currentAssessment={currentAssessment}
        onAssessmentUpdate={onUpdateStatus}
      />
      <ContentWrapper>
        <ProgressSection>
          <ProgressInfo>
            <AreaTitle>
              <div>{currentArea.name}</div>
              {currentDimension && (
                <DimensionSubtitle>{currentDimension.name}</DimensionSubtitle>
              )}
            </AreaTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <AutoSaveStatus status={autoSaveStatus}>
                {autoSaveStatus === 'saving' && (
                  <>
                    <FiSave size={16} />
                    <span>Saving...</span>
                  </>
                )}
                {autoSaveStatus === 'saved' && (
                  <>
                    <FiWifi size={16} />
                    <span>Saved</span>
                  </>
                )}
                {autoSaveStatus === 'error' && (
                  <>
                    <FiWifiOff size={16} />
                    <span>Save failed</span>
                  </>
                )}
              </AutoSaveStatus>
              <ProgressText>
                Question {currentQuestionIndex + 1} of {questionFilter === 'all' ? totalQuestions : filteredQuestions.length}
                {questionFilter !== 'all' && <span style={{ color: '#ff6b35', fontWeight: 600 }}> (Filtered)</span>}
              </ProgressText>
            </div>
          </ProgressInfo>
          <ProgressBar>
            <ProgressFill progress={progress} />
          </ProgressBar>
        </ProgressSection>

        <FilterSection>
          <FilterLabel>Filter Questions:</FilterLabel>
          <FilterButton 
            active={questionFilter === 'all'} 
            onClick={() => setQuestionFilter('all')}
          >
            All
            <FilterBadge active={questionFilter === 'all'}>
              {filterStats.total}
            </FilterBadge>
          </FilterButton>
          <FilterButton 
            active={questionFilter === 'completed'} 
            onClick={() => setQuestionFilter('completed')}
          >
            Completed
            <FilterBadge active={questionFilter === 'completed'}>
              {filterStats.completed}
            </FilterBadge>
          </FilterButton>
          <FilterButton 
            active={questionFilter === 'not_started'} 
            onClick={() => setQuestionFilter('not_started')}
          >
            Not Started
            <FilterBadge active={questionFilter === 'not_started'}>
              {filterStats.notStarted}
            </FilterBadge>
          </FilterButton>
          <FilterButton 
            active={questionFilter === 'without_notes'} 
            onClick={() => setQuestionFilter('without_notes')}
          >
            Completed Without Notes
            <FilterBadge active={questionFilter === 'without_notes'}>
              {filterStats.withoutNotes}
            </FilterBadge>
          </FilterButton>
        </FilterSection>

        <ScrollableContent>
          <AnimatePresence mode="wait">
            <QuestionCard
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <QuestionHeader>
              <QuestionContent>
                <QuestionTopic>{currentQuestion?.topic}</QuestionTopic>
                <QuestionText>{currentQuestion?.question}</QuestionText>
              </QuestionContent>
              
              <SkipToggleContainer isSkipped={skippedQuestions[currentQuestion?.id]}>
                <SkipToggle isSkipped={skippedQuestions[currentQuestion?.id]}>
                  <input
                    type="checkbox"
                    checked={skippedQuestions[currentQuestion?.id] || false}
                    onChange={(e) => handleSkipToggle(currentQuestion?.id, e.target.checked)}
                  />
                  Skip this question
                </SkipToggle>
                {skippedQuestions[currentQuestion?.id] && (
                  <SkipMessage>
                    Excluded from calculations
                  </SkipMessage>
                )}
              </SkipToggleContainer>
            </QuestionHeader>

            <PerspectivesGrid style={{ 
              opacity: skippedQuestions[currentQuestion?.id] ? 0.5 : 1,
              pointerEvents: skippedQuestions[currentQuestion?.id] ? 'none' : 'auto'
            }}>
              {currentQuestion?.perspectives?.map((perspective) => (
                <PerspectiveColumn key={perspective.id}>
                  <PerspectiveHeader>{perspective.label}</PerspectiveHeader>
                  <OptionGroup>
                    {perspective.type === 'single_choice' ? (
                      perspective.options.map((option) => {
                        const responseKey = `${currentQuestion.id}_${perspective.id}`;
                        const storedValue = responses[responseKey];
                        // Normalize comparison: convert both to strings to handle type mismatch
                        const isSelected = storedValue != null && String(storedValue) === String(option.value);
                        
                        return (
                          <OptionButton
                            key={option.value}
                            selected={isSelected}
                            onClick={() => handlePerspectiveResponse(
                              currentQuestion.id, 
                              perspective.id, 
                              option.value
                            )}
                          >
                            {option.label}
                          </OptionButton>
                        );
                      })
                    ) : (
                      perspective.options.map((option) => {
                        const responseKey = `${currentQuestion.id}_${perspective.id}`;
                        const selectedValues = responses[responseKey] || [];
                        // Normalize comparison: handle type mismatch for array values
                        const isSelected = Array.isArray(selectedValues) && 
                          selectedValues.some(val => String(val) === String(option.value));
                        
                        return (
                          <MultiSelectOption
                            key={option.value}
                            selected={isSelected}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handlePerspectiveResponse(
                                currentQuestion.id, 
                                perspective.id, 
                                option.value, 
                                true
                              )}
                            />
                            {option.label}
                          </MultiSelectOption>
                        );
                      })
                    )}
                  </OptionGroup>
                </PerspectiveColumn>
              ))}

              <CommentSection>
                <CommentHeader>
                  {currentQuestion?.commentBox?.label}
                </CommentHeader>
                <CommentInputWrapper>
                  <CommentTextarea
                    placeholder={currentQuestion?.commentBox?.placeholder}
                    value={responses[`${currentQuestion?.id}_comment`] || ''}
                    onChange={(e) => handleCommentChange(currentQuestion?.id, e.target.value)}
                  />
                </CommentInputWrapper>
              </CommentSection>
            </PerspectivesGrid>
          </QuestionCard>
        </AnimatePresence>
        </ScrollableContent>

        <NavigationSection>
          <BackButton
            onClick={handleBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiArrowLeft size={18} />
            Back
          </BackButton>

          <NextButton
            onClick={handleNext}
            disabled={!validateCurrentQuestion() || isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? 'Submitting...' : 
             currentQuestionIndex === totalQuestions - 1 ? 'Complete Area' : 'Next'}
            {currentQuestionIndex === totalQuestions - 1 ? 
              <FiCheckCircle size={18} /> : 
              <FiArrowRight size={18} />
            }
          </NextButton>
        </NavigationSection>
      </ContentWrapper>

      {/* Email Prompt Modal */}
      {showEmailPrompt && (
        <UserEmailPrompt
          assessmentName={currentAssessment?.assessmentName || 'Assessment'}
          onSubmit={(email) => {
            setEditorEmail(email);
            setShowEmailPrompt(false);
          }}
        />
      )}
    </AssessmentContainer>
  );
};

export default AssessmentQuestion;
