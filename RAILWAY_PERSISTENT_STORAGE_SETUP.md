# 🚂 Railway Persistent Storage Setup Guide

## 🔴 **The Problem You're Facing**

Your app works locally but fails on Railway when accessed from other devices because:

- ✅ **Local**: Data persists in `server/data/assessments.json`
- ❌ **Railway**: Container filesystem is **ephemeral** (lost on restart/redeploy)

**Symptoms:**
- Cannot see saved assessments from other devices
- Get "Failed to start assessment" errors
- Data disappears after Railway redeploys

---

## ✅ **The Solution: Railway Volumes**

Railway provides **persistent volumes** that survive container restarts and redeployments. We've configured your app to use this.

---

## 📋 **Setup Steps (Railway Dashboard)**

### **Step 1: Configure Environment Variable**

1. Go to your Railway project: [https://railway.app/dashboard](https://railway.app/dashboard)
2. Click on your `web-production-76e27` service
3. Go to the **Variables** tab
4. Add this new variable:
   ```
   Variable Name: DATA_DIR
   Value: /app/persistent-data
   ```
5. Click **Add** to save

### **Step 2: Wait for Auto-Redeploy**

Railway will automatically detect the git push and redeploy your app with:
- ✅ The new volume configuration (`railway.toml` has `[[volumes]]` configured)
- ✅ The environment variable you just added
- ✅ Persistent storage at `/app/persistent-data/assessments.json`

**⏱️ This usually takes 3-5 minutes.**

### **Step 3: Verify the Deployment**

1. **Check Deployment Logs:**
   - Go to **Deployments** tab in Railway
   - Click on the latest deployment
   - Look for these log messages:
     ```
     📁 Data directory: /app/persistent-data
     📄 Data file path: /app/persistent-data/assessments.json
     🚀 Databricks Maturity Assessment API running on port 5000
     ```

2. **Test from Another Device:**
   - Open https://web-production-76e27.up.railway.app/ on your phone or another computer
   - Click **"Start New Assessment"**
   - Fill in the form and submit
   - ✅ Should work without errors!

3. **Test Data Persistence:**
   - Create an assessment
   - Go to Railway → Click **"Restart"** on your service
   - Wait for restart (30 seconds)
   - Refresh browser
   - ✅ Your assessment should still be there!

---

## 🔧 **How It Works**

### **Before (Ephemeral Storage):**
```
Container Restart → Data Lost 💀
/app/server/data/assessments.json → Deleted on every restart
```

### **After (Persistent Volume):**
```
Container Restart → Data Preserved ✅
/app/persistent-data/assessments.json → Mounted volume, survives restarts
```

### **Code Changes Made:**

1. **`server/index.js`**: Now uses `DATA_DIR` environment variable:
   ```javascript
   const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
   const dataFilePath = path.join(dataDir, 'assessments.json');
   ```

2. **`railway.toml`**: Volume configuration added:
   ```toml
   [[volumes]]
   mountPath = "/app/persistent-data"
   ```

---

## 🧪 **Testing Checklist**

After Railway redeploys, test these scenarios:

- [ ] Start a new assessment from another device
- [ ] Fill out and submit responses
- [ ] View assessment results
- [ ] Restart the Railway service
- [ ] Verify data persists after restart
- [ ] Check that "Past Assessments" shows all saved assessments

---

## 🆘 **Troubleshooting**

### **Issue: Still getting "Failed to start assessment"**

**Check:**
1. Verify `DATA_DIR` variable is set in Railway Variables tab
2. Check deployment logs for errors
3. Make sure the latest deployment completed successfully

**Solution:**
```bash
# In Railway dashboard → Deployments
1. Look for latest deployment status
2. If failed, check error logs
3. Try manually redeploying (Deployments → Redeploy)
```

### **Issue: Volume not mounting**

**Symptoms:**
- Logs show: `📁 Data directory: /app/server/data` (NOT `/app/persistent-data`)

**Solution:**
1. Double-check `DATA_DIR=/app/persistent-data` is set in Variables
2. Redeploy manually from Railway dashboard
3. Wait 3-5 minutes for full deployment

### **Issue: Permission denied errors**

**Symptoms:**
- Logs show: `Error: EACCES: permission denied, open '/app/persistent-data/assessments.json'`

**Solution:**
- Railway should automatically handle permissions
- If issue persists, try restarting the service from Railway dashboard

---

## 📊 **Volume Limits (Railway Free Tier)**

- **Storage**: 1 GB (more than enough for JSON files)
- **Persistence**: Permanent (survives restarts, redeployments)
- **Backups**: Not included in free tier (consider exporting data periodically)

---

## 🚀 **Next Steps After Setup**

1. **Set OpenAI Environment Variables** (for live data features):
   ```
   OPENAI_API_KEY = your-openai-api-key
   USE_LIVE_DATA = true
   ```

2. **Monitor Storage Usage:**
   - Go to Railway → Your service → **Metrics**
   - Check "Disk Usage" graph
   - Alerts you if approaching 1 GB limit

3. **Optional: Add Backup Strategy:**
   - Periodically download `assessments.json` via Railway CLI
   - Or implement automated backups to S3/Google Cloud Storage

---

## ✅ **Success Indicators**

You'll know it's working when:

1. ✅ Logs show: `📁 Data directory: /app/persistent-data`
2. ✅ Can start assessments from any device
3. ✅ Data persists after Railway service restarts
4. ✅ "Past Assessments" page shows all saved assessments
5. ✅ No more "Failed to start assessment" errors

---

## 📚 **Railway Volume Documentation**

Learn more about Railway volumes:
- [Railway Volumes Guide](https://docs.railway.app/reference/volumes)
- [Persistent Storage Best Practices](https://docs.railway.app/guides/volumes)

---

## 🎯 **Summary**

**What We Fixed:**
- ❌ Ephemeral filesystem losing data
- ❌ Assessment creation failing from other devices

**What We Added:**
- ✅ Persistent Railway volume at `/app/persistent-data`
- ✅ Environment variable `DATA_DIR` to control storage location
- ✅ Automatic data persistence across restarts

**Your Action:**
1. Set `DATA_DIR=/app/persistent-data` in Railway Variables
2. Wait for auto-redeploy (3-5 minutes)
3. Test from another device ✅

---

**Need Help?** 
- Check Railway deployment logs first
- Verify environment variable is set
- Try manual redeploy from Railway dashboard






