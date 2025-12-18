import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUseCaseDto } from './dto/create-usecase.dto';

@Injectable()
export class UsecasesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateUseCaseDto) {
    return this.prisma.useCase.create({
      data: {
        copId: dto.copId,
        title: dto.title,
        problem: dto.problem,
        solution: dto.solution,
        architectureUrl: dto.architectureUrl,
        productsUsed: dto.productsUsed ?? [],
        outcomes: dto.outcomes,
        createdById: dto.createdById,
      },
    });
  }

  listByCop(copId: string) {
    return this.prisma.useCase.findMany({
      where: { copId },
      orderBy: { createdAt: 'desc' },
    });
  }
}


