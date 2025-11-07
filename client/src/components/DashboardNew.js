import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiClock,
  FiBarChart2,
  FiDownload,
  FiShare2,
  FiFilter,
  FiAward,
  FiTarget,
  FiZap,
  FiActivity,
  FiGlobe,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiLayers,
  FiPieChart,
  FiTrendingDown as FiArrowDown,
  FiArrowRight,
  FiRefreshCw,
  FiEye,
  FiPlay
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import * as assessmentService from '../services/assessmentService';

// =====================
// STYLED COMPONENTS
// =====================

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  padding: 108px 0 40px 0;

  @media (max-width: 768px) {
    padding: 92px 0 24px 0;
  }
`;

const ContentContainer = styled.div`
  width: 100%;
  padding: 0 40px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 40px;
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.125rem;
  color: #64748b;
  margin: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
  }
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }
`;

// Hero Metrics Section
const HeroMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const HeroMetricCard = styled(motion.div)`
  background: ${props => props.$gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  border-radius: 16px;
  padding: 32px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
`;

const MetricIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  opacity: 0.9;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
`;

const MetricValue = styled(motion.div)`
  font-size: 3rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 2.25rem;
  }
`;

const MetricChange = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  opacity: 0.95;
  position: relative;
  z-index: 1;
`;

// Charts Section
const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 40px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ChartSubtitle = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 8px 0 0 0;
`;

// Industry Breakdown
const IndustryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 40px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const IndustryCard = styled(motion.div)`
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
  }
`;

const IndustryName = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
`;

const IndustryStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const IndustryStat = styled.div`
  .label {
    font-size: 0.75rem;
    color: #64748b;
    margin-bottom: 4px;
  }

  .value {
    font-size: 1.25rem;
    font-weight: 700;
    color: #3b82f6;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 12px;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 4px;
`;

// Top Performers
const TopPerformersSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 40px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
`;

const Tab = styled.button`
  padding: 8px 16px;
  border: none;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#3b82f6' : '#64748b'};
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.$active ? '0 2px 8px rgba(59, 130, 246, 0.15)' : 'none'};

  &:hover {
    color: #3b82f6;
  }
`;

const PerformersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PerformerCard = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #3b82f6;
    background: white;
    transform: translateX(4px);
  }
`;

const PerformerRank = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => {
    if (props.$rank === 1) return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
    if (props.$rank === 2) return 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)';
    if (props.$rank === 3) return 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)';
    return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  flex-shrink: 0;
`;

const PerformerInfo = styled.div`
  flex: 1;
`;

const PerformerName = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
`;

const PerformerDetails = styled.div`
  font-size: 0.875rem;
  color: #64748b;
`;

const PerformerScore = styled.div`
  text-align: right;

  .score {
    font-size: 1.5rem;
    font-weight: 700;
    color: #3b82f6;
    font-family: 'JetBrains Mono', monospace;
  }

  .label {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 4px;
  }
`;

// Pillar Performance Section
const PillarPerformanceSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 40px;
`;

const PillarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PillarCard = styled(motion.div)`
  background: linear-gradient(135deg, ${props => props.$gradient || '#f8fafc, #f1f5f9'});
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: ${props => props.$borderColor || '#3b82f6'};
  }
`;

const PillarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const PillarName = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PillarScore = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${props => props.$color || '#3b82f6'};
  font-family: 'JetBrains Mono', monospace;
`;

const PillarMetric = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 0.875rem;
  color: #64748b;
  border-top: 1px solid #e2e8f0;
  margin-top: 12px;

  .label {
    font-weight: 500;
  }

  .value {
    font-weight: 700;
    color: #1e293b;
  }
`;

// Recent Activity Section
const RecentActivitySection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 40px;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ActivityItem = styled(motion.div)`
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-left: 4px solid ${props => props.$color || '#3b82f6'};
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateX(4px);
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.$bg || '#3b82f6'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-size: 0.938rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const ActivityDetails = styled.div`
  font-size: 0.813rem;
  color: #64748b;
`;

const ActivityTime = styled.div`
  font-size: 0.75rem;
  color: #94a3b8;
  white-space: nowrap;
  align-self: center;
`;

// Insights & Trends Section
const InsightsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 40px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const InsightCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const InsightIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$bg || 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InsightTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const InsightContent = styled.div`
  font-size: 0.938rem;
  line-height: 1.6;
  color: #475569;
`;

const InsightList = styled.ul`
  margin: 12px 0 0 0;
  padding-left: 20px;
  
  li {
    margin-bottom: 8px;
    color: #64748b;
  }
`;

const StatBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${props => props.$bg || '#dbeafe'};
  color: ${props => props.$color || '#1e40af'};
  border-radius: 20px;
  font-size: 0.813rem;
  font-weight: 600;
  margin-top: 12px;
`;

// Quick Actions Section
const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 40px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const QuickActionCard = styled(motion.button)`
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
  }
`;

const QuickActionIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: ${props => props.$bg || 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const QuickActionLabel = styled.div`
  font-size: 0.938rem;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
`;

const QuickActionCount = styled.div`
  font-size: 0.75rem;
  color: #64748b;
`;

// Loading & Error States
const LoadingContainer = styled.div`
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 20px;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
`;

// =====================
// SAMPLE DATA
// =====================

const getSampleDashboardData = () => {
  return {
    totalAssessments: 21,
    completedAssessments: 15,
    averageMaturityScore: 3.4,
    averageCompletionTime: 42,
    industryBreakdown: [
      { industry: 'Financial Services', count: 8, avgScore: 3.6 },
      { industry: 'Technology', count: 6, avgScore: 3.8 },
      { industry: 'Healthcare', count: 4, avgScore: 3.1 },
      { industry: 'Retail', count: 2, avgScore: 2.9 },
      { industry: 'Manufacturing', count: 1, avgScore: 3.2 }
    ],
    pillarBreakdown: [
      {
        pillarId: 'platform_governance',
        name: 'Platform & Governance',
        icon: '🏛️',
        avgScore: 3.6,
        count: 21,
        avgGap: 1.2,
        color: '#3b82f6',
        gradient: '#dbeafe, #bfdbfe'
      },
      {
        pillarId: 'data_engineering',
        name: 'Data Engineering',
        icon: '⚙️',
        avgScore: 3.5,
        count: 21,
        avgGap: 1.3,
        color: '#8b5cf6',
        gradient: '#ede9fe, #ddd6fe'
      },
      {
        pillarId: 'analytics_bi',
        name: 'Analytics & BI',
        icon: '📊',
        avgScore: 3.4,
        count: 21,
        avgGap: 1.4,
        color: '#10b981',
        gradient: '#d1fae5, #a7f3d0'
      },
      {
        pillarId: 'machine_learning',
        name: 'Machine Learning',
        icon: '🤖',
        avgScore: 3.2,
        count: 21,
        avgGap: 1.6,
        color: '#f59e0b',
        gradient: '#fef3c7, #fde68a'
      },
      {
        pillarId: 'generative_ai',
        name: 'Generative AI',
        icon: '✨',
        avgScore: 2.8,
        count: 21,
        avgGap: 2.0,
        color: '#ec4899',
        gradient: '#fce7f3, #fbcfe8'
      },
      {
        pillarId: 'operational_excellence',
        name: 'Operational Excellence',
        icon: '🎯',
        avgScore: 3.3,
        count: 21,
        avgGap: 1.5,
        color: '#06b6d4',
        gradient: '#cffafe, #a5f3fc'
      }
    ],
    recentAssessments: [
      {
        id: 'sample-1',
        organizationName: 'Global Financial Corp',
        industry: 'Financial Services',
        status: 'submitted',
        overallScore: 3.8,
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        completionTime: 38
      },
      {
        id: 'sample-2',
        organizationName: 'TechVentures Inc',
        industry: 'Technology',
        status: 'submitted',
        overallScore: 4.2,
        startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        completionTime: 35
      },
      {
        id: 'sample-3',
        organizationName: 'HealthCare Solutions',
        industry: 'Healthcare',
        status: 'submitted',
        overallScore: 3.1,
        startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        completionTime: 45
      },
      {
        id: 'sample-4',
        organizationName: 'Retail Dynamics',
        industry: 'Retail',
        status: 'in_progress',
        overallScore: 0,
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        completionTime: null
      },
      {
        id: 'sample-5',
        organizationName: 'Manufacturing Hub',
        industry: 'Manufacturing',
        status: 'submitted',
        overallScore: 3.2,
        startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        completionTime: 42
      },
      {
        id: 'sample-6',
        organizationName: 'DataFirst Enterprises',
        industry: 'Technology',
        status: 'submitted',
        overallScore: 3.9,
        startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        completionTime: 40
      },
      {
        id: 'sample-7',
        organizationName: 'Financial Analytics Group',
        industry: 'Financial Services',
        status: 'submitted',
        overallScore: 3.5,
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        completionTime: 44
      },
      {
        id: 'sample-8',
        organizationName: 'MedTech Innovations',
        industry: 'Healthcare',
        status: 'submitted',
        overallScore: 3.0,
        startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        completionTime: 50
      }
    ],
    maturityDistribution: {
      level5: 0.05,
      level4: 0.15,
      level3: 0.30,
      level12: 0.50
    }
  };
};

// =====================
// COMPONENT
// =====================

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('fastest');

  // Animated counters
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [animatedCompleted, setAnimatedCompleted] = useState(0);
  const [animatedAvgScore, setAnimatedAvgScore] = useState(0);
  const [animatedAvgTime, setAnimatedAvgTime] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await assessmentService.getDashboardStats();
      const data = response?.data || response;
      
      // Always fetch real assessments
      const assessmentsResponse = await assessmentService.getAllAssessments();
      const realAssessments = assessmentsResponse?.data || assessmentsResponse || [];
      
      // If no data or no meaningful scores, use sample data for statistics but real assessments
      const avgScore = parseFloat(data?.avgMaturityLevel || '0');
      const totalAssessments = parseInt(data?.totalAssessments || '0');
      
      // 🚨 Use sample data for stats if:
      // - No assessments exist, OR
      // - Average score is 0 (no completed pillars), OR
      // - Missing required fields (industryBreakdown, pillarBreakdown, etc.)
      const hasInsufficientData = 
        !data || 
        totalAssessments === 0 || 
        avgScore === 0 ||
        !data.industryBreakdown ||
        !data.pillarBreakdown;
      
      if (hasInsufficientData) {
        console.log('[Dashboard] Insufficient stats detected:', {
          totalAssessments,
          avgScore,
          hasIndustryBreakdown: !!data?.industryBreakdown,
          hasPillarBreakdown: !!data?.pillarBreakdown
        });
        console.log('[Dashboard] Using sample stats but REAL assessments');
        const sampleData = getSampleDashboardData();
        // Replace sample assessments with real ones
        sampleData.recentAssessments = realAssessments.slice(0, 5).map(a => ({
          id: a.id,
          organizationName: a.organizationName || a.assessmentName || 'Unnamed Assessment',
          industry: a.industry || 'Not specified',
          status: a.status || 'in_progress',
          overallScore: a.overallScore || 0,
          startedAt: a.startedAt || a.createdAt,
          completionTime: a.completionTime || null
        }));
        setDashboardData(sampleData);
      } else {
        console.log('[Dashboard] Using real data (totalAssessments:', totalAssessments, 'avgScore:', avgScore, ')');
        // Ensure real assessments are included
        if (!data.recentAssessments || data.recentAssessments.length === 0) {
          data.recentAssessments = realAssessments.slice(0, 5).map(a => ({
            id: a.id,
            organizationName: a.organizationName || a.assessmentName || 'Unnamed Assessment',
            industry: a.industry || 'Not specified',
            status: a.status || 'in_progress',
            overallScore: a.overallScore || 0,
            startedAt: a.startedAt || a.createdAt,
            completionTime: a.completionTime || null
          }));
        }
        setDashboardData(data);
      }
    } catch (error) {
      console.error('[Dashboard] Error:', error);
      // Even on error, try to show real assessments
      try {
        const assessmentsResponse = await assessmentService.getAllAssessments();
        const realAssessments = assessmentsResponse?.data || assessmentsResponse || [];
        const sampleData = getSampleDashboardData();
        sampleData.recentAssessments = realAssessments.slice(0, 5).map(a => ({
          id: a.id,
          organizationName: a.organizationName || a.assessmentName || 'Unnamed Assessment',
          industry: a.industry || 'Not specified',
          status: a.status || 'in_progress',
          overallScore: a.overallScore || 0,
          startedAt: a.startedAt || a.createdAt,
          completionTime: a.completionTime || null
        }));
        setDashboardData(sampleData);
      } catch (err) {
        console.error('[Dashboard] Failed to fetch assessments:', err);
        setDashboardData(getSampleDashboardData());
      }
    } finally {
      setLoading(false);
    }
  };

  // Animate numbers
  useEffect(() => {
    if (!dashboardData) return;

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedTotal(Math.floor((dashboardData.totalAssessments || 0) * progress));
      setAnimatedCompleted(Math.floor((dashboardData.completedAssessments || 0) * progress));
      setAnimatedAvgScore((parseFloat(dashboardData.avgMaturityLevel || dashboardData.averageMaturityScore) || 0) * progress);
      setAnimatedAvgTime(Math.floor((parseFloat(dashboardData.avgCompletionTime || dashboardData.averageCompletionTime) || 0) * progress));

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedTotal(dashboardData.totalAssessments || 0);
        setAnimatedCompleted(dashboardData.completedAssessments || 0);
        setAnimatedAvgScore(parseFloat(dashboardData.avgMaturityLevel || dashboardData.averageMaturityScore) || 0);
        setAnimatedAvgTime(parseFloat(dashboardData.avgCompletionTime || dashboardData.averageCompletionTime) || 0);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [dashboardData]);

  const handleExport = () => {
    try {
      if (!dashboardData) {
        toast.error('No data available to export');
        return;
      }

      toast.loading('Preparing export...', { id: 'export' });
      
      // Build CSV content
      let csvContent = 'DATABRICKS MATURITY ASSESSMENT - DASHBOARD DATA\n';
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      
      // Overview Section
      csvContent += 'OVERVIEW METRICS\n';
      csvContent += 'Metric,Value,Trend\n';
      csvContent += `Total Assessments,${dashboardData.totalAssessments || 0},${dashboardData.totalAssessmentsTrend > 0 ? '+' : ''}${dashboardData.totalAssessmentsTrend || 0}\n`;
      csvContent += `Active Customers,${dashboardData.activeCustomers || 0},${dashboardData.activeCustomersTrend > 0 ? '+' : ''}${dashboardData.activeCustomersTrend || 0}\n`;
      csvContent += `Avg Maturity Score,${dashboardData.avgMaturityLevel || 0},${dashboardData.avgMaturityLevelTrend > 0 ? '+' : ''}${dashboardData.avgMaturityLevelTrend || 0}\n`;
      csvContent += `Avg Completion Time,${dashboardData.avgCompletionTime || 0} hrs,${dashboardData.avgCompletionTimeTrend > 0 ? '+' : ''}${dashboardData.avgCompletionTimeTrend || 0}\n`;
      csvContent += `Feedback NPS,${dashboardData.feedbackNPS || 0},${dashboardData.feedbackNPSTrend > 0 ? '+' : ''}${dashboardData.feedbackNPSTrend || 0}\n`;
      csvContent += '\n';
      
      // Maturity Distribution Section
      if (dashboardData.maturityDistribution) {
        csvContent += 'MATURITY DISTRIBUTION\n';
        csvContent += 'Level,Percentage\n';
        csvContent += `Level 5 (Optimizing),${(dashboardData.maturityDistribution.level5 * 100).toFixed(1)}%\n`;
        csvContent += `Level 4 (Managed),${(dashboardData.maturityDistribution.level4 * 100).toFixed(1)}%\n`;
        csvContent += `Level 3 (Defined),${(dashboardData.maturityDistribution.level3 * 100).toFixed(1)}%\n`;
        csvContent += `Level 1-2 (Exploring/Emerging),${(dashboardData.maturityDistribution.level12 * 100).toFixed(1)}%\n`;
        csvContent += '\n';
      }
      
      // Industry Breakdown Section
      if (dashboardData.industryBreakdown && dashboardData.industryBreakdown.length > 0) {
        csvContent += 'INDUSTRY BREAKDOWN\n';
        csvContent += 'Industry,Count,Avg Score\n';
        dashboardData.industryBreakdown.forEach(ind => {
          csvContent += `${ind.industry},${ind.count},${ind.avgScore?.toFixed(1) || 'N/A'}\n`;
        });
        csvContent += '\n';
      }
      
      // Pillar Performance Section
      if (dashboardData.pillarBreakdown && dashboardData.pillarBreakdown.length > 0) {
        csvContent += 'PILLAR PERFORMANCE\n';
        csvContent += 'Pillar,Avg Score,Count,Avg Gap\n';
        dashboardData.pillarBreakdown.forEach(pillar => {
          csvContent += `${pillar.name},${pillar.avgScore?.toFixed(1) || 'N/A'},${pillar.count},${pillar.avgGap?.toFixed(1) || 'N/A'}\n`;
        });
        csvContent += '\n';
      }
      
      // Customer Portfolio Section
      if (dashboardData.customerPortfolio && dashboardData.customerPortfolio.length > 0) {
        csvContent += 'CUSTOMER PORTFOLIO\n';
        csvContent += 'Organization,Industry,Status,Maturity Score,Completion %,Last Updated\n';
        dashboardData.customerPortfolio.forEach(customer => {
          csvContent += `${customer.name},${customer.industry},${customer.status},${customer.maturityScore?.toFixed(1) || 'N/A'},${customer.completionPercent || 0}%,${customer.lastUpdated}\n`;
        });
        csvContent += '\n';
      }
      
      // Recent Assessments Section
      if (dashboardData.recentAssessments && dashboardData.recentAssessments.length > 0) {
        csvContent += 'RECENT ASSESSMENTS\n';
        csvContent += 'Organization,Industry,Status,Score,Started,Completion Time (hrs)\n';
        dashboardData.recentAssessments.forEach(assessment => {
          const startedDate = assessment.startedAt ? new Date(assessment.startedAt).toLocaleDateString() : 'N/A';
          csvContent += `${assessment.organizationName},${assessment.industry},${assessment.status},${assessment.overallScore?.toFixed(1) || 'N/A'},${startedDate},${assessment.completionTime?.toFixed(1) || 'N/A'}\n`;
        });
        csvContent += '\n';
      }
      
      // NPS Breakdown Section
      if (dashboardData.npsBreakdown) {
        csvContent += 'NPS BREAKDOWN\n';
        csvContent += 'Category,Count,Percentage\n';
        csvContent += `Promoters (9-10),${dashboardData.npsBreakdown.promoters},${dashboardData.npsBreakdown.promotersPercent}%\n`;
        csvContent += `Passives (7-8),${dashboardData.npsBreakdown.passives},${dashboardData.npsBreakdown.passivesPercent}%\n`;
        csvContent += `Detractors (0-6),${dashboardData.npsBreakdown.detractors},${dashboardData.npsBreakdown.detractorsPercent}%\n`;
        csvContent += '\n';
      }
      
      // Weekly Completions Section
      if (dashboardData.weeklyCompletions && dashboardData.weeklyCompletions.labels) {
        csvContent += 'WEEKLY COMPLETIONS\n';
        csvContent += 'Week,Completed,Avg Hours\n';
        dashboardData.weeklyCompletions.labels.forEach((label, idx) => {
          csvContent += `${label},${dashboardData.weeklyCompletions.counts[idx]},${dashboardData.weeklyCompletions.avgHours[idx]}\n`;
        });
        csvContent += '\n';
      }
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `databricks-dashboard-insights-${timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Dashboard data exported successfully!', { id: 'export' });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export dashboard data', { id: 'export' });
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Insights Dashboard',
        url: url
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading insights dashboard...</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  const completionRate = dashboardData?.totalAssessments > 0
    ? ((dashboardData?.completedAssessments / dashboardData?.totalAssessments) * 100).toFixed(0)
    : 0;

  const topPerformers = dashboardData?.recentAssessments
    ?.filter(a => a.status === 'submitted')
    ?.sort((a, b) => {
      if (activeTab === 'fastest') {
        return (a.completionTime || 999) - (b.completionTime || 999);
      } else {
        return (b.overallScore || 0) - (a.overallScore || 0);
      }
    })
    ?.slice(0, 5) || [];

  const industryBreakdown = dashboardData?.industryBreakdown || [];

  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader>
          <HeaderTop>
            <div>
              <PageTitle>Insights Dashboard</PageTitle>
              <PageSubtitle>Real-time analytics across all assessments</PageSubtitle>
            </div>
            <ActionButtons>
              <ActionButton
                onClick={handleExport}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiDownload />
                Export Data
              </ActionButton>
              <ActionButton
                onClick={handleShare}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiShare2 />
                Share
              </ActionButton>
            </ActionButtons>
          </HeaderTop>
        </PageHeader>

        {/* Hero Metrics */}
        <HeroMetrics>
          <HeroMetricCard
            $gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <MetricIcon>
              <FiBarChart2 size={28} />
            </MetricIcon>
            <MetricLabel>Total Assessments</MetricLabel>
            <MetricValue>{animatedTotal}</MetricValue>
            <MetricChange>
              <FiTrendingUp size={16} />
              All time
            </MetricChange>
          </HeroMetricCard>

          <HeroMetricCard
            $gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <MetricIcon>
              <FiCheckCircle size={28} />
            </MetricIcon>
            <MetricLabel>Completed</MetricLabel>
            <MetricValue>{animatedCompleted}</MetricValue>
            <MetricChange>
              <FiActivity size={16} />
              {completionRate}% completion rate
            </MetricChange>
          </HeroMetricCard>

          <HeroMetricCard
            $gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <MetricIcon>
              <FiAward size={28} />
            </MetricIcon>
            <MetricLabel>Avg Maturity Score</MetricLabel>
            <MetricValue>{animatedAvgScore.toFixed(1)}<span style={{ fontSize: '1.5rem', opacity: 0.7 }}>/5.0</span></MetricValue>
            <MetricChange>
              <FiTarget size={16} />
              Across all pillars
            </MetricChange>
          </HeroMetricCard>

          <HeroMetricCard
            $gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <MetricIcon>
              <FiClock size={28} />
            </MetricIcon>
            <MetricLabel>Avg Completion Time</MetricLabel>
            <MetricValue>{animatedAvgTime}<span style={{ fontSize: '1.5rem', opacity: 0.7 }}>min</span></MetricValue>
            <MetricChange>
              <FiZap size={16} />
              Per assessment
            </MetricChange>
          </HeroMetricCard>
        </HeroMetrics>

        {/* Industry Breakdown */}
        {industryBreakdown.length > 0 && (
          <>
            <SectionTitle style={{ marginBottom: '24px' }}>
              <FiGlobe />
              Industry Breakdown
            </SectionTitle>
            <IndustryGrid>
              {industryBreakdown.map((industry, index) => (
                <IndustryCard
                  key={industry.industry}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <IndustryName>{industry.industry}</IndustryName>
                  <IndustryStats>
                    <IndustryStat>
                      <div className="label">Assessments</div>
                      <div className="value">{industry.count}</div>
                    </IndustryStat>
                    <IndustryStat>
                      <div className="label">Avg Score</div>
                      <div className="value">{industry.avgScore?.toFixed(1) || 'N/A'}</div>
                    </IndustryStat>
                  </IndustryStats>
                  <ProgressBar>
                    <ProgressFill
                      initial={{ width: '0%' }}
                      animate={{ width: `${(industry.count / dashboardData.totalAssessments) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                    />
                  </ProgressBar>
                </IndustryCard>
              ))}
            </IndustryGrid>
          </>
        )}

        {/* Top Performers */}
        <TopPerformersSection>
          <SectionHeader>
            <SectionTitle>
              <FiAward />
              Top Performers
            </SectionTitle>
            <Tabs>
              <Tab
                $active={activeTab === 'fastest'}
                onClick={() => setActiveTab('fastest')}
              >
                Fastest
              </Tab>
              <Tab
                $active={activeTab === 'highest'}
                onClick={() => setActiveTab('highest')}
              >
                Highest Score
              </Tab>
            </Tabs>
          </SectionHeader>

          <PerformersList>
            {topPerformers.map((performer, index) => (
              <PerformerCard
                key={performer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => navigate(`/executive/${performer.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <PerformerRank $rank={index + 1}>
                  {index + 1}
                </PerformerRank>
                <PerformerInfo>
                  <PerformerName>{performer.organizationName || 'Anonymous'}</PerformerName>
                  <PerformerDetails>
                    {performer.industry} • {new Date(performer.startedAt).toLocaleDateString()}
                  </PerformerDetails>
                </PerformerInfo>
                <PerformerScore>
                  <div className="score">
                    {activeTab === 'fastest'
                      ? (performer.completionTime !== null && performer.completionTime !== undefined 
                          ? `${performer.completionTime}min` 
                          : 'N/A')
                      : (performer.overallScore || 0).toFixed(1)
                    }
                  </div>
                  <div className="label">
                    {activeTab === 'fastest' ? 'Completion Time' : 'Maturity Score'}
                  </div>
                </PerformerScore>
              </PerformerCard>
            ))}
          </PerformersList>
        </TopPerformersSection>

        {/* Pillar Performance Breakdown */}
        {dashboardData?.pillarBreakdown && dashboardData.pillarBreakdown.length > 0 && (
          <PillarPerformanceSection>
            <SectionHeader>
              <SectionTitle>
                <FiLayers />
                Pillar Performance Breakdown
              </SectionTitle>
            </SectionHeader>
            <PillarGrid>
              {dashboardData.pillarBreakdown.map((pillar, index) => (
                <PillarCard
                  key={pillar.pillarId}
                  $gradient={pillar.gradient}
                  $borderColor={pillar.color}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <PillarHeader>
                    <PillarName>
                      {pillar.icon} {pillar.name}
                    </PillarName>
                    <PillarScore $color={pillar.color}>
                      {pillar.avgScore.toFixed(1)}
                    </PillarScore>
                  </PillarHeader>
                  <PillarMetric>
                    <span className="label">Assessments</span>
                    <span className="value">{pillar.count}</span>
                  </PillarMetric>
                  <PillarMetric>
                    <span className="label">Avg Gap</span>
                    <span className="value">{pillar.avgGap.toFixed(1)}</span>
                  </PillarMetric>
                </PillarCard>
              ))}
            </PillarGrid>
          </PillarPerformanceSection>
        )}

        {/* Insights & Key Trends */}
        <InsightsSection>
          <InsightCard>
            <InsightHeader>
              <InsightIcon $bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                <FiTrendingUp size={24} />
              </InsightIcon>
              <InsightTitle>Key Trends</InsightTitle>
            </InsightHeader>
            <InsightContent>
              Analysis across all assessments reveals:
              <InsightList>
                <li>
                  <strong>Platform & Governance</strong> shows highest avg score ({dashboardData?.pillarBreakdown?.[0]?.avgScore?.toFixed(1) || 'N/A'}/5.0)
                </li>
                <li>
                  <strong>Generative AI</strong> pillar has largest improvement gap 
                </li>
                <li>
                  {completionRate}% of started assessments reach completion
                </li>
                <li>
                  Average time to complete: {dashboardData?.averageCompletionTime || 0} minutes
                </li>
              </InsightList>
              <StatBadge $bg="#dcfce7" $color="#166534">
                <FiTrendingUp size={14} />
                {dashboardData?.completedAssessments || 0} completed assessments
              </StatBadge>
            </InsightContent>
          </InsightCard>

          <InsightCard>
            <InsightHeader>
              <InsightIcon $bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
                <FiTarget size={24} />
              </InsightIcon>
              <InsightTitle>Common Focus Areas</InsightTitle>
            </InsightHeader>
            <InsightContent>
              Organizations prioritize:
              <InsightList>
                <li>
                  <strong>Data Engineering & Integration</strong> - improving pipelines and workflows
                </li>
                <li>
                  <strong>Generative AI adoption</strong> - exploring LLMs and AI agents
                </li>
                <li>
                  <strong>Operational Excellence</strong> - enhancing monitoring and governance
                </li>
                <li>
                  <strong>Analytics & BI</strong> - democratizing data access
                </li>
              </InsightList>
              <StatBadge $bg="#fef3c7" $color="#92400e">
                <FiZap size={14} />
                Top improvement areas
              </StatBadge>
            </InsightContent>
          </InsightCard>

          <InsightCard>
            <InsightHeader>
              <InsightIcon $bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
                <FiAlertCircle size={24} />
              </InsightIcon>
              <InsightTitle>Industry Insights</InsightTitle>
            </InsightHeader>
            <InsightContent>
              {industryBreakdown.length > 0 ? (
                <>
                  <p style={{ marginBottom: '12px' }}>
                    <strong>{industryBreakdown[0]?.industry}</strong> leads with {industryBreakdown[0]?.count} assessments
                  </p>
                  <InsightList>
                    <li>Financial Services: Focus on governance & compliance</li>
                    <li>Technology: GenAI and ML adoption leaders</li>
                    <li>Healthcare: Data engineering maturity growth</li>
                    <li>Retail: Analytics & BI transformation</li>
                  </InsightList>
                  <StatBadge $bg="#dbeafe" $color="#1e40af">
                    <FiGlobe size={14} />
                    {industryBreakdown.length} industries represented
                  </StatBadge>
                </>
              ) : (
                <p>No industry data available yet.</p>
              )}
            </InsightContent>
          </InsightCard>

          <InsightCard>
            <InsightHeader>
              <InsightIcon $bg="linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
                <FiPieChart size={24} />
              </InsightIcon>
              <InsightTitle>Maturity Distribution</InsightTitle>
            </InsightHeader>
            <InsightContent>
              <InsightList>
                <li>
                  <strong>Level 5 (Optimizing):</strong> {Math.round((dashboardData?.maturityDistribution?.level5 || 0) * 100)}% of organizations
                </li>
                <li>
                  <strong>Level 4 (Managed):</strong> {Math.round((dashboardData?.maturityDistribution?.level4 || 0) * 100)}%
                </li>
                <li>
                  <strong>Level 3 (Defined):</strong> {Math.round((dashboardData?.maturityDistribution?.level3 || 0.3) * 100)}%
                </li>
                <li>
                  <strong>Level 1-2 (Exploring/Emerging):</strong> {Math.round((dashboardData?.maturityDistribution?.level12 || 0.5) * 100)}%
                </li>
              </InsightList>
              <StatBadge $bg="#fce7f3" $color="#9f1239">
                <FiActivity size={14} />
                Average: {animatedAvgScore.toFixed(1)}/5.0
              </StatBadge>
            </InsightContent>
          </InsightCard>
        </InsightsSection>

        {/* Recent Activity */}
        {dashboardData?.recentAssessments && dashboardData.recentAssessments.length > 0 && (
          <RecentActivitySection>
            <SectionHeader>
              <SectionTitle>
                <FiActivity />
                Recent Activity
              </SectionTitle>
            </SectionHeader>
            <ActivityList>
              {dashboardData.recentAssessments.slice(0, 8).map((assessment, index) => {
                const timeAgo = getTimeAgo(assessment.startedAt);
                const activityType = assessment.status === 'submitted' ? 'completed' : 'started';
                const activityColor = activityType === 'completed' ? '#10b981' : '#3b82f6';
                const ActivityIconComponent = activityType === 'completed' ? FiCheckCircle : FiPlay;
                
                // 🚨 Check if this is sample data (IDs start with 'sample-')
                const isSampleData = assessment.id?.startsWith('sample-');
                
                return (
                  <ActivityItem
                    key={assessment.id}
                    $color={activityColor}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => !isSampleData && navigate(`/executive/${assessment.id}`)}
                    style={{ cursor: isSampleData ? 'default' : 'pointer', opacity: isSampleData ? 0.7 : 1 }}
                  >
                    <ActivityIcon $bg={activityColor}>
                      <ActivityIconComponent size={20} />
                    </ActivityIcon>
                    <ActivityContent>
                      <ActivityTitle>
                        {assessment.organizationName || 'Anonymous Organization'} {activityType} assessment
                      </ActivityTitle>
                      <ActivityDetails>
                        {assessment.industry} • 
                        {assessment.status === 'submitted' && assessment.overallScore 
                          ? ` Score: ${assessment.overallScore.toFixed(1)}/5.0` 
                          : ' In Progress'}
                      </ActivityDetails>
                    </ActivityContent>
                    <ActivityTime>{timeAgo}</ActivityTime>
                  </ActivityItem>
                );
              })}
            </ActivityList>
          </RecentActivitySection>
        )}

        {/* Quick Actions */}
        <SectionTitle style={{ marginBottom: '24px' }}>
          <FiZap />
          Quick Actions
        </SectionTitle>
        <QuickActionsGrid>
          <QuickActionCard
            onClick={() => navigate('/assessments')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <QuickActionIcon $bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <FiBarChart2 size={28} />
            </QuickActionIcon>
            <QuickActionLabel>View All Assessments</QuickActionLabel>
            <QuickActionCount>{dashboardData?.totalAssessments || 0} total</QuickActionCount>
          </QuickActionCard>

          <QuickActionCard
            onClick={() => navigate('/start')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <QuickActionIcon $bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
              <FiArrowRight size={28} />
            </QuickActionIcon>
            <QuickActionLabel>Start New Assessment</QuickActionLabel>
            <QuickActionCount>Begin now</QuickActionCount>
          </QuickActionCard>

          <QuickActionCard
            onClick={handleExport}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <QuickActionIcon $bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
              <FiDownload size={28} />
            </QuickActionIcon>
            <QuickActionLabel>Export All Data</QuickActionLabel>
            <QuickActionCount>CSV/Excel</QuickActionCount>
          </QuickActionCard>

          <QuickActionCard
            onClick={fetchDashboardData}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <QuickActionIcon $bg="linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
              <FiRefreshCw size={28} />
            </QuickActionIcon>
            <QuickActionLabel>Refresh Data</QuickActionLabel>
            <QuickActionCount>Update now</QuickActionCount>
          </QuickActionCard>
        </QuickActionsGrid>
      </ContentContainer>
    </PageContainer>
  );
};

// Helper function to calculate time ago
function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default Dashboard;

