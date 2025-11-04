import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
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
  FiDownload
} from 'react-icons/fi';
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

const ReportContainer = styled(motion.div)`
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin: 40px 0;
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
  padding: 40px;
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin: 24px 0;
`;

const PillarCard = styled.div`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.12);
    transform: translateY(-2px);
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
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
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

const IndustryBenchmarkingReport = ({ assessment, benchmarkData, overallScore, pillarScores }) => {
  const [collapsedSections, setCollapsedSections] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
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
        <div style={{ marginTop: '24px', display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
          <DownloadButton 
            onClick={handleDownloadReport}
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <FiDownload size={18} />
            Download Report
          </DownloadButton>
        </div>
      </ReportHeader>

      {/* Executive Summary */}
      <Section>
        <SectionHeader>
          <SectionTitle>
            <FiZap color="#fbbf24" />
            Executive Summary
          </SectionTitle>
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
            <MetricLabel>Overall Percentile</MetricLabel>
            <MetricValue>{competitivePositioning?.overallRanking?.percentile}th</MetricValue>
            <MetricSubtext>
              <FiAward color="#f59e0b" />
              {competitivePositioning?.overallRanking?.versusBenchmark}
            </MetricSubtext>
          </MetricCard>

          <MetricCard $bg="#dbeafe" $border="#3b82f6" $accent="#2563eb">
            <MetricLabel>Peer Group</MetricLabel>
            <MetricValue style={{ fontSize: '1rem', lineHeight: 1.4, marginTop: '12px' }}>
              {competitivePositioning?.overallRanking?.peerGroup}
            </MetricValue>
          </MetricCard>

          <MetricCard $bg="#e0f2fe" $border="#0ea5e9" $accent="#0284c7">
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
        <SectionHeader $collapsible onClick={() => toggleSection('pillars')}>
          <SectionTitle>
            <FiBarChart2 color="#3b82f6" />
            Detailed Pillar Analysis
            <SectionBadge $color="#3b82f6">6 Pillars</SectionBadge>
          </SectionTitle>
          {collapsedSections['pillars'] ? <FiChevronDown size={24} /> : <FiChevronUp size={24} />}
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
                      <PillarHeader>
                        <PillarName>{data.pillar || pillarId}</PillarName>
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
    </>
  );
};

export default IndustryBenchmarkingReport;


