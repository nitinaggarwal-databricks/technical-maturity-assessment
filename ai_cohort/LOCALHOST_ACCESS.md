# 🌐 Accessing Your Analytical Agent on Localhost

## 🎉 **SERVER IS RUNNING!**

Your analytical agent is now available as a web application!

---

## 🚀 **OPEN IN YOUR BROWSER:**

### Click or copy this URL:

```
http://localhost:5000
```

Or try:
```
http://127.0.0.1:5000
```

---

## 💻 **What You'll See:**

A beautiful web interface with:

### ✨ Main Features:
1. **Question Input Box** - Ask anything in natural language
2. **Quick Questions** - Pre-defined questions you can click
3. **Live Results** - See answers and charts instantly
4. **Statistics Dashboard** - Track your queries
5. **Generated Code** - View the code that was created

### 📊 Stats Bar Shows:
- Total queries asked
- Average response time
- Number of datasets loaded

---

## 🎯 **How to Use:**

### Method 1: Type Your Question
1. Type in the text box (e.g., "What are the top 5 products?")
2. Click **"🚀 Ask Question"**
3. Wait 10-30 seconds
4. See your answer and chart!

### Method 2: Use Quick Questions
1. Click any question from the "💡 Quick Questions" list
2. It fills the text box automatically
3. Click **"🚀 Ask Question"**

---

## 📝 **Example Questions to Try:**

### Business Analytics:
- "What is the total revenue?"
- "Show me the top 5 products by revenue"
- "Which customer segment generates most revenue?"
- "Compare sales across regions"

### Visualizations:
- "Show monthly sales trend as a line chart"
- "Create a pie chart of revenue by category"
- "Plot a bar chart of top 10 customers"

### Advanced:
- "Is there correlation between price and quantity?"
- "What are the seasonal patterns in sales?"
- "Show me the best performing products in each region"

---

## 🎨 **What You Get:**

For each question:
- ✅ **Natural language answer**
- ✅ **Beautiful interactive chart** (if applicable)
- ✅ **Execution time** (usually 10-30s)
- ✅ **Generated Python code** (click "View Code")
- ✅ **Success/Error status**

---

## 🔄 **Server Control:**

### Stop the Server:
```bash
# Press Ctrl+C in the terminal where it's running
# Or find and kill the process:
pkill -f web_app.py
```

### Restart the Server:
```bash
cd /Users/nitin.aggarwal/BMAD-METHOD/ai_cohort
export OPENAI_API_KEY='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'
python3 web_app.py
```

---

## 🎯 **Features:**

### ✨ **Beautiful UI**
- Modern gradient design
- Responsive layout
- Clean and intuitive

### ⚡ **Fast & Efficient**
- Real-time updates
- Loading indicators
- Progress feedback

### 📊 **Rich Results**
- Inline chart display
- Formatted summaries
- Code viewer

### 📈 **Statistics**
- Track total queries
- Monitor avg response time
- View dataset info

---

## 🔍 **Behind the Scenes:**

When you ask a question:
1. 🧠 GPT-4 analyzes your question
2. 💻 Generates Python/SQL code
3. ⚙️ Executes safely
4. 📊 Creates visualization
5. 🎨 Displays in browser

All in 10-30 seconds!

---

## 📱 **Access from Other Devices:**

To access from other devices on your network:

1. Find your IP address:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. Access from another device:
   ```
   http://YOUR_IP_ADDRESS:5000
   ```

---

## 🐛 **Troubleshooting:**

### Page won't load?
```bash
# Check if server is running:
curl http://localhost:5000

# Check the process:
ps aux | grep web_app.py

# Restart if needed
```

### Slow responses?
- First query might take longer (loading data)
- Complex questions take more time
- Check your internet connection (needs OpenAI API)

### Charts not showing?
- Wait for full response
- Check browser console (F12)
- Try refreshing the page

---

## 💡 **Pro Tips:**

1. **Be Specific**: "Show top 5 products by revenue as bar chart" works better than "show products"

2. **Use Chart Types**: Mention "bar chart", "line chart", "pie chart", "scatter plot"

3. **Save Charts**: Right-click on charts to save them

4. **View Code**: Click "📝 View Generated Code" to see how it works

5. **Multiple Queries**: Ask multiple questions - history is tracked

---

## 📊 **Sample Data Available:**

Your web app has access to:
- **1,000 sales transactions** (2023)
- **4,001 customers** 
- **15 products** across 3 categories
- **1 annual report PDF**

Total revenue: **$367,021.74**

---

## 🎉 **You're All Set!**

### **OPEN NOW:**
```
http://localhost:5000
```

### **Quick Start:**
1. Open browser → http://localhost:5000
2. Click a quick question OR type your own
3. Click "Ask Question"
4. View results!

---

## 📞 **Need Help?**

- **Server logs**: Check terminal where you ran `web_app.py`
- **Charts**: Saved in `outputs/` folder
- **Data**: Located in `data/` folder
- **Code**: `web_app.py` for server, `analytical_agent.py` for logic

---

**Enjoy your AI-powered analytical agent web interface! 🚀📊**

*Running on: http://localhost:5000*

