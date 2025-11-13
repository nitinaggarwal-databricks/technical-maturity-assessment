# Databricks notebook source
# MAGIC %md
# MAGIC # Research Agent Demo
# MAGIC 
# MAGIC This notebook demonstrates how to use the Research Agent on Databricks.
# MAGIC 
# MAGIC **Prerequisites:**
# MAGIC - Install required libraries (seeCmd 2)
# MAGIC - Configure API keys in Databricks Secrets

# COMMAND ----------

# MAGIC %md
# MAGIC ## 1. Install Dependencies

# COMMAND ----------

# MAGIC %pip install langgraph langchain langchain-openai langchain-anthropic langchain-community tavily-python pydantic python-dotenv
# MAGIC dbutils.library.restartPython()

# COMMAND ----------

# MAGIC %md
# MAGIC ## 2. Setup Environment

# COMMAND ----------

import os
from databricks.sdk.runtime import *

# Set API keys from Databricks Secrets
# Create secret scope first: databricks secrets create-scope --scope agents
os.environ["OPENAI_API_KEY"] = dbutils.secrets.get(scope="agents", key="openai-api-key")

# Optional: Tavily for web search
try:
    os.environ["TAVILY_API_KEY"] = dbutils.secrets.get(scope="agents", key="tavily-api-key")
except:
    print("Tavily API key not found - web search will be limited")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 3. Import Agent Framework

# COMMAND ----------

# Add src to path (if running from uploaded package)
import sys
sys.path.append("/Workspace/Users/your-email@company.com/agents/src")

from agents import create_research_agent

# COMMAND ----------

# MAGIC %md
# MAGIC ## 4. Create Research Agent

# COMMAND ----------

# Create agent with tools
agent = create_research_agent(
    model_name="gpt-4",
    use_tools=True
)

print("Research Agent created successfully!")
print(f"Agent: {agent.config.name}")
print(f"Available tools: {agent.config.tools}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 5. Run Research Queries

# COMMAND ----------

# Example 1: Technology research
query1 = "What are the latest developments in large language models in 2024?"

print(f"Query: {query1}\n")
result1 = agent.run(query1)

print("=" * 80)
print("RESULTS:")
print("=" * 80)
print(result1.get("output", "No output"))
print("\n" + "=" * 80)

# COMMAND ----------

# Example 2: Business research
query2 = "What are the key trends in AI agent technology for enterprise applications?"

print(f"Query: {query2}\n")
result2 = agent.run(query2)

print("=" * 80)
print("RESULTS:")
print("=" * 80)
print(result2.get("output", "No output"))

# COMMAND ----------

# MAGIC %md
# MAGIC ## 6. View Intermediate Steps

# COMMAND ----------

# Show the reasoning and tool usage
print("Intermediate Steps:")
print("-" * 80)

for i, step in enumerate(result2.get("intermediate_steps", []), 1):
    print(f"\nStep {i}:")
    print(f"  Tool: {step.get('tool', 'N/A')}")
    print(f"  Input: {step.get('input', 'N/A')}")
    print(f"  Output: {step.get('output', 'N/A')[:200]}...")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 7. Track with MLflow

# COMMAND ----------

import mlflow
import json
from datetime import datetime

# Set experiment
mlflow.set_experiment("/Users/your-email@company.com/research-agent-experiments")

# Log agent run
with mlflow.start_run():
    query = "What are the benefits of using LangGraph for building AI agents?"
    
    # Track start time
    start_time = datetime.now()
    
    # Run agent
    result = agent.run(query)
    
    # Track end time
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    
    # Log parameters
    mlflow.log_param("query", query)
    mlflow.log_param("model", agent.config.model_name)
    mlflow.log_param("temperature", agent.config.temperature)
    
    # Log metrics
    mlflow.log_metric("execution_time_seconds", duration)
    mlflow.log_metric("num_intermediate_steps", len(result.get("intermediate_steps", [])))
    
    # Log output as artifact
    output_path = "/tmp/agent_output.txt"
    with open(output_path, "w") as f:
        f.write(result.get("output", ""))
    mlflow.log_artifact(output_path)
    
    print(f"MLflow run logged successfully!")
    print(f"Run ID: {mlflow.active_run().info.run_id}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 8. Save Results to Delta Table

# COMMAND ----------

from pyspark.sql import Row
from datetime import datetime

# Create result record
result_data = Row(
    timestamp=datetime.now(),
    query=query,
    output=result.get("output", ""),
    model=agent.config.model_name,
    execution_time=duration,
    num_steps=len(result.get("intermediate_steps", []))
)

# Convert to DataFrame
df = spark.createDataFrame([result_data])

# Save to Delta table (append mode)
df.write.format("delta").mode("append").saveAsTable("agent_research_results")

print("Results saved to Delta table: agent_research_results")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 9. Query Historical Results

# COMMAND ----------

# Query the results table
display(
    spark.sql("""
        SELECT 
            timestamp,
            query,
            LEFT(output, 200) as output_preview,
            model,
            execution_time,
            num_steps
        FROM agent_research_results
        ORDER BY timestamp DESC
        LIMIT 10
    """)
)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Cleanup (Optional)

# COMMAND ----------

# Drop the table if needed
# spark.sql("DROP TABLE IF EXISTS agent_research_results")

