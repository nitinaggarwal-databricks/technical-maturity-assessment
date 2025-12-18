import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        copId: dto.copId,
        title: dto.title,
        description: dto.description,
        eventType: dto.eventType,
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        location: dto.location,
      },
    });
  }

  findByCop(copId: string) {
    return this.prisma.event.findMany({
      where: { copId },
      orderBy: { startsAt: 'asc' },
    });
  }
}


