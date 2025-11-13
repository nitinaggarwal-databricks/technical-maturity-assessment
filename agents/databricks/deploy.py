"""
Deployment script for uploading agents to Databricks workspace
"""
import os
import argparse
from pathlib import Path
from databricks.sdk import WorkspaceClient
from databricks.sdk.service import workspace
import base64


def deploy_to_databricks(
    workspace_url: str,
    token: str,
    local_path: str,
    workspace_path: str,
    overwrite: bool = False
):
    """
    Deploy agents and notebooks to Databricks workspace
    
    Args:
        workspace_url: Databricks workspace URL
        token: Access token
        local_path: Local directory path
        workspace_path: Target workspace path
        overwrite: Whether to overwrite existing files
    """
    # Initialize Databricks client
    w = WorkspaceClient(
        host=workspace_url,
        token=token
    )
    
    print(f"Deploying from {local_path} to {workspace_path}")
    
    # Create target directory if it doesn't exist
    try:
        w.workspace.mkdirs(path=workspace_path)
        print(f"Created directory: {workspace_path}")
    except Exception as e:
        print(f"Directory may already exist: {e}")
    
    # Upload files
    local_path_obj = Path(local_path)
    
    for file_path in local_path_obj.rglob("*"):
        if file_path.is_file():
            # Skip certain files
            if any(skip in str(file_path) for skip in ['.git', '__pycache__', '.pyc', '.DS_Store']):
                continue
            
            # Determine relative path
            rel_path = file_path.relative_to(local_path_obj)
            target_path = f"{workspace_path}/{rel_path}"
            
            # Determine file format
            if file_path.suffix == '.py':
                format_type = workspace.ImportFormat.SOURCE
                language = workspace.Language.PYTHON
            elif file_path.suffix == '.sql':
                format_type = workspace.ImportFormat.SOURCE
                language = workspace.Language.SQL
            elif file_path.suffix == '.ipynb':
                format_type = workspace.ImportFormat.JUPYTER
                language = workspace.Language.PYTHON
            else:
                # Skip non-code files for now
                continue
            
            try:
                # Read file content
                with open(file_path, 'rb') as f:
                    content = base64.b64encode(f.read()).decode('utf-8')
                
                # Upload to workspace
                w.workspace.import_(
                    path=target_path,
                    format=format_type,
                    language=language,
                    content=content,
                    overwrite=overwrite
                )
                
                print(f"✓ Uploaded: {rel_path}")
            
            except Exception as e:
                print(f"✗ Failed to upload {rel_path}: {e}")


def create_init_script(workspace_url: str, token: str):
    """Create cluster init script for installing dependencies"""
    w = WorkspaceClient(host=workspace_url, token=token)
    
    init_script_content = """#!/bin/bash

# Install agent dependencies
/databricks/python/bin/pip install -q \\
    langgraph>=0.2.0 \\
    langchain>=0.3.0 \\
    langchain-openai>=0.2.0 \\
    langchain-anthropic>=0.2.0 \\
    langchain-community>=0.3.0 \\
    tavily-python>=0.3.0 \\
    pydantic>=2.5.0 \\
    python-dotenv>=1.0.0

echo "Agent dependencies installed successfully"
"""
    
    # Upload init script
    init_script_path = "dbfs:/databricks/init-scripts/install-agents-deps.sh"
    
    try:
        # Create script locally
        with open("/tmp/init-script.sh", "w") as f:
            f.write(init_script_content)
        
        # Upload to DBFS (using workspace API)
        print(f"Init script created at: {init_script_path}")
        print("Please upload the init script manually to DBFS or use Databricks CLI")
        print(f"Content saved to: /tmp/init-script.sh")
        
    except Exception as e:
        print(f"Error creating init script: {e}")


def main():
    parser = argparse.ArgumentParser(description="Deploy agents to Databricks")
    parser.add_argument("--workspace-url", required=True, help="Databricks workspace URL")
    parser.add_argument("--token", required=True, help="Databricks access token")
    parser.add_argument("--local-path", default="./src", help="Local source directory")
    parser.add_argument("--workspace-path", required=True, help="Target workspace path")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing files")
    parser.add_argument("--create-init-script", action="store_true", help="Create cluster init script")
    
    args = parser.parse_args()
    
    # Deploy files
    deploy_to_databricks(
        workspace_url=args.workspace_url,
        token=args.token,
        local_path=args.local_path,
        workspace_path=args.workspace_path,
        overwrite=args.overwrite
    )
    
    # Create init script if requested
    if args.create_init_script:
        create_init_script(args.workspace_url, args.token)
    
    # Deploy notebooks
    notebooks_local = "./databricks/notebooks"
    notebooks_workspace = f"{args.workspace_path}/notebooks"
    
    if os.path.exists(notebooks_local):
        print("\nDeploying notebooks...")
        deploy_to_databricks(
            workspace_url=args.workspace_url,
            token=args.token,
            local_path=notebooks_local,
            workspace_path=notebooks_workspace,
            overwrite=args.overwrite
        )
    
    print("\n" + "=" * 80)
    print("Deployment completed!")
    print("=" * 80)
    print(f"\nFiles uploaded to: {args.workspace_path}")
    print(f"Notebooks available at: {notebooks_workspace}")
    print("\nNext steps:")
    print("1. Create a cluster using configs/cluster_config.json")
    print("2. Configure secrets for API keys")
    print("3. Open and run notebooks in Databricks workspace")


if __name__ == "__main__":
    # Can also be run programmatically
    import sys
    
    if len(sys.argv) == 1:
        # Example usage
        print("Example usage:")
        print("python deploy.py \\")
        print("  --workspace-url https://your-workspace.cloud.databricks.com \\")
        print("  --token dapi... \\")
        print("  --workspace-path /Users/your-email@company.com/agents \\")
        print("  --overwrite \\")
        print("  --create-init-script")
    else:
        main()

