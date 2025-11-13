from setuptools import setup, find_packages

setup(
    name="langgraph-agents-databricks",
    version="0.1.0",
    description="Template for building AI agents with LangGraph on Databricks",
    author="Your Name",
    author_email="your.email@example.com",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    python_requires=">=3.9",
    install_requires=[
        "langgraph>=0.2.0",
        "langchain>=0.3.0",
        "langchain-core>=0.3.0",
        "databricks-sdk>=0.18.0",
        "mlflow>=2.10.0",
        "pydantic>=2.5.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "black>=23.0.0",
        ],
    },
)

