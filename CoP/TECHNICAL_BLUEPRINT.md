# CoP Launch Portal - Full Technical Blueprint

## A. Full Technical Blueprint

### A1. High-Level Architecture

```
[Browser: Next.js SPA/SSR]
        │
        ▼
[API Gateway / Ingress]
        │   (REST/JSON, JWT/OAuth2)
        ▼
[Backend App: NestJS]
        │
        ├── Direct SQL via Prisma
        ▼
[PostgreSQL Cluster]
        │
        └── Read replica → [BI / DBSQL / Metabase / Superset]

[Background Workers]
  - Survey summarization
  - KPI aggregation
  - Email/notification
  - AI workflows (optional later)
```

**Auth Options:**
- Databricks-internal users: SSO / OAuth (Google/Azure AD/Okta)
- Customers: workspace SSO or app-native login (OAuth/OpenID)

### A2. Entity Relationship Diagram (Conceptual)

**Core Entities:**
1. `customers` – Cigna, Takeda, etc.
2. `cops` – a CoP per customer (e.g., "Databricks CoP @ Takeda HLS")
3. `users` – both Databricks & customer users
4. `cop_memberships` – membership + role (exec sponsor, champion, member)
5. `events` – sessions, office hours, deep dives
6. `event_registrations` & `event_attendance`
7. `content_assets` – training/content items
8. `content_engagement` – views/downloads
9. `surveys`, `survey_questions`, `survey_responses`, `survey_answers`
10. `kpi_metrics` – MAP/MAU/NPS/DBUs/certs by day
11. `use_cases` – success stories
12. `champions` – Brickster of the Month, etc.

**Key Relationships:**
- 1 customer → many cops
- 1 cop → many members, events, assets, kpi_metrics, use_cases
- 1 event → many registrations, attendance, surveys
- 1 survey → many questions, responses
- 1 response → many answers

### A3. REST API Specification (MVP Set)

**Base URL:** `/api/v1`

**Authentication:**
- JWT bearer tokens or session cookies
- Scopes/roles: `admin`, `databricks_internal`, `customer_exec`, `customer_member`

#### CoPs
```
POST   /cops                    - Create CoP
GET    /cops                    - List CoPs (filters: customer, owner, phase, status)
GET    /cops/:copId             - CoP details + basic stats
PATCH  /cops/:copId             - Update phase, mission, charter, etc.
DELETE /cops/:copId             - Archive/delete CoP
```

#### Members & Users
```
GET    /cops/:copId/members     - List members
POST   /cops/:copId/members     - Add member
PATCH  /cops/:copId/members/:memberId  - Change membership_role
DELETE /cops/:copId/members/:memberId  - Remove member
GET    /users                   - Search users
GET    /users/:userId           - User profile
```

#### Readiness & Setup
```
POST   /cops/:copId/readiness   - Submit readiness assessment
GET    /cops/:copId/readiness/latest - Get latest assessment
GET    /cops/:copId/roadmap     - Get phase roadmap
PATCH  /cops/:copId/roadmap/:taskId - Update task status
```

#### Events / Sessions
```
POST   /cops/:copId/events      - Create event
GET    /cops/:copId/events      - List events (date range filters)
GET    /events/:eventId         - Event details
PATCH  /events/:eventId         - Update event
DELETE /events/:eventId         - Cancel event
POST   /events/:eventId/register - Register for event
POST   /events/:eventId/attendance - Update attendance (bulk)
```

#### Content & Engagement
```
POST   /cops/:copId/assets      - Create content item
GET    /cops/:copId/assets      - List assets (filter by type, level, persona, tags)
GET    /assets/:assetId         - Asset details
PATCH  /assets/:assetId         - Update asset
DELETE /assets/:assetId         - Remove asset
POST   /assets/:assetId/engagement - Track engagement { type: 'view' | 'download' | 'like' }
```

#### Surveys
```
POST   /cops/:copId/events/:eventId/surveys - Create session survey
POST   /cops/:copId/surveys     - Create standalone survey
GET    /surveys/:surveyId       - Survey details
POST   /surveys/:surveyId/responses - Submit response
GET    /surveys/:surveyId/results - Aggregated metrics + AI summary
PATCH  /surveys/:surveyId/close - Close survey
```

#### KPIs & Analytics
```
GET    /cops/:copId/kpis        - Time series for MAP, MAU, NPS, etc.
POST   /cops/:copId/kpis/ingest - Batch ingestion (worker endpoint)
GET    /cops/:copId/analytics/summary - Latest KPIs with trends
GET    /analytics/portfolio     - All CoPs aggregated view
```

#### Use Cases & Champions
```
POST   /cops/:copId/use-cases   - Submit use case
GET    /cops/:copId/use-cases   - List use cases
PATCH  /use-cases/:id/approve   - Approve use case
POST   /cops/:copId/champions   - Add champion recognition
GET    /cops/:copId/champions   - List champions
```

#### Discussion & Community
```
POST   /cops/:copId/discussions - Create thread
GET    /cops/:copId/discussions - List threads
GET    /discussions/:threadId   - Thread details
POST   /discussions/:threadId/replies - Add reply
PATCH  /replies/:replyId/accept - Mark as accepted answer
```

### A4. Technology Stack Details

**Backend (NestJS):**
- **Framework:** NestJS 10.x (TypeScript 5.x)
- **ORM:** Prisma 5.x
- **Validation:** class-validator, class-transformer
- **Auth:** Passport.js (JWT, OAuth2)
- **Queue:** BullMQ (Redis-based)
- **Testing:** Jest, Supertest
- **Documentation:** Swagger/OpenAPI

**Frontend (Next.js):**
- **Framework:** Next.js 14.x (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 3.x
- **Components:** shadcn/ui (Radix UI primitives)
- **State:** TanStack Query 5.x, Zustand
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Testing:** Vitest, Playwright

**Database:**
- **Primary:** PostgreSQL 16
- **Extensions:** uuid-ossp, citext
- **Connection Pooling:** PgBouncer
- **Migrations:** Prisma Migrate

**Infrastructure:**
- **Containers:** Docker, Docker Compose
- **CI/CD:** GitHub Actions
- **Hosting:** AWS/GCP/Azure
  - Backend: ECS/Cloud Run/App Service
  - Frontend: Vercel/Amplify/Cloud Run
  - Database: RDS/Cloud SQL/Aurora
- **Monitoring:** Datadog/New Relic/CloudWatch
- **Logging:** Winston + CloudWatch/Stackdriver

### A5. Security & Compliance

**Authentication & Authorization:**
- JWT tokens with refresh mechanism
- OAuth2/OpenID Connect for SSO
- Role-based access control (RBAC)
- Row-level security in Postgres for multi-tenancy

**Data Security:**
- All data encrypted at rest (database)
- TLS 1.3 for data in transit
- Environment variables for secrets (never in code)
- Audit logging for sensitive operations

**Compliance Considerations:**
- GDPR: Data portability, right to deletion
- SOC 2: Access controls, logging, encryption
- HIPAA (for HLS): PHI handling guidelines

### A6. Performance & Scalability

**Target Metrics:**
- API response time: < 200ms (p95)
- Page load time: < 2s (p95)
- Database queries: < 100ms (p95)
- Concurrent users: 10,000+
- Database: Read replicas for analytics

**Optimization Strategies:**
- API response caching (Redis)
- Database query optimization (indexes, explain analyze)
- CDN for static assets
- Lazy loading for large datasets
- Pagination for list endpoints

---

## B. Code Skeleton

See separate files:
- `backend/` - NestJS application structure
- `frontend/` - Next.js application structure
- `database/schema.sql` - Complete PostgreSQL schema

---

## C. UI/UX Mockups (Design Specifications)

### C1. Home Page

**Hero Section:**
- **Title:** "Launch & Scale Communities of Practice on Databricks"
- **Subtitle:** "The complete platform for driving adoption, collaboration, and innovation across your data & AI organization"
- **CTA Buttons:** 
  - Primary: "Start a CoP" (orange, large)
  - Secondary: "View Impact Stories" (outline)
- **Hero Image:** Illustration of connected teams, data pipelines, collaboration

**Value Proposition Tiles (4-5 cards):**
1. **Drive Adoption** - Icon: TrendingUp - "Increase platform MAU by 40%"
2. **Enable Teams** - Icon: GraduationCap - "Accelerate learning & certification"
3. **Foster Innovation** - Icon: Lightbulb - "2x more use cases launched"
4. **Standardize Practices** - Icon: Shield - "Governance & best practices"
5. **Measure ROI** - Icon: BarChart - "Track DBUs, NPS, and business value"

**Phase Timeline Component:**
- Horizontal stepper with 4 phases
- Each phase: Icon, title, duration, key activities
- Interactive: click to expand details

**Social Proof:**
- Customer logos strip (Takeda, Cigna, etc.)
- Quote carousel with customer testimonials
- "Join 50+ Enterprise CoPs" badge

### C2. CoP List (Internal Portfolio View)

**Header:**
- Page title: "Community of Practice Portfolio"
- Search bar (search by customer, CoP name)
- Filters dropdown: Region, Industry, Phase, Health Score
- "Create New CoP" button (top-right, primary)

**Main Content - Table/Grid View:**

**Columns:**
1. Customer Name + Logo
2. CoP Name (clickable to dashboard)
3. Phase (badge with color coding)
4. Active Members (MAP count)
5. Last Session (relative date)
6. Health Score (colored indicator: 🟢 🟡 🔴)
7. Actions (⋮ menu)

**Cards Alternative View:**
- Grid of cards, each showing:
  - Customer logo
  - CoP name
  - Phase badge
  - Mini KPI strip (MAP, NPS, Sessions)
  - "View Dashboard" button

**Empty State:**
- Illustration
- "No CoPs yet. Let's launch your first one!"
- "Create CoP" button

### C3. CoP Dashboard (Per Customer)

**Layout:**

**Left Sidebar Navigation:**
- Overview (home icon)
- Events (calendar icon)
- Content (book icon)
- Community (users icon)
- Surveys (clipboard icon)
- Analytics (chart icon)
- Settings (gear icon)

**Top Bar:**
- CoP name + customer logo
- Phase badge
- Status indicator (Active/Inactive)
- Action menu (Edit, Archive, Export)

**Overview Tab - Main Content:**

**Header Card (Hero):**
- Large CoP name
- Mission statement
- Current phase with progress bar
- Key metrics strip:
  - Active Members: 127
  - Avg NPS: 8.2
  - Sessions (90d): 12
  - Success Stories: 5

**Phase Progress Section:**
- Visual roadmap showing 4 phases
- Current phase highlighted
- Checkmarks for completed phases
- "View Roadmap" link

**Upcoming Events (Next 3):**
- Card for each event
  - Date/time
  - Title
  - Speaker(s)
  - "Join" button
  - Attendance count

**Recent Activity Feed:**
- Timeline of recent actions:
  - New member joined
  - Content added
  - Survey completed
  - Use case submitted

**Success Stories Carousel:**
- 3 cards showing recent use cases
- Title, domain, impact metrics
- "View All" link

### C4. Events Calendar Page

**Layout:**

**Calendar View (Main):**
- Month view default (toggle week/day)
- Events displayed as colored blocks
- Color coding by event type:
  - Training: Blue
  - Office Hours: Green
  - Deep Dive: Purple
  - Roadmap: Orange

**Event Detail Panel (Right Sidebar):**
Opens when clicking event:
- Event title
- Date & time
- Duration
- Location (Zoom link)
- Speakers (avatars + names)
- Description
- Agenda (expandable)
- Materials (downloadable links)
- Registration:
  - "Register" button
  - Attendance: 45/50
  - List of registered attendees
- Post-event:
  - Attendance: 42 attended
  - Survey results: NPS 8.5
  - "View Survey Results" link

**Actions:**
- "Create Event" button (floating or top-right)
- Filter by event type
- Export to calendar

### C5. Content Library Page

**Layout:**

**Left Filter Panel:**
- **Persona:** DE, DA, DS, Business (checkboxes)
- **Skill Level:** Beginner, Intermediate, Advanced
- **Topic:** DB101, Governance, GenAI, ML, DE, DBSQL
- **Asset Type:** Course, Video, Doc, Presentation, Notebook
- **Tags:** Multi-select with autocomplete
- "Clear Filters" button

**Main Content Area:**

**View Toggle:** Grid / List

**Grid View:**
- Cards (3-4 per row)
- Each card:
  - Asset type icon (large)
  - Title
  - Description (truncated)
  - Persona badge
  - Skill level badge
  - View count
  - "View" button
  - Heart icon (like)

**List View:**
- Table with columns:
  - Title
  - Type
  - Persona
  - Level
  - Views
  - Downloads
  - Last Updated
  - Actions

**Detail Drawer (slides in from right):**
- Full title
- Description
- Embedded preview (if video/slides)
- Metadata:
  - Author
  - Created/Updated dates
  - Tags
- Engagement metrics (views, downloads, likes)
- "Open in New Tab" button
- "Download" button
- Related content section

### C6. Surveys & Feedback Page

**Survey List:**

**Cards for each survey:**
- Survey title
- Type badge (Session Feedback / CoP Health / Executive Pulse)
- Target (linked CoP or event)
- Response count: 42/50
- Key metrics:
  - NPS: 8.2
  - Avg Satisfaction: 4.3/5
- Status: Active / Closed
- "View Results" button

**Survey Detail Page:**

**Top KPI Cards (4 across):**
1. Total Responses: 42
2. Response Rate: 84%
3. NPS Score: 8.2 🟢
4. Avg Rating: 4.3/5 ⭐

**Results Section:**

For each question:
- Question text
- Visualization:
  - Rating questions: Bar chart
  - NPS: Gauge chart + breakdown (Promoters/Passives/Detractors)
  - Multi-choice: Pie chart
  - Free text: Word cloud (if enough responses)

**AI Summary Card (optional):**
- Icon: Sparkles
- "AI-Generated Insights"
- 3 sections:
  - ✅ What's Working
  - ⚠️ Areas for Improvement
  - 💡 Recommendations

**Export Button:** Download results as PDF/CSV

### C7. Analytics / Portfolio Page

**Header:**
- Date range selector (Last 30d / 90d / 6mo / 1yr / Custom)
- Region filter
- Industry filter
- Export button

**Dashboard Layout (Grid):**

**Row 1 - Summary KPIs (4 cards):**
1. Total Active CoPs: 12 (+2 from last period)
2. Total MAP: 1,247 (+15%)
3. Avg NPS: 8.1 (+0.3)
4. Total DBUs: 12.5K (+22%)

**Row 2 - Charts:**

**Chart 1: CoP Coverage Map**
- Horizontal bar chart showing customers
- Number of CoPs per customer
- Color by health score

**Chart 2: MAP/MAU Growth**
- Line chart with 2 lines (MAP vs MAU)
- X-axis: Time
- Y-axis: User count
- Annotation showing CoP launch dates

**Row 3:**

**Chart 3: CoPs by Phase**
- Donut chart
- Segments: Foundation, Launch, Growth, Optimization
- Click to filter

**Chart 4: Certification Trends**
- Stacked area chart
- By certification type over time

**Row 4:**

**Chart 5: Use Cases Launched**
- Bar chart
- By domain/vertical
- Click to see details

**Table: CoP Performance**
- Sortable table with all CoPs
- Columns: Customer, MAP, NPS, Sessions, Health
- Sparkline for trend

---

## D. Product / Business Assets

### D1. Product Vision Deck (Slide Outline)

**Slide 1: Title**
- "CoP Launch Portal: The Community of Practice OS for Databricks"
- Subtitle: "Internal Product Proposal"

**Slide 2: The Problem**
- Customers struggle to scale Databricks adoption across teams
- Today's reality:
  - Ad-hoc training sessions
  - Tribal knowledge
  - No metrics on impact
  - Inconsistent governance
- Result: Slow adoption, underutilized platform, churn risk

**Slide 3: Market Opportunity**
- X% of Enterprise customers need adoption acceleration
- Average customer has 10+ BUs that could benefit
- CoP customers show 40% higher MAU
- Takeda case study: $XXM in additional DBU consumption

**Slide 4: The Vision**
- "A turnkey platform to launch, manage, and measure Communities of Practice"
- Empower customers to become self-sufficient in driving adoption
- Strengthen Databricks stickiness through community

**Slide 5: Key Personas**

**Internal (Databricks):**
- Account Executives (AEs)
- Customer Success Managers (CSMs)
- Solutions Architects (SAs/DSAs)

**Customer:**
- Executive Sponsors
- CoP Leads
- Champions
- Members (DE, DA, DS, Analysts)

**Slide 6: User Journey**

**Phase 1: Assess**
- Readiness assessment
- Stakeholder identification

**Phase 2: Design**
- Charter creation
- Goal setting
- Roadmap planning

**Phase 3: Launch**
- First sessions
- Content curation
- Feedback loops

**Phase 4: Scale**
- Expand membership
- Advanced topics
- Measure ROI

**Slide 7: Product Demo (Storyboard)**
- Screenshot 1: Readiness assessment form
- Screenshot 2: CoP dashboard with KPIs
- Screenshot 3: Events calendar
- Screenshot 4: Analytics showing growth

**Slide 8: Value Proposition**

**For Customers:**
- Faster time-to-value
- Democratized data & AI
- Reduced shadow IT
- Innovation at scale

**For Databricks:**
- Higher platform adoption (MAU/DBU)
- Stronger customer relationships
- Expansion opportunities
- Improved NRR/GRR

**Slide 9: Architecture**
- High-level diagram (see Section A1)
- PostgreSQL for state
- Next.js for UI
- NestJS for API
- Integrations: Databricks, Slack, Academy, BI tools

**Slide 10: Success Metrics**

**Customer Success:**
- MAP (Monthly Active Participants)
- NPS
- Use cases launched
- Certifications earned

**Business Impact:**
- MAU growth
- DBU consumption increase
- Account expansion
- Renewal rate

**Slide 11: Roadmap**

**Q1 2025: MVP**
- Core CoP management
- Events & content
- Basic surveys
- KPI dashboards

**Q2 2025: Automation**
- Auto KPI collection
- Slack/Teams integration
- Email campaigns
- Template library

**Q3 2025: AI Advisor**
- Survey insights
- Personalized recommendations
- Content suggestions
- Health predictions

**Q4 2025: Marketplace**
- CoP template store
- Success story gallery
- Cross-CoP learnings
- Partner ecosystem

**Slide 12: Investment Ask**
- Team: 1 PM, 2 Engineers, 1 Designer, 0.5 Data Engineer
- Budget: $XXK (infra, tools, contractors)
- Timeline: 90 days to pilot-ready MVP
- ROI: XX new logos, $XM in expansion ARR

**Slide 13: Call to Action**
- Approval for pilot program
- 3 design partner customers
- Partnership with Field, CSM, and SA teams
- Go/No-Go decision after pilot

### D2. Pricing Model (If External SaaS)

**Tier 1: Starter**
- **Price:** $499/month
- **Features:**
  - 1 CoP
  - Up to 100 members
  - Unlimited events & content
  - Basic surveys
  - Standard analytics dashboard
  - Email support
- **Ideal For:** Small teams, pilot programs

**Tier 2: Growth**
- **Price:** $1,499/month
- **Features:**
  - Up to 5 CoPs
  - Up to 500 members
  - Advanced analytics & custom reports
  - Success story gallery
  - Champion recognition program
  - Slack/Teams integration
  - Priority support
- **Ideal For:** Enterprise departments, multi-BU rollouts

**Tier 3: Enterprise**
- **Price:** Custom
- **Features:**
  - Unlimited CoPs
  - Unlimited members
  - Multi-tenant portfolio view
  - Deep Databricks integration
  - SSO/SCIM
  - Custom KPIs
  - AI CoP Advisor
  - Data warehouse connector
  - Dedicated CSM
  - SLA guarantees
  - Professional services
- **Ideal For:** Large enterprises, system integrators

**Add-Ons:**
- Professional Services: $200/hour
- Custom integrations: Quote-based
- Advanced AI features: $500/month

**Internal Databricks Model:**
- Free for all customers
- Funded by Product org
- ROI measured in MAU/DBU expansion

### D3. Go-To-Market Strategy

**Phase 1: Internal Enablement (Month 1)**
- Train AE/CSM/SA teams on CoP Portal
- Create pitch deck and demo videos
- Identify 5-10 design partner accounts
- Set up internal feedback loop

**Phase 2: Design Partners (Months 2-4)**
- Launch pilots with 3-5 customers
- Takeda (already engaged)
- 2 HLS customers
- 2 FSI customers
- Dedicated support for each
- Weekly check-ins
- Capture success stories

**Phase 3: Controlled Rollout (Months 5-7)**
- Expand to 20-30 customers
- Focus on Enterprise segment
- Regional expansion (NA → EMEA → APAC)
- Build case study library
- Refine based on feedback

**Phase 4: General Availability (Month 8+)**
- Open to all Enterprise customers
- Self-serve signup (lower tiers)
- Marketing campaign launch
- Partner with Customer Success
- Integrate into standard EBCs/QBRs

**Sales Plays:**
1. **Renewal Play:** Show CoP impact, justify expansion
2. **Expansion Play:** New BU adoption via CoP
3. **Competitive Defense:** Demonstrate community value
4. **Executive Engagement:** Use CoP metrics in EBCs

**Marketing Assets:**
- Product landing page
- Demo video (3 min)
- Customer success stories (blog posts, videos)
- Webinar series: "Building a Winning CoP"
- One-pagers for AEs
- ROI calculator

---

## E. 90-Day MVP Build Plan

**Team:**
- 1 Product Manager / Architect
- 2 Fullstack Engineers (E1, E2)
- 1 Designer (Part-time, 50%)
- 1 Data/Analytics Engineer (Part-time, 25%)

### Phase 1: Foundations (Weeks 1-3)

**Goals:**
- Infrastructure & CI/CD ready
- Core database schema
- Auth skeleton
- Basic CoP list & detail pages

**Week 1: Setup & Architecture**
- [ ] Set up GitHub repo (monorepo with TurboRepo)
- [ ] Configure Docker Compose (Postgres, Redis, backend, frontend)
- [ ] Set up CI/CD pipelines (GitHub Actions)
- [ ] Database: Create schema, migrations (Prisma)
- [ ] Backend: NestJS project structure, basic modules
- [ ] Frontend: Next.js project structure, design system setup
- **Owner:** E1 (backend focus), E2 (frontend focus)

**Week 2: Auth & Core Entities**
- [ ] Backend: Implement auth module (JWT, passport)
- [ ] Backend: CRUD endpoints for customers, cops, users, memberships
- [ ] Database: Seed data for testing
- [ ] Frontend: Auth flow (login, signup, logout)
- [ ] Frontend: App shell (layout, navigation)
- [ ] Designer: Finalize color palette, typography, component library
- **Owner:** E1 (auth), E2 (frontend shell), Designer

**Week 3: CoP Management**
- [ ] Backend: CoP detail endpoints with aggregated stats
- [ ] Frontend: CoP list page (table/grid view, filters)
- [ ] Frontend: CoP detail page (overview tab)
- [ ] Frontend: Create/Edit CoP forms
- [ ] Designer: Mockups for events, content pages
- [ ] Analytics: Event tracking setup (Segment/PostHog)
- **Owner:** E1, E2, Designer

**Milestone 1 Demo:** Create CoP, view list, see detail page

---

### Phase 2: Events, Content, Surveys (Weeks 4-6)

**Goals:**
- Run full CoP sessions from portal
- Content library functional
- Collect session feedback

**Week 4: Events Module**
- [ ] Database: events, event_registrations, event_attendance tables
- [ ] Backend: Events CRUD endpoints
- [ ] Backend: Registration & attendance endpoints
- [ ] Frontend: Events calendar view
- [ ] Frontend: Event detail panel
- [ ] Frontend: Event creation form
- **Owner:** E1 (backend), E2 (frontend)

**Week 5: Content Library**
- [ ] Database: content_assets, content_engagement tables
- [ ] Backend: Content CRUD endpoints
- [ ] Backend: Engagement tracking endpoint
- [ ] Frontend: Content library page (grid/list, filters)
- [ ] Frontend: Content detail drawer
- [ ] Frontend: Content upload/creation form
- [ ] Designer: Refine content card designs
- **Owner:** E1, E2, Designer

**Week 6: Surveys & Feedback**
- [ ] Database: surveys, survey_questions, survey_responses, survey_answers tables
- [ ] Backend: Survey CRUD and response endpoints
- [ ] Backend: Survey results aggregation logic
- [ ] Frontend: Survey creation form (dynamic questions)
- [ ] Frontend: Survey response form
- [ ] Frontend: Survey results page (charts)
- [ ] Background: Set up BullMQ for survey processing
- **Owner:** E1 (backend+worker), E2 (frontend)

**Milestone 2 Demo:** Create event, upload content, create survey, submit response

---

### Phase 3: KPIs & Dashboards (Weeks 7-9)

**Goals:**
- Show impact dashboards
- Track MAP, NPS, engagement
- Portfolio analytics for internal view

**Week 7: KPI Infrastructure**
- [ ] Database: kpi_metrics table
- [ ] Backend: KPI ingest endpoints
- [ ] Background: Nightly aggregation job
  - Compute MAP from event attendance
  - Compute avg NPS from surveys
  - Compute engagement from content views
- [ ] Backend: KPI query endpoints (time series)
- **Owner:** E1, Data Engineer

**Week 8: CoP Analytics Dashboard**
- [ ] Frontend: Install Recharts
- [ ] Frontend: Analytics tab in CoP dashboard
  - MAP over time (line chart)
  - NPS trend (line chart)
  - Session count (bar chart)
  - Content engagement (bar chart)
- [ ] Frontend: KPI summary cards
- [ ] Designer: Chart color schemes
- **Owner:** E2, Designer

**Week 9: Portfolio Analytics**
- [ ] Backend: Portfolio aggregation endpoint
- [ ] Frontend: Portfolio analytics page
  - All CoPs summary table
  - CoPs by phase (donut chart)
  - MAP vs MAU (line chart)
  - Regional breakdown
- [ ] Frontend: Filters (date range, region, industry)
- [ ] Optional: Set up Metabase/Superset for BI
- **Owner:** E2, Data Engineer

**Milestone 3 Demo:** View KPIs, see analytics dashboard, export data

---

### Phase 4: Polish, Pilot, Launch (Weeks 10-12)

**Goals:**
- Production-ready UX
- Run real pilots with 2-3 customers
- Create launch materials

**Week 10: UX Polish & Quality**
- [ ] Frontend: Loading states for all async operations
- [ ] Frontend: Error handling & user-friendly messages
- [ ] Frontend: Responsive design (mobile, tablet)
- [ ] Frontend: Accessibility audit (a11y)
- [ ] Backend: API error handling improvements
- [ ] Backend: Rate limiting
- [ ] Backend: Logging improvements
- [ ] Testing: E2E tests for critical flows (Playwright)
- **Owner:** E1, E2

**Week 11: Pilot Features**
- [ ] Backend: Champion recognition endpoints
- [ ] Backend: Use case submission endpoints
- [ ] Frontend: Champion recognition page
- [ ] Frontend: Use case submission form & gallery
- [ ] Frontend: Phase roadmap visualizer
- [ ] Optional: AI survey summarization (OpenAI integration)
- [ ] Security: Penetration testing
- **Owner:** E1, E2

**Week 12: Pilot & Documentation**
- [ ] Launch pilot with 2-3 customers
  - Configure CoPs
  - Run 2-3 real sessions
  - Collect feedback
- [ ] Documentation: User guide
- [ ] Documentation: Admin guide
- [ ] Documentation: API documentation (Swagger)
- [ ] Marketing: Customer brochure page
- [ ] Analytics: Create "Pilot Results" dashboard
- [ ] PM: Create pilot results deck for leadership
- **Owner:** PM, all engineers

**Milestone 4 Demo:** Full product walkthrough with real customer data

---

### Post-MVP: Iteration Plan (Months 4-6)

**Based on pilot feedback, prioritize:**
1. Integration with Databricks workspace (SSO, usage data)
2. Slack/Teams bot for notifications
3. Email campaigns for event reminders
4. Template library (CoP templates, content packs)
5. Mobile app (React Native)
6. Advanced AI features (CoP health predictions, content recommendations)
7. Multi-language support (i18n)

---

## Success Criteria

### MVP Success Metrics:
- ✅ 3 pilot customers onboarded
- ✅ 10+ real events run through portal
- ✅ 50+ survey responses collected
- ✅ KPI dashboards showing meaningful data
- ✅ NPS from pilot users > 7.5
- ✅ 90% uptime during pilot

### Business Success (12 months post-launch):
- 50+ active CoPs
- 5,000+ total members
- 20% increase in customer MAU (for CoP customers)
- 15% increase in DBU consumption (for CoP customers)
- 10+ customer success stories published
- Influence 5+ expansions or renewals

---

## Risk Mitigation

**Technical Risks:**
- Database scalability → Start with read replicas, plan for sharding
- API performance → Implement caching, query optimization
- Data integrity → Comprehensive testing, database constraints

**Product Risks:**
- Low adoption → Strong pilot program, user research
- Poor UX → Continuous user testing, designer embedded in team
- Feature creep → Strict MVP scope, prioritize ruthlessly

**Business Risks:**
- No exec buy-in → Build strong ROI case with Takeda example
- Resource constraints → Start small, prove value, scale team
- Competing priorities → Align with strategic initiatives (AI adoption, NRR)

---

## Next Steps

1. **Get Approval:** Present vision deck to leadership
2. **Secure Resources:** Hire/allocate team members
3. **Set Up Infrastructure:** Repos, environments, CI/CD
4. **Week 1 Kickoff:** Team alignment, sprint planning
5. **Design Partners:** Confirm 3 pilot customers
6. **Build:** Execute 90-day plan
7. **Pilot:** Run with real customers
8. **Iterate:** Refine based on feedback
9. **Scale:** General availability

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-22  
**Owner:** Product Team  
**Status:** Proposal / Blueprint


