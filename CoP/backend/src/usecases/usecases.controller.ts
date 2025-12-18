import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsecasesService } from './usecases.service';
import { CreateUseCaseDto } from './dto/create-usecase.dto';

@Controller('cops/:copId/usecases')
export class UsecasesController {
  constructor(private readonly usecasesService: UsecasesService) {}

  @Get()
  list(@Param('copId') copId: string) {
    return this.usecasesService.listByCop(copId);
  }

  @Post()
  create(@Param('copId') copId: string, @Body() dto: CreateUseCaseDto) {
    return this.usecasesService.create({ ...dto, copId });
  }
}


