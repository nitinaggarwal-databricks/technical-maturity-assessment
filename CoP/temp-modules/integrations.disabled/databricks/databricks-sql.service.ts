import { Injectable } from '@nestjs/common';
import { DatabricksClientService } from './databricks-client.service';

/**
 * Databricks SQL Service
 * 
 * Execute SQL queries against Databricks SQL warehouses.
 * Useful for querying system tables, usage data, and custom analytics.
 */
@Injectable()
export class DatabricksSqlService {
  constructor(private clientService: DatabricksClientService) {}

  /**
   * Execute a SQL query via DBSQL Statement Execution API
   */
  async executeQuery(
    copId: string,
    query: string,
    warehouseId?: string,
  ): Promise<any[]> {
    const workspace = await this.clientService.getWorkspaceForCop(copId);
    const config = workspace.integration.config;
    const client = await this.clientService.getClient(
      workspace.workspaceUrl,
      config,
    );

    // Use default warehouse if not specified
    const wid = warehouseId || config.default_warehouse_id;

    if (!wid) {
      throw new Error('No warehouse ID configured');
    }

    // 1. Create statement execution
    const createResp = await client.post('/api/2.0/sql/statements/', {
      statement: query,
      warehouse_id: wid,
      wait_timeout: '30s',
    });

    const statementId = createResp.data.statement_id;
    let result = createResp.data;

    // 2. Poll for results if not immediately available
    let attempts = 0;
    const maxAttempts = 30;

    while (
      (result.status.state === 'PENDING' || result.status.state === 'RUNNING') &&
      attempts < maxAttempts
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const statusResp = await client.get(
        `/api/2.0/sql/statements/${statementId}`,
      );
      result = statusResp.data;
      attempts++;
    }

    if (result.status.state === 'FAILED') {
      throw new Error(`Query failed: ${result.status.error?.message}`);
    }

    if (result.status.state === 'CANCELED') {
      throw new Error('Query was canceled');
    }

    // 3. Return rows
    return result.result?.data_array || [];
  }

  /**
   * Get DBU usage for a date range
   */
  async getDbuUsage(copId: string, startDate: Date, endDate: Date) {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    const query = `
      SELECT 
        usage_date,
        SUM(usage_quantity) as total_dbus
      FROM system.billing.usage
      WHERE usage_date BETWEEN '${start}' AND '${end}'
      GROUP BY usage_date
      ORDER BY usage_date
    `;

    return this.executeQuery(copId, query);
  }

  /**
   * Get active users count for last N days
   */
  async getActiveUsers(copId: string, days: number = 30) {
    const query = `
      SELECT COUNT(DISTINCT user_identity.email) as active_users
      FROM system.access.audit
      WHERE event_date >= current_date() - ${days}
        AND action_name IN ('login', 'runCommand', 'executeSql', 'createNotebook')
    `;

    const result = await this.executeQuery(copId, query);
    return result[0]?.active_users || 0;
  }

  /**
   * Get job run statistics
   */
  async getJobStats(copId: string, days: number = 30) {
    const query = `
      SELECT 
        COUNT(*) as total_runs,
        SUM(CASE WHEN run_result_state = 'SUCCESS' THEN 1 ELSE 0 END) as successful_runs,
        SUM(CASE WHEN run_result_state = 'FAILED' THEN 1 ELSE 0 END) as failed_runs
      FROM system.lakeflow.jobs
      WHERE start_time >= current_date() - ${days}
    `;

    const result = await this.executeQuery(copId, query);
    return result[0] || {};
  }

  /**
   * Get DBSQL query statistics
   */
  async getQueryStats(copId: string, days: number = 30) {
    const query = `
      SELECT 
        COUNT(*) as total_queries,
        COUNT(DISTINCT user_id) as unique_users,
        AVG(execution_duration) as avg_duration_ms
      FROM system.query.history
      WHERE start_time >= current_date() - ${days}
    `;

    const result = await this.executeQuery(copId, query);
    return result[0] || {};
  }
}

