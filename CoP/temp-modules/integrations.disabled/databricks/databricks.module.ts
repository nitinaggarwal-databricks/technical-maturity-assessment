import { Module } from '@nestjs/common';
import { DatabricksClientService } from './databricks-client.service';
import { DatabricksSqlService } from './databricks-sql.service';
import { DatabricksModelService } from './databricks-model.service';
import { DatabricksUsageController } from './databricks-usage.controller';
import { DatabricksUsageService } from './databricks-usage.service';

/**
 * Databricks Integration Module
 * 
 * Provides all Databricks-native features:
 * - Workspace API client
 * - DBSQL query execution
 * - Model Serving for AI
 * - Usage metrics ingestion
 */
@Module({
  controllers: [DatabricksUsageController],
  providers: [
    DatabricksClientService,
    DatabricksSqlService,
    DatabricksModelService,
    DatabricksUsageService,
  ],
  exports: [
    DatabricksClientService,
    DatabricksSqlService,
    DatabricksModelService,
    DatabricksUsageService,
  ],
})
export class DatabricksModule {}

