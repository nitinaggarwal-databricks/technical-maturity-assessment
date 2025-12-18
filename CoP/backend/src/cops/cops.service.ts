import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCopDto } from './dto/create-cop.dto';

@Injectable()
export class CopsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCopDto) {
    return this.prisma.cop.create({
      data: {
        customerId: dto.customerId,
        name: dto.name,
        mission: dto.mission,
        vision: dto.vision,
        charterUrl: dto.charterUrl,
        phase: dto.phase,
      },
    });
  }

  async findAll(customerId?: string) {
    return this.prisma.cop.findMany({
      where: customerId ? { customerId } : {},
      include: {
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const cop = await this.prisma.cop.findUnique({
      where: { id },
      include: {
        customer: true,
        memberships: true,
        events: {
          orderBy: { startsAt: 'asc' },
          take: 3,
        },
      },
    });
    if (!cop) throw new NotFoundException('CoP not found');
    return cop;
  }
}


