import asyncio
import os
import urllib.parse
from contextlib import AsyncExitStack
from typing import Any, Dict, List, Optional

from agents import Agent, Runner, set_trace_processors, trace
from agents.mcp import MCPServerStreamableHttp, MCPServerSse
from agents.model_settings import ModelSettings
from agents.extensions.models.litellm_model import LitellmModel

from arcadepy import AsyncArcade
from agents_arcade import get_arcade_tools

# from agents import set_tracing_disabled

print("\n\n\nRunning agent\n\n\n")
try:
    import yaml  # type: ignore
except Exception:
    yaml = None  # type: ignore

from agents import tracing  # type: ignore[import]
from datetime import datetime, timezone
from uuid import uuid4
from typing import Optional
import firebase_admin
from firebase_admin import credentials, firestore
import logging

required = (
    "TracingProcessor",
    "Trace",
    "Span",
    "ResponseSpanData",
)
if not all(hasattr(tracing, name) for name in required):
    raise ImportError("The `agents` package is not installed.")


# Firebase configuration
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")
FIREBASE_SERVICE_ACCOUNT_PATH = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
logger = logging.getLogger(__name__)


class OpenAIAgentsTracingProcessor(tracing.TracingProcessor):  # type: ignore[no-redef]
        """Tracing processor for the `OpenAI Agents SDK <https://openai.github.io/openai-agents-python/>`_.
        """

        def __init__(
            self,
            firebase_project_id: Optional[str] = None,
            firebase_service_account_path: Optional[str] = None,
            *,
            user_id: Optional[str] = None,
            metadata: Optional[dict] = None,
            tags: Optional[list[str]] = None,
            name: Optional[str] = None,
        ):
            self.firebase_project_id = firebase_project_id or FIREBASE_PROJECT_ID
            self.firebase_service_account_path = firebase_service_account_path or FIREBASE_SERVICE_ACCOUNT_PATH
            self.user_id = user_id or os.getenv("USER_ID", "anonymous")
            self._metadata = metadata or {}
            self._tags = tags or []
            self._name = name
            self._first_response_inputs: dict = {}
            self._last_response_outputs: dict = {}
            
            # Initialize Firebase Admin SDK
            try:
                if not firebase_admin._apps:
                    if self.firebase_service_account_path:
                        cred = credentials.Certificate(self.firebase_service_account_path)
                        firebase_admin.initialize_app(cred, {
                            'projectId': self.firebase_project_id
                        })
                    else:
                        # Use default credentials (for Cloud Run, etc.)
                        firebase_admin.initialize_app()
                
                self.db = firestore.client()
                logger.info("Successfully connected to Firebase Firestore")
            except Exception as e:
                logger.error(f"Failed to connect to Firebase Firestore: {e}")
                raise

            self._active_traces: dict[str, dict] = {}
            self._active_spans: dict[str, dict] = {}



        def on_trace_start(self, trace: tracing.Trace) -> None:
            """Start a new trace and store it in Firestore."""
            if self._name:
                trace_name = self._name
            elif trace.name:
                trace_name = trace.name
            else:
                trace_name = "Agent workflow"
            
            trace_id = str(uuid4())
            start_time = datetime.now(timezone.utc)
            
            trace_dict = trace.export() or {}
            
            trace_document = {
                "trace_id": trace.trace_id,
                "name": trace_name,
                "start_time": start_time,
                "end_time": None,
                "status": "running",
                "metadata": {
                    **self._metadata,
                    **(trace_dict.get("metadata") or {}),
                },
                "tags": self._tags,
                "group_id": trace_dict.get("group_id"),
                "inputs": {},
                "outputs": {},
                "created_at": start_time,
                "updated_at": start_time,
                "user_id": self.user_id,
            }
            
            try:
                # Store in users/{user_id}/agent_traces/{trace_id}
                trace_ref = self.db.collection('users').document(self.user_id).collection('agent_traces').document(trace_id)
                trace_ref.set(trace_document)
                self._active_traces[trace.trace_id] = trace_document
                logger.debug(f"Started trace: {trace.trace_id}")
            except Exception as e:
                logger.exception(f"Error creating trace in Firestore: {e}")

        def on_trace_end(self, trace: tracing.Trace) -> None:
            """End a trace and update it in Firestore."""
            if trace.trace_id not in self._active_traces:
                logger.warning(f"Trace {trace.trace_id} not found in active traces")
                return
                
            end_time = datetime.now(timezone.utc)
            trace_dict = trace.export() or {}
            
            # Get final inputs and outputs
            final_inputs = self._first_response_inputs.pop(trace.trace_id, {})
            final_outputs = self._last_response_outputs.pop(trace.trace_id, {})
            
            update_data = {
                "end_time": end_time,
                "status": "completed",
                "inputs": final_inputs,
                "outputs": final_outputs,
                "metadata": {
                    **self._metadata,
                    **(trace_dict.get("metadata") or {}),
                },
                "updated_at": end_time,
            }
            
            try:
                # Find the trace document to update
                trace_doc = self._active_traces[trace.trace_id]
                if "trace_id" in trace_doc:
                    # Update the trace using a query to find the document by trace_id
                    traces_ref = self.db.collection('users').document(self.user_id).collection('agent_traces')
                    docs = traces_ref.where('trace_id', '==', trace.trace_id).get()
                    
                    for doc in docs:
                        doc.reference.update(update_data)
                        break
                
                self._active_traces.pop(trace.trace_id, None)
                logger.debug(f"Completed trace: {trace.trace_id}")
            except Exception as e:
                logger.exception(f"Error updating trace in Firestore: {e}")

        def on_span_start(self, span: tracing.Span) -> None:
            """Start a new span and store it in Firestore."""
            if span.trace_id not in self._active_traces:
                logger.warning(f"Parent trace {span.trace_id} not found for span {span.span_id}")
                return
                
            span_id = str(uuid4())
            start_time = (
                datetime.fromisoformat(span.started_at)
                if span.started_at
                else datetime.now(timezone.utc)
            )
            
            # Extract span information
            span_name = getattr(span, 'name', None) or f"Span_{span.span_id}"
            span_type = getattr(span, 'type', 'unknown')
            
            span_document = {
                "span_id": span.span_id,
                "trace_id": span.trace_id,
                "parent_id": span.parent_id,
                "name": span_name,
                "type": span_type,
                "start_time": start_time,
                "end_time": None,
                "status": "running",
                "inputs": self._extract_span_inputs(span),
                "outputs": {},
                "metadata": {
                    "openai_span_id": span.span_id,
                    "openai_trace_id": span.trace_id,
                    "openai_parent_id": span.parent_id,
                },
                "tags": self._tags,
                "created_at": start_time,
                "updated_at": start_time,
                "user_id": self.user_id,
            }
            
            try:
                # Store in users/{user_id}/agent_spans/{span_id}
                span_ref = self.db.collection('users').document(self.user_id).collection('agent_spans').document(span_id)
                span_ref.set(span_document)
                self._active_spans[span.span_id] = span_document
                logger.debug(f"Started span: {span.span_id}")
            except Exception as e:
                logger.exception(f"Error creating span in Firestore: {e}")

        def on_span_end(self, span: tracing.Span) -> None:
            """End a span and update it in Firestore."""
            if span.span_id not in self._active_spans:
                logger.warning(f"Span {span.span_id} not found in active spans")
                return
                
            end_time = (
                datetime.fromisoformat(span.ended_at)
                if span.ended_at
                else datetime.now(timezone.utc)
            )
            
            outputs = self._extract_span_outputs(span)
            inputs = self._extract_span_inputs(span)
            
            update_data = {
                "end_time": end_time,
                "status": "completed" if not span.error else "error",
                "inputs": inputs,
                "outputs": outputs,
                "error": str(span.error) if span.error else None,
                "updated_at": end_time,
            }
            
            # Store response data for trace-level aggregation
            if isinstance(span.span_data, tracing.ResponseSpanData):
                self._first_response_inputs[span.trace_id] = (
                    self._first_response_inputs.get(span.trace_id) or inputs
                )
                self._last_response_outputs[span.trace_id] = outputs
            
            try:
                # Find the span document to update
                spans_ref = self.db.collection('users').document(self.user_id).collection('agent_spans')
                docs = spans_ref.where('span_id', '==', span.span_id).get()
                
                for doc in docs:
                    doc.reference.update(update_data)
                    break
                
                self._active_spans.pop(span.span_id, None)
                logger.debug(f"Completed span: {span.span_id}")
            except Exception as e:
                logger.exception(f"Error updating span in Firestore: {e}")

        def _extract_span_inputs(self, span: tracing.Span) -> dict:
            """Extract inputs from span data."""
            try:
                if hasattr(span, 'span_data') and span.span_data:
                    span_data = span.span_data
                    if hasattr(span_data, 'input'):
                        return {"input": span_data.input}
                    elif hasattr(span_data, 'inputs'):
                        return span_data.inputs
                return {}
            except Exception as e:
                logger.warning(f"Error extracting span inputs: {e}")
                return {}

        def _extract_span_outputs(self, span: tracing.Span) -> dict:
            """Extract outputs from span data."""
            try:
                if hasattr(span, 'span_data') and span.span_data:
                    span_data = span.span_data
                    if hasattr(span_data, 'output'):
                        return {"output": span_data.output}
                    elif hasattr(span_data, 'outputs'):
                        return span_data.outputs
                return {}
            except Exception as e:
                logger.warning(f"Error extracting span outputs: {e}")
                return {}

        def shutdown(self) -> None:
            """Clean up Firebase connection."""
            try:
                # Firebase Admin SDK doesn't require explicit connection closing
                logger.debug("Firebase connection cleaned up")
            except Exception as e:
                logger.exception(f"Error cleaning up Firebase connection: {e}")

        def force_flush(self) -> None:
            """Force flush any pending operations."""
            # Firestore operations are synchronous by default, so no explicit flush needed
            pass

def _expand_env_variables(value: Any) -> Any:
    if isinstance(value, dict):
        return {k: _expand_env_variables(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_expand_env_variables(v) for v in value]
    if isinstance(value, str):
        return os.path.expandvars(value)
    return value


def _load_yaml_config(path: str) -> Dict[str, Any]:
    if yaml is None:
        raise ImportError("Missing dependency 'pyyaml'. Install it with: pip install pyyaml")
    with open(path, "r") as f:
        raw = yaml.safe_load(f) or {}
    return _expand_env_variables(raw)


async def _build_mcp_servers(
    stack: AsyncExitStack,
    servers_cfg: List[Dict[str, Any]],
    default_timeout: int,
    cache_tools_list: bool,
) -> List[Any]:
    servers: List[Any] = []
    for index, server_cfg in enumerate(servers_cfg, start=1):
        if not isinstance(server_cfg, dict):
            continue
        name = server_cfg.get("name") or f"MCP {index}"
        url = server_cfg.get("url")
        if not url:
            continue
        timeout = int(server_cfg.get("timeout_seconds", default_timeout))
        server = await stack.enter_async_context(
            MCPServerStreamableHttp(
                name=name,
                params={"url": url, "timeout": timeout},
                cache_tools_list=bool(cache_tools_list),
            )
        )
        servers.append(server)
    return servers


async def main() -> None:
    # set_tracing_disabled(True)
    set_trace_processors([OpenAIAgentsTracingProcessor(
        firebase_project_id=FIREBASE_PROJECT_ID,
        firebase_service_account_path=FIREBASE_SERVICE_ACCOUNT_PATH,
        user_id=os.getenv("USER_ID"),
        metadata={"agent_type": "coral_agent"}
    )])

    base_dir = os.path.dirname(__file__)
    config_path = os.path.join(base_dir, "final.yaml")
    config = _load_yaml_config(config_path)

    # Top-level model settings (can be overridden per-agent)
    top_model: Optional[str] = config.get("model") or os.getenv("MODEL")
    top_api_key: Optional[str] = config.get("api_key") or os.getenv("OPENAI_API_KEY")

    # MCP defaults
    mcp_cfg = config.get("mcp", {}) if isinstance(config, dict) else {}
    default_timeout = int(mcp_cfg.get("timeout_seconds", 60))
    cache_tools_list = bool(mcp_cfg.get("cache_tools_list", True))

    # Top-level servers and queries
    top_servers_cfg = config.get("servers", [])
    entry_query = config.get("queries", "hi!")

    # Top-level arcade config
    arcade_cfg = config.get("arcade", {}) if isinstance(config, dict) else {}
    default_toolkits = arcade_cfg.get("toolkits", []) if isinstance(arcade_cfg, dict) else []
    arcade_client = AsyncArcade()

    # Agent configuration (prefer nested agent config, fallback to top-level defaults)
    cfg_agent = config.get("agent", {}) if isinstance(config, dict) else {}
    if not isinstance(cfg_agent, dict):
        cfg_agent = {}

    agent_cfg = {
        "name": cfg_agent.get("name", "Assistant"),
        "description": cfg_agent.get("description", ""),
        "instructions": cfg_agent.get(
            "instructions", "Use the MCP tools to answer the questions."
        ),
        "servers": cfg_agent.get("servers", top_servers_cfg),
        "entry_query": cfg_agent.get("queries", entry_query),
        "arcade": cfg_agent.get("arcade", arcade_cfg),
        "context": cfg_agent.get("context", {}),
        "model": cfg_agent.get("model", top_model),
        "api_key": cfg_agent.get("api_key", top_api_key),
    }

    # Optional top-level context (e.g., user_id)
    top_context: Dict[str, Any] = config.get("context", {}) if isinstance(config, dict) else {}

    async with AsyncExitStack() as stack:
        agent_name = agent_cfg.get("name", "Assistant")
        instructions = agent_cfg.get("instructions", "Use the MCP tools to answer the questions.")

        # Per-agent model/api_key override
        model_name = agent_cfg.get("model") or top_model
        api_key = agent_cfg.get("api_key") or top_api_key
        if not model_name:
            raise ValueError(f"Missing 'model' for agent '{agent_name}' and MODEL env var not set.")
        if not api_key:
            raise ValueError(f"Missing 'api_key' for agent '{agent_name}' and API_KEY env var not set.")

        # Servers (per-agent overrides top-level)
        servers_cfg = agent_cfg.get("servers", top_servers_cfg)
        if not isinstance(servers_cfg, list):
            raise ValueError("'servers' must be a list of {name, url, [timeout_seconds]} objects in the YAML config.")
        servers = await _build_mcp_servers(stack, servers_cfg, default_timeout, cache_tools_list)

        # Arcade toolkits
        arcade_agent_cfg = agent_cfg.get("arcade", {}) if isinstance(agent_cfg, dict) else {}
        toolkits = arcade_agent_cfg.get("toolkits", default_toolkits) if isinstance(arcade_agent_cfg, dict) else default_toolkits
        tools = None
        if isinstance(toolkits, list) and len(toolkits) > 0:
            tools = await get_arcade_tools(arcade_client, toolkits=toolkits)

        # Context
        context_cfg = {}
        context_cfg.update(top_context if isinstance(top_context, dict) else {})
        context_cfg.update(agent_cfg.get("context", {}) if isinstance(agent_cfg.get("context", {}), dict) else {})

        # System prompt
        system_prompt = f"""
You are an agent interacting with the tools from Coral Server and having your own tools. Your task is to perform any instructions coming from any agent. 
Follow these steps in order:
1. Call wait_for_mentions from coral tools (timeoutMs: 30000) to receive mentions from other agents.
2. When you receive a mention, keep the thread ID and the sender ID.
3. Take 2 seconds to think about the content (instruction) of the message and check only from the list of your tools available for you to action.
4. Check the tool schema and make a plan in steps for the task you want to perform.
5. Only call the tools you need to perform for each step of the plan to complete the instruction in the content.
6. Take 3 seconds and think about the content and see if you have executed the instruction to the best of your ability and the tools. Make this your response as "answer".
7. Use `send_message` from coral tools to send a message in the same thread ID to the sender Id you received the mention from, with content: "answer".
8. If any error occurs, use `send_message` to send a message in the same thread ID to the sender Id you received the mention from, with content: "error".
9. Always respond back to the sender agent even if you have no answer or error.
9. Wait for 2 seconds and repeat the process from step 1.

your purpose: {agent_cfg.get("instructions")}
"""
        
        base_url = os.getenv("CORAL_SSE_URL")
        agentID = os.getenv("CORAL_AGENT_ID")
        coral_params = {
            "agentId": agentID,
            "agentDescription": agent_cfg.get("description")
        }

        query_string = urllib.parse.urlencode(coral_params)
        CORAL_SERVER_URL = f"{base_url}?{query_string}"

        async with MCPServerSse(
            name="coral",
            params={
                "url": CORAL_SERVER_URL,
                "timeout": 60,
                "sse_read_timeout": 60,
            },
            client_session_timeout_seconds=60,
            cache_tools_list=True,
        ) as coral_server:

            ## TODO fix this
            if "gpt" in model_name:
                model_name = f"openai/{model_name}"
                
            # Build agent
            agent_kwargs: Dict[str, Any] = {
                "name": agent_name,
                "instructions": system_prompt,
                "mcp_servers": [coral_server] + servers,
                "model": LitellmModel(model=model_name, api_key=api_key),
                "model_settings": ModelSettings(tool_choice="required"),
            }
            if tools:
                agent_kwargs["tools"] = tools

            agent = Agent(**agent_kwargs)

            with trace(agent_name):
                result = await Runner.run(agent, entry_query, context=context_cfg if context_cfg else None)
                print(result.final_output)

            print("\n\n\n")
            print(f"[VERBOSE] result: {result.final_output}")
            print("\n\n\n")


asyncio.run(main())