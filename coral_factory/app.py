from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from arcadepy import Arcade
from dotenv import load_dotenv
import uvicorn
import os
import uuid

from factory.builder import WorkflowConfig
from factory.runner import WorkflowRunner

# Authentication configuration
load_dotenv()
BEARER_TOKEN = os.getenv("FACTORY_BEARER_TOKEN", "bearer-token-2024")

# FastAPI app
app = FastAPI(
    title="Factory API", 
    description="API for creating and deploying AI agent workflows with Bearer token authentication"
)

# Security scheme
security = HTTPBearer()

# Track running workflows
running_workflows = {}

class RunWorkflowRequest(BaseModel):
    workflow_config: WorkflowConfig
    user_id: str
    user_task: str

class RunWorkflowResponse(BaseModel):
    success: bool
    trace_id: str

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify the bearer token"""
    if credentials.credentials != BEARER_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials


@app.post("/verify/workflow")
async def verify_workflow(workflow_config: WorkflowConfig, token: str = Depends(verify_token)):
    """Verify a workflow configuration"""
    print("workflow_config:\n\n")
    print(workflow_config)
    print("\n\n")
    return JSONResponse(content={"success": True})

@app.post("/run/workflow/local", response_model=RunWorkflowResponse)
async def run_workflow(run_workflow_request: RunWorkflowRequest, token: str = Depends(verify_token)):
    """Deploy a workflow with the specified settings"""
    global running_workflows
    trace_id = str(uuid.uuid4())

    runner = WorkflowRunner(
        workflow_config=run_workflow_request.workflow_config,
        user_id=run_workflow_request.user_id,
        user_task=run_workflow_request.user_task,
        trace_id=trace_id
    )
    runner.start()
    running_workflows[trace_id] = runner

    return JSONResponse(content={"success": True, "trace_id": trace_id})

@app.get("/workflow/status/{trace_id}")
async def get_workflow_status(trace_id: str):
    """Get the status of a workflow"""
    if trace_id not in running_workflows:
        return JSONResponse(content={"success": False, "trace_id": trace_id, "status": "not_found"})
    return JSONResponse(content={"success": True, "trace_id": trace_id, "status": running_workflows[trace_id].status})

@app.get("/workflow/result/{trace_id}")
async def get_workflow_result(trace_id: str):
    """Get the result of a workflow"""

    if trace_id not in running_workflows:
        return JSONResponse(content={"success": False, "trace_id": trace_id, "status": "not_found"})
    
    if running_workflows[trace_id].status in ['pending', 'running']:
        return JSONResponse(content={"success": False, "trace_id": trace_id, "status": "not_completed"})

    result = running_workflows[trace_id].result
    del running_workflows[trace_id]

    return JSONResponse(content={"success": True, "trace_id": trace_id, "result": result})

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
    if auth_response.status != "completed":
        return JSONResponse(content={"authenticated": False, "message": "Valid token", "url": auth_response.url})
    return JSONResponse(content={"authenticated": True, "message": "Valid token"})


@app.get("/auth/tools")
async def tools(token: str = Depends(verify_token)):
    """Authorize a tool for a user"""
    available_tools = [
        "X.LookupSingleUserByUsername",   # Look up a user on X (Twitter) by their username.
        "X.PostTweet",                    # Post a tweet to X (Twitter).
        "X.ReplyToTweet",                 # Reply to a tweet on X (Twitter).
        "X.DeleteTweetById",              # Delete a tweet on X (Twitter).
        "X.SearchRecentTweetsByUsername", # Search for recent tweets (last 7 days) on X (Twitter) by username.
        "X.SearchRecentTweetsByKeywords", # Search for recent tweets (last 7 days) on X (Twitter) by required keywords and phrases.
        "X.LookupTweetById",
        "Linkedin.CreateTextPost",
        "GoogleFinance.GetStockSummary",   # Retrieve current price and recent price movement of a stock.
        "GoogleFinance.GetStockHistoricalData",
        "Gmail.SendEmail",            # Send an email using the Gmail API.
        "Gmail.SendDraftEmail",       # Send a draft email using the Gmail API.
        "Gmail.WriteDraftEmail",      # Compose a new email draft using the Gmail API.
        "Gmail.UpdateDraftEmail",     # Update an existing email draft.
        "Gmail.DeleteDraftEmail",     # Delete a draft email using the Gmail API.
        "Gmail.TrashEmail",           # Move an email to the trash folder.
        "Gmail.ListDraftEmails",      # List draft emails in the user's mailbox.
        "Gmail.ListEmailsByHeader",   # Search for emails by header using the Gmail API.
        "Gmail.ListEmails",           # Read emails and extract plain text content.
        "Gmail.SearchThreads",        # Search for threads in the user's mailbox.
        "Gmail.ListThreads",          # List threads in the user's mailbox.
        "Gmail.GetThread",            # Get the specified thread by ID.
    ]
    return JSONResponse(content={"tools": available_tools})


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)