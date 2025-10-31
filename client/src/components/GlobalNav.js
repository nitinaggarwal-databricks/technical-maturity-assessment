import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FiMenu, FiX, FiPlay } from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as assessmentService from '../services/assessmentService';

// Fixed: Added mobile navigation with hamburger menu

const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 12px 0;
  }
`;

const NavContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const DatabricksLogo = styled.img`
  height: 32px;
  width: auto;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.85;
  }

  @media (max-width: 768px) {
    height: 28px;
  }
`;

const TopNav = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;

  @media (max-width: 1400px) {
    gap: 20px;
  }

  @media (max-width: 1200px) {
    gap: 16px;
  }

  @media (max-width: 768px) {
    gap: 12px;
  }

  @media (max-width: 640px) {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #374151;
  cursor: pointer;
  padding: 8px;
  font-size: 24px;
  
  @media (max-width: 640px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:hover {
    color: #3b82f6;
  }
`;

const MobileMenu = styled.div`
  display: none;
  
  @media (max-width: 640px) {
    display: ${props => props.$isOpen ? 'flex' : 'none'};
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    flex-direction: column;
    padding: 16px 0;
    max-height: calc(100vh - 60px);
    overflow-y: auto;
  }
`;

const MobileNavLink = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  padding: 16px 24px;
  text-align: left;
  width: 100%;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    color: #3b82f6;
  }

  &:active {
    background: #f3f4f6;
  }
`;

const MobileSecondaryCTAButton = styled.button`
  background: white;
  color: #3b82f6;
  border: 2px solid #3b82f6;
  padding: 14px 24px;
  margin: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:active {
    transform: scale(0.98);
    background: #eff6ff;
  }
`;

const MobileCTAButton = styled.button`
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  padding: 14px 24px;
  margin: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:active {
    transform: scale(0.98);
  }
`;

const NavLink = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  padding: 8px 0;
  position: relative;
  white-space: nowrap;

  @media (max-width: 1200px) {
    font-size: 0.875rem;
  }

  &:hover {
    color: #3b82f6;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: #3b82f6;
    transform: scaleX(0);
    transition: transform 0.2s;
  }

  &:hover::after {
    transform: scaleX(1);
  }
`;

const SecondaryCTAButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  color: #3b82f6;
  border: 2px solid #3b82f6;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  @media (max-width: 1200px) {
    font-size: 0.875rem;
    padding: 8px 20px;
  }

  &:hover {
    background: #eff6ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    transition: transform 0.2s;
  }

  &:hover svg {
    transform: scale(1.1);
  }
`;

const CTAButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  white-space: nowrap;

  @media (max-width: 1200px) {
    font-size: 0.875rem;
    padding: 8px 20px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    transition: transform 0.2s;
  }

  &:hover svg {
    transform: translateX(3px);
  }
`;

const GlobalNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId) => {
    closeMobileMenu();
    // If not on home page, navigate to home first with scroll state
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
      // Already on home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleLogoClick = () => {
    closeMobileMenu();
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (path) => {
    closeMobileMenu();
    navigate(path);
  };

  const handleTrySample = async () => {
    closeMobileMenu();
    try {
      toast.loading('Creating fully populated sample assessment...', { id: 'sample-assessment' });
      
      // Generate unique sample data with timestamp
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const sampleData = {
        assessmentName: `Sample Assessment - ${new Date().toLocaleString()} [${randomSuffix}]`,
        organizationName: 'Demo Organization',
        industry: 'Technology',
        contactEmail: 'demo@example.com'
      };
      
      const result = await assessmentService.startAssessment(sampleData);
      console.log('[GlobalNav] Sample assessment result:', result);
      
      // Handle both wrapped and direct response formats
      const assessmentId = result?.data?.assessmentId || result?.assessmentId;
      
      if (!assessmentId) {
        console.error('[GlobalNav] Invalid response format:', result);
        throw new Error('Invalid response format');
      }

      // Get assessment framework to populate all questions
      toast.loading('Populating assessment with realistic data...', { id: 'sample-assessment' });
      const framework = await assessmentService.getAssessmentFramework();
      
      // Generate fully populated responses for all categories
      const allResponses = {};
      const completedCategories = [];
      let firstCategoryId = null;
      
      // Populate ALL pillars with realistic sample data for full demo experience
      framework.assessmentAreas.forEach((area, areaIdx) => {
        // Capture first category for navigation
        if (areaIdx === 0) {
          firstCategoryId = area.id;
        }
        
        area.dimensions.forEach((dimension, dimIdx) => {
          dimension.questions.forEach((question, qIdx) => {
            // More varied random current state with better distribution (1-5)
            const baseRandom = Math.random();
            const currentState = Math.floor(baseRandom * 5) + 1; // 1-5 for more variety
            
            // Future state always greater than current or same if already at 5
            const gap = Math.floor(Math.random() * 3) + 1; // Gap of 1-3
            const futureState = Math.min(currentState + gap, 5);
            
            allResponses[`${question.id}_current_state`] = currentState;
            allResponses[`${question.id}_future_state`] = futureState;
            
            // Generate realistic customer comment (25 words)
            allResponses[`${question.id}_comment`] = generateRealisticComment(area.id, dimension.name, currentState);
            
            // Randomly select technical pain points
            const technicalPainPerspective = question.perspectives?.find(p => p.id === 'technical_pain');
            if (technicalPainPerspective) {
              const availablePains = technicalPainPerspective.options || [];
              const numPains = Math.min(
                Math.floor(Math.random() * 3) + 2, // 2-4 pain points
                availablePains.length
              );
              
              // Fisher-Yates shuffle
              const shuffled = [...availablePains];
              for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
              }
              
              const selectedPains = shuffled.slice(0, numPains).map(p => p.value);
              allResponses[`${question.id}_technical_pain`] = selectedPains;
            }
            
            // Randomly select business pain points
            const businessPainPerspective = question.perspectives?.find(p => p.id === 'business_pain');
            if (businessPainPerspective) {
              const availablePains = businessPainPerspective.options || [];
              const numPains = Math.min(
                Math.floor(Math.random() * 3) + 2, // 2-4 pain points
                availablePains.length
              );
              
              // Fisher-Yates shuffle
              const shuffled = [...availablePains];
              for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
              }
              
              const selectedPains = shuffled.slice(0, numPains).map(p => p.value);
              allResponses[`${question.id}_business_pain`] = selectedPains;
            }
          });
        });
        completedCategories.push(area.id);
      });

      // Submit all responses
      console.log('[GlobalNav] Submitting bulk responses for assessment:', assessmentId);
      console.log('[GlobalNav] Total responses to submit:', Object.keys(allResponses).length);
      console.log('[GlobalNav] Completed categories:', completedCategories);
      console.log('[GlobalNav] Sample data variance check - First 5 scores:', 
        Object.keys(allResponses)
          .filter(k => k.includes('current_state'))
          .slice(0, 5)
          .map(k => ({ [k]: allResponses[k] }))
      );
      
      const bulkResult = await assessmentService.submitBulkResponses(assessmentId, allResponses, completedCategories);
      console.log('[GlobalNav] Bulk responses submitted successfully. Result:', bulkResult);
      
      // Verify the responses were actually saved
      const statusCheck = await assessmentService.getAssessmentStatus(assessmentId);
      console.log('[GlobalNav] Status check - Responses saved:', Object.keys(statusCheck.responses || {}).length);
      
      // Wait for file I/O to complete (critical for local file storage)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Sample assessment created! Review your selections...', { id: 'sample-assessment' });
      
      // Navigate to the first question to show the user the pre-filled assessment
      // They can then navigate to results when ready
      setTimeout(() => {
        navigate(`/assessment/${assessmentId}/${firstCategoryId}`);
      }, 500);
      
    } catch (error) {
      console.error('[GlobalNav] Error creating sample assessment:', error);
      toast.error('Failed to create sample assessment. Please try Start Assessment instead.', { id: 'sample-assessment' });
    }
  };

  // Generate realistic customer comments based on pillar and maturity
  const generateRealisticComment = (pillarId, dimensionName, currentState) => {
    const comments = {
      platform_governance: {
        low: [
          "We manually track data access via spreadsheets. Need automated RBAC with Unity Catalog for compliance audit trail visibility.",
          "Currently using separate Hive metastore per workspace. Planning Unity Catalog migration to centralize governance and lineage tracking.",
          "Security team reviews data access quarterly. Want real-time audit logs and automated policy enforcement through Unity Catalog."
        ],
        medium: [
          "Unity Catalog deployed in 3 workspaces. Working on ABAC policies and row-level security. Need training on dynamic views.",
          "Basic RBAC with Unity Catalog. Want to implement data classification tags and certification badges for trusted datasets and models.",
          "Centralized metastore running. Need to enable Delta Sharing for external partners and implement fine-grained access controls on features."
        ],
        high: [
          "Full Unity Catalog with ABAC policies. Testing Compliance for Vector Search and serverless SQL warehouse integration for production workloads.",
          "Unity Catalog federated across regions. Implementing governed tags and certification system. Evaluating context-based ingress control for security.",
          "Advanced Unity Catalog setup with row/column security. Working on cost attribution tags and budget policies for chargeback allocation."
        ]
      },
      data_engineering: {
        low: [
          "Running batch Spark jobs via notebooks. No data quality checks. Looking at Delta Live Tables for automated expectations and monitoring.",
          "Manual pipeline management through ADF. Want to migrate to Databricks workflows with Auto Loader for streaming ingestion and recovery.",
          "Data quality issues found by downstream users. Need DLT expectations (expect_or_fail) and Lakehouse Monitoring for proactive alerting and validation."
        ],
        medium: [
          "Using Delta Lake with manual quality checks. Piloting DLT pipelines for critical workflows. Want full observability and automated expectations.",
          "Auto Loader deployed for S3 ingestion. Building DLT pipelines with expectations. Need to implement CDC with APPLY CHANGES and monitoring.",
          "Delta tables with daily batch. Testing streaming with structured streaming API. Planning migration to DLT for unified batch and stream."
        ],
        high: [
          "Full DLT pipelines with expectations and monitoring. Testing Lakeflow Connect Zerobus connector. Want performance mode for production SLAs.",
          "Streaming ingestion with Auto Loader. DLT expectations catching 95% of issues. Implementing Lakehouse Monitoring for data quality dashboards.",
          "Advanced DLT with CDC processing. Auto Loader with schema evolution. Evaluating serverless jobs performance mode for cost optimization."
        ]
      },
      analytics_bi: {
        low: [
          "Analysts write complex SQL in notebooks. No self-service. Looking at Databricks SQL serverless warehouses for business user access.",
          "Data accessed via Python notebooks. Want SQL endpoint for business users. Considering AI/BI and Genie for natural language queries.",
          "BI team waits for data engineer support. Need serverless SQL warehouse with query history and Photon acceleration for performance."
        ],
        medium: [
          "Databricks SQL deployed with classic clusters. Testing serverless warehouses. Want AI/BI dashboards and Genie for NL query access.",
          "Serverless SQL warehouse for analysts. Working on dashboard library. Evaluating Photon performance gains and query caching strategies for optimization.",
          "SQL endpoints with basic dashboards. Testing AI/BI features. Need better query optimization and materialized views for common aggregations."
        ],
        high: [
          "Full serverless SQL with Photon. AI/BI dashboards deployed. Testing Genie for business users. Working on query optimization and caching.",
          "Advanced SQL analytics with Photon acceleration. AI/BI in production. Implementing federation for external data sources and partner integration.",
          "Serverless warehouses scaled to 200 users. Genie adoption at 40%. Working on semantic layer and metric definitions for consistency."
        ]
      },
      machine_learning: {
        low: [
          "ML notebooks with manual versioning. No experiment tracking. Looking at MLflow for model registry and feature store for reuse.",
          "Models trained in notebooks. Manual deployment to endpoints. Want MLflow Model Serving and automated retraining pipelines for production.",
          "Feature engineering duplicated across teams. Need Feature Store for consistency. Planning MLflow for experiment tracking and model governance."
        ],
        medium: [
          "MLflow tracking deployed. Working on Feature Store implementation. Want Model Serving for real-time inference and model monitoring setup.",
          "Feature Store with 50 features. MLflow registry for 10 models. Testing Model Serving serverless endpoints and monitoring for drift.",
          "Automated retraining pipelines with MLflow. Implementing Feature Store lookups. Need model monitoring and drift detection for production models."
        ],
        high: [
          "Advanced MLflow with 100+ models tracked. Feature Store with 200 features. Model Serving at scale. Implementing AutoML and monitoring.",
          "Full MLOps with MLflow and Feature Store. Testing Mosaic AI for LLM fine-tuning. Want AI playground for experimentation.",
          "Production ML platform with automated pipelines. Feature Store lineage tracking. Evaluating Lakehouse Monitoring for model quality and performance."
        ]
      },
      generative_ai: {
        low: [
          "No GenAI capability. Data team interested in RAG use cases. Looking at Mosaic AI and Vector Search infrastructure.",
          "Experimenting with OpenAI API externally. Want Databricks Foundation Models and Vector Search for internal knowledge base RAG applications.",
          "Business asking for GenAI features. Need Vector Search for document retrieval. Evaluating Mosaic AI Model Serving for governance."
        ],
        medium: [
          "Vector Search POC running. Testing RAG with Databricks Foundation Models. Want prompt engineering best practices and monitoring framework.",
          "Mosaic AI deployed for 2 use cases. Vector Search indexes for documentation. Working on LLM evaluation metrics and guardrails.",
          "Foundation Models accessible via API. Building RAG application. Need governance for prompts and output quality monitoring for compliance."
        ],
        high: [
          "Production RAG app with Vector Search. Fine-tuning Llama models. Testing multimodal capabilities. Want AI playground for experimentation.",
          "Advanced GenAI platform with Model Serving. Vector Search scaled to 1M vectors. Working on evaluation framework and guardrails.",
          "Multiple GenAI apps in production. Vector Search with hybrid search. Testing Claude Opus 4.1 and function calling for agentic workflows."
        ]
      },
      operational_excellence: {
        low: [
          "Ad-hoc platform usage. No CoE structure. Want training programs and adoption metrics to track ROI and user satisfaction.",
          "Limited documentation. Engineers discover features accidentally. Need best practices repository and onboarding program for new users and teams.",
          "Platform investment unclear. No usage tracking. Looking at system tables for cost attribution and chargeback to business units."
        ],
        medium: [
          "CoE established with 3 members. Monthly training sessions. Tracking usage with system tables. Want better ROI metrics.",
          "Documentation site with 50 articles. Quarterly enablement workshops. System tables for cost tracking. Need automated reporting and dashboards.",
          "Active Slack community with 200 members. Best practices shared. Working on chargeback model and budget policies for teams."
        ],
        high: [
          "Mature CoE with dedicated team. 90% user adoption. Full cost attribution with tags. Advanced training with certification program.",
          "Comprehensive enablement platform. Usage dashboards in production. Automated chargeback. Working on ML for cost optimization recommendations.",
          "Platform adoption at 95% with 300 active users. ROI tracked quarterly. Advanced monitoring with system tables and custom metrics."
        ]
      }
    };
    
    const pillarComments = comments[pillarId] || comments.platform_governance;
    // More varied level distribution
    const levelKey = currentState <= 2 ? 'low' : currentState === 3 ? 'medium' : 'high';
    const options = pillarComments[levelKey];
    
    // Use crypto random for better randomness if available
    const randomIndex = typeof window !== 'undefined' && window.crypto?.getRandomValues
      ? window.crypto.getRandomValues(new Uint32Array(1))[0] % options.length
      : Math.floor(Math.random() * options.length);
    
    return options[randomIndex];
  };

  return (
    <Nav>
      <NavContainer>
        <DatabricksLogo 
          src="/databricks-logo.svg" 
          alt="Databricks" 
          onClick={handleLogoClick}
        />
        
        {/* Desktop Navigation */}
        <TopNav>
          <NavLink onClick={handleLogoClick}>Home</NavLink>
          <NavLink onClick={() => scrollToSection('why-assessment')}>Overview</NavLink>
          <NavLink onClick={() => scrollToSection('how-it-works')}>How It Works</NavLink>
          <NavLink onClick={() => scrollToSection('pillars')}>Framework</NavLink>
          <NavLink onClick={() => navigate('/assessments')}>My Assessments</NavLink>
          <NavLink onClick={() => navigate('/insights-dashboard')}>Dashboard</NavLink>
          <SecondaryCTAButton onClick={handleTrySample}>
            <FiPlay size={14} />
            Try Sample
          </SecondaryCTAButton>
          <CTAButton onClick={() => navigate('/start')}>
            Start Assessment →
          </CTAButton>
        </TopNav>

        {/* Mobile Menu Button */}
        <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </MobileMenuButton>
      </NavContainer>

      {/* Mobile Menu */}
      <MobileMenu $isOpen={mobileMenuOpen}>
        <MobileNavLink onClick={handleLogoClick}>Home</MobileNavLink>
        <MobileNavLink onClick={() => scrollToSection('why-assessment')}>Overview</MobileNavLink>
        <MobileNavLink onClick={() => scrollToSection('how-it-works')}>How It Works</MobileNavLink>
        <MobileNavLink onClick={() => scrollToSection('pillars')}>Framework</MobileNavLink>
        <MobileNavLink onClick={() => handleNavigate('/assessments')}>My Assessments</MobileNavLink>
        <MobileNavLink onClick={() => handleNavigate('/insights-dashboard')}>Dashboard</MobileNavLink>
        <MobileSecondaryCTAButton onClick={handleTrySample}>
          <FiPlay size={16} />
          Try Sample Assessment
        </MobileSecondaryCTAButton>
        <MobileCTAButton onClick={() => handleNavigate('/start')}>
          Start Assessment →
        </MobileCTAButton>
      </MobileMenu>
    </Nav>
  );
};

export default GlobalNav;

