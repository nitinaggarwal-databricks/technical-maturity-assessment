import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DatabricksModelService } from '../integrations/databricks/databricks-model.service';

/**
 * AI Service
 * 
 * Provides AI-powered features via Databricks Model Serving:
 * - CoP Advisor: recommendations based on KPIs and context
 * - Survey summarization: extract insights from free-text responses
 * - Newsletter generation: draft email content
 */
@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private databricksModel: DatabricksModelService,
  ) {}

  /**
   * Generate CoP advice based on current metrics and context
   */
  async generateCopAdvice(copId: string): Promise<any> {
    // 1. Gather context
    const context = await this.gatherCopContext(copId);

    // 2. Call Databricks Model Serving
    const advice = await this.databricksModel.generateCopAdvice(copId, context);

    // 3. Cache result
    await this.prisma.aiSummary.upsert({
      where: {
        entityType_entityId_summaryType: {
          entityType: 'cop',
          entityId: copId,
          summaryType: 'advisor_recommendations',
        },
      },
      create: {
        entityType: 'cop',
        entityId: copId,
        summaryType: 'advisor_recommendations',
        content: advice,
        model: 'dbrx-instruct',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      update: {
        content: advice,
        createdAt: new Date(),
      },
    });

    return advice;
  }

  /**
   * Summarize survey free-text responses
   */
  async summarizeSurvey(surveyId: string): Promise<any> {
    // 1. Get all free-text answers
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        cop: true,
        questions: true,
        responses: {
          include: { answers: { include: { question: true } } },
        },
      },
    });

    const freeTextAnswers = survey?.responses
      .flatMap((r) => r.answers)
      .filter((a) => a.question.questionType === 'free_text')
      .map((a) => a.answerValue);

    if (!freeTextAnswers || freeTextAnswers.length === 0) {
      return {
        working_well: [],
        opportunities: [],
        top_actions: [],
      };
    }

    // 2. Call Databricks Model Serving
    const summary = await this.databricksModel.summarizeSurvey(
      survey.copId,
      freeTextAnswers,
    );

    // 3. Cache result
    await this.prisma.aiSummary.upsert({
      where: {
        entityType_entityId_summaryType: {
          entityType: 'survey',
          entityId: surveyId,
          summaryType: 'survey_feedback',
        },
      },
      create: {
        entityType: 'survey',
        entityId: surveyId,
        summaryType: 'survey_feedback',
        content: summary,
        model: 'dbrx-instruct',
      },
      update: {
        content: summary,
        createdAt: new Date(),
      },
    });

    return summary;
  }

  /**
   * Gather comprehensive CoP context for AI advisor
   */
  private async gatherCopContext(copId: string) {
    const cop = await this.prisma.cop.findUnique({
      where: { id: copId },
      include: {
        customer: true,
        memberships: true,
        events: { take: 10, orderBy: { startsAt: 'desc' } },
      },
    });

    const kpis = await this.prisma.kpiMetric.findMany({
      where: { copId },
      orderBy: { metricDate: 'desc' },
      take: 30,
    });

    const surveys = await this.prisma.survey.findMany({
      where: { copId },
      include: { responses: true },
    });

    const useCases = await this.prisma.useCase.findMany({
      where: { copId },
    });

    // Calculate trends
    const mapValues = kpis
      .filter((k) => k.metricName === 'MAP')
      .map((k) => k.metricValue);
    const dbuValues = kpis
      .filter((k) => k.metricName === 'DBU')
      .map((k) => k.metricValue);

    return {
      phase: cop?.phase,
      industry: cop?.customer.industry,
      memberCount: cop?.memberships.length,
      daysActive: Math.floor(
        (Date.now() - (cop?.startDate?.getTime() || Date.now())) /
          (1000 * 60 * 60 * 24),
      ),
      map: mapValues[0] || 0,
      nps: kpis.find((k) => k.metricName === 'NPS')?.metricValue || 0,
      dbuTrend: dbuValues.length > 1 ? 'growing' : 'stable',
      surveyResponseRate:
        surveys.reduce((sum, s) => sum + s.responses.length, 0) /
        Math.max(surveys.length * 10, 1),
      recentEvents: cop?.events.length || 0,
      contentEngagement: 'moderate',
      useCases: useCases.length,
    };
  }
}

