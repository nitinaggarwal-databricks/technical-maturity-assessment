# PostgreSQL Localhost Setup Guide

## ✅ Current Status

Your PostgreSQL setup is **already configured and running**!

- **PostgreSQL Version**: 14.19 (Homebrew)
- **Service Status**: Running ✅
- **Database**: `databricks_maturity`
- **User**: `nitin.aggarwal`
- **Connection**: `postgresql://nitin.aggarwal@localhost:5432/databricks_maturity`

---

## 🔧 Managing PostgreSQL Service

### Start PostgreSQL
```bash
brew services start postgresql@14
```

### Stop PostgreSQL
```bash
brew services stop postgresql@14
```

### Restart PostgreSQL
```bash
brew services restart postgresql@14
```

### Check Status
```bash
brew services list | grep postgresql
```

---

## 📊 Database Management

### List All Databases
```bash
psql -l
```

### Connect to a Database
```bash
psql -d databricks_maturity
```

### Create a New Database
```bash
createdb database_name
```

### Drop a Database
```bash
dropdb database_name
```

---

## 🔍 Useful psql Commands

Once connected to a database (`psql -d databricks_maturity`):

| Command | Description |
|---------|-------------|
| `\l` | List all databases |
| `\dt` | List all tables in current database |
| `\d table_name` | Describe a table's structure |
| `\du` | List all users/roles |
| `\q` | Quit psql |
| `\?` | Show all psql commands |

---

## 🛠️ Running Migrations

### Apply All Migrations
```bash
cd /Users/nitin.aggarwal/BMAD-METHOD/databricks-maturity-assessment
node server/run-migrations.js
```

### Apply a Single Migration
```bash
psql -d databricks_maturity -f server/migrations/017_add_results_release.sql
```

### Check if a Column Exists
```bash
psql -d databricks_maturity -c "\d assessments"
```

---

## 📝 Environment Configuration

Your `.env` file location:
```
/Users/nitin.aggarwal/BMAD-METHOD/databricks-maturity-assessment/.env
```

Contents:
```env
# PostgreSQL Database Configuration
DATABASE_URL=postgresql://nitin.aggarwal@localhost:5432/databricks_maturity

# Environment
NODE_ENV=development

# Server Port
PORT=5001

# Session Secret
SESSION_SECRET=your-secret-key-here-change-this-in-production
```

---

## 🐛 Troubleshooting

### Can't Connect to PostgreSQL
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Check if the service is listening on port 5432
lsof -i :5432

# Restart the service
brew services restart postgresql@14
```

### Permission Denied
```bash
# Check your PostgreSQL user
psql -l

# If needed, create a new superuser
createuser -s nitin.aggarwal
```

### Database Does Not Exist
```bash
# Create the database
createdb databricks_maturity

# Or restore from a backup
psql -d databricks_maturity < backup.sql
```

### Port Already in Use
```bash
# Find what's using port 5432
lsof -i :5432

# Kill the process (if needed)
kill -9 <PID>
```

---

## 🔄 Backup & Restore

### Backup a Database
```bash
pg_dump databricks_maturity > backup_$(date +%Y%m%d).sql
```

### Restore from Backup
```bash
psql -d databricks_maturity < backup_20251219.sql
```

### Backup with Compression
```bash
pg_dump -Fc databricks_maturity > backup.dump
```

### Restore from Compressed Backup
```bash
pg_restore -d databricks_maturity backup.dump
```

---

## 🚀 Quick Commands Reference

```bash
# Start your development server
cd /Users/nitin.aggarwal/BMAD-METHOD/databricks-maturity-assessment
npm run dev

# Run migrations
node server/run-migrations.js

# Connect to database
psql -d databricks_maturity

# Check table structure
psql -d databricks_maturity -c "\d assessments"

# Run a SQL query
psql -d databricks_maturity -c "SELECT * FROM users LIMIT 5;"

# Export data to CSV
psql -d databricks_maturity -c "\COPY (SELECT * FROM assessments) TO 'assessments.csv' CSV HEADER"
```

---

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/14/)
- [psql Command Reference](https://www.postgresql.org/docs/14/app-psql.html)
- [Homebrew PostgreSQL Guide](https://wiki.postgresql.org/wiki/Homebrew)

---

## ✅ Your Setup is Complete!

Your PostgreSQL is properly configured and ready to use. The `results_released` column has been added to your local database.

**Next Steps:**
1. Restart your server: `npm run dev`
2. Test the results release protection
3. Deploy migrations to Railway (if not done yet)
