"""
Configuration settings for the agent framework
"""
import os
from typing import Optional
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Settings(BaseModel):
    """Application settings"""
    
    # LLM Configuration
    openai_api_key: Optional[str] = Field(default_factory=lambda: os.getenv("OPENAI_API_KEY"))
    anthropic_api_key: Optional[str] = Field(default_factory=lambda: os.getenv("ANTHROPIC_API_KEY"))
    default_model: str = Field(default_factory=lambda: os.getenv("DEFAULT_MODEL", "gpt-4"))
    default_temperature: float = Field(default_factory=lambda: float(os.getenv("DEFAULT_TEMPERATURE", "0.7")))
    
    # Databricks Configuration
    databricks_host: Optional[str] = Field(default_factory=lambda: os.getenv("DATABRICKS_HOST"))
    databricks_token: Optional[str] = Field(default_factory=lambda: os.getenv("DATABRICKS_TOKEN"))
    
    # Tool API Keys
    tavily_api_key: Optional[str] = Field(default_factory=lambda: os.getenv("TAVILY_API_KEY"))
    serpapi_api_key: Optional[str] = Field(default_factory=lambda: os.getenv("SERPAPI_API_KEY"))
    elevenlabs_api_key: Optional[str] = Field(default_factory=lambda: os.getenv("ELEVENLABS_API_KEY"))
    
    # Memory Configuration
    use_memory: bool = True
    memory_type: str = "conversational"  # Options: conversational, summary, vector
    
    # Agent Configuration
    max_iterations: int = 10
    verbose: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """Get or create settings instance"""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings

