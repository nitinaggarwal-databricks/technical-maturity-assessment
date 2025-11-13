"""
LangGraph Graph Builder
Constructs the agent execution graph with reasoning, tool use, and memory
"""
from typing import Any, Dict, List, Optional, Callable
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolExecutor, ToolInvocation
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage
from langchain_core.tools import Tool

from .base_agent import BaseAgent, AgentState


class GraphBuilder:
    """
    Builds LangGraph execution graphs for agents
    Implements Step 4 (Reasoning + Tools) and Step 5 (Multi-agent logic)
    """
    
    def __init__(self, agent: BaseAgent):
        self.agent = agent
        self.graph: Optional[StateGraph] = None
        self.compiled_graph = None
        
    def build_simple_agent_graph(self) -> StateGraph:
        """
        Build a simple agent graph with:
        1. Input processing
        2. LLM reasoning
        3. Output formatting
        """
        workflow = StateGraph(AgentState)
        
        # Define nodes
        workflow.add_node("process_input", self._process_input_node)
        workflow.add_node("reason", self._reason_node)
        workflow.add_node("format_output", self._format_output_node)
        
        # Define edges
        workflow.set_entry_point("process_input")
        workflow.add_edge("process_input", "reason")
        workflow.add_edge("reason", "format_output")
        workflow.add_edge("format_output", END)
        
        self.graph = workflow
        return workflow
    
    def build_react_agent_graph(self) -> StateGraph:
        """
        Build a ReAct (Reasoning + Acting) agent graph with tool use:
        1. Input processing
        2. Reasoning (decide on action)
        3. Tool execution (if needed)
        4. Observation and iteration
        5. Output formatting
        """
        workflow = StateGraph(AgentState)
        
        # Define nodes
        workflow.add_node("process_input", self._process_input_node)
        workflow.add_node("reason", self._reason_with_tools_node)
        workflow.add_node("execute_tools", self._execute_tools_node)
        workflow.add_node("format_output", self._format_output_node)
        
        # Define edges
        workflow.set_entry_point("process_input")
        workflow.add_edge("process_input", "reason")
        
        # Conditional edge: if tools needed, execute them; otherwise, format output
        workflow.add_conditional_edges(
            "reason",
            self._should_continue,
            {
                "continue": "execute_tools",
                "end": "format_output"
            }
        )
        
        workflow.add_edge("execute_tools", "reason")
        workflow.add_edge("format_output", END)
        
        self.graph = workflow
        return workflow
    
    def build_chain_of_thought_graph(self) -> StateGraph:
        """
        Build a Chain-of-Thought agent that breaks down reasoning into steps
        """
        workflow = StateGraph(AgentState)
        
        workflow.add_node("process_input", self._process_input_node)
        workflow.add_node("plan", self._plan_node)
        workflow.add_node("reason_step", self._reason_step_node)
        workflow.add_node("format_output", self._format_output_node)
        
        workflow.set_entry_point("process_input")
        workflow.add_edge("process_input", "plan")
        workflow.add_edge("plan", "reason_step")
        
        workflow.add_conditional_edges(
            "reason_step",
            self._should_continue_thinking,
            {
                "continue": "reason_step",
                "end": "format_output"
            }
        )
        
        workflow.add_edge("format_output", END)
        
        self.graph = workflow
        return workflow
    
    def compile(self) -> Any:
        """Compile the graph for execution"""
        if self.graph is None:
            raise ValueError("Graph not built. Call build_*_graph() first")
        
        self.compiled_graph = self.graph.compile()
        
        # Override agent's run methods
        self.agent.run = self._create_run_method()
        self.agent.arun = self._create_async_run_method()
        
        return self.compiled_graph
    
    # Node implementations
    
    def _process_input_node(self, state: AgentState) -> AgentState:
        """Process and validate input"""
        messages = [self.agent.get_system_message()]
        
        # Add memory if configured
        if self.agent.config.use_memory and len(state.get("messages", [])) > 0:
            # Keep last N messages
            recent_messages = state["messages"][-self.agent.config.memory_window:]
            messages.extend(recent_messages)
        
        # Add current input
        messages.append(HumanMessage(content=state["input"]))
        
        return {
            **state,
            "messages": messages,
            "iteration": 0,
            "intermediate_steps": [],
            "metadata": state.get("metadata", {})
        }
    
    def _reason_node(self, state: AgentState) -> AgentState:
        """Basic reasoning without tools"""
        response = self.agent.llm.invoke(state["messages"])
        
        messages = state["messages"] + [response]
        
        return {
            **state,
            "messages": messages,
            "output": response.content
        }
    
    def _reason_with_tools_node(self, state: AgentState) -> AgentState:
        """Reasoning with tool use capability"""
        tools = self.agent.get_tools()
        
        if tools:
            llm_with_tools = self.agent.llm.bind_tools(tools)
            response = llm_with_tools.invoke(state["messages"])
        else:
            response = self.agent.llm.invoke(state["messages"])
        
        messages = state["messages"] + [response]
        iteration = state.get("iteration", 0) + 1
        
        return {
            **state,
            "messages": messages,
            "iteration": iteration
        }
    
    def _execute_tools_node(self, state: AgentState) -> AgentState:
        """Execute tools based on LLM's decisions"""
        last_message = state["messages"][-1]
        
        if not hasattr(last_message, "tool_calls") or not last_message.tool_calls:
            return state
        
        tool_executor = ToolExecutor(self.agent.get_tools())
        messages = []
        intermediate_steps = state.get("intermediate_steps", [])
        
        for tool_call in last_message.tool_calls:
            tool_invocation = ToolInvocation(
                tool=tool_call["name"],
                tool_input=tool_call["args"]
            )
            
            result = tool_executor.invoke(tool_invocation)
            
            intermediate_steps.append({
                "tool": tool_call["name"],
                "input": tool_call["args"],
                "output": result
            })
            
            messages.append(
                ToolMessage(
                    content=str(result),
                    tool_call_id=tool_call["id"]
                )
            )
        
        return {
            **state,
            "messages": state["messages"] + messages,
            "intermediate_steps": intermediate_steps
        }
    
    def _plan_node(self, state: AgentState) -> AgentState:
        """Create a plan for solving the task"""
        planning_prompt = """Break down the task into logical steps. 
        Create a plan to solve this systematically."""
        
        messages = state["messages"] + [HumanMessage(content=planning_prompt)]
        response = self.agent.llm.invoke(messages)
        
        return {
            **state,
            "messages": state["messages"] + [response],
            "metadata": {**state.get("metadata", {}), "plan": response.content}
        }
    
    def _reason_step_node(self, state: AgentState) -> AgentState:
        """Execute one step of reasoning"""
        iteration = state.get("iteration", 0) + 1
        
        response = self.agent.llm.invoke(state["messages"])
        messages = state["messages"] + [response]
        
        return {
            **state,
            "messages": messages,
            "iteration": iteration,
            "output": response.content
        }
    
    def _format_output_node(self, state: AgentState) -> AgentState:
        """Format the final output"""
        # Extract final answer from messages
        final_output = state.get("output", "")
        
        if not final_output and state["messages"]:
            last_ai_message = next(
                (msg for msg in reversed(state["messages"]) if isinstance(msg, AIMessage)),
                None
            )
            if last_ai_message:
                final_output = last_ai_message.content
        
        formatted = self.agent.format_output(final_output)
        
        return {
            **state,
            "output": formatted.get("output", final_output)
        }
    
    # Conditional edge functions
    
    def _should_continue(self, state: AgentState) -> str:
        """Decide if agent should continue with tool execution"""
        last_message = state["messages"][-1]
        iteration = state.get("iteration", 0)
        
        # Check if max iterations reached
        if iteration >= self.agent.config.max_iterations:
            return "end"
        
        # Check if tools need to be called
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "continue"
        
        return "end"
    
    def _should_continue_thinking(self, state: AgentState) -> str:
        """Decide if agent should continue thinking"""
        iteration = state.get("iteration", 0)
        
        if iteration >= self.agent.config.max_iterations:
            return "end"
        
        # Simple heuristic: check if answer seems complete
        last_message = state["messages"][-1] if state["messages"] else None
        if last_message and isinstance(last_message, AIMessage):
            content = last_message.content.lower()
            if any(phrase in content for phrase in ["final answer", "conclusion", "in summary"]):
                return "end"
        
        return "continue" if iteration < 3 else "end"
    
    # Helper methods for run
    
    def _create_run_method(self) -> Callable:
        """Create the run method for the agent"""
        def run(input_data: str, **kwargs) -> Dict[str, Any]:
            initial_state: AgentState = {
                "messages": [],
                "input": input_data,
                "output": None,
                "intermediate_steps": [],
                "iteration": 0,
                "error": None,
                "metadata": kwargs
            }
            
            result = self.compiled_graph.invoke(initial_state)
            return result
        
        return run
    
    def _create_async_run_method(self) -> Callable:
        """Create the async run method for the agent"""
        async def arun(input_data: str, **kwargs) -> Dict[str, Any]:
            initial_state: AgentState = {
                "messages": [],
                "input": input_data,
                "output": None,
                "intermediate_steps": [],
                "iteration": 0,
                "error": None,
                "metadata": kwargs
            }
            
            result = await self.compiled_graph.ainvoke(initial_state)
            return result
        
        return arun

