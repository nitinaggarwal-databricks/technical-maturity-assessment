# Railway Persistent Storage Setup Guide

## ✅ Complete Checklist to Prevent Data Loss

Follow these steps to ensure your data is never lost:

### 1. Volume Configuration

**In Railway Dashboard:**

1. Go to your service → **Variables** tab
2. Click **New Variable**
3. Add: `DATA_DIR` = `/app/data`
4. Click **Add**

**Add Volume:**

1. Go to your service → **Settings** tab
2. Scroll to **Volumes** section
3. Click **New Volume**
4. Set **Mount Path**: `/app/data`
5. Set **Volume Name**: `assessment-data` (or any name you prefer)
6. Click **Add**

### 2. Verify Configuration

After deployment, check these endpoints:

**Status Endpoint:**
```
https://your-app.railway.app/status
```

Should show:
```json
{
  "success": true,
  "storage": {
    "dataDir": "/app/data",
    "dataFilePath": "/app/data/assessments.json",
    "dataFileExists": true,
    "assessmentCount": X,
    "volumeMounted": true,
    "dataDirEnv": "/app/data"
  }
}
```

**Check Server Logs:**

Look for these messages on startup:
- ✅ `Using Railway persistent volume at: /app/data`
- ✅ `Storage is writable - data persistence confirmed`
- ✅ `Loaded X assessments from disk`

**❌ Bad Signs (means data will be lost):**
- ⚠️ `WARNING: DATA_DIR not set - using local storage`
- ❌ `Storage is NOT writable`
- ⚠️ `ALL DATA WILL BE LOST ON RESTART`

### 3. Environment Variables Summary

Required for production:

| Variable | Value | Purpose |
|----------|-------|---------|
| `DATA_DIR` | `/app/data` | **CRITICAL** - Points to persistent volume |
| `NODE_ENV` | `production` | Enables production mode |
| `PORT` | `5000` | Server port (Railway auto-sets this) |

Optional but recommended:

| Variable | Value | Purpose |
|----------|-------|---------|
| `USE_LIVE_DATA` | `true` | Enable live Databricks feature updates |
| `OPENAI_API_KEY` | `sk-...` | Enable AI-powered recommendations |

### 4. Data Backup Strategy

Your data is now automatically backed up:

- **Automatic Backup**: Every save creates `assessments.json.backup`
- **Atomic Writes**: Uses temporary file + rename to prevent corruption
- **Auto-Recovery**: Restores from backup if main file is corrupted

**Manual Backup:**

You can download your data anytime:

```bash
# Using Railway CLI
railway run cat /app/data/assessments.json > backup-$(date +%Y%m%d).json
```

Or use the API endpoint (create one if needed).

### 5. What Happens Now

**✅ With Persistent Storage (Current Setup):**
- Data survives deployments
- Data survives restarts
- Data survives crashes
- Assessments persist forever

**❌ Without Persistent Storage (Old Setup):**
- Data lost on every deployment
- Data lost on restart
- Data lost on crash
- Assessments disappeared

### 6. Testing Data Persistence

**Test It:**

1. Create a test assessment
2. Fill in some questions
3. Note the assessment ID
4. Redeploy your Railway service:
   ```bash
   git commit --allow-empty -m "Test deployment"
   git push
   ```
5. After redeployment, visit: `/results/YOUR-ASSESSMENT-ID`
6. **If you see your data → ✅ Success!**
7. **If you see 404 → ❌ Volume not configured correctly**

### 7. Monitoring

**Regular Checks:**

- Visit `/status` endpoint weekly
- Check `assessmentCount` is not dropping to 0
- Verify `dataFileExists: true`
- Monitor file size growing over time

**Set Up Alerts (Optional):**

In Railway, you can set up notifications for:
- Service crashes
- High memory usage
- Deployment failures

### 8. Troubleshooting

**Problem: Data is being lost**

Check:
1. Is `DATA_DIR` environment variable set to `/app/data`?
2. Is volume mounted at `/app/data`?
3. Does `/status` show `volumeMounted: true`?
4. Do logs show "Using Railway persistent volume"?

**Problem: Can't write data**

Check:
1. Volume size (Railway dashboard)
2. File permissions (shouldn't be an issue on Railway)
3. Logs for "Storage is NOT writable" errors

**Problem: Old assessments missing**

If assessments created before volume setup are missing:
- **They are gone forever** (no backup existed)
- Only new assessments will persist
- This is normal after setting up persistence

### 9. File Structure on Volume

Your persistent volume contains:

```
/app/data/
├── assessments.json       # Main data file
├── assessments.json.backup # Auto-backup (created on each save)
└── assessments.json.tmp    # Temporary file (deleted after write)
```

### 10. Data Recovery Process

If data corruption occurs:

1. **Automatic Recovery**: System tries backup file automatically
2. **Manual Recovery**: Download backup from Railway console
3. **Contact Support**: If all else fails, Railway support can help access volume

---

## Summary

✅ **Your Setup Now:**
- Railway Volume mounted at `/app/data`
- Environment variable `DATA_DIR=/app/data`
- Automatic backups on every save
- Atomic writes prevent corruption
- Auto-recovery from backup

✅ **You're Protected Against:**
- Deployments
- Restarts
- Crashes
- File corruption
- Accidental overwrites

🎉 **Your data is now SAFE!**

---

## Quick Verification Commands

After each deployment, run these checks:

```bash
# 1. Check status endpoint
curl https://your-app.railway.app/status | jq

# 2. Check Railway logs
railway logs

# 3. List assessments
curl https://your-app.railway.app/api/assessments | jq
```

All should show your data is present and volume is mounted.



