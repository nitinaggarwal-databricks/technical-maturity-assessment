# Railway PostgreSQL Deployment Guide

## 🎯 Quick Setup (5 minutes)

Your application is ready to deploy with PostgreSQL! Follow these steps:

### Step 1: Provision PostgreSQL on Railway

1. Go to your Railway dashboard: https://railway.app/dashboard
2. Open your project: `databricks-maturity-assessment`
3. Click **"+ New"** button in the top right
4. Select **"Database"** → **"Add PostgreSQL"**
5. Railway will automatically:
   - Create a PostgreSQL 14 instance
   - Add `DATABASE_URL` to your environment variables
   - Link it to your web service

![Add PostgreSQL](https://railway.app/blog/postgres-beta#:~:text=Click%20the%20New%20button%20and%20select%20Database%2C%20then%20Add%20PostgreSQL.)

### Step 2: Redeploy Your Application

The application will automatically detect PostgreSQL and initialize the schema.

**Option A: Trigger redeploy from Railway UI**
1. Go to your web service
2. Click **"Deploy"** → **"Redeploy"**

**Option B: Push a new commit** (already done!)
- Railway will auto-deploy the new code with PostgreSQL support

### Step 3: Verify Connection

After deployment (2-3 minutes), check the logs:

```bash
railway logs
```

**Look for these success messages:**

```
🔌 Connecting to PostgreSQL database...
✅ PostgreSQL connected successfully
⏰ Database time: 2025-10-15T...
📋 Initializing database schema...
✅ Database schema initialized
✅ Storage ready: postgresql
```

### Step 4: Test Your Application

Visit your app and check the status endpoint:

```bash
curl https://web-production-76e27.up.railway.app/status | jq '.storage'
```

**Expected output:**

```json
{
  "type": "postgresql",
  "assessmentCount": 0,
  "stats": {
    "total": 0,
    "active": 0,
    "completed": 0
  },
  "postgresConfigured": true
}
```

✅ **If you see `"type": "postgresql"` - YOU'RE DONE!** 🎉

---

## 🔄 Migrate Existing Data (Optional)

If you have existing assessments from file storage, migrate them:

### Option 1: Automatic Migration via Railway CLI

```bash
# Install Railway CLI if you haven't
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migration
railway run npm run migrate
```

### Option 2: Manual Migration

1. Download your existing `assessments.json` (if any):
   ```bash
   railway run cat /app/data/assessments.json > backup-assessments.json
   ```

2. Run the migration script:
   ```bash
   railway run npm run migrate
   ```

3. Verify:
   ```bash
   curl https://web-production-76e27.up.railway.app/status
   ```

**Migration output:**

```
🚀 Starting migration from file-based storage to PostgreSQL...
✅ PostgreSQL connected successfully
📂 Reading data from: /app/data/assessments.json
📋 Found 3 assessments in JSON file

✅ Migrated: Platform Assessment
✅ Migrated: Data Engineering Review
✅ Migrated: DBX

====================================================================
📊 MIGRATION SUMMARY
====================================================================
✅ Successfully migrated: 3
⏭️  Skipped (already exist): 0
❌ Errors: 0
📈 Total in database: 3
====================================================================

💾 Created backup: /app/data/assessments.json.backup-1697500000000
✅ Migration completed successfully!
```

---

## 🔧 Troubleshooting

### Issue: Deployment shows "file" storage instead of "postgresql"

**Solution:**

1. Verify PostgreSQL is provisioned:
   ```bash
   railway variables | grep DATABASE_URL
   ```

2. If not present, add PostgreSQL database again from Railway UI

3. Redeploy the service

### Issue: "Failed to connect to PostgreSQL"

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| PostgreSQL not provisioned | Add PostgreSQL database in Railway UI |
| Services not linked | Link PostgreSQL to web service in Railway |
| Wrong DATABASE_URL | Check Railway variables, should start with `postgresql://` |
| Connection timeout | Check Railway service status, might be cold start |

### Issue: "Migration failed"

**Debug steps:**

1. Check Railway logs for specific error:
   ```bash
   railway logs --filter migrate
   ```

2. Verify PostgreSQL is accessible:
   ```bash
   railway run psql $DATABASE_URL -c "SELECT NOW();"
   ```

3. Check if schema exists:
   ```bash
   railway run psql $DATABASE_URL -c "\dt"
   ```

### Issue: Data disappeared after deployment

**This means PostgreSQL isn't connected properly.**

1. Check `/status` endpoint - should show `"type": "postgresql"`
2. If showing `"type": "file"`, PostgreSQL isn't connected
3. Verify `DATABASE_URL` in Railway environment variables
4. Redeploy after fixing

---

## 🎨 Railway Dashboard Checklist

After setup, your Railway project should have:

- ✅ **Web Service** (your application)
  - Build command: Auto-detected
  - Start command: `npm start`
  - Environment variables: `USE_LIVE_DATA=true`, `OPENAI_API_KEY=sk-...`

- ✅ **PostgreSQL Database**
  - Version: 14.x
  - Linked to web service
  - Auto-generated `DATABASE_URL`

- ✅ **Networking**
  - Services linked (web → postgres)
  - Public domain enabled on web service

---

## 📊 Monitoring Your Database

### View Database in Railway

1. Go to PostgreSQL service in Railway
2. Click **"Data"** tab to browse tables
3. Query directly from Railway UI

### Check Connection Pool

```bash
railway run psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity WHERE datname = current_database();"
```

### View Recent Assessments

```bash
railway run psql $DATABASE_URL -c "SELECT assessment_name, status, started_at FROM assessments ORDER BY started_at DESC LIMIT 5;"
```

### Get Database Size

```bash
railway run psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size(current_database()));"
```

---

## 🔒 Security Notes

✅ **Already configured:**
- SSL/TLS encryption (Railway default)
- Connection pooling with limits
- Automatic backups (Railway managed)
- Environment variable encryption

🚨 **Remember:**
- Never commit `DATABASE_URL` to git
- Railway injects it automatically
- Rotate credentials if exposed

---

## 🚀 Next Steps After Deployment

1. ✅ Test creating a new assessment
2. ✅ Verify data persists after deployment
3. ✅ Run a complete assessment flow
4. ✅ Check executive summary generation
5. ✅ Test editing assessments with email tracking

**Everything should work exactly as before, but with persistent storage!** 🎉

---

## 📞 Need Help?

Check these resources:

1. **Railway Logs:** `railway logs` or Railway dashboard
2. **Status Endpoint:** `https://your-app.railway.app/status`
3. **PostgreSQL Guide:** `POSTGRESQL_SETUP.md` in project root
4. **Railway Docs:** https://docs.railway.app/databases/postgresql

---

**Time to deploy:** ~5 minutes  
**Downtime:** None (graceful migration)  
**Data loss risk:** Zero (automatic backup)  

Let's go! 🚀






