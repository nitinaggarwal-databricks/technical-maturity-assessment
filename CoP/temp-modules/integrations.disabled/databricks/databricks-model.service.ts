import { Injectable } from '@nestjs/common';
import { DatabricksClientService } from './databricks-client.service';

/**
 * Databricks Model Serving Service
 * 
 * Call Databricks Model Serving endpoints for AI features:
 * - CoP Advisor (recommendations)
 * - Survey summarization
 * - Newsletter generation
 */
@Injectable()
export class DatabricksModelService {
  constructor(private clientService: DatabricksClientService) {}

  /**
   * Call a model serving endpoint
   */
  async callModel(copId: string, modelKey: string, payload: any): Promise<any> {
    const workspace = await this.clientService.getWorkspaceForCop(copId);
    const config = workspace.integration.config;
    const model = config.models?.[modelKey];

    if (!model?.serving_url) {
      throw new Error(`Model ${modelKey} not configured for this CoP`);
    }

    const client = await this.clientService.getClient(
      workspace.workspaceUrl,
      config,
    );

    // Extract endpoint path from full URL
    const url = new URL(model.serving_url);
    const path = url.pathname;

    const response = await client.post(path, {
      inputs: [payload],
    });

    return response.data;
  }

  /**
   * Generate CoP advice using DBRX or similar model
   */
  async generateCopAdvice(copId: string, context: any): Promise<any> {
    const prompt = this.buildCopAdvisorPrompt(context);

    try {
      const response = await this.callModel(copId, 'cop_advisor', {
        messages: [
          {
            role: 'system',
            content:
              'You are an expert Databricks Community of Practice advisor. Provide actionable, specific recommendations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return this.parseCopAdvice(response);
    } catch (error) {
      console.error('Error calling CoP advisor model:', error);
      // Fallback to rule-based recommendations
      return this.generateFallbackAdvice(context);
    }
  }

  /**
   * Summarize survey responses
   */
  async summarizeSurvey(copId: string, responses: string[]): Promise<any> {
    if (responses.length === 0) {
      return {
        working_well: [],
        opportunities: [],
        top_actions: [],
      };
    }

    const prompt = `
Analyze these ${responses.length} survey responses and provide insights:

${responses.map((r, i) => `${i + 1}. ${r}`).join('\n\n')}

Provide a JSON response with:
{
  "working_well": ["theme 1", "theme 2", ...],
  "opportunities": ["opportunity 1", "opportunity 2", ...],
  "top_actions": ["action 1", "action 2", "action 3"]
}
    `;

    try {
      const response = await this.callModel(copId, 'survey_summarizer', {
        prompt,
        max_tokens: 500,
        temperature: 0.5,
      });

      return this.parseSurveySummary(response);
    } catch (error) {
      console.error('Error calling survey summarizer:', error);
      return this.generateFallbackSummary(responses);
    }
  }

  /**
   * Build prompt for CoP Advisor
   */
  private buildCopAdvisorPrompt(context: any): string {
    return `
Given the following Community of Practice context, provide actionable recommendations:

**CoP Details:**
- Phase: ${context.phase}
- Industry: ${context.industry}
- Member Count: ${context.memberCount}
- Active for: ${context.daysActive} days

**Recent Metrics:**
- MAP (Monthly Active Participants): ${context.map}
- NPS: ${context.nps}
- DBU Usage Trend: ${context.dbuTrend}
- Survey Response Rate: ${context.surveyResponseRate}%

**Recent Activity:**
- Events in last 30 days: ${context.recentEvents}
- Content engagement: ${context.contentEngagement}
- Use cases launched: ${context.useCases}

Provide recommendations in JSON format:
{
  "next_sessions": ["session 1", "session 2", "session 3"],
  "content_to_highlight": ["content 1", "content 2"],
  "champions_to_recognize": ["criteria or names"],
  "roadmap": {
    "Q1": "focus area",
    "Q2": "focus area",
    "Q3": "focus area",
    "Q4": "focus area"
  }
}
    `.trim();
  }

  /**
   * Parse model response for CoP advice
   */
  private parseCopAdvice(response: any): any {
    // Handle different response formats
    if (response.choices?.[0]?.message?.content) {
      try {
        return JSON.parse(response.choices[0].message.content);
      } catch {
        return { raw_response: response.choices[0].message.content };
      }
    }

    if (response.predictions?.[0]) {
      return response.predictions[0];
    }

    return response;
  }

  /**
   * Parse survey summary response
   */
  private parseSurveySummary(response: any): any {
    if (response.choices?.[0]?.message?.content) {
      try {
        return JSON.parse(response.choices[0].message.content);
      } catch {
        return { raw_response: response.choices[0].message.content };
      }
    }

    return response;
  }

  /**
   * Fallback advice when model is unavailable
   */
  private generateFallbackAdvice(context: any): any {
    const advice = {
      next_sessions: [],
      content_to_highlight: [],
      champions_to_recognize: [],
      roadmap: {},
    };

    // Rule-based recommendations based on phase
    if (context.phase === 'FOUNDATION') {
      advice.next_sessions = [
        'Databricks Platform Overview',
        'Unity Catalog Setup & Governance',
        'Data Engineering Fundamentals',
      ];
      advice.content_to_highlight = [
        'Databricks Academy - Fundamentals',
        'Unity Catalog Best Practices Guide',
      ];
    } else if (context.phase === 'LAUNCH') {
      advice.next_sessions = [
        'Advanced Data Engineering Patterns',
        'GenAI & LLMs on Databricks',
        'Performance Optimization Workshop',
      ];
      advice.content_to_highlight = [
        'Delta Lake Advanced Features',
        'Model Serving Best Practices',
      ];
    }

    // NPS-based recommendations
    if (context.nps < 50) {
      advice.top_actions = [
        'Schedule 1:1s with members to understand pain points',
        'Add more hands-on workshop time',
        'Share more customer success stories',
      ];
    } else if (context.nps >= 70) {
      advice.champions_to_recognize = [
        'Top contributors from last quarter',
        'Members who helped others in discussions',
      ];
    }

    return advice;
  }

  /**
   * Fallback survey summary
   */
  private generateFallbackSummary(responses: string[]): any {
    // Simple keyword-based analysis
    const text = responses.join(' ').toLowerCase();

    const positive = ['great', 'excellent', 'good', 'helpful', 'clear'];
    const negative = ['confusing', 'difficult', 'unclear', 'slow', 'lacking'];

    const working_well = positive
      .filter((word) => text.includes(word))
      .map((word) => `Positive mentions of "${word}"`);

    const opportunities = negative
      .filter((word) => text.includes(word))
      .map((word) => `Address concerns about "${word}"`);

    return {
      working_well: working_well.length > 0 ? working_well : ['Generally positive feedback'],
      opportunities: opportunities.length > 0 ? opportunities : ['Continue current approach'],
      top_actions: [
        'Review individual responses for details',
        'Follow up with participants',
        'Plan next session based on feedback',
      ],
    };
  }
}

