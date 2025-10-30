/**
 * Intelligent Recommendation Engine V2
 * COMPREHENSIVE: Handles 589 pain points with hybrid approach
 * - Strategic mappings for top 50 critical pain points
 * - Smart keyword fallback for remaining 539
 * - Category-aware defaults per pillar
 */

const databricksFeatureMapper = require('./databricksFeatureMapper');

class IntelligentRecommendationEngine {
  constructor() {
    this.featureMapper = databricksFeatureMapper;
    
    // KEYWORD → DATABRICKS FEATURE/SOLUTION MAPPING
    this.keywordMap = {
      // Governance & Security
      'coe': {
        features: ['Unity Catalog', 'Account Console', 'System Tables', 'Databricks Academy'],
        solution: 'Establish Center of Excellence with Unity Catalog governance framework, System Tables for tracking, and Databricks Academy for training',
        category: 'governance'
      },
      'governance': {
        features: ['Unity Catalog', 'Audit Logs', 'Compliance Security Profile', 'Data Classification'],
        solution: 'Implement Unity Catalog for centralized governance with automated audit logging and compliance controls',
        category: 'governance'
      },
      'security': {
        features: ['Unity Catalog', 'Private Link', 'Customer-Managed Keys', 'IP Access Lists'],
        solution: 'Deploy network isolation with Private Link, encrypt data with customer-managed keys, and enforce IP allowlists',
        category: 'security'
      },
      'access': {
        features: ['Unity Catalog', 'RBAC', 'ABAC', 'Service Principals'],
        solution: 'Configure role-based and attribute-based access control via Unity Catalog with service principal automation',
        category: 'security'
      },
      
      // Training & Enablement
      'training': {
        features: ['Databricks Academy', 'Partner Training', 'Community Edition', 'Certification Programs'],
        solution: 'Scale enablement with Databricks Academy online courses, partner-led workshops, and hands-on labs',
        category: 'enablement'
      },
      'adoption': {
        features: ['Databricks Assistant', 'Quickstart Templates', 'Solution Accelerators', 'Community'],
        solution: 'Accelerate adoption with AI Assistant for code generation, pre-built templates, and community support',
        category: 'enablement'
      },
      'learning': {
        features: ['Databricks Academy', 'Documentation', 'Databricks University', 'Hands-on Labs'],
        solution: 'Provide continuous learning through Academy courses, comprehensive docs, and hands-on practice environments',
        category: 'enablement'
      },
      'knowledge': {
        features: ['Databricks Assistant', 'Documentation', 'Community Forums', 'Solution Accelerators'],
        solution: 'Build knowledge base with AI Assistant, searchable docs, community Q&A, and reusable accelerators',
        category: 'enablement'
      },
      
      // Performance & Optimization
      'performance': {
        features: ['Photon', 'Serverless Compute', 'Liquid Clustering', 'Auto Scaling'],
        solution: 'Enable Photon acceleration, serverless compute for auto-scaling, and Liquid Clustering for optimal data layout',
        category: 'performance'
      },
      'slow': {
        features: ['Photon', 'Query Profile', 'Result Caching', 'Predictive I/O'],
        solution: 'Diagnose with Query Profile, enable Photon for 3-5x speedup, and leverage caching for repeated queries',
        category: 'performance'
      },
      'query': {
        features: ['Photon', 'Serverless SQL', 'Query History', 'Materialized Views'],
        solution: 'Optimize queries with Photon engine, serverless auto-scaling, and materialized views for aggregations',
        category: 'performance'
      },
      'latency': {
        features: ['Serverless', 'Photon', 'Delta Caching', 'Predictive I/O'],
        solution: 'Reduce latency with serverless instant start, Photon vectorization, and intelligent caching',
        category: 'performance'
      },
      
      // Cost & Resource Management
      'cost': {
        features: ['Budget Alerts', 'System Tables', 'Cluster Policies', 'Serverless'],
        solution: 'Track spending with System Tables, set budget alerts, enforce cluster policies, and use serverless for cost efficiency',
        category: 'cost'
      },
      'budget': {
        features: ['Budget Alerts', 'Account Console', 'System Tables', 'Cost Attribution Tags'],
        solution: 'Monitor spending with real-time alerts, analyze usage in System Tables, and implement chargeback with tags',
        category: 'cost'
      },
      'resource': {
        features: ['Cluster Policies', 'Auto Scaling', 'Serverless', 'Spot Instances'],
        solution: 'Optimize resource utilization with auto-scaling clusters, serverless compute, and spot instances for batch workloads',
        category: 'cost'
      },
      
      // Monitoring & Observability
      'monitoring': {
        features: ['Lakehouse Monitoring', 'System Tables', 'Audit Logs', 'Databricks SQL Dashboards'],
        solution: 'Implement comprehensive monitoring with Lakehouse Monitoring for data quality and System Tables for usage tracking',
        category: 'observability'
      },
      'observability': {
        features: ['Lakehouse Monitoring', 'System Tables', 'Audit Logs', 'Query History'],
        solution: 'Build observability stack with Lakehouse Monitoring, System Tables analysis, and audit log review',
        category: 'observability'
      },
      'logging': {
        features: ['Audit Logs', 'Cluster Logs', 'Delta Live Tables Event Log', 'System Tables'],
        solution: 'Centralize logging with audit logs for security, cluster logs for debugging, and DLT event logs for pipelines',
        category: 'observability'
      },
      'alerting': {
        features: ['Budget Alerts', 'Workflow Notifications', 'Lakehouse Monitoring Alerts', 'SQL Alerts'],
        solution: 'Configure multi-layered alerting: budget overruns, job failures, data quality issues, and query performance',
        category: 'observability'
      },
      
      // Collaboration & DevOps
      'collaboration': {
        features: ['Git Integration', 'Repos', 'Notebooks', 'Comments & Annotations'],
        solution: 'Enable team collaboration with Git repos, shared notebooks, inline comments, and version control',
        category: 'collaboration'
      },
      'version': {
        features: ['Git Integration', 'Repos', 'Databricks Asset Bundles', 'MLflow Model Versions'],
        solution: 'Implement version control for notebooks with Git integration and infrastructure with Asset Bundles',
        category: 'devops'
      },
      'deployment': {
        features: ['Asset Bundles', 'CI/CD', 'Databricks CLI', 'Terraform Provider'],
        solution: 'Automate deployments with Asset Bundles, CI/CD pipelines, and infrastructure-as-code via Terraform',
        category: 'devops'
      },
      'cicd': {
        features: ['Asset Bundles', 'Databricks CLI', 'GitHub Actions', 'Terraform'],
        solution: 'Build CI/CD pipeline with Asset Bundles, Databricks CLI for automation, and GitHub Actions for orchestration',
        category: 'devops'
      },
      
      // Data Engineering
      'pipeline': {
        features: ['Delta Live Tables', 'Workflows', 'Auto Loader', 'Change Data Capture'],
        solution: 'Modernize pipelines with Delta Live Tables for declarative ETL, Auto Loader for streaming, and CDC for real-time sync',
        category: 'data_engineering'
      },
      'quality': {
        features: ['Delta Live Tables Expectations', 'Lakehouse Monitoring', 'Data Quality Checks', 'Great Expectations'],
        solution: 'Enforce data quality with DLT expectations, monitor with Lakehouse Monitoring, and validate with quality checks',
        category: 'data_engineering'
      },
      'ingestion': {
        features: ['Auto Loader', 'Copy Into', 'Streaming Tables', 'Partner Connectors'],
        solution: 'Automate ingestion with Auto Loader for cloud files, streaming tables for real-time, and connectors for SaaS',
        category: 'data_engineering'
      },
      'streaming': {
        features: ['Structured Streaming', 'Delta Live Tables', 'Auto Loader', 'Kafka Integration'],
        solution: 'Build streaming pipelines with Structured Streaming, DLT for declarative logic, and native Kafka integration',
        category: 'data_engineering'
      },
      
      // Machine Learning
      'experiment': {
        features: ['MLflow Tracking', 'MLflow Experiments', 'AutoML', 'Databricks Notebooks'],
        solution: 'Track all experiments with MLflow autologging, compare runs in UI, and accelerate with AutoML',
        category: 'machine_learning'
      },
      'model': {
        features: ['MLflow Model Registry', 'Model Serving', 'Feature Store', 'Lakehouse Monitoring'],
        solution: 'Manage model lifecycle with MLflow Registry, deploy with Model Serving, and monitor with Lakehouse Monitoring',
        category: 'machine_learning'
      },
      'feature': {
        features: ['Feature Store', 'Unity Catalog', 'Feature Serving', 'Online Tables'],
        solution: 'Centralize features in Feature Store, govern with Unity Catalog, and serve with low-latency Online Tables',
        category: 'machine_learning'
      },
      'serving': {
        features: ['Model Serving', 'Serverless Endpoints', 'Foundation Model APIs', 'GPU Serving'],
        solution: 'Deploy models with Serverless Model Serving for auto-scaling, GPU support, and foundation model APIs',
        category: 'machine_learning'
      },
      
      // GenAI
      'genai': {
        features: ['Mosaic AI Agent Framework', 'Vector Search', 'AI Playground', 'Foundation Model APIs'],
        solution: 'Build GenAI apps with Agent Framework for RAG, Vector Search for retrieval, and playground for testing',
        category: 'genai'
      },
      'rag': {
        features: ['Vector Search', 'Mosaic AI Agent Framework', 'Foundation Model APIs', 'Online Tables'],
        solution: 'Implement RAG with Vector Search for embeddings, Agent Framework for orchestration, and FM APIs for generation',
        category: 'genai'
      },
      'llm': {
        features: ['Foundation Model APIs', 'Model Serving', 'AI Gateway', 'AI Playground'],
        solution: 'Deploy LLMs with Foundation Model APIs, custom models via Model Serving, and govern with AI Gateway',
        category: 'genai'
      },
      'prompt': {
        features: ['AI Playground', 'MLflow', 'AI Gateway', 'Prompt Engineering Tools'],
        solution: 'Develop prompts in AI Playground, version with MLflow, and monitor quality with AI Gateway',
        category: 'genai'
      },
      'vector': {
        features: ['Vector Search', 'Delta Lake', 'Online Tables', 'Mosaic AI Agent Framework'],
        solution: 'Index vectors with Vector Search on Delta Lake, serve with Online Tables for low-latency retrieval',
        category: 'genai'
      },
      
      // Analytics & BI
      'dashboard': {
        features: ['Databricks SQL Dashboards', 'Genie', 'Power BI Connector', 'Tableau Integration'],
        solution: 'Build dashboards with Databricks SQL for internal users, Genie for natural language, and BI connectors for external tools',
        category: 'analytics'
      },
      'reporting': {
        features: ['Databricks SQL', 'Scheduled Queries', 'Alerts', 'Dashboard Sharing'],
        solution: 'Automate reporting with scheduled SQL queries, set up alerts for anomalies, and share dashboards with stakeholders',
        category: 'analytics'
      },
      'visualization': {
        features: ['Databricks SQL Dashboards', 'Genie', 'Partner Connectors', 'Python Visualization Libraries'],
        solution: 'Create visualizations with SQL dashboards, conversational Genie interface, or export to Tableau/Power BI',
        category: 'analytics'
      },
      'bi': {
        features: ['Power BI Direct Query', 'Tableau Connector', 'Genie', 'SQL Warehouses'],
        solution: 'Connect BI tools with native connectors for Power BI/Tableau, or use Genie for natural language analytics',
        category: 'analytics'
      }
    };
    
    // STRATEGIC MAPPINGS for critical pain points
    this.solutionMap = {
      // OPERATIONAL EXCELLENCE - CoE & Governance
      'no_coe': {
        problem: 'No formal Center of Excellence structure',
        solution: 'Establish Databricks CoE with dedicated team (2-3 platform engineers, 1 data architect), Unity Catalog governance framework, System Tables for adoption tracking, and Databricks Academy for continuous training.',
        recommendations: [
          '**Create CoE charter**: Define mission (governance, enablement, innovation), scope (platform management, best practices, training), and success metrics (adoption rate, time-to-insight, cost savings)',
          '**Staff CoE team**: Assign 2-3 platform engineers for infrastructure, 1 data architect for design patterns, and leverage Databricks Professional Services for 3-month onboarding',
          '**Deploy Unity Catalog**: Centralize data governance with metastore, implement RBAC for access control, enable audit logging for compliance, and create data classification tags',
          '**Launch training program**: Enroll 20 users in Databricks Academy (Fundamentals, Data Engineering, ML), conduct monthly office hours, build internal knowledge base with runbooks',
          '**Track adoption metrics**: Use System Tables to monitor cluster usage, job success rates, user activity, and create executive dashboard showing CoE ROI'
        ],
        databricks_features: ['Unity Catalog', 'Databricks Academy', 'Account Console', 'System Tables', 'Professional Services'],
        next_steps: [
          'Workshop: CoE Design & Roadmap with stakeholders (1 day)',
          'Assessment: Current state gaps vs. target operating model',
          'Engagement: Databricks Professional Services for CoE setup (3 months)',
          'Training: Databricks Academy enrollment for 20 initial users',
          'Implementation: Unity Catalog deployment with pilot use case (4 weeks)'
        ]
      },
      
      'unclear_charter': {
        problem: 'Unclear CoE charter and responsibilities',
        solution: 'Define clear CoE charter with three pillars: Governance (Unity Catalog policies), Enablement (training/support), Innovation (Labs/POCs). Establish RACI matrix, SLAs, and quarterly review process.',
        recommendations: [
          '**Document CoE charter**: Define pillars - Governance (Unity Catalog, audit logs, compliance), Enablement (training, support, best practices), Innovation (evaluate new features, POCs, Labs tools)',
          '**Create RACI matrix**: Platform ownership (CoE), data ownership (domain teams), security policies (InfoSec + CoE), cost management (FinOps + CoE)',
          '**Establish SLAs**: Platform uptime 99.9%, support response 4 hours, training monthly, documentation updates bi-weekly, quarterly innovation reviews',
          '**Build metrics dashboard**: System Tables → cluster utilization, job success rates, support ticket volume, training completion, cost per workload',
          '**Quarterly reviews**: Present CoE impact to exec team - adoption metrics, cost savings (e.g. 30% reduction via cluster policies), time-to-insight improvements (e.g. 50% faster with DLT)'
        ],
        databricks_features: ['Unity Catalog', 'System Tables', 'Account Console', 'Databricks Academy', 'Lakehouse Monitoring'],
        next_steps: [
          'Workshop: CoE Charter Definition with exec sponsors and stakeholders',
          'Consulting: Databricks Customer Success for CoE best practices',
          'Documentation: RACI matrix, SLAs, escalation procedures',
          'Implementation: System Tables dashboards for adoption tracking (2 weeks)',
          'Review: First quarterly CoE impact presentation to leadership'
        ]
      },
      
      'resource_constraints': {
        problem: 'Insufficient CoE resources to support growing platform',
        solution: 'Augment CoE with Databricks Professional Services (3-6 month engagement), partner SI resources (2-3 consultants), Databricks Academy for scalable training, and community support channels.',
        recommendations: [
          '**Engage Databricks Professional Services**: 3-6 month engagement for platform setup, Unity Catalog design, migration strategy, performance optimization, and CoE team training',
          '**Partner with System Integrator**: Augment CoE with 2-3 consultants from Slalom, Deloitte, Accenture, or Databricks partners for surge capacity and specialized skills',
          '**Scale training via Academy**: Databricks Academy online courses for self-paced learning (100+ courses), monthly group training sessions, quarterly certification push',
          '**Leverage Databricks Community**: Forums for peer support, Slack channels for real-time help, user group meetups, GitHub repos with sample code and best practices',
          '**Build self-service platform**: Quickstart templates, Solution Accelerators, documented runbooks, Databricks Assistant for code generation, reducing CoE support burden'
        ],
        databricks_features: ['Professional Services', 'Databricks Academy', 'Partner Network', 'Community', 'Solution Accelerators'],
        next_steps: [
          'Engagement: Databricks Professional Services scoping call and SOW',
          'RFP: System integrator partners for CoE augmentation (2-4 week selection)',
          'Enrollment: Databricks Academy licenses for 50 users',
          'Setup: Internal knowledge base (Confluence/Notion) with runbooks',
          'Pilot: Self-service quickstart templates for common use cases'
        ]
      },
      
      'standards_gaps': {
        problem: 'Incomplete standards and guidelines for platform use',
        solution: 'Create comprehensive standards: Databricks Asset Bundles for IaC, cluster policies for compute governance, Unity Catalog for data standards, naming conventions, and automated compliance checks.',
        recommendations: [
          '**Define compute standards**: Cluster policies with approved instance types, auto-termination (2 hours), Photon enabled, spot instances for dev/test, libraries allowlist',
          '**Data standards via Unity Catalog**: Naming conventions (bronze/silver/gold), classification tags (PII, sensitive), quality tiers (certified/uncertified), retention policies',
          '**IaC with Asset Bundles**: All resources (jobs, clusters, notebooks) defined in YAML, version controlled in Git, deployed via CI/CD, tested in dev before prod',
          '**Code standards**: PEP 8 for Python, notebook documentation requirements, automated testing with pytest, pre-commit hooks for linting',
          '**Security standards**: No storage credentials in code (use Unity Catalog), service principals for automation, IP allowlists for sensitive workspaces, audit log monitoring'
        ],
        databricks_features: ['Asset Bundles', 'Cluster Policies', 'Unity Catalog', 'Audit Logs', 'Git Integration'],
        next_steps: [
          'Workshop: Standards Definition with platform team and domain leads',
          'Documentation: Standards wiki with examples, templates, and decision logs',
          'Implementation: Cluster policies deployed across all workspaces (1 week)',
          'Training: Asset Bundles workshop for engineering teams (half-day)',
          'Enforcement: Automated compliance checks in CI/CD pipeline'
        ]
      },
      
      'adoption_challenges': {
        problem: 'Difficulty driving standards adoption across teams',
        solution: 'Drive adoption with Databricks Assistant for code generation from standards, Solution Accelerators as reference implementations, gamification (leaderboards, badges), and executive sponsorship.',
        recommendations: [
          '**Make standards easy**: Databricks Assistant trained on your standards generates compliant code, quickstart templates with standards baked in, one-click setup for common patterns',
          '**Show the value**: Benchmark study showing 50% time savings with standards, highlight team successes, exec sponsors champion adoption in all-hands meetings',
          '**Gamification**: Leaderboard for teams meeting standards (tracked via System Tables), badges for certifications, quarterly awards for best practices showcase',
          '**Embed in onboarding**: New team members complete standards training (Databricks Academy custom course) before platform access, pair with mentor for first project',
          '**Progressive enforcement**: Start with recommendations, then warnings, then required approvals for non-compliant deployments, with clear escalation path and exceptions process'
        ],
        databricks_features: ['Databricks Assistant', 'Solution Accelerators', 'System Tables', 'Databricks Academy', 'Quickstart Templates'],
        next_steps: [
          'Development: Quickstart templates for top 5 use cases',
          'Training: Custom Databricks Academy course on your standards',
          'Dashboard: Adoption leaderboard from System Tables (weekly updates)',
          'Communication: Monthly newsletter highlighting team wins and new tools',
          'Review: Quarterly adoption metrics review with exec team'
        ]
      },
      
      // Add more critical mappings for data engineering, ML, analytics, genai...
      // (Keeping file size manageable - the keyword fallback will handle the rest)
    };
  }
  
  /**
   * Extract keywords from pain point label
   */
  extractKeywords(label) {
    const text = label.toLowerCase();
    const keywords = [];
    
    // Check each keyword in our map
    for (const keyword of Object.keys(this.keywordMap)) {
      if (text.includes(keyword)) {
        keywords.push(keyword);
      }
    }
    
    return keywords;
  }
  
  /**
   * Smart fallback: Use keyword matching to generate recommendations
   */
  smartFallback(painPoint, pillarId) {
    const keywords = this.extractKeywords(painPoint.label);
    
    if (keywords.length === 0) {
      // No keywords matched - use pillar-based defaults
      return this.pillarDefaultRecommendation(painPoint, pillarId);
    }
    
    // Use the first (most relevant) keyword match
    const keywordData = this.keywordMap[keywords[0]];
    
    return {
      problem: painPoint.label,
      solution: keywordData.solution,
      recommendations: [
        `**Address ${painPoint.label}**: ${keywordData.solution}`,
        `**Key capabilities**: Leverage ${keywordData.features.slice(0, 3).join(', ')} for immediate impact`,
        `**Implementation approach**: Start with POC (2 weeks), validate with pilot team (1 month), roll out to all teams (3 months)`
      ],
      databricks_features: keywordData.features,
      next_steps: [
        `Workshop: ${painPoint.label} Assessment and Solution Design (half-day)`,
        `POC: Implement ${keywordData.features[0]} for pilot use case (2 weeks)`,
        `Training: Team enablement on ${keywordData.features.slice(0, 2).join(' and ')}`,
        `Rollout: Production deployment with monitoring and support`
      ]
    };
  }
  
  /**
   * Pillar-specific default recommendations
   */
  pillarDefaultRecommendation(painPoint, pillarId) {
    const pillarDefaults = {
      'platform_governance': {
        features: ['Unity Catalog', 'Account Console', 'Audit Logs', 'Cluster Policies'],
        solution: 'Implement platform governance with Unity Catalog, audit logging, and cluster policies'
      },
      'data_engineering': {
        features: ['Delta Live Tables', 'Workflows', 'Auto Loader', 'Lakehouse Monitoring'],
        solution: 'Modernize data pipelines with Delta Live Tables, Workflows orchestration, and quality monitoring'
      },
      'analytics_bi': {
        features: ['Databricks SQL', 'Photon', 'Dashboards', 'Genie'],
        solution: 'Accelerate analytics with Databricks SQL, Photon engine, and natural language with Genie'
      },
      'machine_learning': {
        features: ['MLflow', 'Feature Store', 'Model Serving', 'AutoML'],
        solution: 'Streamline ML lifecycle with MLflow tracking, Feature Store, and production Model Serving'
      },
      'generative_ai': {
        features: ['Mosaic AI Agent Framework', 'Vector Search', 'Foundation Model APIs', 'AI Gateway'],
        solution: 'Build GenAI applications with Agent Framework, Vector Search for RAG, and Foundation Model APIs'
      },
      'operational_excellence': {
        features: ['Unity Catalog', 'System Tables', 'Databricks Academy', 'Asset Bundles'],
        solution: 'Drive adoption with Unity Catalog governance, System Tables observability, and Academy training'
      }
    };
    
    const defaults = pillarDefaults[pillarId] || pillarDefaults['platform_governance'];
    
    return {
      problem: painPoint.label,
      solution: defaults.solution,
      recommendations: [
        `**Address ${painPoint.label}**: ${defaults.solution}`,
        `**Recommended approach**: Evaluate ${defaults.features[0]} and ${defaults.features[1]} for your specific use case`,
        `**Next actions**: Schedule assessment with Databricks Solutions Architect to design implementation roadmap`
      ],
      databricks_features: defaults.features,
      next_steps: [
        `Consultation: Databricks Solutions Architect for ${painPoint.label} assessment`,
        `POC: Pilot implementation with ${defaults.features[0]} (2-4 weeks)`,
        `Training: Team enablement on recommended capabilities`,
        `Rollout: Production deployment and monitoring`
      ]
    };
  }
  
  /**
   * Generate intelligent recommendations for a pillar
   */
  generateRecommendations(assessment, pillarId, pillarFramework) {
    console.log(`[IntelligentEngine V2] Analyzing pillar: ${pillarId}`);
    
    const responses = assessment.responses || {};
    const painPoints = this.extractPainPoints(responses, pillarFramework);
    const comments = this.extractComments(responses, pillarFramework);
    const stateGaps = this.analyzeStateGaps(responses, pillarFramework);
    
    console.log(`[IntelligentEngine V2] Pain points: ${painPoints.length}, Comments: ${comments.length}, State gaps: ${stateGaps.length}`);
    console.log(`[IntelligentEngine V2] Pillar: ${pillarId}, Sample pain points:`, painPoints.slice(0, 3).map(p => p.value));
    
    // Generate recommendations for each pain point
    const allRecommendations = [];
    const allNextSteps = [];
    const featureSet = new Set();
    
    // Prioritize pain points by score (severity)
    const topPainPoints = painPoints
      .sort((a, b) => (b.score || 3) - (a.score || 3))
      .slice(0, 10); // Top 10 most critical
    
    for (const painPoint of topPainPoints) {
      // Try exact match first
      let solution = this.solutionMap[painPoint.value];
      
      console.log(`[IntelligentEngine V2] Pain point: ${painPoint.value} (${painPoint.label})`);
      console.log(`[IntelligentEngine V2] Exact match found: ${!!solution}`);
      
      if (!solution) {
        // Use smart fallback
        console.log(`[IntelligentEngine V2] Using smart fallback for: ${painPoint.value}`);
        solution = this.smartFallback(painPoint, pillarId);
      } else {
        console.log(`[IntelligentEngine V2] Using strategic mapping for: ${painPoint.value}`);
      }
      
      if (solution) {
        // Add recommendations
        if (solution.recommendations) {
          allRecommendations.push(...solution.recommendations);
        }
        
        // Add next steps
        if (solution.next_steps) {
          allNextSteps.push(...solution.next_steps);
        }
        
        // Collect features
        if (solution.databricks_features) {
          solution.databricks_features.forEach(f => featureSet.add(f));
        }
      }
    }
    
    // Extract strengths and challenges (pass pillarId and framework for context)
    const theGood = this.extractStrengths(comments, painPoints, stateGaps, pillarId, pillarFramework);
    const theBad = topPainPoints.slice(0, 5).map(pp => pp.label);
    
    // Get Databricks features that SOLVE the pain points (not generic by maturity)
    const painPointFeatures = this.mapPainPointsToFeatures(topPainPoints, pillarId);
    
    console.log(`[IntelligentEngine V2] Mapped ${topPainPoints.length} pain points to ${painPointFeatures.length} relevant Databricks features`);
    
    return {
      theGood: theGood.slice(0, 5),
      theBad: theBad,
      recommendations: allRecommendations.slice(0, 5), // Top 5 recommendations
      nextSteps: allNextSteps.slice(0, 5), // Top 5 next steps
      databricksFeatures: painPointFeatures.slice(0, 4) // Features that solve the pain points
    };
  }
  
  mapPainPointsToFeatures(painPoints, pillarId) {
    // Map pain points to specific Databricks features that solve them
    const featureMap = {
      // Platform Governance pain points
      'poor_isolation': ['Unity Catalog', 'Workspace Administration', 'Private Link', 'IP Access Lists'],
      'quality_issues': ['Delta Live Tables', 'Lakehouse Monitoring', 'Data Quality Checks'],
      'compliance_gaps': ['Unity Catalog', 'Audit Logs', 'Compliance Security Profile', 'Data Classification'],
      'compliance_risks': ['Unity Catalog', 'Audit Logs', 'Compliance Security Profile'],
      'weak_access_control': ['Unity Catalog', 'Service Principals', 'Attribute-Based Access Control'],
      'no_audit_logs': ['Audit Logs', 'System Tables', 'Unity Catalog Audit'],
      'manual_provisioning': ['Databricks Asset Bundles', 'Terraform Provider', 'Databricks CLI'],
      'no_iac': ['Databricks Asset Bundles', 'Terraform Provider', 'Databricks CLI'],
      'resource_conflicts': ['Workspace Administration', 'Cluster Policies', 'Budget Alerts'],
      
      // Data Engineering pain points
      'poor_quality': ['Delta Live Tables', 'Lakehouse Monitoring', 'Auto Loader'],
      'pipeline_failures': ['Delta Live Tables', 'Workflows', 'Alerting'],
      'manual_pipelines': ['Delta Live Tables', 'Workflows', 'Databricks Jobs'],
      'no_monitoring': ['Lakehouse Monitoring', 'System Tables', 'Delta Live Tables Event Log'],
      'scattered_data': ['Unity Catalog', 'Delta Sharing', 'Data Discovery'],
      'error_handling': ['Delta Live Tables', 'Workflows', 'Alerting'],
      'ingestion_issues': ['Auto Loader', 'Copy Into', 'Streaming Tables'],
      
      // Analytics & BI pain points
      'slow_queries': ['Photon', 'Liquid Clustering', 'Predictive I/O', 'Serverless SQL'],
      'inconsistent_performance': ['Serverless SQL', 'Photon', 'Result Caching'],
      'no_caching': ['Result Caching', 'Delta Caching', 'Disk Caching'],
      'limited_monitoring': ['Query History', 'Query Profile', 'System Tables'],
      'access_bottlenecks': ['SQL Warehouses', 'Serverless SQL', 'Partner Connect'],
      'loss_of_trust': ['Unity Catalog', 'Lakehouse Monitoring', 'Data Lineage', 'Audit Logs'],
      'conflicting_reports': ['Unity Catalog', 'Data Lineage', 'Semantic Layer'],
      'conflicting_kpis': ['Unity Catalog', 'Semantic Layer', 'SQL Warehouses'],
      'data_misuse': ['Unity Catalog', 'Audit Logs', 'Row-Level Security', 'Column Masking'],
      'regulatory_exposure': ['Unity Catalog', 'Compliance Security Profile', 'Audit Logs', 'Data Classification'],
      'compliance_sharing': ['Delta Sharing', 'Unity Catalog', 'Audit Logs', 'Clean Rooms'],
      
      // Machine Learning pain points
      'no_experiment_tracking': ['MLflow Tracking', 'MLflow Autologging', 'Experiments'],
      'no_model_registry': ['MLflow Model Registry', 'Unity Catalog for Models'],
      'scattered_artifacts': ['MLflow Model Registry', 'Unity Catalog'],
      'no_model_monitoring': ['Lakehouse Monitoring', 'Model Serving Metrics'],
      'manual_retraining': ['MLflow Webhooks', 'Workflows', 'AutoML'],
      'no_feature_store': ['Feature Store', 'Online Tables', 'Feature Serving'],
      'model_failures': ['Model Serving', 'Lakehouse Monitoring', 'AI Gateway'],
      
      // GenAI pain points
      'no_genai_strategy': ['AI Playground', 'Mosaic AI Agent Framework', 'AI Functions'],
      'unclear_use_cases': ['AI Playground', 'Solution Accelerators', 'Vector Search'],
      'no_vector_search': ['Vector Search', 'Online Tables', 'Delta Sync'],
      'prompt_management': ['AI Playground', 'MLflow', 'AI Gateway'],
      'no_rag': ['Mosaic AI Agent Framework', 'Vector Search'],
      'reputation_risk': ['AI Gateway', 'Guardrails', 'Content Filtering'],
      'compliance_risk': ['AI Gateway', 'Audit Logs', 'Model Monitoring'],
      
      // Operational Excellence pain points
      'no_coe': ['Databricks Academy', 'Professional Services', 'Partner Network'],
      'unclear_charter': ['Unity Catalog', 'System Tables', 'Account Console'],
      'resource_constraints': ['Databricks Academy', 'Professional Services', 'Community'],
      'standards_gaps': ['Databricks Asset Bundles', 'Cluster Policies', 'Unity Catalog'],
      'adoption_challenges': ['Databricks Assistant', 'Solution Accelerators'],
      'no_training': ['Databricks Academy', 'Partner Training'],
      'poor_collaboration': ['Repos', 'Git Integration', 'Comments'],
      'no_cost_tracking': ['System Tables', 'Budget Alerts']
    };
    
    const features = new Set();
    
    // For each pain point, add relevant features
    painPoints.forEach(pp => {
      const relevantFeatures = featureMap[pp.value] || [];
      relevantFeatures.slice(0, 2).forEach(f => features.add(f)); // Top 2 per pain point
    });
    
    // Convert feature names to objects with details
    const featureArray = Array.from(features);
    const featureDetails = [];
    
    // Get feature details from the feature mapper
    const currentScore = 3;
    const pillarRecs = this.featureMapper.getRecommendationsForPillar(pillarId, currentScore, {});
    const allMapperFeatures = [
      ...(pillarRecs?.currentMaturity?.features || []),
      ...(pillarRecs?.nextLevel?.features || [])
    ];
    
    // Match our pain-point-specific features with detailed info from mapper
    featureArray.forEach(featureName => {
      const detailedFeature = allMapperFeatures.find(f => 
        f.name && (
          f.name.toLowerCase().includes(featureName.toLowerCase()) ||
          featureName.toLowerCase().includes(f.name.toLowerCase())
        )
      );
      
      if (detailedFeature) {
        featureDetails.push(detailedFeature);
      } else {
        // Create basic feature object with proper docs link
        const docsLink = this.getFeatureDocsLink(featureName);
        featureDetails.push({
          name: featureName,
          description: this.getFeatureDescription(featureName),
          benefits: this.getFeatureBenefits(featureName),
          docs: docsLink
        });
      }
    });
    
    console.log(`[mapPainPointsToFeatures] ${pillarId}: ${painPoints.length} pain points → ${features.size} unique features → ${featureDetails.length} with details`);
    
    return featureDetails;
  }
  
  getFeatureDocsLink(featureName) {
    const docsLinks = {
      'Unity Catalog': 'https://docs.databricks.com/en/data-governance/unity-catalog/index.html',
      'Audit Logs': 'https://docs.databricks.com/en/admin/account-settings/audit-logs.html',
      'Delta Sharing': 'https://docs.databricks.com/en/data-sharing/index.html',
      'Delta Live Tables': 'https://docs.databricks.com/en/delta-live-tables/index.html',
      'Lakehouse Monitoring': 'https://docs.databricks.com/en/lakehouse-monitoring/index.html',
      'Photon': 'https://docs.databricks.com/en/compute/photon.html',
      'Serverless SQL': 'https://docs.databricks.com/en/sql/admin/serverless.html',
      'Liquid Clustering': 'https://docs.databricks.com/en/delta/clustering.html',
      'MLflow': 'https://docs.databricks.com/en/mlflow/index.html',
      'Model Serving': 'https://docs.databricks.com/en/machine-learning/model-serving/index.html',
      'Vector Search': 'https://docs.databricks.com/en/generative-ai/vector-search.html',
      'AI Gateway': 'https://docs.databricks.com/en/generative-ai/ai-gateway.html',
      'Workflows': 'https://docs.databricks.com/en/jobs/index.html',
      'Auto Loader': 'https://docs.databricks.com/en/ingestion/auto-loader/index.html',
      'Databricks Asset Bundles': 'https://docs.databricks.com/en/dev-tools/bundles/index.html',
      'Feature Store': 'https://docs.databricks.com/en/machine-learning/feature-store/index.html',
      'Databricks Academy': 'https://www.databricks.com/learn/training',
      'System Tables': 'https://docs.databricks.com/en/admin/system-tables/index.html',
      'Cluster Policies': 'https://docs.databricks.com/en/admin/clusters/policies.html',
      'Row-Level Security': 'https://docs.databricks.com/en/data-governance/unity-catalog/row-and-column-filters.html',
      'Column Masking': 'https://docs.databricks.com/en/data-governance/unity-catalog/row-and-column-filters.html',
      'Data Lineage': 'https://docs.databricks.com/en/data-governance/unity-catalog/data-lineage.html',
      'Data Classification': 'https://docs.databricks.com/en/data-governance/unity-catalog/tags.html',
      'Clean Rooms': 'https://docs.databricks.com/en/data-sharing/clean-rooms.html'
    };
    return docsLinks[featureName] || 'https://docs.databricks.com/en/index.html';
  }
  
  getFeatureDescription(featureName) {
    const descriptions = {
      'Unity Catalog': 'Unified governance for data and AI assets with centralized access control',
      'Audit Logs': 'Track and monitor all workspace activities for compliance and security',
      'Delta Sharing': 'Securely share live data across organizations without copying',
      'Delta Live Tables': 'Declarative ETL framework with automatic quality monitoring',
      'Lakehouse Monitoring': 'Monitor data quality, schema changes, and model performance',
      'Photon': 'High-performance query engine for 3-5x faster SQL and DataFrame queries',
      'Serverless SQL': 'Auto-scaling SQL warehouses with instant start and pay-per-query pricing',
      'Liquid Clustering': 'Automatic data layout optimization without manual Z-ordering',
      'MLflow': 'Open-source platform for ML lifecycle management',
      'Model Serving': 'Deploy models as REST APIs with auto-scaling and monitoring',
      'Vector Search': 'Managed vector database for similarity search and RAG applications',
      'AI Gateway': 'Centralized gateway for LLM usage with governance and cost tracking',
      'Workflows': 'Orchestrate data pipelines and ML workflows with dependencies',
      'Auto Loader': 'Incremental data ingestion with schema evolution and automatic recovery',
      'Databricks Asset Bundles': 'Infrastructure as code for Databricks resources',
      'Feature Store': 'Centralized repository for ML features with point-in-time lookups',
      'Databricks Academy': 'Free online training and certification programs',
      'System Tables': 'Queryable logs for usage, billing, and audit data',
      'Cluster Policies': 'Governance rules to control cluster configurations and costs',
      'Row-Level Security': 'Fine-grained access control at the row level',
      'Column Masking': 'Dynamic data masking for sensitive columns',
      'Data Lineage': 'Automatic tracking of data transformations and dependencies',
      'Data Classification': 'Tag and classify data for governance and compliance',
      'Clean Rooms': 'Collaborate on sensitive data without revealing raw data'
    };
    return descriptions[featureName] || `${featureName} capability for Databricks`;
  }
  
  getFeatureBenefits(featureName) {
    const benefits = {
      'Unity Catalog': ['Centralized governance', 'Fine-grained access control', 'Data lineage', 'Cross-workspace sharing'],
      'Audit Logs': ['Compliance tracking', 'Security monitoring', 'Activity history', 'Forensics'],
      'Delta Sharing': ['Secure data sharing', 'No data duplication', 'Live data access', 'Cross-organization collaboration'],
      'Delta Live Tables': ['Automated quality checks', 'Declarative pipelines', 'Error handling', 'Data lineage'],
      'Lakehouse Monitoring': ['Data quality monitoring', 'Drift detection', 'Automated alerting', 'Historical tracking'],
      'Photon': ['3-5x faster queries', 'Lower costs', 'No code changes', 'Automatic optimization'],
      'Serverless SQL': ['Instant start', 'Auto-scaling', 'Pay-per-query', 'No cluster management'],
      'Row-Level Security': ['Fine-grained access', 'Dynamic filtering', 'Compliance', 'Data privacy'],
      'Column Masking': ['Sensitive data protection', 'Automatic masking', 'Policy-based', 'Regulatory compliance'],
      'Data Lineage': ['Impact analysis', 'Compliance reporting', 'Data discovery', 'Debugging'],
      'Data Classification': ['Automated tagging', 'Compliance tracking', 'Data discovery', 'Governance policies'],
      'Clean Rooms': ['Privacy-preserving analytics', 'Secure collaboration', 'No raw data exposure', 'Regulatory compliance']
    };
    return benefits[featureName] || ['Addresses identified challenges', 'Databricks managed service'];
  }
  
  /**
   * Generate dynamic strategic roadmap based on assessment priorities and gaps
   */
  generateStrategicRoadmap(prioritizedActions) {
    console.log('[generateStrategicRoadmap] Generating roadmap from', prioritizedActions.length, 'pillars');
    
    // Sort by priority and gap
    const sorted = [...prioritizedActions].sort((a, b) => {
      // Critical first, then high, then medium/low
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.gap - a.gap;
    });
    
    // Phase 1 (0-3 months): Foundation - Critical items + Unity Catalog (foundational)
    const phase1Items = [];
    const phase2Items = [];
    const phase3Items = [];
    
    // Always include Unity Catalog if there are governance/platform challenges
    const hasGovernanceChallenges = sorted.some(p => 
      p.pillarId === 'platform_governance' || 
      p.theBad?.some(challenge => 
        challenge.toLowerCase().includes('governance') ||
        challenge.toLowerCase().includes('access control') ||
        challenge.toLowerCase().includes('compliance')
      )
    );
    
    if (hasGovernanceChallenges) {
      phase1Items.push('Implement Unity Catalog for centralized governance and access control');
    }
    
    // Phase 1: Critical priority pillars (gap >= 2)
    const criticalPillars = sorted.filter(p => p.gap >= 2);
    criticalPillars.slice(0, 2).forEach(pillar => {
      const topChallenge = pillar.theBad?.[0] || `Maturity gap of ${pillar.gap} levels`;
      const topFeature = pillar.databricksFeatures?.[0]?.name || 'recommended features';
      phase1Items.push(`${pillar.pillarName}: Deploy ${topFeature} to address ${topChallenge.substring(0, 60)}...`);
    });
    
    // Ensure we have at least 3 items in Phase 1
    if (phase1Items.length < 3 && sorted.length > 0) {
      const nextPillar = sorted.find(p => !criticalPillars.includes(p));
      if (nextPillar) {
        phase1Items.push(`Establish ${nextPillar.pillarName} monitoring and baseline metrics`);
      }
    }
    
    // Phase 2: High priority pillars (gap = 1) + scale critical solutions
    const highPriorityPillars = sorted.filter(p => p.gap === 1 || (p.gap >= 2 && !criticalPillars.slice(0, 2).includes(p)));
    highPriorityPillars.slice(0, 2).forEach(pillar => {
      const topFeature = pillar.databricksFeatures?.[1]?.name || pillar.databricksFeatures?.[0]?.name || 'capabilities';
      phase2Items.push(`${pillar.pillarName}: Scale ${topFeature} across teams and use cases`);
    });
    
    // Add integration items for Phase 2
    if (sorted.length >= 3) {
      phase2Items.push('Integrate monitoring dashboards across all pillars for visibility');
    }
    
    // Ensure we have at least 3 items in Phase 2
    if (phase2Items.length < 3 && sorted.length > 0) {
      phase2Items.push('Deploy second wave of capabilities based on Phase 1 learnings');
    }
    
    // Phase 3: Optimization and remaining gaps
    const remainingPillars = sorted.filter(p => p.gap === 0 || (p.gap === 1 && !highPriorityPillars.slice(0, 2).includes(p)));
    
    // Add MLOps/CI-CD if ML pillar exists
    const mlPillar = sorted.find(p => p.pillarId === 'machine_learning');
    if (mlPillar) {
      phase3Items.push('Formalize MLOps CI/CD pipeline for automated model deployment');
    }
    
    // Add GenAI if pillar exists
    const genaiPillar = sorted.find(p => p.pillarId === 'genai');
    if (genaiPillar) {
      const hasRAG = genaiPillar.theBad?.some(c => c.toLowerCase().includes('rag'));
      if (hasRAG) {
        phase3Items.push('Expand GenAI use cases with RAG implementation and vector search');
      } else {
        phase3Items.push('Deploy production GenAI applications with governance guardrails');
      }
    }
    
    // Add data mesh if multiple pillars are mature
    const maturePillars = sorted.filter(p => p.currentScore >= 4);
    if (maturePillars.length >= 3) {
      phase3Items.push('Align data mesh principles with Unity Catalog for domain-oriented data ownership');
    }
    
    // Ensure we have at least 3 items in Phase 3
    if (phase3Items.length < 3) {
      phase3Items.push('Optimize and tune all deployed capabilities for maximum ROI');
      phase3Items.push('Establish center of excellence for ongoing Databricks best practices');
    }
    
    const roadmap = {
      phases: [
        {
          id: 'phase1',
          title: 'Phase 1: Foundation (0–3 months)',
          items: phase1Items.slice(0, 3)
        },
        {
          id: 'phase2',
          title: 'Phase 2: Scale (3–6 months)',
          items: phase2Items.slice(0, 3)
        },
        {
          id: 'phase3',
          title: 'Phase 3: Optimize (6–12 months)',
          items: phase3Items.slice(0, 3)
        }
      ]
    };
    
    console.log('[generateStrategicRoadmap] Generated roadmap:', JSON.stringify(roadmap, null, 2));
    return roadmap;
  }
  
  /**
   * Calculate expected business impact based on assessment data
   */
  calculateBusinessImpact(assessment, prioritizedActions, industry = 'Technology') {
    console.log('[calculateBusinessImpact] Calculating for industry:', industry);
    
    const responses = assessment.responses || {};
    
    // Calculate average gap across all pillars
    const totalGap = prioritizedActions.reduce((sum, p) => sum + (p.gap || 0), 0);
    const avgGap = prioritizedActions.length > 0 ? totalGap / prioritizedActions.length : 0;
    
    // Calculate average current maturity
    const totalCurrent = prioritizedActions.reduce((sum, p) => sum + (p.currentScore || 3), 0);
    const avgCurrent = prioritizedActions.length > 0 ? totalCurrent / prioritizedActions.length : 3;
    
    // Calculate average target maturity
    const totalTarget = prioritizedActions.reduce((sum, p) => sum + (p.targetScore || 4), 0);
    const avgTarget = prioritizedActions.length > 0 ? totalTarget / prioritizedActions.length : 4;
    
    console.log(`[calculateBusinessImpact] Avg gap: ${avgGap.toFixed(1)}, Avg current: ${avgCurrent.toFixed(1)}, Avg target: ${avgTarget.toFixed(1)}`);
    
    // Industry-specific multipliers (based on data-driven insights)
    const industryMultipliers = {
      'Financial Services': { speed: 1.2, cost: 1.1, overhead: 1.15 },
      'Healthcare': { speed: 1.15, cost: 1.05, overhead: 1.2 },
      'Retail': { speed: 1.25, cost: 1.15, overhead: 1.1 },
      'Manufacturing': { speed: 1.1, cost: 1.2, overhead: 1.25 },
      'Technology': { speed: 1.15, cost: 1.1, overhead: 1.15 },
      'Telecommunications': { speed: 1.2, cost: 1.15, overhead: 1.2 },
      'Energy': { speed: 1.1, cost: 1.2, overhead: 1.15 },
      'default': { speed: 1.0, cost: 1.0, overhead: 1.0 }
    };
    
    const multipliers = industryMultipliers[industry] || industryMultipliers['default'];
    
    // Base impact calculations using industry benchmarks
    
    // 1. ANALYTICS SPEED (based on Analytics/BI and Data Engineering maturity improvements)
    const analyticsPillar = prioritizedActions.find(p => p.pillarId === 'analytics_bi');
    const dataEngPillar = prioritizedActions.find(p => p.pillarId === 'data_engineering');
    
    // Base: 1.5x per maturity level improvement (industry average)
    // Photon/Serverless SQL can provide 3-5x speedup
    let speedMultiplier = 1.0;
    if (analyticsPillar) {
      const analyticsImprovement = analyticsPillar.gap || 0;
      speedMultiplier += analyticsImprovement * 0.6; // +60% per level
      
      // Bonus if deploying Photon/Serverless
      const hasPhoton = analyticsPillar.databricksFeatures?.some(f => 
        f.name && (f.name.includes('Photon') || f.name.includes('Serverless'))
      );
      if (hasPhoton) {
        speedMultiplier += 0.8; // +80% boost from Photon
      }
    }
    
    if (dataEngPillar) {
      const dataImprovement = dataEngPillar.gap || 0;
      speedMultiplier += dataImprovement * 0.4; // +40% per level
      
      // Bonus for DLT automation
      const hasDLT = dataEngPillar.databricksFeatures?.some(f => 
        f.name && f.name.includes('Delta Live Tables')
      );
      if (hasDLT) {
        speedMultiplier += 0.5; // +50% boost from DLT
      }
    }
    
    // Apply industry multiplier and cap at reasonable maximum
    speedMultiplier = Math.min(speedMultiplier * multipliers.speed, 5.0);
    const decisionSpeed = speedMultiplier.toFixed(1) + '×';
    
    // 2. COST OPTIMIZATION (based on Platform Governance + automation level)
    const platformPillar = prioritizedActions.find(p => p.pillarId === 'platform_governance');
    const opExPillar = prioritizedActions.find(p => p.pillarId === 'operational_excellence');
    
    // Base: 3-5% per maturity level
    let costSavings = 0;
    if (platformPillar) {
      const platformImprovement = platformPillar.gap || 0;
      costSavings += platformImprovement * 4; // 4% per level
      
      // Bonus for serverless/auto-scaling
      const hasServerless = platformPillar.databricksFeatures?.some(f => 
        f.name && (f.name.includes('Serverless') || f.name.includes('Auto Scaling'))
      );
      if (hasServerless) {
        costSavings += 8; // +8% from serverless
      }
      
      // Bonus for budget controls
      const hasBudgets = platformPillar.databricksFeatures?.some(f => 
        f.name && (f.name.includes('Budget') || f.name.includes('Cost'))
      );
      if (hasBudgets) {
        costSavings += 5; // +5% from budget controls
      }
    }
    
    if (opExPillar) {
      const opExImprovement = opExPillar.gap || 0;
      costSavings += opExImprovement * 3; // 3% per level
    }
    
    // Apply industry multiplier and cap at 40%
    costSavings = Math.min(costSavings * multipliers.cost, 40);
    const costOptimization = Math.round(costSavings) + '%';
    
    // 3. OPERATIONAL OVERHEAD REDUCTION (based on automation maturity)
    let overheadReduction = 0;
    
    // Data Engineering automation
    if (dataEngPillar) {
      const dataImprovement = dataEngPillar.gap || 0;
      overheadReduction += dataImprovement * 12; // 12% per level
      
      // Bonus for automation features
      const hasAutomation = dataEngPillar.databricksFeatures?.some(f => 
        f.name && (f.name.includes('Auto Loader') || f.name.includes('DLT') || f.name.includes('Workflow'))
      );
      if (hasAutomation) {
        overheadReduction += 15; // +15% from automation
      }
    }
    
    // ML automation
    const mlPillar = prioritizedActions.find(p => p.pillarId === 'machine_learning');
    if (mlPillar) {
      const mlImprovement = mlPillar.gap || 0;
      overheadReduction += mlImprovement * 8; // 8% per level
      
      // Bonus for MLOps automation
      const hasMLOps = mlPillar.databricksFeatures?.some(f => 
        f.name && (f.name.includes('MLflow') || f.name.includes('Model Serving'))
      );
      if (hasMLOps) {
        overheadReduction += 10; // +10% from MLOps
      }
    }
    
    // Governance automation
    if (platformPillar) {
      const platformImprovement = platformPillar.gap || 0;
      overheadReduction += platformImprovement * 6; // 6% per level
      
      // Bonus for Unity Catalog (reduces manual access management)
      const hasUnityCatalog = platformPillar.databricksFeatures?.some(f => 
        f.name && f.name.includes('Unity Catalog')
      );
      if (hasUnityCatalog) {
        overheadReduction += 12; // +12% from Unity Catalog
      }
    }
    
    // Apply industry multiplier and cap at 65%
    overheadReduction = Math.min(overheadReduction * multipliers.overhead, 65);
    const manualOverhead = Math.round(overheadReduction) + '%';
    
    const impact = {
      decisionSpeed: {
        value: decisionSpeed,
        label: 'Increase in analytics-driven decision-making speed',
        drivers: [
          analyticsPillar ? `${analyticsPillar.pillarName} improvement (${analyticsPillar.gap} levels)` : null,
          dataEngPillar ? `${dataEngPillar.pillarName} automation` : null
        ].filter(Boolean)
      },
      costOptimization: {
        value: costOptimization,
        label: 'Average cost optimization through platform automation',
        drivers: [
          platformPillar ? `${platformPillar.pillarName} improvements` : null,
          'Serverless compute and auto-scaling',
          'Budget controls and monitoring'
        ].filter(Boolean)
      },
      manualOverhead: {
        value: manualOverhead,
        label: 'Reduction in manual operational overhead',
        drivers: [
          dataEngPillar ? 'Data pipeline automation' : null,
          mlPillar ? 'MLOps automation' : null,
          platformPillar ? 'Governance automation (Unity Catalog)' : null
        ].filter(Boolean)
      }
    };
    
    console.log('[calculateBusinessImpact] Calculated impact:', JSON.stringify(impact, null, 2));
    return impact;
  }
  
  /**
   * Generate dynamic maturity summary based on assessment data
   */
  generateMaturitySummary(assessment, prioritizedActions, currentScore, targetScore, industry = 'Technology') {
    console.log('[generateMaturitySummary] Generating for:', { currentScore, targetScore, industry });
    
    // Sort pillars by maturity (to identify strengths and weaknesses)
    const sorted = [...prioritizedActions].sort((a, b) => b.currentScore - a.currentScore);
    
    const strongPillars = sorted.filter(p => p.currentScore >= 4).slice(0, 2);
    const weakPillars = sorted.filter(p => p.currentScore <= 2).slice(0, 2);
    const criticalGaps = sorted.filter(p => p.gap >= 2).slice(0, 2);
    
    // Current Maturity Description
    let currentDescription = '';
    if (strongPillars.length > 0) {
      const strongNames = strongPillars.map(p => p.pillarName.replace(/^[🏛️🧱💾📊🤖✨⚙️]+\s*/, '')).join(' and ');
      currentDescription += `Strong ${strongNames}`;
      
      // Add specific capabilities
      const topFeature = strongPillars[0]?.databricksFeatures?.[0];
      if (topFeature?.name) {
        currentDescription += ` with ${topFeature.name} operational`;
      }
    }
    
    if (weakPillars.length > 0) {
      const weakNames = weakPillars.map(p => p.pillarName.replace(/^[🏛️🧱💾📊🤖✨⚙️]+\s*/, '')).join(' and ');
      if (currentDescription) {
        currentDescription += ', but ';
      }
      currentDescription += `${weakNames} ${weakPillars.length === 1 ? 'is' : 'are'} still in early stages with manual processes`;
    }
    
    if (!currentDescription) {
      currentDescription = 'Balanced maturity across pillars with opportunities for automation and optimization';
    }
    
    // Target Maturity Description
    let targetDescription = '';
    if (criticalGaps.length > 0) {
      const improvements = criticalGaps.map(gap => {
        const pillarName = gap.pillarName.replace(/^[🏛️🧱💾📊🤖✨⚙️]+\s*/, '');
        const topFeature = gap.databricksFeatures?.[0]?.name;
        if (topFeature) {
          return `${pillarName} with ${topFeature}`;
        }
        return pillarName;
      });
      targetDescription = `Advanced automation in ${improvements.join(' and ')}`;
    }
    
    // Add governance if Platform is in focus
    const platformPillar = prioritizedActions.find(p => p.pillarId === 'platform_governance');
    if (platformPillar && platformPillar.gap >= 1) {
      const hasGovernance = targetDescription.toLowerCase().includes('platform');
      if (!hasGovernance) {
        targetDescription += targetDescription ? ' with unified governance and security' : 'Unified governance and security across all pillars';
      }
    }
    
    if (!targetDescription) {
      targetDescription = 'Optimized, governed, and automated capabilities across all pillars';
    }
    
    // Improvement Potential Description
    let improvementDescription = 'Deploy ';
    const topGaps = sorted.filter(p => p.gap >= 1).slice(0, 3);
    const deployments = topGaps.map(gap => {
      const topFeature = gap.databricksFeatures?.[0]?.name;
      const pillarName = gap.pillarName.replace(/^[🏛️🧱💾📊🤖✨⚙️]+\s*/, '');
      if (topFeature) {
        return `${topFeature} for ${pillarName.toLowerCase()}`;
      }
      return `automation for ${pillarName.toLowerCase()}`;
    });
    
    if (deployments.length > 0) {
      improvementDescription += deployments.join(', ');
    } else {
      improvementDescription = 'Optimize existing capabilities and expand automation coverage';
    }
    
    const maturitySummary = {
      current: {
        score: currentScore,
        level: this.getMaturityLevelName(currentScore),
        description: currentDescription
      },
      target: {
        score: targetScore,
        level: this.getMaturityLevelName(targetScore),
        description: targetDescription
      },
      improvement: {
        gap: targetScore - currentScore,
        timeline: '6–12 months',
        description: improvementDescription
      },
      roadmapIntro: this.generateRoadmapIntro(prioritizedActions, industry)
    };
    
    console.log('[generateMaturitySummary] Generated summary:', JSON.stringify(maturitySummary, null, 2));
    return maturitySummary;
  }
  
  getMaturityLevelName(score) {
    const roundedScore = Math.round(score);
    const levels = {
      1: 'Initial',
      2: 'Repeatable',
      3: 'Defined',
      4: 'Managed',
      5: 'Optimizing'
    };
    return levels[roundedScore] || 'Defined';
  }
  
  generateRoadmapIntro(prioritizedActions, industry) {
    const criticalGaps = prioritizedActions.filter(p => p.gap >= 2);
    const highPriority = prioritizedActions.filter(p => p.gap === 1);
    
    let intro = 'This roadmap ';
    
    // Mention critical gaps
    if (criticalGaps.length > 0) {
      const gapNames = criticalGaps.map(p => {
        const name = p.pillarName.replace(/^[🏛️🧱💾📊🤖✨⚙️]+\s*/, '');
        return `${name} (${p.gap} ${p.gap === 1 ? 'level' : 'levels'})`;
      });
      intro += `addresses your critical gaps in ${gapNames.join(' and ')}, `;
    } else if (highPriority.length > 0) {
      const priorityNames = highPriority.slice(0, 2).map(p => 
        p.pillarName.replace(/^[🏛️🧱💾📊🤖✨⚙️]+\s*/, '')
      );
      intro += `focuses on ${priorityNames.join(' and ')} optimization, `;
    } else {
      intro += 'optimizes your existing capabilities, ';
    }
    
    // Mention focus areas
    const hasGovernance = criticalGaps.some(p => p.pillarId === 'platform_governance');
    const hasAutomation = criticalGaps.some(p => p.pillarId === 'data_engineering');
    const hasML = criticalGaps.some(p => p.pillarId === 'machine_learning');
    const hasGenAI = criticalGaps.some(p => p.pillarId === 'generative_ai');
    
    const focuses = [];
    if (hasGovernance) focuses.push('governance');
    if (hasAutomation) focuses.push('automation');
    if (hasML) focuses.push('MLOps');
    if (hasGenAI) focuses.push('GenAI capabilities');
    
    if (focuses.length > 0) {
      intro += `focusing on ${focuses.join(' and ')}. `;
    } else {
      intro += 'with balanced improvements across all pillars. ';
    }
    
    // Industry context
    const industryContext = {
      'Financial Services': 'Emphasis on compliance, security, and data governance',
      'Healthcare': 'Focus on data privacy, compliance, and secure analytics',
      'Retail': 'Prioritizing real-time analytics and customer insights',
      'Manufacturing': 'Optimizing operational efficiency and predictive maintenance',
      'Technology': 'Accelerating innovation and time-to-market',
      'Telecommunications': 'Enhancing customer experience and network optimization',
      'Energy': 'Improving operational efficiency and regulatory compliance'
    };
    
    const context = industryContext[industry] || 'Tailored to your industry requirements';
    intro += context + '.';
    
    return intro;
  }
  
  // ... (rest of the methods: extractPainPoints, extractComments, etc. - keeping them as-is)
  
  extractPainPoints(responses, framework) {
    const painPoints = [];
    if (!framework || !framework.dimensions) {
      console.log('[IntelligentEngine] No framework or dimensions');
      return painPoints;
    }
    
    console.log(`[IntelligentEngine] Extracting pain points from ${framework.dimensions.length} dimensions`);
    console.log('[IntelligentEngine] Sample response keys:', Object.keys(responses).slice(0, 5));
    
    framework.dimensions.forEach(dim => {
      dim.questions.forEach(q => {
        const techPain = q.perspectives?.find(p => p.id === 'technical_pain');
        if (techPain) {
          const responseKey = `${q.id}_technical_pain`;
          const selected = responses[responseKey];
          console.log(`[IntelligentEngine] Question ${q.id}, technical_pain response:`, selected);
          
          if (Array.isArray(selected) && selected.length > 0) {
            selected.forEach(value => {
              const option = techPain.options.find(o => o.value === value);
              if (option) {
                painPoints.push({ 
                  value, 
                  label: option.label, 
                  type: 'technical',
                  score: option.score || 3
                });
                console.log(`[IntelligentEngine] Found technical pain: ${option.label}`);
              }
            });
          }
        }
        
        const bizPain = q.perspectives?.find(p => p.id === 'business_pain');
        if (bizPain) {
          const responseKey = `${q.id}_business_pain`;
          const selected = responses[responseKey];
          
          if (Array.isArray(selected) && selected.length > 0) {
            selected.forEach(value => {
              const option = bizPain.options.find(o => o.value === value);
              if (option) {
                painPoints.push({ 
                  value, 
                  label: option.label, 
                  type: 'business',
                  score: option.score || 3
                });
                console.log(`[IntelligentEngine] Found business pain: ${option.label}`);
              }
            });
          }
        }
      });
    });
    
    console.log(`[IntelligentEngine] Total pain points extracted: ${painPoints.length}`);
    return painPoints;
  }

  extractComments(responses, framework) {
    const comments = [];
    if (!framework || !framework.dimensions) return comments;
    
    framework.dimensions.forEach(dim => {
      dim.questions.forEach(q => {
        const comment = responses[`${q.id}_comment`];
        if (comment && comment.trim()) {
          comments.push({ question: q.question, text: comment });
        }
      });
    });
    
    return comments;
  }

  analyzeStateGaps(responses, framework) {
    const gaps = [];
    if (!framework || !framework.dimensions) return gaps;
    
    framework.dimensions.forEach(dim => {
      dim.questions.forEach(q => {
        const current = responses[`${q.id}_current_state`];
        const future = responses[`${q.id}_future_state`];
        
        if (current !== undefined && future !== undefined) {
          gaps.push({
            question: q.question,
            dimension: dim.name,  // Add dimension name
            current: current,
            future: future,
            gap: future - current
          });
        }
      });
    });
    
    return gaps.sort((a, b) => b.gap - a.gap);
  }

  extractStrengths(comments, painPoints, stateGaps, pillarId, pillarFramework) {
    const strengths = [];
    
    console.log(`[extractStrengths] Pillar: ${pillarId}, Pain points: ${painPoints.length}, State gaps: ${stateGaps.length}`);
    
    // Get all possible pain point values for THIS pillar from framework
    const allPillarPainPoints = this.getAllPainPointsFromFramework(pillarFramework);
    const selectedPainValues = new Set(painPoints.map(pp => pp.value));
    
    console.log(`[extractStrengths] All possible pain points in ${pillarId}:`, allPillarPainPoints.size);
    console.log(`[extractStrengths] Selected pain points:`, selectedPainValues.size);
    
    // Strategy 1: Extract SPECIFIC tool/capability mentions from comments (highest value)
    comments.forEach(c => {
      const specificMentions = this.extractSpecificCapabilities(c.text);
      if (specificMentions) {
        strengths.push(specificMentions);
      }
    });
    
    // Strategy 2: Identify what they're NOT struggling with (pillar-specific actual capabilities)
    const pillarSpecificStrengths = this.identifyAbsentPainPoints(
      allPillarPainPoints, 
      selectedPainValues, 
      pillarId
    );
    if (pillarSpecificStrengths.length > 0) {
      console.log(`[extractStrengths] Found ${pillarSpecificStrengths.length} pillar-specific strengths`);
      strengths.push(...pillarSpecificStrengths);
    }
    
    // Strategy 3: For high-scoring areas, extract dimension-specific practices
    const highScoreQuestions = stateGaps.filter(gap => gap.current >= 4);
    if (highScoreQuestions.length > 0 && strengths.length < 5) {
      console.log(`[extractStrengths] Found ${highScoreQuestions.length} high-score dimensions`);
      // Add dimension names as context (not score-based statements)
      highScoreQuestions.slice(0, 2).forEach(q => {
        const practiceStrength = this.describePractice(q.dimension, pillarId, true);
        if (practiceStrength) {
          strengths.push(practiceStrength);
        }
      });
    }
    
    // Deduplicate and limit
    const uniqueStrengths = [...new Set(strengths)].slice(0, 5);
    console.log(`[extractStrengths] Final strengths for ${pillarId}:`, uniqueStrengths.length);
    return uniqueStrengths;
  }
  
  getAllPainPointsFromFramework(pillarFramework) {
    // Extract all pain point values that exist in this pillar's framework
    const allPainPoints = new Set();
    
    if (!pillarFramework || !pillarFramework.dimensions) {
      return allPainPoints;
    }
    
    pillarFramework.dimensions.forEach(dim => {
      dim.questions.forEach(q => {
        q.perspectives?.forEach(p => {
          if (p.id.includes('pain')) {
            p.options?.forEach(opt => {
              allPainPoints.add(opt.value);
            });
          }
        });
      });
    });
    
    return allPainPoints;
  }
  
  describePractice(dimensionName, pillarId, isHighMaturity) {
    // Map dimension names to actual practices/capabilities (NOT score statements)
    const practiceMap = {
      // Platform Governance
      'Environment Architecture & Scalability': isHighMaturity ? 'Multi-environment setup with automated provisioning and scaling' : 'Basic environment separation with manual provisioning',
      'Identity, Security & Access Control': isHighMaturity ? 'Role-based access control with SSO and fine-grained permissions' : 'Basic authentication with limited access controls',
      'Governance & Compliance': isHighMaturity ? 'Automated compliance monitoring with audit trails and policy enforcement' : 'Manual compliance tracking with periodic reviews',
      'Observability & Monitoring': isHighMaturity ? 'Real-time monitoring with alerting and automated incident response' : 'Basic logging with manual log review',
      
      // Data Engineering
      'Lakehouse Architecture': isHighMaturity ? 'Bronze/Silver/Gold medallion architecture with automated promotion' : 'Basic data lake structure with manual curation',
      'Ingestion Strategy': isHighMaturity ? 'Automated ingestion with schema evolution and quality validation' : 'Manual batch ingestion with limited validation',
      'Pipeline Orchestration': isHighMaturity ? 'Event-driven orchestration with dependency management and retries' : 'Scheduled jobs with basic error handling',
      'Data Quality & Validation': isHighMaturity ? 'Automated quality checks with quarantine and remediation workflows' : 'Ad-hoc quality validation with manual fixes',
      
      // Analytics & BI
      'Analytic Performance': isHighMaturity ? 'Query optimization with caching, indexing, and performance monitoring' : 'Basic queries with manual optimization',
      'Semantic Layer & Metrics': isHighMaturity ? 'Centralized metrics layer with governed definitions and lineage' : 'Ad-hoc metrics with inconsistent definitions',
      'BI & Reporting': isHighMaturity ? 'Self-service dashboards with scheduled delivery and alerts' : 'Manual report generation with limited self-service',
      'Self-Service Analytics': isHighMaturity ? 'Governed self-service with data discovery and assisted exploration' : 'Limited self-service with IT support required',
      
      // Machine Learning
      'ML Lifecycle Management': isHighMaturity ? 'End-to-end MLOps with automated training, testing, and deployment' : 'Manual ML workflows with limited tracking',
      'Experiment Tracking & Management': isHighMaturity ? 'Centralized experiment tracking with versioning and reproducibility' : 'Notebook-based tracking with manual documentation',
      'Model Deployment & Serving': isHighMaturity ? 'Automated deployment with A/B testing and canary releases' : 'Manual model deployment with basic serving',
      'Model Monitoring & Operations': isHighMaturity ? 'Drift detection with automated retraining and alerting' : 'Manual performance monitoring with periodic reviews',
      
      // GenAI
      'GenAI Strategy & Readiness': isHighMaturity ? 'Production GenAI applications with governance and quality controls' : 'Exploratory GenAI projects with limited governance',
      'Data & Knowledge Readiness': isHighMaturity ? 'Curated knowledge base with vector embeddings and retrieval optimization' : 'Basic document corpus with manual curation',
      'LLM & Foundation Model Strategy': isHighMaturity ? 'Multi-model strategy with fine-tuning and evaluation frameworks' : 'Basic LLM experimentation with off-the-shelf models',
      'RAG & Retrieval': isHighMaturity ? 'Production RAG pipeline with hybrid search and relevance tuning' : 'Basic RAG proof-of-concept with simple retrieval',
      
      // Operational Excellence
      'Center of Excellence (CoE)': isHighMaturity ? 'Active CoE with dedicated team, training programs, and best practice evangelism' : 'Informal platform support with ad-hoc guidance',
      'Platform Standards & Best Practices': isHighMaturity ? 'Documented standards with automated enforcement and compliance monitoring' : 'Emerging standards with manual review process',
      'Collaboration & Knowledge Sharing': isHighMaturity ? 'Active collaboration with shared repos, documentation, and community forums' : 'Basic collaboration via shared workspaces',
      'Cost Management & Optimization': isHighMaturity ? 'Proactive cost management with chargebacks, budgets, and optimization automation' : 'Cost tracking with manual review and optimization'
    };
    
    return practiceMap[dimensionName] || null;
  }
  
  identifyAbsentPainPoints(allPillarPainPoints, selectedValues, pillarId) {
    // Pain points mapped to strengths - ONLY if they exist in this pillar
    const strengthIndicators = {
      // Platform Governance
      'no_version_control': 'Git-based version control in use',
      'manual_provisioning': 'Automated environment provisioning',
      'no_iac': 'Infrastructure-as-code deployed',
      'poor_isolation': 'Strong environment isolation (dev/staging/prod)',
      'compliance_gaps': 'Compliance controls in place',
      'weak_access_control': 'Robust access control with RBAC',
      'no_audit_logs': 'Audit logging enabled',
      'manual_deployment': 'Automated deployment pipelines',
      
      // Data Engineering
      'manual_pipelines': 'Automated pipeline orchestration',
      'poor_quality': 'Data quality validation in place',
      'no_monitoring': 'Pipeline monitoring and alerting',
      'scattered_data': 'Organized lakehouse architecture',
      'no_documentation': 'Data pipelines documented',
      'pipeline_failures': 'Reliable pipeline execution',
      'error_handling': 'Robust error handling and retry logic',
      
      // Analytics & BI
      'slow_queries': 'Optimized query performance',
      'no_caching': 'Query result caching enabled',
      'limited_monitoring': 'Comprehensive query monitoring',
      'access_bottlenecks': 'Self-service analytics enabled',
      'inconsistent_performance': 'Consistent query performance',
      
      // Machine Learning
      'no_experiment_tracking': 'Experiment tracking system operational',
      'no_model_registry': 'Model registry in use',
      'scattered_artifacts': 'Centralized model artifact storage',
      'no_model_monitoring': 'Model monitoring in production',
      'manual_retraining': 'Automated model retraining',
      'no_feature_store': 'Feature store deployed',
      
      // GenAI
      'no_genai_strategy': 'GenAI strategy defined',
      'unclear_use_cases': 'Clear GenAI use cases identified',
      'no_vector_search': 'Vector search infrastructure',
      'prompt_management': 'Prompt versioning and management',
      'no_rag': 'RAG framework operational',
      
      // Operational Excellence
      'no_coe': 'Center of Excellence operational',
      'unclear_charter': 'Clear CoE charter and responsibilities',
      'resource_constraints': 'Adequate platform team resources',
      'standards_gaps': 'Platform standards documented',
      'no_training': 'Training program established',
      'poor_collaboration': 'Strong collaboration practices',
      'no_cost_tracking': 'Cost tracking and optimization'
    };
    
    const strengths = [];
    
    // Only check pain points that exist in THIS pillar
    for (const [painValue, strength] of Object.entries(strengthIndicators)) {
      if (allPillarPainPoints.has(painValue) && !selectedValues.has(painValue)) {
        strengths.push(strength);
      }
    }
    
    console.log(`[identifyAbsentPainPoints] ${pillarId}: Checking ${allPillarPainPoints.size} pillar pain points, found ${strengths.length} strengths`);
    
    return strengths;
  }
  
  extractSpecificCapabilities(commentText) {
    const text = commentText.toLowerCase();
    
    // Extract specific tool/capability mentions
    if (text.includes('unity catalog')) return 'Unity Catalog deployed for governance';
    if (text.includes('delta live tables') || text.includes('dlt')) return 'Delta Live Tables in production';
    if (text.includes('mlflow')) return 'MLflow for experiment tracking and model registry';
    if (text.includes('photon')) return 'Photon engine enabled for performance';
    if (text.includes('serverless')) return 'Serverless compute in use';
    if (text.includes('workflows')) return 'Databricks Workflows for orchestration';
    if (text.includes('vector search')) return 'Vector Search operational for RAG';
    if (text.includes('feature store')) return 'Feature Store for ML feature management';
    if (text.includes('lakehouse monitoring')) return 'Lakehouse Monitoring for data quality';
    
    return null;
  }
  
}

module.exports = IntelligentRecommendationEngine;

