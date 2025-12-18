import { Module } from '@nestjs/common';
import { CopsController } from './cops.controller';
import { CopsService } from './cops.service';

@Module({
  controllers: [CopsController],
  providers: [CopsService],
})
export class CopsModule {}


