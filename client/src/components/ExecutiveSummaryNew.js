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

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await assessmentService.getAssessmentResults(assessmentId);
        setResults(data);
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
      
      await generateProfessionalReport(
        results,
        results.assessmentInfo?.assessmentName || 'Assessment'
      );
      
      toast.success('PDF downloaded successfully!', { id: 'pdf-export' });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF', { id: 'pdf-export' });
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

  // Calculate maturity levels from results
  const currentMaturity = 3; // This should come from actual data
  const targetMaturity = 4; // This should come from actual data
  const improvementScope = targetMaturity - currentMaturity;

  // Get pillars data
  const pillars = [
    { id: 'platform_governance', name: 'Platform', icon: '🧱', technical: 24, business: 23 },
    { id: 'data_engineering', name: 'Data', icon: '📊', technical: 29, business: 22 },
    { id: 'analytics_bi', name: 'Analytics', icon: '📈', technical: 28, business: 19 },
    { id: 'machine_learning', name: 'ML', icon: '🤖', technical: 27, business: 19 },
    { id: 'generative_ai', name: 'GenAI', icon: '💡', technical: 30, business: 20 },
    { id: 'operational_excellence', name: 'Operations', icon: '⚙️', technical: 32, business: 23 },
  ];

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
          <p>Strategic insights and business value analysis for {results.assessmentInfo?.assessmentName || 'your assessment'}.</p>
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

                <DescriptionText>
                  Structured approach with established processes
                </DescriptionText>
                <DescriptionText style={{ marginBottom: 0 }}>
                  Advanced capabilities with strong governance
                </DescriptionText>
                <DescriptionText style={{ marginBottom: 0 }}>
                  Achievable with targeted initiatives and focused effort
                </DescriptionText>
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

              {pillars.map((pillar, idx) => (
                <PillarConstraintSection key={pillar.id}>
                  <PillarHeader>
                    <span className="icon">{pillar.icon}</span>
                    <span className="title">{pillar.name}</span>
                  </PillarHeader>
                  <PainPointGrid>
                    <PainPointBadge>
                      <span className="count">{pillar.technical}</span>
                      <span>technical</span>
                    </PainPointBadge>
                    <PainPointBadge>
                      <span className="count">{pillar.business}</span>
                      <span>business</span>
                    </PainPointBadge>
                  </PainPointGrid>
                </PillarConstraintSection>
              ))}

              <DescriptionText style={{ marginTop: '20px', marginBottom: 0 }}>
                These constraints limit platform capabilities, team productivity, and business agility. The transformation roadmap below addresses them.
              </DescriptionText>
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

              <RoadmapItem>
                <div className="header">
                  <div className="title">Platform (Level 2 → 3)</div>
                  <div className="timeline">
                    <FiCalendar size={12} style={{ marginRight: '4px', display: 'inline' }} />
                    Timeline: 3–6 months • Impact: Medium
                  </div>
                </div>
                <div className="actions">
                  <ul>
                    <li>Implement Unity Catalog for centralized governance</li>
                    <li>Enable audit logging</li>
                    <li>Deploy RBAC with attribute-based access control</li>
                  </ul>
                </div>
              </RoadmapItem>

              <RoadmapItem>
                <div className="header">
                  <div className="title">Data (Level 3 → 4)</div>
                  <div className="timeline">
                    <FiCalendar size={12} style={{ marginRight: '4px', display: 'inline' }} />
                    Timeline: 3–6 months • Impact: Medium
                  </div>
                </div>
                <div className="actions">
                  <ul>
                    <li>Adopt Delta Live Tables for automated pipelines</li>
                    <li>Enable Lakehouse Monitoring for data quality</li>
                    <li>Use Auto Loader for streaming ingestion</li>
                  </ul>
                </div>
              </RoadmapItem>

              <RoadmapItem>
                <div className="header">
                  <div className="title">Analytics (Level 3 → 4)</div>
                  <div className="timeline">
                    <FiCalendar size={12} style={{ marginRight: '4px', display: 'inline' }} />
                    Timeline: 3–6 months • Impact: Medium
                  </div>
                </div>
                <div className="actions">
                  <ul>
                    <li>Deploy Databricks SQL with Serverless compute</li>
                    <li>Enable AI/BI dashboards</li>
                    <li>Pilot Genie for natural-language queries</li>
                  </ul>
                </div>
              </RoadmapItem>

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
                  Assessment confidence: Based on 6 pillars with 296 specific challenges identified
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
                <SidebarTitle>Share & collaborate</SidebarTitle>
                <SidebarSubtitle>Make this plan actionable</SidebarSubtitle>

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
              </div>
            </SidebarCard>
          </Sidebar>
        </MainGrid>
      </ContentContainer>
    </PageContainer>
  );
};

export default ExecutiveSummaryNew;

