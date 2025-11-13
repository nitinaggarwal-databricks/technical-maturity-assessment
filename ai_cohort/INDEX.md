# Analytical Agent - Documentation Index

## 📚 Quick Navigation

Choose the right document for your needs:

---

### 🚀 **New User? Start Here!**

**[GETTING_STARTED.md](GETTING_STARTED.md)**  
The fastest way to get running. 5-minute setup guide with examples.

---

### 📖 Documentation by Purpose

#### Installation & Setup
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Quick 5-minute guide ⭐ START HERE
- **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)** - Detailed installation instructions
- **[QUICKSTART.md](QUICKSTART.md)** - Quick reference card

#### Usage & Examples
- **[README.md](README.md)** - Complete documentation and features
- **[example_usage.py](example_usage.py)** - 7 code examples
- **[predefined_questions.py](predefined_questions.py)** - 10 pre-defined questions

#### Technical Details
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Architecture and technical overview
- **[analytical_agent.py](analytical_agent.py)** - Main agent implementation
- **[config.py](config.py)** - Configuration options

#### Testing & Troubleshooting
- **[test_agent.py](test_agent.py)** - Test suite (run to verify setup)
- **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)** - Troubleshooting section

---

### 🎯 Find What You Need

| I want to... | Read this... |
|--------------|--------------|
| Get started in 5 minutes | [GETTING_STARTED.md](GETTING_STARTED.md) |
| See code examples | [example_usage.py](example_usage.py) |
| Understand the architecture | [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) |
| Fix installation issues | [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) |
| Learn all features | [README.md](README.md) |
| Quick command reference | [QUICKSTART.md](QUICKSTART.md) |
| Run tests | [test_agent.py](test_agent.py) |
| See pre-defined questions | [predefined_questions.py](predefined_questions.py) |
| Modify configuration | [config.py](config.py) |

---

### 📂 Project Structure

```
ai_cohort/
├── 📘 Documentation
│   ├── GETTING_STARTED.md      ⭐ Start here
│   ├── QUICKSTART.md           Quick reference
│   ├── README.md               Full docs
│   ├── PROJECT_SUMMARY.md      Technical details
│   ├── SETUP_INSTRUCTIONS.md   Installation guide
│   └── INDEX.md                This file
│
├── 🚀 Main Application
│   ├── analytical_agent.py     Main agent (500+ lines)
│   ├── predefined_questions.py 10 test questions
│   └── config.py               Configuration
│
├── 🔧 Setup & Testing
│   ├── setup.sh                Automated setup
│   ├── test_agent.py           Test suite
│   ├── example_usage.py        Usage examples
│   ├── requirements.txt        Dependencies
│   ├── generate_sample_data.py CSV generator
│   └── generate_sample_pdf.py  PDF generator
│
├── 📊 Data (Generated)
│   └── data/
│       ├── sales_transactions.csv
│       ├── customers.csv
│       ├── products.csv
│       ├── annual_report_2023.pdf
│       └── analytics.db (auto-created)
│
└── 📈 Outputs (Generated)
    └── outputs/
        └── *.png (charts)
```

---

### ⚡ Quick Commands

```bash
# First time setup
export OPENAI_API_KEY='your-key'
pip install -r requirements.txt

# Run pre-defined questions
python3 analytical_agent.py --predefined

# Ask custom question
python3 analytical_agent.py "Your question here"

# Run tests
python3 test_agent.py

# See examples
python3 example_usage.py

# Regenerate sample data
python3 generate_sample_data.py
python3 generate_sample_pdf.py
```

---

### 📋 File Descriptions

#### Documentation Files

- **INDEX.md** - This file; navigation guide
- **GETTING_STARTED.md** - Fastest way to start (5 min)
- **QUICKSTART.md** - Quick reference commands
- **README.md** - Complete documentation (full features)
- **PROJECT_SUMMARY.md** - Technical architecture overview
- **SETUP_INSTRUCTIONS.md** - Detailed installation guide

#### Code Files

- **analytical_agent.py** - Core agent implementation
  - `AnalyticalAgent` class
  - LLM integration
  - Code generation
  - Safe execution
  - Visualization creation

- **predefined_questions.py** - 10 pre-defined analytical questions
  - CSV analysis questions (1-8)
  - PDF analysis questions (9-10)
  - Performance benchmarks

- **config.py** - Configuration settings
  - API keys
  - Directories
  - Timeouts
  - Model settings

- **test_agent.py** - Test suite
  - Initialization test
  - Data loading test
  - Question answering test
  - Visualization test

- **example_usage.py** - 7 usage examples
  - Basic questions
  - Visualizations
  - PDF analysis
  - Batch processing
  - Error handling

#### Setup Files

- **setup.sh** - Automated setup script
- **requirements.txt** - Python dependencies
- **generate_sample_data.py** - Create sample CSV files
- **generate_sample_pdf.py** - Create sample PDF report

---

### 🎓 Learning Path

**Beginner:**
1. Read [GETTING_STARTED.md](GETTING_STARTED.md)
2. Run `python3 analytical_agent.py --predefined`
3. Try `python3 example_usage.py`

**Intermediate:**
1. Read [README.md](README.md)
2. Explore [analytical_agent.py](analytical_agent.py)
3. Modify [predefined_questions.py](predefined_questions.py)

**Advanced:**
1. Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
2. Study the code implementation
3. Extend the agent for your use case

---

### ❓ Common Questions

**Q: Where do I start?**  
A: [GETTING_STARTED.md](GETTING_STARTED.md) - 5 minute quickstart

**Q: How do I run it?**  
A: `python3 analytical_agent.py --predefined`

**Q: Where are the charts saved?**  
A: `outputs/` directory

**Q: How do I add my own data?**  
A: Replace CSV/PDF files in `data/` directory

**Q: How much does it cost?**  
A: ~$0.01-0.03 per question (OpenAI API)

**Q: Is my data safe?**  
A: Yes, runs locally. Only questions sent to API.

**Q: Can I use it offline?**  
A: No, requires OpenAI API (internet connection)

**Q: What Python version?**  
A: Python 3.8 or higher

---

### 🔗 External Links

- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [OpenAI API Pricing](https://openai.com/pricing)
- [Pandas Documentation](https://pandas.pydata.org/docs/)
- [Matplotlib Gallery](https://matplotlib.org/stable/gallery/)

---

### 📊 Features Overview

✅ Natural language questions  
✅ Automatic code generation (SQL/Python)  
✅ Safe code execution (sandboxed)  
✅ Beautiful visualizations (bar, line, scatter, pie)  
✅ CSV data analysis  
✅ PDF document analysis  
✅ <60 second response time  
✅ 50%+ time savings vs manual analysis  
✅ 10 pre-defined test questions  
✅ Extensible architecture  

---

### 🎯 Quick Reference Card

| Task | Command |
|------|---------|
| Run all questions | `python3 analytical_agent.py --predefined` |
| Ask question | `python3 analytical_agent.py "question"` |
| Run tests | `python3 test_agent.py` |
| View examples | `python3 example_usage.py` |
| Generate data | `python3 generate_sample_data.py` |
| List outputs | `ls outputs/` |
| View chart | `open outputs/q1_top_products_chart.png` |

---

### 💡 Tips

- Start with [GETTING_STARTED.md](GETTING_STARTED.md)
- Run tests first: `python3 test_agent.py`
- Check `outputs/` for generated charts
- Modify questions in [predefined_questions.py](predefined_questions.py)
- Add your CSV/PDF files to `data/` directory
- Set API key permanently in shell profile

---

### 📞 Support

1. Check documentation (you're in the right place!)
2. Run `python3 test_agent.py` to diagnose issues
3. Review [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) troubleshooting
4. Check OpenAI API status: https://status.openai.com/

---

**Last Updated**: November 2025  
**Version**: 1.0  
**Status**: Production Ready ✅

---

## 🚀 Ready to Start?

```bash
# Set your API key
export OPENAI_API_KEY='your-key-here'

# Run the agent
python3 analytical_agent.py --predefined
```

**Enjoy analyzing data with AI!** 🤖📊

