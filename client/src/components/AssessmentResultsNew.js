import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiTrendingUp,
  FiTarget,
  FiZap,
  FiDownload,
  FiShare2,
  FiEdit3,
  FiRefreshCw,
  FiSave,
  FiTrash2,
  FiX,
  FiPrinter,
  FiDroplet,
  FiRotateCcw,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as assessmentService from '../services/assessmentService';
import { exportAssessmentToExcel } from '../services/excelExportService';

// =======================
// STYLED COMPONENTS
// =======================

// Global print styles
const PrintStyles = styled.div`
  @media print {
    /* Enable background graphics */
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
    
    /* Hide navigation and action buttons */
    nav, button:not(.print-visible), .no-print {
      display: none !important;
    }
    
    /* Optimize page breaks */
    * {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    /* Full width for print */
    body {
      margin: 0;
      padding: 0;
    }
    
    /* Ensure backgrounds and borders print */
    div, section {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    /* Page margins for headers/footers */
    @page {
      margin: 0.75in 0.5in;
      size: letter;
    }
  }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  padding: 40px 24px;
  padding-top: 108px; /* 68px GlobalNav + 40px top padding */

  @media (max-width: 768px) {
    padding: 24px 16px;
    padding-top: 92px; /* 68px GlobalNav + 24px top padding */
  }
  
  @media print {
    padding: 0;
    background: white;
    min-height: auto;
  }
`;

const ReportContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const ReportHeader = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  padding: 48px 48px 40px;
  color: white;

  @media (max-width: 768px) {
    padding: 32px 24px 28px;
  }
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
`;

const TitleSection = styled.div`
  h1 {
    font-size: 2rem;
    font-weight: 800;
    margin: 0 0 8px 0;
    letter-spacing: -0.02em;
  }

  .subtitle {
    font-size: 0.938rem;
    color: rgba(255, 255, 255, 0.7);
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 1.5rem;
    }

    .subtitle {
      font-size: 0.875rem;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    
    button {
      flex: 1;
      min-width: 140px;
    }
  }
`;

const ActionButton = styled(motion.button)`
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 9px 16px;
    font-size: 0.813rem;
    justify-content: center;
  }
`;

const MaturityOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const MaturityCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 24px;
  backdrop-filter: blur(10px);

  .icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: ${props => props.$iconBg || 'rgba(255, 255, 255, 0.2)'};
    display: grid;
    place-items: center;
    margin-bottom: 16px;
    color: white;
  }

  .label {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 8px;
  }

  .value {
    font-size: 1.75rem;
    font-weight: 800;
    color: white;
    margin-bottom: 4px;
  }

  .description {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    padding: 20px;

    .value {
      font-size: 1.5rem;
    }
  }
`;

const ReportBody = styled.div`
  padding: 48px;

  @media (max-width: 768px) {
    padding: 32px 24px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 32px 0;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 24px;
  }
`;

const PillarSection = styled(motion.div)`
  margin-bottom: 48px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;

  &:last-of-type {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    margin-bottom: 32px;
  }
`;

const PillarHeader = styled.div`
  background: #f8fafc;
  padding: 24px 32px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  .pillar-info {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
  }

  .pillar-icon {
    font-size: 2rem;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .pillar-actions {
    display: flex;
    gap: 8px;
  }

  @media (max-width: 768px) {
    padding: 20px 24px;
    flex-wrap: wrap;

    .pillar-icon {
      font-size: 1.75rem;
    }

    h3 {
      font-size: 1.125rem;
    }

    .pillar-actions {
      width: 100%;
      justify-content: flex-end;
      margin-top: 12px;
    }
  }
`;

const CollapsibleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
  }

  .collapse-icon {
    transition: transform 0.3s ease;
    ${props => props.$collapsed && 'transform: rotate(180deg);'}
  }
`;

const EditActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: ${props => props.$variant === 'danger' ? '#fee2e2' : props.$variant === 'success' ? '#d1fae5' : '#eff6ff'};
  color: ${props => props.$variant === 'danger' ? '#dc2626' : props.$variant === 'success' ? '#059669' : '#3b82f6'};
  border: 1px solid ${props => props.$variant === 'danger' ? '#fecaca' : props.$variant === 'success' ? '#86efac' : '#bfdbfe'};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$variant === 'danger' ? '#fecaca' : props.$variant === 'success' ? '#86efac' : '#dbeafe'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EditableTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.6;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const PillarBody = styled.div`
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 768px) {
    padding: 24px;
    gap: 20px;
  }
`;

const PillarTopRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const PillarFullWidth = styled.div`
  width: 100%;
  /* Background and border are now controlled by inline styles for customization */
  border-radius: 16px;
  padding: 24px;
  
  @media (max-width: 768px) {
    padding: 18px;
  }
`;

const PillarColumn = styled.div`
  .column-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    font-weight: 700;
    color: ${props => props.$color || '#6b7280'};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 12px;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    font-size: 0.938rem;
    color: #475569;
    line-height: 1.6;
    margin-bottom: 12px;
    padding-left: 0;

    &:last-child {
      margin-bottom: 0;
    }

    &::before {
      content: '•';
      color: ${props => props.$color || '#6b7280'};
      font-weight: bold;
      display: inline-block;
      width: 1em;
      margin-left: 0;
    }
  }

  @media (max-width: 768px) {
    .column-title {
      font-size: 0.813rem;
    }

    li {
      font-size: 0.875rem;
    }
  }
`;

const RoadmapSection = styled.section`
  margin-top: 64px;
  padding-top: 48px;
  border-top: 2px solid #e5e7eb;

  @media (max-width: 768px) {
    margin-top: 48px;
    padding-top: 32px;
  }
`;

const RoadmapPhases = styled.div`
  display: grid;
  gap: 24px;
`;

const PhaseCard = styled(motion.div)`
  background: ${props => props.$bgColor || '#ffffff'};
  border: 2px solid ${props => props.$borderColor || '#e5e7eb'};
  border-radius: 12px;
  padding: 28px 32px;
  position: relative;

  .phase-header-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    gap: 12px;
  }

  .phase-header {
    font-size: 1.125rem;
    font-weight: 700;
    color: #1e293b;
    flex: 1;
  }

  .phase-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    font-size: 0.938rem;
    color: #374151;
    line-height: 1.6;
    margin-bottom: 10px;
    padding-left: 20px;
    position: relative;

    &:last-child {
      margin-bottom: 0;
    }

    &::before {
      content: '▸';
      position: absolute;
      left: 0;
      color: ${props => props.$accentColor || '#f59e0b'};
      font-weight: bold;
    }
  }

  @media (max-width: 768px) {
    padding: 20px 24px;

    .phase-header {
      font-size: 1rem;
    }

    li {
      font-size: 0.875rem;
    }
  }
`;

const ImpactSection = styled.section`
  margin-top: 64px;
  padding-top: 48px;
  border-top: 2px solid #e5e7eb;

  @media (max-width: 768px) {
    margin-top: 48px;
    padding-top: 32px;
  }
`;

const ImpactMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const MetricCard = styled(motion.div)`
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 32px 28px;
  text-align: center;

  .metric-value {
    font-size: 3rem;
    font-weight: 800;
    color: #0369a1;
    margin-bottom: 8px;
    line-height: 1;
  }

  .metric-label {
    font-size: 0.938rem;
    color: #0c4a6e;
    font-weight: 500;
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    padding: 24px 20px;

    .metric-value {
      font-size: 2.5rem;
    }

    .metric-label {
      font-size: 0.875rem;
    }
  }
`;

const LoadingContainer = styled.div`
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .spinner {
    text-align: center;
    
    .text {
      font-size: 1.125rem;
      color: #6b7280;
      margin-top: 16px;
    }
  }
`;

const ErrorContainer = styled.div`
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
  padding: 20px;

  .icon {
    color: #dc2626;
    margin-bottom: 8px;
  }

  .title {
    font-size: 1.25rem;
    color: #111827;
    font-weight: 600;
  }

  .message {
    font-size: 1rem;
    color: #6b7280;
  }

  button {
    margin-top: 16px;
    padding: 10px 20px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      background: #2563eb;
    }
  }
`;

// Maturity Chart Styled Components
// Summary Maturity Chart (Top of page)
const MaturityChart = styled.div`
  margin: 24px 0;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const MaturityChartTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CompactMaturityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MaturityPillarSection = styled.div`
  border-left: 3px solid ${props => props.$color || '#3b82f6'};
  padding: 14px 16px;
  background: ${props => props.$color}08;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const MaturityPillarTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  flex: 1;
  
  .pillar-icon {
    font-size: 1.3rem;
    flex-shrink: 0;
  }
  
  .pillar-name {
    color: ${props => props.$color || '#3b82f6'};
    line-height: 1.3;
  }
`;

const MaturityLegend = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 12px;
  padding: 8px;
  background: #f9fafb;
  border-radius: 6px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #6b7280;
  
  span {
    font-weight: 600;
  }
`;

const ScoresContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const ScoreGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const ScoreBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 700;
  min-width: 50px;
  background: ${props => props.$current ? props.$color : 'white'};
  color: ${props => props.$current ? 'white' : props.$color};
  border: 2px solid ${props => props.$color};
`;

const ScoreLabel = styled.div`
  font-size: 0.625rem;
  text-align: center;
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

// Individual Pillar Maturity Chart (Horizontal bars)
const PillarMaturityChart = styled.div`
  margin-bottom: 32px;
  padding: 20px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

const MaturityLevelsHeader = styled.div`
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
  margin-bottom: 12px;
`;

const MaturityLevelsScale = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 8px;
`;

const MaturityLevel = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  color: #9ca3af;
  text-align: center;
  flex: 1;
`;

const DimensionMaturityRow = styled.div`
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DimensionLabel = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  padding: 10px 14px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid ${props => props.$borderColor || '#3b82f6'};
  display: flex;
  align-items: center;
  min-height: 44px;
`;

const MaturityBarsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
`;

const MaturityBar = styled.div`
  height: 18px;
  border-radius: 9px;
  position: relative;
  display: flex;
  align-items: center;
  background: ${props => props.$isCurrent ? props.$color : `${props.$color}22`};
  border: 2px solid ${props => props.$color};
  width: ${props => (props.$score / 5) * 100}%;
  min-width: 70px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px ${props => props.$color}44;
  }
`;

const BarLabel = styled.div`
  position: absolute;
  left: 8px;
  font-size: 0.65rem;
  font-weight: 700;
  color: ${props => props.$isCurrent ? 'white' : props.$color};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ScoreValue = styled.div`
  position: absolute;
  right: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  color: ${props => props.$isCurrent ? 'white' : props.$color};
  min-width: 24px;
  text-align: right;
`;

// =======================
// COMPONENT
// =======================

const AssessmentResultsNew = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [framework, setFramework] = useState(null);
  
  // Edit state management
  const [editMode, setEditMode] = useState(false); // Global edit mode toggle
  const [editingPillar, setEditingPillar] = useState(null);
  const [editingPhase, setEditingPhase] = useState(null);
  const [editingPhaseItem, setEditingPhaseItem] = useState(null); // Track which phase item is being edited
  const [editingFeature, setEditingFeature] = useState(null); // Track which feature is being edited
  const [editingNextStep, setEditingNextStep] = useState(null); // Track which next step is being edited
  const [editingGoodItem, setEditingGoodItem] = useState(null); // Track which "What's Working" item is being edited
  const [editingBadItem, setEditingBadItem] = useState(null); // Track which "Key Challenge" item is being edited
  const [addingGoodItem, setAddingGoodItem] = useState(null); // Track which pillar is adding a new "What's Working" item
  const [addingBadItem, setAddingBadItem] = useState(null); // Track which pillar is adding a new "Key Challenge" item
  const [addingFeature, setAddingFeature] = useState(null); // Track which pillar is adding a new feature
  const [addingNextStep, setAddingNextStep] = useState(null); // Track which pillar is adding a new next step
  const [addingPhaseItem, setAddingPhaseItem] = useState(null); // Track which phase is adding a new item
  const [addingImpactMetric, setAddingImpactMetric] = useState(false); // Track if adding a new impact metric
  const [editingImpactMetric, setEditingImpactMetric] = useState(null); // Track which impact metric is being edited
  const [editingNewGoodItem, setEditingNewGoodItem] = useState(null); // Track which new "What's Working" item is being edited
  const [editingNewBadItem, setEditingNewBadItem] = useState(null); // Track which new "Key Challenge" item is being edited
  const [editingNewFeature, setEditingNewFeature] = useState(null); // Track which new feature is being edited
  const [editingNewNextStep, setEditingNewNextStep] = useState(null); // Track which new next step is being edited
  const [editedContent, setEditedContent] = useState({});
  const [customizations, setCustomizations] = useState({
    title: '',
    summary: '',
    pillars: {},
    phases: {},
    features: {},
    nextSteps: {},
    goodItems: {}, // { pillarId_index: text }
    badItems: {}, // { pillarId_index: text }
    newGoodItems: {}, // { pillarId: [array of new items] }
    newBadItems: {}, // { pillarId: [array of new items] }
    newFeatures: {}, // { pillarId: [array of new features] }
    newNextSteps: {}, // { pillarId: [array of new next steps] }
    newPhaseItems: {}, // { phaseId: [array of new items] }
    newImpactMetrics: [], // Array of new impact metrics
    impactMetrics: {}, // { metricKey: { value, label, drivers } }
    cardColors: {}, // { cardKey: { bg, border, text } }
    collapsedSections: {} // { sectionKey: boolean }
  });

  // Load customizations from localStorage on mount
  useEffect(() => {
    if (assessmentId) {
      const storageKey = `assessment_customizations_${assessmentId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCustomizations(prevState => ({ ...prevState, ...parsed }));
          console.log('[AssessmentResultsNew] Loaded customizations from localStorage:', parsed);
        } catch (error) {
          console.error('[AssessmentResultsNew] Error parsing saved customizations:', error);
        }
      }
    }
  }, [assessmentId]);

  // Save customizations to localStorage whenever they change
  useEffect(() => {
    if (assessmentId && Object.keys(customizations).length > 0) {
      const storageKey = `assessment_customizations_${assessmentId}`;
      localStorage.setItem(storageKey, JSON.stringify(customizations));
      console.log('[AssessmentResultsNew] Saved customizations to localStorage');
    }
  }, [customizations, assessmentId]);

  // Extract fetchResults as a callable function with useCallback to avoid dependency warnings
  const fetchResults = useCallback(async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
        toast.loading('Refreshing results...', { id: 'refresh-results' });
      } else {
        setLoading(true);
      }
      setError(null);
      console.log('[AssessmentResultsNew] Fetching results for:', assessmentId);
      
      // Add cache-busting parameter to force fresh data
      const data = await assessmentService.getAssessmentResults(assessmentId, showRefreshToast);
      console.log('[AssessmentResultsNew] Results data received:', data);
      console.log('[AssessmentResultsNew] Data keys:', data ? Object.keys(data) : 'null');
      
      if (!data) {
        throw new Error('No data received from API');
      }
      
      // Wrap in data object if needed
      const resultsData = data.data ? data : { data };
      console.log('[AssessmentResultsNew] Setting results:', resultsData);
      
      setResults(resultsData);
      
      if (showRefreshToast) {
        toast.success('Results refreshed successfully!', { id: 'refresh-results' });
      }
    } catch (err) {
      console.error('[AssessmentResultsNew] Error fetching results:', err);
      console.error('[AssessmentResultsNew] Error stack:', err.stack);
      setError(err.message || 'Failed to load assessment results');
      setResults(null);
      
      if (showRefreshToast) {
        toast.error('Failed to refresh results', { id: 'refresh-results' });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [assessmentId]); // Only re-create when assessmentId changes

  useEffect(() => {
    if (assessmentId) {
      fetchResults();
    } else {
      console.error('[AssessmentResultsNew] No assessment ID provided');
      setError('No assessment ID provided');
      setLoading(false);
    }
  }, [assessmentId, fetchResults, routerLocation.key]);

  // Fetch assessment framework for dimension names
  useEffect(() => {
    const fetchFramework = async () => {
      try {
        const frameworkData = await assessmentService.getAssessmentFramework();
        setFramework(frameworkData);
      } catch (err) {
        console.error('[AssessmentResultsNew] Error fetching framework:', err);
      }
    };
    fetchFramework();
  }, []);

  // Refresh handler
  const handleRefresh = () => {
    fetchResults(true);
  };

  // Edit handlers for pillar cards
  const handleEditPillar = (pillarId, data) => {
    console.log('[Edit] Opening editor for pillar:', pillarId);
    console.log('[Edit] Current data:', data);
    
    setEditingPillar(pillarId);
    
    // Ensure we're using the latest data from the results
    const currentData = getPillarData(pillarId);
    console.log('[Edit] Fresh pillar data:', currentData);
    
    // Format Databricks recommendations for editing
    let recommendationsText = '';
    if (currentData.databricksFeatures && currentData.databricksFeatures.length > 0) {
      // If we have Databricks features, show them with their full details
      recommendationsText = currentData.databricksFeatures.map(feature => {
        let text = `${feature.name}`;
        if (feature.description) {
          text += ` - ${feature.description}`;
        }
        if (feature.releaseDate) {
          text += ` (${feature.releaseDate})`;
        }
        return text;
      }).join('\n');
      
      // Add specific recommendations if available
      if (currentData.specificRecommendations && currentData.specificRecommendations.length > 0) {
        recommendationsText += '\n\n--- Next Steps ---\n';
        recommendationsText += currentData.specificRecommendations.join('\n');
      }
    } else if (currentData.recommendations && currentData.recommendations.length > 0) {
      // Fallback to generic recommendations
      recommendationsText = currentData.recommendations.map(r => 
        typeof r === 'string' ? r : r.action || r.title || r
      ).join('\n');
    }
    
    setEditedContent({
      theGood: (currentData.theGood || []).join('\n'),
      theBad: (currentData.theBad || []).join('\n'),
      recommendations: recommendationsText
    });
  };

  const handleSavePillar = (pillarId) => {
    const newCustomizations = { ...customizations };
    newCustomizations.pillars[pillarId] = {
      theGood: editedContent.theGood.split('\n').filter(line => line.trim()),
      theBad: editedContent.theBad.split('\n').filter(line => line.trim()),
      recommendations: editedContent.recommendations.split('\n').filter(line => line.trim())
    };
    setCustomizations(newCustomizations);
    setEditingPillar(null);
    toast.success('Pillar content saved!');
  };

  const handleCancelPillarEdit = () => {
    setEditingPillar(null);
    setEditedContent({});
  };

  const handleRemovePillarCustomization = (pillarId) => {
    const newCustomizations = { ...customizations };
    delete newCustomizations.pillars[pillarId];
    setCustomizations(newCustomizations);
    toast.success('Customization removed, showing original content');
  };

  // Edit handlers for phase cards
  const handleEditPhase = (phaseId, items) => {
    setEditingPhase(phaseId);
    setEditedContent({ items: items.join('\n') });
  };

  const handleSavePhase = (phaseId) => {
    const newCustomizations = { ...customizations };
    newCustomizations.phases[phaseId] = editedContent.items.split('\n').filter(line => line.trim());
    setCustomizations(newCustomizations);
    setEditingPhase(null);
    toast.success('Phase content saved!');
  };

  const handleCancelPhaseEdit = () => {
    setEditingPhase(null);
    setEditedContent({});
  };

  const handleRemovePhaseCustomization = (phaseId) => {
    const newCustomizations = { ...customizations };
    delete newCustomizations.phases[phaseId];
    setCustomizations(newCustomizations);
    toast.success('Customization removed, showing original content');
  };

  // Edit handlers for individual phase items
  const handleEditPhaseItem = (phaseId, itemIndex, itemText) => {
    setEditingPhaseItem(`${phaseId}-item-${itemIndex}`);
    setEditedContent({ itemText });
  };

  const handleSavePhaseItem = (phaseId, itemIndex) => {
    const newCustomizations = { ...customizations };
    
    // Get current phase items (either customized or original)
    const currentPhase = roadmapPhases.find(p => p.id === phaseId);
    if (!currentPhase) return;
    
    const updatedItems = [...currentPhase.items];
    updatedItems[itemIndex] = editedContent.itemText;
    
    newCustomizations.phases[phaseId] = updatedItems;
    setCustomizations(newCustomizations);
    setEditingPhaseItem(null);
    toast.success('Phase item updated!');
  };

  const handleDeletePhaseItem = (phaseId, itemIndex) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    const newCustomizations = { ...customizations };
    
    // Get current phase items
    const currentPhase = roadmapPhases.find(p => p.id === phaseId);
    if (!currentPhase) return;
    
    const updatedItems = currentPhase.items.filter((_, idx) => idx !== itemIndex);
    newCustomizations.phases[phaseId] = updatedItems;
    setCustomizations(newCustomizations);
    toast.success('Phase item deleted!');
  };

  const handlePrint = () => {
    // Show brief toast
    const toastId = toast.success('Opening print dialog... Enable "Background graphics" in print settings for best results!', { duration: 1500 });
    
    // Dismiss the toast and open print dialog
    setTimeout(() => {
      toast.dismiss(toastId); // Dismiss the specific toast
      toast.dismiss(); // Dismiss all toasts to be safe
      setTimeout(() => {
        window.print();
      }, 100); // Small delay to ensure toast is gone
    }, 1000);
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      toast.loading('Generating Excel file...', { id: 'excel-export' });
      
      await exportAssessmentToExcel(
        assessmentId,
        results.assessmentInfo?.assessmentName || 'Assessment'
      );
      
      toast.success('Excel downloaded successfully!', { id: 'excel-export' });
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Failed to export Excel', { id: 'excel-export' });
    } finally {
      setExporting(false);
    }
  };

  // Edit handlers for Good Items ("What's Working")
  const handleEditGoodItem = (pillarId, itemIndex, text) => {
    const key = `${pillarId}-${itemIndex}`;
    setEditingGoodItem(key);
    setEditedContent({
      ...editedContent,
      [key]: text
    });
  };

  const handleSaveGoodItem = (pillarId, itemIndex) => {
    const key = `${pillarId}-${itemIndex}`;
    const newCustomizations = { ...customizations };
    newCustomizations.goodItems[key] = editedContent[key];
    setCustomizations(newCustomizations);
    setEditingGoodItem(null);
    toast.success('Item saved!');
  };

  // Edit handlers for Bad Items ("Key Challenges")
  const handleEditBadItem = (pillarId, itemIndex, text) => {
    const key = `${pillarId}-${itemIndex}`;
    setEditingBadItem(key);
    setEditedContent({
      ...editedContent,
      [key]: text
    });
  };

  const handleSaveBadItem = (pillarId, itemIndex) => {
    const key = `${pillarId}-${itemIndex}`;
    const newCustomizations = { ...customizations };
    newCustomizations.badItems[key] = editedContent[key];
    setCustomizations(newCustomizations);
    setEditingBadItem(null);
    toast.success('Item saved!');
  };

  // Delete handlers for Good Items
  const handleDeleteGoodItem = (pillarId, itemIndex) => {
    const key = `${pillarId}-${itemIndex}`;
    const newCustomizations = { ...customizations };
    newCustomizations.goodItems[key] = null; // Mark as deleted
    setCustomizations(newCustomizations);
    toast.success('Item deleted!');
  };

  // Delete handlers for Bad Items
  const handleDeleteBadItem = (pillarId, itemIndex) => {
    const key = `${pillarId}-${itemIndex}`;
    const newCustomizations = { ...customizations };
    newCustomizations.badItems[key] = null; // Mark as deleted
    setCustomizations(newCustomizations);
    toast.success('Item deleted!');
  };

  // Delete handlers for Features
  const handleDeleteFeature = (pillarId, featureIndex) => {
    const key = `${pillarId}-feature-${featureIndex}`;
    const newCustomizations = { ...customizations };
    newCustomizations.features[key] = null; // Mark as deleted
    setCustomizations(newCustomizations);
    toast.success('Feature deleted!');
  };

  // Delete handlers for Next Steps
  const handleDeleteNextStep = (pillarId, stepIndex) => {
    const key = `${pillarId}-${stepIndex}`;
    const newCustomizations = { ...customizations };
    newCustomizations.nextSteps[key] = null; // Mark as deleted
    setCustomizations(newCustomizations);
    toast.success('Next step deleted!');
  };

  // Add handlers for phase items
  const handleAddPhaseItem = (phaseId) => {
    setAddingPhaseItem(phaseId);
    setEditedContent({
      ...editedContent,
      [`new-phase-${phaseId}`]: ''
    });
  };

  const handleSaveNewPhaseItem = (phaseId) => {
    const newText = editedContent[`new-phase-${phaseId}`];
    if (!newText || !newText.trim()) {
      toast.error('Please enter some text');
      return;
    }
    
    const newCustomizations = { ...customizations };
    if (!newCustomizations.newPhaseItems[phaseId]) {
      newCustomizations.newPhaseItems[phaseId] = [];
    }
    newCustomizations.newPhaseItems[phaseId].push(newText.trim());
    setCustomizations(newCustomizations);
    setAddingPhaseItem(null);
    toast.success('Item added!');
  };

  // Add handlers for impact metrics
  const handleAddImpactMetric = () => {
    setAddingImpactMetric(true);
    setEditedContent({
      ...editedContent,
      'new-metric-value': '',
      'new-metric-label': '',
      'new-metric-drivers': ''
    });
  };

  const handleSaveNewImpactMetric = () => {
    const newValue = editedContent['new-metric-value'];
    const newLabel = editedContent['new-metric-label'];
    const newDrivers = editedContent['new-metric-drivers'];
    
    if (!newValue || !newValue.trim() || !newLabel || !newLabel.trim()) {
      toast.error('Please enter both metric value and label');
      return;
    }
    
    const newCustomizations = { ...customizations };
    if (!newCustomizations.newImpactMetrics) {
      newCustomizations.newImpactMetrics = [];
    }
    newCustomizations.newImpactMetrics.push({
      value: newValue.trim(),
      label: newLabel.trim(),
      drivers: newDrivers ? newDrivers.split(',').map(d => d.trim()).filter(d => d) : []
    });
    setCustomizations(newCustomizations);
    setAddingImpactMetric(false);
    toast.success('Metric added!');
  };

  // Edit handlers for impact metrics
  const handleEditImpactMetric = (metricKey, metric) => {
    setEditingImpactMetric(metricKey);
    setEditedContent({
      ...editedContent,
      [`${metricKey}-value`]: metric.value,
      [`${metricKey}-label`]: metric.label,
      [`${metricKey}-drivers`]: metric.drivers ? metric.drivers.join(', ') : ''
    });
  };

  const handleSaveImpactMetric = (metricKey) => {
    const newValue = editedContent[`${metricKey}-value`];
    const newLabel = editedContent[`${metricKey}-label`];
    const newDrivers = editedContent[`${metricKey}-drivers`];
    
    if (!newValue || !newValue.trim() || !newLabel || !newLabel.trim()) {
      toast.error('Please enter both metric value and label');
      return;
    }
    
    setCustomizations({
      ...customizations,
      impactMetrics: {
        ...customizations.impactMetrics,
        [metricKey]: {
          value: newValue.trim(),
          label: newLabel.trim(),
          drivers: newDrivers ? newDrivers.split(',').map(d => d.trim()).filter(d => d) : []
        }
      }
    });
    setEditingImpactMetric(null);
    toast.success('Metric updated!');
  };

  const handleDeleteImpactMetric = (metricKey) => {
    setCustomizations({
      ...customizations,
      impactMetrics: {
        ...customizations.impactMetrics,
        [metricKey]: null // Mark as deleted
      }
    });
    toast.success('Metric deleted!');
  };

  const handleDeleteNewImpactMetric = (index) => {
    const newMetrics = [...customizations.newImpactMetrics];
    newMetrics.splice(index, 1);
    setCustomizations({
      ...customizations,
      newImpactMetrics: newMetrics
    });
    toast.success('Metric deleted!');
  };

  const handleEditNewImpactMetric = (metricIndex, metric) => {
    const key = `new-metric-${metricIndex}`;
    setEditingImpactMetric(key);
    setEditedContent({
      ...editedContent,
      [`${key}-value`]: metric.value,
      [`${key}-label`]: metric.label,
      [`${key}-drivers`]: metric.drivers?.join(', ') || ''
    });
  };

  const handleSaveEditedNewImpactMetric = (metricIndex) => {
    const key = `new-metric-${metricIndex}`;
    const newValue = editedContent[`${key}-value`];
    const newLabel = editedContent[`${key}-label`];
    const newDrivers = editedContent[`${key}-drivers`];
    
    if (!newValue || !newValue.trim() || !newLabel || !newLabel.trim()) {
      toast.error('Please enter metric value and label');
      return;
    }
    
    const driversArray = newDrivers ? newDrivers.split(',').map(d => d.trim()).filter(d => d) : [];
    const newMetrics = [...customizations.newImpactMetrics];
    newMetrics[metricIndex] = {
      value: newValue.trim(),
      label: newLabel.trim(),
      drivers: driversArray
    };
    
    setCustomizations({
      ...customizations,
      newImpactMetrics: newMetrics
    });
    setEditingImpactMetric(null);
    toast.success('Metric updated!');
  };

  // Edit handlers for newly added items
  const handleEditNewGoodItem = (pillarId, itemIndex, text) => {
    const key = `${pillarId}-new-${itemIndex}`;
    setEditingNewGoodItem(key);
    setEditedContent({
      ...editedContent,
      [key]: text
    });
  };

  const handleSaveNewGoodItem = (pillarId, itemIndex) => {
    const key = `${pillarId}-new-${itemIndex}`;
    const newText = editedContent[key];
    if (!newText || !newText.trim()) {
      toast.error('Please enter some text');
      return;
    }
    
    const newCustomizations = { ...customizations };
    newCustomizations.newGoodItems[pillarId][itemIndex] = newText.trim();
    setCustomizations(newCustomizations);
    setEditingNewGoodItem(null);
    toast.success('Item updated!');
  };

  const handleDeleteNewGoodItem = (pillarId, itemIndex) => {
    const newCustomizations = { ...customizations };
    newCustomizations.newGoodItems[pillarId].splice(itemIndex, 1);
    setCustomizations(newCustomizations);
    toast.success('Item deleted!');
  };

  const handleEditNewBadItem = (pillarId, itemIndex, text) => {
    const key = `${pillarId}-new-${itemIndex}`;
    setEditingNewBadItem(key);
    setEditedContent({
      ...editedContent,
      [key]: text
    });
  };

  const handleSaveNewBadItem = (pillarId, itemIndex) => {
    const key = `${pillarId}-new-${itemIndex}`;
    const newText = editedContent[key];
    if (!newText || !newText.trim()) {
      toast.error('Please enter some text');
      return;
    }
    
    const newCustomizations = { ...customizations };
    newCustomizations.newBadItems[pillarId][itemIndex] = newText.trim();
    setCustomizations(newCustomizations);
    setEditingNewBadItem(null);
    toast.success('Challenge updated!');
  };

  const handleDeleteNewBadItem = (pillarId, itemIndex) => {
    const newCustomizations = { ...customizations };
    newCustomizations.newBadItems[pillarId].splice(itemIndex, 1);
    setCustomizations(newCustomizations);
    toast.success('Challenge deleted!');
  };

  const handleEditNewFeature = (pillarId, featureIndex, feature) => {
    const key = `${pillarId}-new-feature-${featureIndex}`;
    setEditingNewFeature(key);
    setEditedContent({
      ...editedContent,
      [`${key}-name`]: feature.name,
      [`${key}-desc`]: feature.description
    });
  };

  const handleSaveNewFeature = (pillarId, featureIndex) => {
    const key = `${pillarId}-new-feature-${featureIndex}`;
    const newName = editedContent[`${key}-name`];
    const newDesc = editedContent[`${key}-desc`];
    
    if (!newName || !newName.trim()) {
      toast.error('Please enter a feature name');
      return;
    }
    
    const newCustomizations = { ...customizations };
    newCustomizations.newFeatures[pillarId][featureIndex] = {
      name: newName.trim(),
      description: newDesc?.trim() || '',
      releaseDate: null,
      docs: null
    };
    setCustomizations(newCustomizations);
    setEditingNewFeature(null);
    toast.success('Feature updated!');
  };

  const handleDeleteNewFeature = (pillarId, featureIndex) => {
    const newCustomizations = { ...customizations };
    newCustomizations.newFeatures[pillarId].splice(featureIndex, 1);
    setCustomizations(newCustomizations);
    toast.success('Feature deleted!');
  };

  const handleEditNewNextStep = (pillarId, stepIndex, step) => {
    const key = `${pillarId}-new-step-${stepIndex}`;
    setEditingNewNextStep(key);
    setEditedContent({
      ...editedContent,
      [key]: step
    });
  };

  const handleSaveNewNextStep = (pillarId, stepIndex) => {
    const key = `${pillarId}-new-step-${stepIndex}`;
    const newText = editedContent[key];
    if (!newText || !newText.trim()) {
      toast.error('Please enter some text');
      return;
    }
    
    const newCustomizations = { ...customizations };
    newCustomizations.newNextSteps[pillarId][stepIndex] = newText.trim();
    setCustomizations(newCustomizations);
    setEditingNewNextStep(null);
    toast.success('Next step updated!');
  };

  const handleDeleteNewNextStep = (pillarId, stepIndex) => {
    const newCustomizations = { ...customizations };
    newCustomizations.newNextSteps[pillarId].splice(stepIndex, 1);
    setCustomizations(newCustomizations);
    toast.success('Next step deleted!');
  };

  // Add handlers for new items
  const handleAddGoodItem = (pillarId) => {
    setAddingGoodItem(pillarId);
    setEditedContent({
      ...editedContent,
      [`new-good-${pillarId}`]: ''
    });
  };

  const handleSaveAddedGoodItem = (pillarId) => {
    const newText = editedContent[`new-good-${pillarId}`];
    if (!newText || !newText.trim()) {
      toast.error('Please enter some text');
      return;
    }
    
    const newCustomizations = { ...customizations };
    if (!newCustomizations.newGoodItems[pillarId]) {
      newCustomizations.newGoodItems[pillarId] = [];
    }
    newCustomizations.newGoodItems[pillarId].push(newText.trim());
    setCustomizations(newCustomizations);
    setAddingGoodItem(null);
    toast.success('Item added!');
  };

  const handleAddBadItem = (pillarId) => {
    setAddingBadItem(pillarId);
    setEditedContent({
      ...editedContent,
      [`new-bad-${pillarId}`]: ''
    });
  };

  // 🔄 Toggle section collapsed state
  const toggleSection = (sectionKey) => {
    setCustomizations(prev => ({
      ...prev,
      collapsedSections: {
        ...prev.collapsedSections,
        [sectionKey]: !prev.collapsedSections[sectionKey]
      }
    }));
  };

  // 🎨 Color customization handler
  const handleCardColorChange = (cardKey, colorType) => {
    // Create a hidden input element to trigger native color picker
    const input = document.createElement('input');
    input.type = 'color';
    
    // Get current color or use default (WHITE)
    const currentColors = customizations.cardColors[cardKey] || {};
    const defaultColors = {
      'good': { bg: '#ffffff', border: '#e5e7eb', text: '#166534' },
      'bad': { bg: '#ffffff', border: '#e5e7eb', text: '#991b1b' },
      'features': { bg: '#ffffff', border: '#e5e7eb', text: '#1e40af' },
      'nextSteps': { bg: '#ffffff', border: '#e5e7eb', text: '#92400e' },
      'roadmap': { bg: '#ffffff', border: '#e5e7eb', text: '#6b21a8' },
      'impact': { bg: '#ffffff', border: '#e5e7eb', text: '#075985' }
    };
    
    const cardType = cardKey.split('-')[0]; // Extract card type from cardKey
    const defaults = defaultColors[cardType] || defaultColors['good'];
    
    input.value = currentColors.bg || defaults.bg;
    
    input.onchange = (e) => {
      const newColor = e.target.value;
      
      // Calculate complementary colors
      // Convert hex to RGB
      const r = parseInt(newColor.slice(1, 3), 16);
      const g = parseInt(newColor.slice(3, 5), 16);
      const b = parseInt(newColor.slice(5, 7), 16);
      
      // Lighten for background (add 40 to each channel, max 255)
      const lightR = Math.min(255, r + 40);
      const lightG = Math.min(255, g + 40);
      const lightB = Math.min(255, b + 40);
      const bgColor = `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`;
      
      // Darken for text (subtract 100 from each channel, min 0)
      const darkR = Math.max(0, r - 100);
      const darkG = Math.max(0, g - 100);
      const darkB = Math.max(0, b - 100);
      const textColor = `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`;
      
      setCustomizations({
        ...customizations,
        cardColors: {
          ...customizations.cardColors,
          [cardKey]: {
            bg: bgColor,
            border: newColor,
            text: textColor
          }
        }
      });
      
      toast.success('Card color updated!');
    };
    
    input.click();
  };

  // 🔄 Reset card color to original
  const handleResetCardColor = (cardKey) => {
    const newCustomizations = { ...customizations };
    
    // Remove the custom color for this card (will revert to default)
    if (newCustomizations.cardColors[cardKey]) {
      delete newCustomizations.cardColors[cardKey];
      setCustomizations(newCustomizations);
      toast.success('Color reset to original!');
    } else {
      toast.info('Card is already using original colors');
    }
  };

  const handleSaveAddedBadItem = (pillarId) => {
    const newText = editedContent[`new-bad-${pillarId}`];
    if (!newText || !newText.trim()) {
      toast.error('Please enter some text');
      return;
    }
    
    const newCustomizations = { ...customizations };
    if (!newCustomizations.newBadItems[pillarId]) {
      newCustomizations.newBadItems[pillarId] = [];
    }
    newCustomizations.newBadItems[pillarId].push(newText.trim());
    setCustomizations(newCustomizations);
    setAddingBadItem(null);
    toast.success('Challenge added!');
  };

  const handleAddFeature = (pillarId) => {
    setAddingFeature(pillarId);
    setEditedContent({
      ...editedContent,
      [`new-feature-${pillarId}-name`]: '',
      [`new-feature-${pillarId}-desc`]: ''
    });
  };

  const handleSaveAddedFeature = (pillarId) => {
    const newName = editedContent[`new-feature-${pillarId}-name`];
    const newDesc = editedContent[`new-feature-${pillarId}-desc`];
    
    if (!newName || !newName.trim()) {
      toast.error('Please enter a feature name');
      return;
    }
    
    const newCustomizations = { ...customizations };
    if (!newCustomizations.newFeatures[pillarId]) {
      newCustomizations.newFeatures[pillarId] = [];
    }
    newCustomizations.newFeatures[pillarId].push({
      name: newName.trim(),
      description: newDesc?.trim() || '',
      releaseDate: null,
      docs: null
    });
    setCustomizations(newCustomizations);
    setAddingFeature(null);
    toast.success('Feature added!');
  };

  const handleAddNextStep = (pillarId) => {
    setAddingNextStep(pillarId);
    setEditedContent({
      ...editedContent,
      [`new-nextstep-${pillarId}`]: ''
    });
  };

  const handleSaveAddedNextStep = (pillarId) => {
    const newText = editedContent[`new-nextstep-${pillarId}`];
    if (!newText || !newText.trim()) {
      toast.error('Please enter some text');
      return;
    }
    
    const newCustomizations = { ...customizations };
    if (!newCustomizations.newNextSteps[pillarId]) {
      newCustomizations.newNextSteps[pillarId] = [];
    }
    newCustomizations.newNextSteps[pillarId].push(newText.trim());
    setCustomizations(newCustomizations);
    setAddingNextStep(null);
    toast.success('Next step added!');
  };

  // Edit handlers for features and next steps
  const handleEditFeature = (pillarId, featureIndex, feature) => {
    const key = `${pillarId}-${featureIndex}`;
    setEditingFeature(key);
    setEditedContent({
      ...editedContent,
      [key]: {
        name: feature.name,
        description: feature.description,
        releaseDate: feature.releaseDate || '',
        docs: feature.docs || ''
      }
    });
  };

  const handleSaveFeature = (pillarId, featureIndex) => {
    const key = `${pillarId}-${featureIndex}`;
    setCustomizations({
      ...customizations,
      features: {
        ...customizations.features,
        [key]: editedContent[key]
      }
    });
    setEditingFeature(null);
    toast.success('Feature updated!');
  };

  const handleEditNextStep = (pillarId, stepIndex, step) => {
    const key = `${pillarId}-${stepIndex}`;
    setEditingNextStep(key);
    setEditedContent({
      ...editedContent,
      [key]: step
    });
  };

  const handleSaveNextStep = (pillarId, stepIndex) => {
    const key = `${pillarId}-${stepIndex}`;
    setCustomizations({
      ...customizations,
      nextSteps: {
        ...customizations.nextSteps,
        [key]: editedContent[key]
      }
    });
    setEditingNextStep(null);
    toast.success('Next step updated!');
  };

  const handleEditTitle = (title) => {
    setEditedContent({ ...editedContent, title });
  };

  const handleSaveTitle = () => {
    setCustomizations({ ...customizations, title: editedContent.title });
    toast.success('Title updated!');
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (editMode) {
      toast.success('Edit mode disabled');
    } else {
      toast.success('Edit mode enabled - Click edit buttons to modify content');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ 
          minHeight: '60vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 600,
            color: '#1e293b'
          }}>
            Generating your maturity report...
          </div>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    console.error('[AssessmentResultsNew] Rendering error state:', error);
    return (
      <PageContainer>
        <div style={{ 
          minHeight: '60vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '20px',
          padding: '40px'
        }}>
          <FiAlertTriangle size={64} color="#ef4444" />
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e293b' }}>
            Unable to load results
          </div>
          <div style={{ color: '#64748b', textAlign: 'center', maxWidth: '500px' }}>
            {error}
          </div>
          <button 
            onClick={() => navigate('/assessments')}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              background: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Back to Assessments
          </button>
        </div>
      </PageContainer>
    );
  }

  if (!results || !results.data) {
    console.error('[AssessmentResultsNew] No results data available:', results);
    return (
      <PageContainer>
        <div style={{ 
          minHeight: '60vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '20px',
          padding: '40px'
        }}>
          <FiAlertTriangle size={64} color="#f59e0b" />
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e293b' }}>
            No results available
          </div>
          <div style={{ color: '#64748b', textAlign: 'center', maxWidth: '500px' }}>
            This assessment may not have been completed yet. Please complete the assessment questions first.
          </div>
          <button 
            onClick={() => navigate('/assessments')}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              background: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Back to Assessments
          </button>
        </div>
      </PageContainer>
    );
  }

  // 🔥 FIX: Extract resultsData FIRST before using it
  const resultsData = results?.data || results;
  
  // Calculate maturity levels from actual results data
  // 🔥 FIX: Default to Level 1 (Explore) if no responses, not Level 3!
  const hasAnyResponses = resultsData?.assessmentInfo?.questionsAnswered > 0;
  const currentMaturity = hasAnyResponses ? (resultsData?.overall?.currentScore || 1) : 1;
  const targetMaturity = hasAnyResponses ? (resultsData?.overall?.futureScore || 1) : 1;
  const improvementLevel = parseFloat((targetMaturity - currentMaturity).toFixed(1)); // 🔥 Round to 1 decimal place

  // Pillar data with icons
  const pillars = [
    { id: 'platform_governance', name: 'Platform & Governance', icon: '🧱' },
    { id: 'data_engineering', name: 'Data Engineering & Integration', icon: '📊' },
    { id: 'analytics_bi', name: 'Analytics & BI Modernization', icon: '📈' },
    { id: 'machine_learning', name: 'Machine Learning & MLOps', icon: '🤖' },
    { id: 'generative_ai', name: 'Generative AI & Agentic Capabilities', icon: '💡' },
    { id: 'operational_excellence', name: 'Operational Excellence & Adoption', icon: '⚙️' },
  ];

  // Phase colors for Strategic Roadmap
  const phaseColors = {
    phase1: {
      bgColor: '#fef3c7',
      borderColor: '#fbbf24',
      accentColor: '#f59e0b'
    },
    phase2: {
      bgColor: '#fed7aa',
      borderColor: '#fb923c',
      accentColor: '#ea580c'
    },
    phase3: {
      bgColor: '#d1fae5',
      borderColor: '#86efac',
      accentColor: '#10b981'
    }
  };
  
  // Get dynamic roadmap phases from API (with customization override)
  const getRoadmapPhases = () => {
    const resultsData = results?.data || results;
    const apiRoadmap = resultsData?.roadmap;
    
    console.log('[AssessmentResultsNew] API roadmap:', apiRoadmap);
    
    // Use dynamic roadmap from API if available
    if (apiRoadmap?.phases && Array.isArray(apiRoadmap.phases)) {
      return apiRoadmap.phases.map(phase => ({
        ...phase,
        ...phaseColors[phase.id],
        // Allow customization override
        items: customizations.phases[phase.id] || phase.items
      }));
    }
    
    // Fallback to default if API doesn't return roadmap
    console.log('[AssessmentResultsNew] No API roadmap, using default phases');
    return [
      {
        id: 'phase1',
        title: 'Phase 1: Foundation (0–3 months)',
        ...phaseColors.phase1,
        items: customizations.phases.phase1 || [
          'Implement Unity Catalog with initial RBAC roles',
          'Establish data quality monitoring and observability',
          'Launch initial governance enablement sessions'
        ]
      },
      {
        id: 'phase2',
        title: 'Phase 2: Scale (3–6 months)',
        ...phaseColors.phase2,
        items: customizations.phases.phase2 || [
          'Automate pipeline reliability tracking via DLT',
          'Integrate ML flow metrics with centralized dashboards',
          'Deploy first GenAI-enabled use case under governance'
        ]
      },
      {
        id: 'phase3',
        title: 'Phase 3: Optimize (6–12 months)',
        ...phaseColors.phase3,
        items: customizations.phases.phase3 || [
          'Formalize MLOps CI/CD for model deployment',
          'Expand GenAI use cases with RAG implementation',
          'Align data mesh principles with Unity Catalog'
        ]
      }
    ];
  };
  
  const roadmapPhases = getRoadmapPhases();

  // Get pillar-specific results
  const getPillarData = (pillarId) => {
    const resultsData = results?.data || results;
    
    console.log(`[AssessmentResultsNew] Getting data for pillar: ${pillarId}`);
    console.log(`[AssessmentResultsNew] categoryDetails:`, resultsData?.categoryDetails);
    console.log(`[AssessmentResultsNew] prioritizedActions:`, resultsData?.prioritizedActions);
    
    // Check if there's a customization for this pillar
    if (customizations.pillars[pillarId]) {
      console.log(`[AssessmentResultsNew] Using customized data for ${pillarId}`);
      return customizations.pillars[pillarId];
    }
    
    // categoryDetails is an object with pillar IDs as keys, not an array
    const pillarResults = resultsData?.categoryDetails?.[pillarId];
    console.log(`[AssessmentResultsNew] pillarResults for ${pillarId}:`, pillarResults);
    
    // prioritizedActions is an array, so use find
    // Backend uses 'area' field for pillar ID
    const prioritized = Array.isArray(resultsData?.prioritizedActions) 
      ? resultsData.prioritizedActions.find(pa => pa.area === pillarId || pa.pillar === pillarId || pa.pillarId === pillarId)
      : null;
    console.log(`[AssessmentResultsNew] prioritized for ${pillarId}:`, prioritized);
    if (prioritized) {
      console.log(`[AssessmentResultsNew] Found prioritized data with databricksFeatures:`, prioritized.databricksFeatures?.length || 0);
    }

    // FIX: Backend returns theGood/theBad in prioritizedActions array
    // prioritizedActions is the source of truth for pillar-specific good/bad/recommendations
    // NEW: Also includes databricksFeatures, quickWins, specificRecommendations
    const data = {
      theGood: prioritized?.theGood || [],  // Direct access from prioritizedActions
      theBad: prioritized?.theBad || [],    // Direct access from prioritizedActions
      recommendations: prioritized?.actions || [],  // Actions from prioritizedActions
      // NEW: Databricks-specific features
      databricksFeatures: prioritized?.databricksFeatures || [],
      quickWins: prioritized?.quickWins || [],
      strategicMoves: prioritized?.strategicMoves || [],
      specificRecommendations: prioritized?.specificRecommendations || [],
      nextLevelFeatures: prioritized?.nextLevelFeatures || [],
      databricksSource: prioritized?._source || null,
      databricksDocsUrl: prioritized?._docsUrl || null
    };
    
    console.log(`[AssessmentResultsNew] Final data for ${pillarId}:`, data);
    console.log(`[AssessmentResultsNew] Databricks features for ${pillarId}:`, data.databricksFeatures?.length || 0);
    return data;
  };

  // 🔥 resultsData already declared at top - removed duplicate
  console.log('[AssessmentResultsNew] Rendering with resultsData:', resultsData);
  console.log('[AssessmentResultsNew] resultsData keys:', resultsData ? Object.keys(resultsData) : 'null');
  console.log('[AssessmentResultsNew] categoryDetails keys:', resultsData?.categoryDetails ? Object.keys(resultsData.categoryDetails) : 'null');
  console.log('[AssessmentResultsNew] prioritizedActions length:', Array.isArray(resultsData?.prioritizedActions) ? resultsData.prioritizedActions.length : 'not an array');

  // Check if data looks generic/stale
  const hasGenericContent = () => {
    if (!resultsData?.prioritizedActions) return false;
    
    const genericPhrases = [
      'Strengthen Security Posture',
      'Enhance Monitoring and Observability',
      'Simplify Integration Architecture',
      'Clear assessment of current capabilities',
      'Defined target state at Level'
    ];
    
    return resultsData.prioritizedActions.some(action => {
      const hasGenericGood = action.theGood?.some(item => 
        genericPhrases.some(phrase => item.includes(phrase))
      );
      return hasGenericGood;
    });
  };
  
  const showStaleDataWarning = hasGenericContent();

  return (
    <PageContainer>
      <ReportContainer>
        {/* Stale Data Warning */}
        {showStaleDataWarning && (
          <div style={{
            background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
            color: '#6b7280',
            padding: '20px 24px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
          }}>
            <FiAlertTriangle size={32} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '6px' }}>
                ⚠️ You're viewing old cached data with generic content
              </div>
              <div style={{ fontSize: '0.938rem', opacity: 0.95 }}>
                Click the green "Refresh Results" button below to regenerate with YOUR dynamic Databricks recommendations!
              </div>
            </div>
            <button
              onClick={handleRefresh}
              style={{
                background: 'white',
                color: '#ff6b35',
                border: '1px solid #d1d5db',
                padding: '12px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.938rem',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}
            >
              Refresh Now →
            </button>
          </div>
        )}
        
        {/* Header */}
        <ReportHeader>
          <HeaderTop>
            <TitleSection>
              <h1>Enterprise Data & AI Maturity Report</h1>
              <div className="subtitle">
                Prepared for {resultsData?.assessmentInfo?.organizationName || 'Your Organization'} | {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </TitleSection>
            <ActionButtons>
              <ActionButton
                onClick={handleRefresh}
                disabled={refreshing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <FiRefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </ActionButton>
              <ActionButton
                onClick={() => navigate(`/assessment/${assessmentId}/platform_governance`)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              >
                <FiEdit3 size={16} />
                Edit Assessment
              </ActionButton>
              <ActionButton
                onClick={handlePrint}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiPrinter size={16} />
                Print Report
              </ActionButton>
              <ActionButton
                onClick={handleExportExcel}
                disabled={exporting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiDownload size={16} />
                Export Excel
              </ActionButton>
            </ActionButtons>
          </HeaderTop>

          <MaturityOverview>
            <MaturityCard $iconBg="rgba(59, 130, 246, 0.3)">
              <div className="icon">
                <FiTarget size={24} />
              </div>
              <div className="label">Current Maturity</div>
              <div className="value">
                Level {currentMaturity} — {resultsData?.maturitySummary?.current?.level || 'Defined'}
              </div>
              <div className="description">
                {resultsData?.maturitySummary?.current?.description || 
                 'Standardized processes across key domains, limited automation.'}
              </div>
            </MaturityCard>

            <MaturityCard $iconBg="rgba(16, 185, 129, 0.3)">
              <div className="icon">
                <FiTrendingUp size={24} />
              </div>
              <div className="label">Target Maturity</div>
              <div className="value">
                Level {targetMaturity} — {resultsData?.maturitySummary?.target?.level || 'Managed'}
              </div>
              <div className="description">
                {resultsData?.maturitySummary?.target?.description || 
                 'Governed, measurable maturity with continuous optimization.'}
              </div>
            </MaturityCard>

            <MaturityCard $iconBg="rgba(245, 158, 11, 0.3)">
              <div className="icon">
                <FiZap size={24} />
              </div>
              <div className="label">Improvement Potential</div>
              <div className="value">
                +{improvementLevel} Level
              </div>
              <div className="description">
                {resultsData?.maturitySummary?.improvement?.description || 
                 'Achievable through automation, governance integration, and AI enablement.'}
              </div>
            </MaturityCard>
          </MaturityOverview>
        </ReportHeader>

        {/* Body */}
        <ReportBody>
          {/* Maturity Roadmap Visualization */}
          <MaturityChart>
            <MaturityChartTitle>
              <FiTrendingUp style={{ color: '#10b981' }} />
              Maturity Snapshot by Pillar
            </MaturityChartTitle>
            
            <MaturityLegend>
              <LegendItem>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: '#3b82f6', border: '2px solid #3b82f6' }} />
                <span>Today</span>
              </LegendItem>
              <LegendItem>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: 'transparent', border: '2px solid #3b82f6' }} />
                <span>Tomorrow</span>
              </LegendItem>
            </MaturityLegend>
            
            <CompactMaturityGrid>
              {pillars.map((pillar) => {
                const pillarScores = resultsData?.categoryDetails?.[pillar.id] || {};
                const currentScore = (pillarScores.currentScore || 0).toFixed(1);
                const futureScore = (pillarScores.futureScore || pillarScores.currentScore || 0).toFixed(1);
                
                const color = 
                  pillar.id === 'platform_governance' ? '#3b82f6' :
                  pillar.id === 'data_engineering' ? '#ef4444' :
                  pillar.id === 'analytics_bi' ? '#10b981' :
                  pillar.id === 'machine_learning' ? '#f59e0b' :
                  pillar.id === 'generative_ai' ? '#8b5cf6' :
                  '#06b6d4';
                
                return (
                  <MaturityPillarSection key={pillar.id} $color={color}>
                    <MaturityPillarTitle $color={color}>
                      <span className="pillar-icon">{pillar.icon}</span>
                      <span className="pillar-name">{pillar.name}</span>
                    </MaturityPillarTitle>
                    
                    <ScoresContainer>
                      <ScoreGroup>
                        <ScoreLabel>Today</ScoreLabel>
                        <ScoreBadge $color={color} $current>
                          {currentScore}
                        </ScoreBadge>
                      </ScoreGroup>
                      <ScoreGroup>
                        <ScoreLabel>Tomorrow</ScoreLabel>
                        <ScoreBadge $color={color}>
                          {futureScore}
                        </ScoreBadge>
                      </ScoreGroup>
                    </ScoresContainer>
                  </MaturityPillarSection>
                );
              })}
            </CompactMaturityGrid>
          </MaturityChart>
          
          {/* Pillar-by-Pillar Assessment */}
          <SectionTitle>Pillar-by-Pillar Assessment</SectionTitle>

          {pillars.map((pillar, index) => {
            const data = getPillarData(pillar.id);
            
            // Get pillar color
            const pillarColor = 
              pillar.id === 'platform_governance' ? '#3b82f6' :
              pillar.id === 'data_engineering' ? '#ef4444' :
              pillar.id === 'analytics_bi' ? '#10b981' :
              pillar.id === 'machine_learning' ? '#f59e0b' :
              pillar.id === 'generative_ai' ? '#8b5cf6' :
              '#06b6d4';
            
            // Get dimensions from results data (PRIMARY SOURCE - always available)
            let dimensions = [];
            
            // First, try to get from results data
            if (resultsData?.categoryDetails?.[pillar.id]?.dimensions) {
              const dimensionsObj = resultsData.categoryDetails[pillar.id].dimensions;
              const dimensionKeys = Object.keys(dimensionsObj);
              
              // Try to get proper names from framework if available
              if (framework?.data?.assessmentAreas) {
                const pillarFramework = framework.data.assessmentAreas.find(area => area.id === pillar.id);
                if (pillarFramework?.dimensions) {
                  dimensions = pillarFramework.dimensions.map(dim => ({
                    id: dim.id,
                    title: dim.name || dim.title || dim.id
                  }));
                }
              }
              
              // Fallback to generating titles from dimension IDs
              if (dimensions.length === 0) {
                dimensions = dimensionKeys.map(dimId => ({
                  id: dimId,
                  title: dimId.split('_').map(word => {
                    // Keep ML and AI in uppercase
                    if (word.toLowerCase() === 'ml' || word.toLowerCase() === 'ai') {
                      return word.toUpperCase();
                    }
                    return word.charAt(0).toUpperCase() + word.slice(1);
                  }).join(' ')
                }));
              }
            }
            
            return (
              <PillarSection
                key={pillar.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <PillarHeader>
                  <div className="pillar-info">
                    <span className="pillar-icon">{pillar.icon}</span>
                    <h3>{pillar.name}</h3>
                  </div>
                  <div className="pillar-actions">
                    {editingPillar === pillar.id ? (
                      <>
                        <EditActionButton 
                          $variant="success"
                          onClick={() => handleSavePillar(pillar.id)}
                          title="Save"
                        >
                          <FiSave size={14} />
                        </EditActionButton>
                        <EditActionButton 
                          onClick={handleCancelPillarEdit}
                          title="Cancel"
                        >
                          <FiX size={14} />
                        </EditActionButton>
                      </>
                    ) : (
                      <>
                        <EditActionButton 
                          onClick={() => handleEditPillar(pillar.id, data)}
                          title="Edit"
                        >
                          <FiEdit3 size={14} />
                        </EditActionButton>
                        {customizations.pillars[pillar.id] && (
                          <EditActionButton 
                            $variant="danger"
                            onClick={() => handleRemovePillarCustomization(pillar.id)}
                            title="Remove customization"
                          >
                            <FiTrash2 size={14} />
                          </EditActionButton>
                        )}
                      </>
                    )}
                  </div>
                </PillarHeader>
                
                {/* Dimension Maturity Chart */}
                {dimensions.length > 0 && (
                  <PillarMaturityChart>
                    <MaturityLevelsHeader>
                      <div></div>
                      <MaturityLevelsScale>
                        <MaturityLevel>1. Initial</MaturityLevel>
                        <MaturityLevel>2. Managed</MaturityLevel>
                        <MaturityLevel>3. Defined</MaturityLevel>
                        <MaturityLevel>4. Quantified</MaturityLevel>
                        <MaturityLevel>5. Optimized</MaturityLevel>
                      </MaturityLevelsScale>
                    </MaturityLevelsHeader>
                    
                    {dimensions.map((dimension, dimIdx) => {
                      const dimensionScores = resultsData?.categoryDetails?.[pillar.id]?.dimensions?.[dimension.id] || {};
                      const currentScore = (dimensionScores.currentScore || 0).toFixed(1);
                      const futureScore = (dimensionScores.futureScore || dimensionScores.currentScore || 0).toFixed(1);
                      const currentScoreNum = parseFloat(currentScore);
                      const futureScoreNum = parseFloat(futureScore);
                      
                      return (
                        <DimensionMaturityRow key={dimIdx}>
                          <DimensionLabel $borderColor={pillarColor}>
                            {dimension.title}
                          </DimensionLabel>
                          <MaturityBarsContainer>
                            <MaturityBar $color={pillarColor} $score={currentScoreNum} $isCurrent>
                              <BarLabel $isCurrent>Today</BarLabel>
                              <ScoreValue $isCurrent>{currentScore}</ScoreValue>
                            </MaturityBar>
                            <MaturityBar $color={pillarColor} $score={futureScoreNum}>
                              <BarLabel>Tomorrow</BarLabel>
                              <ScoreValue>{futureScore}</ScoreValue>
                            </MaturityBar>
                          </MaturityBarsContainer>
                        </DimensionMaturityRow>
                      );
                    })}
                  </PillarMaturityChart>
                )}
                
                {editingPillar === pillar.id ? (
                  <PillarBody style={{ display: 'block' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiCheckCircle /> What's Working (one per line):
                      </label>
                      <EditableTextarea
                        value={editedContent.theGood || ''}
                        onChange={(e) => setEditedContent({ ...editedContent, theGood: e.target.value })}
                        placeholder="Enter strengths and in-progress initiatives, one per line..."
                      />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiAlertTriangle /> Key Challenges (one per line):
                      </label>
                      <EditableTextarea
                        value={editedContent.theBad || ''}
                        onChange={(e) => setEditedContent({ ...editedContent, theBad: e.target.value })}
                        placeholder="Enter needs and gaps, one per line..."
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiInfo /> Databricks Recommendations (one per line):
                      </label>
                      <EditableTextarea
                        value={editedContent.recommendations || ''}
                        onChange={(e) => setEditedContent({ ...editedContent, recommendations: e.target.value })}
                        placeholder="Enter Databricks recommendations, one per line..."
                      />
                    </div>
                  </PillarBody>
                ) : (
                  <PillarBody>
                    {/* Top Row: What's Working and Key Challenges */}
                    <PillarTopRow>
                      {/* What's Working - Premium Card Style */}
                      <div style={{ 
                        background: customizations.cardColors[`good-${pillar.id}`]?.bg || '#ffffff',
                        borderRadius: '16px',
                        padding: '24px',
                        border: `2px solid ${customizations.cardColors[`good-${pillar.id}`]?.border || '#e5e7eb'}`
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          marginBottom: '16px',
                          color: customizations.cardColors[`good-${pillar.id}`]?.text || '#166534',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiCheckCircle size={20} />
                            What's Working
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={() => handleCardColorChange(`good-${pillar.id}`, 'bg')}
                              style={{
                                background: 'transparent',
                                color: customizations.cardColors[`good-${pillar.id}`]?.text || '#166534',
                                border: `1px solid ${customizations.cardColors[`good-${pillar.id}`]?.border || '#bbf7d0'}`,
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                              }}
                              title="Change card color"
                              onMouseEnter={(e) => e.currentTarget.style.background = (customizations.cardColors[`good-${pillar.id}`]?.border || '#bbf7d0')}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <FiDroplet size={14} />
                            </button>
                            {customizations.cardColors[`good-${pillar.id}`] && (
                              <button
                                onClick={() => handleResetCardColor(`good-${pillar.id}`)}
                                style={{
                                  background: 'transparent',
                                  color: customizations.cardColors[`good-${pillar.id}`]?.text || '#166534',
                                  border: `1px solid ${customizations.cardColors[`good-${pillar.id}`]?.border || '#bbf7d0'}`,
                                  borderRadius: '50%',
                                  width: '28px',
                                  height: '28px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  fontSize: '1rem',
                                  transition: 'all 0.2s'
                                }}
                                title="Reset to original color"
                                onMouseEnter={(e) => e.currentTarget.style.background = (customizations.cardColors[`good-${pillar.id}`]?.border || '#bbf7d0')}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <FiRotateCcw size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => handleAddGoodItem(pillar.id)}
                              style={{
                                background: 'transparent',
                                color: '#6b7280',
                                border: '1px solid #d1d5db',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                lineHeight: '1'
                              }}
                              title="Add new item"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {data.theGood.length > 0 ? (
                            data.theGood.slice(0, 4).map((item, idx) => {
                              const itemKey = `${pillar.id}-${idx}`;
                              const isEditing = editingGoodItem === itemKey;
                              const displayText = customizations.goodItems[itemKey] !== undefined 
                                ? customizations.goodItems[itemKey] 
                                : item;
                              
                              // Skip deleted items
                              if (customizations.goodItems[itemKey] === null) {
                                return null;
                              }
                              
                              return (
                              <div key={idx} style={{ 
                                background: 'white',
                                border: `1px solid ${isEditing ? '#22c55e' : '#bbf7d0'}`,
                                borderRadius: '10px',
                                padding: '12px 14px',
                                fontSize: '0.88rem',
                                color: '#15803d',
                                lineHeight: '1.6',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                if (!isEditing) {
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(34, 197, 94, 0.15)';
                                  e.currentTarget.style.borderColor = '#22c55e';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isEditing) {
                                  e.currentTarget.style.boxShadow = 'none';
                                  e.currentTarget.style.borderColor = '#bbf7d0';
                                }
                              }}>
                                <span style={{ 
                                  color: '#22c55e', 
                                  fontWeight: 700,
                                  fontSize: '1.1rem',
                                  lineHeight: '1',
                                  flexShrink: 0,
                                  marginTop: '2px'
                                }}>✓</span>
                                {isEditing ? (
                                  <textarea
                                    value={editedContent[itemKey] || ''}
                                    onChange={(e) => setEditedContent({
                                      ...editedContent,
                                      [itemKey]: e.target.value
                                    })}
                                    style={{
                                      flex: 1,
                                      border: '1px solid #22c55e',
                                      borderRadius: '6px',
                                      padding: '8px',
                                      fontSize: '0.88rem',
                                      fontFamily: 'inherit',
                                      resize: 'vertical',
                                      minHeight: '60px'
                                    }}
                                  />
                                ) : (
                                  <span style={{ flex: 1 }}>{displayText}</span>
                                )}
                                <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                                  {isEditing ? (
                                    <>
                                      <button
                                        onClick={() => handleSaveGoodItem(pillar.id, idx)}
                                        style={{
                                          padding: '4px 8px',
                                          fontSize: '0.75rem',
                                          background: 'transparent',
                                          color: '#6b7280',
                                          border: '1px solid #d1d5db',
                                          borderRadius: '4px',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingGoodItem(null)}
                                        style={{
                                          padding: '4px 8px',
                                          fontSize: '0.75rem',
                                          background: '#9ca3af',
                                          color: '#6b7280',
                                          border: '1px solid #d1d5db',
                                          borderRadius: '4px',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleEditGoodItem(pillar.id, idx, displayText)}
                                        style={{
                                          padding: '6px',
                                          fontSize: '0.75rem',
                                          background: 'transparent',
                                          color: '#6b7280',
                                          border: '1px solid #d1d5db',
                                          borderRadius: '4px',
                                          cursor: 'pointer'
                                        }}
                                      >
                                      <FiEdit3 size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteGoodItem(pillar.id, idx)}
                                        style={{
                                          padding: '6px',
                                          fontSize: '0.75rem',
                                          background: 'transparent',
                                          color: '#6b7280',
                                          border: '1px solid #d1d5db',
                                          borderRadius: '4px',
                                          cursor: 'pointer'
                                        }}
                                      >
                                      <FiTrash2 size={14} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )})
                          ) : (
                            <div style={{ 
                              padding: '12px', 
                              textAlign: 'center', 
                              color: '#6b7280',
                              fontSize: '0.85rem'
                            }}>
                              Complete assessment to see strengths
                            </div>
                          )}
                          
                          {/* Render newly added items */}
                          {customizations.newGoodItems[pillar.id] && customizations.newGoodItems[pillar.id].map((newItem, idx) => {
                            const itemKey = `${pillar.id}-new-${idx}`;
                            const isEditing = editingNewGoodItem === itemKey;
                            
                            return (
                            <div key={`new-${idx}`} style={{ 
                              background: 'white',
                              border: `1px solid ${isEditing ? '#22c55e' : '#bbf7d0'}`,
                              borderRadius: '10px',
                              padding: '12px 14px',
                              fontSize: '0.88rem',
                              color: '#15803d',
                              lineHeight: '1.6',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px'
                            }}>
                              <span style={{ 
                                color: '#22c55e', 
                                fontWeight: 700,
                                fontSize: '1.1rem',
                                lineHeight: '1',
                                flexShrink: 0,
                                marginTop: '2px'
                              }}>✓</span>
                              {isEditing ? (
                                <textarea
                                  value={editedContent[itemKey] || ''}
                                  onChange={(e) => setEditedContent({
                                    ...editedContent,
                                    [itemKey]: e.target.value
                                  })}
                                  style={{
                                    flex: 1,
                                    border: '1px solid #22c55e',
                                    borderRadius: '6px',
                                    padding: '8px',
                                    fontSize: '0.88rem',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    minHeight: '60px'
                                  }}
                                />
                              ) : (
                                <span style={{ flex: 1 }}>{newItem}</span>
                              )}
                              <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => handleSaveNewGoodItem(pillar.id, idx)}
                                      style={{
                                        padding: '4px 8px',
                                        fontSize: '0.75rem',
                                        background: 'transparent',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingNewGoodItem(null)}
                                      style={{
                                        padding: '4px 8px',
                                        fontSize: '0.75rem',
                                        background: '#9ca3af',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleEditNewGoodItem(pillar.id, idx, newItem)}
                                      style={{
                                        padding: '6px',
                                        fontSize: '0.75rem',
                                        background: 'transparent',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <FiEdit3 size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteNewGoodItem(pillar.id, idx)}
                                      style={{
                                        padding: '6px',
                                        fontSize: '0.75rem',
                                        background: 'transparent',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <FiTrash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                          )}
                          
                          {/* Form for adding new item */}
                          {addingGoodItem === pillar.id && (
                            <div style={{ 
                              background: 'white',
                              border: '2px solid #22c55e',
                              borderRadius: '10px',
                              padding: '12px 14px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px'
                            }}>
                              <textarea
                                value={editedContent[`new-good-${pillar.id}`] || ''}
                                onChange={(e) => setEditedContent({
                                  ...editedContent,
                                  [`new-good-${pillar.id}`]: e.target.value
                                })}
                                placeholder="Enter what's working well..."
                                style={{
                                  border: '1px solid #22c55e',
                                  borderRadius: '6px',
                                  padding: '8px',
                                  fontSize: '0.88rem',
                                  fontFamily: 'inherit',
                                  resize: 'vertical',
                                  minHeight: '60px'
                                }}
                                autoFocus
                              />
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => handleSaveAddedGoodItem(pillar.id)}
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '0.8rem',
                                    background: 'transparent',
                                    color: '#6b7280',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                  }}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setAddingGoodItem(null)}
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '0.8rem',
                                    background: '#9ca3af',
                                    color: '#6b7280',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Key Challenges - Premium Card Style */}
                      <div style={{ 
                        background: customizations.cardColors[`bad-${pillar.id}`]?.bg || '#ffffff',
                        borderRadius: '16px',
                        padding: '24px',
                        border: `2px solid ${customizations.cardColors[`bad-${pillar.id}`]?.border || '#e5e7eb'}`
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          marginBottom: '16px',
                          color: customizations.cardColors[`bad-${pillar.id}`]?.text || '#991b1b',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiAlertTriangle size={20} />
                            KEY CHALLENGES
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={() => handleCardColorChange(`bad-${pillar.id}`, 'bg')}
                              style={{
                                background: 'transparent',
                                color: customizations.cardColors[`bad-${pillar.id}`]?.text || '#991b1b',
                                border: `1px solid ${customizations.cardColors[`bad-${pillar.id}`]?.border || '#fecaca'}`,
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                              }}
                              title="Change card color"
                              onMouseEnter={(e) => e.currentTarget.style.background = (customizations.cardColors[`bad-${pillar.id}`]?.border || '#fecaca')}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <FiDroplet size={14} />
                            </button>
                            {customizations.cardColors[`bad-${pillar.id}`] && (
                              <button
                                onClick={() => handleResetCardColor(`bad-${pillar.id}`)}
                                style={{
                                  background: 'transparent',
                                  color: customizations.cardColors[`bad-${pillar.id}`]?.text || '#991b1b',
                                  border: `1px solid ${customizations.cardColors[`bad-${pillar.id}`]?.border || '#fecaca'}`,
                                  borderRadius: '50%',
                                  width: '28px',
                                  height: '28px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  fontSize: '1rem',
                                  transition: 'all 0.2s'
                                }}
                                title="Reset to original color"
                                onMouseEnter={(e) => e.currentTarget.style.background = (customizations.cardColors[`bad-${pillar.id}`]?.border || '#fecaca')}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <FiRotateCcw size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => handleAddBadItem(pillar.id)}
                              style={{
                                background: 'transparent',
                                color: '#6b7280',
                                border: '1px solid #d1d5db',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                lineHeight: '1'
                              }}
                              title="Add new challenge"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {data.theBad.length > 0 ? (
                            data.theBad.slice(0, 4).map((item, idx) => {
                              const itemKey = `${pillar.id}-${idx}`;
                              const isEditing = editingBadItem === itemKey;
                              const displayText = customizations.badItems[itemKey] !== undefined 
                                ? customizations.badItems[itemKey] 
                                : item;
                              
                              // Skip deleted items
                              if (customizations.badItems[itemKey] === null) {
                                return null;
                              }
                              
                              return (
                              <div key={idx} style={{ 
                                background: 'white',
                                border: `1px solid ${isEditing ? '#ef4444' : '#fecaca'}`,
                                borderRadius: '10px',
                                padding: '12px 14px',
                                fontSize: '0.88rem',
                                color: '#b91c1c',
                                lineHeight: '1.6',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                if (!isEditing) {
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.15)';
                                  e.currentTarget.style.borderColor = '#ef4444';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isEditing) {
                                  e.currentTarget.style.boxShadow = 'none';
                                  e.currentTarget.style.borderColor = '#fecaca';
                                }
                              }}>
                                <span style={{ 
                                  color: '#ef4444', 
                                  fontWeight: 700,
                                  fontSize: '1.1rem',
                                  lineHeight: '1',
                                  flexShrink: 0,
                                  marginTop: '2px'
                                }}>⚠</span>
                                {isEditing ? (
                                  <textarea
                                    value={editedContent[itemKey] || ''}
                                    onChange={(e) => setEditedContent({
                                      ...editedContent,
                                      [itemKey]: e.target.value
                                    })}
                                    style={{
                                      flex: 1,
                                      border: '1px solid #ef4444',
                                      borderRadius: '6px',
                                      padding: '8px',
                                      fontSize: '0.88rem',
                                      fontFamily: 'inherit',
                                      resize: 'vertical',
                                      minHeight: '60px'
                                    }}
                                  />
                                ) : (
                                  <span style={{ flex: 1 }}>{displayText}</span>
                                )}
                                <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                                  {isEditing ? (
                                    <>
                                      <button
                                        onClick={() => handleSaveBadItem(pillar.id, idx)}
                                        style={{
                                          padding: '4px 8px',
                                          fontSize: '0.75rem',
                                          background: 'transparent',
                                          color: '#6b7280',
                                          border: '1px solid #d1d5db',
                                          borderRadius: '4px',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingBadItem(null)}
                                        style={{
                                          padding: '4px 8px',
                                          fontSize: '0.75rem',
                                          background: '#9ca3af',
                                          color: '#6b7280',
                                          border: '1px solid #d1d5db',
                                          borderRadius: '4px',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleEditBadItem(pillar.id, idx, displayText)}
                                        style={{
                                          padding: '6px',
                                          background: 'transparent',
                                          color: '#6b7280',
                                          border: '1px solid #d1d5db',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                        title="Edit"
                                      >
                                        <FiEdit3 size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteBadItem(pillar.id, idx)}
                                        style={{
                                          padding: '6px',
                                          background: 'transparent',
                                          color: '#6b7280',
                                          border: '1px solid #d1d5db',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                        title="Delete"
                                      >
                                        <FiTrash2 size={14} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )})
                          ) : (
                            <div style={{ 
                              padding: '12px', 
                              textAlign: 'center', 
                              color: '#6b7280',
                              fontSize: '0.85rem'
                            }}>
                              Complete assessment to see gaps
                            </div>
                          )}
                          
                          {/* Render newly added items */}
                          {customizations.newBadItems[pillar.id] && customizations.newBadItems[pillar.id].map((newItem, idx) => {
                            const itemKey = `${pillar.id}-new-${idx}`;
                            const isEditing = editingNewBadItem === itemKey;
                            
                            return (
                            <div key={`new-${idx}`} style={{ 
                              background: 'white',
                              border: `1px solid ${isEditing ? '#ef4444' : '#fecaca'}`,
                              borderRadius: '10px',
                              padding: '12px 14px',
                              fontSize: '0.88rem',
                              color: '#991b1b',
                              lineHeight: '1.6',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px'
                            }}>
                              <span style={{ 
                                color: '#ef4444', 
                                fontWeight: 700,
                                fontSize: '1.1rem',
                                lineHeight: '1',
                                flexShrink: 0,
                                marginTop: '2px'
                              }}>⚠</span>
                              {isEditing ? (
                                <textarea
                                  value={editedContent[itemKey] || ''}
                                  onChange={(e) => setEditedContent({
                                    ...editedContent,
                                    [itemKey]: e.target.value
                                  })}
                                  style={{
                                    flex: 1,
                                    border: '1px solid #ef4444',
                                    borderRadius: '6px',
                                    padding: '8px',
                                    fontSize: '0.88rem',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    minHeight: '60px'
                                  }}
                                />
                              ) : (
                                <span style={{ flex: 1 }}>{newItem}</span>
                              )}
                              <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => handleSaveNewBadItem(pillar.id, idx)}
                                      style={{
                                        padding: '4px 8px',
                                        fontSize: '0.75rem',
                                        background: 'transparent',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingNewBadItem(null)}
                                      style={{
                                        padding: '4px 8px',
                                        fontSize: '0.75rem',
                                        background: '#9ca3af',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleEditNewBadItem(pillar.id, idx, newItem)}
                                      style={{
                                        padding: '6px',
                                        fontSize: '0.75rem',
                                        background: 'transparent',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <FiEdit3 size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteNewBadItem(pillar.id, idx)}
                                      style={{
                                        padding: '6px',
                                        fontSize: '0.75rem',
                                        background: 'transparent',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <FiTrash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                          )}
                          
                          {/* Form for adding new item */}
                          {addingBadItem === pillar.id && (
                            <div style={{ 
                              background: 'white',
                              border: '2px solid #ef4444',
                              borderRadius: '10px',
                              padding: '12px 14px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px'
                            }}>
                              <textarea
                                value={editedContent[`new-bad-${pillar.id}`] || ''}
                                onChange={(e) => setEditedContent({
                                  ...editedContent,
                                  [`new-bad-${pillar.id}`]: e.target.value
                                })}
                                placeholder="Enter a key challenge or gap..."
                                style={{
                                  border: '1px solid #ef4444',
                                  borderRadius: '6px',
                                  padding: '8px',
                                  fontSize: '0.88rem',
                                  fontFamily: 'inherit',
                                  resize: 'vertical',
                                  minHeight: '60px'
                                }}
                                autoFocus
                              />
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => handleSaveNewBadItem(pillar.id)}
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '0.8rem',
                                    background: 'transparent',
                                    color: '#6b7280',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                  }}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setAddingBadItem(null)}
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '0.8rem',
                                    background: '#9ca3af',
                                    color: '#6b7280',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </PillarTopRow>

                    {/* Full Width: Databricks Recommendations */}
                    <PillarFullWidth style={{
                      background: customizations.cardColors[`features-${pillar.id}`]?.bg || '#ffffff',
                      border: `2px solid ${customizations.cardColors[`features-${pillar.id}`]?.border || '#e5e7eb'}`
                    }}>
                  <PillarColumn $color={customizations.cardColors[`features-${pillar.id}`]?.text || "#1e40af"}>
                    <div className="column-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiInfo />
                        {data.databricksFeatures && data.databricksFeatures.length > 0 ? 'Databricks Recommendations' : 'Recommendations'}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => handleCardColorChange(`features-${pillar.id}`, 'bg')}
                          style={{
                            background: 'transparent',
                            color: customizations.cardColors[`features-${pillar.id}`]?.text || '#1e40af',
                            border: `1px solid ${customizations.cardColors[`features-${pillar.id}`]?.border || '#bfdbfe'}`,
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            transition: 'all 0.2s'
                          }}
                          title="Change card color"
                          onMouseEnter={(e) => e.currentTarget.style.background = (customizations.cardColors[`features-${pillar.id}`]?.border || '#bfdbfe')}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <FiDroplet size={14} />
                        </button>
                        {customizations.cardColors[`features-${pillar.id}`] && (
                          <button
                            onClick={() => handleResetCardColor(`features-${pillar.id}`)}
                            style={{
                              background: 'transparent',
                              color: customizations.cardColors[`features-${pillar.id}`]?.text || '#1e40af',
                              border: `1px solid ${customizations.cardColors[`features-${pillar.id}`]?.border || '#bfdbfe'}`,
                              borderRadius: '50%',
                              width: '28px',
                              height: '28px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              transition: 'all 0.2s'
                            }}
                            title="Reset to original color"
                            onMouseEnter={(e) => e.currentTarget.style.background = (customizations.cardColors[`features-${pillar.id}`]?.border || '#bfdbfe')}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <FiRotateCcw size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleAddFeature(pillar.id)}
                          style={{
                            background: 'transparent',
                            color: '#6b7280',
                            border: '1px solid #d1d5db',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            lineHeight: '1'
                          }}
                          title="Add new feature"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {data.databricksFeatures && data.databricksFeatures.length > 0 ? (
                      <div>
                        {/* Features Grid */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                          gap: '16px',
                          marginBottom: '20px'
                        }}>
                          {data.databricksFeatures.slice(0, 8).map((feature, idx) => {
                            const featureKey = `${pillar.id}-feature-${idx}`;
                            const isEditing = editingFeature === featureKey;
                            const displayFeature = customizations.features[featureKey] !== undefined 
                              ? customizations.features[featureKey] 
                              : feature;
                            
                            // Skip deleted items
                            if (customizations.features[featureKey] === null) {
                              return null;
                            }
                            
                            return (
                            <div key={idx} style={{ 
                              background: 'white',
                              border: `1px solid ${isEditing ? '#3b82f6' : '#bfdbfe'}`,
                              borderRadius: '12px',
                              padding: '16px',
                              transition: 'all 0.2s ease',
                              cursor: isEditing ? 'default' : 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              if (!isEditing) {
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                                e.currentTarget.style.borderColor = '#3b82f6';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isEditing) {
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = '#bfdbfe';
                              }
                            }}>
                              {isEditing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                  <input
                                    value={editedContent[`${featureKey}-name`] || ''}
                                    onChange={(e) => setEditedContent({
                                      ...editedContent,
                                      [`${featureKey}-name`]: e.target.value
                                    })}
                                    placeholder="Feature name"
                                    style={{
                                      fontWeight: 700,
                                      fontSize: '0.95rem',
                                      padding: '6px',
                                      border: '1px solid #3b82f6',
                                      borderRadius: '4px'
                                    }}
                                  />
                                  <textarea
                                    value={editedContent[`${featureKey}-desc`] || ''}
                                    onChange={(e) => setEditedContent({
                                      ...editedContent,
                                      [`${featureKey}-desc`]: e.target.value
                                    })}
                                    placeholder="Description"
                                    style={{
                                      fontSize: '0.8rem',
                                      padding: '6px',
                                      border: '1px solid #3b82f6',
                                      borderRadius: '4px',
                                      resize: 'vertical',
                                      minHeight: '60px',
                                      fontFamily: 'inherit'
                                    }}
                                  />
                                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                    <button
                                      onClick={() => {
                                        setCustomizations({
                                          ...customizations,
                                          features: {
                                            ...customizations.features,
                                            [featureKey]: {
                                              name: editedContent[`${featureKey}-name`],
                                              description: editedContent[`${featureKey}-desc`],
                                              releaseDate: feature.releaseDate,
                                              docs: feature.docs
                                            }
                                          }
                                        });
                                        setEditingFeature(null);
                                        toast.success('Feature saved!');
                                      }}
                                      style={{
                                        padding: '4px 12px',
                                        fontSize: '0.75rem',
                                        background: 'transparent',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingFeature(null)}
                                      style={{
                                        padding: '4px 12px',
                                        fontSize: '0.75rem',
                                        background: '#9ca3af',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div style={{ 
                                    fontWeight: 700, 
                                    color: '#1e40af', 
                                    marginBottom: '6px',
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '6px'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span style={{ fontSize: '1.1rem' }}>📦</span> {displayFeature.name}
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      <button
                                        onClick={() => {
                                          setEditingFeature(featureKey);
                                          setEditedContent({
                                            ...editedContent,
                                            [`${featureKey}-name`]: displayFeature.name,
                                            [`${featureKey}-desc`]: displayFeature.description
                                          });
                                        }}
                                        style={{
                                          padding: '6px',
                                          background: 'transparent',
                                          color: '#6b7280',
                                          border: '1px solid #d1d5db',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                        title="Edit"
                                      >
                                        <FiEdit3 size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteFeature(pillar.id, idx)}
                                        style={{
                                          padding: '6px',
                                          background: 'transparent',
                                          color: '#6b7280',
                                          border: '1px solid #d1d5db',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                        title="Delete"
                                      >
                                        <FiTrash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px', lineHeight: '1.4' }}>
                                    {displayFeature.description}
                                  </div>
                                  {/* 🔥 NEW: Show WHY this feature is recommended */}
                                  {displayFeature.reason && (
                                    <div style={{ 
                                      fontSize: '0.75rem', 
                                      color: '#f59e0b', 
                                      background: '#fef3c7',
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      marginBottom: '8px',
                                      fontStyle: 'italic',
                                      borderLeft: '3px solid #f59e0b'
                                    }}>
                                      <strong>Why recommended:</strong> {displayFeature.reason}
                                    </div>
                                  )}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
                                    {displayFeature.releaseDate && (
                                      <span style={{ color: '#10b981', fontWeight: 600 }}>
                                        {displayFeature.releaseDate}
                                      </span>
                                    )}
                                    {displayFeature.docs && (
                                      <a 
                                        href={displayFeature.docs} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}
                                      >
                                        📚 Docs →
                                      </a>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                          )}
                          
                          {/* Render newly added features */}
                          {customizations.newFeatures[pillar.id] && customizations.newFeatures[pillar.id].map((newFeature, idx) => {
                            const featureKey = `${pillar.id}-new-feature-${idx}`;
                            const isEditing = editingNewFeature === featureKey;
                            
                            return (
                            <div key={`new-${idx}`} style={{ 
                              background: 'white',
                              border: `2px solid ${isEditing ? '#3b82f6' : '#bfdbfe'}`,
                              borderRadius: '12px',
                              padding: '16px',
                              transition: 'all 0.2s ease'
                            }}>
                              {isEditing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  <input
                                    value={editedContent[`${featureKey}-name`] || ''}
                                    onChange={(e) => setEditedContent({
                                      ...editedContent,
                                      [`${featureKey}-name`]: e.target.value
                                    })}
                                    placeholder="Feature name"
                                    style={{
                                      fontWeight: 700,
                                      fontSize: '0.95rem',
                                      padding: '8px',
                                      border: '1px solid #3b82f6',
                                      borderRadius: '6px',
                                      fontFamily: 'inherit'
                                    }}
                                  />
                                  <textarea
                                    value={editedContent[`${featureKey}-desc`] || ''}
                                    onChange={(e) => setEditedContent({
                                      ...editedContent,
                                      [`${featureKey}-desc`]: e.target.value
                                    })}
                                    placeholder="Feature description"
                                    style={{
                                      fontSize: '0.85rem',
                                      padding: '8px',
                                      border: '1px solid #3b82f6',
                                      borderRadius: '6px',
                                      resize: 'vertical',
                                      minHeight: '60px',
                                      fontFamily: 'inherit'
                                    }}
                                  />
                                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                    <button
                                      onClick={() => handleSaveNewFeature(pillar.id, idx)}
                                      style={{
                                        padding: '6px 14px',
                                        fontSize: '0.8rem',
                                        background: 'transparent',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                      }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingNewFeature(null)}
                                      style={{
                                        padding: '6px 14px',
                                        fontSize: '0.8rem',
                                        background: '#9ca3af',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div style={{ 
                                    fontWeight: 700, 
                                    color: '#1e40af', 
                                    marginBottom: '6px',
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '6px'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span style={{ fontSize: '1.1rem' }}>📦</span> {newFeature.name}
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      <button
                                        onClick={() => handleEditNewFeature(pillar.id, idx, newFeature)}
                                        style={{
                                          padding: '3px 8px',
                                          fontSize: '0.7rem',
                                          background: 'transparent',
                                          color: '#6b7280',
                                          border: '1px solid #d1d5db',
                                          borderRadius: '4px',
                                          cursor: 'pointer'
                                        }}
                                      >
                                      <FiEdit3 size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteNewFeature(pillar.id, idx)}
                                        style={{
                                          padding: '3px 8px',
                                          fontSize: '0.7rem',
                                          background: 'transparent',
                                          color: '#6b7280',
                                          border: '1px solid #d1d5db',
                                          borderRadius: '4px',
                                          cursor: 'pointer'
                                        }}
                                      >
                                      <FiTrash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                  {newFeature.description && (
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>
                                      {newFeature.description}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                          )}
                          
                          {/* Form for adding new feature */}
                          {addingFeature === pillar.id && (
                            <div style={{ 
                              background: 'white',
                              border: '2px solid #3b82f6',
                              borderRadius: '12px',
                              padding: '16px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}>
                              <input
                                value={editedContent[`new-feature-${pillar.id}-name`] || ''}
                                onChange={(e) => setEditedContent({
                                  ...editedContent,
                                  [`new-feature-${pillar.id}-name`]: e.target.value
                                })}
                                placeholder="Feature name (e.g., Unity Catalog)"
                                style={{
                                  fontWeight: 700,
                                  fontSize: '0.95rem',
                                  padding: '8px',
                                  border: '1px solid #3b82f6',
                                  borderRadius: '6px',
                                  fontFamily: 'inherit'
                                }}
                                autoFocus
                              />
                              <textarea
                                value={editedContent[`new-feature-${pillar.id}-desc`] || ''}
                                onChange={(e) => setEditedContent({
                                  ...editedContent,
                                  [`new-feature-${pillar.id}-desc`]: e.target.value
                                })}
                                placeholder="Feature description (optional)"
                                style={{
                                  fontSize: '0.85rem',
                                  padding: '8px',
                                  border: '1px solid #3b82f6',
                                  borderRadius: '6px',
                                  resize: 'vertical',
                                  minHeight: '60px',
                                  fontFamily: 'inherit'
                                }}
                              />
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => handleSaveAddedFeature(pillar.id)}
                                  style={{
                                    padding: '6px 14px',
                                    fontSize: '0.8rem',
                                    background: 'transparent',
                                    color: '#6b7280',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                  }}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setAddingFeature(null)}
                                  style={{
                                    padding: '6px 14px',
                                    fontSize: '0.8rem',
                                    background: '#9ca3af',
                                    color: '#6b7280',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Detailed Technical Recommendations */}
                        {data.recommendations && data.recommendations.length > 0 && (
                          <div style={{ marginTop: '24px' }}>
                            <div style={{ 
                              fontSize: '0.9rem', 
                              fontWeight: 700, 
                              color: '#1e40af', 
                              marginBottom: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <span style={{ fontSize: '1.1rem' }}>💡</span> SME Recommendations
                            </div>
                            <ul style={{ 
                              listStyle: 'none', 
                              padding: 0, 
                              margin: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}>
                              {data.recommendations.map((item, idx) => (
                                <li key={idx} style={{ 
                                  background: 'white',
                                  padding: '16px',
                                  borderRadius: '8px',
                                  border: '1px solid #e5e7eb',
                                  fontSize: '0.85rem',
                                  lineHeight: '1.6',
                                  color: '#374151',
                                  fontFamily: 'monospace',
                                  position: 'relative',
                                  paddingLeft: '36px'
                                }}>
                                  <span style={{ 
                                    position: 'absolute',
                                    left: '12px',
                                    top: '16px',
                                    fontWeight: 700,
                                    color: '#3b82f6'
                                  }}>{idx + 1}.</span>
                                  {typeof item === 'string' ? item : item.action || item.title}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <ul>
                        {data.recommendations.length > 0 ? (
                          data.recommendations.slice(0, 4).map((item, idx) => (
                            <li key={idx}>{typeof item === 'string' ? item : item.action || item.title}</li>
                          ))
                        ) : (
                          <li>Complete assessment to see recommendations</li>
                        )}
                      </ul>
                    )}
                    {data.databricksSource && (
                      <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #e5e7eb', fontSize: '0.7rem', color: '#9ca3af', fontStyle: 'italic' }}>
                        Source: {data.databricksSource}
                      </div>
                    )}
                  </PillarColumn>
                    </PillarFullWidth>
                    
                    {/* Next Steps - Separate Card Below Recommendations */}
                    {((data.nextSteps && data.nextSteps.length > 0) || (data.specificRecommendations && data.specificRecommendations.length > 0)) && (
                      <div style={{ 
                        marginTop: '16px',
                        background: customizations.cardColors[`nextSteps-${pillar.id}`]?.bg || '#ffffff',
                        borderRadius: '16px',
                        padding: '24px',
                        border: `2px solid ${customizations.cardColors[`nextSteps-${pillar.id}`]?.border || '#e5e7eb'}`
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          marginBottom: '16px',
                          color: customizations.cardColors[`nextSteps-${pillar.id}`]?.text || '#92400e',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🎯</span>
                            Next Steps
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={() => handleCardColorChange(`nextSteps-${pillar.id}`, 'bg')}
                              style={{
                                background: 'transparent',
                                color: customizations.cardColors[`nextSteps-${pillar.id}`]?.text || '#92400e',
                                border: `1px solid ${customizations.cardColors[`nextSteps-${pillar.id}`]?.border || '#fcd34d'}`,
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                              }}
                              title="Change card color"
                              onMouseEnter={(e) => e.currentTarget.style.background = (customizations.cardColors[`nextSteps-${pillar.id}`]?.border || '#fcd34d')}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <FiDroplet size={14} />
                            </button>
                            {customizations.cardColors[`nextSteps-${pillar.id}`] && (
                              <button
                                onClick={() => handleResetCardColor(`nextSteps-${pillar.id}`)}
                                style={{
                                  background: 'transparent',
                                  color: customizations.cardColors[`nextSteps-${pillar.id}`]?.text || '#92400e',
                                  border: `1px solid ${customizations.cardColors[`nextSteps-${pillar.id}`]?.border || '#fcd34d'}`,
                                  borderRadius: '50%',
                                  width: '28px',
                                  height: '28px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  fontSize: '1rem',
                                  transition: 'all 0.2s'
                                }}
                                title="Reset to original color"
                                onMouseEnter={(e) => e.currentTarget.style.background = (customizations.cardColors[`nextSteps-${pillar.id}`]?.border || '#fcd34d')}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <FiRotateCcw size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => handleAddNextStep(pillar.id)}
                              style={{
                                background: 'transparent',
                                color: '#6b7280',
                                border: '1px solid #d1d5db',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                lineHeight: '1'
                              }}
                              title="Add new next step"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div style={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}>
                          {(data.nextSteps || data.specificRecommendations || []).slice(0, 4).map((rec, idx) => {
                            const stepKey = `${pillar.id}-${idx}`;
                            const isEditing = editingNextStep === stepKey;
                            const displayStep = customizations.nextSteps[stepKey] !== undefined 
                              ? customizations.nextSteps[stepKey] 
                              : rec;
                            
                            // Skip deleted items
                            if (customizations.nextSteps[stepKey] === null) {
                              return null;
                            }
                            
                            return (
                            <div key={idx} style={{ 
                              background: 'white',
                              border: `1px solid ${isEditing ? '#f59e0b' : '#fcd34d'}`,
                              borderRadius: '10px',
                              padding: '14px 16px',
                              fontSize: '0.87rem',
                              color: '#78350f',
                              lineHeight: '1.6',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '12px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (!isEditing) {
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(251, 191, 36, 0.2)';
                                e.currentTarget.style.borderColor = '#fbbf24';
                                e.currentTarget.style.transform = 'translateX(4px)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isEditing) {
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = '#fcd34d';
                                e.currentTarget.style.transform = 'translateX(0)';
                              }
                            }}>
                              <span style={{ 
                                color: '#f59e0b', 
                                fontWeight: 700,
                                fontSize: '1.3rem',
                                lineHeight: '1',
                                flexShrink: 0,
                                marginTop: '-2px'
                              }}>→</span>
                              {isEditing ? (
                                <textarea
                                  value={editedContent[stepKey] || ''}
                                  onChange={(e) => setEditedContent({
                                    ...editedContent,
                                    [stepKey]: e.target.value
                                  })}
                                  style={{
                                    flex: 1,
                                    border: '1px solid #f59e0b',
                                    borderRadius: '6px',
                                    padding: '8px',
                                    fontSize: '0.87rem',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    minHeight: '60px',
                                    color: '#78350f'
                                  }}
                                />
                              ) : (
                                <span style={{ flex: 1 }}>{displayStep}</span>
                              )}
                              <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto', flexShrink: 0 }}>
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setCustomizations({
                                          ...customizations,
                                          nextSteps: {
                                            ...customizations.nextSteps,
                                            [stepKey]: editedContent[stepKey]
                                          }
                                        });
                                        setEditingNextStep(null);
                                        toast.success('Next step saved!');
                                      }}
                                      style={{
                                        padding: '4px 8px',
                                        fontSize: '0.75rem',
                                        background: 'transparent',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingNextStep(null)}
                                      style={{
                                        padding: '4px 8px',
                                        fontSize: '0.75rem',
                                        background: '#9ca3af',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingNextStep(stepKey);
                                        setEditedContent({
                                          ...editedContent,
                                          [stepKey]: displayStep
                                        });
                                      }}
                                      style={{
                                        padding: '6px',
                                        background: 'transparent',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                      title="Edit"
                                    >
                                      <FiEdit3 size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteNextStep(pillar.id, idx)}
                                      style={{
                                        padding: '6px',
                                        background: 'transparent',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                      title="Delete"
                                    >
                                      <FiTrash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                          )}
                          
                          {/* Render newly added next steps */}
                          {customizations.newNextSteps[pillar.id] && customizations.newNextSteps[pillar.id].map((newStep, idx) => {
                            const stepKey = `${pillar.id}-new-step-${idx}`;
                            const isEditing = editingNewNextStep === stepKey;
                            
                            return (
                            <div key={`new-${idx}`} style={{ 
                              background: 'white',
                              border: `2px solid ${isEditing ? '#f59e0b' : '#fcd34d'}`,
                              borderRadius: '10px',
                              padding: '14px 16px',
                              fontSize: '0.87rem',
                              color: '#78350f',
                              lineHeight: '1.6',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '12px'
                            }}>
                              <span style={{ 
                                color: '#f59e0b', 
                                fontWeight: 700,
                                fontSize: '1.3rem',
                                lineHeight: '1',
                                flexShrink: 0,
                                marginTop: '-2px'
                              }}>→</span>
                              {isEditing ? (
                                <textarea
                                  value={editedContent[stepKey] || ''}
                                  onChange={(e) => setEditedContent({
                                    ...editedContent,
                                    [stepKey]: e.target.value
                                  })}
                                  style={{
                                    flex: 1,
                                    border: '1px solid #f59e0b',
                                    borderRadius: '6px',
                                    padding: '8px',
                                    fontSize: '0.87rem',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    minHeight: '60px'
                                  }}
                                />
                              ) : (
                                <span style={{ flex: 1 }}>{newStep}</span>
                              )}
                              <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => handleSaveNewNextStep(pillar.id, idx)}
                                      style={{
                                        padding: '4px 8px',
                                        fontSize: '0.75rem',
                                        background: 'transparent',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                      }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingNewNextStep(null)}
                                      style={{
                                        padding: '4px 8px',
                                        fontSize: '0.75rem',
                                        background: '#9ca3af',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleEditNewNextStep(pillar.id, idx, newStep)}
                                      style={{
                                        padding: '6px',
                                        fontSize: '0.75rem',
                                        background: 'transparent',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <FiEdit3 size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteNewNextStep(pillar.id, idx)}
                                      style={{
                                        padding: '6px',
                                        fontSize: '0.75rem',
                                        background: 'transparent',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <FiTrash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                          )}
                          
                          {/* Form for adding new next step */}
                          {addingNextStep === pillar.id && (
                            <div style={{ 
                              background: 'white',
                              border: '2px solid #f59e0b',
                              borderRadius: '10px',
                              padding: '14px 16px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px'
                            }}>
                              <textarea
                                value={editedContent[`new-nextstep-${pillar.id}`] || ''}
                                onChange={(e) => setEditedContent({
                                  ...editedContent,
                                  [`new-nextstep-${pillar.id}`]: e.target.value
                                })}
                                placeholder="Enter a next step or action item..."
                                style={{
                                  border: '1px solid #f59e0b',
                                  borderRadius: '6px',
                                  padding: '8px',
                                  fontSize: '0.87rem',
                                  fontFamily: 'inherit',
                                  resize: 'vertical',
                                  minHeight: '60px',
                                  color: '#78350f'
                                }}
                                autoFocus
                              />
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => handleSaveAddedNextStep(pillar.id)}
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '0.8rem',
                                    background: 'transparent',
                                    color: '#6b7280',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                  }}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setAddingNextStep(null)}
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '0.8rem',
                                    background: '#9ca3af',
                                    color: '#6b7280',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </PillarBody>
                )}
              </PillarSection>
            );
          })}

          {/* Strategic Roadmap */}
          <RoadmapSection>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <SectionTitle style={{ marginBottom: 0 }}>Strategic Roadmap & Next Steps</SectionTitle>
              <button
                onClick={() => alert('Add new phase functionality - coming soon! Each phase already has individual edit buttons.')}
                style={{
                  background: '#10b981',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  lineHeight: '1'
                }}
                title="Add new phase"
              >
                +
              </button>
            </div>
            <p style={{ fontSize: '1rem', color: '#64748b', marginBottom: '32px', lineHeight: 1.6 }}>
              {resultsData?.roadmap?.roadmapIntro || 
               resultsData?.maturitySummary?.roadmapIntro || 
               'This roadmap outlines short-, mid-, and long-term priorities across each pillar to achieve targeted maturity improvements.'}
            </p>

            <RoadmapPhases>
              {roadmapPhases.map((phase, index) => {
                const isEditing = editingPhase === phase.id;
                
                return (
                  <PhaseCard
                    key={phase.id}
                    $bgColor={phase.bgColor}
                    $borderColor={phase.borderColor}
                    $accentColor={phase.accentColor}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className="phase-header-container">
                      <div className="phase-header">{phase.title}</div>
                      <div className="phase-actions">
                        {isEditing ? (
                          <>
                            <EditActionButton 
                              $variant="success"
                              onClick={() => handleSavePhase(phase.id)}
                            >
                              <FiSave size={12} />
                            </EditActionButton>
                            <EditActionButton 
                              onClick={handleCancelPhaseEdit}
                            >
                              <FiX size={12} />
                            </EditActionButton>
                          </>
                        ) : (
                          <>
                            <EditActionButton 
                              onClick={() => handleEditPhase(phase.id, phase.items)}
                            >
                              <FiEdit3 size={12} />
                            </EditActionButton>
                            {customizations.phases[phase.id] && (
                              <EditActionButton 
                                $variant="danger"
                                onClick={() => handleRemovePhaseCustomization(phase.id)}
                              >
                                <FiTrash2 size={12} />
                              </EditActionButton>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    {isEditing ? (
                      <EditableTextarea
                        value={editedContent.items || ''}
                        onChange={(e) => setEditedContent({ items: e.target.value })}
                        placeholder="Enter action items, one per line..."
                        style={{ minHeight: '120px' }}
                      />
                    ) : (
                      <ul>
                        {phase.items.map((item, idx) => {
                          const itemKey = `${phase.id}-item-${idx}`;
                          const isEditingItem = editingPhaseItem === itemKey;
                          
                          return (
                            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                              <div style={{ flex: 1 }}>
                                {isEditingItem ? (
                                  <textarea
                                    value={editedContent.itemText || ''}
                                    onChange={(e) => setEditedContent({ itemText: e.target.value })}
                                    style={{
                                      width: '100%',
                                      padding: '8px',
                                      border: '2px solid #3b82f6',
                                      borderRadius: '6px',
                                      resize: 'vertical',
                                      minHeight: '60px',
                                      fontFamily: 'inherit',
                                      fontSize: '0.95rem'
                                    }}
                                    autoFocus
                                  />
                                ) : (
                                  item
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                {isEditingItem ? (
                                  <>
                                    <button
                                      onClick={() => handleSavePhaseItem(phase.id, idx)}
                                      style={{
                                        padding: '4px 8px',
                                        fontSize: '0.75rem',
                                        background: '#10b981',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                      }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingPhaseItem(null)}
                                      style={{
                                        padding: '4px 8px',
                                        fontSize: '0.75rem',
                                        background: '#9ca3af',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleEditPhaseItem(phase.id, idx, item)}
                                      style={{
                                        padding: '6px',
                                        fontSize: '0.75rem',
                                        background: 'transparent',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                      title="Edit item"
                                    >
                                      <FiEdit3 size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeletePhaseItem(phase.id, idx)}
                                      style={{
                                        padding: '6px',
                                        fontSize: '0.75rem',
                                        background: 'transparent',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                      title="Delete item"
                                    >
                                      <FiTrash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </PhaseCard>
                );
              })}
            </RoadmapPhases>
          </RoadmapSection>

          {/* Expected Business Impact */}
          <ImpactSection>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <SectionTitle style={{ marginBottom: 0 }}>Expected Business Impact</SectionTitle>
              <button
                onClick={handleAddImpactMetric}
                style={{
                  background: 'transparent',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  lineHeight: '1'
                }}
                title="Add new impact metric"
              >
                +
              </button>
            </div>
            <ImpactMetrics>
              {/* Dynamically render all impact metrics from businessImpact */}
              {resultsData?.businessImpact && Object.entries(resultsData.businessImpact).map(([metricKey, metricData], index) => {
                const isEditing = editingImpactMetric === metricKey;
                const metric = customizations.impactMetrics[metricKey] || metricData || { value: 'N/A', label: 'Impact metric', drivers: [] };
                
                // Skip if deleted
                if (customizations.impactMetrics[metricKey] === null) {
                  return null;
                }
                
                return (
                  <MetricCard
                    key={metricKey}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    style={{ position: 'relative', border: isEditing ? '2px solid #3b82f6' : undefined }}
                  >
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input
                          value={editedContent[`${metricKey}-value`] || ''}
                          onChange={(e) => setEditedContent({ ...editedContent, [`${metricKey}-value`]: e.target.value })}
                          placeholder="Value (e.g., 2.8× or 15%)"
                          style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            padding: '8px',
                            border: '1px solid #3b82f6',
                            borderRadius: '6px'
                          }}
                        />
                        <textarea
                          value={editedContent[`${metricKey}-label`] || ''}
                          onChange={(e) => setEditedContent({ ...editedContent, [`${metricKey}-label`]: e.target.value })}
                          placeholder="Label/Description"
                          style={{
                            fontSize: '0.9rem',
                            padding: '8px',
                            border: '1px solid #3b82f6',
                            borderRadius: '6px',
                            resize: 'vertical',
                            minHeight: '60px',
                            fontFamily: 'inherit'
                          }}
                        />
                        <input
                          value={editedContent[`${metricKey}-drivers`] || ''}
                          onChange={(e) => setEditedContent({ ...editedContent, [`${metricKey}-drivers`]: e.target.value })}
                          placeholder="Key drivers (comma-separated)"
                          style={{
                            fontSize: '0.75rem',
                            padding: '6px',
                            border: '1px solid #3b82f6',
                            borderRadius: '6px'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleSaveImpactMetric(metricKey)}
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.8rem',
                              background: 'transparent',
                              color: '#6b7280',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingImpactMetric(null)}
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.8rem',
                              background: '#9ca3af',
                              color: '#6b7280',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleEditImpactMetric(metricKey, metric)}
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              background: 'transparent',
                              color: '#6b7280',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                                      <FiEdit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteImpactMetric(metricKey)}
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              background: 'transparent',
                              color: '#6b7280',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                                      <FiTrash2 size={14} />
                          </button>
                        </div>
                        <div className="metric-value">{metric.value}</div>
                        <div className="metric-label">{metric.label}</div>
                        {metric.drivers && metric.drivers.length > 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px', fontStyle: 'italic' }}>
                            Key drivers: {metric.drivers.join(', ')}
                          </div>
                        )}
                      </>
                    )}
                  </MetricCard>
                );
              })}
              
              {/* All metrics now dynamically generated from businessImpact data */}
              
              {/* Render newly added metrics */}
              {customizations.newImpactMetrics && customizations.newImpactMetrics.map((newMetric, idx) => {
                const metricKey = `new-metric-${idx}`;
                const isEditing = editingImpactMetric === metricKey;
                
                return (
                <MetricCard
                  key={`new-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                  style={{ position: 'relative', border: isEditing ? '2px solid #3b82f6' : undefined }}
                >
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input
                        value={editedContent[`${metricKey}-value`] || ''}
                        onChange={(e) => setEditedContent({ ...editedContent, [`${metricKey}-value`]: e.target.value })}
                        placeholder="Value (e.g., 2.8× or 15%)"
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          padding: '8px',
                          border: '1px solid #3b82f6',
                          borderRadius: '6px'
                        }}
                      />
                      <textarea
                        value={editedContent[`${metricKey}-label`] || ''}
                        onChange={(e) => setEditedContent({ ...editedContent, [`${metricKey}-label`]: e.target.value })}
                        placeholder="Label/Description"
                        style={{
                          fontSize: '0.9rem',
                          padding: '8px',
                          border: '1px solid #3b82f6',
                          borderRadius: '6px',
                          resize: 'vertical',
                          minHeight: '60px',
                          fontFamily: 'inherit'
                        }}
                      />
                      <input
                        value={editedContent[`${metricKey}-drivers`] || ''}
                        onChange={(e) => setEditedContent({ ...editedContent, [`${metricKey}-drivers`]: e.target.value })}
                        placeholder="Key drivers (comma-separated)"
                        style={{
                          fontSize: '0.75rem',
                          padding: '6px',
                          border: '1px solid #3b82f6',
                          borderRadius: '6px'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleSaveEditedNewImpactMetric(idx)}
                          style={{
                            padding: '6px 14px',
                            fontSize: '0.8rem',
                            background: 'transparent',
                            color: '#6b7280',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingImpactMetric(null)}
                          style={{
                            padding: '6px 14px',
                            fontSize: '0.8rem',
                            background: '#9ca3af',
                            color: '#6b7280',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleEditNewImpactMetric(idx, newMetric)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            background: 'transparent',
                            color: '#6b7280',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                                      <FiEdit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteNewImpactMetric(idx)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            background: 'transparent',
                            color: '#6b7280',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                                      <FiTrash2 size={14} />
                        </button>
                      </div>
                      <div className="metric-value">{newMetric.value}</div>
                      <div className="metric-label">{newMetric.label}</div>
                      {newMetric.drivers && newMetric.drivers.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px', fontStyle: 'italic' }}>
                          Key drivers: {newMetric.drivers.join(', ')}
                        </div>
                      )}
                    </>
                  )}
                </MetricCard>
              )}
              )}
              
              {/* Form for adding new metric */}
              {addingImpactMetric && (
                <MetricCard
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  style={{ border: '2px solid #3b82f6' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                      value={editedContent['new-metric-value'] || ''}
                      onChange={(e) => setEditedContent({ ...editedContent, 'new-metric-value': e.target.value })}
                      placeholder="Value (e.g., 2.8× or 15%)"
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        padding: '8px',
                        border: '1px solid #3b82f6',
                        borderRadius: '6px'
                      }}
                      autoFocus
                    />
                    <textarea
                      value={editedContent['new-metric-label'] || ''}
                      onChange={(e) => setEditedContent({ ...editedContent, 'new-metric-label': e.target.value })}
                      placeholder="Label/Description"
                      style={{
                        fontSize: '0.9rem',
                        padding: '8px',
                        border: '1px solid #3b82f6',
                        borderRadius: '6px',
                        resize: 'vertical',
                        minHeight: '60px',
                        fontFamily: 'inherit'
                      }}
                    />
                    <input
                      value={editedContent['new-metric-drivers'] || ''}
                      onChange={(e) => setEditedContent({ ...editedContent, 'new-metric-drivers': e.target.value })}
                      placeholder="Key drivers (comma-separated, optional)"
                      style={{
                        fontSize: '0.75rem',
                        padding: '6px',
                        border: '1px solid #3b82f6',
                        borderRadius: '6px'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={handleSaveNewImpactMetric}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          background: 'transparent',
                          color: '#6b7280',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setAddingImpactMetric(false)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          background: '#9ca3af',
                          color: '#6b7280',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </MetricCard>
              )}
            </ImpactMetrics>
          </ImpactSection>
        </ReportBody>
      </ReportContainer>
    </PageContainer>
  );
};

export default AssessmentResultsNew;

