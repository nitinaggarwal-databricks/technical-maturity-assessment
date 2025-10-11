// Pillar 3: Analytics & BI Modernization
// 📊 Analytics & BI Modernization - Assess how Databricks supports governed analytics, performance, and self-service access.

const analyticsBIPillar = {
  id: 'analytics_bi',
  name: '📊 Analytics',
  description: 'Assess how Databricks supports governed analytics, performance, and self-service access.',
  goal: 'Assess how Databricks supports governed analytics, performance, and self-service access.',
  dimensions: [
    {
      id: 'query_performance',
      name: 'Query Performance & Optimization',
      questions: [
        {
          id: 'response_times',
          question: 'How consistently do your analytic workloads meet expected response times within Databricks?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Slow queries with frequent timeouts', score: 1 },
                { value: 2, label: 'Inconsistent performance across workloads', score: 2 },
                { value: 3, label: 'Generally good performance with some issues', score: 3 },
                { value: 4, label: 'Consistently fast query performance', score: 4 },
                { value: 5, label: 'Optimized performance with predictable SLAs', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Improve basic query performance', score: 1 },
                { value: 2, label: 'Achieve consistent performance', score: 2 },
                { value: 3, label: 'Implement performance SLAs', score: 3 },
                { value: 4, label: 'Advanced performance optimization', score: 4 },
                { value: 5, label: 'AI-powered query optimization', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'slow_queries', label: 'Consistently slow query execution', score: 4 },
                { value: 'resource_contention', label: 'Resource contention issues', score: 4 },
                { value: 'optimization_complexity', label: 'Complex query optimization', score: 3 },
                { value: 'caching_issues', label: 'Ineffective caching strategies', score: 3 },
                { value: 'monitoring_gaps', label: 'Poor performance monitoring', score: 3 },
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'user_frustration', label: 'User frustration with slow analytics', score: 4 },
                { value: 'delayed_decisions', label: 'Delayed business decisions', score: 4 },
                { value: 'productivity_loss', label: 'Analyst productivity loss', score: 4 },
                { value: 'competitive_disadvantage', label: 'Competitive disadvantage', score: 4 },
                { value: 'cost_inefficiency', label: 'Cost inefficiency from poor performance', score: 3 },
              ]
            }
          ],
          commentBox: {
            label: 'Notes',
            placeholder: 'Describe your query performance challenges and expectations...'
          }
        },
        {
          id: 'optimization_approach',
          question: 'How structured is your approach to tuning and optimizing queries and datasets?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'No formal optimization approach', score: 1 },
                { value: 2, label: 'Ad-hoc optimization when issues arise', score: 2 },
                { value: 3, label: 'Regular optimization reviews and practices', score: 3 },
                { value: 4, label: 'Systematic optimization with monitoring', score: 4 },
                { value: 5, label: 'Automated optimization with AI insights', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Establish basic optimization practices', score: 1 },
                { value: 2, label: 'Regular optimization reviews', score: 2 },
                { value: 3, label: 'Systematic optimization framework', score: 3 },
                { value: 4, label: 'Automated optimization monitoring', score: 4 },
                { value: 5, label: 'AI-driven continuous optimization', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'optimization_expertise', label: 'Lack of optimization expertise', score: 4 },
                { value: 'tooling_limitations', label: 'Limited optimization tooling', score: 3 },
                { value: 'complex_queries', label: 'Complex query optimization challenges', score: 4 },
                { value: 'performance_regression', label: 'Performance regression detection', score: 3 },
                { value: 'resource_planning', label: 'Difficult resource planning', score: 3 },
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'unpredictable_performance', label: 'Unpredictable performance', score: 4 },
                { value: 'high_costs', label: 'High compute costs from inefficiency', score: 3 },
                { value: 'team_bottlenecks', label: 'Team bottlenecks in optimization', score: 3 },
                { value: 'user_complaints', label: 'Frequent user performance complaints', score: 4 },
                { value: 'business_impact', label: 'Business impact from slow analytics', score: 4 },
              ]
            }
          ],
          commentBox: {
            label: 'Notes',
            placeholder: 'Share your optimization practices and challenges...'
          }
        }
      ]
    },
    {
      id: 'data_modeling',
      name: 'Data Modeling & Semantic Consistency',
      questions: [
        {
          id: 'semantic_consistency',
          question: 'How unified are your data definitions, measures, and business rules across analytical teams?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Inconsistent definitions across teams', score: 1 },
                { value: 2, label: 'Some standardization efforts', score: 2 },
                { value: 3, label: 'Centralized data dictionary and standards', score: 3 },
                { value: 4, label: 'Enforced semantic layer with governance', score: 4 },
                { value: 5, label: 'AI-powered semantic consistency management', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Establish basic data standards', score: 1 },
                { value: 2, label: 'Create centralized data dictionary', score: 2 },
                { value: 3, label: 'Implement semantic layer', score: 3 },
                { value: 4, label: 'Automated consistency enforcement', score: 4 },
                { value: 5, label: 'AI-driven semantic management', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'definition_conflicts', label: 'Conflicting metric definitions', score: 4 },
                { value: 'data_lineage', label: 'Poor data lineage tracking', score: 4 },
                { value: 'metadata_management', label: 'Complex metadata management', score: 3 },
                { value: 'version_control', label: 'Lack of definition version control', score: 3 },
                { value: 'documentation_gaps', label: 'Inadequate documentation', score: 3 },
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'inconsistent_reporting', label: 'Inconsistent reporting across teams', score: 4 },
                { value: 'data_confusion', label: 'Confusion about data meanings', score: 4 },
                { value: 'trust_issues', label: 'Reduced trust in analytics', score: 4 },
                { value: 'decision_conflicts', label: 'Conflicting business decisions', score: 5 },
                { value: 'compliance_risk', label: 'Compliance and audit risks', score: 4 },
              ]
            }
          ],
          commentBox: {
            label: 'Notes',
            placeholder: 'Describe your data standardization and semantic consistency challenges...'
          }
        },
        {
          id: 'dataset_discovery',
          question: 'How easily can analysts discover, reuse, and trust curated datasets within Databricks?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Difficult discovery, low reuse', score: 1 },
                { value: 2, label: 'Basic cataloging with some discovery', score: 2 },
                { value: 3, label: 'Good discovery with metadata and lineage', score: 3 },
                { value: 4, label: 'Excellent discovery with trust indicators', score: 4 },
                { value: 5, label: 'AI-powered dataset recommendations', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Improve basic cataloging', score: 1 },
                { value: 2, label: 'Enhanced discovery capabilities', score: 2 },
                { value: 3, label: 'Comprehensive data marketplace', score: 3 },
                { value: 4, label: 'AI-powered data discovery', score: 4 },
                { value: 5, label: 'Intelligent data recommendations', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'poor_cataloging', label: 'Poor data cataloging', score: 4 },
                { value: 'search_limitations', label: 'Limited search capabilities', score: 3 },
                { value: 'metadata_gaps', label: 'Incomplete metadata', score: 4 },
                { value: 'access_complexity', label: 'Complex data access procedures', score: 3 },
                { value: 'quality_indicators', label: 'Lack of quality indicators', score: 4 },
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'duplicate_work', label: 'Duplicate data preparation work', score: 3 },
                { value: 'slow_insights', label: 'Slow time to insights', score: 4 },
                { value: 'analyst_frustration', label: 'Analyst frustration with data access', score: 4 },
                { value: 'missed_opportunities', label: 'Missed analytical opportunities', score: 4 },
                { value: 'low_adoption', label: 'Low platform adoption', score: 3 },
              ]
            }
          ],
          commentBox: {
            label: 'Notes',
            placeholder: 'Share your experience with data discovery and reuse...'
          }
        }
      ]
    },
    {
      id: 'visualization_reporting',
      name: 'Visualization & Reporting',
      questions: [
        {
          id: 'tool_integration',
          question: 'How well integrated are your dashboards and reporting tools with your Databricks Lakehouse?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Poor integration with manual data exports', score: 1 },
                { value: 2, label: 'Basic connectivity with some automation', score: 2 },
                { value: 3, label: 'Good integration with most tools', score: 3 },
                { value: 4, label: 'Seamless integration across all tools', score: 4 },
                { value: 5, label: 'Native integration with real-time capabilities', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Improve basic connectivity', score: 1 },
                { value: 2, label: 'Standardize tool integrations', score: 2 },
                { value: 3, label: 'Seamless multi-tool integration', score: 3 },
                { value: 4, label: 'Native real-time integration', score: 4 },
                { value: 5, label: 'AI-powered visualization automation', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'connectivity_issues', label: 'Tool connectivity issues', score: 4 },
                { value: 'data_refresh', label: 'Complex data refresh processes', score: 3 },
                { value: 'performance_impact', label: 'Performance impact on queries', score: 4 },
                { value: 'security_gaps', label: 'Security gaps in integrations', score: 4 },
                { value: 'maintenance_overhead', label: 'High integration maintenance', score: 3 },
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'stale_data', label: 'Stale data in reports', score: 4 },
                { value: 'manual_processes', label: 'Manual reporting processes', score: 3 },
                { value: 'user_frustration', label: 'User frustration with tools', score: 4 },
                { value: 'limited_insights', label: 'Limited real-time insights', score: 4 },
                { value: 'tool_proliferation', label: 'Tool proliferation and costs', score: 3 },
              ]
            }
          ],
          commentBox: {
            label: 'Notes',
            placeholder: 'Describe your BI tool integration challenges and requirements...'
          }
        },
        {
          id: 'reporting_governance',
          question: 'How standardized are refresh schedules, KPI definitions, and report governance?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'No standardization, ad-hoc reporting', score: 1 },
                { value: 2, label: 'Basic standards with inconsistent application', score: 2 },
                { value: 3, label: 'Good standardization with some governance', score: 3 },
                { value: 4, label: 'Comprehensive reporting governance', score: 4 },
                { value: 5, label: 'Automated governance with AI insights', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Establish basic reporting standards', score: 1 },
                { value: 2, label: 'Implement governance framework', score: 2 },
                { value: 3, label: 'Comprehensive reporting governance', score: 3 },
                { value: 4, label: 'Automated governance enforcement', score: 4 },
                { value: 5, label: 'AI-driven reporting optimization', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'schedule_conflicts', label: 'Report refresh schedule conflicts', score: 3 },
                { value: 'version_control', label: 'Poor report version control', score: 3 },
                { value: 'approval_workflows', label: 'Complex approval workflows', score: 3 },
                { value: 'change_management', label: 'Difficult change management', score: 3 },
                { value: 'access_control', label: 'Complex access control management', score: 4 },
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'inconsistent_reporting', label: 'Inconsistent reporting across teams', score: 4 },
                { value: 'compliance_issues', label: 'Compliance and audit issues', score: 4 },
                { value: 'report_proliferation', label: 'Uncontrolled report proliferation', score: 3 },
                { value: 'user_confusion', label: 'User confusion about report versions', score: 3 },
                { value: 'governance_overhead', label: 'High governance overhead', score: 3 },
              ]
            }
          ],
          commentBox: {
            label: 'Notes',
            placeholder: 'Share your reporting governance and standardization approach...'
          }
        }
      ]
    },
    {
      id: 'self_service',
      name: 'Self-Service Enablement',
      questions: [
        {
          id: 'user_empowerment',
          question: 'How empowered are business users to perform ad-hoc analysis directly in Databricks?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'No self-service capabilities', score: 1 },
                { value: 2, label: 'Limited self-service for technical users', score: 2 },
                { value: 3, label: 'Good self-service with some training', score: 3 },
                { value: 4, label: 'Excellent self-service for business users', score: 4 },
                { value: 5, label: 'AI-assisted self-service analytics', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Enable basic self-service', score: 1 },
                { value: 2, label: 'Expand to business users', score: 2 },
                { value: 3, label: 'Comprehensive self-service platform', score: 3 },
                { value: 4, label: 'AI-assisted analytics', score: 4 },
                { value: 5, label: 'Natural language analytics', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'complexity_barriers', label: 'Technical complexity barriers', score: 4 },
                { value: 'tool_usability', label: 'Poor tool usability for business users', score: 4 },
                { value: 'data_access', label: 'Complex data access procedures', score: 4 },
                { value: 'performance_issues', label: 'Performance issues for ad-hoc queries', score: 3 },
                { value: 'support_overhead', label: 'High user support overhead', score: 3 },
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'analyst_bottlenecks', label: 'Analyst bottlenecks for requests', score: 4 },
                { value: 'slow_insights', label: 'Slow time to insights', score: 4 },
                { value: 'user_frustration', label: 'Business user frustration', score: 4 },
                { value: 'missed_opportunities', label: 'Missed analytical opportunities', score: 4 },
                { value: 'low_adoption', label: 'Low platform adoption', score: 3 },
              ]
            }
          ],
          commentBox: {
            label: 'Notes',
            placeholder: 'Describe your self-service analytics capabilities and challenges...'
          }
        },
        {
          id: 'governance_balance',
          question: 'How effectively do you balance autonomy with governance in your self-service environment?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'No governance, complete autonomy', score: 1 },
                { value: 2, label: 'Basic governance with some controls', score: 2 },
                { value: 3, label: 'Balanced governance and autonomy', score: 3 },
                { value: 4, label: 'Sophisticated governance with user freedom', score: 4 },
                { value: 5, label: 'AI-powered adaptive governance', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Implement basic governance controls', score: 1 },
                { value: 2, label: 'Balance governance and usability', score: 2 },
                { value: 3, label: 'Sophisticated governance framework', score: 3 },
                { value: 4, label: 'Adaptive governance policies', score: 4 },
                { value: 5, label: 'AI-driven governance optimization', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'access_complexity', label: 'Complex access control implementation', score: 3 },
                { value: 'policy_enforcement', label: 'Inconsistent policy enforcement', score: 4 },
                { value: 'audit_trails', label: 'Inadequate audit trails', score: 4 },
                { value: 'user_provisioning', label: 'Complex user provisioning', score: 3 },
                { value: 'monitoring_gaps', label: 'Usage monitoring gaps', score: 3 },
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'security_risks', label: 'Data security and privacy risks', score: 5 },
                { value: 'compliance_violations', label: 'Compliance violations', score: 5 },
                { value: 'data_quality_issues', label: 'User-created data quality issues', score: 4 },
                { value: 'governance_overhead', label: 'High governance overhead', score: 3 },
                { value: 'user_restrictions', label: 'Overly restrictive user experience', score: 3 },
              ]
            }
          ],
          commentBox: {
            label: 'Notes',
            placeholder: 'Share your approach to balancing self-service with governance...'
          }
        }
      ]
    },
    {
      id: 'collaboration_sharing',
      name: 'Collaboration & Data Sharing',
      questions: [
        {
          id: 'data_sharing',
          question: 'How easily can users or partners access and share governed datasets through Databricks?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Difficult sharing with manual processes', score: 1 },
                { value: 2, label: 'Basic sharing capabilities', score: 2 },
                { value: 3, label: 'Good sharing with governance controls', score: 3 },
                { value: 4, label: 'Excellent sharing with Delta Sharing', score: 4 },
                { value: 5, label: 'Advanced marketplace with AI recommendations', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Implement basic sharing capabilities', score: 1 },
                { value: 2, label: 'Governed data sharing platform', score: 2 },
                { value: 3, label: 'Advanced Delta Sharing implementation', score: 3 },
                { value: 4, label: 'Comprehensive data marketplace', score: 4 },
                { value: 5, label: 'AI-powered data collaboration', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'sharing_complexity', label: 'Complex sharing setup and management', score: 4 },
                { value: 'security_controls', label: 'Inadequate security controls', score: 5 },
                { value: 'version_management', label: 'Data version management issues', score: 3 },
                { value: 'access_tracking', label: 'Poor access tracking and auditing', score: 4 },
                { value: 'integration_challenges', label: 'Partner integration challenges', score: 4 },
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'partnership_delays', label: 'Delays in partner data sharing', score: 4 },
                { value: 'compliance_risks', label: 'Data sharing compliance risks', score: 5 },
                { value: 'missed_opportunities', label: 'Missed collaboration opportunities', score: 4 },
                { value: 'manual_overhead', label: 'High manual sharing overhead', score: 3 },
                { value: 'security_breaches', label: 'Risk of data security breaches', score: 5 },
              ]
            }
          ],
          commentBox: {
            label: 'Notes',
            placeholder: 'Describe your data sharing and collaboration requirements...'
          }
        },
        {
          id: 'cross_domain_analytics',
          question: 'How well does your platform support cross-domain or cross-system analytics?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Siloed analytics with no cross-domain capability', score: 1 },
                { value: 2, label: 'Limited cross-domain analytics', score: 2 },
                { value: 3, label: 'Good cross-domain integration', score: 3 },
                { value: 4, label: 'Excellent unified analytics platform', score: 4 },
                { value: 5, label: 'AI-powered cross-domain insights', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Enable basic cross-domain analytics', score: 1 },
                { value: 2, label: 'Integrate key business domains', score: 2 },
                { value: 3, label: 'Unified analytics across all domains', score: 3 },
                { value: 4, label: 'AI-powered cross-domain insights', score: 4 },
                { value: 5, label: 'Autonomous cross-system analytics', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'data_silos', label: 'Persistent data silos', score: 4 },
                { value: 'integration_complexity', label: 'Complex system integrations', score: 4 },
                { value: 'schema_conflicts', label: 'Schema and format conflicts', score: 3 },
                { value: 'performance_issues', label: 'Cross-system query performance', score: 4 },
                { value: 'metadata_inconsistency', label: 'Inconsistent metadata across systems', score: 4 },
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'incomplete_insights', label: 'Incomplete business insights', score: 4 },
                { value: 'manual_correlation', label: 'Manual data correlation efforts', score: 3 },
                { value: 'missed_patterns', label: 'Missed cross-domain patterns', score: 4 },
                { value: 'duplicate_efforts', label: 'Duplicate analytical efforts', score: 3 },
                { value: 'strategic_blindness', label: 'Strategic blind spots', score: 5 },
              ]
            }
          ],
          commentBox: {
            label: 'Notes',
            placeholder: 'Share your cross-domain analytics needs and challenges...'
          }
        }
      ]
    }
  ]
};

module.exports = analyticsBIPillar;
