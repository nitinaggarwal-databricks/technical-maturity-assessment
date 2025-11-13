"""
Multi-Agent System - Step 5: Structure Multi-Agent Logic
Implements orchestration with Planner, Researcher, Reporter agents
"""
from typing import Dict, Any, List, Optional, TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage
import operator

from ..core import BaseAgent, AgentConfig, GraphBuilder
from ..utils import PromptLibrary
from .research_agent import ResearchAgent
from .data_analyst import DataAnalyst


class MultiAgentState(TypedDict):
    """State for multi-agent coordination"""
    input: str
    plan: Optional[str]
    tasks: List[Dict[str, Any]]
    completed_tasks: Annotated[List[Dict[str, Any]], operator.add]
    current_task: Optional[Dict[str, Any]]
    final_output: Optional[str]
    metadata: Dict[str, Any]


class PlannerAgent(BaseAgent):
    """
    Planner agent that breaks down tasks and coordinates execution
    Step 5: Creates plans and assigns work to specialized agents
    """
    
    def __init__(self):
        config = AgentConfig(
            name="Planner",
            role="Task planner and coordinator",
            goal="Break down complex tasks and orchestrate specialized agents",
            system_prompt=PromptLibrary.planner_agent_prompt(),
            temperature=0.7,
            model_name="gpt-4",
            use_memory=False,
            max_iterations=3
        )
        super().__init__(config)


class ReporterAgent(BaseAgent):
    """
    Reporter agent that synthesizes results from multiple agents
    Step 8: Delivers formatted output
    """
    
    def __init__(self):
        config = AgentConfig(
            name="Reporter",
            role="Information synthesizer and report generator",
            goal="Synthesize findings from multiple agents into coherent reports",
            system_prompt=PromptLibrary.reporter_agent_prompt(),
            temperature=0.6,
            model_name="gpt-4",
            use_memory=False,
            max_iterations=3
        )
        super().__init__(config)


class MultiAgentSystem:
    """
    Multi-agent system implementing the BMAD methodology Step 5
    
    Components:
    - Planner: Breaks down tasks and coordinates
    - Researcher: Gathers information
    - Data Analyst: Analyzes data
    - Reporter: Synthesizes final output
    
    Flow:
    1. Planner receives task and creates execution plan
    2. Specialized agents execute assigned tasks
    3. Reporter synthesizes results into final output
    """
    
    def __init__(
        self,
        include_researcher: bool = True,
        include_data_analyst: bool = True,
        databricks_config: Optional[Dict[str, Any]] = None
    ):
        # Initialize coordinator agents
        self.planner = PlannerAgent()
        self.reporter = ReporterAgent()
        
        # Initialize specialized agents
        self.agents: Dict[str, BaseAgent] = {}
        
        if include_researcher:
            from .research_agent import create_research_agent
            self.agents["researcher"] = create_research_agent(use_tools=True)
        
        if include_data_analyst:
            from .data_analyst import create_data_analyst
            self.agents["data_analyst"] = create_data_analyst(
                databricks_config=databricks_config,
                use_tools=True
            )
        
        # Build the coordination graph
        self.graph = self._build_coordination_graph()
        self.compiled_graph = self.graph.compile()
    
    def _build_coordination_graph(self) -> StateGraph:
        """
        Build the multi-agent coordination graph
        
        Graph structure:
        Input -> Plan -> Execute Tasks -> Synthesize -> Output
        """
        workflow = StateGraph(MultiAgentState)
        
        # Add nodes
        workflow.add_node("plan", self._plan_node)
        workflow.add_node("execute_task", self._execute_task_node)
        workflow.add_node("synthesize", self._synthesize_node)
        
        # Define edges
        workflow.set_entry_point("plan")
        workflow.add_edge("plan", "execute_task")
        
        # Conditional edge: continue executing tasks or move to synthesis
        workflow.add_conditional_edges(
            "execute_task",
            self._should_continue_execution,
            {
                "continue": "execute_task",
                "synthesize": "synthesize"
            }
        )
        
        workflow.add_edge("synthesize", END)
        
        return workflow
    
    def _plan_node(self, state: MultiAgentState) -> MultiAgentState:
        """Create execution plan"""
        # Build planner graph if not already done
        if not hasattr(self.planner, 'run'):
            builder = GraphBuilder(self.planner)
            builder.build_simple_agent_graph()
            builder.compile()
        
        # Get plan from planner
        planning_prompt = f"""
        Task: {state['input']}
        
        Available agents:
        {', '.join(self.agents.keys())}
        
        Create a step-by-step plan assigning tasks to appropriate agents.
        Format each step as: "Agent: [agent_name] | Task: [task_description]"
        """
        
        plan_result = self.planner.run(planning_prompt)
        plan = plan_result.get("output", "")
        
        # Parse plan into tasks
        tasks = self._parse_plan(plan)
        
        return {
            **state,
            "plan": plan,
            "tasks": tasks,
            "completed_tasks": []
        }
    
    def _execute_task_node(self, state: MultiAgentState) -> MultiAgentState:
        """Execute the next task in the plan"""
        tasks = state["tasks"]
        completed = state.get("completed_tasks", [])
        
        if not tasks:
            return state
        
        # Get next task
        current_task = tasks[0]
        remaining_tasks = tasks[1:]
        
        agent_name = current_task.get("agent")
        task_description = current_task.get("task")
        
        # Execute task with appropriate agent
        if agent_name in self.agents:
            agent = self.agents[agent_name]
            result = agent.run(task_description)
            
            completed_task = {
                "agent": agent_name,
                "task": task_description,
                "result": result.get("output", ""),
                "metadata": result.get("metadata", {})
            }
        else:
            completed_task = {
                "agent": agent_name,
                "task": task_description,
                "result": f"Error: Agent '{agent_name}' not available",
                "metadata": {}
            }
        
        return {
            **state,
            "tasks": remaining_tasks,
            "completed_tasks": [completed_task],
            "current_task": current_task
        }
    
    def _synthesize_node(self, state: MultiAgentState) -> MultiAgentState:
        """Synthesize results from all tasks"""
        # Build reporter graph if not already done
        if not hasattr(self.reporter, 'run'):
            builder = GraphBuilder(self.reporter)
            builder.build_simple_agent_graph()
            builder.compile()
        
        # Prepare results for synthesis
        results_text = "\n\n".join([
            f"**{task['agent']}**:\nTask: {task['task']}\nResult: {task['result']}"
            for task in state["completed_tasks"]
        ])
        
        synthesis_prompt = f"""
        Original request: {state['input']}
        
        Results from specialized agents:
        {results_text}
        
        Please synthesize these results into a comprehensive, well-structured response.
        """
        
        final_result = self.reporter.run(synthesis_prompt)
        
        return {
            **state,
            "final_output": final_result.get("output", "")
        }
    
    def _should_continue_execution(self, state: MultiAgentState) -> str:
        """Determine if more tasks need to be executed"""
        if state["tasks"]:
            return "continue"
        return "synthesize"
    
    def _parse_plan(self, plan: str) -> List[Dict[str, Any]]:
        """
        Parse plan text into structured tasks
        
        Expected format: "Agent: [name] | Task: [description]"
        """
        tasks = []
        
        for line in plan.split('\n'):
            line = line.strip()
            
            if 'Agent:' in line and 'Task:' in line:
                try:
                    parts = line.split('|')
                    agent_part = parts[0].split('Agent:')[1].strip()
                    task_part = parts[1].split('Task:')[1].strip()
                    
                    tasks.append({
                        "agent": agent_part.lower().replace(' ', '_'),
                        "task": task_part
                    })
                except:
                    continue
        
        return tasks
    
    def run(self, input_query: str, **kwargs) -> Dict[str, Any]:
        """
        Execute the multi-agent system
        
        Args:
            input_query: The user's request
            **kwargs: Additional metadata
        
        Returns:
            Final synthesized result
        """
        initial_state: MultiAgentState = {
            "input": input_query,
            "plan": None,
            "tasks": [],
            "completed_tasks": [],
            "current_task": None,
            "final_output": None,
            "metadata": kwargs
        }
        
        result = self.compiled_graph.invoke(initial_state)
        
        return {
            "output": result.get("final_output", ""),
            "plan": result.get("plan", ""),
            "completed_tasks": result.get("completed_tasks", []),
            "metadata": result.get("metadata", {})
        }
    
    async def arun(self, input_query: str, **kwargs) -> Dict[str, Any]:
        """Async version of run"""
        initial_state: MultiAgentState = {
            "input": input_query,
            "plan": None,
            "tasks": [],
            "completed_tasks": [],
            "current_task": None,
            "final_output": None,
            "metadata": kwargs
        }
        
        result = await self.compiled_graph.ainvoke(initial_state)
        
        return {
            "output": result.get("final_output", ""),
            "plan": result.get("plan", ""),
            "completed_tasks": result.get("completed_tasks", []),
            "metadata": result.get("metadata", {})
        }


def create_multi_agent_system(
    include_researcher: bool = True,
    include_data_analyst: bool = True,
    databricks_config: Optional[Dict[str, Any]] = None
) -> MultiAgentSystem:
    """
    Factory function to create a multi-agent system
    
    Args:
        include_researcher: Whether to include research agent
        include_data_analyst: Whether to include data analyst agent
        databricks_config: Configuration for Databricks (for data analyst)
    
    Returns:
        Configured multi-agent system
    """
    return MultiAgentSystem(
        include_researcher=include_researcher,
        include_data_analyst=include_data_analyst,
        databricks_config=databricks_config
    )


# Example usage
if __name__ == "__main__":
    # Create multi-agent system
    system = create_multi_agent_system()
    
    # Run complex query
    result = system.run(
        "Research the latest trends in AI agents and analyze how they compare to traditional automation approaches"
    )
    
    print("Multi-Agent System Results:")
    print("=" * 50)
    print(f"\nPlan:\n{result.get('plan', 'No plan')}")
    print(f"\nFinal Output:\n{result.get('output', 'No output')}")
    print(f"\nCompleted Tasks: {len(result.get('completed_tasks', []))}")

