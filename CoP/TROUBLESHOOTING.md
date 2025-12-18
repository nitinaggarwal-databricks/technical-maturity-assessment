# 🔍 Portal Troubleshooting Guide

## ✅ Current Status

Your portal is **compiled and running**:
- ✅ Frontend: Compiled successfully (http://localhost:3001)
- ✅ Backend: Running with 2 CoPs (http://localhost:4001)
- ✅ Database: PostgreSQL with Takeda & Cigna data
- ✅ Pages: All created and compiled

---

## 🌐 **Available Pages**

### **1. Home Page**
http://localhost:3001/

Should show:
- "Launch & Scale Communities of Practice" headline
- Portal description
- "View CoPs" button

### **2. CoPs List**
http://localhost:3001/cops

Should show:
- List of 2 CoPs (Takeda & Cigna)
- Each with "View Dashboard" button
- Phase badges

### **3. CoP Dashboard**
http://localhost:3001/cops/takeda-cop-001

Should show:
- CoP name and customer
- 5 tabs: Overview, Content, Surveys, Analytics, Community
- Full data for each tab

### **4. Admin Dashboard**
http://localhost:3001/admin

Should show:
- Admin overview
- Links to Customers, CoPs, Users
- Recent activity

---

## 🔧 **If Pages Appear Blank:**

### **Solution 1: Hard Refresh**
```
Mac: Cmd + Shift + R
Windows/Linux: Ctrl + Shift + R
```

### **Solution 2: Clear Browser Cache**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### **Solution 3: Check Console**
1. Open DevTools (F12)
2. Go to Console tab
3. Look for any red errors
4. Share them if you see any

### **Solution 4: Verify Services**
```bash
# Check frontend
curl http://localhost:3001

# Check backend
curl http://localhost:4001/api/v1/cops

# Check if processes are running
lsof -i:3001  # Frontend
lsof -i:4001  # Backend
```

---

## 📊 **Expected Behavior**

### **Home Page:**
- Welcome message
- "View CoPs" button (clickable)

### **CoPs Page:**
- 2 CoP cards displayed
- Takeda (Growth phase)
- Cigna (Launch phase)
- Each card is clickable

### **CoP Dashboard:**
- Tabbed interface
- Data loads dynamically
- Charts render in Analytics tab

---

## 💡 **Common Issues**

### **Issue: Blank white page**
**Cause:** Browser cache or React hydration
**Fix:** Hard refresh (Cmd+Shift+R)

### **Issue: 404 errors**
**Cause:** Backend not responding
**Fix:** Check backend logs:
```bash
tail -f /tmp/backend-cop-fresh.log
```

### **Issue: Loading forever**
**Cause:** API calls failing
**Fix:** Check browser Network tab in DevTools

---

## ✅ **Verification Steps**

1. **Open:** http://localhost:3001
2. **See:** Welcome page with button
3. **Click:** "View CoPs" button
4. **See:** 2 CoP cards
5. **Click:** "View Dashboard" on Takeda
6. **See:** Full dashboard with 5 tabs

---

## 🎯 **What Should You See?**

### **Screenshot 1: Home Page**
```
┌─────────────────────────────────────┐
│ Launch & Scale Communities of       │
│ Practice                            │
│                                     │
│ A one-stop portal for...           │
│                                     │
│ [View CoPs]                         │
└─────────────────────────────────────┘
```

### **Screenshot 2: CoPs List**
```
┌──────────────────────────────────────┐
│ Communities of Practice              │
│                                      │
│ ┌─────────────────────────────────┐ │
│ │ Takeda Databricks CoP  [GROWTH] │ │
│ │ Takeda                          │ │
│ │ Drive Databricks adoption...    │ │
│ │ [View Dashboard]                │ │
│ └─────────────────────────────────┘ │
│                                      │
│ ┌─────────────────────────────────┐ │
│ │ Cigna Databricks CoP   [LAUNCH] │ │
│ │ Cigna Healthcare                │ │
│ │ Accelerate claims analytics...  │ │
│ │ [View Dashboard]                │ │
│ └─────────────────────────────────┘ │
└──────────────────────────────────────┘
```

---

## 🚨 **Still Having Issues?**

1. **Check browser console** for errors
2. **Check Network tab** for failed requests
3. **Restart both services:**
   ```bash
   # Stop
   lsof -ti:3001 | xargs kill
   lsof -ti:4001 | xargs kill
   
   # Start backend
   cd /Users/nitin.aggarwal/BMAD-METHOD/CoP/backend
   npm run start:dev
   
   # Start frontend
   cd /Users/nitin.aggarwal/BMAD-METHOD/CoP/frontend
   npm run dev
   ```

---

**Your portal IS working - try a hard refresh first!** 🚀


