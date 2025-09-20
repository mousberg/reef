import yaml from 'js-yaml';
import { WorkflowConfig, WorkflowNode, WorkflowEdge } from '@/types/workflow';

export function parseWorkflowYaml(yamlContent: string): WorkflowConfig {
  try {
    const parsed = yaml.load(yamlContent) as WorkflowConfig;
    return parsed;
  } catch (error) {
    throw new Error(`Failed to parse YAML: ${error}`);
  }
}

export function convertToReactFlowElements(config: WorkflowConfig): {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
} {
  const agents = config.workflow.agents;
  const agentNames = Object.keys(agents);
  
  // Create nodes with automatic positioning
  const nodes: WorkflowNode[] = agentNames.map((agentName, index) => {
    const agent = agents[agentName];
    
    // Simple grid layout - can be improved with better positioning algorithms
    const cols = Math.ceil(Math.sqrt(agentNames.length));
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    return {
      id: agentName,
      type: 'agent',
      position: {
        x: col * 300 + 50,
        y: row * 200 + 50
      },
      data: {
        agent,
        agentName
      }
    };
  });

  // Create edges based on connected_agents
  const edges: WorkflowEdge[] = [];
  agentNames.forEach((agentName) => {
    const agent = agents[agentName];
    agent.connected_agents.forEach((connectedAgent) => {
      if (agents[connectedAgent]) {
        edges.push({
          id: `${agentName}-${connectedAgent}`,
          source: agentName,
          target: connectedAgent,
          type: 'smoothstep'
        });
      }
    });
  });

  return { nodes, edges };
}