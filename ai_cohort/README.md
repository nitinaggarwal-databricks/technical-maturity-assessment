# Analytical Agent

An AI-powered agent that answers analytical questions in natural language by automatically generating and executing code (SQL/Python) and producing visualizations.

## 🎯 Goal

Successfully answer 10 pre-defined analytical questions by generating and executing code within **60 seconds**, reducing the average analyst query-to-viz time by **at least 50%**.

## ✨ Features

- **Natural Language Processing**: Ask questions in plain English
- **Multi-Source Analysis**: Works with both CSV data and PDF documents
- **Automatic Code Generation**: Generates SQL and Python/Pandas code using GPT-4
- **Safe Execution**: Sandboxed code execution environment
- **Visualization**: Automatically creates charts (bar, line, scatter, pie, etc.)
- **Fast Performance**: Completes queries within 60 seconds
- **10 Pre-defined Questions**: Ready-to-run analytical scenarios

## 📊 Performance Metrics

- **Traditional Analyst Time**: ~120 seconds per query (manual analysis)
- **Agent Time**: <60 seconds per query (automated)
- **Improvement**: >50% reduction in query-to-visualization time

## 🚀 Quick Start

### 1. Installation

```bash
# Install dependencies
pip install -r requirements.txt
```

### 2. Set up OpenAI API Key

```bash
export OPENAI_API_KEY='your-api-key-here'
```

Or add it to your shell profile (~/.bashrc, ~/.zshrc):

```bash
echo 'export OPENAI_API_KEY="your-api-key-here"' >> ~/.zshrc
source ~/.zshrc
```

### 3. Generate Sample Data

```bash
# Generate sample CSV files
python generate_sample_data.py

# Generate sample PDF report
python generate_sample_pdf.py
```

This creates:
- `data/sales_transactions.csv` - 1000 sales records
- `data/customers.csv` - 4000+ customer records
- `data/products.csv` - Product catalog
- `data/annual_report_2023.pdf` - Financial report

### 4. Run the Agent

#### Run all 10 pre-defined questions:

```bash
python analytical_agent.py --predefined
```

#### Ask a custom question:

```bash
python analytical_agent.py "What are the top 5 products by revenue?"
```

## 📋 Pre-defined Questions

The agent comes with 10 pre-defined analytical questions:

1. **Top Products**: What are the top 5 products by total revenue?
2. **Sales Trend**: Show me the monthly sales trend for 2023
3. **Customer Segments**: Which customer segment generates the most revenue?
4. **Product Performance**: Which product categories have the highest average order value?
5. **Regional Analysis**: Compare sales performance across different regions
6. **Top Customers**: Who are the top 10 customers by total purchase amount?
7. **Correlation**: Is there a correlation between product price and quantity sold?
8. **Seasonal Patterns**: Are there any seasonal patterns in our sales data?
9. **PDF Summary**: Summarize the key financial metrics from the annual report
10. **PDF Trends**: Extract and visualize quarterly revenue from the annual report

## 📁 Project Structure

```
ai_cohort/
├── analytical_agent.py          # Main agent implementation
├── predefined_questions.py      # 10 pre-defined questions
├── generate_sample_data.py      # Generate CSV data
├── generate_sample_pdf.py       # Generate PDF report
├── config.py                    # Configuration
├── requirements.txt             # Python dependencies
├── README.md                    # This file
├── data/                        # Data directory (generated)
│   ├── sales_transactions.csv
│   ├── customers.csv
│   ├── products.csv
│   ├── annual_report_2023.pdf
│   └── analytics.db            # SQLite database (auto-generated)
└── outputs/                     # Output directory (generated)
    └── q*_chart.png            # Generated visualizations
```

## 🔧 How It Works

1. **Question Input**: User asks a question in natural language
2. **Context Building**: Agent analyzes available data sources (CSV, PDF)
3. **Code Generation**: GPT-4 generates Python/SQL code to answer the question
4. **Safe Execution**: Code runs in a sandboxed environment
5. **Visualization**: Creates appropriate charts using matplotlib/seaborn
6. **Results**: Returns insights, data, and visualization within 60 seconds

## 💡 Example Usage

```python
from analytical_agent import AnalyticalAgent

# Initialize agent
agent = AnalyticalAgent(
    api_key="your-api-key",
    data_dir="./data",
    output_dir="./outputs"
)

# Ask a question
result = agent.answer_question(
    "What are the top 5 products by revenue? Show me a bar chart."
)

# Check results
if result['success']:
    print(f"Answer: {result['answer']['summary']}")
    print(f"Chart: {result['chart_path']}")
    print(f"Time: {result['execution_time']:.2f}s")
```

## 📊 Sample Data

### CSV Data (E-commerce)
- **Sales Transactions**: 1000 orders from 2023
- **Customers**: 4000+ customers across 4 segments
- **Products**: 15 products across 3 categories
- **Regions**: North, South, East, West, Central

### PDF Data (Financial Report)
- **Annual Report 2023**: TechCorp Industries
- Quarterly revenue breakdown
- Segment performance
- Regional analysis
- Key financial metrics

## 🔒 Security

The agent uses a sandboxed execution environment:
- No file system access outside data/output directories
- No network access during code execution
- Safe imports only
- Code validation before execution

## ⚙️ Configuration

Edit `config.py` to customize:
- OpenAI model selection
- Timeout limits
- Data/output directories
- Temperature and token limits

## 🐛 Troubleshooting

### "OpenAI API key is required"
Set your API key: `export OPENAI_API_KEY='your-key'`

### "Data directory does not exist"
Run `python generate_sample_data.py` first

### "No module named 'reportlab'"
Install dependencies: `pip install -r requirements.txt`

### Timeout errors
- Check your internet connection
- Ensure OpenAI API is accessible
- Complex questions may need optimization

## 📈 Performance Benchmarks

Expected performance for pre-defined questions:
- **Code Generation**: 5-15 seconds
- **Code Execution**: 1-10 seconds
- **Total Time**: 10-30 seconds (well under 60s limit)
- **Success Rate**: >90% for pre-defined questions

## 🤝 Contributing

To add new questions:
1. Edit `predefined_questions.py`
2. Add tuple: `("question_id", "Your question here")`
3. Ensure data sources support the question

## 📝 License

MIT License - See main project LICENSE file

## 🔗 Related Projects

This agent is part of the BMAD-METHOD framework for AI-assisted development.

## 📞 Support

For issues or questions, please refer to the main BMAD-METHOD documentation.

---

**Built with**: Python, OpenAI GPT-4, Pandas, Matplotlib, SQLite

**Tested on**: Python 3.8+, macOS/Linux

