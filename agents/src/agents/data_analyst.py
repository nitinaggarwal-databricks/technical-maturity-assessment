"""
Data Analyst Agent - Specialized for data analysis tasks
Includes Databricks integration for SQL queries and data processing
"""
from typing import Dict, Any, Optional, List
from ..core import BaseAgent, AgentConfig, GraphBuilder
from ..utils import (
    create_calculator_tool,
    create_databricks_sql_tool,
    create_mlflow_tool,
    PromptLibrary
)


class DataAnalyst(BaseAgent):
    """
    Data Analyst Agent for analyzing data and generating insights
    
    Role: Data analyst specialized in SQL, statistical analysis, and visualization
    Goal: Analyze data, identify patterns, and provide actionable insights
    Tools: SQL execution (Databricks), calculations, MLflow logging
    """
    
    def __init__(
        self,
        config: Optional[AgentConfig] = None,
        databricks_config: Optional[Dict[str, Any]] = None
    ):
        if config is None:
            config = AgentConfig(
                name="Data Analyst",
                role="Data analyst specialized in analysis and insights generation",
                goal="Analyze data, identify patterns, and provide actionable recommendations",
                system_prompt=PromptLibrary.data_analyst_prompt(),
                temperature=0.5,
                model_name="gpt-4",
                tools=["calculator", "databricks_sql", "mlflow_logger"],
                use_memory=True,
                max_iterations=10
            )
        
        super().__init__(config)
        self.databricks_config = databricks_config
        self._setup_tools()
    
    def _setup_tools(self):
        """Setup data analysis tools"""
        # Calculator tool
        calc_tool = create_calculator_tool()
        self.register_tool("calculator", calc_tool)
        
        # Databricks SQL tool (if config provided)
        if self.databricks_config:
            try:
                sql_tool = create_databricks_sql_tool(self.databricks_config)
                self.register_tool("databricks_sql", sql_tool)
            except Exception as e:
                print(f"Warning: Could not initialize Databricks SQL tool: {e}")
        
        # MLflow tool
        try:
            mlflow_tool = create_mlflow_tool("data_analysis_experiments")
            self.register_tool("mlflow_logger", mlflow_tool)
        except Exception as e:
            print(f"Warning: Could not initialize MLflow tool: {e}")
    
    def format_output(self, result: Any) -> Dict[str, Any]:
        """Format analysis output with insights and recommendations"""
        if isinstance(result, dict):
            return result
        
        output = {
            "analysis": str(result),
            "insights": [],
            "recommendations": [],
            "visualizations": []
        }
        
        return output
    
    def analyze_query(self, question: str, data_context: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyze data based on a question
        
        Args:
            question: The analytical question to answer
            data_context: Optional context about available data
        
        Returns:
            Analysis results
        """
        prompt = f"Analyze the following question: {question}"
        
        if data_context:
            prompt += f"\n\nData context: {data_context}"
        
        result = self.run(prompt)
        return result


def create_data_analyst(
    databricks_config: Optional[Dict[str, Any]] = None,
    model_name: str = "gpt-4",
    use_tools: bool = True
) -> DataAnalyst:
    """
    Factory function to create a data analyst agent
    
    Args:
        databricks_config: Configuration for Databricks connection
        model_name: Name of the LLM model to use
        use_tools: Whether to enable tool use
    
    Returns:
        Configured data analyst agent
    """
    # Create agent
    agent = DataAnalyst(databricks_config=databricks_config)
    
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
    # Example Databricks configuration
    db_config = {
        "server_hostname": "your-workspace.databricks.com",
        "http_path": "/sql/1.0/warehouses/your-warehouse-id",
        "access_token": "your-token"
    }
    
    # Create data analyst
    agent = create_data_analyst(databricks_config=db_config)
    
    # Run analysis
    result = agent.analyze_query(
        question="What are the top 5 products by revenue in Q4 2024?",
        data_context="Sales data is available in the 'sales' table with columns: product_id, product_name, revenue, date"
    )
    
    print("Analysis Results:")
    print("=" * 50)
    print(result.get("output", "No output"))

