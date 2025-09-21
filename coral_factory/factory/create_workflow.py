"""
[[local-agent]]
path = "research/agents/interface"

[[local-agent]]
path = "research/agents/gmail"
"""

import toml

def create_workflow(agent_names):

    with open(f"/Users/floris.fok/Library/CloudStorage/OneDrive-Prosus-Naspers/Documents/agents/reef/coral_factory/hosting/shared/registry.toml", "w") as f:
        for agent_name in agent_names:
            f.write("[[local-agent]]\n")
            f.write(f"path = \"research/agents/{agent_name}\"\n\n")


def interface_system_prompt(workflow):
    pass

if __name__ == "__main__":
    create_workflow(["interface", "gmail", "github"])