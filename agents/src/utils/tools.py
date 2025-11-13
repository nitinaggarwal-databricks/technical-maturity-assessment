"""
Tool utilities for agents (Step 4: Add Reasoning and Tool Use)
Provides common tools and tool registry
"""
from typing import Any, Callable, Dict, List, Optional
from langchain_core.tools import Tool, StructuredTool
from langchain_community.tools.tavily_search import TavilySearchResults
from pydantic import BaseModel, Field
import requests
from bs4 import BeautifulSoup


class ToolRegistry:
    """Registry for managing agent tools"""
    
    def __init__(self):
        self.tools: Dict[str, Tool] = {}
    
    def register(self, name: str, tool: Tool):
        """Register a tool"""
        self.tools[name] = tool
    
    def get(self, name: str) -> Optional[Tool]:
        """Get a tool by name"""
        return self.tools.get(name)
    
    def get_all(self) -> List[Tool]:
        """Get all registered tools"""
        return list(self.tools.values())
    
    def get_names(self) -> List[str]:
        """Get all tool names"""
        return list(self.tools.keys())


# Search Tools

def create_search_tool(api_key: Optional[str] = None, max_results: int = 5) -> Tool:
    """
    Create a web search tool using Tavily API
    
    Args:
        api_key: Tavily API key (optional if set in env)
        max_results: Maximum number of results to return
    
    Returns:
        Tool for web searching
    """
    if api_key:
        search = TavilySearchResults(api_key=api_key, max_results=max_results)
    else:
        search = TavilySearchResults(max_results=max_results)
    
    return Tool(
        name="web_search",
        description="Search the web for current information. Use this when you need up-to-date information or facts.",
        func=search.run
    )


def create_web_scraper_tool() -> Tool:
    """Create a tool for scraping web pages"""
    
    def scrape_webpage(url: str) -> str:
        """Scrape content from a webpage"""
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Get text
            text = soup.get_text()
            
            # Clean up text
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = '\n'.join(chunk for chunk in chunks if chunk)
            
            return text[:5000]  # Limit to 5000 chars
        
        except Exception as e:
            return f"Error scraping webpage: {str(e)}"
    
    return Tool(
        name="web_scraper",
        description="Scrape content from a webpage given its URL. Returns the text content of the page.",
        func=scrape_webpage
    )


# Calculator Tool

def create_calculator_tool() -> Tool:
    """Create a basic calculator tool"""
    
    def calculate(expression: str) -> str:
        """
        Evaluate a mathematical expression
        
        Args:
            expression: Mathematical expression to evaluate (e.g., "2 + 2", "10 * 5")
        
        Returns:
            Result of the calculation
        """
        try:
            # Safe evaluation - only allow basic math operations
            allowed_names = {
                'abs': abs, 'round': round, 'min': min, 'max': max,
                'sum': sum, 'pow': pow
            }
            
            result = eval(expression, {"__builtins__": {}}, allowed_names)
            return str(result)
        
        except Exception as e:
            return f"Error calculating: {str(e)}"
    
    return Tool(
        name="calculator",
        description="Calculate mathematical expressions. Input should be a valid mathematical expression.",
        func=calculate
    )


# Document Retrieval Tool

class DocumentRetrieverInput(BaseModel):
    """Input for document retriever"""
    query: str = Field(description="Search query for documents")
    top_k: int = Field(default=3, description="Number of documents to retrieve")


def create_document_retriever_tool(vector_store: Any) -> StructuredTool:
    """
    Create a document retrieval tool using a vector store
    
    Args:
        vector_store: LangChain vector store instance
    
    Returns:
        Tool for retrieving documents
    """
    
    def retrieve_documents(query: str, top_k: int = 3) -> str:
        """Retrieve relevant documents"""
        try:
            docs = vector_store.similarity_search(query, k=top_k)
            
            results = []
            for i, doc in enumerate(docs, 1):
                results.append(f"Document {i}:\n{doc.page_content}\n")
            
            return "\n".join(results)
        
        except Exception as e:
            return f"Error retrieving documents: {str(e)}"
    
    return StructuredTool(
        name="document_retriever",
        description="Retrieve relevant documents from the knowledge base. Use this to find information from stored documents.",
        func=retrieve_documents,
        args_schema=DocumentRetrieverInput
    )


# Code Execution Tool (use with caution)

def create_python_repl_tool() -> Tool:
    """Create a Python REPL tool for code execution"""
    
    def execute_python(code: str) -> str:
        """
        Execute Python code safely (limited functionality)
        
        Args:
            code: Python code to execute
        
        Returns:
            Output of the code execution
        """
        try:
            # This is a simplified version - in production, use a proper sandbox
            local_vars = {}
            exec(code, {"__builtins__": __builtins__}, local_vars)
            
            # Return any printed output or the last expression value
            if local_vars:
                return str(local_vars)
            return "Code executed successfully"
        
        except Exception as e:
            return f"Error executing code: {str(e)}"
    
    return Tool(
        name="python_repl",
        description="Execute Python code. Use this for computations, data processing, or generating results through code.",
        func=execute_python
    )


# API Call Tool

class APICallInput(BaseModel):
    """Input for API call tool"""
    url: str = Field(description="API endpoint URL")
    method: str = Field(default="GET", description="HTTP method (GET, POST, etc.)")
    headers: Dict[str, str] = Field(default_factory=dict, description="HTTP headers")
    data: Optional[Dict[str, Any]] = Field(default=None, description="Request body data")


def create_api_call_tool() -> StructuredTool:
    """Create a tool for making API calls"""
    
    def make_api_call(
        url: str,
        method: str = "GET",
        headers: Optional[Dict[str, str]] = None,
        data: Optional[Dict[str, Any]] = None
    ) -> str:
        """Make an HTTP API call"""
        try:
            response = requests.request(
                method=method.upper(),
                url=url,
                headers=headers or {},
                json=data,
                timeout=10
            )
            
            response.raise_for_status()
            return response.text
        
        except Exception as e:
            return f"Error making API call: {str(e)}"
    
    return StructuredTool(
        name="api_call",
        description="Make HTTP API calls to external services. Provide URL, method, and optional headers/data.",
        func=make_api_call,
        args_schema=APICallInput
    )


# Databricks-specific tools

def create_databricks_sql_tool(connection_params: Dict[str, Any]) -> Tool:
    """
    Create a tool for executing SQL queries on Databricks
    
    Args:
        connection_params: Databricks connection parameters
    
    Returns:
        Tool for executing SQL queries
    """
    
    def execute_sql(query: str) -> str:
        """Execute SQL query on Databricks"""
        try:
            # Import here to avoid dependency issues
            from databricks import sql
            
            with sql.connect(**connection_params) as connection:
                with connection.cursor() as cursor:
                    cursor.execute(query)
                    result = cursor.fetchall()
                    
                    return str(result)
        
        except Exception as e:
            return f"Error executing SQL: {str(e)}"
    
    return Tool(
        name="databricks_sql",
        description="Execute SQL queries on Databricks. Use this to query data from tables and views.",
        func=execute_sql
    )


def create_mlflow_tool(experiment_name: str) -> Tool:
    """
    Create a tool for logging to MLflow
    
    Args:
        experiment_name: MLflow experiment name
    
    Returns:
        Tool for MLflow operations
    """
    
    def log_to_mlflow(metrics: str) -> str:
        """Log metrics to MLflow"""
        try:
            import mlflow
            
            mlflow.set_experiment(experiment_name)
            
            # Parse metrics (expecting format: "metric_name:value,metric_name:value")
            metric_dict = {}
            for item in metrics.split(','):
                if ':' in item:
                    key, value = item.split(':', 1)
                    metric_dict[key.strip()] = float(value.strip())
            
            with mlflow.start_run():
                mlflow.log_metrics(metric_dict)
            
            return f"Logged metrics to MLflow: {metric_dict}"
        
        except Exception as e:
            return f"Error logging to MLflow: {str(e)}"
    
    return Tool(
        name="mlflow_logger",
        description="Log metrics to MLflow. Input format: 'metric_name:value,metric_name:value'",
        func=log_to_mlflow
    )

