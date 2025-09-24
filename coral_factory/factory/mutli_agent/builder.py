from agents import Agent, Runner, function_tool
from dotenv import load_dotenv
import asyncio
from datetime import datetime
from typing import Dict, Any, List
from agents import Agent, RunContextWrapper, Runner, function_tool
# from agents.extensions.models.litellm_model import LitellmModel # type: ignore
import os

from factory.mutli_agent.agent_one import build_agent
from factory.mutli_agent.trace_stream import OpenAIAgentsTracingProcessor

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Global variables
agents = {}
global_context = None

@function_tool
async def delegate_task(agent_name: str, task: str):
    print(f"Calling agent {agent_name} with task {task}")
    result = await Runner.run(agents[agent_name], task, context=global_context)
    print(f"Agent {agent_name} returned:\n{result.final_output[:100]}...\n\n")
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


async def start_agents(builder_json: Dict[str, Any], user_task: str, user_id: str):
    global global_context

    global_context = {
        "user_id": user_id,
    }

    if os.getenv("FIREBASE_PROJECT_ID") and os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH"):
        tracer = [OpenAIAgentsTracingProcessor(
            firebase_project_id=os.getenv("FIREBASE_PROJECT_ID"),
            firebase_service_account_path=os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH"),
            user_id=user_id
        )]

    agents, overview = await builder(builder_json, user_id, tracer)

    if builder_json["relations_type"] == "manager":
        manager_agent = Agent(
            name="manager agent", 
            instructions=overview, 
            model=builder_json["model_name"],
            tools=[delegate_task]
        )
        result = await Runner.run(manager_agent, user_task)
        print(result.final_output)

    elif builder_json["relations_type"] == "chain":
        result = await Runner.run(agents[builder_json["agents"][0]["name"]], user_task)
        print(result.final_output)

    elif builder_json["relations_type"] == "group-chat":
        pass

    elif builder_json["relations_type"] == "triage":
        pass



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