import json
import os
import threading
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple
from dataclasses import dataclass
import dotenv
dotenv.load_dotenv()

print("\n\n\n   Loading AGENTS   \n\n\n")
time.sleep(3)

import requests
try:
    import tomllib  # Python 3.11+
except ModuleNotFoundError:  # pragma: no cover - fallback for older Pythons
    import tomli as tomllib  # type: ignore


class ToolServerState:
    def __init__(self) -> None:
        self.lock = threading.Lock()
        self.last_request_message = None
        self.last_answer_text = None
        self.request_event = threading.Event()
        self.answer_event = threading.Event()


STATE = ToolServerState()


class ToolRequestHandler(BaseHTTPRequestHandler):
    server_version = "CoralToolHTTP/1.0"

    def _read_json(self) -> dict:
        length = int(self.headers.get("Content-Length", "0"))
        data = self.rfile.read(length) if length > 0 else b"{}"
        try:
            return json.loads(data.decode("utf-8")) if data else {}
        except json.JSONDecodeError:
            return {}

    def _write_plain(self, status: int, body: str) -> None:
        body_bytes = body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body_bytes)))
        self.end_headers()
        self.wfile.write(body_bytes)

    def log_message(self, format: str, *args) -> None:  # noqa: N802 (keep BaseHTTPRequestHandler signature)
        # Quieter handler; print minimal lines
        print(f"[tool-server] {self.address_string()} - {format % args}")

    def do_POST(self) -> None:  # noqa: N802 (BaseHTTPRequestHandler API)
        parsed = urlparse(self.path)
        segments = [seg for seg in parsed.path.split("/") if seg]

        # Expecting: /api/mcp-tools/{tool-key}/{sessionId}/{agentId}
        if len(segments) < 4:
            self._write_plain(404, "Not Found")
            return

        _, tool_key, session_id, agent_id = segments[-4:]

        payload = self._read_json()

        if tool_key == "user-input-request":
            # The agent is asking us to provide a user question/utterance.
            with STATE.lock:
                STATE.last_request_message = payload.get("message")
                STATE.request_event.set()

            print("[tool-server] request-question -> agent asked:", STATE.last_request_message, flush=True)

            user_input = AGENT_QUERY
            self._write_plain(200, user_input)
            return

        if tool_key == "user-input-respond":
            # The agent is returning its response to the UI.
            answer_text = payload.get("response")
            with STATE.lock:
                STATE.last_answer_text = answer_text
                STATE.answer_event.set()

            print("[tool-server] answer-question -> agent responded:", answer_text, flush=True)
            self._write_plain(200, "OK")
            return

        self._write_plain(404, "Unknown tool")


def run_tool_server(host: str, port: int) -> HTTPServer:
    server = HTTPServer((host, port), ToolRequestHandler)
    thread = threading.Thread(target=server.serve_forever, name="tool-server", daemon=True)
    thread.start()
    print(f"[tool-server] listening on http://{host}:{port}")
    return server


def build_agent_graph_request_from_toml(tool_base_url: str, agent_toml_paths: list[str]) -> dict:
    """
    Build an agent graph request from one or more coral-agent.toml files.

    - For each TOML path provided, reads agent metadata (name, version, description)
    - Reads options and resolves their values from environment variables, falling back to TOML defaults
    - Sets up the same custom tools as the standard quick start
    - Produces a single group containing all agent names
    """
    # Configure custom tools (same as quick start)
    custom_tools = {
        "user-input-request": {
            "transport": {"type": "http", "url": f"{tool_base_url}/api/mcp-tools/user-input-request"},
            "toolSchema": {
                "name": "request-question",
                "description": "Request a question from the user. Hangs until input is received.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "message": {"type": "string", "description": "Message to show to the user."}
                    },
                },
            },
        },
        "user-input-respond": {
            "transport": {"type": "http", "url": f"{tool_base_url}/api/mcp-tools/user-input-respond"},
            "toolSchema": {
                "name": "answer-question",
                "description": "Answer the last question you requested from the user.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "response": {"type": "string", "description": "Answer to show to the user."}
                    },
                    "required": ["response"],
                },
            },
        },
    }
    system_prompt = os.getenv(
        "AGENT_SYSTEM_PROMPT",
        "Start by asking the user for their name. When you present the final answer, return only the name.",
    )

    agent_records: List[Dict[str, Any]] = []
    group_agent_names: List[str] = []
    seen_agent_names: set[str] = set()

    for toml_path in agent_toml_paths:
        with open(toml_path, "rb") as file_obj:
            toml_data = tomllib.load(file_obj)

        agent_info = toml_data.get("agent", {}) or {}
        agent_name = agent_info.get("name")
        if not agent_name:
            raise RuntimeError("Missing [agent].name in TOML")
        agent_version = agent_info.get("version", "0.0.1")
        agent_description = agent_info.get("description", f"{agent_name} agent")

        # Build options by reading [options.*] tables, using env var overrides when present
        options_table = toml_data.get("options", {}) or {}
        resolved_options: Dict[str, Dict[str, str]] = {}
        for option_key, option_spec in options_table.items():
            option_type = str((option_spec or {}).get("type", "string"))
            default_value = (option_spec or {}).get("default")
            env_value = os.getenv(option_key)
            resolved_value = env_value if env_value is not None else (
                str(default_value) if default_value is not None else ""
            )
            resolved_options[option_key] = {"type": option_type, "value": resolved_value}

        # Give UI tools to the interface agent; others typically don't need them
        custom_tool_access = ["user-input-request", "user-input-respond"] if agent_name == "interface" else []

        agent_records.append(
            {
                "id": {"name": agent_name, "version": agent_version},
                "name": agent_name,
                "description": agent_description,
                "options": resolved_options,
                "systemPrompt": system_prompt if agent_name == "interface" else None,
                "blocking": True,
                "customToolAccess": custom_tool_access,
                "coralPlugins": [],
                "provider": {"type": "local", "runtime": "executable"},
            }
        )

        if agent_name not in seen_agent_names:
            seen_agent_names.add(agent_name)
            group_agent_names.append(agent_name)

    return {
        "agents": agent_records,
        "groups": [group_agent_names],
        "customTools": custom_tools,
    }


def create_session(api_base_url: str, application_id: str, privacy_key: str, agent_graph_request: dict) -> dict:
    url = f"{api_base_url}/api/v1/sessions"
    payload = {
        "applicationId": application_id,
        "privacyKey": privacy_key,
        "agentGraphRequest": agent_graph_request,
    }
    resp = requests.post(url, json=payload, timeout=30)
    resp.raise_for_status()
    return resp.json()


def main(agent_toml_paths: Optional[list[str]] = None) -> None:
    api_base_url = os.getenv("CORAL_API_BASE_URL", "http://localhost:5555")
    application_id = os.getenv("APPLICATION_ID", "myApp")
    privacy_key = os.getenv("PRIVACY_KEY", "privkey")

    # Allow separate listen vs advertised host for Docker networking
    listen_host = os.getenv("TOOL_SERVER_LISTEN_HOST") or os.getenv("TOOL_SERVER_HOST", "127.0.0.1")
    advertised_host = os.getenv("TOOL_SERVER_ADVERTISED_HOST") or os.getenv("TOOL_SERVER_HOST", "127.0.0.1")
    tool_port = int(os.getenv("TOOL_SERVER_PORT", "38080"))
    tool_base_url = f"http://{advertised_host}:{tool_port}"

    server = run_tool_server(listen_host, tool_port)

    agent_graph_request = build_agent_graph_request_from_toml(tool_base_url, agent_toml_paths)
    session_info = create_session(api_base_url, application_id, privacy_key, agent_graph_request)
    session_id = session_info.get("sessionId")
    print(f"Created session: {session_info}")

    # The server will now spawn the interface agent (executable runtime). That agent will connect back over SSE
    # and call our custom tools. We wait for the response to flow through the answer-question tool.
    timeout_seconds = int(os.getenv("QUICKSTART_TIMEOUT_SECONDS", "90"))
    start = time.time()

    if not STATE.request_event.wait(timeout=timeout_seconds):
        print("Timed out waiting for agent to call request-question. Ensure the agent started successfully.")
        return

    # After the request tool is hit, give the agent some time to run the LLM and respond via answer-question
    remaining = max(1, timeout_seconds - int(time.time() - start))
    if not STATE.answer_event.wait(timeout=remaining):
        print("Timed out waiting for agent's answer-question. Check model credentials and server logs.")
        return

    print("\n======== Interface agent replied ========\n\n")
    print(STATE.last_answer_text)
    print("\n\n===========================================\n\n")

    # Send results to external API if configured
    results_api_url = os.getenv("RESULTS_API_URL")
    if results_api_url and STATE.last_answer_text:
        try:
            result_payload = {
                "query": AGENT_QUERY,
                "result": STATE.last_answer_text,
            }
            print(f"[results] Sending results to {results_api_url}")
            response = requests.post(results_api_url, json=result_payload, timeout=10)
            response.raise_for_status()
            print(f"[results] Successfully sent results. Response: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"[results] Failed to send results to API: {e}")
        except Exception as e:
            print(f"[results] Unexpected error sending results: {e}")

    # Clean shutdown
    try:
        server.shutdown()
    except Exception:
        pass


if __name__ == "__main__":

    AGENT_QUERY = os.getenv("AGENT_QUERY", "List all the repos of https://github.com/Coral-Protocol, and mail me the list to florisfok5@gmail.com")
    AGENTS_PATH = os.getenv("AGENTS_PATH", "agents/")

    print("\n\nRECIEVED AGENT_QUERY:")
    print(f"AGENT_QUERY: {AGENT_QUERY}")
    
    all_agent_paths = []
    for agent_path in os.listdir(AGENTS_PATH):
        for agent_file in os.listdir(f"{AGENTS_PATH}/{agent_path}"):
            if agent_file == "coral-agent.toml":
                all_agent_paths.append(f"{AGENTS_PATH}/{agent_path}/{agent_file}")

    main(all_agent_paths)


