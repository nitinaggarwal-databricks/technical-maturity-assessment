"""
10 Pre-defined Analytical Questions
These questions test the agent's ability to:
- Query CSV data (sales, products, customers)
- Analyze PDF documents
- Generate SQL queries
- Create visualizations
- Process natural language questions
"""

PREDEFINED_QUESTIONS = [
    # CSV/SQL Questions (Business Analytics)
    ("q1_top_products", 
     "What are the top 5 products by total revenue? Show me a bar chart."),
    
    ("q2_sales_trend", 
     "Show me the monthly sales trend for 2023. Create a line chart."),
    
    ("q3_customer_segments", 
     "Which customer segment generates the most revenue? Show a pie chart of revenue by segment."),
    
    ("q4_product_performance", 
     "Which product categories have the highest average order value? Create a horizontal bar chart."),
    
    ("q5_regional_analysis", 
     "Compare sales performance across different regions. Show me a bar chart with total sales by region."),
    
    ("q6_top_customers", 
     "Who are the top 10 customers by total purchase amount? Display in a bar chart."),
    
    # Combined CSV Analysis
    ("q7_correlation", 
     "Is there a correlation between product price and quantity sold? Show a scatter plot."),
    
    ("q8_seasonal_patterns", 
     "Are there any seasonal patterns in our sales data? Show monthly sales comparison."),
    
    # PDF Analysis Questions
    ("q9_pdf_summary", 
     "Summarize the key financial metrics mentioned in the annual report PDF. Create a bar chart of the main figures."),
    
    ("q10_pdf_trends", 
     "Extract and visualize the quarterly revenue data mentioned in the annual report. Show as a line chart."),
]

# Description of expected performance
PERFORMANCE_BASELINE = {
    "traditional_analyst_time": 120,  # 2 minutes average per query manually
    "target_agent_time": 60,  # 60 seconds max per query
    "improvement_target": 0.50,  # 50% reduction
}

