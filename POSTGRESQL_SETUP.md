# PostgreSQL Setup Guide

This application now uses **PostgreSQL** for persistent, reliable data storage on Railway. This eliminates data loss during deployments.

## 🎯 Benefits

✅ **True persistence** - Data survives all deployments and restarts  
✅ **Better performance** - Indexed queries for faster data access  
✅ **Scalability** - Handle thousands of concurrent assessments  
✅ **Data integrity** - ACID transactions and automatic backups  
✅ **Easy migration** - Automatic fallback to file-based storage  

---

## 🚀 Railway Setup

### Step 1: Provision PostgreSQL

1. Go to your Railway project dashboard
2. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically:
   - Create a PostgreSQL database
   - Set the `DATABASE_URL` environment variable
   - Connect it to your service

### Step 2: Verify Connection

After provisioning, check your deployment logs:

```bash
✅ PostgreSQL connected successfully
⏰ Database time: 2025-10-15T...
📋 Initializing database schema...
✅ Database schema initialized
✅ Storage ready: postgresql
```

### Step 3: Migrate Existing Data (if any)

If you have existing assessments in the file-based storage:

**Option A: Automatic Migration (Recommended)**

The application will automatically create database tables on first run. To migrate existing data:

1. SSH into your Railway service or run locally:
   ```bash
   npm run migrate
   ```

2. This will:
   - Read `data/assessments.json`
   - Import all assessments to PostgreSQL
   - Create a timestamped backup of the JSON file
   - Show migration summary

**Option B: Manual Verification**

Check the migration status:
```bash
curl https://your-app.railway.app/status
```

Look for:
```json
{
  "storage": {
    "type": "postgresql",
    "assessmentCount": 5,
    "postgresConfigured": true
  }
}
```

---

## 🏠 Local Development Setup

### Option 1: Use Railway PostgreSQL (Recommended)

1. Get your `DATABASE_URL` from Railway:
   ```bash
   # In Railway dashboard, go to your Postgres service → Variables
   # Copy the DATABASE_URL
   ```

2. Create a `.env` file in the project root:
   ```bash
   DATABASE_URL=postgresql://user:password@host:port/database
   USE_LIVE_DATA=true
   OPENAI_API_KEY=your_key_here
   ```

3. Run the application:
   ```bash
   npm run dev
   ```

### Option 2: Local PostgreSQL

1. Install PostgreSQL locally:
   ```bash
   # macOS
   brew install postgresql@14
   brew services start postgresql@14

   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. Create a database:
   ```bash
   createdb databricks_assessment
   ```

3. Set DATABASE_URL in `.env`:
   ```bash
   DATABASE_URL=postgresql://localhost:5432/databricks_assessment
   ```

4. Run the application:
   ```bash
   npm run dev
   ```

### Option 3: File-Based Storage (Fallback)

If you don't want to use PostgreSQL locally:

1. Don't set `DATABASE_URL` in `.env`
2. The application will automatically use file-based storage
3. You'll see:
   ```
   ⚠️  DATABASE_URL not found - PostgreSQL not configured
   ⚠️  Falling back to file-based storage
   📁 Using file-based storage
   ```

---

## 📊 Database Schema

The application uses a single table:

```sql
CREATE TABLE assessments (
  id VARCHAR(255) PRIMARY KEY,
  assessment_name VARCHAR(500) NOT NULL,
  assessment_description TEXT,
  organization_name VARCHAR(500),
  contact_email VARCHAR(255),
  industry VARCHAR(255),
  status VARCHAR(50) DEFAULT 'in_progress',
  progress INTEGER DEFAULT 0,
  current_category VARCHAR(100),
  completed_categories JSONB DEFAULT '[]',
  responses JSONB DEFAULT '{}',
  edit_history JSONB DEFAULT '[]',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `status` - Fast filtering by assessment status
- `contact_email` - Quick user lookups
- `updated_at` - Efficient sorting
- `responses` (GIN) - Fast JSONB queries
- `completed_categories` (GIN) - Efficient pillar queries

---

## 🔧 Troubleshooting

### "Connection timeout" or "ECONNREFUSED"

**Solution:** Check that PostgreSQL is provisioned in Railway and `DATABASE_URL` is set.

```bash
# Check Railway environment variables
railway variables

# Verify DATABASE_URL is present
```

### "Schema not initialized"

**Solution:** The schema auto-initializes on first connection. If it fails:

```bash
# Manually run schema
psql $DATABASE_URL < server/db/schema.sql
```

### "Migration failed: Assessment already exists"

**Solution:** This is normal! The migration skips existing assessments. Check the summary:

```
✅ Successfully migrated: 3
⏭️  Skipped (already exist): 2
```

### Application still shows "file" storage type

**Solution:** 
1. Verify `DATABASE_URL` is set in Railway environment
2. Restart the service
3. Check logs for connection errors
4. Test connection:
   ```bash
   psql $DATABASE_URL -c "SELECT NOW();"
   ```

### Data disappeared after deployment

**Solution:** This means PostgreSQL isn't connected. Check:

1. PostgreSQL service is running in Railway
2. `DATABASE_URL` environment variable is set
3. Services are linked in Railway

---

## 🔒 Security Best Practices

1. **Never commit DATABASE_URL** - It's auto-injected by Railway
2. **Use SSL in production** - Enabled automatically for Railway PostgreSQL
3. **Backup regularly** - Railway provides automatic daily backups
4. **Monitor connections** - Check Railway metrics dashboard

---

## 📈 Performance Tips

1. **Connection pooling** - Configured automatically (max 20 connections)
2. **Index usage** - All frequent queries use indexes
3. **JSONB optimization** - Responses stored as JSONB for fast queries
4. **Slow query logging** - Queries >1s are logged automatically

---

## 🔄 Switching Back to File Storage

If you need to switch back to file-based storage:

1. Remove `DATABASE_URL` from Railway environment variables
2. Redeploy the application
3. The app will automatically fall back to file storage

---

## 📞 Support

If you encounter issues:

1. Check Railway deployment logs
2. Run `/status` endpoint to see storage configuration
3. Review this guide for common solutions
4. Check Railway PostgreSQL service logs

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] `GET /status` shows `"type": "postgresql"`
- [ ] Can create new assessment
- [ ] Can save progress
- [ ] Can complete assessment
- [ ] Data persists after redeployment
- [ ] Migration completed successfully (if had existing data)

---

**That's it!** Your application now has enterprise-grade persistent storage. 🎉



