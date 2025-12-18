# Databricks Integration - CoP Operating System

## Overview

This CoP portal is **Databricks-native** - deeply integrated with the Databricks platform to provide:

- **Real-time usage metrics** from Databricks workspaces
- **Embedded DBSQL dashboards** for executive visibility
- **AI-powered insights** via Databricks Model Serving
- **Content deep-linking** to notebooks, repos, catalogs
- **Single source of truth** for CoP success tied to platform adoption

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CoP Portal (Frontend)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ CoP Dashboard│  │DBSQL Dashboards│ │  AI Advisor     │  │
│  │ (Analytics)  │  │  (Embedded)    │ │  (Powered by    │  │
│  │              │  │                │ │   Model Serving)│  │
│  └──────┬───────┘  └──────┬─────────┘ └────────┬─────────┘  │
└─────────┼──────────────────┼───────────────────┼────────────┘
          │                  │                   │
┌─────────▼──────────────────▼───────────────────▼────────────┐
│              CoP Portal Backend (NestJS)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Databricks Integration Layer                   │ │
│  │  • Service Principal Auth                             │ │
│  │  • Workspace API Client                               │ │
│  │  • DBSQL Query Execution                              │ │
│  │  • Model Serving Client                               │ │
│  │  • Usage Metrics Ingestion                            │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬───────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
┌─────────▼─────────┐    ┌──────────▼──────────┐
│ Databricks        │    │  PostgreSQL         │
│ Platform          │    │  (CoP Data)         │
│                   │    │                     │
│ • System Tables   │    │ • Integrations      │
│ • Model Serving   │    │ • KpiMetrics        │
│ • DBSQL           │    │ • ContentAssets     │
│ • Unity Catalog   │    │ • WorkspaceMappings │
└───────────────────┘    └─────────────────────┘
```

---

## Data Model

### 1. Integration Table

Stores connection details for each customer's Databricks setup.

```prisma
model Integration {
  id           String   @id @default(uuid())
  customerId   String
  type         String   // 'databricks', 'slack', 'teams'
  displayName  String
  config       Json     // See config structure below
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  customer Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  workspaces WorkspaceMapping[]

  @@index([customerId, type])
}
```

### 2. Workspace Mapping

For customers with multiple workspaces.

```prisma
model WorkspaceMapping {
  id             String   @id @default(uuid())
  integrationId  String
  copId          String?  // null = applies to whole customer
  workspaceUrl   String
  workspaceName  String?
  workspaceId    String?
  defaultCatalog String?
  defaultSchema  String?
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())

  integration Integration @relation(fields: [integrationId], references: [id], onDelete: Cascade)
  cop         Cop?        @relation(fields: [copId], references: [id])

  @@index([integrationId])
  @@index([copId])
}
```

### 3. Integration Config Structure (JSON)

```typescript
interface DatabricksIntegrationConfig {
  // Account-level
  account_id: string;
  account_console_url?: string;
  
  // Authentication
  auth_scheme: 'service_principal' | 'pat' | 'oauth';
  client_id?: string;           // For service principal
  client_secret?: string;       // Encrypted in production
  tenant_id?: string;           // Azure AD tenant
  token?: string;               // PAT (not recommended for prod)
  
  // Workspaces
  workspaces: Array<{
    url: string;                // https://xyz.cloud.databricks.com
    workspace_id: string;       // e.g., "1444828305810485"
    default_catalog?: string;   // e.g., "main"
    default_schema?: string;    // e.g., "cop_takeda"
    region?: string;
  }>;
  
  // Model Serving endpoints
  models?: {
    cop_advisor?: {
      serving_url: string;
      endpoint_name: string;
    };
    survey_summarizer?: {
      serving_url: string;
      endpoint_name: string;
    };
  };
  
  // Usage ingestion
  usage_collection?: {
    enabled: boolean;
    job_id?: string;            // Databricks job that pushes metrics
    frequency?: 'daily' | 'hourly';
  };
}
```

---

## Authentication Patterns

### Recommended: Service Principal (OAuth)

**Setup:**
1. Create service principal in Azure AD (for Azure Databricks) or Databricks account
2. Grant workspace access
3. Store credentials in secrets manager

**Token Generation:**
```typescript
async function getServicePrincipalToken(config: any): Promise<string> {
  const tokenUrl = `https://login.microsoftonline.com/${config.tenant_id}/oauth2/v2.0/token`;
  
  const response = await axios.post(tokenUrl, new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: config.client_id,
    client_secret: config.client_secret,
    scope: '2ff814a6-3304-4ab8-85cb-cd0e6f879c1d/.default', // Databricks scope
  }));
  
  return response.data.access_token;
}
```

### Alternative: Personal Access Token (PAT)

Simpler but less secure. Use only for dev/demo.

```typescript
const headers = {
  'Authorization': `Bearer ${config.token}`,
  'Content-Type': 'application/json',
};
```

---

## Integration Services

### 1. Databricks Client Service

Base service for all Databricks API calls.

```typescript
// backend/src/integrations/databricks/databricks-client.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class DatabricksClientService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get Databricks integration config for a customer
   */
  async getConfig(customerId: string): Promise<any> {
    const integration = await this.prisma.integration.findFirst({
      where: { customerId, type: 'databricks', isActive: true },
    });
    
    if (!integration) {
      throw new Error(`No Databricks integration for customer ${customerId}`);
    }
    
    return integration.config;
  }

  /**
   * Get workspace mapping for a CoP
   */
  async getWorkspaceForCop(copId: string) {
    const mapping = await this.prisma.workspaceMapping.findFirst({
      where: { copId, isActive: true },
      include: { integration: true },
    });
    
    if (mapping) return mapping;
    
    // Fallback: get customer-level workspace
    const cop = await this.prisma.cop.findUnique({
      where: { id: copId },
      select: { customerId: true },
    });
    
    const integration = await this.prisma.integration.findFirst({
      where: { customerId: cop.customerId, type: 'databricks' },
      include: { workspaces: true },
    });
    
    return integration?.workspaces[0];
  }

  /**
   * Get authenticated API client for a workspace
   */
  async getClient(workspaceUrl: string, config: any): Promise<AxiosInstance> {
    const token = await this.getToken(config);
    
    return axios.create({
      baseURL: workspaceUrl,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get access token (handles different auth schemes)
   */
  private async getToken(config: any): Promise<string> {
    if (config.auth_scheme === 'service_principal') {
      return this.getServicePrincipalToken(config);
    }
    
    if (config.token) {
      return config.token;
    }
    
    throw new Error('No valid authentication configured');
  }

  private async getServicePrincipalToken(config: any): Promise<string> {
    const tokenUrl = `https://login.microsoftonline.com/${config.tenant_id}/oauth2/v2.0/token`;
    
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.client_id,
        client_secret: config.client_secret,
        scope: '2ff814a6-3304-4ab8-85cb-cd0e6f879c1d/.default',
      }),
    );
    
    return response.data.access_token;
  }
}
```

### 2. DBSQL Query Service

Execute SQL queries against Databricks SQL warehouses.

```typescript
// backend/src/integrations/databricks/databricks-sql.service.ts
import { Injectable } from '@nestjs/common';
import { DatabricksClientService } from './databricks-client.service';

@Injectable()
export class DatabricksSqlService {
  constructor(private clientService: DatabricksClientService) {}

  /**
   * Execute a SQL query via DBSQL API
   */
  async executeQuery(
    copId: string,
    query: string,
    warehouseId?: string,
  ): Promise<any[]> {
    const workspace = await this.clientService.getWorkspaceForCop(copId);
    const config = workspace.integration.config;
    const client = await this.clientService.getClient(workspace.workspaceUrl, config);

    // Use default warehouse if not specified
    const wid = warehouseId || config.default_warehouse_id;

    // 1. Create statement execution
    const createResp = await client.post('/api/2.0/sql/statements/', {
      statement: query,
      warehouse_id: wid,
      wait_timeout: '30s',
    });

    const statementId = createResp.data.statement_id;

    // 2. Poll for results (simplified - real impl would use websocket or async polling)
    let result = createResp.data;
    while (result.status.state === 'PENDING' || result.status.state === 'RUNNING') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const statusResp = await client.get(`/api/2.0/sql/statements/${statementId}`);
      result = statusResp.data;
    }

    if (result.status.state === 'FAILED') {
      throw new Error(`Query failed: ${result.status.error.message}`);
    }

    // 3. Return rows
    return result.result?.data_array || [];
  }

  /**
   * Get DBU usage for a date range
   */
  async getDbuUsage(copId: string, startDate: Date, endDate: Date) {
    const query = `
      SELECT 
        usage_date,
        SUM(usage_quantity) as total_dbus
      FROM system.billing.usage
      WHERE usage_date BETWEEN '${startDate.toISOString().split('T')[0]}' 
        AND '${endDate.toISOString().split('T')[0]}'
      GROUP BY usage_date
      ORDER BY usage_date
    `;

    return this.executeQuery(copId, query);
  }

  /**
   * Get active users count
   */
  async getActiveUsers(copId: string, days: number = 30) {
    const query = `
      SELECT COUNT(DISTINCT user_identity.email) as active_users
      FROM system.access.audit
      WHERE event_date >= current_date() - ${days}
        AND action_name IN ('login', 'executeNotebook', 'executeSql')
    `;

    const result = await this.executeQuery(copId, query);
    return result[0]?.active_users || 0;
  }
}
```

### 3. Model Serving Service

Call Databricks Model Serving endpoints for AI features.

```typescript
// backend/src/integrations/databricks/databricks-model.service.ts
import { Injectable } from '@nestjs/common';
import { DatabricksClientService } from './databricks-client.service';

@Injectable()
export class DatabricksModelService {
  constructor(private clientService: DatabricksClientService) {}

  /**
   * Call a model serving endpoint
   */
  async callModel(
    copId: string,
    modelKey: string,
    payload: any,
  ): Promise<any> {
    const workspace = await this.clientService.getWorkspaceForCop(copId);
    const config = workspace.integration.config;
    const model = config.models?.[modelKey];

    if (!model?.serving_url) {
      throw new Error(`Model ${modelKey} not configured`);
    }

    const client = await this.clientService.getClient(workspace.workspaceUrl, config);

    const response = await client.post(model.serving_url, {
      inputs: [payload],
    });

    return response.data;
  }

  /**
   * Generate CoP advice using DBRX or similar model
   */
  async generateCopAdvice(copId: string, context: any): Promise<any> {
    const prompt = this.buildCopAdvisorPrompt(context);

    const response = await this.callModel(copId, 'cop_advisor', {
      messages: [
        {
          role: 'system',
          content: 'You are an expert Databricks Community of Practice advisor.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return this.parseCopAdvice(response);
  }

  /**
   * Summarize survey responses
   */
  async summarizeSurvey(copId: string, responses: string[]): Promise<any> {
    const prompt = `
      Analyze these survey responses and provide a summary:
      
      ${responses.map((r, i) => `${i + 1}. ${r}`).join('\n')}
      
      Provide:
      1. What's working well (3-5 themes)
      2. Areas for improvement (3-5 themes)
      3. Top 3 action items
      
      Format as JSON.
    `;

    const response = await this.callModel(copId, 'survey_summarizer', {
      prompt,
      max_tokens: 500,
    });

    return response;
  }

  private buildCopAdvisorPrompt(context: any): string {
    return `
      Given the following Community of Practice context, provide actionable recommendations:
      
      **CoP Details:**
      - Phase: ${context.phase}
      - Industry: ${context.industry}
      - Member Count: ${context.memberCount}
      - Active for: ${context.daysActive} days
      
      **Recent Metrics:**
      - MAP (Monthly Active Participants): ${context.map}
      - NPS: ${context.nps}
      - DBU Usage Trend: ${context.dbuTrend}
      - Survey Response Rate: ${context.surveyResponseRate}%
      
      **Recent Activity:**
      - Events in last 30 days: ${context.recentEvents}
      - Content engagement: ${context.contentEngagement}
      - Use cases launched: ${context.useCases}
      
      Provide recommendations in these areas:
      1. Next 3 sessions to schedule (with rationale)
      2. Content to prioritize
      3. Champions to recognize
      4. Quarterly roadmap suggestions
      
      Format as JSON with clear, actionable items.
    `;
  }

  private parseCopAdvice(response: any): any {
    // Parse model response and structure it
    // Handle different response formats from different models
    return response.choices?.[0]?.message?.content || response;
  }
}
```

### 4. Usage Ingestion Service

Receive and process usage metrics from Databricks jobs.

```typescript
// backend/src/integrations/databricks/databricks-usage.controller.ts
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { DatabricksUsageService } from './databricks-usage.service';

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

@Controller('integrations/databricks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DatabricksUsageController {
  constructor(private usageService: DatabricksUsageService) {}

  /**
   * Ingest usage metrics from Databricks job
   * 
   * Called by a scheduled Databricks job that reads system tables
   * and pushes aggregated metrics to the portal.
   */
  @Post('usage')
  @Roles('admin', 'databricks_internal', 'system')
  async ingestUsage(@Body() payload: UsagePayload) {
    return this.usageService.ingestMetrics(payload);
  }
}
```

```typescript
// backend/src/integrations/databricks/databricks-usage.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DatabricksUsageService {
  constructor(private prisma: PrismaService) {}

  async ingestMetrics(payload: any) {
    const date = new Date(payload.metricDate);
    
    // Determine which CoP(s) to attribute metrics to
    const cops = await this.getTargetCops(
      payload.customerId,
      payload.copId,
      payload.workspaceId,
    );

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
      cops: cops.map((c) => c.id),
    };
  }

  private async getTargetCops(
    customerId: string,
    copId?: string,
    workspaceId?: string,
  ) {
    if (copId) {
      const cop = await this.prisma.cop.findUnique({ where: { id: copId } });
      return cop ? [cop] : [];
    }

    if (workspaceId) {
      const mappings = await this.prisma.workspaceMapping.findMany({
        where: { workspaceId, isActive: true },
        include: { cop: true },
      });
      return mappings.map((m) => m.cop).filter(Boolean);
    }

    // Default: all active CoPs for customer
    return this.prisma.cop.findMany({
      where: { customerId, isActive: true },
    });
  }
}
```

---

## Databricks Job for Usage Collection

This job runs daily on Databricks and pushes metrics to the portal.

### Python Notebook (PySpark + REST API)

```python
# Databricks notebook: daily_cop_usage_collection
# Schedule: Daily at 2 AM UTC

from datetime import date, timedelta
from pyspark.sql import functions as F
import requests
import os

# Configuration
PORTAL_API_URL = dbutils.secrets.get("cop-portal", "api-url")
PORTAL_API_TOKEN = dbutils.secrets.get("cop-portal", "api-token")
CUSTOMER_ID = dbutils.widgets.get("customer_id")  # e.g., "takeda-001"
COP_ID = dbutils.widgets.get("cop_id")  # Optional, e.g., "takeda-cop-001"

# Date range (yesterday)
metric_date = (date.today() - timedelta(days=1)).isoformat()

# ============================================================================
# 1. DBU Usage
# ============================================================================
dbu_df = spark.table("system.billing.usage") \
    .filter(F.col("usage_date") == metric_date) \
    .groupBy("workspace_id") \
    .agg(F.sum("usage_quantity").alias("total_dbus"))

total_dbus = dbu_df.agg(F.sum("total_dbus")).collect()[0][0] or 0.0

# ============================================================================
# 2. Active Users (last 30 days)
# ============================================================================
active_users_df = spark.table("system.access.audit") \
    .filter(F.col("event_date") >= F.date_sub(F.current_date(), 30)) \
    .filter(F.col("action_name").isin(["login", "runCommand", "executeSql"])) \
    .select("user_identity.email") \
    .distinct()

active_users_count = active_users_df.count()

# ============================================================================
# 3. Jobs Run
# ============================================================================
jobs_df = spark.table("system.lakeflow.jobs") \
    .filter(F.col("start_time") >= F.lit(metric_date)) \
    .filter(F.col("start_time") < F.date_add(F.lit(metric_date), 1))

jobs_count = jobs_df.count()

# ============================================================================
# 4. DBSQL Queries Executed
# ============================================================================
queries_df = spark.table("system.query.history") \
    .filter(F.col("start_time") >= F.lit(metric_date)) \
    .filter(F.col("start_time") < F.date_add(F.lit(metric_date), 1))

queries_count = queries_df.count()

# ============================================================================
# 5. Model Serving Requests
# ============================================================================
try:
    serving_df = spark.table("system.serving.requests") \
        .filter(F.col("date") == metric_date)
    serving_requests = serving_df.count()
except:
    serving_requests = 0

# ============================================================================
# Push to CoP Portal
# ============================================================================
payload = {
    "customerId": CUSTOMER_ID,
    "copId": COP_ID if COP_ID else None,
    "metricDate": metric_date,
    "metrics": [
        {"name": "DBU", "value": float(total_dbus)},
        {"name": "ACTIVE_USERS", "value": int(active_users_count)},
        {"name": "JOBS_RUN", "value": int(jobs_count)},
        {"name": "QUERIES_EXECUTED", "value": int(queries_count)},
        {"name": "MODEL_REQUESTS", "value": int(serving_requests)},
    ],
}

response = requests.post(
    f"{PORTAL_API_URL}/api/v1/integrations/databricks/usage",
    json=payload,
    headers={
        "Authorization": f"Bearer {PORTAL_API_TOKEN}",
        "Content-Type": "application/json",
    },
)

print(f"Status: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 200:
    print(f"✅ Successfully pushed {len(payload['metrics'])} metrics for {metric_date}")
else:
    raise Exception(f"Failed to push metrics: {response.text}")
```

### Job Configuration (JSON)

```json
{
  "name": "CoP Portal - Daily Usage Collection",
  "tasks": [
    {
      "task_key": "collect_usage",
      "notebook_task": {
        "notebook_path": "/Shared/CoP/daily_cop_usage_collection",
        "base_parameters": {
          "customer_id": "takeda-001",
          "cop_id": "takeda-cop-001"
        }
      },
      "existing_cluster_id": "{{cluster_id}}",
      "timeout_seconds": 3600
    }
  ],
  "schedule": {
    "quartz_cron_expression": "0 0 2 * * ?",
    "timezone_id": "UTC"
  },
  "max_concurrent_runs": 1
}
```

---

## DBSQL Dashboard Embedding

### 1. Store Dashboard as Content Asset

```typescript
await prisma.contentAsset.create({
  data: {
    copId: 'takeda-cop-001',
    title: 'Takeda Platform Usage Dashboard',
    description: 'Executive view of Databricks adoption metrics',
    url: 'https://e2-demo.cloud.databricks.com/sql/dashboards/abc123',
    assetType: 'dbsql_dashboard',
    skillLevel: 'beginner',
    personaTag: 'Exec',
    tags: ['usage', 'kpi', 'executive'],
    createdById: user.id,
  },
});
```

### 2. Frontend Rendering

Update `CopContent.tsx`:

```typescript
{asset.assetType === "dbsql_dashboard" ? (
  <div className="rounded-lg border bg-white p-4 space-y-3">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          {asset.title}
        </h3>
        {asset.description && (
          <p className="text-xs text-slate-600 mt-1">{asset.description}</p>
        )}
      </div>
      <a
        href={asset.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-600 hover:underline"
      >
        Open in Databricks →
      </a>
    </div>
    
    {/* Embedded iframe (if CSP allows) */}
    <div className="relative h-96 rounded border overflow-hidden">
      <iframe
        src={`${asset.url}?embedded=true`}
        className="absolute inset-0 w-full h-full"
        frameBorder="0"
        loading="lazy"
      />
    </div>
    
    {/* Fallback if embedding fails */}
    <noscript>
      <a
        href={asset.url}
        className="block text-center py-8 text-sm text-blue-600 hover:underline"
      >
        View Dashboard in Databricks
      </a>
    </noscript>
  </div>
) : (
  // Regular content card
  ...
)}
```

### 3. CSP Configuration

If embedding dashboards, configure Content Security Policy:

```typescript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "frame-src 'self' https://*.cloud.databricks.com https://*.azuredatabricks.net",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};
```

---

## AI Features via Model Serving

### Update AI Service to use Databricks

```typescript
// backend/src/ai/ai.service.ts
import { Injectable } from '@nestjs/common';
import { DatabricksModelService } from '../integrations/databricks/databricks-model.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(
    private databricksModel: DatabricksModelService,
    private prisma: PrismaService,
  ) {}

  async generateCopAdvice(copId: string): Promise<any> {
    // 1. Gather context
    const context = await this.gatherCopContext(copId);

    // 2. Call Databricks Model Serving
    const advice = await this.databricksModel.generateCopAdvice(copId, context);

    // 3. Cache result
    await this.prisma.aiSummary.upsert({
      where: {
        entityType_entityId_summaryType: {
          entityType: 'cop',
          entityId: copId,
          summaryType: 'advisor_recommendations',
        },
      },
      create: {
        entityType: 'cop',
        entityId: copId,
        summaryType: 'advisor_recommendations',
        content: advice,
        model: 'dbrx-instruct',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      update: {
        content: advice,
        createdAt: new Date(),
      },
    });

    return advice;
  }

  async summarizeSurvey(surveyId: string): Promise<any> {
    // 1. Get free-text responses
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        cop: true,
        responses: {
          include: {
            answers: { include: { question: true } },
          },
        },
      },
    });

    const freeTextAnswers = survey.responses
      .flatMap((r) => r.answers)
      .filter((a) => a.question.questionType === 'free_text')
      .map((a) => a.answerValue);

    if (freeTextAnswers.length === 0) {
      return { working_well: [], opportunities: [], top_actions: [] };
    }

    // 2. Call Databricks Model Serving
    const summary = await this.databricksModel.summarizeSurvey(
      survey.copId,
      freeTextAnswers,
    );

    // 3. Cache result
    await this.prisma.aiSummary.upsert({
      where: {
        entityType_entityId_summaryType: {
          entityType: 'survey',
          entityId: surveyId,
          summaryType: 'survey_feedback',
        },
      },
      create: {
        entityType: 'survey',
        entityId: surveyId,
        summaryType: 'survey_feedback',
        content: summary,
        model: 'dbrx-instruct',
      },
      update: {
        content: summary,
        createdAt: new Date(),
      },
    });

    return summary;
  }

  private async gatherCopContext(copId: string) {
    const cop = await this.prisma.cop.findUnique({
      where: { id: copId },
      include: {
        customer: true,
        memberships: true,
        events: { take: 10, orderBy: { startsAt: 'desc' } },
      },
    });

    const kpis = await this.prisma.kpiMetric.findMany({
      where: { copId },
      orderBy: { metricDate: 'desc' },
      take: 30,
    });

    const surveys = await this.prisma.survey.findMany({
      where: { copId },
      include: { responses: true },
    });

    const useCases = await this.prisma.useCase.findMany({
      where: { copId },
    });

    // Calculate trends
    const mapValues = kpis
      .filter((k) => k.metricName === 'MAP')
      .map((k) => k.metricValue);
    const dbuValues = kpis
      .filter((k) => k.metricName === 'DBU')
      .map((k) => k.metricValue);

    return {
      phase: cop.phase,
      industry: cop.customer.industry,
      memberCount: cop.memberships.length,
      daysActive: Math.floor(
        (Date.now() - cop.startDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
      map: mapValues[0] || 0,
      nps:
        kpis.find((k) => k.metricName === 'NPS')?.metricValue || 0,
      dbuTrend: dbuValues.length > 1 ? 'growing' : 'stable',
      surveyResponseRate:
        surveys.reduce((sum, s) => sum + s.responses.length, 0) /
        Math.max(surveys.length * 10, 1),
      recentEvents: cop.events.length,
      contentEngagement: 'moderate', // TODO: calculate from ContentEngagement table
      useCases: useCases.length,
    };
  }
}
```

---

## Module Integration

Update `app.module.ts` to wire everything together:

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { CopsModule } from './cops/cops.module';
import { EventsModule } from './events/events.module';
import { ContentModule } from './content/content.module';
import { SurveysModule } from './surveys/surveys.module';
import { KpisModule } from './kpis/kpis.module';
import { UsecasesModule } from './usecases/usecases.module';
import { ChampionsModule } from './champions/champions.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { AiModule } from './ai/ai.module';
import { DatabricksModule } from './integrations/databricks/databricks.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CustomersModule,
    CopsModule,
    EventsModule,
    ContentModule,
    SurveysModule,
    KpisModule,
    UsecasesModule,
    ChampionsModule,
    DiscussionsModule,
    AiModule,
    DatabricksModule, // ← New!
  ],
})
export class AppModule {}
```

---

## Summary: What Makes This Databricks-Native

| Feature | Traditional Portal | Databricks-Native CoP OS |
|---------|-------------------|--------------------------|
| **Usage Metrics** | Manual entry | Auto-synced from system tables |
| **Analytics** | Generic charts | Embedded DBSQL dashboards |
| **AI Features** | External LLM API | Databricks Model Serving (DBRX) |
| **Content** | Static links | Deep links to notebooks, catalogs |
| **Authentication** | Separate login | Service principal integration |
| **Data Source** | Portal DB only | Portal DB + Databricks as co-pilot |
| **Value Proposition** | CoP management | CoP + Platform adoption in one view |

---

## Next Steps

1. **Add schema extensions** to `schema.prisma`
2. **Implement Databricks modules** in backend
3. **Create Databricks job** for usage collection
4. **Update AI service** to use Model Serving
5. **Test end-to-end** with a real workspace
6. **Document setup** for new customers

**This is now a true "CoP Operating System" powered by Databricks!** 🚀


