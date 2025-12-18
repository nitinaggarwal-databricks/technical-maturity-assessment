import { Module } from '@nestjs/common';
import { ChampionsService } from './champions.service';
import { ChampionsController } from './champions.controller';

@Module({
  providers: [ChampionsService],
  controllers: [ChampionsController],
})
export class ChampionsModule {}


