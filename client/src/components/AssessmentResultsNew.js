import React, { useState, useEffect } from 'react';
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
  FiSave,
  FiTrash2,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as assessmentService from '../services/assessmentService';
import { generateProfessionalReport } from '../services/pdfExportService';
import { exportAssessmentToExcel } from '../services/excelExportService';

// =======================
// STYLED COMPONENTS
// =======================

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  padding: 40px 24px;
  padding-top: 108px; /* 68px GlobalNav + 40px top padding */

  @media (max-width: 768px) {
    padding: 24px 16px;
    padding-top: 92px; /* 68px GlobalNav + 24px top padding */
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
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  @media (max-width: 768px) {
    padding: 24px;
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
    margin-bottom: 16px;

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
  background: ${props => props.$bgColor || '#fef3c7'};
  border: 2px solid ${props => props.$borderColor || '#fbbf24'};
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
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
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
  
  // Edit state management
  const [editingPillar, setEditingPillar] = useState(null);
  const [editingPhase, setEditingPhase] = useState(null);
  const [editedContent, setEditedContent] = useState({});
  const [customizations, setCustomizations] = useState({
    pillars: {},
    phases: {}
  });

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[AssessmentResultsNew] Fetching results for:', assessmentId);
        
        const data = await assessmentService.getAssessmentResults(assessmentId);
        console.log('[AssessmentResultsNew] Results data received:', data);
        console.log('[AssessmentResultsNew] Data keys:', data ? Object.keys(data) : 'null');
        
        if (!data) {
          throw new Error('No data received from API');
        }
        
        // Wrap in data object if needed
        const resultsData = data.data ? data : { data };
        console.log('[AssessmentResultsNew] Setting results:', resultsData);
        
        setResults(resultsData);
      } catch (err) {
        console.error('[AssessmentResultsNew] Error fetching results:', err);
        console.error('[AssessmentResultsNew] Error stack:', err.stack);
        setError(err.message || 'Failed to load assessment results');
        setResults(null);
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      fetchResults();
    } else {
      console.error('[AssessmentResultsNew] No assessment ID provided');
      setError('No assessment ID provided');
      setLoading(false);
    }
  }, [assessmentId, routerLocation.key]);

  // Edit handlers for pillar cards
  const handleEditPillar = (pillarId, data) => {
    setEditingPillar(pillarId);
    setEditedContent({
      theGood: data.theGood.join('\n'),
      theBad: data.theBad.join('\n'),
      recommendations: data.recommendations.join('\n')
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

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      toast.loading('Generating PDF report...', { id: 'pdf-export' });
      
      const resultsData = results?.data || results;
      const assessmentInfo = resultsData?.assessmentInfo || {
        assessmentName: 'Assessment Report',
        organizationName: 'Organization'
      };
      
      const result = generateProfessionalReport(resultsData, assessmentInfo);
      
      if (result.success) {
        toast.success('PDF downloaded successfully!', { id: 'pdf-export' });
      } else {
        throw new Error(result.error || 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error(`Failed to export PDF: ${error.message}`, { id: 'pdf-export' });
    } finally {
      setExporting(false);
    }
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
              background: '#3b82f6',
              color: 'white',
              border: 'none',
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
              background: '#3b82f6',
              color: 'white',
              border: 'none',
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

  // Calculate maturity levels (you'll need to adjust this based on your actual data structure)
  const currentMaturity = 3; // Example: Get from results.overall?.currentMaturity
  const targetMaturity = 4; // Example: Get from results.overall?.targetMaturity
  const improvementLevel = targetMaturity - currentMaturity;

  // Pillar data with icons
  const pillars = [
    { id: 'platform_governance', name: 'Platform & Governance', icon: '🧱' },
    { id: 'data_engineering', name: 'Data Engineering & Integration', icon: '📊' },
    { id: 'analytics_bi', name: 'Analytics & BI Modernization', icon: '📈' },
    { id: 'machine_learning', name: 'Machine Learning & MLOps', icon: '🤖' },
    { id: 'generative_ai', name: 'Generative AI & Agentic Capabilities', icon: '💡' },
    { id: 'operational_excellence', name: 'Operational Excellence & Adoption', icon: '⚙️' },
  ];

  // Phase data for Strategic Roadmap
  const defaultPhases = [
    {
      id: 'phase1',
      title: 'Phase 1: Foundation (0–3 months)',
      bgColor: '#fef3c7',
      borderColor: '#fbbf24',
      accentColor: '#f59e0b',
      items: [
        'Implement Unity Catalog with initial RBAC roles',
        'Establish data quality monitoring and observability',
        'Launch initial governance enablement sessions'
      ]
    },
    {
      id: 'phase2',
      title: 'Phase 2: Scale (3–6 months)',
      bgColor: '#fed7aa',
      borderColor: '#fb923c',
      accentColor: '#ea580c',
      items: [
        'Automate pipeline reliability tracking via DLT',
        'Integrate ML flow metrics with centralized dashboards',
        'Deploy first GenAI-enabled use case under governance'
      ]
    },
    {
      id: 'phase3',
      title: 'Phase 3: Optimize (6–12 months)',
      bgColor: '#d1fae5',
      borderColor: '#86efac',
      accentColor: '#10b981',
      items: [
        'Formalize MLOps CI/CD for model deployment',
        'Expand GenAI use cases with RAG implementation',
        'Align data mesh principles with Unity Catalog'
      ]
    }
  ];

  // Get phase data (use customization if exists, otherwise use default)
  const getPhaseData = (phaseId) => {
    if (customizations.phases[phaseId]) {
      const defaultPhase = defaultPhases.find(p => p.id === phaseId);
      return {
        ...defaultPhase,
        items: customizations.phases[phaseId]
      };
    }
    return defaultPhases.find(p => p.id === phaseId);
  };

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
    const prioritized = Array.isArray(resultsData?.prioritizedActions) 
      ? resultsData.prioritizedActions.find(pa => pa.pillarId === pillarId)
      : null;
    console.log(`[AssessmentResultsNew] prioritized for ${pillarId}:`, prioritized);

    // FIX: Backend returns theGood/theBad in prioritizedActions array
    // prioritizedActions is the source of truth for pillar-specific good/bad/recommendations
    const data = {
      theGood: prioritized?.theGood || [],  // Direct access from prioritizedActions
      theBad: prioritized?.theBad || [],    // Direct access from prioritizedActions
      recommendations: prioritized?.actions || []  // Actions from prioritizedActions
    };
    
    console.log(`[AssessmentResultsNew] Final data for ${pillarId}:`, data);
    return data;
  };

  const resultsData = results?.data || results;
  console.log('[AssessmentResultsNew] Rendering with resultsData:', resultsData);
  console.log('[AssessmentResultsNew] resultsData keys:', resultsData ? Object.keys(resultsData) : 'null');
  console.log('[AssessmentResultsNew] categoryDetails keys:', resultsData?.categoryDetails ? Object.keys(resultsData.categoryDetails) : 'null');
  console.log('[AssessmentResultsNew] prioritizedActions length:', Array.isArray(resultsData?.prioritizedActions) ? resultsData.prioritizedActions.length : 'not an array');

  return (
    <PageContainer>
      <ReportContainer>
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
                onClick={() => navigate(`/assessment/${assessmentId}/platform_governance`)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              >
                <FiEdit3 size={16} />
                Edit Assessment
              </ActionButton>
              <ActionButton
                onClick={handleExportPDF}
                disabled={exporting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiDownload size={16} />
                Export PDF
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
              <ActionButton
                onClick={() => navigate(`/executive-summary/${assessmentId}`)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiShare2 size={16} />
                Executive Summary
              </ActionButton>
            </ActionButtons>
          </HeaderTop>

          <MaturityOverview>
            <MaturityCard $iconBg="rgba(59, 130, 246, 0.3)">
              <div className="icon">
                <FiTarget size={24} />
              </div>
              <div className="label">Current Maturity</div>
              <div className="value">Level {currentMaturity} — Defined</div>
              <div className="description">
                Standardized processes across key domains, limited automation.
              </div>
            </MaturityCard>

            <MaturityCard $iconBg="rgba(16, 185, 129, 0.3)">
              <div className="icon">
                <FiTrendingUp size={24} />
              </div>
              <div className="label">Target Maturity</div>
              <div className="value">Level {targetMaturity} — Managed</div>
              <div className="description">
                Governed, measurable maturity with continuous optimization.
              </div>
            </MaturityCard>

            <MaturityCard $iconBg="rgba(245, 158, 11, 0.3)">
              <div className="icon">
                <FiZap size={24} />
              </div>
              <div className="label">Improvement Potential</div>
              <div className="value">+{improvementLevel} Level (6–12 months)</div>
              <div className="description">
                Achievable through automation, governance integration, and AI enablement.
              </div>
            </MaturityCard>
          </MaturityOverview>
        </ReportHeader>

        {/* Body */}
        <ReportBody>
          {/* Pillar-by-Pillar Assessment */}
          <SectionTitle>Pillar-by-Pillar Assessment</SectionTitle>

          {pillars.map((pillar, index) => {
            const data = getPillarData(pillar.id);
            
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
                        >
                          <FiSave size={14} />
                          Save
                        </EditActionButton>
                        <EditActionButton 
                          onClick={handleCancelPillarEdit}
                        >
                          <FiX size={14} />
                          Cancel
                        </EditActionButton>
                      </>
                    ) : (
                      <>
                        <EditActionButton 
                          onClick={() => handleEditPillar(pillar.id, data)}
                        >
                          <FiEdit3 size={14} />
                          Edit
                        </EditActionButton>
                        {customizations.pillars[pillar.id] && (
                          <EditActionButton 
                            $variant="danger"
                            onClick={() => handleRemovePillarCustomization(pillar.id)}
                          >
                            <FiTrash2 size={14} />
                            Remove
                          </EditActionButton>
                        )}
                      </>
                    )}
                  </div>
                </PillarHeader>
                {editingPillar === pillar.id ? (
                  <PillarBody style={{ display: 'block' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#10b981' }}>
                        The Good (one per line):
                      </label>
                      <EditableTextarea
                        value={editedContent.theGood || ''}
                        onChange={(e) => setEditedContent({ ...editedContent, theGood: e.target.value })}
                        placeholder="Enter strengths, one per line..."
                      />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#ef4444' }}>
                        The Bad (one per line):
                      </label>
                      <EditableTextarea
                        value={editedContent.theBad || ''}
                        onChange={(e) => setEditedContent({ ...editedContent, theBad: e.target.value })}
                        placeholder="Enter gaps, one per line..."
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#3b82f6' }}>
                        Recommendations (one per line):
                      </label>
                      <EditableTextarea
                        value={editedContent.recommendations || ''}
                        onChange={(e) => setEditedContent({ ...editedContent, recommendations: e.target.value })}
                        placeholder="Enter recommendations, one per line..."
                      />
                    </div>
                  </PillarBody>
                ) : (
                  <PillarBody>
                  <PillarColumn $color="#10b981">
                    <div className="column-title">
                      <FiCheckCircle />
                      The Good
                    </div>
                    <ul>
                      {data.theGood.length > 0 ? (
                        data.theGood.slice(0, 4).map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))
                      ) : (
                        <li>Complete assessment to see strengths</li>
                      )}
                    </ul>
                  </PillarColumn>

                  <PillarColumn $color="#ef4444">
                    <div className="column-title">
                      <FiAlertTriangle />
                      The Bad
                    </div>
                    <ul>
                      {data.theBad.length > 0 ? (
                        data.theBad.slice(0, 4).map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))
                      ) : (
                        <li>Complete assessment to see gaps</li>
                      )}
                    </ul>
                  </PillarColumn>

                  <PillarColumn $color="#3b82f6">
                    <div className="column-title">
                      <FiInfo />
                      Recommendations
                    </div>
                    <ul>
                      {data.recommendations.length > 0 ? (
                        data.recommendations.slice(0, 4).map((item, idx) => (
                          <li key={idx}>{typeof item === 'string' ? item : item.action || item.title}</li>
                        ))
                      ) : (
                        <li>Complete assessment to see recommendations</li>
                      )}
                    </ul>
                  </PillarColumn>
                </PillarBody>
                )}
                
                {/* View Details Button */}
                {/* Only show View Details button if pillar has responses */}
                {resultsData?.categoryDetails?.[pillar.id] && (
                  <div style={{ 
                    marginTop: '16px', 
                    paddingTop: '16px', 
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}>
                    <button
                      onClick={() => navigate(`/pillar-results/${assessmentId}/${pillar.id}`)}
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateX(2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateX(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      View Detailed {pillar.name} Results
                      <FiTarget size={16} />
                    </button>
                  </div>
                )}
              </PillarSection>
            );
          })}

          {/* Strategic Roadmap */}
          <RoadmapSection>
            <SectionTitle>Strategic Roadmap & Next Steps</SectionTitle>
            <p style={{ fontSize: '1rem', color: '#64748b', marginBottom: '32px', lineHeight: 1.6 }}>
              This roadmap outlines short-, mid-, and long-term priorities across each pillar to achieve targeted maturity improvements.
            </p>

            <RoadmapPhases>
              {defaultPhases.map((phase, index) => {
                const phaseData = getPhaseData(phase.id);
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
                              onClick={() => handleEditPhase(phase.id, phaseData.items)}
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
                        {phaseData.items.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </PhaseCard>
                );
              })}
            </RoadmapPhases>
          </RoadmapSection>

          {/* Expected Business Impact */}
          <ImpactSection>
            <SectionTitle>Expected Business Impact</SectionTitle>
            <ImpactMetrics>
              <MetricCard
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <div className="metric-value">2.8×</div>
                <div className="metric-label">
                  Increase in analytics-driven decision-making speed
                </div>
              </MetricCard>

              <MetricCard
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="metric-value">6%</div>
                <div className="metric-label">
                  Average cost optimization through platform automation
                </div>
              </MetricCard>

              <MetricCard
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="metric-value">30%</div>
                <div className="metric-label">
                  Reduction in manual operational overhead
                </div>
              </MetricCard>
            </ImpactMetrics>
          </ImpactSection>
        </ReportBody>
      </ReportContainer>
    </PageContainer>
  );
};

export default AssessmentResultsNew;

