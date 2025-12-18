# 🎉 CoP Portal - Running on New Ports

## ✅ Ports Changed Successfully

To avoid conflict with the Technical Maturity Assessment app, the CoP Portal now runs on:

---

## 🌐 New URLs

| Service | Port | URL |
|---------|------|-----|
| **Frontend** | 3001 | http://localhost:3001 |
| **Backend API** | 4001 | http://localhost:4001 |
| **Database** | 5432 | PostgreSQL (unchanged) |

---

## 🚀 Access Your Portal

### **Open in browser:**
# http://localhost:3001

---

## 📝 What Changed

### Backend (`backend/src/main.ts`)
- Port changed: **4000 → 4001**
- CORS updated to allow `localhost:3001`
- Console log updated

### Frontend (`frontend/.env.local`)
- API URL changed: `http://localhost:4001/api/v1`
- User ID unchanged

### Frontend (`frontend/package.json`)
- Dev script: `next dev -p 3001`
- Start script: `next start -p 3001`

---

## ✅ Both Apps Can Run Simultaneously

| App | Ports | Status |
|-----|-------|--------|
| **Technical Maturity Assessment** | 3000, 4000 | ✅ Available |
| **CoP Portal** | 3001, 4001 | ✅ Running |

No conflicts! 🎊

---

## 🔧 Quick Commands

### Check Status:
```bash
# Frontend (CoP Portal)
curl http://localhost:3001

# Backend (CoP Portal)
curl http://localhost:4001/api/v1

# Tech Maturity Assessment (if running)
curl http://localhost:3000
```

### View Logs:
```bash
# CoP Portal Backend
tail -f /tmp/backend-cop.log

# CoP Portal Frontend
tail -f /tmp/frontend-cop.log
```

### Stop CoP Portal:
```bash
# Stop all
pkill -f "npm run"

# Or specific ports
lsof -ti:3001 | xargs kill  # Frontend
lsof -ti:4001 | xargs kill  # Backend
```

### Restart CoP Portal:
```bash
# Backend
cd /Users/nitin.aggarwal/BMAD-METHOD/CoP/backend
npm run start:dev

# Frontend
cd /Users/nitin.aggarwal/BMAD-METHOD/CoP/frontend
npm run dev
```

---

## 🎯 Demo Flow (Same as Before)

1. **Open** http://localhost:3001
2. **Click** "View CoPs"
3. **Select** "Takeda Databricks CoP"
4. **Explore tabs:**
   - Overview → Mission & events
   - Content → Training materials
   - Surveys → Fill feedback
   - Analytics → See charts 📊
   - Community → Success stories

---

## 📊 What's Running

✅ **CoP Portal Frontend** - http://localhost:3001  
✅ **CoP Portal Backend** - http://localhost:4001  
✅ **PostgreSQL Database** - localhost:5432  
✅ **Demo Data** - Takeda, Cigna CoPs  

---

## 💡 Pro Tips

**Bookmark both apps:**
- Tech Maturity: http://localhost:3000
- CoP Portal: http://localhost:3001

**API Endpoints:**
- CoP Portal: http://localhost:4001/api/v1/cops
- Tech Maturity: http://localhost:4000/... (if different)

**Database:**
- Both apps can share same PostgreSQL instance
- Or use different databases if needed

---

## 🎊 Ready to Go!

**Your CoP Portal is now accessible at:**

# http://localhost:3001

No more port conflicts! 🚀

---

*Updated ports: 3001 (frontend), 4001 (backend)*


