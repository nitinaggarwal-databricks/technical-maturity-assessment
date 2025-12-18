import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SurveyQuestionInput {
  @IsString()
  questionText: string;

  @IsString()
  questionType: string; // 'rating','nps','free_text','multi_choice'
}

export class CreateSurveyDto {
  @IsString()
  title: string;

  @IsString()
  surveyType: string;

  @IsOptional()
  @IsString()
  copId?: string;

  @IsOptional()
  @IsString()
  eventId?: string;

  @IsOptional()
  @IsString()
  createdById?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SurveyQuestionInput)
  questions: SurveyQuestionInput[];
}


