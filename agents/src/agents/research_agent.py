"""
Research Agent - Specialized agent for information gathering and analysis
Implements the full BMAD methodology
"""
from typing import Dict, Any, Optional
from ..core import BaseAgent, AgentConfig, GraphBuilder
from ..utils import create_search_tool, create_web_scraper_tool, PromptLibrary


class ResearchAgent(BaseAgent):
    """
    Research Agent for finding and synthesizing information
    
    Role: Information researcher and analyst
    Goal: Find accurate, relevant information and provide well-cited summaries
    Tools: Web search, web scraping, document retrieval
    """
    
    def __init__(self, config: Optional[AgentConfig] = None):
        if config is None:
            config = AgentConfig(
                name="Research Agent",
                role="Research assistant specialized in information gathering and analysis",
                goal="Find accurate, up-to-date information and synthesize it into clear, well-cited summaries",
                system_prompt=PromptLibrary.research_agent_prompt(),
                temperature=0.7,
                model_name="gpt-4",
                tools=["web_search", "web_scraper"],
                use_memory=True,
                max_iterations=10
            )
        
        super().__init__(config)
        self._setup_tools()
    
    def _setup_tools(self):
        """Setup research-specific tools"""
        # Add web search tool
        try:
            search_tool = create_search_tool()
            self.register_tool("web_search", search_tool)
        except Exception as e:
            print(f"Warning: Could not initialize search tool: {e}")
        
        # Add web scraper tool
        scraper_tool = create_web_scraper_tool()
        self.register_tool("web_scraper", scraper_tool)
    
    def format_output(self, result: Any) -> Dict[str, Any]:
        """Format research output with citations and structure"""
        if isinstance(result, dict):
            return result
        
        # Extract key information from research result
        output = {
            "summary": str(result),
            "sources": [],
            "confidence": "medium",
            "follow_up_questions": []
        }
        
        return output


def create_research_agent(
    api_key: Optional[str] = None,
    model_name: str = "gpt-4",
    use_tools: bool = True
) -> ResearchAgent:
    """
    Factory function to create a research agent with LangGraph
    
    Args:
        api_key: API key for LLM provider
        model_name: Name of the LLM model to use
        use_tools: Whether to enable tool use
    
    Returns:
        Configured and ready-to-use research agent
    """
    # Create agent
    agent = ResearchAgent()
    
    # Build the graph
    builder = GraphBuilder(agent)
    
    if use_tools and agent.get_tools():
        # Use ReAct pattern with tools
        builder.build_react_agent_graph()
    else:
        # Simple reasoning without tools
        builder.build_simple_agent_graph()
    
    # Compile the graph
    builder.compile()
    
    return agent


# Example usage
if __name__ == "__main__":
    # Create and use research agent
    agent = create_research_agent()
    
    # Run a research query
    result = agent.run("What are the latest developments in quantum computing in 2024?")
    
    print("Research Results:")
    print("=" * 50)
    print(result.get("output", "No output"))
    print("\nIntermediate Steps:")
    for step in result.get("intermediate_steps", []):
        print(f"- {step}")

