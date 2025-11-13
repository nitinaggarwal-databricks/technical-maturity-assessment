# Quick Start Guide

Get up and running with LangGraph agents in 5 minutes!

## 🚀 1. Install Dependencies

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install packages
pip install -r requirements.txt
```

## 🔑 2. Set Up API Keys

Create a `.env` file in the root directory:

```bash
OPENAI_API_KEY=sk-your-key-here
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

## 🎯 3. Run Your First Agent

Create a file `my_first_agent.py`:

```python
from src.agents import create_research_agent

# Create an agent
agent = create_research_agent(model_name="gpt-4")

# Ask a question
result = agent.run("What is artificial intelligence?")

# Print the answer
print(result["output"])
```

Run it:

```bash
python my_first_agent.py
```

## 🎨 4. Try Different Agent Types

### Research Agent
```python
from src.agents import create_research_agent

agent = create_research_agent()
result = agent.run("What are the latest AI trends?")
print(result["output"])
```

### Data Analyst Agent
```python
from src.agents import create_data_analyst

agent = create_data_analyst()
result = agent.run("Analyze this data: Q1=$1M, Q2=$1.5M, Q3=$2M")
print(result["output"])
```

### Multi-Agent System
```python
from src.agents import create_multi_agent_system

system = create_multi_agent_system()
result = system.run("Research AI trends and provide analysis")

print("Plan:", result["plan"])
print("Output:", result["output"])
```

## 📊 5. Deploy to Databricks

1. Install Databricks CLI:
```bash
pip install databricks-cli
databricks configure --token
```

2. Deploy agents:
```bash
python databricks/deploy.py \
  --workspace-url https://your-workspace.cloud.databricks.com \
  --token YOUR_TOKEN \
  --workspace-path /Users/your-email/agents \
  --overwrite
```

3. Configure secrets in Databricks:
```bash
databricks secrets create-scope --scope agents
databricks secrets put --scope agents --key openai-api-key
```

4. Open the notebooks in your Databricks workspace and run them!

## 📖 6. Next Steps

- **Read the full README.md** for detailed documentation
- **Check out examples/** for more usage patterns
- **Explore databricks/notebooks/** for Databricks-specific examples
- **Customize agents** for your specific use cases

## 💡 Common Patterns

### Add Tools to an Agent
```python
from src.agents import create_research_agent
from src.utils import create_calculator_tool

agent = create_research_agent()
agent.register_tool("calculator", create_calculator_tool())

result = agent.run("Calculate 123 * 456 and explain the result")
```

### Use Memory
```python
from src.utils import MemoryManager

memory = MemoryManager(memory_type="conversational")

# First conversation
memory.add_message("Hello!", "Hi! How can I help?")

# Later, retrieve context
history = memory.get_conversation_history()
```

### Track with MLflow
```python
import mlflow

mlflow.set_experiment("/my-agent-experiment")

with mlflow.start_run():
    result = agent.run(query)
    mlflow.log_param("query", query)
    mlflow.log_metric("execution_time", 1.5)
```

## 🆘 Troubleshooting

**Import errors?**
- Make sure you're in the virtual environment
- Run `pip install -e .` to install in development mode

**API key not working?**
- Check that `.env` file exists in the root directory
- Verify the key is correct and has credits
- Try `python -c "from dotenv import load_dotenv; load_dotenv(); import os; print(os.getenv('OPENAI_API_KEY'))"`

**Slow responses?**
- First runs may be slower
- Check your internet connection
- Consider using a smaller model like `gpt-3.5-turbo`

## 📞 Need Help?

- Check the main README.md for detailed docs
- Review example code in `examples/basic_usage.py`
- Check LangGraph docs: https://langchain-ai.github.io/langgraph/

Happy agent building! 🤖

