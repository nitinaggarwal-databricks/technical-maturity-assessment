import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiDatabase,
  FiCpu,
  FiDownload,
  FiRefreshCw,
  FiInfo,
  FiCheckCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

// =====================
// STYLED COMPONENTS
// =====================

const CalculatorContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 40px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const CalculatorHeader = styled.div`
  margin-bottom: 32px;
`;

const CalculatorTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CalculatorSubtitle = styled.p`
  font-size: 1rem;
  color: #64748b;
  margin: 0;
`;

const AssumptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AssumptionCard = styled.div`
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  }
`;

const AssumptionLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
`;

const SliderContainer = styled.div`
  margin-bottom: 8px;
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(
    to right,
    #3b82f6 0%,
    #3b82f6 ${props => props.$percentage}%,
    #e2e8f0 ${props => props.$percentage}%,
    #e2e8f0 100%
  );
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.2);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
    }
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.2);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
    }
  }
`;

const SliderValue = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 8px;

  .current-value {
    font-weight: 700;
    color: #3b82f6;
    font-size: 1rem;
  }
`;

const ScenarioTabs = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  border-bottom: 2px solid #e2e8f0;
`;

const ScenarioTab = styled.button`
  padding: 12px 24px;
  border: none;
  background: none;
  font-size: 0.938rem;
  font-weight: 600;
  color: ${props => props.$active ? '#3b82f6' : '#64748b'};
  border-bottom: 3px solid ${props => props.$active ? '#3b82f6' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: -2px;

  &:hover {
    color: #3b82f6;
  }
`;

const ResultsSection = styled(motion.div)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  color: white;
  margin-bottom: 24px;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ResultCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ResultLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  opacity: 0.9;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ResultValue = styled(motion.div)`
  font-size: 2rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ResultBreakdown = styled.div`
  font-size: 0.813rem;
  opacity: 0.85;
  line-height: 1.6;
`;

const TotalROICard = styled.div`
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  text-align: center;
`;

const TotalROILabel = styled.div`
  font-size: 1rem;
  font-weight: 600;
  opacity: 0.9;
  margin-bottom: 12px;
`;

const TotalROIValue = styled(motion.div)`
  font-size: 3rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const TotalROISubtext = styled.div`
  font-size: 0.938rem;
  opacity: 0.9;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled(motion.button)`
  padding: 12px 24px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.938rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: white;
  }
`;

const InfoBox = styled.div`
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
  padding: 16px;
  margin-top: 24px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const InfoText = styled.div`
  font-size: 0.875rem;
  color: #1e40af;
  line-height: 1.6;
`;

// =====================
// COMPONENT
// =====================

const ROICalculator = ({ results, assessment }) => {
  const [scenario, setScenario] = useState('realistic');
  const [assumptions, setAssumptions] = useState({
    teamSize: 50,
    dataVolumeTB: 100,
    currentInfraCost: 500000,
    avgEngineerSalary: 150000,
    currentDataQualityIssues: 20
  });

  const [animatedValues, setAnimatedValues] = useState({
    savings: 0,
    revenue: 0,
    totalValue: 0,
    roi: 0
  });

  // Calculate ROI based on assumptions and scenario
  const calculateROI = () => {
    const multipliers = {
      conservative: { infra: 0.25, productivity: 0.20, quality: 0.15, revenue: 0.10 },
      realistic: { infra: 0.40, productivity: 0.35, quality: 0.25, revenue: 0.20 },
      optimistic: { infra: 0.60, productivity: 0.50, quality: 0.40, revenue: 0.35 }
    };

    const m = multipliers[scenario];

    // Infrastructure savings
    const infraSavings = assumptions.currentInfraCost * m.infra;

    // Engineering productivity (time saved = cost saved)
    const productivitySavings = (assumptions.teamSize * assumptions.avgEngineerSalary) * m.productivity;

    // Data quality improvements (reduced rework, better decisions)
    const qualitySavings = (assumptions.currentDataQualityIssues / 100) * 
                          (assumptions.teamSize * assumptions.avgEngineerSalary * 0.3) * 
                          m.quality;

    const totalSavings = infraSavings + productivitySavings + qualitySavings;

    // Revenue opportunities (new use cases enabled)
    const genAIRevenue = assumptions.teamSize * 50000 * m.revenue; // $50K per engineer in GenAI value
    const mlRevenue = assumptions.dataVolumeTB * 5000 * m.revenue; // $5K per TB in ML value
    const dataMonetization = assumptions.dataVolumeTB * 2000 * m.revenue; // $2K per TB in data products

    const totalRevenue = genAIRevenue + mlRevenue + dataMonetization;

    // Databricks investment (simplified)
    const databricksInvestment = 
      (assumptions.dataVolumeTB * 3000) + // Storage + compute
      (assumptions.teamSize * 10000); // Per-user licensing

    // 3-year value
    const threeYearValue = (totalSavings + totalRevenue) * 3;
    const threeYearInvestment = databricksInvestment * 3;
    const netROI = threeYearValue - threeYearInvestment;
    const roiRatio = threeYearValue / threeYearInvestment;

    return {
      savings: totalSavings,
      savingsBreakdown: {
        infra: infraSavings,
        productivity: productivitySavings,
        quality: qualitySavings
      },
      revenue: totalRevenue,
      revenueBreakdown: {
        genAI: genAIRevenue,
        ml: mlRevenue,
        monetization: dataMonetization
      },
      threeYearValue,
      investment: threeYearInvestment,
      netROI,
      roiRatio,
      paybackMonths: Math.ceil((databricksInvestment / (totalSavings + totalRevenue)) * 12)
    };
  };

  const roi = calculateROI();

  // Animate numbers when they change
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedValues({
        savings: roi.savings * progress,
        revenue: roi.revenue * progress,
        totalValue: roi.threeYearValue * progress,
        roi: roi.netROI * progress
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedValues({
          savings: roi.savings,
          revenue: roi.revenue,
          totalValue: roi.threeYearValue,
          roi: roi.netROI
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [scenario, assumptions]);

  const handleAssumptionChange = (key, value) => {
    setAssumptions(prev => ({ ...prev, [key]: parseInt(value) }));
  };

  const handleDownloadBusinessCase = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      // Header
      doc.setFillColor(102, 126, 234);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Databricks ROI Business Case', pageWidth / 2, 25, { align: 'center' });
      
      yPos = 50;

      // Organization Info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Prepared for: ${assessment?.organizationName || 'Your Organization'}`, 20, yPos);
      yPos += 7;
      doc.text(`Industry: ${assessment?.industry || 'Technology'}`, 20, yPos);
      yPos += 7;
      doc.text(`Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 20, yPos);
      yPos += 7;
      doc.text(`Scenario: ${scenario.charAt(0).toUpperCase() + scenario.slice(1)}`, 20, yPos);
      yPos += 15;

      // Assumptions Section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text('Assumptions', 20, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`• Team Size: ${assumptions.teamSize} engineers`, 25, yPos);
      yPos += 7;
      doc.text(`• Data Volume: ${assumptions.dataVolumeTB} TB`, 25, yPos);
      yPos += 7;
      doc.text(`• Current Infrastructure Cost: ${formatCurrency(assumptions.currentInfraCost)} annually`, 25, yPos);
      yPos += 7;
      doc.text(`• Average Engineer Salary: ${formatCurrency(assumptions.avgEngineerSalary)}`, 25, yPos);
      yPos += 15;

      // Annual Savings Section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text('Annual Savings', 20, yPos);
      yPos += 10;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text(formatCurrency(roi.savings), 25, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`Infrastructure Cost Reduction: ${formatCurrency(roi.savingsBreakdown.infra)}`, 30, yPos);
      yPos += 7;
      doc.text(`Engineering Productivity Gains: ${formatCurrency(roi.savingsBreakdown.productivity)}`, 30, yPos);
      yPos += 7;
      doc.text(`Data Quality Improvements: ${formatCurrency(roi.savingsBreakdown.quality)}`, 30, yPos);
      yPos += 15;

      // New Revenue Section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text('New Revenue Opportunities', 20, yPos);
      yPos += 10;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text(formatCurrency(roi.revenue), 25, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`GenAI Applications: ${formatCurrency(roi.revenueBreakdown.genAI)}`, 30, yPos);
      yPos += 7;
      doc.text(`ML Model Deployment: ${formatCurrency(roi.revenueBreakdown.ml)}`, 30, yPos);
      yPos += 7;
      doc.text(`Data Monetization: ${formatCurrency(roi.revenueBreakdown.monetization)}`, 30, yPos);
      yPos += 15;

      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }

      // 3-Year ROI Section
      doc.setFillColor(102, 126, 234);
      doc.roundedRect(15, yPos - 5, pageWidth - 30, 50, 3, 3, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('3-YEAR NET ROI', pageWidth / 2, yPos + 5, { align: 'center' });
      
      doc.setFontSize(28);
      doc.text(formatCurrency(roi.netROI), pageWidth / 2, yPos + 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`${roi.roiRatio.toFixed(1)}x return on investment • ${roi.paybackMonths} month payback`, pageWidth / 2, yPos + 32, { align: 'center' });
      
      yPos += 60;

      // Investment Breakdown
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total 3-Year Value: ${formatCurrency(roi.threeYearValue)}`, 20, yPos);
      yPos += 7;
      doc.text(`Databricks Investment: ${formatCurrency(roi.investment)}`, 20, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'bold');
      doc.text(`Net ROI: ${formatCurrency(roi.netROI)}`, 20, yPos);
      yPos += 15;

      // Disclaimer
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      const disclaimerText = 'Calculations based on industry benchmarks from Forrester Total Economic Impact studies and Databricks customer case studies. Actual results vary by organization. Conservative scenario uses lower-bound estimates, Realistic uses median values, and Optimistic uses upper-quartile results.';
      const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 40);
      doc.text(disclaimerLines, 20, yPos);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Generated by Databricks Maturity Assessment Platform', pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Save the PDF
      const fileName = `Databricks_ROI_Business_Case_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast.success('Business case PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const handleReset = () => {
    setAssumptions({
      teamSize: 50,
      dataVolumeTB: 100,
      currentInfraCost: 500000,
      avgEngineerSalary: 150000,
      currentDataQualityIssues: 20
    });
    setScenario('realistic');
    toast.success('Reset to default assumptions');
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <CalculatorContainer>
      <CalculatorHeader>
        <CalculatorTitle>
          <FiDollarSign />
          Interactive ROI Calculator
        </CalculatorTitle>
        <CalculatorSubtitle>
          Customize assumptions to see your specific business case for Databricks
        </CalculatorSubtitle>
      </CalculatorHeader>

      {/* Scenario Tabs */}
      <ScenarioTabs>
        <ScenarioTab 
          $active={scenario === 'conservative'} 
          onClick={() => setScenario('conservative')}
        >
          Conservative
        </ScenarioTab>
        <ScenarioTab 
          $active={scenario === 'realistic'} 
          onClick={() => setScenario('realistic')}
        >
          Realistic
        </ScenarioTab>
        <ScenarioTab 
          $active={scenario === 'optimistic'} 
          onClick={() => setScenario('optimistic')}
        >
          Optimistic
        </ScenarioTab>
      </ScenarioTabs>

      {/* Assumptions */}
      <AssumptionsGrid>
        <AssumptionCard>
          <AssumptionLabel>
            <FiUsers />
            Data & Engineering Team Size
          </AssumptionLabel>
          <SliderContainer>
            <Slider
              type="range"
              min="10"
              max="500"
              step="10"
              value={assumptions.teamSize}
              onChange={(e) => handleAssumptionChange('teamSize', e.target.value)}
              $percentage={(assumptions.teamSize - 10) / (500 - 10) * 100}
            />
          </SliderContainer>
          <SliderValue>
            <span className="current-value">{assumptions.teamSize} engineers</span>
            <span>10 - 500</span>
          </SliderValue>
        </AssumptionCard>

        <AssumptionCard>
          <AssumptionLabel>
            <FiDatabase />
            Data Volume (TB)
          </AssumptionLabel>
          <SliderContainer>
            <Slider
              type="range"
              min="10"
              max="10000"
              step="10"
              value={assumptions.dataVolumeTB}
              onChange={(e) => handleAssumptionChange('dataVolumeTB', e.target.value)}
              $percentage={(assumptions.dataVolumeTB - 10) / (10000 - 10) * 100}
            />
          </SliderContainer>
          <SliderValue>
            <span className="current-value">{assumptions.dataVolumeTB} TB</span>
            <span>10 - 10,000 TB</span>
          </SliderValue>
        </AssumptionCard>

        <AssumptionCard>
          <AssumptionLabel>
            <FiCpu />
            Current Infrastructure Cost (Annual)
          </AssumptionLabel>
          <SliderContainer>
            <Slider
              type="range"
              min="100000"
              max="10000000"
              step="100000"
              value={assumptions.currentInfraCost}
              onChange={(e) => handleAssumptionChange('currentInfraCost', e.target.value)}
              $percentage={(assumptions.currentInfraCost - 100000) / (10000000 - 100000) * 100}
            />
          </SliderContainer>
          <SliderValue>
            <span className="current-value">{formatCurrency(assumptions.currentInfraCost)}</span>
            <span>$100K - $10M</span>
          </SliderValue>
        </AssumptionCard>

        <AssumptionCard>
          <AssumptionLabel>
            <FiDollarSign />
            Average Engineer Salary
          </AssumptionLabel>
          <SliderContainer>
            <Slider
              type="range"
              min="80000"
              max="300000"
              step="10000"
              value={assumptions.avgEngineerSalary}
              onChange={(e) => handleAssumptionChange('avgEngineerSalary', e.target.value)}
              $percentage={(assumptions.avgEngineerSalary - 80000) / (300000 - 80000) * 100}
            />
          </SliderContainer>
          <SliderValue>
            <span className="current-value">{formatCurrency(assumptions.avgEngineerSalary)}</span>
            <span>$80K - $300K</span>
          </SliderValue>
        </AssumptionCard>
      </AssumptionsGrid>

      {/* Results */}
      <ResultsSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ResultsGrid>
          <ResultCard>
            <ResultLabel>Annual Savings</ResultLabel>
            <ResultValue>
              {formatCurrency(animatedValues.savings)}
            </ResultValue>
            <ResultBreakdown>
              ├─ Infrastructure: {formatCurrency(roi.savingsBreakdown.infra)}<br />
              ├─ Productivity: {formatCurrency(roi.savingsBreakdown.productivity)}<br />
              └─ Data Quality: {formatCurrency(roi.savingsBreakdown.quality)}
            </ResultBreakdown>
          </ResultCard>

          <ResultCard>
            <ResultLabel>New Revenue Opportunities</ResultLabel>
            <ResultValue>
              {formatCurrency(animatedValues.revenue)}
            </ResultValue>
            <ResultBreakdown>
              ├─ GenAI Applications: {formatCurrency(roi.revenueBreakdown.genAI)}<br />
              ├─ ML Deployment: {formatCurrency(roi.revenueBreakdown.ml)}<br />
              └─ Data Monetization: {formatCurrency(roi.revenueBreakdown.monetization)}
            </ResultBreakdown>
          </ResultCard>
        </ResultsGrid>

        <TotalROICard>
          <TotalROILabel>3-YEAR NET ROI</TotalROILabel>
          <TotalROIValue>
            {formatCurrency(animatedValues.roi)}
          </TotalROIValue>
          <TotalROISubtext>
            <FiCheckCircle style={{ display: 'inline', marginRight: '6px' }} />
            {roi.roiRatio.toFixed(1)}x return on investment • {roi.paybackMonths} month payback
          </TotalROISubtext>
        </TotalROICard>

        <ActionButtons>
          <ActionButton
            onClick={handleDownloadBusinessCase}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiDownload />
            Download Business Case
          </ActionButton>
          <ActionButton
            onClick={handleReset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiRefreshCw />
            Reset to Defaults
          </ActionButton>
        </ActionButtons>
      </ResultsSection>

      <InfoBox>
        <FiInfo size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
        <InfoText>
          <strong>How we calculate ROI:</strong> Based on industry benchmarks from Forrester Total Economic Impact studies and Databricks customer case studies. 
          Actual results vary by organization. Conservative scenario uses lower-bound estimates, Realistic uses median values, and Optimistic uses upper-quartile results.
        </InfoText>
      </InfoBox>
    </CalculatorContainer>
  );
};

export default ROICalculator;

