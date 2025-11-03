import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiAlertTriangle,
  FiShield,
  FiX,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiInfo
} from 'react-icons/fi';

// =====================
// STYLED COMPONENTS
// =====================

const HeatmapContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 40px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const HeatmapHeader = styled.div`
  margin-bottom: 32px;
`;

const HeatmapTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeatmapSubtitle = styled.p`
  font-size: 1rem;
  color: #64748b;
  margin: 0;
`;

const MatrixContainer = styled.div`
  margin-bottom: 32px;
  overflow-x: auto;
`;

const Matrix = styled.div`
  display: grid;
  grid-template-columns: 120px repeat(3, 1fr);
  grid-template-rows: 40px repeat(3, 140px);
  gap: 12px;
  min-width: 600px;

  @media (max-width: 768px) {
    grid-template-rows: 40px repeat(3, 120px);
  }
`;

const AxisLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-align: center;
`;

const YAxisLabel = styled(AxisLabel)`
  writing-mode: ${props => props.$rotate ? 'vertical-rl' : 'horizontal-tb'};
  transform: ${props => props.$rotate ? 'rotate(180deg)' : 'none'};
`;

const MatrixCell = styled(motion.div)`
  background: ${props => props.$bg || '#f8fafc'};
  border: 2px solid ${props => props.$border || '#e2e8f0'};
  border-radius: 12px;
  padding: 12px;
  position: relative;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    z-index: 10;
  }

  @media (max-width: 768px) {
    min-height: 100px;
    padding: 8px;
  }
`;

const RiskBadge = styled(motion.div)`
  background: white;
  border: 2px solid ${props => props.$color || '#e2e8f0'};
  border-radius: 8px;
  padding: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.$color || '#64748b'};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => props.$color || '#e2e8f0'}40;
  }
`;

const RiskCount = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.$color || '#64748b'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
`;

const LegendContainer = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 24px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LegendColor = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: ${props => props.$color};
  border: 2px solid ${props => props.$border};
`;

const LegendText = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
`;

const LegendCount = styled.span`
  color: #94a3b8;
  font-weight: 400;
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const RiskDetails = styled.div`
  margin-bottom: 24px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 12px;
`;

const DetailLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  min-width: 120px;
`;

const DetailValue = styled.div`
  font-size: 0.938rem;
  font-weight: 600;
  color: #1e293b;
`;

const MitigationSection = styled.div`
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const MitigationTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: #1e40af;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MitigationList = styled.ul`
  margin: 0;
  padding-left: 20px;
  color: #1e40af;
  font-size: 0.875rem;
  line-height: 1.8;
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.938rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  width: 100%;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
  }
`;

// =====================
// RISK DATA
// =====================

const getSampleRisks = () => {
  return [
    {
      id: 'compliance-violation',
      title: 'Compliance & Governance Gaps',
      impact: 'high',
      probability: 'high',
      financialImpact: '$5M-$20M',
      description: 'Lack of centralized governance increases risk of data breaches, regulatory fines, and compliance violations.',
      mitigation: [
        'Deploy Unity Catalog for centralized governance',
        'Implement audit logging and access controls',
        'Establish data classification policies',
        'Conduct regular compliance audits'
      ],
      timeline: '4-6 weeks',
      priority: 'Critical'
    },
    {
      id: 'data-breach',
      title: 'Data Security & Privacy Risk',
      impact: 'high',
      probability: 'medium',
      financialImpact: '$2M-$10M',
      description: 'Inadequate security controls and access management expose sensitive data to unauthorized access.',
      mitigation: [
        'Enable row-level and column-level security',
        'Implement data masking and encryption',
        'Deploy threat detection and monitoring',
        'Establish incident response procedures'
      ],
      timeline: '6-8 weeks',
      priority: 'Critical'
    },
    {
      id: 'pipeline-failures',
      title: 'Data Pipeline Reliability Issues',
      impact: 'medium',
      probability: 'high',
      financialImpact: '$500K-$2M/yr',
      description: 'Unreliable data pipelines cause delays, data quality issues, and business disruptions.',
      mitigation: [
        'Implement Delta Live Tables for reliability',
        'Add automated testing and monitoring',
        'Enable data quality checks',
        'Set up alerting and notifications'
      ],
      timeline: '4-6 weeks',
      priority: 'High'
    },
    {
      id: 'cost-overruns',
      title: 'Cloud Cost Management',
      impact: 'medium',
      probability: 'medium',
      financialImpact: '$300K-$1M/yr',
      description: 'Unoptimized workloads and lack of cost monitoring lead to budget overruns.',
      mitigation: [
        'Implement automated cluster management',
        'Set up cost monitoring and alerts',
        'Optimize job configurations',
        'Enable auto-scaling and spot instances'
      ],
      timeline: '2-3 weeks',
      priority: 'Medium'
    },
    {
      id: 'genai-adoption',
      title: 'GenAI Competitive Lag',
      impact: 'medium',
      probability: 'high',
      financialImpact: '$1M-$5M opportunity cost',
      description: 'Slow GenAI adoption puts organization behind competitors in innovation and efficiency.',
      mitigation: [
        'Deploy Mosaic AI Agent Framework',
        'Implement Vector Search for RAG',
        'Train teams on Foundation Model APIs',
        'Start with high-impact use cases'
      ],
      timeline: '8-12 weeks',
      priority: 'High'
    },
    {
      id: 'ml-deployment-delays',
      title: 'ML Model Deployment Delays',
      impact: 'low',
      probability: 'medium',
      financialImpact: '$200K-$500K/yr',
      description: 'Manual ML deployment processes slow time-to-production and reduce model ROI.',
      mitigation: [
        'Deploy Mosaic AI Model Serving',
        'Implement MLOps best practices',
        'Automate model monitoring and retraining',
        'Establish model governance framework'
      ],
      timeline: '6-8 weeks',
      priority: 'Medium'
    }
  ];
};

const getRisks = (results) => {
  const risks = [];
  const categoryDetails = results?.categoryDetails || {};
  
  console.log('[RiskHeatmap] Generating risks from:', { categoryDetails, resultsKeys: Object.keys(results || {}) });
  
  // If no category details, generate sample risks
  if (Object.keys(categoryDetails).length === 0) {
    console.log('[RiskHeatmap] No category details found, using sample risks');
    return getSampleRisks();
  }
  
  // Analyze gaps and create risks
  Object.entries(categoryDetails).forEach(([id, data]) => {
    const gap = (data.futureScore || 0) - (data.currentScore || 0);
    const currentScore = data.currentScore || 0;
    
    // High impact, high probability risks
    if (gap >= 2 && currentScore < 2) {
      if (id.includes('governance') || id.includes('platform')) {
        risks.push({
          id: 'compliance-violation',
          title: 'Compliance & Governance Violation',
          impact: 'high',
          probability: 'high',
          financialImpact: '$5M-$20M',
          description: 'Lack of centralized governance increases risk of data breaches, regulatory fines, and compliance violations.',
          mitigation: [
            'Deploy Unity Catalog for centralized governance',
            'Implement audit logging and access controls',
            'Establish data classification policies',
            'Conduct regular compliance audits'
          ],
          timeline: '4-6 weeks',
          priority: 'Critical'
        });
      }
      
      if (id.includes('security') || id.includes('governance')) {
        risks.push({
          id: 'data-breach',
          title: 'Data Breach & Security Incident',
          impact: 'high',
          probability: 'high',
          financialImpact: '$2M-$10M',
          description: 'Inadequate security controls and access management expose sensitive data to unauthorized access.',
          mitigation: [
            'Enable row-level and column-level security',
            'Implement data masking and encryption',
            'Deploy threat detection and monitoring',
            'Establish incident response procedures'
          ],
          timeline: '6-8 weeks',
          priority: 'Critical'
        });
      }
    }
    
    // Medium impact risks
    if (gap >= 1.5 && currentScore < 3) {
      if (id.includes('data_engineering')) {
        risks.push({
          id: 'slow-insights',
          title: 'Slow Time-to-Insight',
          impact: 'medium',
          probability: 'high',
          financialImpact: '$500K-$1M/yr',
          description: 'Manual data pipelines and slow ingestion processes delay business insights and decision-making.',
          mitigation: [
            'Implement Lakeflow Connect for automated ingestion',
            'Deploy Delta Live Tables for pipeline orchestration',
            'Optimize data processing with Photon engine',
            'Establish SLAs for data freshness'
          ],
          timeline: '6-8 weeks',
          priority: 'High'
        });
      }
      
      if (id.includes('genai') || id.includes('generative')) {
        risks.push({
          id: 'no-genai-strategy',
          title: 'No GenAI Strategy',
          impact: 'medium',
          probability: 'medium',
          financialImpact: '$1M-$3M/yr',
          description: 'Competitors are leveraging GenAI for competitive advantage while your organization falls behind.',
          mitigation: [
            'Launch Mosaic AI Agent Framework pilot',
            'Deploy Vector Search for RAG applications',
            'Establish GenAI governance and ethics policies',
            'Train teams on GenAI best practices'
          ],
          timeline: '8-12 weeks',
          priority: 'High'
        });
      }
    }
    
    // Low impact risks
    if (currentScore < 3) {
      if (id.includes('ml') || id.includes('machine_learning')) {
        risks.push({
          id: 'ml-deployment-delays',
          title: 'ML Model Deployment Delays',
          impact: 'low',
          probability: 'medium',
          financialImpact: '$200K-$500K/yr',
          description: 'Manual ML deployment processes slow time-to-production and reduce model ROI.',
          mitigation: [
            'Deploy Mosaic AI Model Serving',
            'Implement MLOps best practices',
            'Automate model monitoring and retraining',
            'Establish model governance framework'
          ],
          timeline: '6-8 weeks',
          priority: 'Medium'
        });
      }
    }
  });
  
  // Deduplicate and limit to top risks
  const uniqueRisks = risks.filter((risk, index, self) =>
    index === self.findIndex((r) => r.id === risk.id)
  );
  
  return uniqueRisks.slice(0, 6); // Top 6 risks
};

// =====================
// COMPONENT
// =====================

const RiskHeatmap = ({ results, assessment }) => {
  const [selectedRisk, setSelectedRisk] = useState(null);
  
  const risks = getRisks(results);
  
  // Organize risks by impact and probability
  const riskMatrix = {
    'high-high': risks.filter(r => r.impact === 'high' && r.probability === 'high'),
    'high-medium': risks.filter(r => r.impact === 'high' && r.probability === 'medium'),
    'high-low': risks.filter(r => r.impact === 'high' && r.probability === 'low'),
    'medium-high': risks.filter(r => r.impact === 'medium' && r.probability === 'high'),
    'medium-medium': risks.filter(r => r.impact === 'medium' && r.probability === 'medium'),
    'medium-low': risks.filter(r => r.impact === 'medium' && r.probability === 'low'),
    'low-high': risks.filter(r => r.impact === 'low' && r.probability === 'high'),
    'low-medium': risks.filter(r => r.impact === 'low' && r.probability === 'medium'),
    'low-low': risks.filter(r => r.impact === 'low' && r.probability === 'low')
  };
  
  const criticalCount = riskMatrix['high-high'].length;
  const mediumCount = riskMatrix['high-medium'].length + riskMatrix['medium-high'].length + riskMatrix['medium-medium'].length;
  const lowCount = risks.length - criticalCount - mediumCount;
  
  const getCellColor = (impact, probability) => {
    if (impact === 'high' && probability === 'high') return { bg: '#fee2e2', border: '#ef4444' };
    if ((impact === 'high' && probability === 'medium') || (impact === 'medium' && probability === 'high')) return { bg: '#fef3c7', border: '#f59e0b' };
    if (impact === 'high' && probability === 'low') return { bg: '#fef3c7', border: '#f59e0b' };
    if (impact === 'medium' && probability === 'medium') return { bg: '#fef3c7', border: '#f59e0b' };
    return { bg: '#dcfce7', border: '#10b981' };
  };
  
  const getRiskColor = (impact, probability) => {
    if (impact === 'high' && probability === 'high') return '#ef4444';
    if ((impact === 'high' && probability === 'medium') || (impact === 'medium' && probability === 'high')) return '#f59e0b';
    return '#10b981';
  };
  
  return (
    <HeatmapContainer>
      <HeatmapHeader>
        <HeatmapTitle>
          <FiAlertTriangle />
          Risk Exposure Matrix
        </HeatmapTitle>
        <HeatmapSubtitle>
          Identify and prioritize risks based on business impact and probability
        </HeatmapSubtitle>
      </HeatmapHeader>
      
      <LegendContainer>
        <LegendItem>
          <LegendColor $color="#fee2e2" $border="#ef4444" />
          <LegendText>
            Critical <LegendCount>({criticalCount})</LegendCount>
          </LegendText>
        </LegendItem>
        <LegendItem>
          <LegendColor $color="#fef3c7" $border="#f59e0b" />
          <LegendText>
            Medium <LegendCount>({mediumCount})</LegendCount>
          </LegendText>
        </LegendItem>
        <LegendItem>
          <LegendColor $color="#dcfce7" $border="#10b981" />
          <LegendText>
            Low <LegendCount>({lowCount})</LegendCount>
          </LegendText>
        </LegendItem>
      </LegendContainer>
      
      <MatrixContainer>
        <Matrix>
          {/* Empty top-left corner */}
          <div />
          
          {/* X-axis labels (Probability) */}
          <AxisLabel>Low Probability</AxisLabel>
          <AxisLabel>Medium Probability</AxisLabel>
          <AxisLabel>High Probability</AxisLabel>
          
          {/* High Impact Row */}
          <YAxisLabel>High Impact</YAxisLabel>
          <MatrixCell {...getCellColor('high', 'low')}>
            {riskMatrix['high-low'].map(risk => (
              <RiskBadge
                key={risk.id}
                $color={getRiskColor(risk.impact, risk.probability)}
                onClick={() => setSelectedRisk(risk)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RiskCount $color={getRiskColor(risk.impact, risk.probability)}>!</RiskCount>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {risk.title}
                </span>
              </RiskBadge>
            ))}
          </MatrixCell>
          <MatrixCell {...getCellColor('high', 'medium')}>
            {riskMatrix['high-medium'].map(risk => (
              <RiskBadge
                key={risk.id}
                $color={getRiskColor(risk.impact, risk.probability)}
                onClick={() => setSelectedRisk(risk)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RiskCount $color={getRiskColor(risk.impact, risk.probability)}>!</RiskCount>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {risk.title}
                </span>
              </RiskBadge>
            ))}
          </MatrixCell>
          <MatrixCell {...getCellColor('high', 'high')}>
            {riskMatrix['high-high'].map(risk => (
              <RiskBadge
                key={risk.id}
                $color={getRiskColor(risk.impact, risk.probability)}
                onClick={() => setSelectedRisk(risk)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RiskCount $color={getRiskColor(risk.impact, risk.probability)}>!</RiskCount>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {risk.title}
                </span>
              </RiskBadge>
            ))}
          </MatrixCell>
          
          {/* Medium Impact Row */}
          <YAxisLabel>Medium Impact</YAxisLabel>
          <MatrixCell {...getCellColor('medium', 'low')}>
            {riskMatrix['medium-low'].map(risk => (
              <RiskBadge
                key={risk.id}
                $color={getRiskColor(risk.impact, risk.probability)}
                onClick={() => setSelectedRisk(risk)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RiskCount $color={getRiskColor(risk.impact, risk.probability)}>!</RiskCount>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {risk.title}
                </span>
              </RiskBadge>
            ))}
          </MatrixCell>
          <MatrixCell {...getCellColor('medium', 'medium')}>
            {riskMatrix['medium-medium'].map(risk => (
              <RiskBadge
                key={risk.id}
                $color={getRiskColor(risk.impact, risk.probability)}
                onClick={() => setSelectedRisk(risk)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RiskCount $color={getRiskColor(risk.impact, risk.probability)}>!</RiskCount>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {risk.title}
                </span>
              </RiskBadge>
            ))}
          </MatrixCell>
          <MatrixCell {...getCellColor('medium', 'high')}>
            {riskMatrix['medium-high'].map(risk => (
              <RiskBadge
                key={risk.id}
                $color={getRiskColor(risk.impact, risk.probability)}
                onClick={() => setSelectedRisk(risk)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RiskCount $color={getRiskColor(risk.impact, risk.probability)}>!</RiskCount>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {risk.title}
                </span>
              </RiskBadge>
            ))}
          </MatrixCell>
          
          {/* Low Impact Row */}
          <YAxisLabel>Low Impact</YAxisLabel>
          <MatrixCell {...getCellColor('low', 'low')}>
            {riskMatrix['low-low'].map(risk => (
              <RiskBadge
                key={risk.id}
                $color={getRiskColor(risk.impact, risk.probability)}
                onClick={() => setSelectedRisk(risk)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RiskCount $color={getRiskColor(risk.impact, risk.probability)}>!</RiskCount>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {risk.title}
                </span>
              </RiskBadge>
            ))}
          </MatrixCell>
          <MatrixCell {...getCellColor('low', 'medium')}>
            {riskMatrix['low-medium'].map(risk => (
              <RiskBadge
                key={risk.id}
                $color={getRiskColor(risk.impact, risk.probability)}
                onClick={() => setSelectedRisk(risk)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RiskCount $color={getRiskColor(risk.impact, risk.probability)}>!</RiskCount>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {risk.title}
                </span>
              </RiskBadge>
            ))}
          </MatrixCell>
          <MatrixCell {...getCellColor('low', 'high')}>
            {riskMatrix['low-high'].map(risk => (
              <RiskBadge
                key={risk.id}
                $color={getRiskColor(risk.impact, risk.probability)}
                onClick={() => setSelectedRisk(risk)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RiskCount $color={getRiskColor(risk.impact, risk.probability)}>!</RiskCount>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {risk.title}
                </span>
              </RiskBadge>
            ))}
          </MatrixCell>
        </Matrix>
      </MatrixContainer>
      
      {/* Risk Detail Modal */}
      <AnimatePresence>
        {selectedRisk && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedRisk(null)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <ModalTitle>
                  <FiAlertTriangle color={getRiskColor(selectedRisk.impact, selectedRisk.probability)} />
                  {selectedRisk.title}
                </ModalTitle>
                <CloseButton onClick={() => setSelectedRisk(null)}>
                  <FiX size={24} />
                </CloseButton>
              </ModalHeader>
              
              <RiskDetails>
                <DetailRow>
                  <DetailLabel>Financial Impact</DetailLabel>
                  <DetailValue style={{ color: '#ef4444' }}>
                    <FiDollarSign style={{ display: 'inline', marginRight: '4px' }} />
                    {selectedRisk.financialImpact}
                  </DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Priority</DetailLabel>
                  <DetailValue style={{ color: getRiskColor(selectedRisk.impact, selectedRisk.probability) }}>
                    {selectedRisk.priority}
                  </DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Timeline to Mitigate</DetailLabel>
                  <DetailValue>
                    <FiClock style={{ display: 'inline', marginRight: '4px' }} />
                    {selectedRisk.timeline}
                  </DetailValue>
                </DetailRow>
              </RiskDetails>
              
              <div style={{ marginBottom: '20px', color: '#475569', lineHeight: '1.6' }}>
                {selectedRisk.description}
              </div>
              
              <MitigationSection>
                <MitigationTitle>
                  <FiShield />
                  Mitigation Strategy
                </MitigationTitle>
                <MitigationList>
                  {selectedRisk.mitigation.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </MitigationList>
              </MitigationSection>
              
              <ActionButton onClick={() => setSelectedRisk(null)}>
                <FiCheckCircle />
                Got it, close
              </ActionButton>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </HeatmapContainer>
  );
};

export default RiskHeatmap;

