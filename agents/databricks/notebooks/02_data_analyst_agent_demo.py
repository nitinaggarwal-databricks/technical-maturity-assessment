# Databricks notebook source
# MAGIC %md
# MAGIC # Data Analyst Agent Demo
# MAGIC 
# MAGIC This notebook demonstrates the Data Analyst Agent working with Databricks Delta tables.
# MAGIC 
# MAGIC **Features:**
# MAGIC - SQL query execution on Delta tables
# MAGIC - Data analysis and insights generation
# MAGIC - Integration with MLflow for experiment tracking

# COMMAND ----------

# MAGIC %md
# MAGIC ## 1. Install Dependencies

# COMMAND ----------

# MAGIC %pip install langgraph langchain langchain-openai databricks-sdk mlflow pydantic
# MAGIC dbutils.library.restartPython()

# COMMAND ----------

# MAGIC %md
# MAGIC ## 2. Setup Environment

# COMMAND ----------

import os
from databricks.sdk.runtime import *

# Configure API keys
os.environ["OPENAI_API_KEY"] = dbutils.secrets.get(scope="agents", key="openai-api-key")

# Get Databricks configuration
workspace_url = spark.conf.get("spark.databricks.workspaceUrl")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 3. Create Sample Data

# COMMAND ----------

from pyspark.sql import Row
from datetime import datetime, timedelta
import random

# Create sample sales data
dates = [(datetime.now() - timedelta(days=x)).date() for x in range(90)]
products = ["Product A", "Product B", "Product C", "Product D", "Product E"]
regions = ["North", "South", "East", "West"]

sample_data = []
for date in dates:
    for product in products:
        for region in regions:
            sample_data.append(Row(
                date=date,
                product=product,
                region=region,
                revenue=random.uniform(1000, 10000),
                units_sold=random.randint(10, 100),
                customer_count=random.randint(5, 50)
            ))

# Create DataFrame and save as Delta table
df = spark.createDataFrame(sample_data)
df.write.format("delta").mode("overwrite").saveAsTable("sales_data")

print("Sample sales data created!")
display(df.limit(10))

# COMMAND ----------

# MAGIC %md
# MAGIC ## 4. Import and Configure Agent

# COMMAND ----------

import sys
sys.path.append("/Workspace/Users/your-email@company.com/agents/src")

from agents import create_data_analyst

# Configure Databricks SQL connection
# Note: For demo purposes, we'll let the agent use Spark SQL directly
databricks_config = {
    "server_hostname": workspace_url,
    "http_path": "/sql/1.0/warehouses/your-warehouse-id",  # Update with your SQL warehouse
    "access_token": dbutils.notebook.entry_point.getDbutils().notebook().getContext().apiToken().get()
}

# Create agent
agent = create_data_analyst(
    databricks_config=databricks_config,
    model_name="gpt-4",
    use_tools=True
)

print("Data Analyst Agent created successfully!")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 5. Run Analysis Queries

# COMMAND ----------

# Query 1: Top performing products
query1 = """
Analyze the sales_data table and identify:
1. Top 3 products by total revenue
2. Revenue trends over the last 90 days
3. Best performing region

Provide insights and recommendations.
"""

print("Query:", query1)
print("\n" + "=" * 80)

result1 = agent.run(query1)

print("ANALYSIS RESULTS:")
print("=" * 80)
print(result1.get("output", "No output"))

# COMMAND ----------

# Query 2: Regional analysis
query2 = """
Analyze regional performance from sales_data table:
1. Compare revenue across all regions
2. Identify which products perform best in each region
3. Calculate average units sold per customer by region
"""

result2 = agent.run(query2)

print("=" * 80)
print("REGIONAL ANALYSIS:")
print("=" * 80)
print(result2.get("output", "No output"))

# COMMAND ----------

# MAGIC %md
# MAGIC ## 6. Agent with Direct SQL Access

# COMMAND ----------

# For more direct integration, we can execute SQL directly from notebook
def execute_agent_sql(query: str):
    """Helper function to execute agent-generated SQL"""
    try:
        result_df = spark.sql(query)
        return result_df
    except Exception as e:
        return f"Error: {str(e)}"

# Example: Agent-suggested query
suggested_query = """
SELECT 
    product,
    SUM(revenue) as total_revenue,
    SUM(units_sold) as total_units,
    COUNT(DISTINCT date) as days_active
FROM sales_data
GROUP BY product
ORDER BY total_revenue DESC
"""

result_df = execute_agent_sql(suggested_query)
display(result_df)

# COMMAND ----------

# MAGIC %md
# MAGIC ## 7. Visualization of Results

# COMMAND ----------

# Top products by revenue
top_products_df = spark.sql("""
    SELECT 
        product,
        SUM(revenue) as total_revenue
    FROM sales_data
    GROUP BY product
    ORDER BY total_revenue DESC
""")

display(top_products_df)

# COMMAND ----------

# Revenue trends over time
trends_df = spark.sql("""
    SELECT 
        date,
        SUM(revenue) as daily_revenue
    FROM sales_data
    GROUP BY date
    ORDER BY date
""")

display(trends_df)

# COMMAND ----------

# Regional performance
regional_df = spark.sql("""
    SELECT 
        region,
        product,
        SUM(revenue) as revenue
    FROM sales_data
    GROUP BY region, product
    ORDER BY region, revenue DESC
""")

display(regional_df)

# COMMAND ----------

# MAGIC %md
# MAGIC ## 8. MLflow Tracking

# COMMAND ----------

import mlflow

mlflow.set_experiment("/Users/your-email@company.com/data-analyst-experiments")

with mlflow.start_run():
    # Run analysis
    query = "What are the key insights from the sales data?"
    result = agent.run(query)
    
    # Log parameters
    mlflow.log_param("query", query)
    mlflow.log_param("table", "sales_data")
    mlflow.log_param("model", "gpt-4")
    
    # Log metrics (example)
    total_revenue = spark.sql("SELECT SUM(revenue) as total FROM sales_data").first()['total']
    mlflow.log_metric("total_revenue_analyzed", total_revenue)
    
    # Log insights as artifact
    with open("/tmp/insights.txt", "w") as f:
        f.write(result.get("output", ""))
    mlflow.log_artifact("/tmp/insights.txt")
    
    print("Analysis logged to MLflow!")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 9. Automated Reporting

# COMMAND ----------

def generate_daily_report():
    """Generate automated daily sales report using agent"""
    
    report_query = """
    Generate a daily sales report including:
    1. Total revenue for the latest day
    2. Top performing products
    3. Regional breakdown
    4. Key insights and trends
    5. Recommendations for next actions
    
    Use the sales_data table for analysis.
    """
    
    result = agent.run(report_query)
    
    # Save report to Delta table
    from datetime import datetime
    from pyspark.sql import Row
    
    report_record = Row(
        report_date=datetime.now().date(),
        report_content=result.get("output", ""),
        generated_at=datetime.now()
    )
    
    report_df = spark.createDataFrame([report_record])
    report_df.write.format("delta").mode("append").saveAsTable("daily_sales_reports")
    
    return result

# Generate report
report = generate_daily_report()
print("=" * 80)
print("DAILY SALES REPORT")
print("=" * 80)
print(report.get("output", ""))

# COMMAND ----------

# MAGIC %md
# MAGIC ## 10. Query Reports History

# COMMAND ----------

# View historical reports
display(
    spark.sql("""
        SELECT 
            report_date,
            LEFT(report_content, 300) as preview,
            generated_at
        FROM daily_sales_reports
        ORDER BY report_date DESC
    """)
)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Cleanup

# COMMAND ----------

# Uncomment to clean up demo tables
# spark.sql("DROP TABLE IF EXISTS sales_data")
# spark.sql("DROP TABLE IF EXISTS daily_sales_reports")

