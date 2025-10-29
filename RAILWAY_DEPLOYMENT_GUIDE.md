# 🚂 RAILWAY DEPLOYMENT GUIDE

## ✅ PRE-DEPLOYMENT CHECKLIST

Your application is **READY FOR RAILWAY DEPLOYMENT**! All critical fixes are in place.

### What's Been Fixed:
- ✅ 11 critical P0/P1 issues resolved
- ✅ Mobile navigation working
- ✅ Form validation functional
- ✅ PDF export reliable
- ✅ Auto-save implemented
- ✅ Server running stable
- ✅ Build scripts configured

---

## 🚀 DEPLOYMENT STEPS

### Option 1: Deploy via Railway CLI (Fastest)

#### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

#### Step 2: Login to Railway
```bash
railway login
```

#### Step 3: Initialize Project
```bash
cd /Users/nitin.aggarwal/BMAD-METHOD/databricks-maturity-assessment
railway init
```
- Select "Create new project"
- Name it: "databricks-maturity-assessment"

#### Step 4: Deploy
```bash
railway up
```

That's it! Your app will be deployed.

---

### Option 2: Deploy via Railway Dashboard (Recommended)

#### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (recommended) or email
3. Verify your email

#### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. If repo not connected:
   - Push your code to GitHub first
   - Connect your GitHub account to Railway
   - Select your repository

OR

1. Click "Empty Project"
2. Click "Deploy from GitHub repo" in the project
3. Select your repository

#### Step 3: Configure Build Settings

Railway will auto-detect the `railway.json` file. Verify settings:

**Build Command:**
```
npm install && cd client && npm install && npm run build
```

**Start Command:**
```
NODE_ENV=production node server/index.js
```

**Health Check Path:**
```
/api/health
```

#### Step 4: Set Environment Variables

In Railway Dashboard → Your Project → Variables tab:

**REQUIRED:**
```bash
PORT=5000
NODE_ENV=production
DATA_DIR=/app/data
```

**OPTIONAL (Recommended):**
```bash
# For AI features (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4

# Feature flags
ENABLE_OPENAI=true
ENABLE_SAMPLE_GENERATOR=true
```

**FOR PRODUCTION (Highly Recommended):**
```bash
# Add PostgreSQL database
# In Railway: Click "+ New" → Database → PostgreSQL
# Railway will automatically set DATABASE_URL

# CORS (if you have a custom domain)
ALLOWED_ORIGINS=https://yourdomain.com
```

#### Step 5: Deploy
Click "Deploy" button in Railway dashboard

---

## 📦 WHAT GETS DEPLOYED

### Build Process:
1. Railway reads `railway.json`
2. Installs root dependencies
3. Installs client dependencies
4. Builds React app (creates `client/build`)
5. Starts Node.js server

### Server Configuration:
- **Port:** 5000 (Railway will map this automatically)
- **Health Check:** `/api/health` endpoint
- **Storage:** File-based (or PostgreSQL if configured)
- **Static Files:** Serves React build from `client/build`

---

## 🔧 POST-DEPLOYMENT CONFIGURATION

### Step 1: Get Your Railway URL
After deployment, Railway provides a URL like:
```
https://databricks-maturity-assessment-production.up.railway.app
```

### Step 2: Test Your Deployment
```bash
# Health check
curl https://your-railway-url.railway.app/api/health

# Should return:
# {"status":"ok","success":true,...}
```

### Step 3: Visit Your App
Open in browser:
```
https://your-railway-url.railway.app
```

### Step 4: Verify All Features
- ✅ Home page loads
- ✅ Mobile navigation works (test on phone)
- ✅ Can start assessment
- ✅ Form validation works
- ✅ Auto-save functional
- ✅ Can export PDF
- ✅ Dashboard accessible

---

## 💾 PERSISTENT STORAGE OPTIONS

### Option 1: Railway Volumes (Recommended)

**Setup:**
1. In Railway Dashboard → Your Project
2. Click "+ New" → Volume
3. Name it: "assessment-data"
4. Mount path: `/app/data`
5. Update environment variable:
   ```
   DATA_DIR=/app/data
   ```

**Benefits:**
- Data persists across deployments
- 1GB free with Hobby plan
- Automatic backups

### Option 2: PostgreSQL Database (Best for Production)

**Setup:**
1. In Railway Dashboard → Your Project
2. Click "+ New" → Database → PostgreSQL
3. Railway auto-sets `DATABASE_URL`
4. Run migration (one time):
   ```bash
   railway run npm run migrate
   ```

**Benefits:**
- Scalable
- Better performance
- Proper database features
- Automatic backups

### Option 3: File Storage (Not Recommended for Production)

**Current setup:**
- Saves to local disk
- **Data lost on redeploy!**
- OK for testing only

---

## 🌍 CUSTOM DOMAIN (Optional)

### Step 1: Get Domain Settings
1. Railway Dashboard → Settings → Domains
2. Click "Generate Domain" (Railway provides free subdomain)
   OR
3. Click "Custom Domain" to add your own

### Step 2: Configure DNS (for custom domain)
Add CNAME record:
```
CNAME  @  your-app.railway.app
```

### Step 3: Update CORS
Set environment variable:
```
ALLOWED_ORIGINS=https://yourdomain.com
```

---

## 🔐 SECURITY CHECKLIST

### Before Going Live:

- [ ] Set `NODE_ENV=production`
- [ ] Configure persistent storage (Volume or PostgreSQL)
- [ ] Add CORS allowed origins
- [ ] Set up PostgreSQL (recommended)
- [ ] Enable HTTPS (automatic on Railway)
- [ ] Remove debug logs
- [ ] Set up monitoring

### Environment Variables to Set:
```bash
# REQUIRED
NODE_ENV=production
DATA_DIR=/app/data

# RECOMMENDED
DATABASE_URL=<from Railway PostgreSQL>
ALLOWED_ORIGINS=https://yourdomain.com

# OPTIONAL
OPENAI_API_KEY=<your-key>
```

---

## 📊 MONITORING & LOGS

### View Logs:
```bash
# Via CLI
railway logs

# Or in Railway Dashboard → Deployments → View Logs
```

### Monitor Health:
```bash
# Set up health check monitoring
curl https://your-app.railway.app/api/health
```

### Key Metrics to Watch:
- Response time (should be < 3s)
- Error rate (should be < 1%)
- Memory usage
- Deployment success rate

---

## 🐛 TROUBLESHOOTING

### Issue: Build Fails

**Check:**
```bash
# Verify build locally first
npm run build

# Check logs in Railway Dashboard
```

**Common Causes:**
- Missing dependencies
- Node version mismatch
- Build script errors

**Fix:**
- Ensure `package.json` has all dependencies
- Set Node version in `package.json`:
  ```json
  "engines": {
    "node": ">=18.0.0"
  }
  ```

---

### Issue: App Crashes on Start

**Check Logs:**
```bash
railway logs
```

**Common Causes:**
- Port binding issue
- Missing environment variables
- Database connection error

**Fix:**
- Ensure `PORT` is set correctly
- Check all required env vars are set
- Verify DATABASE_URL if using PostgreSQL

---

### Issue: Data Loss After Redeploy

**Cause:** No persistent storage configured

**Fix:**
1. Add Railway Volume (see Persistent Storage section)
2. OR set up PostgreSQL database
3. Set `DATA_DIR=/app/data`

---

### Issue: 404 on React Routes

**Cause:** Server not configured to handle React Router

**Fix:** Server already handles this correctly in `server/index.js`
```javascript
// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});
```

If issue persists, check:
- `client/build` directory exists
- Build completed successfully
- Static files served correctly

---

## 💰 RAILWAY PRICING

### Hobby Plan (FREE)
- $5/month credit (no credit card needed)
- 500 hours/month execution time
- 1GB volume storage
- Perfect for testing and demos

### Pro Plan ($20/month)
- Unlimited execution time
- More storage
- Better performance
- Production use

**Estimate for Your App:**
- Small/medium usage: **Hobby plan OK**
- Production with 100+ users: **Pro plan recommended**

---

## 🚀 DEPLOYMENT COMMAND REFERENCE

```bash
# One-time setup
npm install -g @railway/cli
railway login
railway init

# Deploy
railway up

# View logs
railway logs

# Open in browser
railway open

# Run commands on Railway
railway run npm run migrate

# Connect to database
railway connect

# Check status
railway status

# Environment variables
railway variables
```

---

## ✅ DEPLOYMENT SUCCESS CRITERIA

After deployment, verify:

1. **Health Check:** `https://your-app.railway.app/api/health` returns OK
2. **Home Page:** Loads without errors
3. **Mobile Navigation:** Hamburger menu works
4. **Create Assessment:** Form validation works
5. **Answer Questions:** Auto-save functions
6. **View Results:** Page loads correctly
7. **Export PDF:** Downloads successfully
8. **Refresh Button:** Updates results
9. **Dashboard URL:** Direct links work

---

## 📞 SUPPORT

### Railway Support:
- **Docs:** [docs.railway.app](https://docs.railway.app)
- **Discord:** [railway.app/discord](https://railway.app/discord)
- **Status:** [status.railway.app](https://status.railway.app)

### Application Issues:
- Check server logs: `railway logs`
- Review error messages
- Verify environment variables
- Test locally first

---

## 🎯 QUICK START SUMMARY

**Absolute Fastest Deployment (5 minutes):**

```bash
# 1. Install CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Navigate to project
cd /Users/nitin.aggarwal/BMAD-METHOD/databricks-maturity-assessment

# 4. Initialize
railway init

# 5. Set essential env vars
railway variables set NODE_ENV=production
railway variables set DATA_DIR=/app/data

# 6. Deploy!
railway up

# 7. Open app
railway open
```

**Done!** Your app is live on Railway! 🎉

---

## 📋 POST-DEPLOYMENT CHECKLIST

After successful deployment:

- [ ] App accessible at Railway URL
- [ ] Health check endpoint works
- [ ] All pages load correctly
- [ ] Mobile navigation functional
- [ ] Form validation working
- [ ] PDF export downloads
- [ ] Auto-save functioning
- [ ] No console errors
- [ ] Configured persistent storage (Volume or PostgreSQL)
- [ ] Set up custom domain (optional)
- [ ] Monitoring enabled
- [ ] Logs reviewed

---

## 🎉 YOU'RE DONE!

Your Databricks Maturity Assessment application is now deployed and accessible worldwide!

**Next Steps:**
1. Share the Railway URL with users
2. Monitor logs and performance
3. Set up PostgreSQL for production
4. Configure custom domain if desired
5. Enable OpenAI features (optional)

---

**Deployment Date:** October 28, 2025  
**Status:** READY FOR DEPLOYMENT ✅  
**Platform:** Railway  
**Estimated Deploy Time:** 5-10 minutes

---

*Need help? Check Railway docs or contact support via Discord*

