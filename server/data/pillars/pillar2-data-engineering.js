// Pillar 2: Data Engineering & Integration
// 💾 Data Engineering & Integration - Evaluate how efficiently data is ingested, transformed, and managed within Databricks.

const dataEngineeringPillar = {
  id: 'data_engineering',
  name: '💾 Data',
  description: 'Evaluate how efficiently data is ingested, transformed, and managed within Databricks.',
  goal: 'Evaluate how efficiently data is ingested, transformed, and managed within Databricks.',
  dimensions: [
    {
      id: 'ingestion_strategy',
      name: 'Ingestion Strategy',
      questions: [
        {
          id: 'ingestion_automation',
          question: 'How unified and automated are your data-ingestion pipelines across enterprise systems and external sources?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Manual, ad-hoc data ingestion', score: 1 },
                { value: 2, label: 'Some automated pipelines for key sources', score: 2 },
                { value: 3, label: 'Standardized ingestion framework', score: 3 },
                { value: 4, label: 'Fully automated multi-source ingestion', score: 4 },
                { value: 5, label: 'Self-service ingestion with auto-discovery', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Automate key data sources', score: 1 },
                { value: 2, label: 'Standardize ingestion processes', score: 2 },
                { value: 3, label: 'Implement unified ingestion platform', score: 3 },
                { value: 4, label: 'Enable self-service data ingestion', score: 4 },
                { value: 5, label: 'AI-powered ingestion optimization', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'complex_integrations', label: 'Complex source system integrations', score: 4 },
                { value: 'data_format_issues', label: 'Data format and schema inconsistencies', score: 3 },
                { value: 'pipeline_maintenance', label: 'High pipeline maintenance overhead', score: 3 },
                { value: 'error_handling', label: 'Poor error handling and recovery', score: 4 },
                { value: 'performance_bottlenecks', label: 'Ingestion performance bottlenecks', score: 4 },
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'data_delays', label: 'Delays in data availability', score: 4 },
                { value: 'integration_costs', label: 'High integration development costs', score: 3 },
                { value: 'data_silos', label: 'Persistent data silos', score: 4 },
                { value: 'business_agility', label: 'Reduced business agility', score: 4 },
                { value: 'missed_opportunities', label: 'Missed business opportunities', score: 4 },
              ]
            }
          ],
          commentBox: {
            label: 'Notes',
            placeholder: 'Share details about your data ingestion challenges and sources...'
          }
        },
        {
          id: 'ingestion_resilience',
          question: 'How resilient are your ingestion processes to schema changes or data delays?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Fragile pipelines that break frequently', score: 1 },
                { value: 2, label: 'Some error handling and retry logic', score: 2 },
                { value: 3, label: 'Robust pipelines with good error handling', score: 3 },
                { value: 4, label: 'Self-healing pipelines with auto-recovery', score: 4 },
                { value: 5, label: 'Adaptive pipelines with ML-based optimization', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Improve error handling', score: 1 },
                { value: 2, label: 'Implement robust retry mechanisms', score: 2 },
                { value: 3, label: 'Build self-healing pipelines', score: 3 },
                { value: 4, label: 'Adaptive schema evolution', score: 4 },
                { value: 5, label: 'AI-powered pipeline optimization', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'schema_breaks', label: 'Pipeline breaks from schema changes', score: 5 },
                { value: 'data_quality_issues', label: 'Data quality issues cause failures', score: 4 },
                { value: 'manual_intervention', label: 'Frequent manual intervention required', score: 4 },
                { value: 'monitoring_gaps', label: 'Poor pipeline monitoring', score: 3 },
                { value: 'recovery_complexity', label: 'Complex failure recovery processes', score: 4 },
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'data_outages', label: 'Frequent data outages', score: 5 },
                { value: 'sla_misses', label: 'Missing data SLA commitments', score: 4 },
                { value: 'operational_overhead', label: 'High operational overhead', score: 3 },
                { value: 'business_disruption', label: 'Business process disruption', score: 4 },
                { value: 'customer_impact', label: 'Customer-facing impact', score: 5 },
              ]
            }
          ],
          commentBox: {
            label: 'Notes',
            placeholder: 'Describe your experience with pipeline resilience and failure handling...'
          }
        }
      ]
    },
    {
      id: 'lakehouse_architecture',
      name: 'Lakehouse Architecture',
      questions: [
        {
          id: 'data_layer_structure',
          question: 'How well-structured are your raw, curated, and consumption data layers within your Databricks Lakehouse?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Single data lake with no structure', score: 1 },
                { value: 2, label: 'Basic bronze-silver-gold structure', score: 2 },
                { value: 3, label: 'Well-defined data layers with governance', score: 3 },
                { value: 4, label: 'Advanced lakehouse with Delta tables', score: 4 },
                { value: 5, label: 'Optimized lakehouse with Unity Catalog', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Implement basic data structure', score: 1 },
                { value: 2, label: 'Establish bronze-silver-gold layers', score: 2 },
                { value: 3, label: 'Advanced lakehouse architecture', score: 3 },
                { value: 4, label: 'Unity Catalog integration', score: 4 },
                { value: 5, label: 'AI-ready lakehouse with real-time', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'data_organization', label: 'Poor data organization and structure', score: 4 },
                { value: 'schema_evolution', label: 'Schema evolution challenges', score: 3 },
                { value: 'data_quality', label: 'Data quality inconsistencies', score: 4 },
                { value: 'performance_issues', label: 'Query performance issues', score: 4 },
                { value: 'metadata_management', label: 'Metadata management complexity', score: 3 },
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'data_discovery', label: 'Difficult data discovery', score: 4 },
                { value: 'analyst_productivity', label: 'Low analyst productivity', score: 4 },
                { value: 'data_trust', label: 'Low data trust and confidence', score: 4 },
                { value: 'compliance_risk', label: 'Compliance and governance risks', score: 5 },
                { value: 'time_to_insight', label: 'Slow time to insight', score: 4 },
              ]
            }
          ],
          commentBox: {
            label: 'Notes',
            placeholder: 'Describe your data architecture and layer organization...'
          }
        },
        {
          id: 'architecture_adaptability',
          question: 'How adaptable is your architecture for new data types, sources, and interoperability requirements?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Rigid architecture, difficult to change', score: 1 },
                { value: 2, label: 'Some flexibility for new sources', score: 2 },
                { value: 3, label: 'Moderately adaptable architecture', score: 3 },
                { value: 4, label: 'Highly flexible and extensible', score: 4 },
                { value: 5, label: 'Auto-adapting architecture with AI', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Improve current flexibility', score: 1 },
                { value: 2, label: 'Support common data types', score: 2 },
                { value: 3, label: 'Highly adaptable architecture', score: 3 },
                { value: 4, label: 'Auto-scaling and self-adapting', score: 4 },
                { value: 5, label: 'AI-driven architecture evolution', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'integration_complexity', label: 'Complex new source integration', score: 4 },
                { value: 'schema_rigidity', label: 'Rigid schema requirements', score: 3 },
                { value: 'format_limitations', label: 'Limited data format support', score: 3 },
                { value: 'api_constraints', label: 'API and connectivity constraints', score: 3 },
                { value: 'scalability_limits', label: 'Architecture scalability limits', score: 4 },
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'slow_innovation', label: 'Slow adoption of new data sources', score: 4 },
                { value: 'missed_opportunities', label: 'Missed business opportunities', score: 4 },
                { value: 'integration_costs', label: 'High integration costs', score: 3 },
                { value: 'competitive_lag', label: 'Competitive disadvantage', score: 4 },
                { value: 'vendor_lock_in', label: 'Vendor lock-in concerns', score: 3 },
              ]
            }
          ],
          commentBox: {
            label: 'Notes',
            placeholder: 'Share your experience with architecture flexibility and new requirements...'
          }
        }
      ]
    },
    {
      id: 'pipeline_orchestration',
      name: 'Pipeline Orchestration & Automation',
      questions: [
        {
          id: 'pipeline_reliability',
          question: 'How reliable and maintainable are your Databricks data pipelines from scheduling to dependency management?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Manual pipeline execution', score: 1 },
                { value: 2, label: 'Basic scheduling with some automation', score: 2 },
                { value: 3, label: 'Robust orchestration with dependency management', score: 3 },
                { value: 4, label: 'Advanced workflow automation', score: 4 },
                { value: 5, label: 'Self-managing pipelines with AI optimization', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Implement basic automation', score: 1 },
                { value: 2, label: 'Robust orchestration platform', score: 2 },
                { value: 3, label: 'Advanced workflow management', score: 3 },
                { value: 4, label: 'Self-healing pipelines', score: 4 },
                { value: 5, label: 'AI-driven pipeline optimization', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'dependency_management', label: 'Complex dependency management', score: 4 },
                { value: 'scheduling_conflicts', label: 'Pipeline scheduling conflicts', score: 3 },
                { value: 'error_propagation', label: 'Error propagation across pipelines', score: 4 },
                { value: 'monitoring_gaps', label: 'Pipeline monitoring gaps', score: 3 },
                { value: 'resource_contention', label: 'Resource contention issues', score: 3 },
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'data_delays', label: 'Frequent data delivery delays', score: 4 },
                { value: 'sla_misses', label: 'Missing SLA commitments', score: 4 },
                { value: 'operational_overhead', label: 'High operational overhead', score: 3 },
                { value: 'business_impact', label: 'Business process disruption', score: 4 },
                { value: 'team_productivity', label: 'Reduced team productivity', score: 3 },
              ]
            }
          ],
          commentBox: {
            label: 'Notes',
            placeholder: 'Describe your pipeline orchestration and reliability challenges...'
          }
        },
        {
          id: 'pipeline_lifecycle',
          question: 'How effectively do you version, test, and promote pipeline changes between environments?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'No formal pipeline lifecycle management', score: 1 },
                { value: 2, label: 'Basic version control and testing', score: 2 },
                { value: 3, label: 'Structured CI/CD for pipelines', score: 3 },
                { value: 4, label: 'Advanced pipeline DevOps practices', score: 4 },
                { value: 5, label: 'Fully automated pipeline lifecycle', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Implement basic version control', score: 1 },
                { value: 2, label: 'Establish CI/CD for pipelines', score: 2 },
                { value: 3, label: 'Advanced pipeline DevOps', score: 3 },
                { value: 4, label: 'Automated testing and deployment', score: 4 },
                { value: 5, label: 'Self-managing pipeline lifecycle', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'version_control', label: 'Poor pipeline version control', score: 4 },
                { value: 'testing_gaps', label: 'Inadequate pipeline testing', score: 4 },
                { value: 'deployment_complexity', label: 'Complex deployment processes', score: 3 },
                { value: 'environment_drift', label: 'Environment configuration drift', score: 3 },
                { value: 'rollback_difficulty', label: 'Difficult rollback procedures', score: 4 },
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'deployment_risks', label: 'High deployment risk', score: 4 },
                { value: 'quality_issues', label: 'Production quality issues', score: 5 },
                { value: 'slow_releases', label: 'Slow release cycles', score: 3 },
                { value: 'team_bottlenecks', label: 'Team bottlenecks in releases', score: 3 },
                { value: 'business_disruption', label: 'Business disruption from bad deployments', score: 5 },
              ]
            }
          ],
          commentBox: {
            label: 'Notes',
            placeholder: 'Share your experience with pipeline development and deployment practices...'
          }
        }
      ]
    },
    {
      id: 'data_quality',
      name: 'Data Quality & Reliability',
      questions: [
        {
          id: 'quality_processes',
          question: 'How standardized are your data-validation, reconciliation, and recovery processes in Databricks?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'No formal data quality processes', score: 1 },
                { value: 2, label: 'Basic data validation checks', score: 2 },
                { value: 3, label: 'Standardized quality framework', score: 3 },
                { value: 4, label: 'Automated quality monitoring', score: 4 },
                { value: 5, label: 'AI-powered quality assurance', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Implement basic quality checks', score: 1 },
                { value: 2, label: 'Standardize quality processes', score: 2 },
                { value: 3, label: 'Automated quality monitoring', score: 3 },
                { value: 4, label: 'Predictive quality management', score: 4 },
                { value: 5, label: 'Self-healing data quality', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'quality_detection', label: 'Late quality issue detection', score: 4 },
                { value: 'validation_complexity', label: 'Complex validation rule management', score: 3 },
                { value: 'recovery_processes', label: 'Manual data recovery processes', score: 4 },
                { value: 'monitoring_gaps', label: 'Quality monitoring blind spots', score: 4 },
                { value: 'tooling_limitations', label: 'Limited quality tooling', score: 3 },
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'bad_decisions', label: 'Poor decisions from bad data', score: 5 },
                { value: 'customer_impact', label: 'Customer-facing data issues', score: 5 },
                { value: 'compliance_risk', label: 'Compliance and regulatory risks', score: 5 },
                { value: 'trust_erosion', label: 'Erosion of data trust', score: 4 },
                { value: 'operational_disruption', label: 'Operational disruption from data issues', score: 4 },
              ]
            }
          ],
          commentBox: {
            label: 'Notes',
            placeholder: 'Describe your data quality and validation approach...'
          }
        },
        {
          id: 'quality_monitoring',
          question: 'How consistently are quality rules monitored and surfaced to stakeholders?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'No quality monitoring or reporting', score: 1 },
                { value: 2, label: 'Basic quality dashboards', score: 2 },
                { value: 3, label: 'Regular quality reporting to stakeholders', score: 3 },
                { value: 4, label: 'Real-time quality alerts and notifications', score: 4 },
                { value: 5, label: 'Proactive quality insights and recommendations', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Implement basic quality reporting', score: 1 },
                { value: 2, label: 'Regular stakeholder quality updates', score: 2 },
                { value: 3, label: 'Real-time quality monitoring', score: 3 },
                { value: 4, label: 'Predictive quality insights', score: 4 },
                { value: 5, label: 'Self-service quality intelligence', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'reporting_complexity', label: 'Complex quality reporting setup', score: 3 },
                { value: 'alert_noise', label: 'Too many false positive alerts', score: 3 },
                { value: 'metric_correlation', label: 'Difficulty correlating quality metrics', score: 3 },
                { value: 'stakeholder_access', label: 'Limited stakeholder access to quality data', score: 4 },
                { value: 'real_time_gaps', label: 'Lack of real-time quality visibility', score: 4 },
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'late_discovery', label: 'Late discovery of quality issues', score: 4 },
                { value: 'stakeholder_frustration', label: 'Stakeholder frustration with data', score: 4 },
                { value: 'decision_delays', label: 'Delayed decisions due to quality concerns', score: 4 },
                { value: 'reputation_risk', label: 'Reputation risk from data quality', score: 4 },
                { value: 'regulatory_issues', label: 'Regulatory reporting issues', score: 5 },
              ]
            }
          ],
          commentBox: {
            label: 'Notes',
            placeholder: 'Share your approach to quality monitoring and stakeholder communication...'
          }
        }
      ]
    },
    {
      id: 'performance_scalability',
      name: 'Performance & Scalability',
      questions: [
        {
          id: 'pipeline_optimization',
          question: 'How optimized are your data pipelines for parallel processing and throughput at scale?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Sequential processing with no optimization', score: 1 },
                { value: 2, label: 'Some parallel processing', score: 2 },
                { value: 3, label: 'Well-optimized parallel pipelines', score: 3 },
                { value: 4, label: 'Advanced optimization with auto-scaling', score: 4 },
                { value: 5, label: 'AI-optimized processing with adaptive scaling', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Implement basic parallelization', score: 1 },
                { value: 2, label: 'Optimize key pipelines', score: 2 },
                { value: 3, label: 'Advanced parallel processing', score: 3 },
                { value: 4, label: 'Auto-scaling optimization', score: 4 },
                { value: 5, label: 'AI-driven performance optimization', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'slow_processing', label: 'Slow data processing times', score: 4 },
                { value: 'resource_bottlenecks', label: 'Resource bottlenecks', score: 4 },
                { value: 'optimization_complexity', label: 'Complex optimization requirements', score: 3 },
                { value: 'scaling_issues', label: 'Scaling performance issues', score: 4 },
                { value: 'monitoring_gaps', label: 'Performance monitoring gaps', score: 3 },
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'sla_misses', label: 'Missing performance SLAs', score: 4 },
                { value: 'user_frustration', label: 'User frustration with slow processing', score: 3 },
                { value: 'competitive_disadvantage', label: 'Competitive disadvantage', score: 4 },
                { value: 'cost_inefficiency', label: 'Cost inefficiency from poor performance', score: 3 },
                { value: 'business_delays', label: 'Business process delays', score: 4 },
              ]
            }
          ],
          commentBox: {
            label: 'Notes',
            placeholder: 'Describe your pipeline performance and optimization challenges...'
          }
        },
        {
          id: 'dynamic_scaling',
          question: 'How dynamically can your workloads scale up or down during variable demand periods?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Fixed capacity with no scaling', score: 1 },
                { value: 2, label: 'Manual scaling based on demand', score: 2 },
                { value: 3, label: 'Scheduled auto-scaling', score: 3 },
                { value: 4, label: 'Dynamic auto-scaling based on metrics', score: 4 },
                { value: 5, label: 'AI-powered predictive scaling', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Implement basic auto-scaling', score: 1 },
                { value: 2, label: 'Scheduled scaling policies', score: 2 },
                { value: 3, label: 'Dynamic metric-based scaling', score: 3 },
                { value: 4, label: 'Predictive scaling', score: 4 },
                { value: 5, label: 'Fully autonomous scaling', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'scaling_delays', label: 'Slow scaling response times', score: 4 },
                { value: 'over_provisioning', label: 'Over-provisioning waste', score: 3 },
                { value: 'under_provisioning', label: 'Under-provisioning performance issues', score: 4 },
                { value: 'scaling_complexity', label: 'Complex scaling configuration', score: 3 },
                { value: 'monitoring_blind_spots', label: 'Scaling monitoring blind spots', score: 3 },
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'cost_waste', label: 'Cost waste from poor scaling', score: 3 },
                { value: 'performance_degradation', label: 'Performance degradation during peaks', score: 4 },
                { value: 'user_experience', label: 'Poor user experience during high demand', score: 4 },
                { value: 'missed_opportunities', label: 'Missed opportunities due to capacity limits', score: 4 },
                { value: 'operational_overhead', label: 'High operational overhead', score: 3 },
              ]
            }
          ],
          commentBox: {
            label: 'Notes',
            placeholder: 'Share your experience with workload scaling and demand management...'
          }
        }
      ]
    }
  ]
};

module.exports = dataEngineeringPillar;
