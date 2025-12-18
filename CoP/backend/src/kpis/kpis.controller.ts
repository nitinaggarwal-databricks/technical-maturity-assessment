import { Controller, Get, Param, Query } from '@nestjs/common';
import { KpisService } from './kpis.service';

@Controller('cops/:copId/kpis')
export class KpisController {
  constructor(private readonly kpisService: KpisService) {}

  @Get('series')
  getSeries(
    @Param('copId') copId: string,
    @Query('metric') metricName: string,
  ) {
    return this.kpisService.getSeries(copId, metricName);
  }

  @Get('snapshot')
  getSnapshot(@Param('copId') copId: string) {
    return this.kpisService.getSnapshot(copId);
  }
}


