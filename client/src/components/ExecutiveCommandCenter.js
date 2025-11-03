import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiDownload, FiShare2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as assessmentService from '../services/assessmentService';
import ExecutiveDashboard from './ExecutiveDashboard';
import ROICalculator from './ROICalculator';
import RiskHeatmap from './RiskHeatmap';
import IndustryBenchmarkingReport from './IndustryBenchmarkingReport';

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

const PageHeader = styled.div`
  max-width: 1200px;
  margin: 0 auto 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const BackButton = styled(motion.button)`
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
    transform: translateX(-4px);
  }
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
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

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

const ErrorContainer = styled.div`
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 20px;
  padding: 40px;
`;

const ErrorText = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #ef4444;
  text-align: center;
`;

// =====================
// COMPONENT
// =====================

const ExecutiveCommandCenter = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('[ExecutiveCommandCenter] Fetching results for:', assessmentId);
        const response = await assessmentService.getAssessmentResults(assessmentId);
        
        if (response.success && response.data) {
          setResults(response.data);
        } else {
          throw new Error('Failed to load assessment results');
        }
      } catch (err) {
        console.error('[ExecutiveCommandCenter] Error loading results:', err);
        setError(err.message || 'Failed to load assessment results');
        toast.error('Failed to load executive dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      fetchResults();
    }
  }, [assessmentId]);

  // Fetch benchmarking data
  useEffect(() => {
    const fetchBenchmarkData = async () => {
      if (!results) return;
      
      try {
        setBenchmarkLoading(true);
        console.log('[ExecutiveCommandCenter] Fetching benchmarking data for:', assessmentId);
        const data = await assessmentService.getBenchmarkReport(assessmentId);
        console.log('[ExecutiveCommandCenter] Benchmark data received:', data);
        setBenchmarkData(data);
      } catch (err) {
        console.error('[ExecutiveCommandCenter] Error fetching benchmark data:', err);
        setBenchmarkData(null);
      } finally {
        setBenchmarkLoading(false);
      }
    };

    if (results && !benchmarkData && !benchmarkLoading) {
      fetchBenchmarkData();
    }
  }, [results, benchmarkData, benchmarkLoading, assessmentId]);

  const handleBack = () => {
    navigate(`/results/${assessmentId}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Executive Command Center',
        text: 'View our Databricks maturity assessment executive summary',
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
          <LoadingText>Loading Executive Command Center...</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorContainer>
          <ErrorText>{error}</ErrorText>
          <ActionButton onClick={handleBack}>
            <FiArrowLeft />
            Back to Report
          </ActionButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <BackButton
          onClick={handleBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiArrowLeft />
          Back to Full Report
        </BackButton>

        <ActionButtons>
          <ActionButton
            onClick={handlePrint}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiDownload />
            Print / Save PDF
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
      </PageHeader>

      <ContentContainer>
        {/* Executive Dashboard */}
        <ExecutiveDashboard 
          results={results} 
          assessment={results?.assessmentInfo}
        />

        {/* ROI Calculator */}
        <ROICalculator 
          results={results} 
          assessment={results?.assessmentInfo}
        />

        {/* Risk Heatmap */}
        <RiskHeatmap 
          results={results} 
          assessment={results?.assessmentInfo}
        />

        {/* Industry Benchmarking Report */}
        {benchmarkData && (
          <IndustryBenchmarkingReport
            assessment={results?.assessmentInfo}
            benchmarkData={benchmarkData}
            overallScore={results?.overallScore || 0}
            pillarScores={results?.categoryDetails || {}}
          />
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default ExecutiveCommandCenter;

