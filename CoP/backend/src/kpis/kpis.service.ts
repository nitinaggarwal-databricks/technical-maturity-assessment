import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KpisService {
  constructor(private readonly prisma: PrismaService) {}

  getSeries(copId: string, metricName: string) {
    return this.prisma.kpiMetric.findMany({
      where: { copId, metricName },
      orderBy: { metricDate: 'asc' },
    });
  }

  async getSnapshot(copId: string) {
    // Latest per metricName
    const metrics = await this.prisma.kpiMetric.findMany({
      where: { copId },
      orderBy: { metricDate: 'desc' },
    });

    // Group by metricName and take the latest
    const snapshot: Record<string, any> = {};
    for (const m of metrics) {
      if (!snapshot[m.metricName]) {
        snapshot[m.metricName] = m;
      }
    }

    return Object.values(snapshot);
  }
}


