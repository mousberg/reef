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


default_timeout = 60
default_cache_tools_list = True


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
    arcade_client = AsyncArcade()

    tools = None
    if len(toolkits) > 0:
        logging.info(f"Fetching tools for agent {agent_name} with toolkits: {toolkits}")
        context["user_id"] = user_id
        try:
            # Get Arcade tools - these are function wrappers that use the arcade_client
            # The 'toolkits' parameter here actually contains specific tool names (e.g., "Gmail.SendEmail")
            # not toolkit names (e.g., "Gmail"), so we pass them as 'tools' not 'toolkits'
            tools = await get_arcade_tools(arcade_client, tools=toolkits)
            logging.info(f"Agent {agent_name} retrieved {len(tools)} tools from Arcade: {[t.name for t in tools]}")
        except Exception as e:
            logging.error(f"Failed to get Arcade tools for {agent_name}: {e}")
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
        logging.info(f"Agent {agent_name} kwargs includes {len(tools)} tools")

    if built_mcp_servers:
        agent_kwargs["mcp_servers"] = built_mcp_servers

    agent = Agent(**agent_kwargs)
    logging.info(f"Agent {agent_name} created with tools: {hasattr(agent, 'tools')} - count: {len(agent.tools) if hasattr(agent, 'tools') else 0}")
    return agent