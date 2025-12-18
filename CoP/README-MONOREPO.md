# CoP Portal - Complete Drop-in Monorepo

A production-ready monorepo for the Community of Practice Launch Portal.

## Stack

- **Backend:** NestJS + Prisma + PostgreSQL
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + React Query
- **Infrastructure:** Docker Compose

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)

### 1. Clone and Start

```bash
# Start all services
docker-compose up --build

# The services will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:4000
# - PostgreSQL: localhost:5432
```

### 2. Initialize Database

```bash
# In a new terminal, run migrations
cd backend
npm install
npx prisma migrate dev --name init
```

### 3. Create Sample Data

```bash
# Test the API with curl or use the frontend

# Create a customer
curl -X POST http://localhost:4000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{"name": "Takeda Pharmaceutical", "industry": "HLS", "region": "North America"}'

# Create a CoP (use customerId from above)
curl -X POST http://localhost:4000/api/v1/cops \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "YOUR_CUSTOMER_ID",
    "name": "Takeda Data & AI CoP",
    "mission": "Foster collaboration and drive innovation",
    "phase": "GROWTH"
  }'

# Create an event (use copId from above)
curl -X POST http://localhost:4000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "copId": "YOUR_COP_ID",
    "title": "Databricks 101",
    "description": "Introduction to the platform",
    "eventType": "training",
    "startsAt": "2025-12-01T14:00:00Z",
    "location": "https://zoom.us/j/123456"
  }'
```

### 4. View in Browser

Navigate to http://localhost:3000 and you'll see:
- Home page with CTA
- CoPs list at /cops
- Individual CoP dashboard at /cops/[id]

## Project Structure

```
cop-portal/
├── docker-compose.yml           # Orchestrates all services
├── backend/                     # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── schema-simple.prisma # Simplified MVP schema
│   ├── src/
│   │   ├── main.ts             # Bootstrap
│   │   ├── app.module.ts
│   │   ├── prisma/             # Prisma module
│   │   ├── customers/          # Customers CRUD
│   │   ├── cops/               # CoPs CRUD
│   │   └── events/             # Events CRUD
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/                    # Next.js App
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── cops/
│   │       ├── page.tsx        # CoPs list
│   │       └── [copId]/
│   │           └── page.tsx    # CoP detail
│   ├── components/
│   │   └── cop/
│   │       └── CopOverview.tsx
│   ├── lib/
│   │   ├── queryClient.ts      # React Query setup
│   │   └── api.ts              # API client
│   ├── styles/
│   │   └── globals.css
│   ├── package.json
│   ├── tailwind.config.ts
│   └── Dockerfile
└── README.md
```

## API Endpoints

### Customers
- `POST /api/v1/customers` - Create customer
- `GET /api/v1/customers` - List customers
- `GET /api/v1/customers/:id` - Get customer

### CoPs
- `POST /api/v1/cops` - Create CoP
- `GET /api/v1/cops` - List CoPs (filter by `?customerId=...`)
- `GET /api/v1/cops/:id` - Get CoP with customer, memberships, events

### Events
- `POST /api/v1/events` - Create event
- `GET /api/v1/events/cop/:copId` - List events for CoP

## Development

### Backend Development

```bash
cd backend
npm install
npx prisma generate

# Run locally (without Docker)
npm run start:dev

# Generate migration after schema changes
npx prisma migrate dev --name your_migration_name

# Open Prisma Studio (DB GUI)
npx prisma studio
```

### Frontend Development

```bash
cd frontend
npm install

# Run locally (without Docker)
npm run dev
```

## Next Steps

### Extend the Schema

Add tables for:
- `ContentAsset`, `ContentEngagement` - Content library
- `Survey`, `SurveyQuestion`, `SurveyResponse`, `SurveyAnswer` - Feedback
- `KpiMetric` - Analytics data
- `UseCase` - Success stories
- `Champion` - Recognition

### Add More API Endpoints

- Surveys module
- Content module
- KPI/Analytics module
- Community/Discussion module

### Enhance Frontend

- Add tabs to CoP dashboard (Events, Content, Surveys, Analytics)
- Build charts with Recharts
- Add forms for creating CoPs, events, content
- Implement authentication (NextAuth.js)

### Production Deployment

- Add proper environment variables
- Set up CI/CD (GitHub Actions)
- Deploy backend to ECS/Cloud Run
- Deploy frontend to Vercel
- Use managed Postgres (RDS/Cloud SQL)
- Add monitoring (Datadog/Sentry)

## Architecture

```
[Browser] → [Next.js Frontend:3000]
                ↓
[NestJS API:4000] → [PostgreSQL:5432]
```

## License

Internal use - Databricks

## Support

For questions or issues, contact the CoP Portal team.


