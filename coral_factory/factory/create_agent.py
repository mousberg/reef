import yaml
import toml
import os

def create_yaml(agent_name, agent_description, agent_instructions, agent_queries, agent_context):
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
                "toolkits": ["github"]
            },
            "queries": agent_queries,
            "context": agent_context
        }
    }
    io = yaml.dump(yaml_dict)
    with open(f"/Users/floris.fok/Library/CloudStorage/OneDrive-Prosus-Naspers/Documents/agents/reef/coral_factory/factory/name_less/final.yaml", "w") as f:
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
    with open("/Users/floris.fok/Library/CloudStorage/OneDrive-Prosus-Naspers/Documents/agents/reef/coral_factory/factory/name_less/coral-agent.toml", "w") as f:
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


def move_agent(agent_name):
    os.system(
        f"cp -r /Users/floris.fok/Library/CloudStorage/OneDrive-Prosus-Naspers/Documents/agents/reef/coral_factory/factory/name_less " \
        f"/Users/floris.fok/Library/CloudStorage/OneDrive-Prosus-Naspers/Documents/agents/reef/coral_factory/hosting/shared/research/agents/{agent_name}"
    )

if __name__ == "__main__":
    name = "github"
    description = "Agent that can interact with github"
    instructions = "Use Github tools to answer the questions."
    queries = ["Hi!"]
    context = {"user_id": "florisfok5@gmail.com"}

    create_yaml(name, description, instructions, queries, context)
    create_toml(name, description)
    move_agent(name)
