# Quick Start Guide - Analytical Agent

Get up and running in 5 minutes!

## Prerequisites

- Python 3.8 or higher
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Terminal/Command line access

## Step-by-Step Setup

### 1. Navigate to the project directory

```bash
cd /Users/nitin.aggarwal/BMAD-METHOD/ai_cohort
```

### 2. Run the automated setup

```bash
chmod +x setup.sh
./setup.sh
```

This will:
- Install all required Python packages
- Generate sample CSV data (sales, customers, products)
- Generate sample PDF report
- Create output directories

### 3. Set your OpenAI API key

```bash
export OPENAI_API_KEY='sk-your-key-here'
```

**Tip**: Make it permanent by adding to your shell profile:

```bash
# For Zsh (macOS default)
echo 'export OPENAI_API_KEY="sk-your-key-here"' >> ~/.zshrc
source ~/.zshrc

# For Bash
echo 'export OPENAI_API_KEY="sk-your-key-here"' >> ~/.bashrc
source ~/.bashrc
```

### 4. Test the installation

```bash
python3 test_agent.py
```

Expected output: ✅ All tests passed!

### 5. Run the pre-defined questions

```bash
python3 analytical_agent.py --predefined
```

This will run all 10 pre-defined analytical questions and generate visualizations.

## What to Expect

When you run the pre-defined questions, you'll see:

```
================================================================================
Running 10 pre-defined analytical questions
================================================================================

[1/10] Processing: q1_top_products
================================================================================
Question: What are the top 5 products by total revenue? Show me a bar chart.
================================================================================
📝 Generating code...
✓ Code generated in 8.23s (450 tokens)
⚙️  Executing code...
✓ Code executed in 1.45s
✅ Complete in 9.68s

📊 Summary: The top 5 products by revenue are: Laptop Pro 15" ($XXX,XXX), ...
📈 Chart saved: outputs/q1_top_products_chart.png

[2/10] Processing: q2_sales_trend
...
```

## Expected Performance

- **Average time per query**: 15-30 seconds
- **Success rate**: >90%
- **All queries complete**: <5 minutes total

## View Results

Charts are saved in the `outputs/` directory:

```bash
ls outputs/
# q1_top_products_chart.png
# q2_sales_trend_chart.png
# ...
```

Open them with:

```bash
# macOS
open outputs/q1_top_products_chart.png

# Linux
xdg-open outputs/q1_top_products_chart.png
```

## Try Custom Questions

```bash
# Ask your own question
python3 analytical_agent.py "Show me the revenue trend by month"

# Another example
python3 analytical_agent.py "Which region has the best performance?"

# PDF analysis
python3 analytical_agent.py "What were the quarterly revenues in the annual report?"
```

## Troubleshooting

### Problem: "ModuleNotFoundError: No module named 'openai'"

**Solution**: Install dependencies
```bash
pip install -r requirements.txt
```

### Problem: "OpenAI API key is required"

**Solution**: Set your API key
```bash
export OPENAI_API_KEY='your-key-here'
```

### Problem: "Data directory does not exist"

**Solution**: Generate sample data
```bash
python3 generate_sample_data.py
python3 generate_sample_pdf.py
```

### Problem: Charts not displaying

**Solution**: Check the outputs directory
```bash
ls -la outputs/
```

Charts are saved as PNG files, not displayed interactively.

## Next Steps

1. **Explore the code**: Check out `analytical_agent.py` to see how it works
2. **Modify questions**: Edit `predefined_questions.py` to add your own questions
3. **Use your data**: Replace files in `data/` with your own CSV/PDF files
4. **Integrate**: Import the agent into your own Python scripts

## Example Integration

```python
from analytical_agent import AnalyticalAgent

# Initialize
agent = AnalyticalAgent(
    data_dir="./data",
    output_dir="./outputs"
)

# Ask a question
result = agent.answer_question(
    "What are the top 5 products by revenue?"
)

# Use the results
if result['success']:
    print(f"Time: {result['execution_time']:.2f}s")
    print(f"Summary: {result['answer']['summary']}")
    print(f"Chart: {result['chart_path']}")
```

## Performance Metrics

The agent is designed to:
- ✅ Answer questions in <60 seconds
- ✅ Reduce analyst time by >50%
- ✅ Handle both CSV and PDF data
- ✅ Generate publication-ready charts
- ✅ Execute safely in a sandbox

## Get Help

- Check the full [README.md](README.md) for detailed documentation
- Review `predefined_questions.py` for question examples
- Examine `analytical_agent.py` for implementation details

## Success Criteria

You've successfully set up the agent if:
- ✅ Setup script completes without errors
- ✅ Test script passes all 4 tests
- ✅ Pre-defined questions run successfully
- ✅ Charts are generated in outputs/
- ✅ Average time per query is <60 seconds

---

**Ready to analyze data with AI? Start asking questions! 🚀**

