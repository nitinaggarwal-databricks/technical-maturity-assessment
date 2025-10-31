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
            // Current state: Only 1 or 2 (early maturity stages)
            const currentState = Math.random() < 0.5 ? 1 : 2;
            
            // Future state: At least current + 1, can be higher (up to 5)
            // This gives a range of possible future states: currentState+1 to 5
            const minFuture = currentState + 1; // Minimum is +1
            const maxFuture = 5;
            const futureState = Math.floor(Math.random() * (maxFuture - minFuture + 1)) + minFuture;
            
            allResponses[`${question.id}_current_state`] = currentState;
            allResponses[`${question.id}_future_state`] = futureState;
            
            // Generate realistic customer comment specific to this question
            allResponses[`${question.id}_comment`] = generateRealisticComment(area.id, dimension.id, question.id, currentState);
            
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

  // Generate UNIQUE, question-specific customer comments
  const generateRealisticComment = (pillarId, dimensionId, questionId, currentState) => {
    // Comprehensive dimension-specific comment library (low maturity = 1-2)
    const dimensionComments = {
      // PLATFORM & GOVERNANCE
      'environment_architecture': [
        "Single workspace for all teams. No isolation between dev/prod. Need multi-workspace strategy with Unity Catalog for governance.",
        "Workspaces created ad-hoc. Inconsistent naming. Want standardized workspace provisioning with Terraform and tagging for cost tracking."
      ],
      'security_access_control': [
        "Manual user provisioning via Azure AD. No SCIM. Want automated sync and group-based Unity Catalog permissions with audit logs.",
        "Admin rights granted liberally. No principle of least privilege. Need RBAC with Unity Catalog and secrets management with Databricks Secrets."
      ],
      'governance_compliance': [
        "No centralized data catalog. Users don't know what data exists. Want Unity Catalog for discovery and lineage with PII tagging.",
        "Compliance team manually reviews code quarterly. Need automated scans for PII/PHI and Unity Catalog data classification tags with certifications."
      ],
      'observability_monitoring': [
        "No visibility into cluster usage. Surprises in cloud bills. Want cluster event logs and system tables for usage attribution by team.",
        "Jobs fail silently. Alerts reactive. Need Databricks workflows with email alerts and integration with PagerDuty for production pipelines."
      ],
      'cost_management': [
        "Cloud costs ballooning. No understanding of spend drivers. Want budget alerts and system tables for chargeback to business units with tags.",
        "Teams oversize clusters by default. No right-sizing. Need automated recommendations and spot instance policies for non-critical workloads to reduce costs."
      ],
      
      // DATA ENGINEERING
      'ingestion_strategy': [
        "Manual SFTP transfers nightly. Batch loads via notebooks. Want Auto Loader for real-time streaming ingestion with schema evolution and checkpoints.",
        "Data engineers write custom Python scripts per source. No reusability. Need standardized connectors and Auto Loader templates for common sources like S3."
      ],
      'lakehouse_architecture': [
        "Parquet files in S3 with no ACID guarantees. Delete operations problematic. Want Delta Lake for ACID transactions and time travel for audits.",
        "Raw zone, curated zone managed manually. No clear medallion architecture. Need Delta Lake with Bronze/Silver/Gold layers and DLT pipelines for automation."
      ],
      'pipeline_orchestration': [
        "Airflow orchestrates Spark submits. Complex dependencies hard to manage. Want Databricks Workflows with native integration and task dependencies for observability.",
        "Notebooks run manually or via cron. No visibility into failures. Need Databricks Jobs with retries, alerting, and lineage tracking for production pipelines."
      ],
      'data_quality': [
        "No data quality checks. Issues found by analysts downstream. Want DLT expectations (expect_or_fail, expect_or_drop) to catch issues early at ingestion.",
        "Manual SQL checks in notebooks. Inconsistent across teams. Need Lakehouse Monitoring for automated data quality metrics and anomaly detection dashboards."
      ],
      'performance_scalability': [
        "Pipelines take 6+ hours. Business wants hourly refreshes. Need Photon acceleration and partition tuning with Z-ordering for query performance improvement.",
        "Clusters manually sized. Either over-provisioned or run out of memory. Want auto-scaling clusters and serverless compute for cost efficiency and elasticity."
      ],
      
      // ANALYTICS & BI
      'query_performance': [
        "Analysts wait 5+ minutes per query. Frustration growing. Want serverless SQL warehouses with Photon for sub-second queries and query caching for reusability.",
        "Same aggregations re-computed hourly. Inefficient. Need materialized views and query result caching to reduce compute costs and improve response times."
      ],
      'data_modeling': [
        "Fact tables have 200+ columns. Star schema unclear. Want dimensional modeling best practices and slowly changing dimension (SCD) patterns for historical accuracy.",
        "Every team creates own metrics. Inconsistent revenue numbers. Need centralized semantic layer with Unity Catalog and SQL UDFs for metric standardization and governance."
      ],
      'visualization_reporting': [
        "Analysts export to Excel then pivot. No real-time dashboards. Want Databricks SQL dashboards with auto-refresh and embedding for business stakeholders.",
        "PowerBI connects to raw tables. Slow and fragile. Need Databricks SQL endpoint with Photon and aggregation tables for fast BI integration and reliability."
      ],
      'self_service_enablement': [
        "Analysts wait on data engineers for every query. Bottleneck. Want Databricks SQL with saved queries and Genie for natural language ad-hoc analysis.",
        "Business users can't explore data independently. No access control. Need Unity Catalog row/column security and Databricks SQL permissions for safe self-service access."
      ],
      'collaboration_sharing': [
        "Notebooks emailed as HTML. No version control. Want Databricks Repos with Git integration and notebook versioning for collaboration and reproducibility.",
        "Each analyst has own copy of queries. Duplication and drift. Need shared queries library in Databricks SQL and comments for institutional knowledge sharing."
      ],
      
      // MACHINE LEARNING
      'ml_lifecycle': [
        "ML experiments tracked in spreadsheets. Can't reproduce results. Want MLflow for experiment tracking with hyperparameter logging and model versioning for reproducibility.",
        "Model artifacts stored in S3 with manual naming. No lineage. Need MLflow Model Registry for version control and model lineage with Unity Catalog integration."
      ],
      'model_deployment': [
        "Models deployed via Flask on EC2. Manual scaling. Want MLflow Model Serving with autoscaling endpoints and A/B testing for production inference workloads.",
        "Data scientists retrain models monthly via notebook runs. No automation. Need Databricks Jobs with model retraining pipelines and trigger-based deployment for MLOps."
      ],
      'feature_engineering': [
        "Feature engineering code duplicated in notebooks. Inconsistency across models. Want Databricks Feature Store for centralized feature definitions and online/offline serving.",
        "Training features differ from inference. Causes model drift. Need Feature Store with point-in-time lookups for training-serving skew prevention and consistency."
      ],
      'ml_governance': [
        "No model approval process. Models deployed to prod ad-hoc. Want MLflow Model Registry with stage transitions and approval workflows for governance compliance.",
        "Can't explain model decisions. Regulatory concern. Need model monitoring dashboards and SHAP integration for explainability audits and regulatory compliance reporting."
      ],
      'ml_scale': [
        "Single-node scikit-learn. Datasets growing beyond memory. Want distributed training with Spark MLlib or PyTorch Distributed for large-scale model training on big data.",
        "Hyperparameter tuning takes days. Blocking experimentation. Need Hyperopt with MLflow integration and parallel trials for faster experimentation cycles and model optimization."
      ],
      
      // GENERATIVE AI
      'genai_strategy': [
        "No GenAI initiative. CIO asking for roadmap. Want Mosaic AI assessment workshop to identify high-impact use cases like RAG for knowledge base search.",
        "Experimenting with ChatGPT for customer support. Security concerns. Need Databricks Foundation Models for on-platform LLM inference with data residency and guardrails."
      ],
      'genai_data_readiness': [
        "Documentation scattered in Confluence and SharePoint. No vector embeddings. Want Vector Search index for semantic retrieval and RAG application on internal knowledge base.",
        "PDFs and Word docs not searchable semantically. Need chunking strategy and Vector Search with hybrid search (keyword + semantic) for enterprise document retrieval."
      ],
      'genai_development': [
        "Prompt engineering in Python notebooks. No reusability. Want Databricks AI Playground for prompt iteration and versioning with evaluation metrics and comparison views.",
        "Calling OpenAI API directly. Cost and latency concerns. Need Databricks Model Serving with provisioned throughput for Foundation Models and reduced latency for production apps."
      ],
      'genai_evaluation': [
        "No way to measure RAG quality. Anecdotal feedback only. Want MLflow with LLM evaluation metrics (retrieval precision, answer relevance, faithfulness) for systematic assessment.",
        "Prompt changes break production. No regression testing. Need automated LLM evaluation pipelines in Databricks Jobs with golden test sets for continuous quality monitoring."
      ],
      'genai_responsible_ai': [
        "No guardrails on LLM outputs. Risk of hallucinations. Want Databricks Lakehouse Monitoring for LLM toxicity detection and output filtering with guardrail policies.",
        "Concerns about bias in GenAI responses. Need bias testing framework and evaluation metrics for fairness audits and responsible AI governance with stakeholder review."
      ],
      
      // OPERATIONAL EXCELLENCE
      'platform_adoption': [
        "15% of data team uses Databricks. Most still on legacy tools. Want onboarding program and success metrics to track adoption velocity with executive dashboard.",
        "New hires take 3 weeks to become productive. No training. Need Databricks Academy subscriptions and internal bootcamp curriculum with certification tracking for faster ramp-up."
      ],
      'enablement_training': [
        "Tribal knowledge. Key engineers are single point of failure. Want documentation site with runbooks and best practices repository for platform patterns and troubleshooting.",
        "Teams reinvent the wheel. No code reuse. Need curated template library for common patterns (DLT, MLOps, security) with example implementations and GitHub integration."
      ],
      'center_of_excellence': [
        "No central team. Every project figures out Databricks independently. Want CoE with office hours and Slack channel for support escalation and best practices sharing.",
        "Platform capabilities unknown. Marketing team doesn't know about Vector Search for personalization. Need quarterly showcase and use case library for internal evangelism."
      ],
      'monitoring_usage': [
        "No visibility into platform usage. Can't show ROI. Want system tables dashboard for active users, job success rates, and cost per business unit with executive reporting.",
        "Clusters idle overnight. Wasted spend. Need automated cluster termination policies and usage alerts with recommendations for cost optimization and chargebacks."
      ],
      'value_realization': [
        "CFO asks for Databricks ROI. No answer. Want business impact tracking with metrics for time-to-insight reduction and data quality improvement with quarterly business reviews.",
        "Platform costs growing without clear business value. Need use case prioritization framework and value scorecards with stakeholder interviews for portfolio optimization."
      ]
    };
    
    // Get comments for this specific dimension
    const comments = dimensionComments[dimensionId] || [
      "Currently using manual processes. Need automation and best practices implementation with Databricks platform capabilities for operational efficiency.",
      "Early stage adoption. Looking to scale with Databricks features and proper governance for enterprise-grade data and AI workloads."
    ];
    
    // Pick a random comment for variety
    const randomIndex = typeof window !== 'undefined' && window.crypto?.getRandomValues
      ? window.crypto.getRandomValues(new Uint32Array(1))[0] % comments.length
      : Math.floor(Math.random() * comments.length);
    
    return comments[randomIndex];
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

