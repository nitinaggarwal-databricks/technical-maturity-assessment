import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Databricks Usage Service
 * 
 * Processes usage metrics from Databricks and stores them as KPIs.
 */
@Injectable()
export class DatabricksUsageService {
  constructor(private prisma: PrismaService) {}

  /**
   * Ingest metrics from Databricks job
   */
  async ingestMetrics(payload: any) {
    const date = new Date(payload.metricDate);

    // Determine which CoP(s) to attribute metrics to
    const cops = await this.getTargetCops(
      payload.customerId,
      payload.copId,
      payload.workspaceId,
    );

    if (cops.length === 0) {
      throw new Error('No CoPs found for the given criteria');
    }

    const created = [];

    for (const cop of cops) {
      for (const metric of payload.metrics) {
        const kpi = await this.prisma.kpiMetric.upsert({
          where: {
            copId_metricName_metricDate: {
              copId: cop.id,
              metricName: metric.name,
              metricDate: date,
            },
          },
          update: {
            metricValue: metric.value,
          },
          create: {
            copId: cop.id,
            metricName: metric.name,
            metricValue: metric.value,
            metricDate: date,
          },
        });
        created.push(kpi);
      }
    }

    return {
      status: 'ok',
      processed: created.length,
      cops: cops.map((c) => ({ id: c.id, name: c.name })),
      date: payload.metricDate,
    };
  }

  /**
   * Determine which CoPs to attribute metrics to
   */
  private async getTargetCops(
    customerId: string,
    copId?: string,
    workspaceId?: string,
  ) {
    // Explicit CoP ID provided
    if (copId) {
      const cop = await this.prisma.cop.findUnique({ where: { id: copId } });
      return cop ? [cop] : [];
    }

    // Workspace ID provided - find mapped CoPs
    if (workspaceId) {
      const mappings = await this.prisma.workspaceMapping.findMany({
        where: { workspaceId, isActive: true },
        include: { cop: true },
      });
      const cops = mappings.map((m) => m.cop).filter(Boolean);
      if (cops.length > 0) return cops;
    }

    // Default: all active CoPs for customer
    return this.prisma.cop.findMany({
      where: { customerId, isActive: true },
    });
  }
}

