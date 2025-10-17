const { v4: uuidv4 } = require('uuid');
const assessmentFramework = require('../data/assessmentFramework');

/**
 * Generate a sample assessment with random realistic responses
 */
class SampleAssessmentGenerator {
  constructor() {
    this.companyNames = [
      'Acme Corporation', 'Global Tech Industries', 'Innovation Labs', 
      'DataCorp Analytics', 'Enterprise Solutions Inc', 'TechVentures Group',
      'NextGen Systems', 'Digital Transformation Co', 'CloudScale Enterprises',
      'AI Innovations Inc'
    ];
    
    this.painPointProbabilities = {
      technical_pain: 0.6, // 60% chance of selecting each technical pain point
      business_pain: 0.5   // 50% chance of selecting each business pain point
    };
  }

  /**
   * Get random integer between min and max (inclusive)
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Get random item from array
   */
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Get random boolean based on probability
   */
  randomBool(probability = 0.5) {
    return Math.random() < probability;
  }

  /**
   * Generate realistic current and future state values
   * Most organizations are at level 2-3 for current, aiming for 3-5 for future
   */
  generateMaturityPair() {
    // Current state: Weighted towards 2-3 (Experiment/Formalize)
    const currentWeights = [0.05, 0.30, 0.40, 0.20, 0.05]; // Levels 1-5
    let rand = Math.random();
    let currentState = 1;
    let cumulative = 0;
    
    for (let i = 0; i < currentWeights.length; i++) {
      cumulative += currentWeights[i];
      if (rand < cumulative) {
        currentState = i + 1;
        break;
      }
    }

    // Future state: Must be >= current, typically 1-2 levels higher
    const gap = this.randomInt(0, 2); // 0, 1, or 2 level gap
    let futureState = Math.min(5, currentState + gap);
    
    // Occasionally aim for maximum (Transform)
    if (Math.random() < 0.15 && currentState >= 3) {
      futureState = 5;
    }

    return { currentState, futureState };
  }

  /**
   * Generate realistic comment
   */
  generateComment(question, currentState, futureState) {
    const comments = [
      `Currently at level ${currentState}. Planning to reach level ${futureState} in next 12-18 months.`,
      `We have some capabilities but need more structure. Target is level ${futureState}.`,
      `Working towards improving from ${currentState} to ${futureState} through planned initiatives.`,
      `Current state needs improvement. Investing in tools and processes to reach ${futureState}.`,
      `This is a priority area. Moving from ${currentState} to ${futureState} is critical for our data strategy.`,
      null, // 20% chance of no comment
      null
    ];
    
    return this.randomChoice(comments);
  }

  /**
   * Generate responses for a single question
   */
  generateQuestionResponses(question) {
    const responses = {};
    const { currentState, futureState } = this.generateMaturityPair();
    
    // Generate responses for each perspective
    question.perspectives.forEach(perspective => {
      const responseKey = `${question.id}_${perspective.id}`;
      
      if (perspective.id === 'current_state') {
        responses[responseKey] = currentState;
      } else if (perspective.id === 'future_state') {
        responses[responseKey] = futureState;
      } else if (perspective.id === 'technical_pain') {
        // Select 0-3 pain points randomly
        const selectedPains = perspective.options
          .filter(() => this.randomBool(this.painPointProbabilities.technical_pain))
          .map(opt => opt.value);
        if (selectedPains.length > 0) {
          responses[responseKey] = selectedPains;
        }
      } else if (perspective.id === 'business_pain') {
        // Select 0-3 pain points randomly
        const selectedPains = perspective.options
          .filter(() => this.randomBool(this.painPointProbabilities.business_pain))
          .map(opt => opt.value);
        if (selectedPains.length > 0) {
          responses[responseKey] = selectedPains;
        }
      }
    });
    
    // Add comment (70% of the time)
    if (this.randomBool(0.7)) {
      const comment = this.generateComment(question, currentState, futureState);
      if (comment) {
        responses[`${question.id}_comment`] = comment;
      }
    }
    
    return responses;
  }

  /**
   * Generate a complete sample assessment
   * @param {Object} options - Generation options
   * @param {string} options.completionLevel - 'full', 'partial', or 'minimal'
   * @param {string[]} options.specificPillars - Array of pillar IDs to complete (optional)
   * @returns {Object} Complete assessment object
   */
  generateSampleAssessment(options = {}) {
    const {
      completionLevel = 'full', // 'full', 'partial', 'minimal'
      specificPillars = null
    } = options;

    const assessmentId = uuidv4();
    const companyName = this.randomChoice(this.companyNames);
    const editorEmail = 'demo@databricks.com';
    
    const assessment = {
      id: assessmentId,
      name: `${companyName} - Maturity Assessment`,
      organizationName: companyName,
      editorEmail: editorEmail,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      status: 'in_progress',
      responses: {},
      completedAreas: []
    };

    // Determine which pillars to complete
    let pillarsToComplete = assessmentFramework.assessmentAreas;
    
    if (specificPillars && specificPillars.length > 0) {
      pillarsToComplete = assessmentFramework.assessmentAreas
        .filter(area => specificPillars.includes(area.id));
    } else if (completionLevel === 'partial') {
      // Complete 3-4 random pillars
      const numPillars = this.randomInt(3, 4);
      pillarsToComplete = assessmentFramework.assessmentAreas
        .sort(() => Math.random() - 0.5)
        .slice(0, numPillars);
    } else if (completionLevel === 'minimal') {
      // Complete only 1-2 pillars
      const numPillars = this.randomInt(1, 2);
      pillarsToComplete = assessmentFramework.assessmentAreas
        .sort(() => Math.random() - 0.5)
        .slice(0, numPillars);
    }

    // Generate responses for selected pillars
    pillarsToComplete.forEach(area => {
      area.dimensions.forEach(dimension => {
        dimension.questions.forEach(question => {
          const questionResponses = this.generateQuestionResponses(question);
          Object.assign(assessment.responses, questionResponses);
        });
      });
      
      assessment.completedAreas.push(area.id);
    });

    // Update status
    if (assessment.completedAreas.length === assessmentFramework.assessmentAreas.length) {
      assessment.status = 'completed';
    }

    return assessment;
  }

  /**
   * Generate multiple sample assessments
   */
  generateMultipleSamples(count = 3) {
    const samples = [];
    const completionLevels = ['full', 'partial', 'minimal'];
    
    for (let i = 0; i < count; i++) {
      const level = this.randomChoice(completionLevels);
      samples.push(this.generateSampleAssessment({ completionLevel: level }));
    }
    
    return samples;
  }
}

module.exports = new SampleAssessmentGenerator();

