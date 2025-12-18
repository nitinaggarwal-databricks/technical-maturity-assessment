# CoP Launch Portal - Complete Demo-Ready Guide

🎯 **Full end-to-end Community of Practice portal with Postgres, NestJS, Next.js**

## Quick Start (5 minutes)

### 1. Start Database

```bash
docker compose up db -d
```

### 2. Setup Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

**📝 Copy the user ID from the seed output!**

### 3. Configure Frontend

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_FAKE_USER_ID=<paste-user-id-from-seed>
```

### 4. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 5. Open Browser

Navigate to **http://localhost:3000**

---

## 🎬 Demo Script (15-minute walkthrough)

### Scene 1: Home & Overview (2 min)

1. **Home page** (`/`)
   - "This is the CoP Launch Portal - a one-stop platform for Databricks customers to run Communities of Practice"
   - Show value props and CTA

2. **CoP List** (`/cops`)
   - "We have 2 active CoPs: Takeda (Growth phase) and Cigna (Launch phase)"
   - Click **Takeda Databricks CoP**

### Scene 2: Takeda CoP Dashboard (3 min)

**Overview Tab:**
- Mission: "Drive Databricks adoption across Takeda teams"
- Phase: Growth (4th of 4 phases)
- Upcoming sessions: 2 events scheduled
- "This is the central hub for this customer's community"

### Scene 3: Content Library (2 min)

**Click "Content" tab:**
- CoP-specific assets:
  - Takeda CoP Kickoff Deck
  - Unity Catalog Governance Deep Dive
- Global assets:
  - Databricks Academy courses
- "Content is tagged by persona (DE, DA, Exec) and skill level"
- Click any asset link (opens in new tab)

### Scene 4: Surveys & Feedback (4 min)

**Click "Surveys" tab:**
- Show "Takeda CoP – Kickoff Feedback" survey
- Click **View** →

**Survey Response Page:**
- "This is session feedback with 4 questions"
- Fill out the form:
  - Rating: `5`
  - NPS: `9`
  - What worked well: "Clear roadmap and great demos"
  - What to improve: "More hands-on labs"
- Click **Submit Response**
- See confirmation + basic stats
- "Survey stats show average ratings and NPS calculation"

**Go back** to CoP dashboard

### Scene 5: Analytics & KPIs (4 min)

**Click "Analytics" tab:**
- **Line chart showing MAP & NPS trends over time**
- "Monthly Active Participants growing from 15 to 45"
- "Net Promoter Score trending upward from 60 to 80"
- "This is real-time CoP health based on attendance and feedback"

**Explain KPI methodology:**
- "MAP = unique attendees in last 30 days"
- "NPS = calculated from survey responses"
- "KPIs auto-update via background jobs"

---

## 🏗️ Architecture Overview

```
┌─────────────────┐
│  Next.js (TS)   │  React Query, Tailwind, Recharts
│  Frontend       │
└────────┬────────┘
         │ HTTP/JSON
         │ x-user-id header
┌────────▼────────┐
│  NestJS (TS)    │  REST API, Validation, Decorators
│  Backend        │
└────────┬────────┘
         │ Prisma ORM
┌────────▼────────┐
│  PostgreSQL 16  │  Full schema with 20+ tables
└─────────────────┘
```

### Tech Stack

**Backend:**
- NestJS 10 + TypeScript
- Prisma 5 (ORM)
- PostgreSQL 16
- class-validator

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- TanStack Query (React Query)
- Recharts (charts)

---

## 📊 What's Included

### Database (22 tables)

**Core:**
- `customers`, `cops`, `users`, `cop_memberships`

**Events:**
- `events`, `event_registrations`, `event_attendance`

**Content:**
- `content_assets`, `content_engagement`

**Surveys:**
- `surveys`, `survey_questions`, `survey_responses`, `survey_answers`

**Analytics:**
- `kpi_metrics` (MAP, NPS, sessions, etc.)

**Community:**
- `use_cases`, `champions`, `discussion_threads`, `discussion_replies`, `certifications`

**Planning:**
- `phase_roadmap`, `readiness_assessments`, `templates`

### API Endpoints (40+)

```
/api/v1/
  /customers          - Customer management
  /cops               - CoP lifecycle
    /:id/kpis         - KPI metrics & analytics
    /:id/usecases     - Success stories
    /:id/champions    - Recognition
  /events             - Events & calendar
  /content            - Content library
  /surveys            - Survey creation & responses
```

### UI Pages

- `/` - Home
- `/cops` - CoP list
- `/cops/[id]` - CoP dashboard with tabs:
  - Overview
  - Content
  - Surveys  
  - Analytics
- `/surveys/[id]` - Survey response form

---

## 🎭 Seed Data

### Users (4)
- **Nitin** (Databricks SA)
- **Takeda Exec** (Executive Sponsor)
- **Takeda Champion** (Data Engineer)
- **Cigna Exec** (Executive Sponsor)

### Customers (2)
- **Takeda** (Healthcare & Life Sciences, Global)
- **Cigna Healthcare** (HLS, US)

### CoPs (2)
- **Takeda Databricks CoP** (Growth phase)
- **Cigna Databricks CoP** (Launch phase)

### Content (4 assets)
- 2 Takeda-specific decks
- 2 global training courses

### Events (3)
- Takeda: Databricks 101, GenAI Use Cases
- Cigna: Unity Catalog training

### Survey (1)
- Takeda kickoff feedback with 4 questions & 2 responses

### KPIs
- MAP & NPS data points over 60 days

---

## 🔧 Advanced Features

### Auth Pattern (Simple but Realistic)

**Current:** Fake auth via `x-user-id` header
- Frontend sends user ID from seed data
- Backend reads header with `@CurrentUserId()` decorator
- Good for demos & development

**Next:** Real auth
- Replace with NextAuth.js (frontend)
- JWT validation (backend)
- OAuth/SAML for enterprise SSO

### KPI Computation

**Manual run:**
```bash
cd backend
ts-node src/kpis/cron.ts
```

**What it does:**
- MAP: Counts unique event attendees (last 30 days)
- NPS: Calculates from survey responses (last 90 days)
- Writes to `kpi_metrics` table

**Production:** Schedule as cron job or NestJS `@Cron()`

### Charts (Recharts)

**CopAnalytics component:**
- Fetches MAP & NPS time series
- Renders dual-axis line chart
- Responsive & interactive tooltips

---

## 🚀 Next Steps (Production Readiness)

### Phase 1: Auth & Security
- [ ] Implement NextAuth.js + JWT
- [ ] Add role-based access control (RBAC)
- [ ] Multi-tenant row-level security

### Phase 2: Features
- [ ] Calendar view for events
- [ ] Use cases gallery
- [ ] Champions recognition page
- [ ] Discussion threads/Q&A
- [ ] Email notifications

### Phase 3: Integrations
- [ ] Slack/Teams bot
- [ ] Databricks workspace SSO
- [ ] Zoom/Teams calendar sync
- [ ] Databricks Academy API

### Phase 4: Scale
- [ ] Read replicas for analytics
- [ ] Redis caching
- [ ] Background job queue (BullMQ)
- [ ] Monitoring (Datadog/Sentry)

---

## 📈 KPIs & Success Metrics

**Community Health:**
- MAP (Monthly Active Participants)
- Session attendance rate
- Content engagement
- NPS

**Business Impact:**
- Platform MAU growth
- DBU consumption increase
- Certifications earned
- Use cases launched

**CoP Maturity:**
- Phase progression (Foundation → Launch → Growth → Optimization)
- Champion count
- Cross-BU collaboration

---

## 🛠️ Development Commands

### Backend
```bash
npm run start:dev          # Dev server (watch mode)
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:seed        # Seed database
npm run prisma:studio      # Visual DB browser
```

### Frontend
```bash
npm run dev                # Dev server
npm run build              # Production build
npm run lint               # Lint check
```

### Database
```bash
docker compose up db       # Start Postgres
docker compose down        # Stop all services
docker compose logs db     # View DB logs
```

---

## 🐛 Troubleshooting

**"Error: P1001: Can't reach database"**
- Ensure Postgres is running: `docker compose ps`
- Check `DATABASE_URL` in backend/.env

**"Survey not found"**
- Run seed script: `npm run prisma:seed`
- Check survey ID in URL matches database

**"No KPI data"**
- Run KPI job: `ts-node src/kpis/cron.ts`
- Verify events have attendance records

**Frontend shows "API error: 500"**
- Check backend logs
- Verify `NEXT_PUBLIC_API_BASE_URL` in frontend/.env.local
- Ensure `NEXT_PUBLIC_FAKE_USER_ID` is set

---

## 📚 Documentation

- **Technical Blueprint:** `TECHNICAL_BLUEPRINT.md`
- **Monorepo README:** `README-MONOREPO.md`
- **API Docs:** http://localhost:4000/api/v1 (with Swagger - future)

---

## 🎓 Learning Resources

**For Databricks Teams:**
- Use this portal to pitch CoP to customers
- Show real KPIs and ROI
- Demo readiness assessment flow

**For Customers:**
- Self-service CoP management
- Track community health
- Share best practices

---

## 💡 Tips for Best Demo

1. **Start with "Why"** - Show business value first
2. **Live data** - Use real survey submission
3. **Visual impact** - Analytics charts tell the story
4. **Customer stories** - Takeda/Cigna examples resonate
5. **Roadmap** - Show 4-phase maturity model

---

## 🏆 Success Stories

**Takeda (Seeded Example):**
- Phase: Growth
- MAP: 45 active participants
- NPS: 80+
- Use Case: "Standardized Data Governance"
  - 50% time saved
  - 40% reduction in audit findings

**Your Turn:**
- Add more customers
- Track real metrics
- Build your portfolio

---

## 📞 Support

For questions or issues:
- Check troubleshooting section above
- Review code comments
- Run `prisma studio` to inspect database
- Check browser console & backend logs

---

**Built with ❤️ for the Databricks Community**

*Ready to launch your CoP? Start at http://localhost:3000*


