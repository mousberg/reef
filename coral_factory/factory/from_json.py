import yaml
import toml
import os
from pydantic import BaseModel
from typing import List


class AgentConfig(BaseModel):
    name: str
    description: str
    task: str
    expected_input: str
    expected_output: str
    tools: list[str]


class WorkflowConfig(BaseModel):
    main_task: str
    relations: str
    agents: List[AgentConfig]

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__)) + "/..")

def create_yaml(agent_name, agent_description, agent_instructions, agent_queries, agent_tools, user_id):

    agent_tools = [i.split(".")[0] for i in agent_tools]
    yaml_dict = {
        "model": "gpt-4.1",
        "mcp": {
            "timeout_seconds": 60,
            "cache_tools_list": True
        },
        "agent": {
            "name": agent_name,
            "description": agent_description,
            "instructions": agent_instructions,
            "arcade": {
                "toolkits": agent_tools
            },
            "queries": agent_queries,
            "context": {
                "user_id": user_id
            }
        }
    }
    io = yaml.dump(yaml_dict)
    with open(f"{BASE_DIR}/factory/name_less/final.yaml", "w") as f:
        f.write(io)


def create_toml(agent_name, agent_description):
    toml_dict = {
        "agent": {
            "name": agent_name,
            "version": "0.0.1",
            "description": agent_description
        }
    }
    io = toml.dumps(toml_dict)
    with open(f"{BASE_DIR}/factory/name_less/coral-agent.toml", "w") as f:
        f.write(io)
        f.write("\n\n")
        f.write("[options.TIMEOUT_MS]")
        f.write("\n")
        f.write("type = \"string\"")
        f.write("\n")
        f.write("description = \"Connection/tool timeouts in ms\"")
        f.write("\n")
        f.write("default = \"60000\"")
        f.write("\n\n")
        f.write("[runtimes.executable]")
        f.write("\n")
        f.write("command = [\"bash\", \"-c\", \"./run_agent.sh main.py\"]")

def create_workflow(agent_names):

    with open(f"{BASE_DIR}/hosting/shared/registry.toml", "w") as f:
        for agent_name in agent_names:
            f.write("[[local-agent]]\n")
            f.write(f"path = \"research/agents/{agent_name}\"\n\n")


def interface_system_prompt(workflow):
    
    with open(f"{BASE_DIR}/hosting/shared/research/agents/interface/workflow.txt", "w") as f:
        f.write(workflow)


def move_agent(agent_name):
    os.system(
        f"cp -r {BASE_DIR}/factory/name_less " \
        f"{BASE_DIR}/hosting/shared/research/agents/{agent_name}"
    )


def from_workflow_config(config: WorkflowConfig, user_id):
    clear_old_agents()

    agent_names = [agent.name for agent in config.agents]
    interface_system_prompt(config.relations)

    for agent in config.agents:
        agent_name = agent.name
        instructions = f"Your task is to {agent.task}.\nYou will be given {agent.expected_input} and you need to output {agent.expected_output}."
        create_yaml(agent_name, agent.description, instructions, agent.expected_input, agent.tools, user_id)
        create_toml(agent_name, agent.description)
        move_agent(agent_name)

    create_workflow(agent_names + ["interface"])


def clear_old_agents():
    agents = os.listdir(f"{BASE_DIR}/hosting/shared/research/agents")
    for agent in agents:
        if agent != "interface":
            os.system(f"rm -r {BASE_DIR}/hosting/shared/research/agents/{agent}")


if __name__ == "__main__":
    print(BASE_DIR)