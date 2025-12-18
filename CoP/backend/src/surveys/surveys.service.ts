import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { SubmitSurveyResponseDto } from './dto/submit-response.dto';

@Injectable()
export class SurveysService {
  constructor(private readonly prisma: PrismaService) {}

  async createSurvey(dto: CreateSurveyDto) {
    return this.prisma.$transaction(async (tx) => {
      const survey = await tx.survey.create({
        data: {
          title: dto.title,
          surveyType: dto.surveyType,
          copId: dto.copId ?? null,
          eventId: dto.eventId ?? null,
          createdById: dto.createdById,
        },
      });

      await tx.surveyQuestion.createMany({
        data: dto.questions.map((q, idx) => ({
          surveyId: survey.id,
          questionText: q.questionText,
          questionType: q.questionType,
          position: idx,
        })),
      });

      return survey;
    });
  }

  listByCop(copId: string) {
    return this.prisma.survey.findMany({
      where: { copId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSurveyWithQuestions(id: string) {
    const survey = await this.prisma.survey.findUnique({
      where: { id },
      include: { questions: { orderBy: { position: 'asc' } } },
    });
    if (!survey) throw new NotFoundException('Survey not found');
    return survey;
  }

  async submitResponse(surveyId: string, dto: SubmitSurveyResponseDto) {
    return this.prisma.$transaction(async (tx) => {
      const response = await tx.surveyResponse.create({
        data: {
          surveyId,
          userId: dto.userId ?? null,
        },
      });

      if (dto.answers?.length) {
        await tx.surveyAnswer.createMany({
          data: dto.answers.map((a) => ({
            responseId: response.id,
            questionId: a.questionId,
            answerValue: a.answerValue,
          })),
        });
      }

      return response;
    });
  }

  // very simple aggregate: count, average rating per numeric question
  async basicStats(surveyId: string) {
    const survey = await this.getSurveyWithQuestions(surveyId);

    const responsesCount = await this.prisma.surveyResponse.count({
      where: { surveyId },
    });

    const numericQuestions = survey.questions.filter((q) =>
      ['rating', 'nps'].includes(q.questionType),
    );

    const byQuestion: Record<
      string,
      { question: string; avg?: number; count: number }
    > = {};

    for (const q of numericQuestions) {
      const answers = await this.prisma.surveyAnswer.findMany({
        where: { questionId: q.id },
      });
      const nums = answers
        .map((a) => Number(a.answerValue))
        .filter((n) => !isNaN(n));
      const avg =
        nums.length > 0
          ? nums.reduce((sum, v) => sum + v, 0) / nums.length
          : undefined;

      byQuestion[q.id] = {
        question: q.questionText,
        avg,
        count: nums.length,
      };
    }

    return {
      responsesCount,
      questions: byQuestion,
    };
  }
}


