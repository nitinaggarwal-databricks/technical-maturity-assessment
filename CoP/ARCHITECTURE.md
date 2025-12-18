# CoP Launch Portal - Complete Architecture

## Table of Contents
1. [System Overview](#system-overview)
2. [Tech Stack](#tech-stack)
3. [Authentication & Authorization](#authentication--authorization)
4. [Multi-Tenancy](#multi-tenancy)
5. [Backend Modules](#backend-modules)
6. [Frontend Structure](#frontend-structure)
7. [Databricks Integration](#databricks-integration)
8. [AI Features](#ai-features)
9. [Notifications](#notifications)
10. [DevOps & Deployment](#devops--deployment)

---

## System Overview

```
┌────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                      │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Web App     │  │  Mobile App  │  │  Databricks     │  │
│  │  (Next.js)   │  │  (Future)    │  │  Notebooks      │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘  │
└─────────┼──────────────────┼───────────────────┼───────────┘
          │                  │                   │
          └──────────────────┴───────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │   (NestJS)      │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
   ┌──────▼──────┐  ┌────────▼────────┐  ┌─────▼─────┐
   │  PostgreSQL │  │   Redis Cache   │  │   S3      │
   │  (Primary)  │  │   (Sessions)    │  │ (Assets)  │
   └─────────────┘  └─────────────────┘  └───────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
   ┌──────▼──────┐  ┌────────▼────────┐  ┌─────▼──────┐
   │ Databricks  │  │  Slack/Teams    │  │   Email    │
   │ Workspaces  │  │  Webhooks       │  │ (SendGrid) │
   └─────────────┘  └─────────────────┘  └────────────┘
```

---

## Tech Stack

### Backend
- **Framework**: NestJS 10 (TypeScript)
- **ORM**: Prisma 5
- **Database**: PostgreSQL 16
- **Cache**: Redis (optional, for sessions/rate limiting)
- **Auth**: JWT + NextAuth.js integration
- **Validation**: class-validator, class-transformer
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3
- **Components**: shadcn/ui + Radix Primitives
- **State**: TanStack Query (React Query)
- **Auth**: NextAuth.js
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

### Infrastructure
- **Container**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: 
  - Backend: AWS ECS / GCP Cloud Run / Render
  - Frontend: Vercel / Netlify
  - Database: AWS RDS / GCP Cloud SQL
- **Monitoring**: Datadog / Sentry
- **Secrets**: AWS Secrets Manager / GCP Secret Manager

---

## Authentication & Authorization

### Auth Flow

```
┌──────────┐                 ┌──────────┐                 ┌──────────┐
│  Client  │                 │ NextAuth │                 │  Backend │
└────┬─────┘                 └────┬─────┘                 └────┬─────┘
     │                            │                            │
     │  1. Login (OAuth)          │                            │
     ├───────────────────────────>│                            │
     │                            │                            │
     │  2. Redirect to provider   │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
     │  3. Callback with code     │                            │
     ├───────────────────────────>│                            │
     │                            │                            │
     │                            │  4. Sync user              │
     │                            ├───────────────────────────>│
     │                            │                            │
     │                            │  5. Return user + metadata │
     │                            │<───────────────────────────┤
     │                            │                            │
     │  6. JWT token              │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
     │  7. API calls with Bearer  │                            │
     ├────────────────────────────┼───────────────────────────>│
     │                            │                            │
```

### JWT Payload Structure

```typescript
{
  sub: "user-uuid",           // User ID
  email: "user@company.com",
  name: "John Doe",
  roles: ["customer_member"], // RBAC roles
  customerIds: ["cust-1"],    // Multi-tenant access
  isAdmin: false,
  iat: 1234567890,
  exp: 1234567890
}
```

### Role Hierarchy

| Role | Description | Access Level |
|------|-------------|--------------|
| `admin` | Platform admin | All customers, all features |
| `databricks_internal` | Databricks employee (SA, CSM) | All customers, internal features |
| `customer_exec` | Customer executive sponsor | Their customer's CoPs (admin) |
| `customer_member` | CoP member | Their CoPs (read + participate) |

### Guards Implementation

**1. JwtAuthGuard** - Validates JWT token
```typescript
@UseGuards(JwtAuthGuard)
@Get()
findAll(@Req() req) {
  const user = req.user; // JWT payload
}
```

**2. RolesGuard** - Enforces role-based access
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'databricks_internal')
@Post()
create() { ... }
```

**3. TenantGuard** - Enforces multi-tenant isolation
```typescript
// In service layer:
this.tenantGuard.enforceCustomerAccess(user, cop.customerId);
```

---

## Multi-Tenancy

### Design Principles

1. **Customer Isolation**: Each CoP belongs to one customer
2. **Row-Level Security**: Filter queries by `customerId`
3. **Bypass for Internal**: Databricks employees see all customers
4. **Explicit Grants**: Customer users have `customerIds[]` in JWT

### Implementation Pattern

```typescript
// Service method example
async findCops(user: any) {
  const where: any = { isActive: true };
  
  // Multi-tenant filter
  if (!user.isAdmin && !user.roles?.includes('databricks_internal')) {
    where.customerId = { in: user.customerIds ?? [] };
  }
  
  return this.prisma.cop.findMany({ where });
}
```

### Database Schema

```sql
-- Every tenant-specific table has customerId
CREATE TABLE cops (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id),
  ...
);

CREATE INDEX idx_cops_customer ON cops(customer_id);
```

---

## Backend Modules

### Core Modules

| Module | Endpoints | Description |
|--------|-----------|-------------|
| **Auth** | `/auth/*` | Login, logout, user sync |
| **Customers** | `/customers/*` | Customer management |
| **CoPs** | `/cops/*` | CoP lifecycle management |
| **Users** | `/users/*` | User management |
| **Memberships** | `/cops/:id/members` | CoP membership management |
| **Events** | `/events/*` | Event scheduling & attendance |
| **Content** | `/content/*` | Content library management |
| **Surveys** | `/surveys/*` | Survey creation & responses |
| **KPIs** | `/cops/:id/kpis/*` | KPI metrics & analytics |
| **UseCases** | `/cops/:id/usecases` | Success stories |
| **Champions** | `/cops/:id/champions` | Recognition & awards |
| **Discussions** | `/cops/:id/discussions` | Q&A threads |
| **Integrations** | `/integrations/*` | External integrations |
| **AI** | `/cops/:id/ai/*` | AI-powered features |
| **Notifications** | `/notifications/*` | User notifications |
| **Admin** | `/admin/*` | Admin operations |

### Key Endpoint Examples

**CoPs Module**
```
GET    /cops                  # List CoPs (multi-tenant filtered)
POST   /cops                  # Create CoP
GET    /cops/:id              # Get CoP details
PATCH  /cops/:id              # Update CoP
DELETE /cops/:id              # Soft delete CoP
GET    /cops/:id/events       # List CoP events
GET    /cops/:id/kpis/series  # Get KPI time series
```

**Events Module**
```
GET    /events/:id            # Get event
PATCH  /events/:id            # Update event
POST   /events/:id/register   # Register for event
POST   /events/:id/attendance # Import attendance data
```

**Discussions Module**
```
GET    /cops/:copId/discussions         # List threads
POST   /cops/:copId/discussions         # Create thread
GET    /discussions/:threadId           # Get thread + replies
POST   /discussions/:threadId/replies   # Add reply
```

**AI Module**
```
POST   /cops/:copId/ai/advice           # Generate CoP advice
POST   /surveys/:surveyId/ai/summary    # Summarize survey
```

---

## Frontend Structure

### App Router Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout (auth provider)
│   ├── page.tsx                # Home
│   ├── cops/
│   │   ├── page.tsx            # CoP list
│   │   └── [copId]/
│   │       └── page.tsx        # CoP dashboard (tabs)
│   ├── events/
│   │   └── [eventId]/
│   │       └── page.tsx        # Event detail
│   ├── surveys/
│   │   └── [surveyId]/
│   │       └── page.tsx        # Survey form
│   ├── admin/
│   │   ├── page.tsx            # Admin dashboard
│   │   ├── cops/page.tsx       # CoP management
│   │   ├── users/page.tsx      # User management
│   │   └── integrations/page.tsx
│   └── api/
│       └── auth/[...nextauth]/route.ts  # NextAuth config
├── components/
│   ├── cop/
│   │   ├── CopOverview.tsx
│   │   ├── CopContent.tsx
│   │   ├── CopSurveys.tsx
│   │   ├── CopAnalytics.tsx
│   │   └── CopCommunity.tsx
│   ├── surveys/
│   │   └── SurveyPageClient.tsx
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── api.ts                  # API client
│   ├── queryClient.ts          # React Query setup
│   └── auth.ts                 # NextAuth config
└── styles/
    └── globals.css
```

### Key UI Pages

**CoP Dashboard** (`/cops/[copId]`)
- **Overview Tab**: Mission, phase, upcoming events
- **Content Tab**: Asset library (decks, videos, courses)
- **Surveys Tab**: Feedback forms
- **Analytics Tab**: KPI charts (MAP, NPS)
- **Community Tab**: Success stories, champions

**Admin Portal** (`/admin/*`)
- CoP management table
- User management & role assignment
- Integration configuration
- Platform analytics

---

## Databricks Integration

### Integration Model

```typescript
model Integration {
  id: string;
  customerId: string;
  type: 'databricks' | 'slack' | 'teams';
  displayName: string;
  config: {
    workspace_url: string;
    auth_type: 'pat' | 'oauth';
    token?: string;
    default_catalog?: string;
  };
}
```

### Use Cases

**1. DBSQL Dashboard Embedding**
```typescript
// Store dashboard as ContentAsset
{
  assetType: 'dbsql_dashboard',
  url: 'https://xyz.cloud.databricks.com/sql/dashboards/abc123'
}

// Frontend renders in iframe
<iframe src={dashboard.url} className="w-full h-96" />
```

**2. Usage Metrics Collection**
```typescript
// Periodic job (cron) hits Databricks System Tables
async function collectUsageMetrics(customerId: string) {
  const config = await getDbConfig(customerId);
  
  // Query system.billing.usage
  const dbus = await queryDbsql(config, `
    SELECT sum(usage_quantity) as dbus
    FROM system.billing.usage
    WHERE usage_date >= current_date() - 30
  `);
  
  // Write to KpiMetric
  await prisma.kpiMetric.create({
    data: {
      copId: cop.id,
      metricName: 'DBU',
      metricValue: dbus,
      metricDate: new Date(),
    },
  });
}
```

**3. Notebook Execution**
```typescript
// Trigger a Databricks job to generate reports
async function runCopReportJob(copId: string) {
  const config = await getDbConfig(cop.customerId);
  
  const response = await fetch(
    `${config.workspace_url}/api/2.1/jobs/run-now`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.token}` },
      body: JSON.stringify({ job_id: 12345, parameters: { cop_id: copId } }),
    }
  );
}
```

**4. Model Serving for AI**
```typescript
// Use Databricks Model Serving for LLM inference
async function callDbrxModel(prompt: string) {
  const config = await getDbConfig(customerId);
  
  const response = await fetch(
    `${config.workspace_url}/serving-endpoints/dbrx-instruct/invocations`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      }),
    }
  );
  
  return response.json();
}
```

---

## AI Features

### 1. CoP Advisor

**Endpoint**: `POST /cops/:copId/ai/advice`

**Input**: CoP context (KPIs, events, surveys, use cases)

**Output**:
```json
{
  "next_sessions": [
    "Advanced Unity Catalog patterns",
    "GenAI workshop",
    "Delta Live Tables deep dive"
  ],
  "content_to_highlight": [
    "Data Engineering track",
    "Governance guide"
  ],
  "champions_to_recognize": ["Top contributor Q4"],
  "roadmap": {
    "Q1": "Foundation (governance)",
    "Q2": "Enablement (training)",
    "Q3": "Adoption (use cases)",
    "Q4": "Optimization"
  }
}
```

**Implementation**:
```typescript
const context = await gatherCopContext(copId);
const advice = await callLLM({
  system: "You are a Databricks CoP expert advisor...",
  user: JSON.stringify(context),
});
```

### 2. Survey Summarization

**Endpoint**: `POST /surveys/:surveyId/ai/summary`

**Input**: All free-text survey responses

**Output**:
```json
{
  "working_well": ["Clear demos", "Good pace"],
  "opportunities": ["More hands-on time", "Advanced topics"],
  "top_actions": [
    "Add 30min lab time",
    "Create advanced track",
    "Share recordings"
  ]
}
```

### 3. Newsletter Generation

**Endpoint**: `POST /cops/:copId/ai/newsletter`

**Input**: Recent events, new content, champions

**Output**: Draft email with formatted sections

### AI Provider Options

| Provider | Pros | Cons |
|----------|------|------|
| **Databricks Model Serving** | Native integration, cost-effective, DBRX/Mixtral | Requires setup |
| **OpenAI** | Easy, high quality | External dependency, cost |
| **Azure OpenAI** | Enterprise-ready | Complex setup |
| **Google Gemini** | Good quality, affordable | External dependency |

---

## Notifications

### Notification Types

| Type | Trigger | Recipients |
|------|---------|------------|
| `event_created` | New event scheduled | CoP members |
| `survey_published` | Survey goes live | Event attendees |
| `champion_recognized` | New champion award | Champion + CoP |
| `use_case_shared` | New success story | CoP members |
| `cop_phase_change` | Phase transition | Execs + SA |

### Channels

**1. In-App Notifications**
```typescript
// Create notification
await prisma.notification.create({
  data: {
    userId: user.id,
    type: 'event_created',
    title: 'New session scheduled',
    body: `${event.title} on ${event.startsAt}`,
    relatedType: 'event',
    relatedId: event.id,
  },
});

// Frontend polls or websocket
GET /notifications?unread=true
```

**2. Email**
```typescript
// SendGrid example
await sendEmail({
  to: user.email,
  templateId: 'event-created',
  dynamicData: {
    event_title: event.title,
    event_url: `https://cop-portal.com/events/${event.id}`,
  },
});
```

**3. Slack/Teams**
```typescript
// Post to webhook
const integration = await getIntegration(cop.customerId, 'slack');
await fetch(integration.config.webhookUrl, {
  method: 'POST',
  body: JSON.stringify({
    text: `🎉 New session: ${event.title}`,
    attachments: [{ /* rich formatting */ }],
  }),
});
```

**4. Calendar Invites**
```typescript
// Generate .ics file
const ics = generateIcsFile(event);
await sendEmail({
  to: user.email,
  subject: event.title,
  attachments: [{ filename: 'event.ics', content: ics }],
});
```

---

## DevOps & Deployment

### Environments

| Environment | Purpose | Infra |
|-------------|---------|-------|
| **local** | Development | Docker Compose |
| **dev** | Continuous testing | Shared staging |
| **staging** | Pre-production | Production-like |
| **prod** | Live customers | Full scale |

### CI/CD Pipeline

**Pull Request**:
1. Run lint
2. Run tests
3. Build check
4. Preview deploy (frontend)

**Main Branch**:
1. All PR checks
2. Build Docker images
3. Push to registry
4. Deploy to staging
5. Run smoke tests
6. Manual approval
7. Deploy to production

### Deployment Architecture

**Backend (NestJS)**
```yaml
# ECS Task Definition example
{
  "family": "cop-portal-backend",
  "containerDefinitions": [{
    "name": "api",
    "image": "registry/cop-backend:latest",
    "portMappings": [{ "containerPort": 4000 }],
    "environment": [
      { "name": "NODE_ENV", "value": "production" },
      { "name": "DATABASE_URL", "valueFrom": "arn:aws:ssm:..." }
    ],
    "healthCheck": {
      "command": ["CMD-SHELL", "curl -f http://localhost:4000/health || exit 1"]
    }
  }]
}
```

**Frontend (Next.js)**
```bash
# Vercel deployment
vercel --prod

# Or static export
npm run build
aws s3 sync out/ s3://cop-portal-frontend/
```

### Monitoring

**Logs**: CloudWatch / GCP Logging  
**Metrics**: Datadog / Prometheus  
**Errors**: Sentry  
**Uptime**: Pingdom / UptimeRobot  

### Database Migrations

```bash
# Generate migration
npx prisma migrate dev --name add_integrations

# Deploy to production
npx prisma migrate deploy
```

### Secrets Management

```bash
# AWS Secrets Manager
DATABASE_URL=$(aws secretsmanager get-secret-value --secret-id cop-portal/db-url --query SecretString --output text)

# GCP Secret Manager
gcloud secrets versions access latest --secret="cop-portal-db-url"
```

---

## Security Checklist

- [ ] JWT secrets rotated regularly
- [ ] Database credentials in secrets manager
- [ ] HTTPS enforced (TLS 1.3)
- [ ] CORS configured properly
- [ ] Rate limiting on API (express-rate-limit)
- [ ] SQL injection protected (Prisma ORM)
- [ ] XSS protected (React escaping)
- [ ] CSRF tokens for mutations
- [ ] Audit logging for sensitive actions
- [ ] Multi-tenant isolation tested
- [ ] Role-based access enforced
- [ ] Integration tokens encrypted at rest
- [ ] No sensitive data in logs
- [ ] Security headers (Helmet.js)
- [ ] Dependency scanning (Dependabot)

---

## Performance Optimization

**Backend**:
- [ ] Database indexes on foreign keys
- [ ] Connection pooling (Prisma)
- [ ] Redis caching for hot queries
- [ ] Pagination for large lists
- [ ] GraphQL/DataLoader for N+1 queries

**Frontend**:
- [ ] Code splitting (Next.js automatic)
- [ ] Image optimization (next/image)
- [ ] React Query caching
- [ ] Lazy loading for tabs/modals
- [ ] CDN for static assets

---

## Disaster Recovery

**Backups**:
- PostgreSQL: Automated daily snapshots (RDS/Cloud SQL)
- Retention: 30 days
- Point-in-time recovery: 7 days

**Restore Process**:
1. Provision new database from snapshot
2. Update `DATABASE_URL` in backend
3. Run health checks
4. Update DNS if needed

**RTO**: 2 hours  
**RPO**: 24 hours  

---

## Future Enhancements

**Q1**: Mobile app (React Native)  
**Q2**: Advanced analytics (predictive churn, recommendations)  
**Q3**: Marketplace (CoP templates, playbooks)  
**Q4**: Multi-language support (i18n)  

---

**For questions or clarifications, contact the platform team.**


