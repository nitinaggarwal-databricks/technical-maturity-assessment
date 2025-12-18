import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChampionDto } from './dto/create-champion.dto';

@Injectable()
export class ChampionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateChampionDto) {
    const date = new Date(dto.month);
    const normalizedMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    return this.prisma.champion.create({
      data: {
        copId: dto.copId,
        userId: dto.userId,
        month: normalizedMonth,
        awardType: dto.awardType,
        citation: dto.citation,
        createdById: dto.createdById,
      },
    });
  }

  listByCop(copId: string) {
    return this.prisma.champion.findMany({
      where: { copId },
      orderBy: { month: 'desc' },
      include: { user: true },
    });
  }
}


