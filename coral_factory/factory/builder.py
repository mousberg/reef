from agents import Agent, Runner, function_tool
from dotenv import load_dotenv
import asyncio
from pydantic import BaseModel
from datetime import datetime
from enum import Enum
from typing import Dict, Any, List
from agents import Agent, RunContextWrapper, Runner, function_tool
# from agents.extensions.models.litellm_model import LitellmModel # type: ignore
import os
import logging

from factory.agent_one import build_agent, AgentConfig
from factory.trace_stream import OpenAIAgentsTracingProcessor

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Global variables
agents = {}
global_context = None

class RelationsType(str, Enum):
    manager = "manager"
    chain = "chain"
    group_chat = "group-chat"
    triage = "triage"

class WorkflowConfig(BaseModel):
    objective: str
    relations_type: RelationsType
    model_name: str
    api_key: str
    agents: List[AgentConfig]

@function_tool
async def delegate_task(agent_name: str, task: str):
    logging.info(f"Calling agent {agent_name} with task {task}")
    agent = agents[agent_name]
    logging.info(f"Agent {agent_name} has tools: {hasattr(agent, 'tools')} - count: {len(agent.tools) if hasattr(agent, 'tools') else 0}")
    result = await Runner.run(agent, task, context=global_context)
    logging.info(f"Agent {agent_name} returned:\n{result.final_output}\n\n")
    return result.final_output


async def builder(json_config: Dict[str, Any], user_id: str, tracer: list):
    """
    Builds the manager agent and returns it.

    Manager agent contains all the agents and can call them to solve the user's task.
    """
    global agents
    
    # Build overview for manager agent
    overview = "You are a manager agent. Solve the user's task by delegating tasks to the appropriate agents and delegating the tasks to them.\n"
    overview += "Think step by step and do not ask the user for clarification, just execute the task as best as you can."
    overview += "You have access to the following agents:\n"

    for agent in json_config["agents"]:
        overview += f"{agent['name']}: {agent['persona']}\n"

    agents = {}
    for agent in json_config["agents"]:

        agent['context'] = {
            "__system__": f"The time is {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        }

        agents[agent['name']] = await build_agent(
            agent_name=agent['name'],
            user_id=user_id,
            model_name=json_config["model_name"],
            mcp_servers=agent['mcp_servers'],
            toolkits=agent['toolkits'],
            api_key=json_config["api_key"],
            persona=agent['persona'],
            output=agent['output'],
            guidelines=agent['guidelines'],
            context=agent['context'],
            tracer=tracer
        )

    return agents, overview


async def start_agents(workflow_config: WorkflowConfig, user_task: str, user_id: str):
    global global_context
    global_context = {
        "user_id": user_id,
    }

    tracer = None
    if os.getenv("FIREBASE_PROJECT_ID") and os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH"):
        tracer = [OpenAIAgentsTracingProcessor(
            firebase_project_id=os.getenv("FIREBASE_PROJECT_ID"),
            firebase_service_account_path=os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH"),
            user_id=user_id
        )]

    if len(workflow_config.agents) == 0:
        raise ValueError("No agents provided")

    builder_json = workflow_config.model_dump()
    agents, overview = await builder(builder_json, user_id=user_id, tracer=tracer)

    if workflow_config.relations_type == "manager":
        manager_agent = Agent(
            name="manager agent", 
            instructions=overview, 
            model=workflow_config.model_name,
            tools=[delegate_task]
        )
        result = await Runner.run(manager_agent, user_task)
        return result.final_output

    elif workflow_config.relations_type == "chain":
        pass  # Build script that chains all the agents suing handoff

    elif workflow_config.relations_type == "group-chat":
        pass # Build script that adds all agents to each other

    elif workflow_config.relations_type == "triage":
        # One agent handsoff to One other agent
        manager_agent = Agent(
            name="handoff agent", 
            instructions=overview, 
            model=workflow_config.model_name,
            handoffs=[a for a in agents.values()]
        )
        result = await Runner.run(manager_agent, user_task)
        return result.final_output

    elif workflow_config.relations_type == "single":
        first_agent_name = workflow_config.agents[0].name
        first_agent = agents[first_agent_name]
        result = await Runner.run(first_agent, user_task)
        return result.final_output



## TODO
# https://openai.github.io/openai-agents-python/handoffs/
# custom handoffs with predefined inputs!!!

## TODO
## OpenAI websearch support
## OpenAI file support

## TODO
## ASYNC tools calling
## More agent patterns -> handoffs, chain, group-chat, etc.

## TODO
## Proper context passing for user_id

## TODO
## Add smitery API key resolution


## TODO
## - Anomynizer??
## - Langfuse integration
## - Config gaurdrails????