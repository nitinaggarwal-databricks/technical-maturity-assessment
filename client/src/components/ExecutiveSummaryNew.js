import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiDownload, 
  FiEdit3,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiCalendar
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
  padding-top: 68px; /* Height of fixed GlobalNav */
`;

const Breadcrumb = styled.div`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #6b7280;

  a, button {
    color: #3b82f6;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font: inherit;
    transition: color 0.2s;

    &:hover {
      color: #2563eb;
      text-decoration: underline;
    }
  }

  span {
    color: #d1d5db;
  }
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const HeaderSection = styled.div`
  margin-bottom: 32px;

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
    letter-spacing: -0.02em;
  }

  p {
    font-size: 1rem;
    color: #6b7280;
    margin: 0;
  }

  @media (max-width: 768px) {
    margin-bottom: 24px;

    h1 {
      font-size: 1.5rem;
    }

    p {
      font-size: 0.875rem;
    }
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Sidebar = styled.div`
  @media (max-width: 1024px) {
    order: -1;
  }
`;

const Card = styled(motion.div)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const SidebarCard = styled(Card)`
  position: sticky;
  top: 20px;

  @media (max-width: 1024px) {
    position: static;
  }
`;

const SidebarTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
`;

const SidebarSubtitle = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 20px 0;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-of-type {
    border-bottom: none;
  }

  .label {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .value {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
    padding: 4px 12px;
    background: #f3f4f6;
    border-radius: 6px;
  }
`;

const ActionButton = styled(motion.button)`
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  margin-top: 16px;

  &:first-of-type {
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);

    &:hover {
      opacity: 0.95;
      box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 0.813rem;
  }
`;

const SecondaryActionButton = styled(motion.button)`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  margin-top: 8px;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  @media (max-width: 768px) {
    padding: 9px 12px;
    font-size: 0.813rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #10b981;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const MaturityComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const MaturityBox = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;

  .label {
    font-size: 0.75rem;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
  }

  .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 4px;
  }

  .subtitle {
    font-size: 0.875rem;
    color: #6b7280;
  }

  @media (max-width: 768px) {
    padding: 12px;

    .value {
      font-size: 1.25rem;
    }
  }
`;

const DescriptionText = styled.p`
  font-size: 0.938rem;
  line-height: 1.6;
  color: #374151;
  margin: 0 0 16px 0;
`;

const EditableTextarea = styled.textarea`
  width: 100%;
  min-height: ${props => props.$minHeight || '100px'};
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  line-height: 1.6;
  color: #111827;
  resize: vertical;
  transition: border-color 0.2s;
  background: #fef9ed;

  &:focus {
    outline: none;
    border-color: #f59e0b;
    background: white;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const PillarConstraintSection = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const PillarHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;

  .icon {
    font-size: 1.5rem;
  }

  .title {
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
  }
`;

const PainPointGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const PainPointBadge = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 0.875rem;
  color: #374151;
  background: #fef3c7;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #fde68a;

  .count {
    font-weight: 600;
    color: #92400e;
    min-width: 20px;
  }

  @media (max-width: 768px) {
    font-size: 0.813rem;
    padding: 6px 10px;
  }
`;

const RoadmapItem = styled.div`
  padding: 16px;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 8px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .title {
    font-size: 0.938rem;
    font-weight: 600;
    color: #166534;
  }

  .timeline {
    font-size: 0.813rem;
    color: #166534;
    background: #dcfce7;
    padding: 4px 10px;
    border-radius: 4px;
    font-weight: 500;
  }

  .actions {
    font-size: 0.875rem;
    line-height: 1.6;
    color: #166534;

    ul {
      margin: 0;
      padding-left: 20px;
    }

    li {
      margin-bottom: 6px;
    }
  }

  @media (max-width: 768px) {
    padding: 12px;

    .title {
      font-size: 0.875rem;
    }

    .actions {
      font-size: 0.813rem;
    }
  }
`;

const OutcomesList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 0.875rem;
    line-height: 1.6;
    color: #374151;
    margin-bottom: 12px;
    padding-left: 0;

    &:last-child {
      margin-bottom: 0;
    }

    svg {
      margin-top: 2px;
      color: #10b981;
      flex-shrink: 0;
    }
  }

  @media (max-width: 768px) {
    li {
      font-size: 0.813rem;
    }
  }
`;

const ConfidenceBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 12px;
  padding: 6px 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
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
`;

// =======================
// COMPONENT
// =======================

const ExecutiveSummaryNew = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedContent, setEditedContent] = useState({
    strategicSituation: '',
    criticalConstraints: '',
    transformationRoadmap: [],
    expectedOutcomes: [],
    currentMaturityDescription: '',
    targetMaturityDescription: '',
    improvementScopeDescription: ''
  });

  useEffect(() => {
    const fetchResults = async () => {
      try {
        console.log('[ExecutiveSummaryNew] Fetching results for assessment:', assessmentId);
        setLoading(true);
        const response = await assessmentService.getAssessmentResults(assessmentId);
        console.log('[ExecutiveSummaryNew] Raw response:', response);
        
        // Unwrap response if needed (backend returns {success, data} but interceptor already unwrapped once)
        const data = response?.data || response;
        console.log('[ExecutiveSummaryNew] Unwrapped data:', data);
        setResults(data);
        
        // Initialize editable content from results or existing edited content
        if (data.editedExecutiveSummary) {
          setEditedContent(data.editedExecutiveSummary);
        } else {
          // Initialize with AI-generated content
          // Note: executiveSummary can be an object or string, so we extract the summary text
          const strategicSummary = typeof data.executiveSummary === 'string' 
            ? data.executiveSummary 
            : (data.executiveSummary?.summary || data.executiveSummary?.strategicSituation || 'Structured approach with established processes. Advanced capabilities with strong governance. Achievable with targeted initiatives and focused effort.');
          
          setEditedContent({
            strategicSituation: strategicSummary,
            criticalConstraints: 'These constraints limit platform capabilities, team productivity, and business agility. The transformation roadmap below addresses them.',
            transformationRoadmap: [
              { title: 'Platform (Level 2 → 3)', timeline: '3–6 months', impact: 'Medium', actions: ['Implement Unity Catalog for centralized governance', 'Enable audit logging', 'Deploy RBAC with attribute-based access control'] },
              { title: 'Data (Level 3 → 4)', timeline: '3–6 months', impact: 'Medium', actions: ['Adopt Delta Live Tables for automated pipelines', 'Enable Lakehouse Monitoring for data quality', 'Use Auto Loader for streaming ingestion'] },
              { title: 'Analytics (Level 3 → 4)', timeline: '3–6 months', impact: 'Medium', actions: ['Deploy Databricks SQL with Serverless compute', 'Enable AI/BI dashboards', 'Pilot Genie for natural-language queries'] }
            ],
            expectedOutcomes: [
              'Improved platform reliability and governance posture',
              'Faster time-to-insight with modern Databricks capabilities',
              'Reduced manual effort through automation and AI',
              'Better cost efficiency via serverless and optimized compute',
              'Enhanced compliance and audit capabilities'
            ],
            currentMaturityDescription: 'Defined — Structured approach with established processes',
            targetMaturityDescription: 'Managed — Advanced capabilities with strong governance',
            improvementScopeDescription: 'Achievable with targeted initiatives and focused effort'
          });
        }
      } catch (err) {
        console.error('Error fetching results:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      fetchResults();
    }
  }, [assessmentId, routerLocation.key]);

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      toast.loading('Generating PDF report...', { id: 'pdf-export' });
      
      const resultsData = results?.data || results;
      const assessmentInfo = resultsData?.assessmentInfo || {
        assessmentName: 'Executive Summary',
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

  const handleSaveEdits = async () => {
    try {
      setSaving(true);
      toast.loading('Saving changes...', { id: 'save-edits' });
      
      await assessmentService.saveEditedExecutiveSummary(assessmentId, editedContent);
      
      toast.success('Changes saved successfully!', { id: 'save-edits' });
      setEditMode(false);
      
      // Refresh results to get updated data
      const data = await assessmentService.getAssessmentResults(assessmentId);
      setResults(data);
    } catch (error) {
      console.error('Error saving edits:', error);
      toast.error('Failed to save changes', { id: 'save-edits' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset to last saved state
    const resultsData = results?.data || results;
    if (resultsData?.editedExecutiveSummary) {
      setEditedContent(resultsData.editedExecutiveSummary);
    }
    setEditMode(false);
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      toast.loading('Generating Excel file...', { id: 'excel-export' });
      
      const resultsData = results?.data || results;
      await exportAssessmentToExcel(
        assessmentId,
        resultsData?.assessmentInfo?.assessmentName || 'Assessment'
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
        <LoadingContainer>
          <div className="spinner">
            <FiRefreshCw size={48} className="animate-spin" style={{ color: '#3b82f6' }} />
            <div className="text">Loading Executive Summary...</div>
          </div>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error || !results) {
    return (
      <PageContainer>
        <ErrorContainer>
          <FiAlertCircle size={64} className="icon" />
          <div className="title">Unable to load Executive Summary</div>
          <div className="message">{error || 'No summary available'}</div>
          <SecondaryActionButton
            onClick={() => navigate(`/results/${assessmentId}`)}
            style={{ maxWidth: '200px' }}
          >
            <FiArrowLeft /> Back to Results
          </SecondaryActionButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  // Unwrap results data (handle both direct and wrapped formats)
  const resultsData = results?.data || results;
  console.log('[ExecutiveSummaryNew] Rendering with resultsData:', resultsData);

  // Calculate maturity levels from results
  const currentMaturity = resultsData?.overall?.currentScore || 3;
  const targetMaturity = resultsData?.overall?.futureScore || 4;
  const improvementScope = targetMaturity - currentMaturity;

  // Get actual pillars data from results (dynamically generated)
  const pillarsData = [];
  const categoryDetails = resultsData?.categoryDetails || {};
  
  Object.keys(categoryDetails).forEach(pillarId => {
    const pillar = categoryDetails[pillarId];
    if (pillar && pillar.name) {
      pillarsData.push({
        id: pillarId,
        name: pillar.name,
        currentScore: pillar.currentScore || 0,
        futureScore: pillar.futureScore || 0,
        gap: (pillar.futureScore || 0) - (pillar.currentScore || 0)
      });
    }
  });
  
  // Get prioritized actions from results
  const prioritizedActions = resultsData?.prioritizedActions || [];
  
  // Build transformation roadmap from prioritized actions
  const transformationRoadmap = prioritizedActions.slice(0, 6).map(action => ({
    pillar: action.pillarName || action.category || 'General',
    gap: action.gap || 0,
    timeline: action.gap >= 2 ? '6–12 months' : '3–6 months',
    impact: action.gap >= 2 ? 'High' : action.gap >= 1 ? 'Medium' : 'Low',
    actions: action.actions || []
  }));

  return (
    <PageContainer>
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <button onClick={() => navigate(`/results/${assessmentId}`)}>
          <FiArrowLeft size={14} /> Back to Results
        </button>
        <span>›</span>
        <button onClick={() => navigate('/assessments')}>Assessments</button>
        <span>›</span>
        <span style={{ color: '#111827' }}>Executive Summary</span>
      </Breadcrumb>

      <ContentContainer>
        {/* Header */}
        <HeaderSection>
          <h1>Executive Summary</h1>
          <p>Strategic insights and business value analysis for {resultsData?.assessmentInfo?.assessmentName || 'your assessment'}.</p>
        </HeaderSection>

        {/* Main Grid Layout */}
        <MainGrid>
          {/* Main Content */}
          <MainContent>
            {/* What This Assessment Reveals */}
            <Card
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SectionTitle>
                <FiCheckCircle />
                What this assessment reveals
              </SectionTitle>
              <SidebarSubtitle style={{ marginBottom: '20px' }}>
                Clear snapshot of where you are, where you're going, and what to do next.
              </SidebarSubtitle>

              {/* Strategic Situation & Business Value */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.25rem' }}>🎯</span> Strategic situation & business value
                </h3>
                <MaturityComparisonGrid>
                  <MaturityBox>
                    <div className="label">Current maturity</div>
                    <div className="value">
                      <span style={{ fontSize: '0.875rem', color: '#6b7280', marginRight: '4px' }}>◐</span>
                      Level {currentMaturity}
                    </div>
                    <div className="subtitle">— Defined</div>
                  </MaturityBox>
                  <MaturityBox>
                    <div className="label">Target maturity</div>
                    <div className="value">
                      <span style={{ fontSize: '0.875rem', color: '#6b7280', marginRight: '4px' }}>☆</span>
                      Level {targetMaturity}
                    </div>
                    <div className="subtitle">— Managed</div>
                  </MaturityBox>
                  <MaturityBox>
                    <div className="label">Improvement scope</div>
                    <div className="value">
                      <span style={{ fontSize: '0.875rem', color: '#10b981', marginRight: '4px' }}>→</span>
                      +{improvementScope} level
                    </div>
                    <div className="subtitle">in next 3-6 months</div>
                  </MaturityBox>
                </MaturityComparisonGrid>

                {editMode ? (
                  <EditableTextarea
                    $minHeight="120px"
                    value={editedContent.strategicSituation}
                    onChange={(e) => setEditedContent({...editedContent, strategicSituation: e.target.value})}
                    placeholder="Describe the strategic situation and business value..."
                  />
                ) : (
                  <>
                    <DescriptionText>
                      {editedContent.strategicSituation || 'Structured approach with established processes. Advanced capabilities with strong governance. Achievable with targeted initiatives and focused effort.'}
                    </DescriptionText>
                  </>
                )}
              </div>
            </Card>

            {/* Critical Constraints */}
            <Card
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <SectionTitle>
                <FiAlertCircle style={{ color: '#f59e0b' }} />
                Critical constraints impacting performance
              </SectionTitle>
              <SidebarSubtitle style={{ marginBottom: '20px' }}>
                Your assessment identified specific challenges across multiple pillars:
              </SidebarSubtitle>

              {pillarsData.map((pillar, idx) => {
                // Get actual pillar details
                const pillarDetails = categoryDetails[pillar.id] || {};
                const gap = pillar.gap;
                
                return (
                  <PillarConstraintSection key={pillar.id}>
                    <PillarHeader>
                      <span className="title">{pillar.name}</span>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '8px' }}>
                        (Current: {pillar.currentScore}/5 → Target: {pillar.futureScore}/5)
                      </span>
                    </PillarHeader>
                    <PainPointGrid>
                      <PainPointBadge style={{ background: gap >= 2 ? '#fee2e2' : gap >= 1 ? '#fef3c7' : '#f0fdf4' }}>
                        <span className="count" style={{ color: gap >= 2 ? '#991b1b' : gap >= 1 ? '#78350f' : '#065f46' }}>
                          {gap}
                        </span>
                        <span style={{ color: gap >= 2 ? '#991b1b' : gap >= 1 ? '#78350f' : '#065f46' }}>
                          level gap
                        </span>
                      </PainPointBadge>
                      <PainPointBadge>
                        <span className="count">{pillarDetails.questionsAnswered || 0}</span>
                        <span>questions</span>
                      </PainPointBadge>
                    </PainPointGrid>
                  </PillarConstraintSection>
                );
              })}

              {editMode ? (
                <EditableTextarea
                  $minHeight="80px"
                  value={editedContent.criticalConstraints}
                  onChange={(e) => setEditedContent({...editedContent, criticalConstraints: e.target.value})}
                  placeholder="Describe the critical constraints..."
                  style={{ marginTop: '20px' }}
                />
              ) : (
                <DescriptionText style={{ marginTop: '20px', marginBottom: 0 }}>
                  {editedContent.criticalConstraints || 'These constraints limit platform capabilities, team productivity, and business agility. The transformation roadmap below addresses them.'}
                </DescriptionText>
              )}
            </Card>

            {/* Transformation Roadmap */}
            <Card
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <SectionTitle>
                <FiTrendingUp style={{ color: '#10b981' }} />
                Transformation roadmap & business value
              </SectionTitle>

              {transformationRoadmap.length > 0 ? (
                transformationRoadmap.map((roadmapItem, idx) => (
                  <RoadmapItem key={idx}>
                    <div className="header">
                      <div className="title">
                        {roadmapItem.pillar} (Level {categoryDetails[Object.keys(categoryDetails).find(k => categoryDetails[k].name === roadmapItem.pillar)]?.currentScore || 0} → 
                        {categoryDetails[Object.keys(categoryDetails).find(k => categoryDetails[k].name === roadmapItem.pillar)]?.futureScore || 0})
                      </div>
                      <div className="timeline">
                        <FiCalendar size={12} style={{ marginRight: '4px', display: 'inline' }} />
                        Timeline: {roadmapItem.timeline} • Impact: {roadmapItem.impact}
                      </div>
                    </div>
                    <div className="actions">
                      <ul>
                        {roadmapItem.actions && roadmapItem.actions.length > 0 ? (
                          roadmapItem.actions.slice(0, 4).map((action, actionIdx) => (
                            <li key={actionIdx}>
                              {typeof action === 'string' ? action : action.action || action.title || action.description || 'Action item'}
                            </li>
                          ))
                        ) : (
                          <li>Focus on closing the maturity gap through structured improvements</li>
                        )}
                      </ul>
                    </div>
                  </RoadmapItem>
                ))
              ) : (
                <DescriptionText>
                  Complete more pillar assessments to generate a personalized transformation roadmap.
                </DescriptionText>
              )}

              <div style={{ marginTop: '24px' }}>
                <h4 style={{ fontSize: '0.938rem', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                  Expected business outcomes
                </h4>
                <OutcomesList>
                  <li>
                    <FiCheckCircle size={18} />
                    Improved platform reliability and governance posture
                  </li>
                  <li>
                    <FiCheckCircle size={18} />
                    Faster time-to-insight with modern Databricks capabilities
                  </li>
                  <li>
                    <FiCheckCircle size={18} />
                    Reduced manual effort through automation and AI
                  </li>
                  <li>
                    <FiCheckCircle size={18} />
                    Better cost efficiency via serverless and optimized compute
                  </li>
                  <li>
                    <FiCheckCircle size={18} />
                    Enhanced compliance and audit capabilities
                  </li>
                </OutcomesList>
                <ConfidenceBadge>
                  Assessment confidence: Based on {pillarsData.length} pillar{pillarsData.length !== 1 ? 's' : ''} with {resultsData?.assessmentInfo?.questionsAnswered || 0} questions answered
                </ConfidenceBadge>
              </div>
            </Card>
          </MainContent>

          {/* Sidebar */}
          <Sidebar>
            <SidebarCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <SidebarTitle>At a glance</SidebarTitle>
              <SidebarSubtitle>Quick summary for execs</SidebarSubtitle>

              <MetricRow>
                <span className="label">Current maturity</span>
                <span className="value">Level {currentMaturity}</span>
              </MetricRow>
              <MetricRow>
                <span className="label">Target maturity</span>
                <span className="value">Level {targetMaturity}</span>
              </MetricRow>
              <MetricRow>
                <span className="label">Improvement scope</span>
                <span className="value">+{improvementScope} level</span>
              </MetricRow>

              <div style={{ marginTop: '16px', padding: '12px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <div style={{ fontSize: '0.813rem', color: '#92400e' }}>
                  Next review recommended in <strong>90 days</strong>.
                </div>
              </div>

              <ActionButton
                onClick={() => navigate(`/results/${assessmentId}`)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Full Roadmap
              </ActionButton>

              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                <SidebarTitle>{editMode ? 'Editing Mode' : 'Share & collaborate'}</SidebarTitle>
                <SidebarSubtitle>{editMode ? 'Review and refine the content' : 'Make this plan actionable'}</SidebarSubtitle>

                {editMode ? (
                  <>
                    <ActionButton
                      onClick={handleSaveEdits}
                      disabled={saving}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', marginBottom: '8px' }}
                    >
                      <FiCheckCircle size={16} />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </ActionButton>
                    
                    <SecondaryActionButton
                      onClick={handleCancelEdit}
                      disabled={saving}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </SecondaryActionButton>
                  </>
                ) : (
                  <>
                    <ActionButton
                      onClick={() => setEditMode(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', marginBottom: '8px' }}
                    >
                      <FiEdit3 size={16} />
                      Edit Summary
                    </ActionButton>

                    <SecondaryActionButton
                      onClick={handleExportPDF}
                      disabled={exporting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiDownload size={16} />
                      {exporting ? 'Exporting...' : 'Download PDF'}
                    </SecondaryActionButton>

                    <SecondaryActionButton
                      onClick={handleExportExcel}
                      disabled={exporting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiDownload size={16} />
                      Export to Excel
                    </SecondaryActionButton>

                    <SecondaryActionButton
                      onClick={() => navigate(`/assessment/${assessmentId}/platform_governance`)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiEdit3 size={16} />
                      Edit Assessment
                    </SecondaryActionButton>
                  </>
                )}
              </div>
            </SidebarCard>
          </Sidebar>
        </MainGrid>
      </ContentContainer>
    </PageContainer>
  );
};

export default ExecutiveSummaryNew;

