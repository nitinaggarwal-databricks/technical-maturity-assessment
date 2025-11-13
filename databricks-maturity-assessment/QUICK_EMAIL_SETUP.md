# ⚡ Quick Email Setup for Railway (5 Minutes)

## Fastest Way to Enable Emails

### Step 1: Get Gmail App Password (2 minutes)

1. **Go to:** https://myaccount.google.com/apppasswords
2. **If prompted:** Enable 2-Step Verification first
3. **Select app:** Mail
4. **Select device:** Other (Custom name) → Type "Railway"
5. **Click:** Generate
6. **Copy** the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 2: Configure Railway (2 minutes)

1. **Go to:** https://railway.app/
2. **Select:** Your databricks-maturity-assessment project
3. **Click:** Your service (server)
4. **Go to:** Variables tab
5. **Add these 6 variables:**

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM=youremail@gmail.com
FRONTEND_URL=https://your-app.up.railway.app
```

**Replace:**
- `youremail@gmail.com` with your actual Gmail address
- `abcdefghijklmnop` with your 16-char app password (no spaces)
- `your-app.up.railway.app` with your Railway app URL

### Step 3: Verify (1 minute)

1. Railway will **auto-deploy** after adding variables
2. **Check logs** for: `✉️  Email transporter configured`
3. **Test:** Assign an assessment to a user
4. **Check:** User's email inbox (and spam folder)

---

## ✅ Done!

Your application can now send:
- ✉️ Assessment assignment notifications
- 🔔 Reminder emails
- 📬 Completion notifications

---

## 🆘 Troubleshooting

### "Email not configured" in logs
- **Fix:** Make sure all 6 variables are set (no typos)

### "Authentication failed"
- **Fix:** Use App Password, NOT your regular Gmail password
- **Link:** https://myaccount.google.com/apppasswords

### Emails not received
- **Check:** Spam/junk folder
- **Check:** Railway logs for send errors
- **Verify:** Gmail 2-Step Verification is enabled

---

## 📚 Need More Options?

See **RAILWAY_EMAIL_SETUP.md** for:
- SendGrid setup (100 emails/day free)
- AWS SES setup (production scale)
- Mailgun setup (5,000 emails/month)
- Advanced troubleshooting
- Production best practices

---

## 🧪 Test Locally

Before deploying to Railway, test your configuration:

```bash
# Add variables to .env file
echo "EMAIL_HOST=smtp.gmail.com" >> .env
echo "EMAIL_PORT=587" >> .env
echo "EMAIL_USER=youremail@gmail.com" >> .env
echo "EMAIL_PASSWORD=your-app-password" >> .env
echo "EMAIL_FROM=youremail@gmail.com" >> .env
echo "FRONTEND_URL=http://localhost:3000" >> .env

# Run test script
node test-email-config.js
```

---

## 📊 Gmail Limits

- **Free Gmail:** ~500 emails/day
- **Google Workspace:** 2,000 emails/day

For higher volumes, use SendGrid, AWS SES, or Mailgun (see RAILWAY_EMAIL_SETUP.md).

---

## 🎯 Current Status

✅ Email functionality is **already implemented** in the code  
✅ No code changes needed  
✅ Just add environment variables on Railway  
✅ Emails will start working immediately  

**Files that handle emails:**
- `server/routes/assignments.js` - Email sending logic
- `server/routes/notifications.js` - Notification system

---

**Total Time:** ~5 minutes  
**Difficulty:** Easy  
**Cost:** Free (Gmail)


