import { IsArray, IsOptional, IsString } from 'class-validator';

export class SubmitSurveyResponseDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsArray()
  answers: {
    questionId: string;
    answerValue: string;
  }[];
}


