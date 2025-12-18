import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { CopsService } from './cops.service';
import { CreateCopDto } from './dto/create-cop.dto';

@Controller('cops')
export class CopsController {
  constructor(private readonly copsService: CopsService) {}

  @Post()
  create(@Body() dto: CreateCopDto) {
    return this.copsService.create(dto);
  }

  @Get()
  findAll(@Query('customerId') customerId?: string) {
    return this.copsService.findAll(customerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.copsService.findOne(id);
  }
}


