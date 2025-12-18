import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService } from './ai.service';

/**
 * AI Controller
 * 
 * Endpoints:
 * - POST /cops/:copId/ai/advice - Generate CoP recommendations
 * - POST /surveys/:surveyId/ai/summary - Summarize survey responses
 */
@Controller()
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('cops/:copId/ai/advice')
  generateAdvice(@Param('copId') copId: string) {
    return this.aiService.generateCopAdvice(copId);
  }

  @Post('surveys/:surveyId/ai/summary')
  summarizeSurvey(@Param('surveyId') surveyId: string) {
    return this.aiService.summarizeSurvey(surveyId);
  }
}

