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
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  overflow: hidden;
  padding-top: 68px; /* Height of fixed GlobalNav */
`;

const ContentWrapper = styled.div`
  flex: 1;
  margin-left: 350px;
  height: calc(100vh - 68px);
  max-width: calc(100vw - 370px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
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
  font-weight: 600;
  
  .save-icon {
    animation: ${props => props.status === 'saved' ? 'checkmarkBounce 0.6s ease' : 'none'};
  }
  
  @keyframes checkmarkBounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.3); }
  }
`;

const LastSavedText = styled.span`
  font-size: 0.85rem;
  color: #666;
  font-weight: 400;
  margin-left: 4px;
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
  grid-template-columns: repeat(5, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 0;
  overflow-x: auto;
  
  @media (max-width: 1600px) {
    grid-template-columns: repeat(3, minmax(250px, 1fr));
    gap: 16px;
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(280px, 1fr));
    gap: 20px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const PerspectiveColumn = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 220px;
`;

const PerspectiveHeader = styled.h4`
  font-size: 1.05rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
  line-height: 1.3;
  word-wrap: break-word;
`;

const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const OptionButton = styled.button`
  padding: 12px 14px;
  border: 2px solid ${props => props.selected ? '#ff6b35' : '#e0e0e0'};
  border-radius: 8px;
  background: ${props => props.selected ? '#fff5f2' : 'white'};
  color: ${props => props.selected ? '#ff6b35' : '#333'};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  min-height: 60px;
  height: auto;
  display: flex;
  align-items: center;
  width: 100%;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  
  &:hover {
    border-color: #ff6b35;
    background: #fff5f2;
  }
`;

const MultiSelectOption = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 2px solid ${props => props.selected ? '#ff6b35' : '#e0e0e0'};
  border-radius: 8px;
  background: ${props => props.selected ? '#fff5f2' : 'white'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  min-height: 60px;
  height: auto;
  width: 100%;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  
  &:hover {
    border-color: #ff6b35;
    background: #fff5f2;
  }
  
  input[type="checkbox"] {
    margin: 0;
    flex-shrink: 0;
    width: 18px;
    height: 18px;
  }
`;

const CommentSection = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 220px;
`;

const CommentHeader = styled.h4`
  font-size: 1.05rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
  line-height: 1.3;
  word-wrap: break-word;
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
  padding: 12px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.5;
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
  position: sticky;
  bottom: 0;
  z-index: 10;
  margin-top: auto;
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

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
`;

const DialogBox = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const DialogTitle = styled.h2`
  margin: 0 0 12px 0;
  font-size: 1.75rem;
  color: #1f2937;
  font-weight: 700;
`;

const DialogMessage = styled.p`
  margin: 0 0 32px 0;
  font-size: 1.1rem;
  color: #6b7280;
  line-height: 1.6;
`;

const DialogButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const DialogButton = styled(motion.button)`
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  ${props => props.variant === 'primary' && `
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background: #f3f4f6;
    color: #4b5563;
    
    &:hover {
      background: #e5e7eb;
    }
  `}
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

// 🆕 SMART NAVIGATION COMPONENTS
const QuestionMiniMap = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
  
  @media (max-width: 768px) {
    padding: 12px;
    gap: 6px;
  }
`;

const MiniMapDot = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid ${props => 
    props.isComplete ? '#10b981' : 
    props.isPartial ? '#fbbf24' : 
    props.isCurrent ? '#ff6b35' : '#e5e7eb'};
  background: ${props => 
    props.isComplete ? '#10b981' : 
    props.isPartial ? '#fef3c7' :
    props.isCurrent ? '#ff6b35' : 'white'};
  color: ${props => props.isComplete || props.isCurrent ? 'white' : '#666'};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &:hover {
    transform: scale(1.15);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }
`;

const MiniMapLabel = styled.div`
  font-size: 0.85rem;
  color: #666;
  font-weight: 600;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

// 🆕 CONTEXTUAL HELP COMPONENTS
const TooltipContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const TooltipTrigger = styled.span`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: help;
  margin-left: 6px;
  flex-shrink: 0;
  
  &:hover + div {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

const TooltipContent = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  background: #1f2937;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1.5;
  width: max-content;
  max-width: 300px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: #1f2937;
  }
  
  @media (max-width: 768px) {
    max-width: 250px;
    font-size: 0.8rem;
    padding: 10px 12px;
  }
`;

const MaturityLevelInfo = styled.div`
  background: #f8f9fa;
  border-left: 4px solid #3b82f6;
  padding: 12px 16px;
  margin-top: 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  
  strong {
    color: #3b82f6;
    display: block;
    margin-bottom: 4px;
  }
`;

// 🆕 BULK ACTIONS COMPONENTS
const BulkActionsBar = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  
  @media (max-width: 968px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const BulkActionsTitle = styled.div`
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BulkActionsButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const BulkActionButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    flex: 1;
    padding: 10px 12px;
  }
`;

// 🆕 DIMENSION PROGRESS CARD
const DimensionProgressCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const DimensionInfo = styled.div`
  flex: 1;
`;

const DimensionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
`;

const DimensionProgress = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProgressBarSmall = styled.div`
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  
  div {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #059669);
    width: ${props => props.progress}%;
    transition: width 0.5s ease;
  }
`;

const ProgressLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: #10b981;
  white-space: nowrap;
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
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [nextPillarInfo, setNextPillarInfo] = useState(null);
  const [questionFilter, setQuestionFilter] = useState('all'); // 'all', 'completed', 'not_started', 'without_notes'
  const [showBulkActions, setShowBulkActions] = useState(false); // 🆕 Bulk actions toggle
  const [showMiniMap, setShowMiniMap] = useState(true); // 🆕 Mini-map toggle

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

  // Add beforeunload warning to prevent accidental navigation away with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Only warn if currently saving or if there are unsaved changes
      if (autoSaveStatus === 'saving') {
        e.preventDefault();
        e.returnValue = 'Your progress is being saved. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [autoSaveStatus]);

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

  // Get current dimension for display with completion stats
  const getCurrentDimension = () => {
    if (!currentArea?.dimensions || !currentQuestion) return null;
    
    let questionCount = 0;
    for (const dimension of currentArea.dimensions) {
      const dimensionQuestionCount = dimension.questions?.length || 0;
      if (currentQuestionIndex < questionCount + dimensionQuestionCount) {
        // Calculate completion stats for this dimension
        const completedCount = (dimension.questions || []).filter(q => 
          isQuestionCompleted(q)
        ).length;
        
        return {
          ...dimension,
          completedQuestions: completedCount,
          totalQuestions: dimensionQuestionCount
        };
      }
      questionCount += dimensionQuestionCount;
    }
    return null;
  };

  const currentDimension = getCurrentDimension();

  // 🆕 MATURITY LEVEL EXPLANATIONS
  const maturityLevelHelp = {
    1: {
      name: "Level 1: Explore",
      description: "Manual processes, ad-hoc implementations, no standardization. You're just beginning your journey."
    },
    2: {
      name: "Level 2: Experiment",
      description: "Basic implementation in place, some repeatability. Early adoption with limited scale."
    },
    3: {
      name: "Level 3: Formalize",
      description: "Documented processes, consistent practices across teams. Enterprise-wide standards emerging."
    },
    4: {
      name: "Level 4: Optimize",
      description: "Fully automated, optimized processes. Advanced capabilities deployed at scale."
    },
    5: {
      name: "Level 5: Transform",
      description: "Industry-leading maturity, continuous innovation, AI-driven optimization across all operations."
    }
  };

  // Helper component for tooltips
  const renderTooltip = (content) => (
    <TooltipContainer>
      <TooltipTrigger>?</TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </TooltipContainer>
  );

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

  // 🆕 BULK ACTIONS HANDLERS
  const handleBulkSetCurrentState = async (level) => {
    if (!window.confirm(`Set ALL questions' Current State to Level ${level}?`)) return;
    
    const updatedResponses = { ...responses };
    currentArea?.questions?.forEach(question => {
      const currentStateKey = `${question.id}_current_state`;
      updatedResponses[currentStateKey] = level;
    });
    
    setResponses(updatedResponses);
    toast.success(`All Current States set to Level ${level}`, { duration: 2000 });
    setAutoSaveStatus('saving');
    
    // Save all changes
    try {
      for (const question of (currentArea?.questions || [])) {
        await assessmentService.saveQuestionResponse(
          assessmentId, 
          question.id, 
          'current_state', 
          level, 
          responses[`${question.id}_comment`] || '',
          skippedQuestions[question.id] || false,
          editorEmail
        );
      }
      setAutoSaveStatus('saved');
      setLastSaved(new Date());
    } catch (error) {
      setAutoSaveStatus('error');
      toast.error('Failed to save bulk changes');
    }
  };

  const handleSkipToNextUnanswered = () => {
    const unansweredIndex = (currentArea?.questions || []).findIndex((q, idx) => {
      if (idx <= currentQuestionIndex) return false;
      return !isQuestionCompleted(q);
    });
    
    if (unansweredIndex !== -1) {
      setCurrentQuestionIndex(unansweredIndex);
      toast.success('Jumped to next unanswered question', { duration: 1500 });
    } else {
      toast('All questions answered! 🎉', { icon: '✅', duration: 2000 });
    }
  };

  const handleJumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Format last saved time
  const getLastSavedText = () => {
    if (!lastSaved) return null;
    
    const now = new Date();
    const diff = Math.floor((now - new Date(lastSaved)) / 1000); // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return new Date(lastSaved).toLocaleTimeString();
  };

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
      // Go to previous question in current pillar
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      // On first question - navigate to previous pillar's last question
      const currentPillarIndex = framework.assessmentAreas.findIndex(area => area.id === categoryId);
      
      if (currentPillarIndex > 0) {
        // Go to previous pillar
        const previousPillar = framework.assessmentAreas[currentPillarIndex - 1];
        navigate(`/assessment/${assessmentId}/${previousPillar.id}`);
        toast.info(`Navigating back to ${previousPillar.name}...`);
      } else {
        // First question of first pillar - go to assessment list
        navigate('/assessments');
        toast.info('Returning to assessments list...');
      }
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
      
      toast.success(`${currentArea.name} completed!`);
      
      // Update assessment status and get the latest state
      let updatedAssessment = currentAssessment;
      if (onUpdateStatus) {
        try {
          updatedAssessment = await onUpdateStatus(assessmentId);
        } catch (statusError) {
          console.warn('Failed to update status, but submission succeeded:', statusError);
        }
      }
      
      // Use the updated completed categories list (after this pillar was added)
      const completedCategories = updatedAssessment?.completedCategories || currentAssessment?.completedCategories || [];
      
      // Find the next pillar in sequence (regardless of completion status)
      const currentPillarIndex = framework.assessmentAreas.findIndex(area => area.id === categoryId);
      const nextPillar = framework.assessmentAreas[currentPillarIndex + 1]; // Get next pillar in sequence
      
      // Show appropriate message if all pillars completed
      if (!nextPillar && completedCategories.length === framework.assessmentAreas.length) {
        toast.success('🎉 All pillars completed! You can now view your Overall Assessment Results.', {
          duration: 5000
        });
      }
      
      // Always show dialog to let user choose
      setNextPillarInfo(nextPillar); // Will be null if no more pillars
      setShowCompletionDialog(true);
    } catch (error) {
      console.error('Error submitting area responses:', error);
      toast.error('Failed to submit responses. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueToNextPillar = () => {
    setShowCompletionDialog(false);
    if (nextPillarInfo) {
      toast.success(`Moving to ${nextPillarInfo.name}...`);
      setTimeout(() => {
        navigate(`/assessment/${assessmentId}/${nextPillarInfo.id}`);
      }, 500);
    }
  };

  const handleViewResults = () => {
    console.log('[AssessmentQuestion] Navigating to results:', assessmentId);
    setShowCompletionDialog(false);
    setTimeout(() => {
      navigate(`/results/${assessmentId}`);
    }, 300);
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <AutoSaveStatus status={autoSaveStatus}>
                {autoSaveStatus === 'saving' && (
                  <>
                    <FiSave size={18} />
                    <span>Saving...</span>
                  </>
                )}
                {autoSaveStatus === 'saved' && (
                  <>
                    <FiCheckCircle size={18} className="save-icon" />
                    <span>
                      All changes saved
                      <LastSavedText>
                        {getLastSavedText() && ` • ${getLastSavedText()}`}
                      </LastSavedText>
                    </span>
                  </>
                )}
                {autoSaveStatus === 'error' && (
                  <>
                    <FiWifiOff size={18} />
                    <span>Save failed - click Save Progress below</span>
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

        {/* 🆕 SMART NAVIGATION: Question Mini-Map */}
        {showMiniMap && currentArea?.questions && (
          <QuestionMiniMap>
            <MiniMapLabel>Quick Jump:</MiniMapLabel>
            {(currentArea.questions || []).map((q, idx) => {
              const isComplete = isQuestionCompleted(q);
              const hasComment = hasNotes(q);
              const isPartial = !isComplete && (responses[`${q.id}_current_state`] || responses[`${q.id}_future_state`]);
              const isCurrent = idx === currentQuestionIndex;
              
              return (
                <MiniMapDot
                  key={q.id}
                  isComplete={isComplete}
                  isPartial={isPartial}
                  isCurrent={isCurrent}
                  onClick={() => handleJumpToQuestion(idx)}
                  title={`Question ${idx + 1}: ${q.topic} - ${isComplete ? '✓ Complete' : isPartial ? '⚠ Partial' : '○ Not started'}`}
                >
                  {isComplete ? '✓' : idx + 1}
                </MiniMapDot>
              );
            })}
            <button
              onClick={() => setShowMiniMap(false)}
              style={{
                marginLeft: 'auto',
                padding: '6px 12px',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: '#666'
              }}
            >
              Hide Map
            </button>
          </QuestionMiniMap>
        )}

        {/* 🆕 DIMENSION PROGRESS CARD */}
        {currentDimension && (
          <DimensionProgressCard>
            <DimensionInfo>
              <DimensionTitle>{currentDimension.name}</DimensionTitle>
              <DimensionProgress>
                <ProgressBarSmall progress={(currentDimension.completedQuestions / currentDimension.totalQuestions) * 100}>
                  <div />
                </ProgressBarSmall>
                <ProgressLabel>
                  {currentDimension.completedQuestions}/{currentDimension.totalQuestions} Complete
                </ProgressLabel>
              </DimensionProgress>
            </DimensionInfo>
            {!showMiniMap && (
              <button
                onClick={() => setShowMiniMap(true)}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  whiteSpace: 'nowrap'
                }}
              >
                Show Map
              </button>
            )}
          </DimensionProgressCard>
        )}

        {/* 🆕 BULK ACTIONS BAR */}
        {showBulkActions && (
          <BulkActionsBar>
            <BulkActionsTitle>
              <span>⚡</span>
              <span>Power User Actions</span>
            </BulkActionsTitle>
            <BulkActionsButtons>
              <BulkActionButton onClick={() => handleBulkSetCurrentState(1)}>
                Set All Current → L1
              </BulkActionButton>
              <BulkActionButton onClick={() => handleBulkSetCurrentState(2)}>
                Set All Current → L2
              </BulkActionButton>
              <BulkActionButton onClick={() => handleBulkSetCurrentState(3)}>
                Set All Current → L3
              </BulkActionButton>
              <BulkActionButton onClick={handleSkipToNextUnanswered}>
                Skip to Next Unanswered
              </BulkActionButton>
              <BulkActionButton onClick={() => setShowBulkActions(false)}>
                Hide
              </BulkActionButton>
            </BulkActionsButtons>
          </BulkActionsBar>
        )}

        {/* Toggle Bulk Actions Button */}
        {!showBulkActions && (
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            <button
              onClick={() => setShowBulkActions(true)}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
              }}
            >
              ⚡ Show Power User Actions
            </button>
          </div>
        )}

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
                  <PerspectiveHeader>
                    {perspective.label}
                    {/* 🆕 Add tooltips for state perspectives */}
                    {perspective.id === 'current_state' && renderTooltip(
                      "Rate your organization's current maturity level for this capability"
                    )}
                    {perspective.id === 'future_state' && renderTooltip(
                      "What maturity level do you aspire to achieve? (Must be ≥ Current State)"
                    )}
                  </PerspectiveHeader>
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

          {/* 🆕 MATURITY LEVEL REFERENCE CARD */}
          <div style={{ marginTop: '16px', background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 700, color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📘</span>
              <span>Maturity Level Reference</span>
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {[1, 2, 3, 4, 5].map(level => (
                <MaturityLevelInfo key={level}>
                  <strong>{maturityLevelHelp[level].name}</strong>
                  <div>{maturityLevelHelp[level].description}</div>
                </MaturityLevelInfo>
              ))}
            </div>
          </div>

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

      {/* Completion Dialog */}
      {showCompletionDialog && (
        <DialogOverlay onClick={() => setShowCompletionDialog(false)}>
          <DialogBox
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <DialogTitle>🎉 {currentArea?.name || 'Pillar'} Completed!</DialogTitle>
            <DialogMessage>
              {nextPillarInfo ? (
                <>
                  Great progress! Would you like to review the next pillar ({nextPillarInfo.name}) 
                  or view your overall assessment results?
                </>
              ) : (
                <>
                  Congratulations! You've completed all pillars. 
                  View your comprehensive assessment results now.
                </>
              )}
            </DialogMessage>
            <DialogButtons>
              <DialogButton
                variant="secondary"
                onClick={handleViewResults}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Results
              </DialogButton>
              {nextPillarInfo && (
                <DialogButton
                  variant="primary"
                  onClick={handleContinueToNextPillar}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Review {nextPillarInfo.name} →
                </DialogButton>
              )}
            </DialogButtons>
          </DialogBox>
        </DialogOverlay>
      )}
    </AssessmentContainer>
  );
};

export default AssessmentQuestion;

