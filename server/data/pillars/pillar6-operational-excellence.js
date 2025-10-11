// Pillar 6: Operational Excellence & Adoption
// 🚀 Operational Excellence & Adoption - Measure organizational readiness, adoption velocity, and realized value from Databricks.

const operationalExcellencePillar = {
  id: 'operational_excellence',
  name: '🚀 Adoption',
  description: 'Measure organizational readiness, adoption velocity, and realized value from Databricks.',
  goal: 'Measure organizational readiness, adoption velocity, and realized value from Databricks.',
  dimensions: [
    {
      id: 'center_of_excellence',
      name: 'Center of Excellence (CoE)',
      questions: [
        {
          id: 'coe_structure',
          question: 'How formally is your CoE structured to define Databricks standards and best practices?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'No formal CoE exists', score: 1 },
                { value: 2, label: 'Informal group of experts', score: 2 },
                { value: 3, label: 'Formal CoE with defined charter and responsibilities', score: 3 },
                { value: 4, label: 'Well-established CoE with executive sponsorship', score: 4 },
                { value: 5, label: 'Strategic CoE driving platform innovation', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Identify CoE champions', score: 1 },
                { value: 2, label: 'Formalize CoE structure', score: 2 },
                { value: 3, label: 'Establish standards and governance', score: 3 },
                { value: 4, label: 'Scale CoE influence across organization', score: 4 },
                { value: 5, label: 'Industry-leading innovation hub', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'no_standards', label: 'Lack of technical standards', score: 4 },
                { value: 'inconsistent_practices', label: 'Inconsistent practices across teams', score: 4 },
                { value: 'knowledge_silos', label: 'Knowledge silos and duplication', score: 3 },
                { value: 'best_practices', label: 'No documented best practices', score: 3 },
                { value: 'support_gaps', label: 'Limited technical support for teams', score: 3 }
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'slow_adoption', label: 'Slow Databricks adoption', score: 4 },
                { value: 'quality_variance', label: 'Variable solution quality', score: 4 },
                { value: 'inefficiency', label: 'Inefficient use of platform', score: 4 },
                { value: 'scaling_challenges', label: 'Difficulty scaling initiatives', score: 5 },
                { value: 'roi_impact', label: 'Poor ROI on Databricks investment', score: 5 }
              ]
            }
          ],
          commentBox: {
            label: 'Additional Context',
            placeholder: 'Describe your Center of Excellence structure and charter...'
          }
        },
        {
          id: 'coe_effectiveness',
          question: 'How effectively does it drive governance, architecture, and enablement across teams?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'No governance or enablement activities', score: 1 },
                { value: 2, label: 'Ad-hoc support when requested', score: 2 },
                { value: 3, label: 'Regular cadence of governance and training', score: 3 },
                { value: 4, label: 'Proactive enablement with measurable impact', score: 4 },
                { value: 5, label: 'Strategic partner driving business outcomes', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Define CoE services and offerings', score: 1 },
                { value: 2, label: 'Establish regular engagement model', score: 2 },
                { value: 3, label: 'Measure and optimize CoE impact', score: 3 },
                { value: 4, label: 'Proactive strategic partnership', score: 4 },
                { value: 5, label: 'Self-service enablement platform', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'reactive_support', label: 'Purely reactive support model', score: 3 },
                { value: 'limited_reach', label: 'Limited reach across organization', score: 4 },
                { value: 'unclear_impact', label: 'Unclear impact of CoE activities', score: 3 },
                { value: 'resource_constraints', label: 'Resource constraints limit effectiveness', score: 4 },
                { value: 'engagement_gaps', label: 'Low engagement from teams', score: 3 }
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'slow_onboarding', label: 'Slow onboarding of new teams', score: 4 },
                { value: 'repeated_mistakes', label: 'Teams repeating same mistakes', score: 4 },
                { value: 'value_realization', label: 'Delayed value realization', score: 5 },
                { value: 'initiative_failures', label: 'High failure rate of initiatives', score: 4 },
                { value: 'competitive_disadvantage', label: 'Competitive disadvantage', score: 5 }
              ]
            }
          ],
          commentBox: {
            label: 'Additional Context',
            placeholder: 'Describe how your CoE engages with and supports teams...'
          }
        }
      ]
    },
    {
      id: 'community_of_practice',
      name: 'Community of Practice (CoP)',
      questions: [
        {
          id: 'collaboration_culture',
          question: 'How strong is the internal collaboration and knowledge-sharing culture around Databricks usage?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Siloed teams with minimal collaboration', score: 1 },
                { value: 2, label: 'Occasional informal knowledge sharing', score: 2 },
                { value: 3, label: 'Regular forums and knowledge-sharing sessions', score: 3 },
                { value: 4, label: 'Vibrant community with active participation', score: 4 },
                { value: 5, label: 'Self-sustaining innovation community', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Create initial collaboration channels', score: 1 },
                { value: 2, label: 'Launch regular community events', score: 2 },
                { value: 3, label: 'Build engaged community', score: 3 },
                { value: 4, label: 'Foster innovation culture', score: 4 },
                { value: 5, label: 'Industry-leading community of practice', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'knowledge_loss', label: 'Knowledge loss when experts leave', score: 4 },
                { value: 'duplicate_work', label: 'Duplicate work across teams', score: 4 },
                { value: 'slow_problem_solving', label: 'Slow problem-solving', score: 3 },
                { value: 'reinventing_wheel', label: 'Teams reinventing the wheel', score: 4 },
                { value: 'learning_barriers', label: 'High barriers to learning', score: 3 }
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'wasted_effort', label: 'Wasted effort and resources', score: 4 },
                { value: 'slow_innovation', label: 'Slow innovation pace', score: 4 },
                { value: 'knowledge_gaps', label: 'Persistent knowledge gaps', score: 4 },
                { value: 'talent_retention', label: 'Talent retention challenges', score: 4 },
                { value: 'inconsistent_quality', label: 'Inconsistent solution quality', score: 3 }
              ]
            }
          ],
          commentBox: {
            label: 'Additional Context',
            placeholder: 'Describe your community collaboration practices and culture...'
          }
        },
        {
          id: 'asset_sharing',
          question: 'How frequently do practitioners exchange reusable assets or innovations?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'No sharing of reusable assets', score: 1 },
                { value: 2, label: 'Occasional ad-hoc sharing', score: 2 },
                { value: 3, label: 'Regular sharing through established channels', score: 3 },
                { value: 4, label: 'Active marketplace of reusable components', score: 4 },
                { value: 5, label: 'Automated discovery and reuse platform', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Establish asset repository', score: 1 },
                { value: 2, label: 'Create sharing processes', score: 2 },
                { value: 3, label: 'Build reusable component library', score: 3 },
                { value: 4, label: 'Enable intelligent asset discovery', score: 4 },
                { value: 5, label: 'Self-service innovation marketplace', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'no_repository', label: 'No central repository for assets', score: 4 },
                { value: 'discovery_difficulty', label: 'Hard to discover existing assets', score: 4 },
                { value: 'quality_concerns', label: 'Unknown asset quality', score: 3 },
                { value: 'versioning_issues', label: 'No versioning or documentation', score: 3 },
                { value: 'integration_challenges', label: 'Difficult to integrate shared assets', score: 3 }
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'redundant_development', label: 'Redundant development efforts', score: 4 },
                { value: 'slow_delivery', label: 'Slow solution delivery', score: 4 },
                { value: 'cost_inefficiency', label: 'Cost inefficiencies', score: 4 },
                { value: 'missed_synergies', label: 'Missed synergies across teams', score: 3 },
                { value: 'limited_scaling', label: 'Limited ability to scale', score: 4 }
              ]
            }
          ],
          commentBox: {
            label: 'Additional Context',
            placeholder: 'Describe your asset sharing and reuse practices...'
          }
        }
      ]
    },
    {
      id: 'training_enablement',
      name: 'Training & Enablement',
      questions: [
        {
          id: 'enablement_programs',
          question: 'How comprehensive are your Databricks enablement programs for engineers, analysts, and data scientists?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'No formal training programs', score: 1 },
                { value: 2, label: 'Basic onboarding materials', score: 2 },
                { value: 3, label: 'Role-based training programs', score: 3 },
                { value: 4, label: 'Comprehensive learning paths with certifications', score: 4 },
                { value: 5, label: 'Personalized, adaptive learning platform', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Create basic training materials', score: 1 },
                { value: 2, label: 'Develop role-based curricula', score: 2 },
                { value: 3, label: 'Build comprehensive learning programs', score: 3 },
                { value: 4, label: 'Enable self-service learning', score: 4 },
                { value: 5, label: 'AI-powered personalized enablement', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'outdated_content', label: 'Outdated training content', score: 3 },
                { value: 'generic_training', label: 'Generic, not role-specific training', score: 3 },
                { value: 'limited_access', label: 'Limited access to training resources', score: 3 },
                { value: 'theory_practice_gap', label: 'Gap between training and practice', score: 4 },
                { value: 'assessment_gaps', label: 'No skill assessment mechanisms', score: 3 }
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'skill_gaps', label: 'Persistent skill gaps', score: 5 },
                { value: 'slow_productivity', label: 'Slow ramp-up to productivity', score: 4 },
                { value: 'quality_issues', label: 'Quality issues due to lack of knowledge', score: 4 },
                { value: 'dependency_bottlenecks', label: 'Dependency on few experts', score: 4 },
                { value: 'hiring_challenges', label: 'Difficulty hiring and retaining talent', score: 4 }
              ]
            }
          ],
          commentBox: {
            label: 'Additional Context',
            placeholder: 'Describe your training programs and enablement approach...'
          }
        },
        {
          id: 'capability_introduction',
          question: 'How regularly are new capabilities introduced through structured learning or workshops?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'No structured introduction of new capabilities', score: 1 },
                { value: 2, label: 'Occasional ad-hoc sessions', score: 2 },
                { value: 3, label: 'Quarterly learning events', score: 3 },
                { value: 4, label: 'Regular cadence of workshops and updates', score: 4 },
                { value: 5, label: 'Continuous learning culture with proactive updates', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Plan regular learning sessions', score: 1 },
                { value: 2, label: 'Establish learning calendar', score: 2 },
                { value: 3, label: 'Build continuous learning culture', score: 3 },
                { value: 4, label: 'Proactive capability introduction', score: 4 },
                { value: 5, label: 'Automated learning recommendation system', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'delayed_awareness', label: 'Delayed awareness of new features', score: 3 },
                { value: 'underutilization', label: 'Underutilization of platform capabilities', score: 4 },
                { value: 'inconsistent_adoption', label: 'Inconsistent adoption of best practices', score: 3 },
                { value: 'knowledge_lag', label: 'Knowledge lag behind platform updates', score: 3 },
                { value: 'fragmented_learning', label: 'Fragmented learning experiences', score: 3 }
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'missed_opportunities', label: 'Missed optimization opportunities', score: 4 },
                { value: 'suboptimal_solutions', label: 'Suboptimal solution designs', score: 4 },
                { value: 'competitive_lag', label: 'Lag behind competitors', score: 4 },
                { value: 'poor_roi', label: 'Poor ROI on platform investments', score: 5 },
                { value: 'innovation_slowdown', label: 'Slowed innovation pace', score: 4 }
              ]
            }
          ],
          commentBox: {
            label: 'Additional Context',
            placeholder: 'Describe how you introduce new capabilities to your teams...'
          }
        }
      ]
    },
    {
      id: 'financial_management',
      name: 'Financial Management & Value Tracking',
      questions: [
        {
          id: 'cost_value_linkage',
          question: 'How clearly are Databricks costs linked to business value or productivity gains?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'No visibility into cost or value', score: 1 },
                { value: 2, label: 'Track costs but not value', score: 2 },
                { value: 3, label: 'Basic cost allocation with some value metrics', score: 3 },
                { value: 4, label: 'Clear cost-to-value attribution', score: 4 },
                { value: 5, label: 'Real-time value-based optimization', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Implement cost tracking', score: 1 },
                { value: 2, label: 'Define value metrics', score: 2 },
                { value: 3, label: 'Link costs to business outcomes', score: 3 },
                { value: 4, label: 'Optimize based on value', score: 4 },
                { value: 5, label: 'Automated value-driven resource management', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'cost_visibility', label: 'Poor cost visibility and attribution', score: 4 },
                { value: 'tracking_complexity', label: 'Complex cost tracking', score: 3 },
                { value: 'value_measurement', label: 'Difficulty measuring value', score: 4 },
                { value: 'data_fragmentation', label: 'Fragmented cost and usage data', score: 3 },
                { value: 'forecasting_challenges', label: 'Difficult to forecast costs', score: 3 }
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'cost_overruns', label: 'Unexpected cost overruns', score: 5 },
                { value: 'roi_unclear', label: 'Unclear ROI on Databricks', score: 5 },
                { value: 'budget_justification', label: 'Difficulty justifying budget', score: 4 },
                { value: 'inefficient_spending', label: 'Inefficient resource spending', score: 4 },
                { value: 'stakeholder_concerns', label: 'Stakeholder concerns about costs', score: 4 }
              ]
            }
          ],
          commentBox: {
            label: 'Additional Context',
            placeholder: 'Describe your cost management and value tracking practices...'
          }
        },
        {
          id: 'usage_review',
          question: 'How frequently do you review usage metrics to align spending with outcomes?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'No regular reviews', score: 1 },
                { value: 2, label: 'Annual or sporadic reviews', score: 2 },
                { value: 3, label: 'Quarterly reviews with action plans', score: 3 },
                { value: 4, label: 'Monthly reviews with optimization', score: 4 },
                { value: 5, label: 'Real-time monitoring with auto-optimization', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Establish review process', score: 1 },
                { value: 2, label: 'Implement regular reviews', score: 2 },
                { value: 3, label: 'Build optimization processes', score: 3 },
                { value: 4, label: 'Enable proactive optimization', score: 4 },
                { value: 5, label: 'Autonomous cost optimization', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'manual_reviews', label: 'Time-consuming manual reviews', score: 3 },
                { value: 'data_access', label: 'Difficult to access usage data', score: 3 },
                { value: 'insight_generation', label: 'Hard to generate actionable insights', score: 4 },
                { value: 'optimization_complexity', label: 'Complex optimization decisions', score: 3 },
                { value: 'delayed_action', label: 'Delayed action on issues', score: 3 }
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'wasted_spend', label: 'Ongoing wasted spending', score: 5 },
                { value: 'missed_savings', label: 'Missed optimization opportunities', score: 4 },
                { value: 'reactive_management', label: 'Reactive instead of proactive', score: 4 },
                { value: 'budget_pressures', label: 'Ongoing budget pressures', score: 4 },
                { value: 'value_erosion', label: 'Erosion of platform value', score: 4 }
              ]
            }
          ],
          commentBox: {
            label: 'Additional Context',
            placeholder: 'Describe your usage review and optimization processes...'
          }
        }
      ]
    },
    {
      id: 'innovation_improvement',
      name: 'Innovation & Continuous Improvement',
      questions: [
        {
          id: 'capability_evaluation',
          question: 'How proactive is your organization in evaluating and piloting new Databricks capabilities?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'No evaluation of new capabilities', score: 1 },
                { value: 2, label: 'Reactive evaluation when pressured', score: 2 },
                { value: 3, label: 'Planned evaluation of key capabilities', score: 3 },
                { value: 4, label: 'Proactive innovation program', score: 4 },
                { value: 5, label: 'Strategic innovation partnerships', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Monitor new capabilities', score: 1 },
                { value: 2, label: 'Establish evaluation process', score: 2 },
                { value: 3, label: 'Build innovation program', score: 3 },
                { value: 4, label: 'Lead in platform innovation', score: 4 },
                { value: 5, label: 'Strategic innovation partnership with Databricks', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'awareness_gap', label: 'Limited awareness of new features', score: 3 },
                { value: 'evaluation_resources', label: 'Lack of resources for evaluation', score: 3 },
                { value: 'pilot_process', label: 'No structured pilot process', score: 3 },
                { value: 'risk_aversion', label: 'Risk-averse culture', score: 3 },
                { value: 'adoption_friction', label: 'High friction to adopt new capabilities', score: 4 }
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'competitive_lag', label: 'Lag behind competitors', score: 5 },
                { value: 'missed_opportunities', label: 'Missed innovation opportunities', score: 5 },
                { value: 'technical_debt', label: 'Growing technical debt', score: 4 },
                { value: 'platform_underutilization', label: 'Underutilization of platform value', score: 4 },
                { value: 'stagnation', label: 'Platform stagnation', score: 4 }
              ]
            }
          ],
          commentBox: {
            label: 'Additional Context',
            placeholder: 'Describe your innovation and capability evaluation practices...'
          }
        },
        {
          id: 'feedback_incorporation',
          question: 'How effectively are feedback and lessons learned incorporated into your future roadmap?',
          perspectives: [
            {
              id: 'current_state',
              label: 'Current State',
              type: 'single_choice',
              options: [
                { value: 1, label: 'No feedback collection or incorporation', score: 1 },
                { value: 2, label: 'Ad-hoc feedback collection', score: 2 },
                { value: 3, label: 'Regular feedback loops with some action', score: 3 },
                { value: 4, label: 'Systematic feedback integration into roadmap', score: 4 },
                { value: 5, label: 'Continuous improvement culture with rapid iteration', score: 5 }
              ]
            },
            {
              id: 'future_state',
              label: 'Future State Vision',
              type: 'single_choice',
              options: [
                { value: 1, label: 'Start collecting feedback', score: 1 },
                { value: 2, label: 'Establish feedback processes', score: 2 },
                { value: 3, label: 'Build continuous improvement culture', score: 3 },
                { value: 4, label: 'Enable rapid iteration based on feedback', score: 4 },
                { value: 5, label: 'AI-powered feedback analysis and prioritization', score: 5 }
              ]
            },
            {
              id: 'technical_pain',
              label: 'Technical Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'feedback_channels', label: 'No clear feedback channels', score: 3 },
                { value: 'analysis_challenges', label: 'Difficult to analyze feedback', score: 3 },
                { value: 'prioritization_difficulty', label: 'Unclear prioritization', score: 4 },
                { value: 'action_tracking', label: 'No tracking of actions taken', score: 3 },
                { value: 'communication_gaps', label: 'Poor communication of changes', score: 3 }
              ]
            },
            {
              id: 'business_pain',
              label: 'Business Pain Points',
              type: 'multiple_choice',
              options: [
                { value: 'repeated_issues', label: 'Repeated issues not addressed', score: 4 },
                { value: 'user_frustration', label: 'Growing user frustration', score: 4 },
                { value: 'missed_improvements', label: 'Missed improvement opportunities', score: 4 },
                { value: 'roadmap_misalignment', label: 'Roadmap misaligned with needs', score: 5 },
                { value: 'adoption_resistance', label: 'Resistance to platform adoption', score: 5 }
              ]
            }
          ],
          commentBox: {
            label: 'Additional Context',
            placeholder: 'Describe your feedback collection and incorporation processes...'
          }
        }
      ]
    }
  ]
};

module.exports = operationalExcellencePillar;
