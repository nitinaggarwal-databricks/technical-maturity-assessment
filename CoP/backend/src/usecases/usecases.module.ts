import { Module } from '@nestjs/common';
import { UsecasesService } from './usecases.service';
import { UsecasesController } from './usecases.controller';

@Module({
  providers: [UsecasesService],
  controllers: [UsecasesController],
})
export class UsecasesModule {}


