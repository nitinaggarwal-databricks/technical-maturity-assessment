"""
Base Agent class following the BMAD methodology
Step 1: Define the agent's role and goal
Step 2: Design structured input & output
Step 3: Tune behavior & add protocol
"""
from typing import Any, Dict, List, Optional, TypedDict, Annotated
from pydantic import BaseModel, Field
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_core.language_models import BaseChatModel
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
import operator


class AgentConfig(BaseModel):
    """Configuration for an agent"""
    
    # Step 1: Role and Goal
    name: str = Field(description="Agent name")
    role: str = Field(description="Agent's role and purpose")
    goal: str = Field(description="What the agent is designed to accomplish")
    
    # Step 2: Input/Output Schema
    input_schema: Dict[str, Any] = Field(default_factory=dict, description="Expected input format")
    output_schema: Dict[str, Any] = Field(default_factory=dict, description="Expected output format")
    
    # Step 3: Behavior and Protocol
    system_prompt: str = Field(description="System prompt defining behavior")
    temperature: float = Field(default=0.7, description="LLM temperature")
    model_name: str = Field(default="gpt-4", description="LLM model to use")
    
    # Step 4: Tools
    tools: List[str] = Field(default_factory=list, description="Available tools")
    
    # Step 6: Memory
    use_memory: bool = Field(default=True, description="Whether to use memory")
    memory_window: int = Field(default=10, description="Number of messages to keep in memory")
    
    # Additional settings
    max_iterations: int = Field(default=10, description="Maximum reasoning iterations")
    verbose: bool = Field(default=True, description="Verbose output")
    

class AgentState(TypedDict):
    """
    State schema for LangGraph agent
    Step 2: Structured input/output using Pydantic or TypedDict
    """
    messages: Annotated[List[BaseMessage], operator.add]
    input: str
    output: Optional[str]
    intermediate_steps: List[Dict[str, Any]]
    iteration: int
    error: Optional[str]
    metadata: Dict[str, Any]


class BaseAgent:
    """
    Base agent class implementing the BMAD methodology
    
    This class provides the foundation for building specialized agents:
    - Role-based system prompts (Step 1)
    - Structured I/O with Pydantic (Step 2)
    - Configurable behavior via MCP/prompt tuning (Step 3)
    - Tool integration support (Step 4)
    - Multi-agent coordination ready (Step 5)
    - Memory integration (Step 6)
    """
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.llm = self._initialize_llm()
        self.tools_map = {}
        
    def _initialize_llm(self) -> BaseChatModel:
        """Initialize the language model based on config"""
        model_name = self.config.model_name.lower()
        
        if "gpt" in model_name or "openai" in model_name:
            return ChatOpenAI(
                model=self.config.model_name,
                temperature=self.config.temperature
            )
        elif "claude" in model_name or "anthropic" in model_name:
            return ChatAnthropic(
                model=self.config.model_name,
                temperature=self.config.temperature
            )
        else:
            # Default to OpenAI
            return ChatOpenAI(
                model=self.config.model_name,
                temperature=self.config.temperature
            )
    
    def get_system_message(self) -> SystemMessage:
        """Get the system prompt message"""
        return SystemMessage(content=self.config.system_prompt)
    
    def format_input(self, user_input: str, **kwargs) -> Dict[str, Any]:
        """
        Format user input according to input schema (Step 2)
        Override in subclasses for custom formatting
        """
        return {
            "input": user_input,
            **kwargs
        }
    
    def format_output(self, result: Any) -> Dict[str, Any]:
        """
        Format agent output according to output schema (Step 2)
        Override in subclasses for custom formatting
        """
        if isinstance(result, dict):
            return result
        return {"output": str(result)}
    
    def validate_input(self, input_data: Dict[str, Any]) -> bool:
        """Validate input against schema"""
        # Add validation logic based on input_schema
        return True
    
    def validate_output(self, output_data: Dict[str, Any]) -> bool:
        """Validate output against schema"""
        # Add validation logic based on output_schema
        return True
    
    def register_tool(self, name: str, tool: Any):
        """Register a tool for the agent to use (Step 4)"""
        self.tools_map[name] = tool
    
    def get_tools(self) -> List[Any]:
        """Get all registered tools"""
        return list(self.tools_map.values())
    
    def run(self, input_data: str, **kwargs) -> Dict[str, Any]:
        """
        Run the agent (to be implemented by GraphBuilder)
        This method will be overridden when the graph is built
        """
        raise NotImplementedError("Agent must be built with GraphBuilder first")
    
    async def arun(self, input_data: str, **kwargs) -> Dict[str, Any]:
        """
        Async run method
        """
        raise NotImplementedError("Agent must be built with GraphBuilder first")

