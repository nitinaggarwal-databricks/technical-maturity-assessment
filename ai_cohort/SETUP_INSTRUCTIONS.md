# Setup Instructions - Analytical Agent

## Complete Setup Guide

Follow these steps to get the Analytical Agent running on your system.

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Python 3.8 or higher installed
- [ ] pip package manager installed
- [ ] OpenAI API key ([Sign up here](https://platform.openai.com/signup))
- [ ] Terminal/Command line access
- [ ] Internet connection (for API calls)

---

## Installation Steps

### Step 1: Navigate to Project Directory

```bash
cd /Users/nitin.aggarwal/BMAD-METHOD/ai_cohort
```

### Step 2: Install Python Dependencies

```bash
pip install -r requirements.txt
```

Expected packages to be installed:
- pandas (data manipulation)
- numpy (numerical operations)
- matplotlib (visualizations)
- seaborn (advanced visualizations)
- openai (GPT-4 integration)
- PyPDF2 (PDF processing)
- reportlab (PDF generation)

### Step 3: Configure OpenAI API Key

**Option A: Set as environment variable (temporary)**

```bash
export OPENAI_API_KEY='sk-your-actual-api-key-here'
```

**Option B: Set permanently (recommended)**

For Zsh (macOS default):
```bash
echo 'export OPENAI_API_KEY="sk-your-actual-api-key-here"' >> ~/.zshrc
source ~/.zshrc
```

For Bash (Linux):
```bash
echo 'export OPENAI_API_KEY="sk-your-actual-api-key-here"' >> ~/.bashrc
source ~/.bashrc
```

**Verify it's set:**
```bash
echo $OPENAI_API_KEY
```

### Step 4: Generate Sample Data

**Generate CSV files:**
```bash
python3 generate_sample_data.py
```

Expected output:
```
✓ Created sales_transactions.csv (1000 records)
✓ Created customers.csv (4001 records)
✓ Created products.csv (15 records)
```

**Generate PDF report:**
```bash
python3 generate_sample_pdf.py
```

Expected output:
```
✓ Created annual_report_2023.pdf
```

**Verify data files:**
```bash
ls -lh data/
```

Should show:
- sales_transactions.csv
- customers.csv
- products.csv
- annual_report_2023.pdf

---

## Quick Setup (Alternative Method)

Run the automated setup script:

```bash
chmod +x setup.sh
./setup.sh
```

This script will:
1. Check Python installation
2. Install all dependencies
3. Generate sample CSV data
4. Generate sample PDF
5. Create output directories
6. Verify OpenAI API key

---

## Verification

### Test 1: Run Test Suite

```bash
python3 test_agent.py
```

Expected result:
```
Test 1: Agent Initialization
✓ Agent initialized successfully

Test 2: Data Loading
✓ Loaded 3 CSV files
✓ Loaded 1 PDF files

Test 3: Simple Question
✓ Question answered in XX.XXs

Test 4: Visualization Generation
✓ Chart generated: outputs/test_viz_chart.png
✓ Completed in XX.XXs

Passed: 4/4
✅ All tests passed!
```

### Test 2: Run Example Questions

```bash
python3 analytical_agent.py --predefined
```

This will run all 10 pre-defined questions. Expected time: 3-5 minutes total.

### Test 3: Ask a Custom Question

```bash
python3 analytical_agent.py "What are the top 5 products by revenue?"
```

Expected: Chart generated in outputs/ directory

---

## Directory Structure After Setup

```
ai_cohort/
├── analytical_agent.py          ✓ Main agent code
├── predefined_questions.py      ✓ 10 questions
├── generate_sample_data.py      ✓ Data generator
├── generate_sample_pdf.py       ✓ PDF generator
├── config.py                    ✓ Configuration
├── requirements.txt             ✓ Dependencies
├── setup.sh                     ✓ Setup script
├── test_agent.py               ✓ Test suite
├── example_usage.py            ✓ Examples
├── README.md                   ✓ Documentation
├── QUICKSTART.md               ✓ Quick guide
├── PROJECT_SUMMARY.md          ✓ Summary
├── SETUP_INSTRUCTIONS.md       ✓ This file
├── data/                       ✓ Generated
│   ├── sales_transactions.csv  ✓ 1000 records
│   ├── customers.csv           ✓ 4001 records
│   ├── products.csv            ✓ 15 products
│   ├── annual_report_2023.pdf  ✓ Financial report
│   └── analytics.db            ✓ Auto-generated
└── outputs/                    ✓ Generated
    └── *.png                   ✓ Charts
```

---

## Troubleshooting Common Issues

### Issue 1: "ModuleNotFoundError"

**Problem**: Python package not installed

**Solution**:
```bash
pip install -r requirements.txt
```

Or install specific package:
```bash
pip install openai pandas matplotlib seaborn PyPDF2 reportlab
```

### Issue 2: "OpenAI API key is required"

**Problem**: API key not set

**Solution**:
```bash
export OPENAI_API_KEY='your-key-here'
```

Verify:
```bash
echo $OPENAI_API_KEY
```

### Issue 3: "Data directory does not exist"

**Problem**: Sample data not generated

**Solution**:
```bash
python3 generate_sample_data.py
python3 generate_sample_pdf.py
```

### Issue 4: "Permission denied: setup.sh"

**Problem**: Script not executable

**Solution**:
```bash
chmod +x setup.sh
```

### Issue 5: "Connection error" or "Timeout"

**Problem**: Network or API issues

**Solutions**:
- Check internet connection
- Verify API key is valid
- Check OpenAI API status: https://status.openai.com/
- Try again in a few minutes

### Issue 6: Charts not generating

**Problem**: Matplotlib backend issues

**Solution**:
```bash
# The agent saves charts to files, doesn't display them
# Check the outputs/ directory
ls -la outputs/

# View a chart (macOS)
open outputs/q1_top_products_chart.png

# View a chart (Linux)
xdg-open outputs/q1_top_products_chart.png
```

---

## Next Steps After Setup

1. **Run Pre-defined Questions**
   ```bash
   python3 analytical_agent.py --predefined
   ```

2. **Try Custom Questions**
   ```bash
   python3 analytical_agent.py "Show me the monthly sales trend"
   ```

3. **Explore Examples**
   ```bash
   python3 example_usage.py
   ```

4. **View Generated Charts**
   ```bash
   ls outputs/
   open outputs/*.png  # macOS
   ```

5. **Read Documentation**
   - `README.md` - Full documentation
   - `QUICKSTART.md` - Quick reference
   - `PROJECT_SUMMARY.md` - Technical overview

---

## Performance Expectations

Once setup is complete, expect:

- **Question answering**: 15-30 seconds average
- **Success rate**: >90% for pre-defined questions
- **Chart quality**: 150 DPI, publication-ready
- **Data processing**: Handles 1000+ records easily

---

## Getting Help

If you encounter issues:

1. Check this troubleshooting guide
2. Review the README.md
3. Run the test suite to isolate the problem
4. Check the OpenAI API status
5. Verify all dependencies are installed

---

## Uninstallation

To remove the agent:

```bash
# Remove generated data
rm -rf data/ outputs/

# Remove Python packages (optional)
pip uninstall pandas numpy matplotlib seaborn openai PyPDF2 reportlab

# Remove environment variable (from ~/.zshrc or ~/.bashrc)
# Edit the file and remove the OPENAI_API_KEY line
```

---

## Success Checklist

Setup is complete when:

- [x] Python 3.8+ is installed
- [x] All packages from requirements.txt are installed
- [x] OPENAI_API_KEY is set
- [x] Sample data is generated (CSV + PDF)
- [x] Test suite passes (4/4 tests)
- [x] Can run predefined questions successfully
- [x] Charts are generated in outputs/ directory
- [x] Average query time is <60 seconds

---

**Setup complete? Start asking questions!** 🚀

```bash
python3 analytical_agent.py "What are our best selling products?"
```

