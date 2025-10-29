// Databricks Maturity Assessment Framework
// Updated to match user's 6-pillar, 5-dimension, 2-question structure

// Import all pillar definitions
const platformGovernancePillar = require('./pillars/pillar1-platform-governance');
const dataEngineeringPillar = require('./pillars/pillar2-data-engineering');
const analyticsBIPillar = require('./pillars/pillar3-analytics-bi');
const machineLearningPillar = require('./pillars/pillar4-machine-learning');
const generativeAIPillar = require('./pillars/pillar5-generative-ai');
const operationalExcellencePillar = require('./pillars/pillar6-operational-excellence');

const assessmentFramework = {
  assessmentAreas: [
    platformGovernancePillar,
    dataEngineeringPillar,
    analyticsBIPillar,
    machineLearningPillar,
    generativeAIPillar,
    operationalExcellencePillar
  ],

  maturityLevels: {
    1: {
      level: 'Initial',
      description: 'Ad-hoc processes, limited capabilities',
      color: '#ff4444'
    },
    2: {
      level: 'Developing',
      description: 'Basic implementation with some structure',
      color: '#ff8800'
    },
    3: {
      level: 'Defined',
      description: 'Structured approach with established processes',
      color: '#ffaa00'
    },
    4: {
      level: 'Managed',
      description: 'Advanced capabilities with strong governance',
      color: '#88cc00'
    },
    5: {
      level: 'Optimized',
      description: 'Industry-leading, AI-driven optimization',
      color: '#00cc44'
    }
  }
};

module.exports = assessmentFramework;