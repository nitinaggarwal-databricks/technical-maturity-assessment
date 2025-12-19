# PostgreSQL Setup Guide

## Overview

This application **REQUIRES PostgreSQL** to run. File-based storage has been removed to ensure data integrity and support advanced features like the Enhanced Author Role.

## Quick Start

### Option 1: Local PostgreSQL (macOS)

```bash
# Install PostgreSQL (if not installed)
brew install postgresql@14

# Start PostgreSQL
brew services start postgresql@14

# Create database
createdb maturity_assessment

# Create user (optional)
psql postgres
CREATE USER maturity_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE maturity_assessment TO maturity_user;
\q

# Set DATABASE_URL in .env
echo "DATABASE_URL=postgresql://maturity_user:your_password@localhost:5432/maturity_assessment" >> .env
```

### Option 2: Docker PostgreSQL

```bash
# Run PostgreSQL in Docker
docker run --name maturity-postgres \
  -e POSTGRES_DB=maturity_assessment \
  -e POSTGRES_USER=maturity_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:14

# Set DATABASE_URL in .env
echo "DATABASE_URL=postgresql://maturity_user:your_password@localhost:5432/maturity_assessment" >> .env
```

### Option 3: Railway PostgreSQL (Production)

```bash
# In Railway dashboard:
1. Click "+ New" → "Database" → "PostgreSQL"
2. Railway automatically sets DATABASE_URL environment variable
3. No manual configuration needed!
```

## Verify Connection

```bash
# Test the connection
npm start

# You should see:
# 🔌 Connecting to PostgreSQL database...
# ✅ PostgreSQL connected successfully
# ⏰ Database time: ...
```

## Environment Variables

### Required

```bash
DATABASE_URL=postgresql://user:password@host:port/database
```

### Format Examples

**Local:**
```
DATABASE_URL=postgresql://localhost:5432/maturity_assessment
DATABASE_URL=postgresql://maturity_user:password@localhost:5432/maturity_assessment
```

**Railway (auto-provided):**
```
DATABASE_URL=postgresql://user:pass@containers-us-west-1.railway.app:1234/railway
```

**Heroku:**
```
DATABASE_URL=postgres://user:pass@ec2-host.compute-1.amazonaws.com:5432/dbname
```

## Troubleshooting

### Error: DATABASE_URL not found

**Problem:**
```
❌ DATABASE_URL not found - PostgreSQL is required
❌ Please set DATABASE_URL environment variable
```

**Solution:**
1. Create `.env` file in project root
2. Add: `DATABASE_URL=postgresql://localhost:5432/maturity_assessment`
3. Restart server

### Error: Connection refused

**Problem:**
```
❌ Failed to connect to PostgreSQL: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL
brew services start postgresql@14

# Or with Docker
docker start maturity-postgres
```

### Error: Database does not exist

**Problem:**
```
❌ Failed to connect to PostgreSQL: database "maturity_assessment" does not exist
```

**Solution:**
```bash
# Create the database
createdb maturity_assessment

# Or with psql
psql postgres
CREATE DATABASE maturity_assessment;
\q
```

### Error: Role does not exist

**Problem:**
```
❌ Failed to connect to PostgreSQL: role "maturity_user" does not exist
```

**Solution:**
```bash
psql postgres
CREATE USER maturity_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE maturity_assessment TO maturity_user;
\q
```

## Database Schema

The application automatically:
1. ✅ Creates all required tables on first run
2. ✅ Runs database migrations automatically
3. ✅ Sets up test users (admin, author, consumer)

Schema files:
- `server/db/schema.sql` - Base schema
- `server/migrations/*.sql` - Incremental updates

## Migration Management

### View Migration Status

```bash
# Migrations run automatically on server start
npm start

# You'll see:
# 🔄 Running 16 migration(s)...
#   ✅ 001_databricks_features.sql
#   ✅ 002_seed_databricks_features.sql
#   ...
#   ✅ 016_enhanced_author_role.sql
# ✅ Migrations completed
```

### Manual Migration

```bash
node server/db/migrate.js
```

## Data Persistence

### Local Development

Data is stored in PostgreSQL and persists between restarts.

### Railway Production

1. PostgreSQL data persists in Railway's volume
2. Automatic backups (depending on plan)
3. Access via Railway dashboard → PostgreSQL → "Connect"

### Backup & Restore

```bash
# Backup
pg_dump -h localhost -U maturity_user maturity_assessment > backup.sql

# Restore
psql -h localhost -U maturity_user maturity_assessment < backup.sql
```

## Performance Tuning

### Connection Pool Settings

In `server/db/connection.js`:

```javascript
this.pool = new Pool({
  max: 20,                    // Max connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 10000, // Connection timeout
});
```

### Query Performance

Slow queries (>1s) are automatically logged:

```
⚠️  Slow query (1523ms): SELECT * FROM assessments WHERE...
```

## Security

### Connection Security

**Development:**
- SSL disabled for localhost

**Production (Railway):**
- SSL enabled automatically
- `rejectUnauthorized: false` for Railway's self-signed certs

### Password Best Practices

1. Use strong passwords
2. Store in environment variables (never in code)
3. Use different passwords for dev/prod
4. Rotate passwords regularly

## Railway Setup Checklist

✅ Add PostgreSQL service in Railway
✅ DATABASE_URL auto-configured
✅ No manual migration needed
✅ Deploy and it works!

## Local Development Checklist

✅ Install PostgreSQL
✅ Create database
✅ Set DATABASE_URL in .env
✅ Run `npm start`
✅ Verify connection success

## Need Help?

- Check Railway logs: `railway logs`
- Check local logs: Terminal output
- Test connection: `psql $DATABASE_URL`
- View tables: `\dt` in psql

## Migration from File-Based Storage

If you were using file-based storage before:

1. ✅ Set up PostgreSQL (see above)
2. ✅ Start server - schema auto-created
3. ⚠️ Data migration needed (contact support)

**Note:** File-based storage fallback has been removed. PostgreSQL is now required.

