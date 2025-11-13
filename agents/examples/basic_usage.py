"""
Basic usage examples for LangGraph agents
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Ensure API key is set
if not os.getenv("OPENAI_API_KEY"):
    print("⚠️  Please set OPENAI_API_KEY in your .env file")
    exit(1)


def example_1_research_agent():
    """Example 1: Basic research agent usage"""
    print("\n" + "=" * 80)
    print("EXAMPLE 1: Research Agent")
    print("=" * 80)
    
    from src.agents import create_research_agent
    
    # Create agent
    agent = create_research_agent(model_name="gpt-4", use_tools=False)
    
    # Run query
    query = "What is LangGraph and what are its main benefits?"
    print(f"\nQuery: {query}\n")
    
    result = agent.run(query)
    
    print("Response:")
    print("-" * 80)
    print(result.get("output", "No output"))
    print("\n")


def example_2_data_analyst():
    """Example 2: Data analyst agent"""
    print("\n" + "=" * 80)
    print("EXAMPLE 2: Data Analyst Agent")
    print("=" * 80)
    
    from src.agents import create_data_analyst
    
    # Create agent (without Databricks config for local demo)
    agent = create_data_analyst(use_tools=False)
    
    # Run analysis query
    query = """
    Analyze the following sales data scenario:
    - Q1 revenue: $1.2M
    - Q2 revenue: $1.5M
    - Q3 revenue: $1.8M
    - Q4 revenue: $2.1M
    
    Provide insights and recommendations.
    """
    
    print(f"\nQuery: {query}\n")
    
    result = agent.run(query)
    
    print("Analysis:")
    print("-" * 80)
    print(result.get("output", "No output"))
    print("\n")


def example_3_multi_agent():
    """Example 3: Multi-agent system"""
    print("\n" + "=" * 80)
    print("EXAMPLE 3: Multi-Agent System")
    print("=" * 80)
    
    from src.agents import create_multi_agent_system
    
    # Create multi-agent system
    system = create_multi_agent_system(
        include_researcher=True,
        include_data_analyst=True
    )
    
    # Run complex query
    query = "Analyze the AI agent market: research trends and provide strategic insights"
    print(f"\nQuery: {query}\n")
    
    result = system.run(query)
    
    print("Plan:")
    print("-" * 80)
    print(result.get("plan", "No plan"))
    
    print("\n\nCompleted Tasks:")
    print("-" * 80)
    for i, task in enumerate(result.get("completed_tasks", []), 1):
        print(f"{i}. Agent: {task['agent']}")
        print(f"   Task: {task['task']}")
        print(f"   Result: {task['result'][:150]}...\n")
    
    print("\nFinal Output:")
    print("-" * 80)
    print(result.get("output", "No output"))
    print("\n")


def example_4_custom_agent():
    """Example 4: Creating a custom agent"""
    print("\n" + "=" * 80)
    print("EXAMPLE 4: Custom Agent")
    print("=" * 80)
    
    from src.core import BaseAgent, AgentConfig, GraphBuilder
    from src.utils import PromptLibrary
    
    # Create custom agent configuration
    custom_prompt = PromptLibrary.create_custom_prompt(
        role="a creative writing assistant",
        goal="help users write engaging stories and content",
        capabilities=[
            "Generate creative story ideas",
            "Develop character profiles",
            "Suggest plot developments",
            "Provide writing tips and feedback"
        ],
        protocol=[
            "Understand the user's creative vision",
            "Ask clarifying questions if needed",
            "Generate creative and original content",
            "Provide structured, actionable suggestions",
            "Encourage creativity and experimentation"
        ],
        output_format="""
**Story Idea:**
[Main concept]

**Characters:**
- [Character descriptions]

**Plot Points:**
1. [Key events]

**Writing Tips:**
- [Relevant advice]
        """,
        constraints=[
            "Keep content appropriate and constructive",
            "Respect copyright and originality",
            "Encourage the writer's unique voice"
        ]
    )
    
    # Create agent
    config = AgentConfig(
        name="Creative Writing Assistant",
        role="Creative writing assistant",
        goal="Help users create engaging stories",
        system_prompt=custom_prompt,
        temperature=0.9,  # Higher temperature for creativity
        model_name="gpt-4"
    )
    
    class CreativeAgent(BaseAgent):
        def __init__(self):
            super().__init__(config)
    
    agent = CreativeAgent()
    
    # Build graph
    builder = GraphBuilder(agent)
    builder.build_simple_agent_graph()
    builder.compile()
    
    # Use the agent
    query = "Help me create a story about an AI agent that discovers emotions"
    print(f"\nQuery: {query}\n")
    
    result = agent.run(query)
    
    print("Creative Output:")
    print("-" * 80)
    print(result.get("output", "No output"))
    print("\n")


def example_5_with_memory():
    """Example 5: Agent with conversation memory"""
    print("\n" + "=" * 80)
    print("EXAMPLE 5: Agent with Memory")
    print("=" * 80)
    
    from src.agents import create_research_agent
    from src.utils import MemoryManager
    
    # Create agent with memory
    agent = create_research_agent(use_tools=False)
    memory = MemoryManager(memory_type="conversational", max_token_limit=2000)
    
    # Conversation 1
    query1 = "What are the main components of LangGraph?"
    print(f"\nUser: {query1}")
    
    result1 = agent.run(query1)
    response1 = result1.get("output", "")
    print(f"Agent: {response1[:200]}...\n")
    
    # Add to memory
    memory.add_message(query1, response1)
    
    # Conversation 2 (referencing previous)
    query2 = "How do these components work together?"
    print(f"User: {query2}")
    
    # Get memory context
    history = memory.get_conversation_history()
    context = "\n".join([f"{msg.type}: {msg.content[:100]}..." for msg in history[-4:]])
    
    result2 = agent.run(f"Previous context:\n{context}\n\nNew question: {query2}")
    response2 = result2.get("output", "")
    print(f"Agent: {response2[:200]}...\n")
    
    memory.add_message(query2, response2)
    
    print(f"\nMemory contains {len(memory.get_conversation_history())} messages")
    print("\n")


def main():
    """Run all examples"""
    print("\n")
    print("╔" + "=" * 78 + "╗")
    print("║" + " " * 20 + "LangGraph Agents - Usage Examples" + " " * 25 + "║")
    print("╚" + "=" * 78 + "╝")
    
    examples = [
        ("Research Agent", example_1_research_agent),
        ("Data Analyst Agent", example_2_data_analyst),
        ("Multi-Agent System", example_3_multi_agent),
        ("Custom Agent", example_4_custom_agent),
        ("Agent with Memory", example_5_with_memory)
    ]
    
    print("\nAvailable examples:")
    for i, (name, _) in enumerate(examples, 1):
        print(f"{i}. {name}")
    
    print("\nRunning all examples...\n")
    
    for name, func in examples:
        try:
            func()
        except Exception as e:
            print(f"\n❌ Error in {name}: {e}\n")
            continue
    
    print("\n" + "=" * 80)
    print("Examples completed!")
    print("=" * 80)
    print("\nNext steps:")
    print("1. Explore the src/agents/ directory for agent implementations")
    print("2. Check out databricks/notebooks/ for Databricks examples")
    print("3. Customize agents for your specific use cases")
    print("4. Deploy to Databricks for production use")
    print("\n")


if __name__ == "__main__":
    main()

