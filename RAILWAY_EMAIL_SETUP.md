# Railway Email Configuration Guide

## Overview
The application uses Nodemailer to send email notifications for assessment assignments and reminders. This guide will help you configure email on Railway.

## Email Service Options

### Option 1: Gmail (Recommended for Testing)

#### Step 1: Create a Gmail App Password
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Select app: **Mail**
5. Select device: **Other (Custom name)** → Enter "Railway Databricks Assessment"
6. Click **Generate**
7. Copy the 16-character password (you won't see it again)

#### Step 2: Configure Railway Environment Variables
Go to your Railway project → **Variables** tab and add:

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com
FRONTEND_URL=https://your-railway-app.up.railway.app
```

**Important Notes:**
- Use the App Password, NOT your regular Gmail password
- Gmail has a sending limit of ~500 emails/day for free accounts
- For production, consider using a dedicated email service

---

### Option 2: SendGrid (Recommended for Production)

#### Step 1: Create SendGrid Account
1. Sign up at https://sendgrid.com/ (Free tier: 100 emails/day)
2. Verify your email address
3. Create an API Key:
   - Go to **Settings** → **API Keys**
   - Click **Create API Key**
   - Name: "Railway Databricks Assessment"
   - Permissions: **Full Access** or **Mail Send** only
   - Copy the API key (shown only once)

#### Step 2: Verify Sender Identity
1. Go to **Settings** → **Sender Authentication**
2. Choose **Single Sender Verification** (for testing)
3. Enter your email and verify it
4. Or use **Domain Authentication** for production

#### Step 3: Configure Railway Environment Variables
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=verified-sender@yourdomain.com
FRONTEND_URL=https://your-railway-app.up.railway.app
```

---

### Option 3: AWS SES (Best for Production Scale)

#### Step 1: Set Up AWS SES
1. Go to AWS Console → **Amazon SES**
2. Verify your email or domain
3. Request production access (starts in sandbox mode)
4. Create SMTP credentials:
   - Go to **SMTP Settings**
   - Click **Create SMTP Credentials**
   - Download credentials

#### Step 2: Configure Railway Environment Variables
```bash
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-aws-smtp-username
EMAIL_PASSWORD=your-aws-smtp-password
EMAIL_FROM=verified-sender@yourdomain.com
FRONTEND_URL=https://your-railway-app.up.railway.app
```

---

### Option 4: Mailgun

#### Step 1: Create Mailgun Account
1. Sign up at https://www.mailgun.com/ (Free tier: 5,000 emails/month for 3 months)
2. Verify your email
3. Add and verify your domain (or use sandbox domain for testing)
4. Get SMTP credentials:
   - Go to **Sending** → **Domain Settings** → **SMTP Credentials**

#### Step 2: Configure Railway Environment Variables
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your-mailgun-smtp-password
EMAIL_FROM=noreply@your-domain.mailgun.org
FRONTEND_URL=https://your-railway-app.up.railway.app
```

---

## Setting Environment Variables on Railway

### Method 1: Railway Dashboard (Recommended)
1. Go to https://railway.app/
2. Select your project: **databricks-maturity-assessment**
3. Click on your service (server)
4. Go to **Variables** tab
5. Click **+ New Variable**
6. Add each variable one by one:
   - Variable: `EMAIL_HOST`
   - Value: `smtp.gmail.com` (or your chosen provider)
7. Click **Add**
8. Repeat for all email variables
9. Railway will automatically redeploy

### Method 2: Railway CLI
```bash
# Install Railway CLI if not already installed
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Set environment variables
railway variables set EMAIL_HOST=smtp.gmail.com
railway variables set EMAIL_PORT=587
railway variables set EMAIL_USER=your-email@gmail.com
railway variables set EMAIL_PASSWORD=your-app-password
railway variables set EMAIL_FROM=your-email@gmail.com
railway variables set FRONTEND_URL=https://your-railway-app.up.railway.app
```

---

## Testing Email Configuration

### Option 1: Check Server Logs
After deploying with email configuration:
1. Go to Railway Dashboard → Your Service → **Deployments**
2. Click on the latest deployment
3. Check logs for:
   - ✅ `✉️  Email transporter configured` (success)
   - ❌ `⚠️  Email not configured - invitations will not be sent` (missing config)

### Option 2: Test Assignment Email
1. Login as Admin or Author
2. Go to **Assignments** → **Assign Assessment**
3. Create a test assignment and assign to a consumer
4. Check the consumer's email inbox (and spam folder)
5. Check Railway logs for email send confirmation

### Option 3: Test Reminder Email
1. Go to **My Assignments** (as Author)
2. Click **Remind** on an assignment
3. Check consumer's email
4. Check Railway logs

---

## Troubleshooting

### Issue: "Email not configured" in logs
**Solution:** Ensure all required environment variables are set:
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASSWORD`

### Issue: "Authentication failed" error
**Solutions:**
- **Gmail:** Use App Password, not regular password
- **SendGrid:** Ensure API key has Mail Send permission
- **AWS SES:** Verify SMTP credentials are correct
- Check username/password for typos

### Issue: Emails not received
**Solutions:**
1. Check spam/junk folder
2. Verify sender email is verified with your provider
3. Check Railway logs for send errors
4. For Gmail: Ensure 2-Step Verification is enabled
5. For SendGrid/AWS SES: Verify sender identity

### Issue: "Connection timeout"
**Solutions:**
- Check `EMAIL_PORT` is correct (usually 587 for TLS)
- Try port 465 for SSL
- Ensure Railway can access external SMTP servers (should be allowed by default)

### Issue: Rate limit exceeded
**Solutions:**
- Gmail: Max ~500 emails/day
- SendGrid Free: 100 emails/day
- Upgrade to paid plan for higher limits

---

## Email Template Customization

The email templates are defined in `server/routes/assignments.js`. To customize:

1. Edit the `sendAssignmentEmail` function (line 34)
2. Modify the email subject and HTML content
3. Commit and push changes
4. Railway will auto-deploy

---

## Security Best Practices

1. **Never commit credentials** to Git
2. **Use App Passwords** for Gmail (not regular password)
3. **Use API Keys** for SendGrid/Mailgun
4. **Rotate credentials** regularly
5. **Use environment variables** for all sensitive data
6. **Enable 2FA** on email service accounts
7. **Monitor usage** to detect unauthorized access

---

## Production Recommendations

For production deployments:

1. **Use a dedicated email service** (SendGrid, AWS SES, Mailgun)
2. **Verify your domain** for better deliverability
3. **Set up SPF, DKIM, and DMARC** records
4. **Use a professional "from" address** (e.g., noreply@yourdomain.com)
5. **Monitor email bounce rates** and deliverability
6. **Implement rate limiting** to prevent abuse
7. **Add unsubscribe links** for compliance
8. **Keep logs** of all sent emails

---

## Quick Start (Gmail)

**Fastest way to get emails working:**

1. **Get Gmail App Password:**
   - https://myaccount.google.com/apppasswords
   - Generate password for "Mail" → "Other"

2. **Set Railway Variables:**
   ```bash
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   EMAIL_FROM=youremail@gmail.com
   FRONTEND_URL=https://your-app.up.railway.app
   ```

3. **Deploy and Test:**
   - Railway auto-deploys on variable changes
   - Check logs for "✉️  Email transporter configured"
   - Test by assigning an assessment

---

## Support

If you encounter issues:
1. Check Railway deployment logs
2. Verify all environment variables are set correctly
3. Test with a simple email service first (Gmail)
4. Check email provider's documentation
5. Review `server/routes/assignments.js` for email logic

---

## Current Implementation

The email functionality is already implemented in the codebase:

- **File:** `server/routes/assignments.js`
- **Function:** `sendAssignmentEmail()` (line 34)
- **Triggers:**
  - New assignment created (line 162)
  - Reminder sent (line 345)
- **Features:**
  - Assignment notifications
  - Custom messages
  - Assessment links
  - Author information

**No code changes needed** - just configure environment variables on Railway!

