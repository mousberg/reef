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
    logging.info(f"[DELEGATE] 🔄 Delegating to agent '{agent_name}'")
    logging.info(f"[DELEGATE]   Task: {task}")
    
    if agent_name not in agents:
        logging.error(f"[DELEGATE] ❌ Agent '{agent_name}' not found in agents dict. Available: {list(agents.keys())}")
        raise ValueError(f"Agent '{agent_name}' not found")
    
    agent = agents[agent_name]
    
    # Log agent capabilities
    has_tools = hasattr(agent, 'tools')
    tool_count = len(agent.tools) if has_tools else 0
    logging.info(f"[DELEGATE]   Agent has tools: {has_tools}, count: {tool_count}")
    
    if has_tools and tool_count > 0:
        tool_names = [getattr(t, 'name', str(t)) for t in agent.tools]
        logging.info(f"[DELEGATE]   Available tools: {tool_names}")
    
    logging.info(f"[DELEGATE]   Context: {global_context}")
    
    try:
        logging.info(f"[DELEGATE] 🚀 Running agent '{agent_name}'...")
        result = await Runner.run(agent, task, context=global_context)
        logging.info(f"[DELEGATE] ✅ Agent '{agent_name}' completed successfully")
        logging.info(f"[DELEGATE]   Output: {result.final_output}")
        return result.final_output
    except Exception as e:
        logging.error(f"[DELEGATE] ❌ Agent '{agent_name}' failed: {type(e).__name__}: {e}")
        logging.exception(f"[DELEGATE]   Full traceback:")
        raise


async def builder(json_config: Dict[str, Any], user_id: str, tracer: list):
    """
    Builds the manager agent and returns it.

    Manager agent contains all the agents and can call them to solve the user's task.
    """
    global agents
    
    logging.info(f"[BUILDER] 🏗️  Starting builder for user: {user_id}")
    logging.info(f"[BUILDER]   Model: {json_config.get('model_name')}")
    logging.info(f"[BUILDER]   Number of agents to build: {len(json_config.get('agents', []))}")
    
    # Build overview for manager agent
    overview = "You are a manager agent. Solve the user's task by delegating tasks to the appropriate agents and delegating the tasks to them.\n"
    overview += "Think step by step and do not ask the user for clarification, just execute the task as best as you can."
    overview += "You have access to the following agents:\n"

    for agent in json_config["agents"]:
        overview += f"{agent['name']}: {agent['persona']}\n"
        logging.info(f"[BUILDER]   Agent to build: {agent['name']} with {len(agent.get('toolkits', []))} toolkits")

    agents = {}
    for i, agent in enumerate(json_config["agents"], 1):
        logging.info(f"[BUILDER] Building agent {i}/{len(json_config['agents'])}: {agent['name']}")
        logging.info(f"[BUILDER]   Toolkits: {agent.get('toolkits', [])}")
        logging.info(f"[BUILDER]   MCP Servers: {len(agent.get('mcp_servers', []))}")

        agent['context'] = {
            "__system__": f"The time is {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        }

        try:
            built_agent = await build_agent(
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
            agents[agent['name']] = built_agent
            logging.info(f"[BUILDER] ✅ Successfully built agent: {agent['name']}")
        except Exception as e:
            logging.error(f"[BUILDER] ❌ Failed to build agent {agent['name']}: {e}")
            raise

    logging.info(f"[BUILDER] ✅ All {len(agents)} agents built successfully")
    return agents, overview


async def start_agents(workflow_config: WorkflowConfig, user_task: str, user_id: str):
    global global_context
    
    logging.info(f"[WORKFLOW] 🚀 Starting workflow for user: {user_id}")
    logging.info(f"[WORKFLOW]   Relations type: {workflow_config.relations_type}")
    logging.info(f"[WORKFLOW]   User task: {user_task}")
    logging.info(f"[WORKFLOW]   Number of agents: {len(workflow_config.agents)}")
    
    global_context = {
        "user_id": user_id,
    }

    tracer = None
    if os.getenv("FIREBASE_PROJECT_ID") and os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH"):
        logging.info(f"[WORKFLOW] Firebase tracing enabled")
        tracer = [OpenAIAgentsTracingProcessor(
            firebase_project_id=os.getenv("FIREBASE_PROJECT_ID"),
            firebase_service_account_path=os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH"),
            user_id=user_id
        )]
    else:
        logging.info(f"[WORKFLOW] Firebase tracing disabled (no credentials)")

    if len(workflow_config.agents) == 0:
        raise ValueError("No agents provided")

    builder_json = workflow_config.model_dump()
    logging.info(f"[WORKFLOW] Building agents...")
    agents, overview = await builder(builder_json, user_id=user_id, tracer=tracer)

    logging.info(f"[WORKFLOW] Executing workflow with relations_type: {workflow_config.relations_type}")
    
    if workflow_config.relations_type == "manager":
        logging.info(f"[WORKFLOW] Creating manager agent with delegate_task tool")
        manager_agent = Agent(
            name="manager agent", 
            instructions=overview, 
            model=workflow_config.model_name,
            tools=[delegate_task]
        )
        logging.info(f"[WORKFLOW] Running manager agent...")
        result = await Runner.run(manager_agent, user_task)
        logging.info(f"[WORKFLOW] ✅ Workflow completed successfully")
        logging.info(f"[WORKFLOW]   Final output: {result.final_output}")
        return result.final_output

    elif workflow_config.relations_type == "chain":
        logging.info(f"[WORKFLOW] Chain mode - sequential execution of agents")
        logging.info(f"[WORKFLOW]   Agent chain order: {[a.name for a in workflow_config.agents]}")
        
        # Get agents in order
        agent_list = list(agents.values())
        agent_names = [a.name for a in workflow_config.agents]
        
        # Sequential execution: each agent's output becomes next agent's input
        current_task = user_task
        
        for i, agent in enumerate(agent_list):
            agent_name = agent_names[i]
            logging.info(f"[WORKFLOW] 🔗 Chain step {i+1}/{len(agent_list)}: Running agent '{agent_name}'")
            logging.info(f"[WORKFLOW]   Input: {current_task[:200]}...")  # Log first 200 chars
            
            # Run the agent with the current task and context
            result = await Runner.run(agent, current_task, context=global_context)
            current_output = result.final_output
            
            logging.info(f"[WORKFLOW] ✅ Agent '{agent_name}' completed")
            logging.info(f"[WORKFLOW]   Output: {current_output[:200]}...")  # Log first 200 chars
            
            # Output of this agent becomes input for next agent
            if i < len(agent_list) - 1:
                next_agent_name = agent_names[i + 1]
                # Format the task for the next agent: include context from previous step
                current_task = f"Previous step output from {agent_name}: {current_output}\n\nYour task: Continue the workflow by processing this output."
                logging.info(f"[WORKFLOW]   Passing output to next agent: {next_agent_name}")
            else:
                # Last agent - return its output
                logging.info(f"[WORKFLOW] ✅ Chain completed successfully")
                return current_output

    elif workflow_config.relations_type == "group-chat":
        logging.info(f"[WORKFLOW] Group chat mode not implemented yet")
        pass # Build script that adds all agents to each other

    elif workflow_config.relations_type == "triage":
        logging.info(f"[WORKFLOW] Creating triage agent with handoffs")
        # One agent handsoff to One other agent
        manager_agent = Agent(
            name="handoff agent", 
            instructions=overview, 
            model=workflow_config.model_name,
            handoffs=[a for a in agents.values()]
        )
        logging.info(f"[WORKFLOW] Running triage agent with context: {global_context}")
        result = await Runner.run(manager_agent, user_task, context=global_context)
        logging.info(f"[WORKFLOW] ✅ Workflow completed successfully")
        logging.info(f"[WORKFLOW]   Final output: {result.final_output}")
        return result.final_output

    elif workflow_config.relations_type == "single":
        first_agent_name = workflow_config.agents[0].name
        logging.info(f"[WORKFLOW] Running single agent: {first_agent_name}")
        first_agent = agents[first_agent_name]
        logging.info(f"[WORKFLOW] Running with context: {global_context}")
        result = await Runner.run(first_agent, user_task, context=global_context)
        logging.info(f"[WORKFLOW] ✅ Workflow completed successfully")
        logging.info(f"[WORKFLOW]   Final output: {result.final_output}")
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