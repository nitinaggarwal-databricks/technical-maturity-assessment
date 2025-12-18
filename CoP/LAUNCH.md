# 🚀 Launch CoP Portal - Step by Step

## Current Status

✅ Backend dependencies installed  
⚠️ Docker needs to be started  

---

## Step 1: Start Docker Desktop

**You need to start Docker Desktop before proceeding.**

### macOS:
1. Open **Docker Desktop** from Applications
2. Wait for Docker to show "Engine running" in the menu bar
3. Then continue with the steps below

### Check if Docker is running:
```bash
docker ps
```

If you see a table (even if empty), Docker is running! ✅

---

## Step 2: Start PostgreSQL Database

Once Docker is running:

```bash
cd /Users/nitin.aggarwal/BMAD-METHOD/CoP
docker compose up -d db
```

Wait ~10 seconds for the database to initialize.

### Verify database is running:
```bash
docker compose ps
```

You should see `db` with status "Up".

---

## Step 3: Setup Backend (Already Done! ✅)

Backend dependencies are installed. Now run:

```bash
cd /Users/nitin.aggarwal/BMAD-METHOD/CoP/backend

# Generate Prisma client
npm run prisma:generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with demo data
npm run prisma:seed
```

**⚠️ IMPORTANT:** Copy the user ID printed at the end of the seed script!

---

## Step 4: Configure Frontend

Create the environment file:

```bash
cd /Users/nitin.aggarwal/BMAD-METHOD/CoP/frontend

cat > .env.local << EOF
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_FAKE_USER_ID=<PASTE_USER_ID_FROM_SEED>
EOF
```

**Replace `<PASTE_USER_ID_FROM_SEED>` with the actual UUID from step 3!**

Then install frontend dependencies:

```bash
npm install
```

---

## Step 5: Launch Services

### Terminal 1 - Start Backend:

```bash
cd /Users/nitin.aggarwal/BMAD-METHOD/CoP/backend
npm run start:dev
```

Wait for: **"Nest application successfully started on: http://[::1]:4000"**

### Terminal 2 - Start Frontend:

```bash
cd /Users/nitin.aggarwal/BMAD-METHOD/CoP/frontend
npm run dev
```

Wait for: **"Ready on http://localhost:3000"**

---

## Step 6: Open the Portal

🌐 **http://localhost:3000**

---

## Quick Demo Flow

1. **Home** → See CoP value prop
2. **View CoPs** → Click "CoPs" in nav
3. **Takeda CoP** → Click to open
4. **Explore Tabs**:
   - Overview: Mission, events
   - Content: Training materials
   - Surveys: Fill out feedback
   - Analytics: See charts 📊
   - Community: Success stories

---

## Commands Summary

```bash
# 1. Start Docker Desktop (manual)

# 2. Start database
docker compose up -d db

# 3. Setup backend
cd backend
npm install                    # ✅ Already done!
npm run prisma:generate
npx prisma migrate dev --name init
npm run prisma:seed           # Copy the user ID!

# 4. Setup frontend
cd ../frontend
npm install
# Create .env.local with user ID

# 5. Run services (2 terminals)
cd backend && npm run start:dev      # Terminal 1
cd frontend && npm run dev           # Terminal 2

# 6. Open http://localhost:3000
```

---

## Troubleshooting

### Docker not running
```bash
# Check Docker status
docker ps

# If error, start Docker Desktop app
```

### Database won't start
```bash
# Check logs
docker compose logs db

# Restart
docker compose restart db
```

### Port already in use
```bash
# Kill process on port 4000 (backend)
lsof -ti:4000 | xargs kill

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill
```

### "Prisma schema not found"
```bash
cd backend
npm run prisma:generate
```

### Frontend can't connect
1. Check `.env.local` exists in `frontend/`
2. Verify `NEXT_PUBLIC_FAKE_USER_ID` is set
3. Check backend is running on port 4000

---

## Alternative: Use Local PostgreSQL

If you can't use Docker, you can use a local PostgreSQL:

1. Install PostgreSQL locally
2. Create database: `createdb cop_portal`
3. Update `backend/.env`:
   ```
   DATABASE_URL="postgresql://localhost:5432/cop_portal"
   ```
4. Continue with Step 3 above

---

## Need Help?

**Common issues:**
- ❌ Docker not running → Start Docker Desktop
- ❌ Port in use → Kill the process using it
- ❌ Database not ready → Wait 15 seconds and try again
- ❌ Missing user ID → Re-run `npm run prisma:seed`

**Check status:**
```bash
docker compose ps              # Database
curl http://localhost:4000     # Backend
curl http://localhost:3000     # Frontend
```

---

**Ready? Start Docker Desktop, then run the commands above! 🚀**


