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
  FiCheckCircle
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import * as assessmentService from '../services/assessmentService';

// =====================
// STYLED COMPONENTS
// =====================

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  padding: 40px 24px;
  padding-top: 108px;

  @media (max-width: 768px) {
    padding: 24px 16px;
    padding-top: 92px;
  }
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
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
      setDashboardData(data);
    } catch (error) {
      console.error('[Dashboard] Error:', error);
      toast.error('Failed to load dashboard data');
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
      setAnimatedAvgScore((dashboardData.averageMaturityScore || 0) * progress);
      setAnimatedAvgTime(Math.floor((dashboardData.averageCompletionTime || 0) * progress));

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedTotal(dashboardData.totalAssessments || 0);
        setAnimatedCompleted(dashboardData.completedAssessments || 0);
        setAnimatedAvgScore(dashboardData.averageMaturityScore || 0);
        setAnimatedAvgTime(dashboardData.averageCompletionTime || 0);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [dashboardData]);

  const handleExport = () => {
    toast.success('Exporting dashboard data...');
    // TODO: Implement export
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
                onClick={() => navigate(`/results/${performer.id}`)}
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
                      ? `${performer.completionTime || 'N/A'}min`
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
      </ContentContainer>
    </PageContainer>
  );
};

export default Dashboard;

