# 🚀 Railway: Setup Test Users

## Quick Fix for "Invalid email or password" Error

If you're seeing login errors on Railway, the test users haven't been created yet. Follow these steps:

---

## Option 1: Run SQL Script (Fastest - 2 minutes)

### Step 1: Access Railway PostgreSQL
1. Go to https://railway.app/
2. Open your project: **databricks-maturity-assessment**
3. Click on your **Postgres** service
4. Go to the **Data** tab
5. Click **Query** button

### Step 2: Run the SQL Script
Copy and paste the entire contents of `CREATE_TEST_USERS.sql` into the query editor and click **Run**.

Or copy this:

```sql
-- ADMIN USER (admin@databricks.com / admin123)
INSERT INTO users (email, password_hash, role, first_name, last_name, organization, is_active)
VALUES ('admin@databricks.com', '$2b$10$kSwD41xn7FJJxHI66SNuU.AbjNsDBfMcSXChtqP2MvRonq53.EwtO', 'admin', 'Admin', 'User', 'Databricks', true)
ON CONFLICT (email) DO NOTHING;

-- AUTHOR USER (author@databricks.com / author123)
INSERT INTO users (email, password_hash, role, first_name, last_name, organization, is_active)
VALUES ('author@databricks.com', '$2b$10$dbE0yEMT1SXIiCpscsYUlu2W2iU6AavP62tR8dOV0V71tHVBNG13C', 'author', 'Author', 'User', 'Databricks', true)
ON CONFLICT (email) DO NOTHING;

-- CONSUMER USER (consumer@example.com / consumer123)
INSERT INTO users (email, password_hash, role, first_name, last_name, organization, is_active)
VALUES ('consumer@example.com', '$2b$10$SZQqgXNUDwh1WikhSF6UNujAUvgJWU6nB3yIRhp3Yl2NZVrPKaBfa', 'consumer', 'Consumer', 'User', 'Example Corp', true)
ON CONFLICT (email) DO NOTHING;
```

### Step 3: Verify
Run this query to verify users were created:

```sql
SELECT email, role, first_name, last_name FROM users;
```

You should see 3 users:
- admin@databricks.com (admin)
- author@databricks.com (author)
- consumer@example.com (consumer)

### Step 4: Test Login
Go back to your app and try logging in with:
- **Admin:** admin@databricks.com / admin123
- **Author:** author@databricks.com / author123
- **Consumer:** consumer@example.com / consumer123

✅ **Done!** The login should work now.

---

## Option 2: Wait for Automatic Migration (5-10 minutes)

The migration `007_add_test_users.sql` will run automatically when:
1. Railway redeploys your application (already triggered by latest push)
2. The server starts and runs all pending migrations

**Check deployment status:**
1. Go to Railway Dashboard → Your Project
2. Click on your **server** service
3. Go to **Deployments** tab
4. Wait for the latest deployment to complete
5. Check **Logs** for: "Test users created"

---

## Option 3: Use Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Connect to PostgreSQL
railway run psql $DATABASE_URL

# Run the SQL commands
\i CREATE_TEST_USERS.sql

# Exit
\q
```

---

## Troubleshooting

### "Invalid email or password" persists
- **Check:** Users table exists
  ```sql
  SELECT * FROM users;
  ```
- **If empty:** Run the INSERT statements above
- **If error:** Check that migrations have run:
  ```sql
  SELECT * FROM schema_migrations ORDER BY version;
  ```

### "relation 'users' does not exist"
- Migrations haven't run yet
- Check server logs for migration errors
- Verify `DATABASE_URL` is set in Railway environment variables

### Users created but login still fails
- **Clear browser cache** and try again
- **Check server logs** for authentication errors
- **Verify password hashes** match in database

---

## Test Credentials Reference

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@databricks.com | admin123 |
| **Author** | author@databricks.com | author123 |
| **Consumer** | consumer@example.com | consumer123 |

These credentials are displayed on the login screen for easy reference.

---

## Why This Happened

The test users are created by database migration `007_add_test_users.sql`, which runs automatically when the server starts. However, if:
- This is a fresh Railway deployment
- The migration hasn't run yet
- There was an error during migration

Then the users won't exist, causing login failures.

Running the SQL script manually is the fastest way to fix this.

---

## Next Steps

After creating test users:
1. ✅ Login as Admin to test full functionality
2. ✅ Switch to Author role (test mode) to test assignment features
3. ✅ Switch to Consumer role (test mode) to test consumer experience
4. ✅ Create actual assessments and assignments

---

**Need help?** Check the server logs in Railway for any errors.


