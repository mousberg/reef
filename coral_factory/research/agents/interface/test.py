import urllib.parse
from dotenv import load_dotenv
import os, json, asyncio, traceback
from langchain.chat_models import init_chat_model
from langchain.prompts import ChatPromptTemplate
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.tools import Tool
import logging
import traceback

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_tools_description(tools):
    return "\n".join(
        f"Tool: {tool.name}, Schema: {json.dumps(tool.args).replace('{', '{{').replace('}', '}}')}"
        for tool in tools
    )

async def ask_human_tool(question: str) -> str:
    print(f"Agent asks: {question}")
    response = input("Your response: ")
    return response

async def create_agent(coral_tools, agent_tools, runtime):
    coral_tools_description = get_tools_description(coral_tools)
    
    if runtime == "docker" or runtime == "executable":
        agent_tools_for_description = [
            tool for tool in coral_tools if tool.name in agent_tools
        ]
        agent_tools_description = get_tools_description(agent_tools_for_description)
        combined_tools = coral_tools + agent_tools_for_description
        user_request_tool = "request_question"
        user_answer_tool = "answer_question"
        print(agent_tools_description)
    else:
        # For other runtimes (e.g., devmode), agent_tools is a list of Tool objects
        agent_tools_description = get_tools_description(agent_tools)
        combined_tools = coral_tools + agent_tools
        user_request_tool = "ask_human"
        user_answer_tool = "ask_human"

    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            f"""You are an agent interacting with the tools from Coral Server and using your own `{user_request_tool}` and `{user_answer_tool}` tool to communicate with the user. **You MUST NEVER finish the chain**

            Follow these steps in order:
            1. Use `list_agents` to list all connected agents and get their descriptions.
            2. Use tool `{user_request_tool}` to ask: "How can I assist you today?" and wait for the response.
            3. Understand the user's intent and decide which agent(s) are needed based on their descriptions.
            4. If the user requests Coral Server information (e.g., agent status, connection info), use your tools to retrieve and return the information directly to the user, then go back to Step 1.
            5. If fulfilling the request requires multiple agents, then call
            `create_thread ('threadName': , 'participantIds': [ID of all required agents, including yourself])` to create conversation thread.
            6. Add both context7 and coding agent to the same thread(create_thread) using 'add_participant'.
            7. For each selected agent:
            * **If the required agent is not in the thread, add it by calling `add_participant(threadId=..., 'participantIds': ID of the agent to add)`.**
            * Construct a clear instruction message for the agent.
            * Use **`send_message(threadId=..., content="instruction", mentions=[Receive Agent Id])`.** (NEVER leave `mentions` as empty)
            * Use `wait_for_mentions(timeoutMs=60000)` to receive the agent's response up to 5 times if no message received.
            * Record and store the response for final presentation.
            8. After all required agents have responded, think about the content to ensure you have executed the instruction to the best of your ability and the tools. Make this your response as "answer".
            9. Always respond back to the user by calling `{user_answer_tool}` with the "answer" or error occurred even if you have no answer or error.
            10. Always send user query to the context7 agent and whatever response you receive from the context7 agent, should be sent to the coding agent as well.
            11. Repeat the process from Step 1.

            **You MUST NEVER finish the chain**
            
            These are the list of coral tools: {coral_tools_description}
            These are the list of agent tools: {agent_tools_description}

            **You MUST NEVER finish the chain**"""
        ),
        ("placeholder", "{agent_scratchpad}")
    ])
    print(prompt)

    model = init_chat_model(
        model=os.getenv("MODEL_NAME", "gpt-4.1"),
        model_provider=os.getenv("MODEL_PROVIDER", "openai"),
        api_key=os.getenv("MODEL_API_KEY"),
        temperature=os.getenv("MODEL_TEMPERATURE", "0.1"),
        max_tokens=os.getenv("MODEL_TOKEN", "8000")
    )
    agent = create_tool_calling_agent(model, combined_tools, prompt)
    return AgentExecutor(agent=agent, tools=combined_tools, verbose=True)

async def main():
    runtime = os.getenv("CORAL_ORCHESTRATION_RUNTIME", "devmode")

    if runtime == "docker" or runtime == "executable":
        base_url = os.getenv("CORAL_SSE_URL")
        agentID = os.getenv("CORAL_AGENT_ID")
    else:
        load_dotenv()
        base_url = os.getenv("CORAL_SSE_URL")
        agentID = os.getenv("CORAL_AGENT_ID")

    coral_params = {
        "agentId": agentID,
        "agentDescription": "An agent that takes the user input and interacts with other agents to fulfill the request"
        #"agentDescription": "interface_agent"
    }

    query_string = urllib.parse.urlencode(coral_params)

    CORAL_SERVER_URL = f"{base_url}?{query_string}"
    logger.info(f"Connecting to Coral Server: {CORAL_SERVER_URL}")

    client = MultiServerMCPClient(
        connections={
            "coral": {
                "transport": "sse",
                "url": CORAL_SERVER_URL,
                "timeout": 300000,
                "sse_read_timeout": 300000,
            }
        }
    )
    logger.info("Coral Server Connection Established")

    coral_tools = await client.get_tools(server_name="coral")
    logger.info(f"Coral tools count: {len(coral_tools)}")
    
    if runtime == "docker" or runtime == "executable":
        required_tools = ["request-question", "answer-question"]
        available_tools = [tool.name for tool in coral_tools]

        for tool_name in required_tools:
            if tool_name not in available_tools:
                error_message = f"Required tool '{tool_name}' not found in coral_tools. Please ensure that while adding the agent on Coral Studio, you include the tool from Custom Tools."
                logger.error(error_message)
                raise ValueError(error_message)        
        agent_tools = required_tools

    else:
        agent_tools = [
            Tool(
                name="ask_human",
                func=None,
                coroutine=ask_human_tool,
                description="Ask the user a question and wait for a response."
            )
        ]
    
    agent_executor = await create_agent(coral_tools, agent_tools, runtime)

    while True:
        try:
            logger.info("Starting new agent invocation")
            await agent_executor.ainvoke({"agent_scratchpad": []})
            logger.info("Completed agent invocation, restarting loop")
            await asyncio.sleep(1)
        except Exception as e:
            logger.error(f"Error in agent loop: {str(e)}")
            logger.error(traceback.format_exc())
            await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(main())