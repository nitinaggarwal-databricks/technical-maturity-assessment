// Pillar 4: Machine Learning & MLOps
// 🧠 Machine Learning & MLOps - Understand how Databricks is leveraged for classical and predictive ML use cases.

const machineLearningPillar = {
  id: 'machine_learning',
  name: '🧠 ML',
  description: 'Understand how Databricks is leveraged for classical and predictive ML use cases.',
  goal: 'Understand how Databricks is leveraged for classical and predictive ML use cases.',
  dimensions: [
    {
      id: 'experimentation_tracking',
      name: 'Experimentation & Tracking',
      questions: [
        {
          id: 'experiment_tracking_systematic',
          question: 'How systematically are experiments, features, and results tracked for your ML workflows?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'No systematic tracking; manual or ad-hoc methods', score: 1 },
                { value: 2, label: 'Basic tracking with spreadsheets or local files', score: 2 },
                { value: 3, label: 'MLflow or similar tool for logging experiments', score: 3 },
                { value: 4, label: 'Comprehensive tracking with automated lineage', score: 4 },
                { value: 5, label: 'AI-powered optimization of experiments and hyperparameters', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Implement basic experiment tracking', score: 1 },
                { value: 2, label: 'Systematic experiment management with MLflow', score: 2 },
                { value: 3, label: 'Advanced MLOps platform with full lineage', score: 3 },
                { value: 4, label: 'Automated experiment optimization', score: 4 },
                { value: 5, label: 'AI-driven ML lifecycle management', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'tracking_complexity', label: 'Complex experiment tracking setup', score: 3 },
                { value: 'version_control', label: 'Lack of version control for models and datasets', score: 4 },
                { value: 'result_comparison', label: 'Difficult to compare experiment results', score: 3 },
                { value: 'metadata_loss', label: 'Loss of experiment metadata over time', score: 4 },
                { value: 'collaboration_issues', label: 'Poor collaboration across data science teams', score: 3 }
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'slow_iteration', label: 'Slow model iteration cycles', score: 4 },
                { value: 'reproducibility', label: 'Cannot reproduce past results', score: 5 },
                { value: 'compliance_risk', label: 'Compliance and audit risks', score: 5 },
                { value: 'knowledge_loss', label: 'Knowledge loss when team members leave', score: 4 },
                { value: 'scaling_challenges', label: 'Difficulty scaling ML initiatives', score: 4 }
              ]
            }
          ],
          commentBox: {
            label: 'Additional Context',
            placeholder: 'Share specific challenges or context about experiment tracking in your organization...'
          }
        },
        {
          id: 'model_reproducibility',
          question: 'How reproducible are your models and datasets across environments?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Models often fail to reproduce in different environments', score: 1 },
                { value: 2, label: 'Basic version control but inconsistent results', score: 2 },
                { value: 3, label: 'Consistent reproduction with documented dependencies', score: 3 },
                { value: 4, label: 'Fully automated environment replication', score: 4 },
                { value: 5, label: 'End-to-end reproducibility with data lineage', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Establish basic version control', score: 1 },
                { value: 2, label: 'Document dependencies and environments', score: 2 },
                { value: 3, label: 'Automated environment replication', score: 3 },
                { value: 4, label: 'Full data and model lineage tracking', score: 4 },
                { value: 5, label: 'Perfect reproducibility across all environments', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'environment_drift', label: 'Environment drift between dev and prod', score: 4 },
                { value: 'dependency_management', label: 'Complex dependency management', score: 3 },
                { value: 'data_versioning', label: 'Lack of data versioning', score: 4 },
                { value: 'container_complexity', label: 'Container and package management issues', score: 3 },
                { value: 'config_management', label: 'Configuration management challenges', score: 3 }
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'delayed_deployment', label: 'Delayed model deployments', score: 4 },
                { value: 'trust_issues', label: 'Stakeholder trust issues with inconsistent results', score: 5 },
                { value: 'rework_costs', label: 'High costs of rework and debugging', score: 4 },
                { value: 'audit_failures', label: 'Failed audits due to lack of reproducibility', score: 5 },
                { value: 'productivity_loss', label: 'Team productivity lost to troubleshooting', score: 4 }
              ]
            }
          ],
          commentBox: {
            label: 'Additional Context',
            placeholder: 'Share specific reproducibility challenges or requirements...'
          }
        }
      ]
    },
    {
      id: 'model_deployment',
      name: 'Model Deployment & Serving',
      questions: [
        {
          id: 'deployment_automation',
          question: 'How automated is your model deployment and promotion process within Databricks?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Fully manual deployment process', score: 1 },
                { value: 2, label: 'Semi-automated with scripts', score: 2 },
                { value: 3, label: 'CI/CD pipeline for model deployment', score: 3 },
                { value: 4, label: 'Automated promotion across environments', score: 4 },
                { value: 5, label: 'Fully automated MLOps with auto-rollback', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Implement basic deployment scripts', score: 1 },
                { value: 2, label: 'Build CI/CD pipeline for models', score: 2 },
                { value: 3, label: 'Automated multi-environment deployment', score: 3 },
                { value: 4, label: 'Intelligent deployment with canary releases', score: 4 },
                { value: 5, label: 'Self-healing MLOps infrastructure', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'manual_steps', label: 'Too many manual deployment steps', score: 4 },
                { value: 'environment_inconsistency', label: 'Inconsistency across environments', score: 4 },
                { value: 'rollback_difficulty', label: 'Difficult to rollback deployments', score: 3 },
                { value: 'testing_gaps', label: 'Insufficient testing before deployment', score: 4 },
                { value: 'approval_delays', label: 'Lengthy approval processes', score: 3 }
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'slow_time_to_market', label: 'Slow time to market for models', score: 5 },
                { value: 'deployment_failures', label: 'Frequent deployment failures', score: 4 },
                { value: 'business_disruption', label: 'Business disruption during deployments', score: 5 },
                { value: 'resource_intensive', label: 'Resource-intensive deployment process', score: 4 },
                { value: 'limited_innovation', label: 'Limited ability to innovate quickly', score: 4 }
              ]
            }
          ],
          commentBox: {
            label: 'Additional Context',
            placeholder: 'Describe your current deployment process and challenges...'
          }
        },
        {
          id: 'model_monitoring_retraining',
          question: 'How standardized are your mechanisms for monitoring performance and retraining models?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'No monitoring; issues discovered reactively', score: 1 },
                { value: 2, label: 'Basic logging and manual checks', score: 2 },
                { value: 3, label: 'Monitoring with alerts for key metrics', score: 3 },
                { value: 4, label: 'Automated drift detection and retraining triggers', score: 4 },
                { value: 5, label: 'Continuous learning with auto-retraining', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Implement basic monitoring', score: 1 },
                { value: 2, label: 'Set up alerts for performance degradation', score: 2 },
                { value: 3, label: 'Automated drift detection', score: 3 },
                { value: 4, label: 'Intelligent retraining workflows', score: 4 },
                { value: 5, label: 'Fully autonomous model lifecycle', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'delayed_detection', label: 'Delayed detection of model degradation', score: 4 },
                { value: 'manual_monitoring', label: 'Manual and time-consuming monitoring', score: 3 },
                { value: 'unclear_metrics', label: 'Unclear performance metrics', score: 3 },
                { value: 'retraining_complexity', label: 'Complex retraining pipelines', score: 4 },
                { value: 'data_drift', label: 'Difficulty detecting data drift', score: 4 }
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'poor_predictions', label: 'Poor predictions impacting business', score: 5 },
                { value: 'customer_complaints', label: 'Increased customer complaints', score: 5 },
                { value: 'revenue_loss', label: 'Revenue loss from degraded models', score: 5 },
                { value: 'reputation_damage', label: 'Reputation damage from model failures', score: 4 },
                { value: 'reactive_response', label: 'Always reactive instead of proactive', score: 4 }
              ]
            }
          ],
          commentBox: {
            label: 'Additional Context',
            placeholder: 'Describe your monitoring and retraining approach...'
          }
        }
      ]
    },
    {
      id: 'feature_management',
      name: 'Feature Management & Reuse',
      questions: [
        {
          id: 'feature_catalog',
          question: 'How effectively are reusable features cataloged and shared across teams?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'No feature catalog; duplicated feature engineering', score: 1 },
                { value: 2, label: 'Informal sharing via documentation', score: 2 },
                { value: 3, label: 'Feature store with basic cataloging', score: 3 },
                { value: 4, label: 'Well-governed feature store with reuse metrics', score: 4 },
                { value: 5, label: 'AI-powered feature discovery and recommendations', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Create basic feature documentation', score: 1 },
                { value: 2, label: 'Implement feature store', score: 2 },
                { value: 3, label: 'Establish feature governance', score: 3 },
                { value: 4, label: 'Enable intelligent feature discovery', score: 4 },
                { value: 5, label: 'Fully automated feature lifecycle management', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'duplicate_work', label: 'Duplicate feature engineering work', score: 4 },
                { value: 'discovery_difficulty', label: 'Hard to discover existing features', score: 3 },
                { value: 'versioning_issues', label: 'Feature versioning challenges', score: 4 },
                { value: 'consistency_problems', label: 'Inconsistent feature definitions', score: 4 },
                { value: 'quality_concerns', label: 'Unknown feature quality and reliability', score: 3 }
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'wasted_effort', label: 'Wasted engineering effort on duplicates', score: 4 },
                { value: 'slow_development', label: 'Slow model development cycles', score: 4 },
                { value: 'inconsistent_results', label: 'Inconsistent model results across teams', score: 4 },
                { value: 'lost_knowledge', label: 'Lost institutional knowledge', score: 3 },
                { value: 'scaling_limitations', label: 'Limited ability to scale ML initiatives', score: 4 }
              ]
            }
          ],
          commentBox: {
            label: 'Additional Context',
            placeholder: 'Describe your feature sharing and reuse practices...'
          }
        },
        {
          id: 'data_preparation_consistency',
          question: 'How consistent are data-preparation practices to support multiple model lifecycles?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Ad-hoc data preparation per project', score: 1 },
                { value: 2, label: 'Some standard practices documented', score: 2 },
                { value: 3, label: 'Reusable data preparation pipelines', score: 3 },
                { value: 4, label: 'Standardized feature engineering framework', score: 4 },
                { value: 5, label: 'Automated data quality and feature validation', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Document standard practices', score: 1 },
                { value: 2, label: 'Build reusable transformation libraries', score: 2 },
                { value: 3, label: 'Implement standardized feature engineering', score: 3 },
                { value: 4, label: 'Automated data preparation workflows', score: 4 },
                { value: 5, label: 'Self-service feature engineering platform', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'inconsistent_quality', label: 'Inconsistent data quality checks', score: 4 },
                { value: 'manual_processes', label: 'Too many manual data preparation steps', score: 3 },
                { value: 'different_methods', label: 'Different teams use different methods', score: 4 },
                { value: 'validation_gaps', label: 'Insufficient data validation', score: 4 },
                { value: 'pipeline_brittleness', label: 'Brittle data preparation pipelines', score: 3 }
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'model_failures', label: 'Model failures due to data quality issues', score: 5 },
                { value: 'delayed_projects', label: 'Delayed ML project delivery', score: 4 },
                { value: 'trust_issues', label: 'Lack of trust in model outputs', score: 5 },
                { value: 'maintenance_burden', label: 'High maintenance burden', score: 4 },
                { value: 'collaboration_friction', label: 'Friction between teams', score: 3 }
              ]
            }
          ],
          commentBox: {
            label: 'Additional Context',
            placeholder: 'Describe your data preparation standards and challenges...'
          }
        }
      ]
    },
    {
      id: 'ml_governance',
      name: 'ML Lifecycle Governance',
      questions: [
        {
          id: 'ownership_processes',
          question: 'How clearly are ownership, review, and approval processes defined for ML artifacts?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'No defined ownership or approval processes', score: 1 },
                { value: 2, label: 'Informal ownership with ad-hoc reviews', score: 2 },
                { value: 3, label: 'Documented ownership and review workflows', score: 3 },
                { value: 4, label: 'Automated approval workflows with clear RACI', score: 4 },
                { value: 5, label: 'Comprehensive governance with automated compliance', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Define ownership model', score: 1 },
                { value: 2, label: 'Establish review processes', score: 2 },
                { value: 3, label: 'Implement automated approval workflows', score: 3 },
                { value: 4, label: 'Full RACI matrix with governance policies', score: 4 },
                { value: 5, label: 'Self-governing ML platform', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'unclear_ownership', label: 'Unclear model ownership', score: 4 },
                { value: 'bottlenecks', label: 'Approval bottlenecks', score: 3 },
                { value: 'lack_documentation', label: 'Poor documentation of processes', score: 3 },
                { value: 'inconsistent_reviews', label: 'Inconsistent review standards', score: 4 },
                { value: 'manual_tracking', label: 'Manual tracking of approvals', score: 3 }
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'accountability_gaps', label: 'Lack of accountability for model outcomes', score: 5 },
                { value: 'compliance_risk', label: 'Increased compliance and audit risk', score: 5 },
                { value: 'delayed_deployment', label: 'Delayed model deployments', score: 4 },
                { value: 'quality_issues', label: 'Quality issues in production', score: 5 },
                { value: 'stakeholder_confusion', label: 'Stakeholder confusion on ownership', score: 3 }
              ]
            }
          ],
          commentBox: {
            label: 'Additional Context',
            placeholder: 'Describe your ML governance and approval processes...'
          }
        },
        {
          id: 'compliance_lineage',
          question: 'How well are compliance, reproducibility, and model-lineage requirements enforced?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'No enforcement of compliance or lineage', score: 1 },
                { value: 2, label: 'Manual documentation of lineage', score: 2 },
                { value: 3, label: 'Automated lineage tracking in place', score: 3 },
                { value: 4, label: 'Comprehensive compliance checks built into workflows', score: 4 },
                { value: 5, label: 'Full auditability with real-time compliance monitoring', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Start documenting lineage manually', score: 1 },
                { value: 2, label: 'Implement automated lineage tracking', score: 2 },
                { value: 3, label: 'Build compliance into CI/CD pipelines', score: 3 },
                { value: 4, label: 'Real-time compliance monitoring', score: 4 },
                { value: 5, label: 'Autonomous compliance enforcement', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'missing_lineage', label: 'Incomplete or missing lineage information', score: 4 },
                { value: 'manual_audits', label: 'Time-consuming manual audits', score: 3 },
                { value: 'compliance_gaps', label: 'Gaps in compliance coverage', score: 5 },
                { value: 'tool_fragmentation', label: 'Fragmented tooling for compliance', score: 3 },
                { value: 'data_tracking', label: 'Difficulty tracking data transformations', score: 4 }
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'audit_failures', label: 'Failed regulatory audits', score: 5 },
                { value: 'legal_risk', label: 'Legal and financial risk exposure', score: 5 },
                { value: 'lost_trust', label: 'Lost customer and stakeholder trust', score: 5 },
                { value: 'business_restrictions', label: 'Business restrictions due to non-compliance', score: 5 },
                { value: 'reputation_damage', label: 'Reputation damage', score: 4 }
              ]
            }
          ],
          commentBox: {
            label: 'Additional Context',
            placeholder: 'Describe your compliance and lineage tracking requirements...'
          }
        }
      ]
    },
    {
      id: 'business_impact',
      name: 'Business Impact & Scaling',
      questions: [
        {
          id: 'production_delivery',
          question: 'How effectively do your ML models move from pilot to production to deliver measurable outcomes?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Most models remain in pilot phase', score: 1 },
                { value: 2, label: 'Some models reach production but with long cycles', score: 2 },
                { value: 3, label: 'Consistent path to production with measured outcomes', score: 3 },
                { value: 4, label: 'Rapid productionization with clear business value', score: 4 },
                { value: 5, label: 'Automated deployment with continuous value tracking', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Define production readiness criteria', score: 1 },
                { value: 2, label: 'Streamline pilot-to-production process', score: 2 },
                { value: 3, label: 'Implement value tracking for all models', score: 3 },
                { value: 4, label: 'Rapid, automated productionization', score: 4 },
                { value: 5, label: 'Self-optimizing ML pipeline with value maximization', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'pilot_production_gap', label: 'Large gap between pilot and production environments', score: 4 },
                { value: 'scalability_issues', label: 'Scalability challenges in production', score: 4 },
                { value: 'integration_complexity', label: 'Complex integration with business systems', score: 3 },
                { value: 'monitoring_gaps', label: 'Insufficient production monitoring', score: 4 },
                { value: 'deployment_friction', label: 'High friction in deployment process', score: 3 }
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'unrealized_value', label: 'Unrealized ROI from ML investments', score: 5 },
                { value: 'long_time_to_value', label: 'Long time to value', score: 5 },
                { value: 'stranded_pilots', label: 'Many pilots never reach production', score: 4 },
                { value: 'unclear_impact', label: 'Unclear business impact of ML initiatives', score: 4 },
                { value: 'stakeholder_frustration', label: 'Stakeholder frustration with ML delivery', score: 4 }
              ]
            }
          ],
          commentBox: {
            label: 'Additional Context',
            placeholder: 'Describe your production deployment success rate and challenges...'
          }
        },
        {
          id: 'scaling_use_cases',
          question: 'How scalable is your process for onboarding new ML use cases across business domains?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Each use case is a custom, one-off project', score: 1 },
                { value: 2, label: 'Some reusable components but mostly custom', score: 2 },
                { value: 3, label: 'Standardized ML platform with templates', score: 3 },
                { value: 4, label: 'Self-service ML platform with quick onboarding', score: 4 },
                { value: 5, label: 'Fully automated use case discovery and deployment', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Document best practices', score: 1 },
                { value: 2, label: 'Create reusable templates and patterns', score: 2 },
                { value: 3, label: 'Build self-service ML platform', score: 3 },
                { value: 4, label: 'Enable rapid cross-domain scaling', score: 4 },
                { value: 5, label: 'AI-powered use case recommendation and automation', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'custom_development', label: 'Every use case requires custom development', score: 4 },
                { value: 'knowledge_silos', label: 'Knowledge silos across domains', score: 3 },
                { value: 'tooling_inconsistency', label: 'Inconsistent tooling and approaches', score: 4 },
                { value: 'onboarding_complexity', label: 'Complex onboarding process', score: 3 },
                { value: 'limited_reuse', label: 'Limited component reuse', score: 4 }
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'slow_expansion', label: 'Slow expansion of ML capabilities', score: 5 },
                { value: 'high_costs', label: 'High costs per new use case', score: 4 },
                { value: 'inconsistent_quality', label: 'Inconsistent quality across domains', score: 4 },
                { value: 'resource_constraints', label: 'Resource constraints limit scaling', score: 5 },
                { value: 'competitive_disadvantage', label: 'Competitive disadvantage due to slow ML adoption', score: 5 }
              ]
            }
          ],
          commentBox: {
            label: 'Additional Context',
            placeholder: 'Describe your approach to scaling ML across domains...'
          }
        }
      ]
    }
  ]
};

module.exports = machineLearningPillar;
