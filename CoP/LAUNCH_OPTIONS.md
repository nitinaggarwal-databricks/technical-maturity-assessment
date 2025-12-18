# 🚀 Launch Options - Choose Your Path

Docker is not currently running. You have **two options** to proceed:

---

## Option A: Use Docker (Recommended for Production)

### Steps:
1. **Open Docker Desktop application** from your Applications folder
2. **Wait for it to fully start** (you'll see "Docker Desktop is running" in the menu bar)
3. **Verify it's running**:
   ```bash
   docker ps
   ```
   You should see an empty table (not an error)

4. **Then run**:
   ```bash
   cd /Users/nitin.aggarwal/BMAD-METHOD/CoP
   ./setup.sh
   ```

### Why Docker?
- ✅ Production-like environment
- ✅ Isolated database
- ✅ Easy to reset/clean
- ✅ Matches deployment setup

---

## Option B: Use Local PostgreSQL (Faster Setup)

If you have PostgreSQL installed locally (or can install it), this is **faster** than waiting for Docker.

### Check if you have PostgreSQL:
```bash
psql --version
```

### If YES (PostgreSQL installed):
```bash
cd /Users/nitin.aggarwal/BMAD-METHOD/CoP
./setup-local-postgres.sh
```

This script will:
- ✅ Start local PostgreSQL
- ✅ Create database and user
- ✅ Run migrations
- ✅ Seed demo data
- ✅ Configure both backend and frontend
- ✅ Prompt you for the user ID

### If NO (PostgreSQL not installed):
```bash
# Install PostgreSQL via Homebrew
brew install postgresql@16

# Then run the setup script
./setup-local-postgres.sh
```

---

## Option C: Manual Setup (Step-by-Step)

### Using Local PostgreSQL:

```bash
# 1. Start PostgreSQL
brew services start postgresql@16

# 2. Create database
psql postgres -c "CREATE DATABASE cop_portal;"
psql postgres -c "CREATE USER cop_user WITH PASSWORD 'cop_password';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE cop_portal TO cop_user;"

# 3. Configure backend
cd /Users/nitin.aggarwal/BMAD-METHOD/CoP/backend
cat > .env << EOF
DATABASE_URL="postgresql://cop_user:cop_password@localhost:5432/cop_portal?schema=public"
JWT_SECRET="dev-secret-key"
NODE_ENV="development"
EOF

# 4. Setup backend
npm run prisma:generate
npx prisma migrate dev --name init
npm run prisma:seed
# ⚠️ COPY THE USER ID!

# 5. Configure frontend
cd ../frontend
cat > .env.local << EOF
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_FAKE_USER_ID=<PASTE_USER_ID>
EOF
npm install

# 6. Launch (2 terminals)
# Terminal 1: cd backend && npm run start:dev
# Terminal 2: cd frontend && npm run dev

# 7. Open http://localhost:3000
```

---

## My Recommendation

**For immediate demo**: Use **Option B** (Local PostgreSQL)
- Faster to start
- No Docker dependencies
- Same functionality

**For production planning**: Use **Option A** (Docker)
- Matches deployment
- Better isolation
- Industry standard

---

## Quick Decision Matrix

| Scenario | Best Option |
|----------|-------------|
| **Need to demo NOW** | Option B (Local PostgreSQL) |
| **Docker already installed** | Option A (Docker) |
| **Learning/Development** | Option B (Local PostgreSQL) |
| **Production planning** | Option A (Docker) |
| **Have 5 minutes** | Option B (Local PostgreSQL) |
| **Want exact production match** | Option A (Docker) |

---

## What Would You Like To Do?

**Choose one:**

1. **Start Docker Desktop** (then I'll continue with Option A)
2. **Use Local PostgreSQL** (I'll run the setup script)
3. **Manual setup** (I'll guide you step-by-step)

Just let me know which option you prefer! 🚀


