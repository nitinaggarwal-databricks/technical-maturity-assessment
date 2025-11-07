import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from './Footer';
import {
  FiAward,
  FiTrendingUp,
  FiTrendingDown,
  FiTarget,
  FiBarChart2,
  FiUsers,
  FiAlertTriangle,
  FiCheckCircle,
  FiZap,
  FiShield,
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiArrowLeft,
  FiFileText,
  FiEdit2,
  FiTrash2,
  FiPlus
} from 'react-icons/fi';
import * as assessmentService from '../services/assessmentService';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

// Global print styles to hide navigation and other UI elements
const GlobalPrintStyles = createGlobalStyle`
  @media print {
    /* Hide navigation, headers, and action buttons */
    nav,
    header,
    [class*="GlobalNav"],
    [class*="PageHeader"],
    [class*="BackButton"],
    [class*="ActionButton"],
    [class*="DownloadButton"] {
      display: none !important;
    }

    /* Hide all fixed/sticky elements */
    *[style*="position: fixed"],
    *[style*="position: sticky"] {
      position: static !important;
    }

    /* Reset body and page margins */
    body {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
    }

    /* Optimize print layout */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    /* 🚨 CRITICAL: Prevent page breaks inside ANY component */
    section,
    [class*="Section"],
    [class*="MetricsGrid"],
    [class*="InsightCard"],
    [class*="Card"],
    [class*="Container"],
    div[style*="background"],
    div[style*="border"],
    div[style*="padding"] {
      page-break-inside: avoid !important;
      break-inside: avoid-page !important;
    }

    /* Major sections can break to new page if needed */
    [class*="Section"] {
      page-break-before: auto !important;
      page-break-after: auto !important;
    }
  }
`;

// ... (keeping all the styled components from before, adding more)

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  padding: 108px 0 40px 0;

  @media (max-width: 768px) {
    padding: 92px 0 24px 0;
  }

  @media print {
    padding: 0;
    background: white;
  }
`;

const PageHeader = styled.div`
  margin: 0 0 24px 0;
  padding: 20px 40px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }

  @media print {
    display: none !important;
  }
`;

const BackButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  color: #3b82f6;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #3b82f6;
    color: white;
    transform: translateX(-4px);
  }
`;

const BenchmarkButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #059669;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
`;

const ReportContainer = styled(motion.div)`
  background: #ffffff;
  border-radius: 0;
  box-shadow: none;
  margin: 0;
  overflow: hidden;

  @media print {
    margin: 0;
    box-shadow: none;
    border-radius: 0;
    page-break-inside: avoid;
  }
`;

const ReportHeader = styled.div`
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  padding: 32px 40px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 500px;
    height: 500px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
  }

  @media print {
    padding: 20px 40px;
    page-break-after: avoid;
    
    &::before {
      display: none;
    }
  }
`;

const BrandingLogo = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 2px;
  color: #fbbf24;
  margin-bottom: 8px;
`;

const ReportTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 12px 0;
  position: relative;
  z-index: 1;
`;

const ReportSubtitle = styled.div`
  font-size: 1rem;
  opacity: 0.9;
  position: relative;
  z-index: 1;
`;

const Section = styled(motion.div)`
  padding: 32px 40px;
  border-bottom: 1px solid #e5e7eb;
  position: relative;

  &:last-child {
    border-bottom: none;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  cursor: ${props => props.$collapsible ? 'pointer' : 'default'};
  user-select: none;
  position: relative;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionBadge = styled.div`
  background: ${props => props.$color || '#3b82f6'};
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SectionActions = styled.div`
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  margin-left: auto;

  ${SectionHeader}:hover & {
    opacity: 1;
  }

  @media (max-width: 768px) {
    opacity: 1;
  }

  @media print {
    display: none !important;
  }
`;

const ActionButton = styled.button`
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
    border-color: #3b82f6;
    color: #3b82f6;
  }

  @media print {
    display: none !important;
  }
`;

const ExecutiveSummaryBox = styled.div`
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #fbbf24;
  border-radius: 12px;
  padding: 32px;
  margin: 24px 0;
`;

const Headline = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #78350f;
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

const FindingsList = styled.ul`
  margin: 0;
  padding-left: 24px;
  color: #92400e;

  li {
    margin-bottom: 12px;
    font-size: 0.938rem;
    line-height: 1.6;
    font-weight: 500;
  }
`;

const TierBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 1.125rem;
  font-weight: 700;
  background: ${props => props.$bg || '#dbeafe'};
  color: ${props => props.$color || '#1e40af'};
  border: 2px solid ${props => props.$border || '#3b82f6'};
  box-shadow: 0 4px 12px ${props => props.$shadow || 'rgba(59, 130, 246, 0.2)'};
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 24px 0;
`;

const MetricCard = styled(motion.div)`
  background: ${props => props.$bg || '#f9fafb'};
  border: 2px solid ${props => props.$border || '#e5e7eb'};
  border-left: 4px solid ${props => props.$accent || '#3b82f6'};
  border-radius: 12px;
  padding: 20px;
  position: relative;
`;

const CardActions = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${MetricCard}:hover & {
    opacity: 1;
  }

  @media (max-width: 768px) {
    opacity: 1;
  }

  @media print {
    display: none !important;
  }
`;

const MetricLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
`;

const MetricSubtext = styled.div`
  font-size: 0.875rem;
  color: ${props => props.$color || '#6b7280'};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PillarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
  margin: 24px 0;

  @media (max-width: 1600px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PillarCard = styled.div`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px 16px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.12);
    transform: translateY(-2px);
  }
`;

const PillarCardActions = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${PillarCard}:hover & {
    opacity: 1;
  }

  @media (max-width: 768px) {
    opacity: 1;
  }

  @media print {
    display: none !important;
  }
`;

const PillarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f3f4f6;
`;

const PillarName = styled.h4`
  font-size: 0.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  text-transform: capitalize;
`;

const PercentileBadge = styled.div`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${props => props.$bg};
  color: ${props => props.$color};
`;

const ScoreRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ScoreLabel = styled.span`
  font-size: 0.813rem;
  color: #6b7280;
  font-weight: 500;
`;

const ScoreValue = styled.span`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${props => props.$color || '#1f2937'};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin: 12px 0;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${props => props.$color || '#3b82f6'};
  border-radius: 4px;
`;

const InsightCard = styled.div`
  background: ${props => props.$bg || '#f9fafb'};
  border: 2px solid ${props => props.$border || '#e5e7eb'};
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  position: relative;
`;

const InsightCardActions = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${InsightCard}:hover & {
    opacity: 1;
  }

  @media (max-width: 768px) {
    opacity: 1;
  }

  @media print {
    display: none !important;
  }
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const InsightTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: ${props => props.$color || '#1f2937'};
  margin: 0;
`;

const InsightContent = styled.div`
  font-size: 0.875rem;
  line-height: 1.6;
  color: #374151;
`;

const ActionItem = styled.div`
  background: white;
  border: 2px solid #e5e7eb;
  border-left: 4px solid ${props => props.$color || '#3b82f6'};
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
`;

const ActionTitle = styled.div`
  font-size: 0.938rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
`;

const ActionDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 12px;
`;

const ActionTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #6b7280;
`;

const ChartContainer = styled.div`
  margin: 32px 0;
  padding: 24px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

const ChartTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 20px 0;
  text-align: center;
`;

const DownloadButton = styled(motion.button)`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.938rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

  &:hover {
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  }
`;

// Helper function to format pillar names
const formatPillarName = (pillarId) => {
  return pillarId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// 🎨 Modal Styled Components
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    text-transform: capitalize;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
  }

  input,
  textarea {
    width: 100%;
    padding: 10px 12px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.938rem;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }

  textarea {
    resize: vertical;
    font-family: inherit;
  }
`;

const SaveButton = styled.button`
  padding: 10px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
`;

const CancelButton = styled.button`
  padding: 10px 24px;
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
`;

const IndustryBenchmarkingReport = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [collapsedSections, setCollapsedSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [error, setError] = useState(null);
  
  // 🎨 CRUD State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'section', 'metric', 'pillar', 'insight', etc.
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Fetch assessment results
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await assessmentService.getAssessmentResults(assessmentId);
        setResults(response.data || response);
      } catch (err) {
        console.error('Error fetching assessment data:', err);
        setError('Failed to load assessment data');
        setLoading(false);
      }
    };
    
    if (assessmentId) {
      fetchData();
    }
  }, [assessmentId]);

  // Fetch benchmark data separately
  useEffect(() => {
    const fetchBenchmarkData = async () => {
      if (!results) return;
      
      try {
        const data = await assessmentService.getBenchmarkReport(assessmentId);
        setBenchmarkData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching benchmark data:', err);
        setBenchmarkData(null);
        setLoading(false);
      }
    };

    if (results && !benchmarkData) {
      fetchBenchmarkData();
    }
  }, [results, benchmarkData, assessmentId]);

  // Extract data from results
  const assessment = results?.assessmentInfo;
  const overallScore = results?.overall?.currentScore || results?.overallScore || 0;
  const pillarScores = results?.categoryDetails || {};

  useEffect(() => {
    // Original loading simulation
    setTimeout(() => setLoading(false), 500);
  }, []);

  const toggleSection = (sectionId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleDownloadReport = () => {
    // Trigger browser print dialog (user can save as PDF)
    window.print();
  };

  // 🎨 CRUD Handlers
  const handleEdit = (type, item) => {
    console.log('[Edit]', type, item);
    setModalType(type);
    setEditingItem(item);
    
    // Transform data for the form based on type
    if (type === 'executive-summary' && item) {
      setFormData({
        headline: item.headline || '',
        keyFindings: item.keyFindings?.join('\n') || '',
        marketContext: item.marketContext || ''
      });
    } else {
      setFormData(item || {});
    }
    
    setShowModal(true);
  };

  const handleDelete = (type, item) => {
    console.log('[Delete]', type, item);
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      // In a real app, you'd update the backend here
      alert(`${type} deleted successfully!`);
    }
  };

  const handleAdd = (type) => {
    console.log('[Add]', type);
    setModalType(type);
    setEditingItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('[Form Submit]', modalType, formData);
    // In a real app, you'd save to backend here
    setShowModal(false);
    alert(`${modalType} ${editingItem ? 'updated' : 'added'} successfully!`);
  };

  const getTierIcon = (tier) => {
    switch(tier) {
      case 'Market Leader': return FiAward;
      case 'Fast Follower': return FiTrendingUp;
      case 'Industry Average': return FiUsers;
      default: return FiTrendingDown;
    }
  };

  const getTierColor = (tier) => {
    switch(tier) {
      case 'Market Leader': return { bg: '#d1fae5', color: '#065f46', border: '#10b981', shadow: 'rgba(16, 185, 129, 0.2)' };
      case 'Fast Follower': return { bg: '#dbeafe', color: '#1e40af', border: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.2)' };
      case 'Industry Average': return { bg: '#fef3c7', color: '#78350f', border: '#fbbf24', shadow: 'rgba(251, 191, 36, 0.2)' };
      default: return { bg: '#fee2e2', color: '#991b1b', border: '#ef4444', shadow: 'rgba(239, 68, 68, 0.2)' };
    }
  };

  const getPercentileColor = (percentile) => {
    if (percentile >= 75) return { bg: '#d1fae5', color: '#065f46' };
    if (percentile >= 50) return { bg: '#dbeafe', color: '#1e40af' };
    if (percentile >= 25) return { bg: '#fef3c7', color: '#78350f' };
    return { bg: '#fee2e2', color: '#991b1b' };
  };

  if (loading || !benchmarkData) {
    return (
      <ReportContainer>
        <Section>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <FiBarChart2 size={48} color="#3b82f6" />
            <p style={{ marginTop: '16px', color: '#6b7280' }}>
              Generating comprehensive benchmarking analysis...
            </p>
          </div>
        </Section>
      </ReportContainer>
    );
  }

  const { executiveSummary, competitivePositioning, pillarAnalysis, competitiveIntelligence, strategicRecommendations, metadata } = benchmarkData;
  const TierIcon = getTierIcon(competitivePositioning?.overallRanking?.tier);
  const tierColors = getTierColor(competitivePositioning?.overallRanking?.tier);

  // Use score from metadata if available (preferred), otherwise fallback to prop or calculate from pillars
  const actualScore = metadata?.overallScore || overallScore || (
    pillarAnalysis ? 
      Object.values(pillarAnalysis).reduce((sum, p) => sum + (p.customerScore || 0), 0) / Object.values(pillarAnalysis).length 
      : 0
  );

  console.log('[IndustryBenchmarkingReport] Score debug:', { 
    metadataScore: metadata?.overallScore, 
    propScore: overallScore, 
    actualScore,
    pillarCount: pillarAnalysis ? Object.keys(pillarAnalysis).length : 0
  });

  return (
    <>
      <GlobalPrintStyles />
      <PageContainer>
        <PageHeader>
          <BackButton
            onClick={() => navigate(`/executive/${assessmentId}`)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiArrowLeft size={18} />
            Full Report
          </BackButton>
          <BenchmarkButton
            onClick={() => navigate(`/executive/${assessmentId}`)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiBarChart2 size={18} />
            Executive Command Center
          </BenchmarkButton>
        </PageHeader>

      <ReportContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
      {/* Report Header */}
      <ReportHeader>
        <BrandingLogo>DATABRICKS MATURITY ASSESSMENT</BrandingLogo>
        <ReportTitle>Industry Benchmarking Report</ReportTitle>
        <ReportSubtitle>
          Data Platform Maturity Analysis  •  {assessment?.industry || 'Industry'}  •  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </ReportSubtitle>
      </ReportHeader>

      {/* Executive Summary */}
      <Section>
        <SectionHeader>
          <SectionTitle>
            <FiZap color="#fbbf24" />
            Executive Summary
          </SectionTitle>
          <SectionActions>
            <ActionButton title="Edit Section" onClick={() => handleEdit('executive-summary', executiveSummary)}>
              <FiEdit2 size={16} />
            </ActionButton>
            <ActionButton title="Delete Section" onClick={() => handleDelete('executive-summary', executiveSummary)}>
              <FiTrash2 size={16} />
            </ActionButton>
          </SectionActions>
        </SectionHeader>

        <ExecutiveSummaryBox>
          <Headline>{executiveSummary?.headline}</Headline>
          <FindingsList>
            {executiveSummary?.keyFindings?.map((finding, idx) => (
              <li key={idx}>{finding}</li>
            ))}
          </FindingsList>
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255, 255, 255, 0.6)', borderRadius: '8px' }}>
            <strong style={{ color: '#78350f' }}>Market Context:</strong>
            <p style={{ margin: '8px 0 0 0', color: '#92400e', fontSize: '0.875rem', lineHeight: 1.6 }}>
              {executiveSummary?.marketContext}
            </p>
          </div>
        </ExecutiveSummaryBox>
      </Section>

      {/* Competitive Positioning */}
      <Section>
        <SectionHeader>
          <SectionTitle>
            <FiTarget color="#3b82f6" />
            Your Competitive Position
          </SectionTitle>
          <SectionActions>
            <ActionButton title="Add Metric" onClick={() => handleAdd('metric')}>
              <FiPlus size={16} />
            </ActionButton>
            <ActionButton title="Edit Section" onClick={() => handleEdit('competitive-position', competitivePositioning)}>
              <FiEdit2 size={16} />
            </ActionButton>
            <ActionButton title="Delete Section" onClick={() => handleDelete('competitive-position', competitivePositioning)}>
              <FiTrash2 size={16} />
            </ActionButton>
          </SectionActions>
        </SectionHeader>

        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <TierBadge $bg={tierColors.bg} $color={tierColors.color} $border={tierColors.border} $shadow={tierColors.shadow}>
            <TierIcon size={24} />
            {competitivePositioning?.overallRanking?.tier}
          </TierBadge>
          <p style={{ marginTop: '16px', fontSize: '1.125rem', color: '#6b7280' }}>
            Top <strong>{100 - competitivePositioning?.overallRanking?.percentile}%</strong> of {assessment?.industry} organizations
          </p>
        </div>

        <MetricsGrid>
          <MetricCard $bg="#fef3c7" $border="#fbbf24" $accent="#f59e0b">
            <CardActions>
              <ActionButton title="Edit Metric" onClick={() => handleEdit("metric", {})}>
                <FiEdit2 size={14} />
              </ActionButton>
              <ActionButton title="Delete Metric" onClick={() => handleDelete("metric", {})}>
                <FiTrash2 size={14} />
              </ActionButton>
            </CardActions>
            <MetricLabel>Overall Percentile</MetricLabel>
            <MetricValue>{competitivePositioning?.overallRanking?.percentile}th</MetricValue>
            <MetricSubtext>
              <FiAward color="#f59e0b" />
              {competitivePositioning?.overallRanking?.versusBenchmark}
            </MetricSubtext>
          </MetricCard>

          <MetricCard $bg="#dbeafe" $border="#3b82f6" $accent="#2563eb">
            <CardActions>
              <ActionButton title="Edit Metric" onClick={() => handleEdit("metric", {})}>
                <FiEdit2 size={14} />
              </ActionButton>
              <ActionButton title="Delete Metric" onClick={() => handleDelete("metric", {})}>
                <FiTrash2 size={14} />
              </ActionButton>
            </CardActions>
            <MetricLabel>Peer Group</MetricLabel>
            <MetricValue style={{ fontSize: '1rem', lineHeight: 1.4, marginTop: '12px' }}>
              {competitivePositioning?.overallRanking?.peerGroup}
            </MetricValue>
          </MetricCard>

          <MetricCard $bg="#e0f2fe" $border="#0ea5e9" $accent="#0284c7">
            <CardActions>
              <ActionButton title="Edit Metric" onClick={() => handleEdit("metric", {})}>
                <FiEdit2 size={14} />
              </ActionButton>
              <ActionButton title="Delete Metric" onClick={() => handleDelete("metric", {})}>
                <FiTrash2 size={14} />
              </ActionButton>
            </CardActions>
            <MetricLabel>Maturity Score</MetricLabel>
            <MetricValue>{actualScore?.toFixed(1)}<span style={{ fontSize: '1rem', color: '#6b7280' }}>/5.0</span></MetricValue>
            <MetricSubtext $color="#0369a1">
              Comprehensive 6-pillar assessment
            </MetricSubtext>
          </MetricCard>
        </MetricsGrid>

        {/* Radar Chart */}
        {benchmarkData?.visualizations?.radarChart && (
          <ChartContainer>
            <ChartTitle>Pillar Performance vs Industry Benchmark</ChartTitle>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={benchmarkData.visualizations.radarChart}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="pillar" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#6b7280' }} />
                <Radar name="Your Score" dataKey="customerScore" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Radar name="Industry Avg" dataKey="industryAverage" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                <Radar name="Top Quartile" dataKey="topQuartile" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </Section>

      {/* Pillar-by-Pillar Analysis */}
      <Section>
        <SectionHeader $collapsible>
          <div onClick={() => toggleSection('pillars')} style={{ display: 'flex', alignItems: 'center', flex: 1, cursor: 'pointer' }}>
            <SectionTitle>
              <FiBarChart2 color="#3b82f6" />
              Detailed Pillar Analysis
              <SectionBadge $color="#3b82f6">6 Pillars</SectionBadge>
            </SectionTitle>
            {collapsedSections['pillars'] ? <FiChevronDown size={24} style={{ marginLeft: 'auto' }} /> : <FiChevronUp size={24} style={{ marginLeft: 'auto' }} />}
          </div>
          <SectionActions>
            <ActionButton title="Add Pillar" onClick={() => handleAdd('pillar')}>
              <FiPlus size={16} />
            </ActionButton>
            <ActionButton title="Edit Section" onClick={() => handleEdit('pillar-section', pillarAnalysis)}>
              <FiEdit2 size={16} />
            </ActionButton>
            <ActionButton title="Delete Section" onClick={() => handleDelete('pillar-section', pillarAnalysis)}>
              <FiTrash2 size={16} />
            </ActionButton>
          </SectionActions>
        </SectionHeader>

        <AnimatePresence>
          {!collapsedSections['pillars'] && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <PillarGrid>
                {Object.entries(pillarAnalysis || {}).map(([pillarId, data]) => {
                  const percentileColor = getPercentileColor(data.percentileRank);
                  const gap = (data.customerScore - data.industryAverage).toFixed(1);
                  const isAbove = gap >= 0;

                  return (
                    <PillarCard key={pillarId}>
                      <PillarCardActions>
                        <ActionButton title="Edit Pillar" onClick={() => handleEdit('pillar', { pillarId, ...data })}>
                          <FiEdit2 size={14} />
                        </ActionButton>
                        <ActionButton title="Delete Pillar" onClick={() => handleDelete('pillar', { pillarId, ...data })}>
                          <FiTrash2 size={14} />
                        </ActionButton>
                      </PillarCardActions>
                      <PillarHeader>
                        <PillarName>{data.pillar || formatPillarName(pillarId)}</PillarName>
                        <PercentileBadge $bg={percentileColor.bg} $color={percentileColor.color}>
                          {data.percentileRank}th %ile
                        </PercentileBadge>
                      </PillarHeader>

                      <ScoreRow>
                        <ScoreLabel>Your Score</ScoreLabel>
                        <ScoreValue $color="#1f2937">{data.customerScore?.toFixed(1)}</ScoreValue>
                      </ScoreRow>

                      <ScoreRow>
                        <ScoreLabel>Industry Average</ScoreLabel>
                        <ScoreValue $color="#6b7280">{data.industryAverage?.toFixed(1)}</ScoreValue>
                      </ScoreRow>

                      <ScoreRow>
                        <ScoreLabel>Top Quartile</ScoreLabel>
                        <ScoreValue $color="#10b981">{data.topQuartile?.toFixed(1)}</ScoreValue>
                      </ScoreRow>

                      <ProgressBar>
                        <ProgressFill
                          $color={isAbove ? '#10b981' : '#ef4444'}
                          initial={{ width: 0 }}
                          animate={{ width: `${(data.customerScore / 5) * 100}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </ProgressBar>

                      <div style={{ fontSize: '0.813rem', color: isAbove ? '#065f46' : '#991b1b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isAbove ? <FiTrendingUp /> : <FiTrendingDown />}
                        {Math.abs(gap)} points {isAbove ? 'above' : 'below'} industry avg
                      </div>

                      {data.competitiveGap && (
                        <div style={{ marginTop: '12px', padding: '12px', background: '#f9fafb', borderRadius: '8px', fontSize: '0.813rem', color: '#374151' }}>
                          <strong>Gap to Leaders:</strong> {data.competitiveGap}
                        </div>
                      )}
                    </PillarCard>
                  );
                })}
              </PillarGrid>
            </motion.div>
          )}
        </AnimatePresence>
      </Section>

      {/* Competitive Intelligence */}
      {competitiveIntelligence && (
        <Section>
          <SectionHeader>
            <SectionTitle>
              <FiShield color="#10b981" />
              Competitive Intelligence
            </SectionTitle>
          </SectionHeader>

          {/* Strengths */}
          {competitiveIntelligence.strengths?.length > 0 && (
            <div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#065f46', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiCheckCircle /> Competitive Strengths
              </h4>
              {competitiveIntelligence.strengths.map((strength, idx) => (
                <InsightCard key={idx} $bg="#d1fae5" $border="#10b981">
                  <InsightCardActions>
                    <ActionButton title="Edit Strength" onClick={() => handleEdit("strength", strength)}>
                      <FiEdit2 size={14} />
                    </ActionButton>
                    <ActionButton title="Delete Strength" onClick={() => handleDelete("strength", strength)}>
                      <FiTrash2 size={14} />
                    </ActionButton>
                  </InsightCardActions>
                  <InsightHeader>
                    <InsightTitle $color="#065f46">{strength.area}</InsightTitle>
                  </InsightHeader>
                  <InsightContent>
                    <p><strong>Evidence:</strong> {strength.evidence}</p>
                    <p><strong>Competitive Advantage:</strong> {strength.competitiveAdvantage}</p>
                    <p><strong>Recommendation:</strong> {strength.recommendation}</p>
                  </InsightContent>
                </InsightCard>
              ))}
            </div>
          )}

          {/* Vulnerabilities */}
          {competitiveIntelligence.vulnerabilities?.length > 0 && (
            <div style={{ marginTop: '32px' }}>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#991b1b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiAlertTriangle /> Competitive Vulnerabilities
              </h4>
              {competitiveIntelligence.vulnerabilities.map((vuln, idx) => (
                <InsightCard key={idx} $bg="#fee2e2" $border="#ef4444">
                  <InsightCardActions>
                    <ActionButton title="Edit Vulnerability" onClick={() => handleEdit("vulnerability", vuln)}>
                      <FiEdit2 size={14} />
                    </ActionButton>
                    <ActionButton title="Delete Vulnerability" onClick={() => handleDelete("vulnerability", vuln)}>
                      <FiTrash2 size={14} />
                    </ActionButton>
                  </InsightCardActions>
                  <InsightHeader>
                    <InsightTitle $color="#991b1b">{vuln.area}</InsightTitle>
                  </InsightHeader>
                  <InsightContent>
                    <p><strong>Evidence:</strong> {vuln.evidence}</p>
                    <p><strong>Business Risk:</strong> {vuln.businessRisk}</p>
                    <p><strong>Competitor Advantage:</strong> {vuln.competitorAdvantage}</p>
                    <p><strong>Remediation:</strong> {vuln.remediation}</p>
                  </InsightContent>
                </InsightCard>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Strategic Recommendations */}
      {strategicRecommendations && (
        <Section>
          <SectionHeader>
            <SectionTitle>
              <FiTarget color="#3b82f6" />
              Strategic Recommendations
            </SectionTitle>
            <SectionActions>
              <ActionButton title="Add Recommendation" onClick={() => handleAdd('recommendation')}>
                <FiPlus size={16} />
              </ActionButton>
              <ActionButton title="Edit Section" onClick={() => handleEdit('recommendations-section', strategicRecommendations)}>
                <FiEdit2 size={16} />
              </ActionButton>
              <ActionButton title="Delete Section" onClick={() => handleDelete('recommendations-section', strategicRecommendations)}>
                <FiTrash2 size={16} />
              </ActionButton>
            </SectionActions>
          </SectionHeader>

          {/* Immediate Actions */}
          {strategicRecommendations.immediate?.length > 0 && (
            <div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ef4444', marginBottom: '16px' }}>
                Immediate Actions (0-3 months)
              </h4>
              {strategicRecommendations.immediate.map((action, idx) => (
                <ActionItem key={idx} $color="#ef4444">
                  <ActionTitle>{action.action}</ActionTitle>
                  <InsightContent>
                    <p>{action.rationale}</p>
                    <ActionDetails>
                      <ActionTag>
                        <FiTarget size={14} />
                        <strong>Impact:</strong> {action.impact}
                      </ActionTag>
                      <ActionTag>
                        <FiBarChart2 size={14} />
                        <strong>Effort:</strong> {action.effort}
                      </ActionTag>
                      <ActionTag>
                        <FiZap size={14} />
                        <strong>Timeline:</strong> {action.timeframe}
                      </ActionTag>
                    </ActionDetails>
                  </InsightContent>
                </ActionItem>
              ))}
            </div>
          )}

          {/* Short-term Actions */}
          {strategicRecommendations.shortTerm?.length > 0 && (
            <div style={{ marginTop: '32px' }}>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f59e0b', marginBottom: '16px' }}>
                Short-term Actions (3-6 months)
              </h4>
              {strategicRecommendations.shortTerm.map((action, idx) => (
                <ActionItem key={idx} $color="#f59e0b">
                  <ActionTitle>{action.action}</ActionTitle>
                  <InsightContent>
                    <p>{action.rationale}</p>
                    <ActionDetails>
                      <ActionTag>
                        <FiTarget size={14} />
                        <strong>Impact:</strong> {action.impact}
                      </ActionTag>
                      <ActionTag>
                        <FiBarChart2 size={14} />
                        <strong>Effort:</strong> {action.effort}
                      </ActionTag>
                      <ActionTag>
                        <FiZap size={14} />
                        <strong>Timeline:</strong> {action.timeframe}
                      </ActionTag>
                    </ActionDetails>
                  </InsightContent>
                </ActionItem>
              ))}
            </div>
          )}

          {/* Long-term Actions */}
          {strategicRecommendations.longTerm?.length > 0 && (
            <div style={{ marginTop: '32px' }}>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#3b82f6', marginBottom: '16px' }}>
                Long-term Initiatives (6-12+ months)
              </h4>
              {strategicRecommendations.longTerm.map((action, idx) => (
                <ActionItem key={idx} $color="#3b82f6">
                  <ActionTitle>{action.action}</ActionTitle>
                  <InsightContent>
                    <p>{action.rationale}</p>
                    <ActionDetails>
                      <ActionTag>
                        <FiTarget size={14} />
                        <strong>Impact:</strong> {action.impact}
                      </ActionTag>
                      <ActionTag>
                        <FiBarChart2 size={14} />
                        <strong>Effort:</strong> {action.effort}
                      </ActionTag>
                      <ActionTag>
                        <FiZap size={14} />
                        <strong>Timeline:</strong> {action.timeframe}
                      </ActionTag>
                    </ActionDetails>
                  </InsightContent>
                </ActionItem>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Methodology */}
      <Section style={{ background: '#f9fafb' }}>
        <SectionHeader>
          <SectionTitle style={{ fontSize: '1rem' }}>
            Methodology & Data Sources
          </SectionTitle>
          <SectionActions>
            <ActionButton title="Edit Section" onClick={() => handleEdit('methodology', benchmarkData?.methodology)}>
              <FiEdit2 size={16} />
            </ActionButton>
            <ActionButton title="Delete Section" onClick={() => handleDelete('methodology', benchmarkData?.methodology)}>
              <FiTrash2 size={16} />
            </ActionButton>
          </SectionActions>
        </SectionHeader>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6 }}>
          <p><strong>Data Source:</strong> {benchmarkData.methodology?.dataSource}</p>
          <p><strong>Sample Size:</strong> {benchmarkData.methodology?.sampleSize}+ {assessment?.industry} organizations</p>
          <p><strong>Assessment Framework:</strong> {benchmarkData.methodology?.assessmentCriteria}</p>
          <p><strong>Benchmarking Period:</strong> {benchmarkData.methodology?.benchmarkingPeriod || 'Q3-Q4 2024'}</p>
          <p><strong>Last Updated:</strong> {benchmarkData.methodology?.lastUpdated}</p>
          <p><strong>Confidence Level:</strong> {benchmarkData.methodology?.confidenceLevel}</p>
          
          {benchmarkData.methodology?.assumptions && benchmarkData.methodology.assumptions.length > 0 && (
            <div style={{ marginTop: '20px', padding: '16px', background: 'white', borderRadius: '8px', border: '2px solid #e5e7eb' }}>
              <strong style={{ color: '#1f2937', fontSize: '0.938rem' }}>Key Assumptions:</strong>
              <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
                {benchmarkData.methodology.assumptions.map((assumption, idx) => (
                  <li key={idx} style={{ marginBottom: '8px', color: '#4b5563' }}>
                    {assumption}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>
    </ReportContainer>

        {/* Footer */}
        <Footer />

        {/* 🎨 CRUD Modal */}
        <AnimatePresence>
          {showModal && (
            <ModalOverlay onClick={() => setShowModal(false)}>
              <ModalContent
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <ModalHeader>
                  <h2>
                    {editingItem ? 'Edit' : 'Add'}{' '}
                    {modalType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </h2>
                  <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
                </ModalHeader>
                <form onSubmit={handleFormSubmit}>
                  <ModalBody>
                    {modalType === 'metric' && (
                      <>
                        <FormGroup>
                          <label>Metric Label</label>
                          <input
                            type="text"
                            value={formData.label || ''}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            placeholder="e.g., Overall Percentile"
                            required
                          />
                        </FormGroup>
                        <FormGroup>
                          <label>Value</label>
                          <input
                            type="text"
                            value={formData.value || ''}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            placeholder="e.g., 85th"
                            required
                          />
                        </FormGroup>
                      </>
                    )}
                    {(modalType === 'pillar' || modalType === 'strength' || modalType === 'vulnerability' || modalType === 'recommendation') && (
                      <>
                        <FormGroup>
                          <label>Title / Area</label>
                          <input
                            type="text"
                            value={formData.area || formData.title || formData.pillar || ''}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value, title: e.target.value, pillar: e.target.value })}
                            placeholder="e.g., Platform Governance"
                            required
                          />
                        </FormGroup>
                        <FormGroup>
                          <label>Description / Evidence</label>
                          <textarea
                            rows="4"
                            value={formData.evidence || formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, evidence: e.target.value, description: e.target.value })}
                            placeholder="Detailed description or evidence..."
                            required
                          />
                        </FormGroup>
                      </>
                    )}
                    {modalType === 'executive-summary' && (
                      <>
                        <FormGroup>
                          <label>Headline</label>
                          <textarea
                            rows="2"
                            value={formData.headline || ''}
                            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                            placeholder="e.g., Your organization ranks in the Below Median (38th percentile)"
                            required
                          />
                        </FormGroup>
                        <FormGroup>
                          <label>Key Findings (one per line)</label>
                          <textarea
                            rows="5"
                            value={formData.keyFindings || ''}
                            onChange={(e) => setFormData({ ...formData, keyFindings: e.target.value })}
                            placeholder="Enter each finding on a new line..."
                            required
                          />
                        </FormGroup>
                        <FormGroup>
                          <label>Market Context</label>
                          <textarea
                            rows="3"
                            value={formData.marketContext || ''}
                            onChange={(e) => setFormData({ ...formData, marketContext: e.target.value })}
                            placeholder="Industry context and trends..."
                            required
                          />
                        </FormGroup>
                      </>
                    )}
                    {(modalType === 'competitive-position' || modalType === 'methodology') && (
                      <FormGroup>
                        <label>Content</label>
                        <textarea
                          rows="6"
                          value={formData.content || ''}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          placeholder="Section content..."
                          required
                        />
                      </FormGroup>
                    )}
                  </ModalBody>
                  <ModalFooter>
                    <CancelButton type="button" onClick={() => setShowModal(false)}>
                      Cancel
                    </CancelButton>
                    <SaveButton type="submit">
                      {editingItem ? 'Save Changes' : 'Add'}
                    </SaveButton>
                  </ModalFooter>
                </form>
              </ModalContent>
            </ModalOverlay>
          )}
        </AnimatePresence>
      </PageContainer>
    </>
  );
};

export default IndustryBenchmarkingReport;


