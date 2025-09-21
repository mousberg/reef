from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List
from fastapi import BackgroundTasks
import uvicorn
import os

from arcadepy import Arcade
from dotenv import load_dotenv
load_dotenv()
import os


from factory.from_json import from_workflow_config, WorkflowConfig
from hosting.main import deploy_workflow as deploy_workflow_local
from hosting.main import kill_docker_containers

# Authentication configuration
# Set environment variable CORAL_FACTORY_BEARER_TOKEN to change the token
# Usage: Include "Authorization: Bearer <token>" header in all API requests
# Default token for development: "coral-bearer-token-2024"
BEARER_TOKEN = os.getenv("CORAL_FACTORY_BEARER_TOKEN", "coral-bearer-token-2024")

app = FastAPI(
    title="Coral Factory API", 
    description="API for creating and deploying AI agent workflows with Bearer token authentication"
)

# Security scheme
security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify the bearer token"""
    if credentials.credentials != BEARER_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials



"""
{
  "main_task": "<string: the main task to be achieved>",
  "relations": "<string: describe the relations between the agents and how they interact with each other>",
  "agents": {
    "<agent_name>": {
      "name": "<string: the name of the agent>",
      "task": "<string: the task to be achieved>",
      "instructions": "<string: order of tools to use>",
      "connected_agents": ["<agent_name>"],
      "expected_input": "<string: what this agent needs to receive>",
      "expected_output": "<string: what this agent needs to output>",
      "receives_from_user": false,
      "sends_to_user": false,
      "tools": ["<tool_name>"]
    }
  }
}
"""

class DeploySettings(BaseModel):
    workflow_name: str
    deploy_type: str = "local"
    user_id: str
    query: str

class Results(BaseModel):
    query: str
    result: str


@app.post("/create/workflow/{user_id}")
async def create_workflow(workflow_config: WorkflowConfig, user_id: str, token: str = Depends(verify_token)):
    """Create a new workflow configuration"""
    # ONLY do me
    from_workflow_config(workflow_config, user_id)
    return JSONResponse(content={"success": True})

@app.post("/deploy/workflow")
async def deploy_workflow_endpoint(deploy_settings: DeploySettings, background_tasks: BackgroundTasks, token: str = Depends(verify_token)):
    """Deploy a workflow with the specified settings"""
    if deploy_settings.deploy_type == "local":
        background_tasks.add_task(deploy_workflow_local, query=deploy_settings.query, user_id=deploy_settings.user_id)
    else:
        raise HTTPException(status_code=400, detail="Invalid deploy type")
    return JSONResponse(content={"success": True})


@app.post("/results")
async def get_results(results: Results):
    """Receive and process workflow results"""
    print("\n\nresults:\n\n")
    print(results)
    print("\n\n")
    kill_docker_containers()

    print("\n\nresults:\n\n")
    print(results)
    print("\n\n")

    return JSONResponse(content={"success": True})

@app.get("/health")
async def health_check():
    """Health check endpoint - no authentication required"""
    return JSONResponse(content={"status": "healthy", "service": "coral-factory-api"})

@app.get("/auth/status")
async def auth_status(token: str = Depends(verify_token)):
    """Check authentication status"""
    return JSONResponse(content={"authenticated": True, "message": "Valid token"})

@app.get("/auth/authorize/{user_id}/{tool_name}")
async def authorize(user_id: str, tool_name: str, token: str = Depends(verify_token)):
    """Authorize a tool for a user"""
    client = Arcade()
    auth_response = client.tools.authorize(tool_name=tool_name, user_id=user_id)
    return JSONResponse(content={"authenticated": True, "message": "Valid token"})


@app.get("/auth/tools")
async def tools(user_id: str, token: str = Depends(verify_token)):
    """Authorize a tool for a user"""
    available_tools = [
        "X",
        "LinkedIn",
        "GoogleSearch",
        "Slack",
        "GoogleCalendar",
        "GoogleFinance",
        "Gmail"
    ]
    return JSONResponse(content={"tools": available_tools})


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)