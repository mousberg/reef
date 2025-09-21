from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from fastapi import BackgroundTasks, HTTPException
import uvicorn


from factory.from_json import from_workflow_config, WorkflowConfig
from hosting.main import deploy_workflow as deploy_workflow_local
from hosting.main import kill_docker_containers

app = FastAPI()


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


class CreateWorkflowRequest(BaseModel):
    workflow_config: WorkflowConfig
    user_id: str

@app.post("/create/workflow")
async def create_workflow(request: CreateWorkflowRequest):
    from_workflow_config(request.workflow_config, request.user_id)
    return JSONResponse(content={"success": True})

@app.post("/deploy/workflow")
async def deploy_workflow_endpoint(deploy_settings: DeploySettings, background_tasks: BackgroundTasks):

    if deploy_settings.deploy_type == "local":
        background_tasks.add_task(deploy_workflow_local, query=deploy_settings.query, user_id=deploy_settings.user_id)
    else:
        raise HTTPException(status_code=400, detail="Invalid deploy type")
    return JSONResponse(content={"success": True})


@app.post("/results")
async def get_results(results: Results):
    print("\n\nresults:\n\n")
    print(results)
    print("\n\n")
    kill_docker_containers()

    print("\n\nresults:\n\n")
    print(results)
    print("\n\n")

    return JSONResponse(content={"success": True})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)