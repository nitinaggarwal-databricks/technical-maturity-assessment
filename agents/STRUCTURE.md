# Project Structure

## Complete Directory Tree

```
agents/
│
├── 📄 README.md                              # Main documentation (500+ lines)
├── 📄 QUICKSTART.md                          # 5-minute quick start guide
├── 📄 PROJECT_SUMMARY.md                     # Overview and summary
├── 📄 STRUCTURE.md                           # This file
├── 📄 requirements.txt                       # Python dependencies
├── 📄 setup.py                               # Package setup
├── 📄 env.example                            # Environment variables template
├── 📄 .gitignore                             # Git ignore rules
│
├── 📁 src/                                   # Source code
│   ├── 📄 __init__.py
│   │
│   ├── 📁 config/                           # Configuration management
│   │   ├── 📄 __init__.py
│   │   └── 📄 settings.py                   # Settings class with env vars
│   │
│   ├── 📁 core/                             # Core framework
│   │   ├── 📄 __init__.py
│   │   ├── 📄 base_agent.py                # BaseAgent class (BMAD steps 1-3)
│   │   └── 📄 graph_builder.py             # LangGraph graph construction
│   │
│   ├── 📁 agents/                           # Pre-built agent implementations
│   │   ├── 📄 __init__.py
│   │   ├── 📄 research_agent.py            # Research & information gathering
│   │   ├── 📄 data_analyst.py              # Data analysis with SQL
│   │   ├── 📄 medical_assistant.py         # Medical data analysis
│   │   └── 📄 multi_agent_system.py        # Multi-agent orchestration
│   │
│   └── 📁 utils/                            # Utility modules
│       ├── 📄 __init__.py
│       ├── 📄 tools.py                      # Tool implementations (Step 4)
│       ├── 📄 memory.py                     # Memory management (Step 6)
│       └── 📄 prompts.py                    # Prompt templates (Step 3)
│
├── 📁 databricks/                           # Databricks deployment
│   ├── 📄 README.md                        # Databricks-specific guide
│   ├── 📄 deploy.py                        # Deployment script
│   │
│   ├── 📁 notebooks/                       # Databricks notebooks
│   │   ├── 📄 01_research_agent_demo.py   # Research agent demo
│   │   ├── 📄 02_data_analyst_agent_demo.py  # Data analyst demo
│   │   └── 📄 03_multi_agent_system_demo.py  # Multi-agent demo
│   │
│   └── 📁 configs/                         # Configuration files
│       ├── 📄 cluster_config.json         # Cluster setup
│       └── 📄 job_config.json             # Scheduled job config
│
└── 📁 examples/                             # Usage examples
    └── 📄 basic_usage.py                   # 5 working examples
```

## File Descriptions

### Root Level Files

| File | Purpose | Lines |
|------|---------|-------|
| `README.md` | Complete documentation with examples | 500+ |
| `QUICKSTART.md` | Get started in 5 minutes | 150+ |
| `PROJECT_SUMMARY.md` | Project overview and highlights | 300+ |
| `requirements.txt` | Python package dependencies | 30+ |
| `setup.py` | Package installation configuration | 40+ |
| `env.example` | Environment variable template | 20+ |

### Source Code (`src/`)

#### Configuration (`src/config/`)
- `settings.py` - Pydantic settings management, environment variables, API keys

#### Core Framework (`src/core/`)
- `base_agent.py` - BaseAgent class implementing BMAD methodology
- `graph_builder.py` - LangGraph graph patterns (Simple, ReAct, CoT, Multi-agent)

#### Pre-built Agents (`src/agents/`)
- `research_agent.py` - Web search, information gathering, synthesis
- `data_analyst.py` - SQL queries, Databricks integration, analytics
- `medical_assistant.py` - Medical document analysis, structured output
- `multi_agent_system.py` - Orchestration with Planner + specialists

#### Utilities (`src/utils/`)
- `tools.py` - 8+ tools (search, calculator, SQL, API calls, MLflow)
- `memory.py` - 3 memory types (conversational, summary, vector)
- `prompts.py` - Prompt library following BMAD best practices

### Databricks Integration (`databricks/`)

#### Notebooks (`databricks/notebooks/`)
- `01_research_agent_demo.py` - Research agent with MLflow tracking
- `02_data_analyst_agent_demo.py` - SQL queries on Delta tables
- `03_multi_agent_system_demo.py` - Multi-agent coordination

#### Configurations (`databricks/configs/`)
- `cluster_config.json` - Optimized cluster setup for agents
- `job_config.json` - Scheduled job configuration

#### Deployment (`databricks/`)
- `deploy.py` - Script to upload to Databricks workspace
- `README.md` - Databricks deployment guide

### Examples (`examples/`)
- `basic_usage.py` - 5 complete working examples

## Code Organization by BMAD Steps

```
BMAD Step 1-2: Define Role & Structured I/O
├── src/core/base_agent.py (AgentConfig, AgentState)
└── src/agents/*.py (Agent-specific configs)

BMAD Step 3: Tune Behavior & Protocol
├── src/utils/prompts.py (PromptLibrary, templates)
└── src/core/base_agent.py (System prompts)

BMAD Step 4: Reasoning & Tool Use
├── src/utils/tools.py (Tool implementations)
├── src/core/graph_builder.py (ReAct pattern)
└── src/agents/*.py (Tool registration)

BMAD Step 5: Multi-Agent Logic
├── src/agents/multi_agent_system.py (Orchestration)
└── src/core/graph_builder.py (Multi-agent graphs)

BMAD Step 6: Memory & Context
├── src/utils/memory.py (MemoryManager)
└── src/core/base_agent.py (Memory integration)

BMAD Step 7-10: Output, Evaluation, Monitoring
├── src/core/base_agent.py (Output formatting)
├── databricks/notebooks/*.py (MLflow tracking)
└── All agents (Structured outputs)
```

## Import Paths

### Creating Agents
```python
from src.agents import (
    create_research_agent,
    create_data_analyst,
    create_medical_assistant,
    create_multi_agent_system
)
```

### Core Framework
```python
from src.core import BaseAgent, AgentConfig, GraphBuilder
```

### Utilities
```python
from src.utils import (
    ToolRegistry,
    create_search_tool,
    create_calculator_tool,
    MemoryManager,
    PromptLibrary
)
```

### Configuration
```python
from src.config import Settings, get_settings
```

## Key Components Summary

### Agents (4 types)
1. ✅ Research Agent - Information gathering
2. ✅ Data Analyst - SQL and analytics
3. ✅ Medical Assistant - Document analysis
4. ✅ Multi-Agent System - Orchestration

### Tools (8+ available)
1. Web Search (Tavily)
2. Web Scraper
3. Calculator
4. Document Retriever
5. Python REPL
6. API Caller
7. Databricks SQL
8. MLflow Logger

### Memory Types (3)
1. Conversational - Recent messages
2. Summary - Summarized history
3. Vector - Semantic search

### Graph Patterns (3)
1. Simple - Direct reasoning
2. ReAct - Reasoning + Acting
3. Chain-of-Thought - Step-by-step

### Notebooks (3)
1. Research Agent Demo
2. Data Analyst Demo
3. Multi-Agent Demo

## Entry Points

### For Users
1. Start here: `QUICKSTART.md`
2. Main docs: `README.md`
3. Examples: `examples/basic_usage.py`

### For Developers
1. Framework: `src/core/base_agent.py`
2. Agents: `src/agents/`
3. Extend: `src/utils/tools.py`, `src/utils/memory.py`

### For Databricks
1. Deploy: `databricks/deploy.py`
2. Configure: `databricks/configs/`
3. Run: `databricks/notebooks/`

## Quick Navigation

```bash
# View main documentation
cat README.md

# Quick start
cat QUICKSTART.md

# Run examples
python examples/basic_usage.py

# Deploy to Databricks
python databricks/deploy.py --help

# Create custom agent
# Start with: src/agents/research_agent.py as template
```

## Size Statistics

| Category | Count |
|----------|-------|
| Total Files | 25+ |
| Python Files | 18 |
| Notebooks | 3 |
| Config Files | 2 |
| Documentation | 5 |
| Total Lines | 3,000+ |
| Agent Types | 4 |
| Tools | 8+ |
| Examples | 5 |

---

**Navigate easily, build confidently!** 🚀

