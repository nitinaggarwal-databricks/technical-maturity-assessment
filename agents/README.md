# LangGraph Agents for Databricks

A comprehensive template for building production-ready AI agents using LangGraph, following the BMAD methodology and optimized for Databricks deployment.

![BMAD Methodology](https://img.shields.io/badge/Methodology-BMAD-blue)
![Python](https://img.shields.io/badge/Python-3.9%2B-green)
![LangGraph](https://img.shields.io/badge/LangGraph-0.2%2B-orange)
![Databricks](https://img.shields.io/badge/Platform-Databricks-red)

## 🎯 Overview

This template provides a complete framework for building AI agents that can:
- **Research and analyze** information from various sources
- **Process and query data** from Databricks Delta tables
- **Coordinate multiple specialized agents** for complex tasks
- **Track experiments** with MLflow integration
- **Scale in production** on Databricks infrastructure

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [BMAD Methodology](#bmad-methodology)
- [Agent Types](#agent-types)
- [Databricks Deployment](#databricks-deployment)
- [Examples](#examples)
- [Configuration](#configuration)
- [Best Practices](#best-practices)
- [Contributing](#contributing)

## ✨ Features

### Core Capabilities
- ✅ **LangGraph Integration**: State-of-the-art agent orchestration
- ✅ **Multiple Agent Patterns**: Simple, ReAct, Chain-of-Thought, Multi-agent
- ✅ **Databricks Native**: Deep integration with Delta Lake, Spark, and MLflow
- ✅ **Tool System**: Extensible tools for web search, SQL, calculations, and more
- ✅ **Memory Management**: Conversational, summary, and vector-based memory
- ✅ **Production Ready**: MLflow tracking, error handling, and monitoring

### Agent Types Included
1. **Research Agent** - Information gathering and synthesis
2. **Data Analyst Agent** - SQL queries and data analysis
3. **Medical Assistant** - Structured medical data analysis
4. **Multi-Agent System** - Coordinated execution with specialized agents

### Databricks Features
- 📊 Direct Delta table access
- 🔄 MLflow experiment tracking
- 📓 Ready-to-use notebooks
- ⚡ Cluster configurations
- 🔐 Secrets management integration

## 📁 Project Structure

```
agents/
├── README.md                          # This file
├── requirements.txt                   # Python dependencies
├── setup.py                          # Package setup
├── env.example                       # Environment variables template
│
├── src/                              # Source code
│   ├── config/                       # Configuration management
│   │   ├── __init__.py
│   │   └── settings.py              # Settings and environment
│   │
│   ├── core/                        # Core agent framework
│   │   ├── __init__.py
│   │   ├── base_agent.py           # Base agent class
│   │   └── graph_builder.py        # LangGraph graph construction
│   │
│   ├── agents/                      # Pre-built agent implementations
│   │   ├── __init__.py
│   │   ├── research_agent.py       # Research agent
│   │   ├── data_analyst.py         # Data analyst agent
│   │   ├── medical_assistant.py    # Medical assistant agent
│   │   └── multi_agent_system.py   # Multi-agent coordination
│   │
│   └── utils/                       # Utility modules
│       ├── __init__.py
│       ├── tools.py                # Tool implementations
│       ├── memory.py               # Memory management
│       └── prompts.py              # Prompt templates
│
├── databricks/                      # Databricks deployment
│   ├── README.md                   # Databricks-specific docs
│   ├── deploy.py                   # Deployment script
│   │
│   ├── notebooks/                  # Demo notebooks
│   │   ├── 01_research_agent_demo.py
│   │   ├── 02_data_analyst_agent_demo.py
│   │   └── 03_multi_agent_system_demo.py
│   │
│   └── configs/                    # Configuration files
│       ├── cluster_config.json    # Cluster setup
│       └── job_config.json        # Scheduled jobs
│
└── examples/                        # Usage examples
    └── (to be added)
```

## 🚀 Getting Started

### Prerequisites

- Python 3.9 or higher
- Databricks workspace (for deployment)
- OpenAI or Anthropic API key
- (Optional) Tavily API key for web search

### Local Installation

1. **Clone or download this template**

```bash
cd agents
```

2. **Create virtual environment**

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```

4. **Configure environment variables**

```bash
cp env.example .env
# Edit .env with your API keys
```

5. **Install the package in development mode**

```bash
pip install -e .
```

### Quick Start Example

```python
from src.agents import create_research_agent

# Create a research agent
agent = create_research_agent(model_name="gpt-4")

# Run a query
result = agent.run("What are the latest developments in AI agents?")

print(result["output"])
```

## 🎓 BMAD Methodology

This template implements the **BMAD (Build Marvelous AI Agents Deliberately)** methodology:

### Step 1: Define the Agent's Role and Goal
Every agent has a clear role, goal, and purpose defined in its configuration.

```python
config = AgentConfig(
    name="Research Agent",
    role="Research assistant specialized in information gathering",
    goal="Find accurate, up-to-date information and synthesize it"
)
```

### Step 2: Design Structured Input & Output
Uses Pydantic for schema validation and structured data.

```python
class MedicalReport(BaseModel):
    key_findings: List[str]
    detailed_analysis: str
    recommendations: List[str]
```

### Step 3: Tune Behavior & Add Protocol
Role-based system prompts with clear protocols.

```python
system_prompt = PromptLibrary.research_agent_prompt()
# Includes: role definition, capabilities, protocol steps, output format
```

### Step 4: Add Reasoning and Tool Use
Agents can use tools through ReAct pattern.

```python
agent.register_tool("web_search", create_search_tool())
agent.register_tool("calculator", create_calculator_tool())
```

### Step 5: Structure Multi-Agent Logic
Orchestration with planner, specialist, and reporter agents.

```python
system = create_multi_agent_system(
    include_researcher=True,
    include_data_analyst=True
)
```

### Step 6: Add Memory and Long-term Context
Support for conversational, summary, and vector memory.

```python
memory = MemoryManager(memory_type="conversational")
```

### Steps 7-10: Voice, Output, Evaluation
- Voice capabilities (optional with ElevenLabs)
- Structured output formatting (Markdown, JSON, PDF)
- MLflow evaluation and monitoring
- Comprehensive logging and metrics

## 🤖 Agent Types

### Research Agent

Gathers and synthesizes information from multiple sources.

```python
from src.agents import create_research_agent

agent = create_research_agent(use_tools=True)
result = agent.run("Research quantum computing trends in 2024")
```

**Features:**
- Web search integration
- Source citation
- Confidence scoring
- Follow-up question generation

### Data Analyst Agent

Analyzes data from Databricks tables using SQL and provides insights.

```python
from src.agents import create_data_analyst

agent = create_data_analyst(databricks_config={...})
result = agent.run("What are the top 5 products by revenue?")
```

**Features:**
- SQL query execution
- Statistical analysis
- MLflow integration
- Visualization support

### Medical Assistant

Analyzes medical documents and generates structured reports.

```python
from src.agents import create_medical_assistant

agent = create_medical_assistant()
result = agent.analyze_report(medical_report_text)
```

**Features:**
- Structured output
- Critical finding identification
- Plain-language summaries
- Medical protocol adherence

### Multi-Agent System

Coordinates multiple specialized agents for complex tasks.

```python
from src.agents import create_multi_agent_system

system = create_multi_agent_system()
result = system.run("Research AI trends and analyze market data")
```

**Features:**
- Automatic task decomposition
- Agent coordination
- Result synthesis
- Progress tracking

## 🔧 Databricks Deployment

### Quick Deploy

1. **Setup Databricks CLI**

```bash
pip install databricks-cli
databricks configure --token
```

2. **Deploy to workspace**

```bash
python databricks/deploy.py \
  --workspace-url https://your-workspace.cloud.databricks.com \
  --token dapi... \
  --workspace-path /Users/your-email@company.com/agents \
  --overwrite
```

3. **Configure secrets**

```bash
databricks secrets create-scope --scope agents
databricks secrets put --scope agents --key openai-api-key
databricks secrets put --scope agents --key tavily-api-key
```

4. **Create cluster**

Use the configuration in `databricks/configs/cluster_config.json`

5. **Run notebooks**

Open notebooks in `databricks/notebooks/` and attach to your cluster.

### Scheduled Jobs

Create automated jobs using `databricks/configs/job_config.json`:

```bash
databricks jobs create --json-file databricks/configs/job_config.json
```

## 📖 Examples

### Example 1: Simple Research Query

```python
from src.agents import create_research_agent

agent = create_research_agent()
result = agent.run("What is LangGraph and how does it work?")

print(result["output"])
```

### Example 2: Data Analysis

```python
from src.agents import create_data_analyst

# Configure with Databricks
config = {
    "server_hostname": "your-workspace.databricks.com",
    "http_path": "/sql/1.0/warehouses/...",
    "access_token": "..."
}

agent = create_data_analyst(databricks_config=config)

result = agent.run("""
    Analyze the sales_data table:
    1. Calculate total revenue by product
    2. Identify top performers
    3. Provide recommendations
""")

print(result["output"])
```

### Example 3: Multi-Agent Coordination

```python
from src.agents import create_multi_agent_system

system = create_multi_agent_system()

result = system.run("""
    Create a competitive analysis:
    1. Research top 3 competitors
    2. Analyze market data
    3. Generate strategic recommendations
""")

print("Plan:", result["plan"])
print("Output:", result["output"])
print("Tasks completed:", len(result["completed_tasks"]))
```

### Example 4: Custom Agent

```python
from src.core import BaseAgent, AgentConfig, GraphBuilder
from src.utils import PromptLibrary

# Define custom agent
class CustomAgent(BaseAgent):
    def __init__(self):
        config = AgentConfig(
            name="Custom Agent",
            role="Your custom role",
            goal="Your specific goal",
            system_prompt=PromptLibrary.create_custom_prompt(
                role="...",
                goal="...",
                capabilities=["..."],
                protocol=["Step 1", "Step 2"],
                output_format="..."
            )
        )
        super().__init__(config)

# Build and use
agent = CustomAgent()
builder = GraphBuilder(agent)
builder.build_simple_agent_graph()
builder.compile()

result = agent.run("Your query")
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file:

```bash
# LLM Configuration
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEFAULT_MODEL=gpt-4
DEFAULT_TEMPERATURE=0.7

# Databricks
DATABRICKS_HOST=https://your-workspace.cloud.databricks.com
DATABRICKS_TOKEN=dapi...

# Optional Tools
TAVILY_API_KEY=tvly-...
```

### Agent Configuration

```python
from src.core import AgentConfig

config = AgentConfig(
    name="My Agent",
    role="Agent role description",
    goal="What the agent accomplishes",
    system_prompt="Custom prompt",
    temperature=0.7,
    model_name="gpt-4",
    tools=["tool1", "tool2"],
    use_memory=True,
    max_iterations=10
)
```

### Memory Configuration

```python
from src.utils import MemoryManager

# Conversational memory
memory = MemoryManager(memory_type="conversational")

# Summary memory
memory = MemoryManager(memory_type="summary", llm=llm)

# Vector memory
memory = MemoryManager(memory_type="vector")
```

## 💡 Best Practices

### 1. Agent Design
- Start with clear role and goal definitions
- Use structured input/output schemas
- Implement proper error handling
- Test with various input types

### 2. Tool Usage
- Register only necessary tools
- Provide clear tool descriptions
- Implement tool input validation
- Handle tool errors gracefully

### 3. Memory Management
- Choose appropriate memory type
- Set reasonable memory windows
- Clear memory when starting new sessions
- Persist important conversation history

### 4. Databricks Integration
- Use secrets for API keys
- Implement proper access controls
- Track experiments with MLflow
- Monitor resource usage

### 5. Production Deployment
- Enable error logging
- Set up monitoring and alerts
- Implement retry logic
- Use appropriate cluster sizes

## 🔐 Security

- Store API keys in Databricks Secrets
- Use service principals for production
- Implement access controls on notebooks
- Enable audit logging
- Follow least privilege principle
- Validate all inputs

## 📊 Monitoring and Evaluation

### MLflow Integration

```python
import mlflow

mlflow.set_experiment("/my-agent-experiment")

with mlflow.start_run():
    result = agent.run(query)
    
    mlflow.log_param("query", query)
    mlflow.log_param("model", agent.config.model_name)
    mlflow.log_metric("execution_time", duration)
    mlflow.log_artifact("output.txt")
```

### Custom Metrics

```python
# Track custom metrics
metrics = {
    "response_quality": 0.95,
    "tool_usage_count": 3,
    "tokens_used": 1500
}

for key, value in metrics.items():
    mlflow.log_metric(key, value)
```

## 🧪 Testing

```bash
# Run tests
pytest tests/

# With coverage
pytest --cov=src tests/
```

## 🤝 Contributing

This is a template project. Feel free to:
- Add new agent types
- Implement additional tools
- Enhance memory systems
- Improve Databricks integration
- Add more examples

## 📝 License

This template is provided as-is for educational and commercial use.

## 🙏 Acknowledgments

- Built following the [BMAD methodology](https://www.example.com)
- Powered by [LangGraph](https://github.com/langchain-ai/langgraph)
- Optimized for [Databricks](https://databricks.com)

## 📞 Support

For issues, questions, or contributions:
- Review the documentation in each directory
- Check the example notebooks
- Refer to LangGraph documentation
- Consult Databricks documentation

## 🗺️ Roadmap

- [ ] Add more pre-built agents
- [ ] Implement advanced RAG patterns
- [ ] Add support for more LLM providers
- [ ] Create UI/API layer
- [ ] Add comprehensive test suite
- [ ] Implement agent performance benchmarks

---

**Built with ❤️ for production AI agent development on Databricks**

