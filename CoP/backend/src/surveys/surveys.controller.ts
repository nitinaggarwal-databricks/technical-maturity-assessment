import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { SubmitSurveyResponseDto } from './dto/submit-response.dto';

@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post()
  create(@Body() dto: CreateSurveyDto) {
    return this.surveysService.createSurvey(dto);
  }

  @Get('cop/:copId')
  listByCop(@Param('copId') copId: string) {
    return this.surveysService.listByCop(copId);
  }

  @Get(':id')
  getSurvey(@Param('id') id: string) {
    return this.surveysService.getSurveyWithQuestions(id);
  }

  @Post(':id/responses')
  submitResponse(
    @Param('id') id: string,
    @Body() dto: SubmitSurveyResponseDto,
  ) {
    return this.surveysService.submitResponse(id, dto);
  }

  @Get(':id/stats/basic')
  basicStats(@Param('id') id: string) {
    return this.surveysService.basicStats(id);
  }
}


