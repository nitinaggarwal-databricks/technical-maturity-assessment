# Quick Start - Launch CoP Portal Locally

## Prerequisites

Before you begin, ensure you have:

- **Docker Desktop** installed and running
- **Node.js 18+** installed
- **npm** (comes with Node.js)

## Option 1: Automated Setup (Recommended)

### macOS / Linux:

```bash
chmod +x setup.sh
./setup.sh
```

### Windows:

```cmd
setup.bat
```

The script will:
1. ✅ Check prerequisites
2. 🐘 Start PostgreSQL database
3. 🔧 Install backend dependencies
4. 🎨 Install frontend dependencies
5. 🗄️ Run database migrations
6. 🌱 Seed sample data

---

## Option 2: Manual Setup

### 1. Start Database

```bash
docker compose up -d db
```

Wait ~10 seconds for PostgreSQL to be ready.

### 2. Setup Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

**Important:** Copy the user ID from the seed output!

### 3. Setup Frontend

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_FAKE_USER_ID=<paste-user-id-from-seed>
```

Then install dependencies:

```bash
cd frontend
npm install
```

---

## Launch the Application

### Terminal 1 - Backend:

```bash
cd backend
npm run start:dev
```

Backend will run on **http://localhost:4000**

### Terminal 2 - Frontend:

```bash
cd frontend
npm run dev
```

Frontend will run on **http://localhost:3000**

---

## Access the Portal

Open your browser to: **http://localhost:3000**

### Demo Data

The app is pre-seeded with:

- **2 Customers**: Takeda, Cigna Healthcare
- **2 CoPs**: 
  - Takeda Databricks CoP (Growth phase)
  - Cigna Databricks CoP (Launch phase)
- **4 Users**: Nitin (SA), Takeda Exec, Takeda Champion, Cigna Exec
- **3 Events**: Upcoming sessions
- **4 Content Assets**: Training materials
- **1 Survey**: With sample responses
- **KPI Data**: MAP & NPS trends

---

## Demo Flow (5 minutes)

1. **Home Page** → See CoP value proposition
2. **CoP List** (`/cops`) → View Takeda & Cigna CoPs
3. **Takeda CoP** → Click to open dashboard
   - **Overview Tab**: Mission, phase, upcoming events
   - **Content Tab**: Browse training assets
   - **Surveys Tab**: View survey, click to fill it out
   - **Analytics Tab**: See MAP/NPS charts 📊
   - **Community Tab**: Success stories & champions

4. **Fill Survey** → Submit feedback, see stats update
5. **Admin Portal** (`/admin`) → Platform management (if user is admin)

---

## API Endpoints

Backend API: **http://localhost:4000/api/v1**

Key endpoints:
- `GET /cops` - List CoPs
- `GET /cops/:id` - CoP details
- `GET /cops/:id/kpis/series` - KPI time series
- `POST /surveys/:id/responses` - Submit survey
- `POST /cops/:id/ai/advice` - Get AI recommendations

---

## Database Access

### Prisma Studio (Visual DB Browser)

```bash
cd backend
npx prisma studio
```

Opens at **http://localhost:5555**

### Direct PostgreSQL Access

```bash
docker compose exec db psql -U cop_user -d cop_portal
```

---

## Troubleshooting

### Database Connection Error

```bash
# Check if database is running
docker compose ps

# Restart database
docker compose restart db

# Check logs
docker compose logs db
```

### Port Already in Use

If ports 3000, 4000, or 5432 are in use:

```bash
# Find and kill process on port (macOS/Linux)
lsof -ti:3000 | xargs kill
lsof -ti:4000 | xargs kill

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Frontend Can't Connect to Backend

1. Check `frontend/.env.local` has correct API URL
2. Verify `NEXT_PUBLIC_FAKE_USER_ID` is set
3. Restart frontend: `Ctrl+C` then `npm run dev`

### "No surveys yet" in UI

Run seed script again:

```bash
cd backend
npm run prisma:seed
```

### Database Migration Issues

Reset database (⚠️ deletes all data):

```bash
cd backend
npx prisma migrate reset
npm run prisma:seed
```

---

## Development Tools

### Backend Hot Reload

The backend uses NestJS watch mode - changes auto-reload.

### Frontend Hot Reload

Next.js automatically reloads on file changes.

### Code Formatting

```bash
# Backend
cd backend
npm run format

# Frontend
cd frontend
npm run lint
```

---

## Stop the Application

### Stop Services:

```bash
# Stop backend: Ctrl+C in terminal
# Stop frontend: Ctrl+C in terminal
```

### Stop Database:

```bash
docker compose down
```

### Clean Everything (including data):

```bash
docker compose down -v
rm -rf backend/node_modules frontend/node_modules
```

---

## Next Steps

1. ✅ **Launch locally** (you are here)
2. 📚 Review `DEMO_GUIDE.md` for full demo script
3. 🏗️ Read `ARCHITECTURE.md` for technical details
4. 🔌 Check `DATABRICKS_INTEGRATION.md` for integration setup
5. 🚀 Deploy to staging/production

---

## Need Help?

- Check `DEMO_GUIDE.md` for detailed walkthrough
- Review `ARCHITECTURE.md` for system design
- See `DATABRICKS_INTEGRATION.md` for Databricks setup
- Check logs in terminal windows

---

**Ready to launch? Run the setup script and start building! 🚀**


