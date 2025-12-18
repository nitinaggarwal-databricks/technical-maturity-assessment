import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChampionsService } from './champions.service';
import { CreateChampionDto } from './dto/create-champion.dto';

@Controller('cops/:copId/champions')
export class ChampionsController {
  constructor(private readonly championsService: ChampionsService) {}

  @Get()
  list(@Param('copId') copId: string) {
    return this.championsService.listByCop(copId);
  }

  @Post()
  create(@Param('copId') copId: string, @Body() dto: CreateChampionDto) {
    return this.championsService.create({ ...dto, copId });
  }
}


