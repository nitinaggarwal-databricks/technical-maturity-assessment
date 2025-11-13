# Databricks notebook source
# MAGIC %md
# MAGIC # Multi-Agent System Demo
# MAGIC 
# MAGIC This notebook demonstrates the Multi-Agent System with coordinated execution.
# MAGIC 
# MAGIC **Components:**
# MAGIC - Planner Agent: Creates execution plans
# MAGIC - Research Agent: Gathers information
# MAGIC - Data Analyst Agent: Analyzes data
# MAGIC - Reporter Agent: Synthesizes results

# COMMAND ----------

# MAGIC %md
# MAGIC ## 1. Install Dependencies

# COMMAND ----------

# MAGIC %pip install langgraph langchain langchain-openai databricks-sdk mlflow tavily-python
# MAGIC dbutils.library.restartPython()

# COMMAND ----------

# MAGIC %md
# MAGIC ## 2. Setup Environment

# COMMAND ----------

import os
from databricks.sdk.runtime import *

# Configure API keys
os.environ["OPENAI_API_KEY"] = dbutils.secrets.get(scope="agents", key="openai-api-key")

try:
    os.environ["TAVILY_API_KEY"] = dbutils.secrets.get(scope="agents", key="tavily-api-key")
except:
    print("Tavily API not configured - research capabilities may be limited")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 3. Import Multi-Agent System

# COMMAND ----------

import sys
sys.path.append("/Workspace/Users/your-email@company.com/agents/src")

from agents import create_multi_agent_system

# COMMAND ----------

# MAGIC %md
# MAGIC ## 4. Create Multi-Agent System

# COMMAND ----------

# Create system with all agents
system = create_multi_agent_system(
    include_researcher=True,
    include_data_analyst=True,
    databricks_config=None  # Optional: add Databricks config for data analyst
)

print("Multi-Agent System initialized!")
print(f"Available agents: {list(system.agents.keys())}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 5. Run Complex Queries

# COMMAND ----------

# Example 1: Research + Analysis Task
query1 = """
I need a comprehensive analysis of AI agent technology:
1. Research the latest trends and developments in AI agents
2. Compare different frameworks (LangGraph, AutoGPT, CrewAI)
3. Analyze the use cases and benefits
4. Provide recommendations for enterprise adoption
"""

print("QUERY:")
print(query1)
print("\n" + "=" * 80)

result1 = system.run(query1)

print("\nPLAN:")
print("-" * 80)
print(result1.get("plan", "No plan"))

print("\n" + "=" * 80)
print("FINAL REPORT:")
print("=" * 80)
print(result1.get("output", "No output"))

# COMMAND ----------

# MAGIC %md
# MAGIC ## 6. View Agent Collaboration

# COMMAND ----------

# Display completed tasks from each agent
print("AGENT COLLABORATION DETAILS:")
print("=" * 80)

for i, task in enumerate(result1.get("completed_tasks", []), 1):
    print(f"\nTask {i}:")
    print(f"  Agent: {task['agent']}")
    print(f"  Task: {task['task']}")
    print(f"  Result Preview: {task['result'][:200]}...")
    print("-" * 80)

# COMMAND ----------

# MAGIC %md
# MAGIC ## 7. Business Intelligence Query

# COMMAND ----------

# Example 2: Combined research and data analysis
query2 = """
Create a competitive analysis report:
1. Research the top 3 competitors in the AI agent space
2. Identify their key features and pricing
3. Analyze market trends and growth projections
4. Provide strategic recommendations
"""

result2 = system.run(query2)

print("=" * 80)
print("COMPETITIVE ANALYSIS REPORT")
print("=" * 80)
print(result2.get("output", ""))

# COMMAND ----------

# MAGIC %md
# MAGIC ## 8. Track with MLflow

# COMMAND ----------

import mlflow
from datetime import datetime

mlflow.set_experiment("/Users/your-email@company.com/multi-agent-experiments")

with mlflow.start_run():
    query = "Research AI safety concerns and analyze recent incidents in AI systems"
    
    start_time = datetime.now()
    result = system.run(query)
    end_time = datetime.now()
    
    duration = (end_time - start_time).total_seconds()
    
    # Log parameters
    mlflow.log_param("query", query)
    mlflow.log_param("num_agents", len(system.agents))
    mlflow.log_param("agents_used", list(system.agents.keys()))
    
    # Log metrics
    mlflow.log_metric("execution_time_seconds", duration)
    mlflow.log_metric("num_tasks_completed", len(result.get("completed_tasks", [])))
    
    # Log plan and output as artifacts
    with open("/tmp/execution_plan.txt", "w") as f:
        f.write(result.get("plan", ""))
    mlflow.log_artifact("/tmp/execution_plan.txt")
    
    with open("/tmp/final_output.txt", "w") as f:
        f.write(result.get("output", ""))
    mlflow.log_artifact("/tmp/final_output.txt")
    
    print(f"Multi-agent run logged to MLflow!")
    print(f"Run ID: {mlflow.active_run().info.run_id}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 9. Save Results to Delta

# COMMAND ----------

from pyspark.sql import Row

# Create result record
result_record = Row(
    timestamp=datetime.now(),
    query=query,
    plan=result.get("plan", ""),
    output=result.get("output", ""),
    num_agents=len(system.agents),
    num_tasks=len(result.get("completed_tasks", [])),
    execution_time=duration
)

# Save to Delta table
df = spark.createDataFrame([result_record])
df.write.format("delta").mode("append").saveAsTable("multi_agent_results")

print("Results saved to Delta table: multi_agent_results")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 10. Query Historical Results

# COMMAND ----------

display(
    spark.sql("""
        SELECT 
            timestamp,
            LEFT(query, 100) as query_preview,
            num_agents,
            num_tasks,
            execution_time,
            LEFT(output, 200) as output_preview
        FROM multi_agent_results
        ORDER BY timestamp DESC
        LIMIT 10
    """)
)

# COMMAND ----------

# MAGIC %md
# MAGIC ## 11. Performance Analytics

# COMMAND ----------

# Analyze multi-agent system performance
display(
    spark.sql("""
        SELECT 
            num_agents,
            AVG(execution_time) as avg_execution_time,
            AVG(num_tasks) as avg_tasks,
            COUNT(*) as total_runs
        FROM multi_agent_results
        GROUP BY num_agents
        ORDER BY num_agents
    """)
)

# COMMAND ----------

# MAGIC %md
# MAGIC ## 12. Custom Agent Configuration

# COMMAND ----------

# Create a custom multi-agent system with specific agents
custom_system = create_multi_agent_system(
    include_researcher=True,
    include_data_analyst=False,  # Disable data analyst for this use case
    databricks_config=None
)

# Run with custom configuration
custom_result = custom_system.run(
    "Research the latest breakthroughs in quantum computing and summarize the implications"
)

print("Custom System Result:")
print("=" * 80)
print(custom_result.get("output", ""))

# COMMAND ----------

# MAGIC %md
# MAGIC ## Cleanup

# COMMAND ----------

# Uncomment to clean up
# spark.sql("DROP TABLE IF EXISTS multi_agent_results")

