"""
Configuration for Analytical Agent
"""

import os

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")

# Directory Configuration
DATA_DIR = os.getenv("DATA_DIR", "./data")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "./outputs")

# Performance Configuration
MAX_EXECUTION_TIME = 60  # seconds
CODE_GENERATION_TIMEOUT = 30  # seconds
CODE_EXECUTION_TIMEOUT = 25  # seconds

# Agent Configuration
TEMPERATURE = 0.1  # Low temperature for more deterministic code generation
MAX_TOKENS = 2000  # Maximum tokens for code generation

