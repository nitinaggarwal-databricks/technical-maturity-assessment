# Databricks Deployment Guide

This directory contains files for deploying and running LangGraph agents on Databricks.

## Contents

- `notebooks/` - Databricks notebooks for running agents
- `configs/` - Configuration files for Databricks jobs and clusters
- `deploy.py` - Deployment script for uploading to Databricks workspace

## Quick Start

### 1. Setup Environment Variables

Create a `.env` file in the root directory with:

```bash
DATABRICKS_HOST=https://your-workspace.cloud.databricks.com
DATABRICKS_TOKEN=your-access-token
OPENAI_API_KEY=your-openai-key
```

### 2. Install Databricks CLI

```bash
pip install databricks-cli
databricks configure --token
```

### 3. Upload Notebooks

```bash
databricks workspace import_dir notebooks /Users/your-email@company.com/agents
```

### 4. Create a Cluster

Use the cluster configuration in `configs/cluster_config.json` or create via UI with:
- DBR 13.3 LTS or higher
- Python 3.10+
- Libraries: langgraph, langchain, mlflow

### 5. Run Agents

Open any notebook in `notebooks/` and attach to your cluster.

## Deployment Options

### Option 1: Interactive Notebooks
- Upload notebooks to Databricks workspace
- Attach to an interactive cluster
- Run cells interactively

### Option 2: Scheduled Jobs
- Use `configs/job_config.json` to create scheduled jobs
- Agents run on a schedule with job clusters

### Option 3: MLflow Model Serving
- Register agent as MLflow model
- Deploy to Model Serving endpoint
- Call via REST API

## Integration with Delta Lake

Agents can query Delta tables directly:

```python
from src.agents import create_data_analyst

# Configure with Databricks SQL connection
agent = create_data_analyst(databricks_config={
    "server_hostname": spark.conf.get("spark.databricks.workspaceUrl"),
    "http_path": "/sql/1.0/warehouses/your-warehouse-id",
    "access_token": dbutils.secrets.get("scope", "token")
})

result = agent.run("Analyze sales trends from the sales_delta_table")
```

## MLflow Tracking

All agent runs can be tracked in MLflow:

```python
import mlflow

mlflow.set_experiment("/Users/your-email/agent-experiments")

with mlflow.start_run():
    result = agent.run(query)
    mlflow.log_param("query", query)
    mlflow.log_metric("execution_time", result["metadata"]["duration"])
```

## Security Best Practices

1. Store API keys in Databricks Secrets
2. Use service principals for production
3. Implement proper access controls on notebooks
4. Enable audit logging for agent actions
5. Use Unity Catalog for data governance

## Troubleshooting

### Import Errors
Ensure all dependencies are installed on your cluster. Add to cluster init script:

```bash
pip install -r requirements.txt
```

### Authentication Issues
Verify Databricks token and API keys are correctly configured.

### Memory Issues
For large-scale processing, use larger cluster instances or implement batching.

