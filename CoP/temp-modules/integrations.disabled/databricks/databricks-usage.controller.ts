import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { DatabricksUsageService } from './databricks-usage.service';

/**
 * Usage Payload from Databricks job
 */
interface UsagePayload {
  customerId: string;
  copId?: string;
  workspaceId?: string;
  metricDate: string; // YYYY-MM-DD
  metrics: Array<{
    name: string;
    value: number;
    metadata?: any;
  }>;
}

/**
 * Databricks Usage Controller
 * 
 * Receives usage metrics from Databricks jobs.
 * Endpoint is called by scheduled Databricks jobs that read system tables.
 */
@Controller('integrations/databricks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DatabricksUsageController {
  constructor(private usageService: DatabricksUsageService) {}

  /**
   * Ingest usage metrics from Databricks job
   * 
   * POST /api/v1/integrations/databricks/usage
   * 
   * Body:
   * {
   *   "customerId": "takeda-001",
   *   "copId": "takeda-cop-001",
   *   "metricDate": "2024-01-15",
   *   "metrics": [
   *     { "name": "DBU", "value": 1234.56 },
   *     { "name": "ACTIVE_USERS", "value": 42 },
   *     { "name": "JOBS_RUN", "value": 156 }
   *   ]
   * }
   */
  @Post('usage')
  @Roles('admin', 'databricks_internal', 'system')
  async ingestUsage(@Body() payload: UsagePayload) {
    return this.usageService.ingestMetrics(payload);
  }
}

