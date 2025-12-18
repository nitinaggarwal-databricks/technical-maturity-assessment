import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContentDto } from './dto/create-content.dto';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateContentDto) {
    return this.prisma.contentAsset.create({
      data: {
        copId: dto.copId ?? null,
        title: dto.title,
        description: dto.description,
        url: dto.url,
        assetType: dto.assetType,
        skillLevel: dto.skillLevel,
        personaTag: dto.personaTag,
        tags: dto.tags ?? [],
        createdById: dto.createdById,
      },
    });
  }

  listByCop(copId: string) {
    return this.prisma.contentAsset.findMany({
      where: {
        OR: [
          { copId },   // CoP-specific
          { copId: null }, // global assets
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  recordEngagement(assetId: string, userId: string, engagementType: string) {
    return this.prisma.contentEngagement.create({
      data: { assetId, userId, engagementType },
    });
  }
}


