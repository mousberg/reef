import asyncio
import os
from pydantic import BaseModel  # type: ignore
from contextlib import AsyncExitStack
from typing import Any, Dict, List
import time

from agents import Agent, set_trace_processors # type: ignore
from agents.mcp import MCPServerStreamableHttp, MCPServerSse # type: ignore
from agents.model_settings import ModelSettings # type: ignore
from agents.extensions.models.litellm_model import LitellmModel # type: ignore

from arcadepy import AsyncArcade # type: ignore
from agents_arcade import get_arcade_tools # type: ignore
import logging
import functools
import json


default_timeout = 60
default_cache_tools_list = True


def create_logged_tool_wrapper(original_tool, agent_name: str):
    """
    Wraps an Arcade tool to add comprehensive logging before and after execution.
    """
    original_func = original_tool.function if hasattr(original_tool, 'function') else original_tool
    
    @functools.wraps(original_func)
    async def logged_wrapper(*args, **kwargs):
        tool_name = getattr(original_tool, 'name', str(original_tool))
        
        # Log the tool call attempt
        logging.info(f"[TOOL_CALL] 🔧 Agent '{agent_name}' calling tool: {tool_name}")
        logging.info(f"[TOOL_CALL]   Args: {args}")
        logging.info(f"[TOOL_CALL]   Kwargs: {json.dumps(kwargs, default=str, indent=2)}")
        
        try:
            # Execute the original tool
            result = await original_func(*args, **kwargs)
            
            # Log success
            logging.info(f"[TOOL_CALL] ✅ Tool '{tool_name}' completed successfully")
            logging.info(f"[TOOL_CALL]   Result type: {type(result)}")
            
            # Try to log result in a readable way
            try:
                if isinstance(result, (str, int, float, bool, type(None))):
                    logging.info(f"[TOOL_CALL]   Result: {result}")
                elif isinstance(result, dict):
                    logging.info(f"[TOOL_CALL]   Result: {json.dumps(result, default=str, indent=2)}")
                else:
                    logging.info(f"[TOOL_CALL]   Result: {str(result)[:500]}")  # Truncate long results
            except Exception as log_err:
                logging.warning(f"[TOOL_CALL]   Could not log result: {log_err}")
            
            return result
            
        except Exception as e:
            # Log failure with full details
            logging.error(f"[TOOL_CALL] ❌ Tool '{tool_name}' failed with error: {type(e).__name__}: {e}")
            logging.error(f"[TOOL_CALL]   Tool: {tool_name}")
            logging.error(f"[TOOL_CALL]   Agent: {agent_name}")
            logging.error(f"[TOOL_CALL]   Args: {args}")
            logging.error(f"[TOOL_CALL]   Kwargs: {kwargs}")
            logging.exception(f"[TOOL_CALL]   Full traceback:")
            
            # Re-raise to let the agent handle it
            raise
    
    # Preserve tool attributes
    if hasattr(original_tool, 'function'):
        original_tool.function = logged_wrapper
        return original_tool
    else:
        return logged_wrapper


# TODO Add reasoning prompt to reasoning models!
REASONING_PROMPT = """
Reasoning:
- When thinking about your next step, consider each tool
- Plan ahead and think about the order of the tools to use
- Check the params required for each tool and their format
"""

BASE_PROMPT = """You are a {persona}. Use your tools to answer the users request. Format your final answer as desribed in "Expected output".
Think step by step and make sure to solve your issues. Always start by explaining how you achieved the answer.

Guidelines:
- Perform the task requested by the user and answer the user's question. Do not ask new questions to the user. Only explain what you have done to get to the answer.
{guidelines}

Expected output:
{output}

Context:
{context}
"""


class MCPConfig(BaseModel):
    name: str
    server_type: str
    params: Dict[str, Any] = {}
    timeout_seconds: int = 60
    cache_tools_list: bool = True

class AgentConfig(BaseModel):
    name: str
    mcp_servers: List[MCPConfig]
    toolkits: List[str]
    persona: str
    output: str
    guidelines: str
    context: Dict[str, Any] = {}


async def _build_mcp_servers(
    stack: AsyncExitStack,
    servers: List[Dict[str, Any]],
) -> List[Any]:
    servers: List[Any] = []
    for index, server_cfg in enumerate(servers, start=1):
        print("make config:", server_cfg)
        if not isinstance(server_cfg, dict):
            continue

        name = server_cfg.get("name") or f"MCP {index}"
        server_type = server_cfg.get("server_type") or f"HTTP"

        # Params need to include url
        if not server_cfg.get("params", {}).get("url"):
            if not server_cfg.get("url"):
                raise Exception("URL is required")
            server_cfg["params"]["url"] = server_cfg["url"]
            continue

        timeout = int(server_cfg.get("timeout_seconds", 60))
        cache_tools_list = bool(server_cfg.get("cache_tools_list", True))
        
        if server_type.lower() == "sse":
            server = await stack.enter_async_context(
                MCPServerSse(
                    name=name,
                    params=server_cfg['params'],
                    client_session_timeout_seconds=timeout,
                    cache_tools_list=cache_tools_list,
                )
            )

        else:
            server = await stack.enter_async_context(
                MCPServerStreamableHttp(
                    name=name,
                    params=server_cfg['params'],
                    cache_tools_list=cache_tools_list,
                    client_session_timeout_seconds=timeout,
                )
            )

        # Add to the list
        servers.append(server)
    
    # Return ALL
    return servers


async def build_agent(
    agent_name: str, user_id: str, model_name: str, mcp_servers: List[Dict[str, Any]],
    toolkits: List[str], api_key: str, persona: str, output: str,
    guidelines: str, context: Dict[str, Any] = {}, tracer: List[Any] = None
) -> Agent:
    # set_tracing_disabled(True)

    if tracer:
        set_trace_processors(tracer)

    # if '/' not in model_name:
    #     raise Exception("USE LITELLM MODEL NAME")

    # Initialize Arcade client - keep alive for agent lifetime
    # The AsyncArcade client maintains a persistent HTTP session
    arcade_api_key = os.getenv("ARCADE_API_KEY")
    if arcade_api_key:
        logging.info(f"[TOOL_INIT] Arcade API key found (length: {len(arcade_api_key)})")
    else:
        logging.warning(f"[TOOL_INIT] ⚠️  No ARCADE_API_KEY found in environment")
    
    arcade_client = AsyncArcade()
    logging.info(f"[TOOL_INIT] Arcade client initialized: {arcade_client}")

    tools = None
    if len(toolkits) > 0:
        logging.info(f"[TOOL_INIT] Fetching tools for agent {agent_name} with toolkits: {toolkits}")
        logging.info(f"[TOOL_INIT] User ID for tools: {user_id}")
        context["user_id"] = user_id
        try:
            # Get Arcade tools - these are function wrappers that use the arcade_client
            # The 'toolkits' parameter here actually contains specific tool names (e.g., "Gmail.SendEmail")
            # not toolkit names (e.g., "Gmail"), so we pass them as 'tools' not 'toolkits'
            logging.info(f"[TOOL_INIT] Calling get_arcade_tools with client={arcade_client}, tools={toolkits}")
            raw_tools = await get_arcade_tools(arcade_client, tools=toolkits)
            logging.info(f"[TOOL_INIT] ✅ Agent {agent_name} retrieved {len(raw_tools)} tools from Arcade")
            
            # Wrap each tool with logging
            tools = []
            for tool in raw_tools:
                tool_name = getattr(tool, 'name', 'unknown')
                logging.info(f"[TOOL_INIT]   - {tool_name}: {getattr(tool, 'description', 'No description')}")
                wrapped_tool = create_logged_tool_wrapper(tool, agent_name)
                tools.append(wrapped_tool)
            
            logging.info(f"[TOOL_INIT] All {len(tools)} tools wrapped with logging")
        except Exception as e:
            logging.error(f"[TOOL_INIT] ❌ Failed to get Arcade tools for {agent_name}: {e}", exc_info=True)
            raise

    # Build MCP servers if needed
    # TODO: MCP servers currently use AsyncExitStack which may cause issues
    # if servers need to persist after this function returns
    built_mcp_servers = None
    if mcp_servers and len(mcp_servers) > 0:
        # Create a stack that won't be automatically closed
        # The servers will remain open for the agent's lifetime
        stack = AsyncExitStack()
        built_mcp_servers = await _build_mcp_servers(stack, mcp_servers)
        logging.debug(f"Agent {agent_name} built {len(built_mcp_servers)} MCP servers")
        # Note: stack is NOT used in 'async with' so it won't auto-close

    # Context: Time and __system__
    context_string = f"- The time is: {time.asctime()}\n"
    context_string += (context.get("__system__") or "")

    # Guidelines
    if len(guidelines) > 0:
        guidelines_string = "- " + "\n- ".join(guidelines)
    else:
        guidelines_string = ""

    # System prompt
    system_prompt = BASE_PROMPT.format(
        persona=persona,
        guidelines=guidelines_string,
        output=output,
        context=context_string
    )

    # Build agent
    agent_kwargs: Dict[str, Any] = {
        "name": agent_name,
        "instructions": system_prompt,
        # "model": LitellmModel(model=model_name, api_key=api_key),
        # "model_settings": ModelSettings(tool_choice="required", temperature=0.0),
        "model": model_name,
    }

    # Optional params
    if tools:
        agent_kwargs["tools"] = tools
        logging.info(f"[AGENT_BUILD] Agent {agent_name} kwargs includes {len(tools)} tools")
        logging.info(f"[AGENT_BUILD]   Tool names in kwargs: {[getattr(t, 'name', str(t)) for t in tools]}")

    if built_mcp_servers:
        agent_kwargs["mcp_servers"] = built_mcp_servers
        logging.info(f"[AGENT_BUILD] Agent {agent_name} kwargs includes {len(built_mcp_servers)} MCP servers")

    logging.info(f"[AGENT_BUILD] Creating agent '{agent_name}' with model: {model_name}")
    agent = Agent(**agent_kwargs)
    
    # Verify the agent has tools after creation
    has_tools = hasattr(agent, 'tools')
    tool_count = len(agent.tools) if has_tools else 0
    logging.info(f"[AGENT_BUILD] ✅ Agent '{agent_name}' created")
    logging.info(f"[AGENT_BUILD]   Has tools attribute: {has_tools}")
    logging.info(f"[AGENT_BUILD]   Tool count: {tool_count}")
    
    if has_tools and tool_count > 0:
        actual_tool_names = [getattr(t, 'name', str(t)) for t in agent.tools]
        logging.info(f"[AGENT_BUILD]   Actual tools on agent: {actual_tool_names}")
    
    return agent