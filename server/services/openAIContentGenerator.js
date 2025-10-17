// OpenAI Content Generator - Generates all assessment content dynamically
// This service sends assessment data to OpenAI and gets back personalized recommendations

const assessmentFramework = require('../data/assessmentFramework');

class OpenAIContentGenerator {
  constructor() {
    this.openai = null;
    this.isInitialized = false;
    
    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      try {
        const OpenAI = require('openai');
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.isInitialized = true;
        console.log('✅ OpenAI Content Generator initialized');
      } catch (error) {
        console.error('❌ Failed to initialize OpenAI:', error.message);
        this.isInitialized = false;
      }
    } else {
      console.warn('⚠️  OpenAI API key not configured. Content generation will use fallback logic.');
    }
  }

  /**
   * Generate complete assessment results using OpenAI
   * @param {object} assessment - Full assessment object with responses
   * @param {string} pillarId - Optional: specific pillar to generate results for
   * @returns {object} Complete results structure
   */
  async generateAssessmentContent(assessment, pillarId = null) {
    if (!this.isInitialized) {
      console.warn('⚠️  OpenAI not initialized, using fallback content');
      return this.generateFallbackContent(assessment, pillarId);
    }

    try {
      console.log(`🤖 Generating ${pillarId ? 'pillar' : 'overall'} content for assessment ${assessment.id}`);
      
      const prompt = pillarId 
        ? this.buildPillarPrompt(assessment, pillarId)
        : this.buildOverallPrompt(assessment);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      });

      const content = JSON.parse(response.choices[0].message.content);
      console.log('✅ OpenAI content generated successfully');
      
      return pillarId 
        ? this.formatPillarResults(content, assessment, pillarId)
        : this.formatOverallResults(content, assessment);
      
    } catch (error) {
      console.error('❌ Error generating content from OpenAI:', error.message);
      return this.generateFallbackContent(assessment, pillarId);
    }
  }

  /**
   * Get system prompt for OpenAI
   */
  getSystemPrompt() {
    return `You are a Databricks platform expert and CTO advisor specializing in data platform maturity assessments.

Your role is to analyze assessment responses and provide:
1. Accurate, data-driven insights based on actual user input
2. Specific, actionable recommendations using latest Databricks features (2024-2025)
3. Strategic guidance focused on business impact and ROI
4. Factual analysis without speculative dollar amounts

Key principles:
- Base ALL recommendations on actual user responses (current state, future state, pain points, comments)
- Reference only real Databricks features with verified capabilities
- Focus on measurable business outcomes, not made-up cost figures
- Provide CTO-level strategic narrative, not just technical lists
- Be specific about WHY recommendations matter to THIS organization

Latest Databricks capabilities to consider:
- Unity Catalog for governance and data sharing
- Delta Live Tables for automated data pipelines
- Lakehouse Monitoring for data quality
- Serverless compute for cost optimization
- AI/BI with Genie for natural language queries
- Mosaic AI for GenAI applications
- Vector Search for RAG applications
- Model Serving for LLM deployment

Return ONLY valid JSON with the exact structure requested.`;
  }

  /**
   * Build prompt for overall assessment results
   */
  buildOverallPrompt(assessment) {
    const { responses } = assessment;
    
    // DEBUG: Log what we're receiving
    console.log('🔍 buildOverallPrompt called');
    console.log('🔍 Assessment ID:', assessment.id);
    console.log('🔍 Responses type:', typeof responses);
    console.log('🔍 Responses null/undefined?:', responses === null || responses === undefined);
    console.log('🔍 Responses keys:', responses ? Object.keys(responses).length : 0);
    
    // FIX: Ensure responses is an object
    const validResponses = responses || {};
    
    // Extract all filled responses by pillar
    const pillarData = assessmentFramework.assessmentAreas.map(area => {
      const questions = this.getAreaQuestions(area);
      const filledQuestions = [];
      
      questions.forEach(question => {
        const currentState = validResponses[`${question.id}_current_state`];
        const futureState = validResponses[`${question.id}_future_state`];
        const technicalPain = validResponses[`${question.id}_technical_pain`] || [];
        const businessPain = validResponses[`${question.id}_business_pain`] || [];
        const comment = validResponses[`${question.id}_comment`] || '';
        const skipped = validResponses[`${question.id}_skipped`] || false;
        
        if (!skipped && (currentState || futureState)) {
          filledQuestions.push({
            topic: question.topic,
            currentState,
            futureState,
            technicalPain,
            businessPain,
            comment
          });
        }
      });
      
      return {
        pillar: area.name,
        pillarId: area.id,
        questionsAnswered: filledQuestions.length,
        questions: filledQuestions
      };
    });

    return `# Databricks Platform Maturity Assessment Analysis

## Organization Context
- **Organization:** ${assessment.organizationName || 'Not provided'}
- **Industry:** ${assessment.industry || 'Not provided'}
- **Assessment Name:** ${assessment.assessmentName || 'Unnamed Assessment'}

## Assessment Data by Pillar

${pillarData.map(p => `### ${p.pillar} (${p.questionsAnswered} questions answered)

${p.questions.map((q, idx) => `
**Question ${idx + 1}: ${q.topic}**
- Current State: Level ${q.currentState || 'Not answered'}
- Future/Target State: Level ${q.futureState || 'Not answered'}
- Technical Pain Points: ${q.technicalPain.length > 0 ? q.technicalPain.join(', ') : 'None'}
- Business Pain Points: ${q.businessPain.length > 0 ? q.businessPain.join(', ') : 'None'}
- Additional Comments: ${q.comment || 'None'}
`).join('\n')}
`).join('\n\n')}

## Task
Based ONLY on the data provided above, generate a comprehensive overall assessment with:

1. **Overall Maturity Scores:**
   - Current maturity score (average across all answered questions)
   - Target maturity score (average of future states)
   - Maturity gap (target - current)

2. **Pillar-Specific Scores:**
   For each pillar with answered questions, calculate:
   - Current score, Future score, Gap
   
3. **Strategic Executive Summary:**
   Write a CTO-level narrative (300-500 words) covering:
   - Current state assessment with specific strengths/weaknesses identified from responses
   - Critical constraints impacting the organization (be specific based on pain points selected)
   - Transformation roadmap with timeline (reference actual gap sizes)
   - Priority initiatives with specific Databricks features that address identified pain points
   - Expected business outcomes (based on gaps and pain points, not made-up numbers)

4. **Top 5 Priority Recommendations:**
   For each recommendation provide:
   - Title
   - Description (why it matters to THIS organization based on their responses)
   - Specific actions (using latest Databricks features)
   - Business impact (based on pain points addressed)
   - Timeline estimate
   - Priority level (critical/high/medium/low)

Return JSON with this structure:
{
  "overallScores": {
    "currentScore": <number 1-5>,
    "futureScore": <number 1-5>,
    "gap": <number>
  },
  "pillarScores": {
    "<pillarId>": {
      "current": <number 1-5>,
      "future": <number 1-5>,
      "gap": <number>
    }
  },
  "executiveSummary": "<markdown text>",
  "recommendations": [
    {
      "title": "<string>",
      "description": "<string>",
      "actions": ["<action1>", "<action2>"],
      "businessImpact": "<string>",
      "timeline": "<string>",
      "priority": "<critical|high|medium|low>"
    }
  ]
}`;
  }

  /**
   * Build prompt for pillar-specific results
   */
  buildPillarPrompt(assessment, pillarId) {
    const { responses } = assessment;
    const area = assessmentFramework.assessmentAreas.find(a => a.id === pillarId);
    
    if (!area) {
      throw new Error(`Pillar ${pillarId} not found`);
    }
    
    // DEBUG: Log what we're receiving
    console.log('🔍 buildPillarPrompt called for pillar:', pillarId);
    console.log('🔍 Assessment ID:', assessment.id);
    console.log('🔍 Responses null/undefined?:', responses === null || responses === undefined);
    console.log('🔍 Responses keys:', responses ? Object.keys(responses).length : 0);
    
    // FIX: Ensure responses is an object
    const validResponses = responses || {};
    
    const questions = this.getAreaQuestions(area);
    const filledQuestions = [];
    
    questions.forEach(question => {
      const currentState = validResponses[`${question.id}_current_state`];
      const futureState = validResponses[`${question.id}_future_state`];
      const technicalPain = validResponses[`${question.id}_technical_pain`] || [];
      const businessPain = validResponses[`${question.id}_business_pain`] || [];
      const comment = validResponses[`${question.id}_comment`] || '';
      const skipped = validResponses[`${question.id}_skipped`] || false;
      
      if (!skipped && (currentState || futureState)) {
        filledQuestions.push({
          topic: question.topic,
          currentState,
          futureState,
          technicalPain,
          businessPain,
          comment
        });
      }
    });

    return `# ${area.name} Pillar Assessment Analysis

## Organization Context
- **Organization:** ${assessment.organizationName || 'Not provided'}
- **Industry:** ${assessment.industry || 'Not provided'}

## ${area.name} Questions (${filledQuestions.length} answered)

${filledQuestions.map((q, idx) => `
**Question ${idx + 1}: ${q.topic}**
- Current State: Level ${q.currentState || 'Not answered'}
- Future/Target State: Level ${q.futureState || 'Not answered'}
- Technical Pain Points: ${q.technicalPain.length > 0 ? q.technicalPain.join(', ') : 'None'}
- Business Pain Points: ${q.businessPain.length > 0 ? q.businessPain.join(', ') : 'None'}
- Additional Comments: ${q.comment || 'None'}
`).join('\n')}

## Task
Based ONLY on the data provided above for the ${area.name} pillar, generate:

1. **Pillar Maturity Scores:**
   - Current maturity score (average across answered questions)
   - Target maturity score
   - Maturity gap

2. **Pillar Summary:**
   A strategic 150-200 word summary covering:
   - Current state strengths and weaknesses
   - Key constraints identified
   - Recommended path forward

3. **Top 5 Recommendations for This Pillar:**
   For each recommendation:
   - Title
   - Description (specific to their responses and pain points)
   - Actions using latest Databricks features relevant to this pillar
   - Business impact (based on identified pain points)
   - Timeline
   - Priority

4. **Key Databricks Features for This Pillar:**
   List 3-5 specific Databricks capabilities (2024-2025) that would address their pain points in this pillar, with brief explanations of why each matters to them.

Return JSON with this structure:
{
  "scores": {
    "current": <number 1-5>,
    "future": <number 1-5>,
    "gap": <number>
  },
  "summary": "<markdown text>",
  "recommendations": [
    {
      "title": "<string>",
      "description": "<string>",
      "actions": ["<action1>", "<action2>"],
      "businessImpact": "<string>",
      "timeline": "<string>",
      "priority": "<critical|high|medium|low>"
    }
  ],
  "databricksFeatures": [
    {
      "name": "<feature name>",
      "description": "<why it matters to them>",
      "impact": "<high|medium|low>"
    }
  ]
}`;
  }

  /**
   * Generate pillar-specific prioritized actions from pillar scores
   */
  generatePillarPrioritizedActions(pillarScores, assessment) {
    const actions = [];
    const responses = assessment.responses || {};
    
    Object.keys(pillarScores).forEach(pillarId => {
      const pillar = assessmentFramework.assessmentAreas.find(a => a.id === pillarId);
      if (!pillar) return;
      
      const scores = pillarScores[pillarId];
      const currentScore = Math.round(scores.current);
      const futureScore = Math.round(scores.future);
      const gap = Math.round(scores.gap);
      
      if (gap > 0) {
        // Get pain points for this pillar
        const pillarPainPoints = [];
        pillar.dimensions.forEach(dimension => {
          dimension.questions.forEach(question => {
            const techPainKey = `${question.id}_technical_pain`;
            const bizPainKey = `${question.id}_business_pain`;
            
            if (responses[techPainKey]) {
              const painArray = Array.isArray(responses[techPainKey]) ? responses[techPainKey] : [responses[techPainKey]];
              pillarPainPoints.push(...painArray.map(p => `Technical: ${p}`));
            }
            if (responses[bizPainKey]) {
              const painArray = Array.isArray(responses[bizPainKey]) ? responses[bizPainKey] : [responses[bizPainKey]];
              pillarPainPoints.push(...painArray.map(p => `Business: ${p}`));
            }
          });
        });
        
        actions.push({
          pillarId: pillarId,
          pillarName: pillar.name,
          currentScore: currentScore,
          targetScore: futureScore,
          gap: gap,
          priority: gap >= 2 ? 'critical' : gap === 1 ? 'high' : 'medium',
          rationale: `This pillar shows a ${gap}-level maturity gap between your current state (Level ${currentScore}) and desired future state (Level ${futureScore}). ${pillarPainPoints.length > 0 ? `You've identified ${pillarPainPoints.length} pain points that need attention.` : 'Focused improvement is needed.'}`,
          theGood: [
            `Clear assessment of current capabilities at Level ${currentScore}`,
            `Defined target state at Level ${futureScore}`,
            `Identified improvement path with structured maturity framework`
          ],
          theBad: pillarPainPoints.length > 0 ? pillarPainPoints.slice(0, 5) : [
            `${gap}-level maturity gap requiring focused effort`,
            `Need to progress through ${gap} maturity level${gap > 1 ? 's' : ''}`
          ],
          actions: [
            `Progress from Level ${currentScore} (${this.getMaturityLevel(currentScore)?.level || 'Current'}) to Level ${futureScore} (${this.getMaturityLevel(futureScore)?.level || 'Target'})`,
            `Address identified pain points in ${pillar.name}`,
            `Implement structured improvements across all dimensions`,
            `Measure progress against maturity framework`
          ]
        });
      }
    });
    
    // Sort by gap (largest first) then by priority
    return actions.sort((a, b) => {
      if (b.gap !== a.gap) return b.gap - a.gap;
      const priorityOrder = { 'critical': 3, 'high': 2, 'medium': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Format overall results from OpenAI response
   */
  formatOverallResults(content, assessment) {
    const { overallScores, pillarScores, executiveSummary, recommendations } = content;
    
    // Generate pillar-specific prioritized actions
    const pillarActions = this.generatePillarPrioritizedActions(pillarScores, assessment);
    
    return {
      overall: {
        currentScore: Math.round(overallScores.currentScore),
        futureScore: Math.round(overallScores.futureScore),
        gap: Math.round(overallScores.gap),
        level: this.getMaturityLevel(overallScores.currentScore),
        summary: executiveSummary
      },
      areaScores: Object.keys(pillarScores).reduce((acc, pillarId) => {
        acc[pillarId] = {
          current: Math.round(pillarScores[pillarId].current),
          future: Math.round(pillarScores[pillarId].future),
          gap: Math.round(pillarScores[pillarId].gap),
          overall: Math.round((pillarScores[pillarId].current + pillarScores[pillarId].future) / 2)
        };
        return acc;
      }, {}),
      categories: this.formatPillarCategories(pillarScores),
      prioritizedActions: pillarActions, // Use pillar-structured actions
      painPointRecommendations: recommendations || [],
      gapBasedActions: [],
      commentBasedInsights: [],
      roadmap: {},
      quickWins: [],
      riskAreas: []
    };
  }

  /**
   * Generate dimension-level gap-based actions for a pillar
   */
  generatePillarGapActions(assessment, pillarId) {
    const area = assessmentFramework.assessmentAreas.find(a => a.id === pillarId);
    if (!area) return [];

    const responses = assessment.responses || {};
    const actions = [];

    area.dimensions.forEach(dimension => {
      dimension.questions.forEach(question => {
        const currentKey = `${question.id}_current_state`;
        const futureKey = `${question.id}_future_state`;
        
        const currentValue = parseInt(responses[currentKey]) || 0;
        const futureValue = parseInt(responses[futureKey]) || 0;
        const gap = futureValue - currentValue;

        if (gap > 0) {
          // Get the maturity level labels
          const currentLevel = this.getMaturityLevel(currentValue);
          const futureLevel = this.getMaturityLevel(futureValue);
          
          actions.push({
            dimension: dimension.name,
            question: question.question,
            current: currentValue,
            future: futureValue,
            gap: parseFloat(gap.toFixed(1)), // Fix floating point precision
            currentLevel: currentLevel ? currentLevel.level : 'Unknown',
            futureLevel: futureLevel ? futureLevel.level : 'Unknown',
            recommendation: `Progress from Level ${currentValue} (${currentLevel?.level || 'Unknown'}) to Level ${futureValue} (${futureLevel?.level || 'Unknown'}) by implementing structured improvements in ${dimension.name.toLowerCase()}.`
          });
        }
      });
    });

    // Sort by gap (largest first)
    return actions.sort((a, b) => b.gap - a.gap);
  }

  /**
   * Format pillar results from OpenAI response
   */
  formatPillarResults(content, assessment, pillarId) {
    const { scores, summary, recommendations, databricksFeatures } = content;
    const area = assessmentFramework.assessmentAreas.find(a => a.id === pillarId);
    
    // Generate dimension-level gap actions
    const gapActions = this.generatePillarGapActions(assessment, pillarId);
    
    return {
      pillar: {
        id: pillarId,
        name: area.name,
        currentScore: Math.round(scores.current),
        futureScore: Math.round(scores.future),
        gap: parseFloat(scores.gap.toFixed(1)), // Fix floating point precision
        level: this.getMaturityLevel(scores.current),
        targetLevel: this.getMaturityLevel(scores.future)
      },
      summary: summary || '',
      recommendations: recommendations || [],
      databricksFeatures: databricksFeatures || [],
      painPointRecommendations: recommendations || [],
      gapBasedActions: gapActions,
      commentBasedInsights: []
    };
  }

  /**
   * Format pillar categories for overall results
   */
  formatPillarCategories(pillarScores) {
    const categories = {};
    
    Object.keys(pillarScores).forEach(pillarId => {
      const area = assessmentFramework.assessmentAreas.find(a => a.id === pillarId);
      const scores = pillarScores[pillarId];
      
      categories[pillarId] = {
        name: area.name,
        currentScore: Math.round(scores.current),
        futureScore: Math.round(scores.future),
        gap: Math.round(scores.gap),
        level: this.getMaturityLevel(scores.current),
        targetLevel: this.getMaturityLevel(scores.future),
        recommendations: []
      };
    });
    
    return categories;
  }

  /**
   * Fallback content when OpenAI is unavailable
   */
  generateFallbackContent(assessment, pillarId) {
    console.log('⚠️  Generating fallback content (OpenAI unavailable)');
    console.log('🔍 Fallback - Assessment ID:', assessment.id);
    console.log('🔍 Fallback - Responses null/undefined?:', assessment.responses === null || assessment.responses === undefined);
    console.log('🔍 Fallback - Responses keys:', assessment.responses ? Object.keys(assessment.responses).length : 0);
    
    // FIX: Ensure responses is not null
    const validResponses = assessment.responses || {};
    
    // Import the adaptive engine for fallback
    const AdaptiveRecommendationEngine = require('./adaptiveRecommendationEngine');
    const engine = new AdaptiveRecommendationEngine();
    
    if (pillarId) {
      // Generate pillar-specific fallback
      const recommendations = engine.generateAdaptiveRecommendations(
        validResponses,
        [pillarId]
      );
      
      const area = assessmentFramework.assessmentAreas.find(a => a.id === pillarId);
      const scores = recommendations.areaScores[pillarId] || { current: 0, future: 0, gap: 0 };
      
      // Generate dimension-level gap actions using the same method as OpenAI path
      const gapActions = this.generatePillarGapActions(assessment, pillarId);
      
      return {
        pillar: {
          id: pillarId,
          name: area.name,
          currentScore: scores.current,
          futureScore: scores.future,
          gap: parseFloat(scores.gap.toFixed(1)), // Fix floating point precision
          level: this.getMaturityLevel(scores.current),
          targetLevel: this.getMaturityLevel(scores.future)
        },
        summary: `Based on your responses, this pillar shows a ${scores.gap}-level gap requiring focused attention.`,
        recommendations: recommendations.prioritizedActions || [],
        databricksFeatures: [],
        painPointRecommendations: recommendations.painPointRecommendations || [],
        gapBasedActions: gapActions, // Use dimension-level gaps
        commentBasedInsights: recommendations.commentBasedInsights || []
      };
    } else {
      // Generate overall fallback
      const recommendations = engine.generateAdaptiveRecommendations(
        validResponses
      );
      
      // Transform to use pillar-structured actions
      const pillarActions = this.generatePillarPrioritizedActions(recommendations.areaScores, assessment);
      recommendations.prioritizedActions = pillarActions;
      
      return recommendations;
    }
  }

  /**
   * Get area questions
   */
  getAreaQuestions(area) {
    const questions = [];
    if (area.dimensions) {
      area.dimensions.forEach(dimension => {
        if (dimension.questions) {
          questions.push(...dimension.questions);
        }
      });
    } else if (area.questions) {
      questions.push(...area.questions);
    }
    return questions;
  }

  /**
   * Get maturity level for a given score
   */
  getMaturityLevel(score) {
    const roundedScore = Math.round(score);
    const level = Math.max(1, Math.min(5, roundedScore));
    
    const maturityLevels = {
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
    };
    
    return maturityLevels[level];
  }
}

module.exports = OpenAIContentGenerator;

