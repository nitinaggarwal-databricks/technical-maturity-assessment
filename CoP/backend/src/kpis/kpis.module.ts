import { Module } from '@nestjs/common';
import { KpisService } from './kpis.service';
import { KpisController } from './kpis.controller';

@Module({
  providers: [KpisService],
  controllers: [KpisController],
})
export class KpisModule {}


