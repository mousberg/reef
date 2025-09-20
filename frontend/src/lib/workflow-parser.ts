import { WorkflowConfig, WorkflowNode, WorkflowEdge } from '@/types/workflow';

export function parseWorkflowJson(jsonContent: string): WorkflowConfig {
  try {
    const parsed = JSON.parse(jsonContent) as WorkflowConfig;
    return parsed;
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error}`);
  }
}

export function convertToReactFlowElements(config: WorkflowConfig): {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
} {
  const agents = config.agents;
  const agentNames = Object.keys(agents);
  
  // Horizontal layout with nodes spaced evenly
  const spacing = 400; // Horizontal spacing between nodes
  const yPosition = 200; // Fixed Y position for all nodes
  
  // Create start node
  const startNode: WorkflowNode = {
    id: 'start',
    type: 'start',
    position: { x: 0, y: yPosition },
    data: { label: 'START' }
  };
  
  // Create agent nodes with adjusted positioning (offset by start node)
  const agentNodes: WorkflowNode[] = agentNames.map((agentName, index) => {
    const agent = agents[agentName];
    
    return {
      id: agentName,
      type: 'agent',
      position: {
        x: (index + 1) * spacing + 100,
        y: yPosition
      },
      data: {
        agent,
        agentName
      }
    };
  });
  
  // Create end node
  const endNode: WorkflowNode = {
    id: 'end',
    type: 'end',
    position: { x: (agentNames.length + 1) * spacing + 100, y: yPosition },
    data: { label: 'END' }
  };
  
  const nodes: WorkflowNode[] = [startNode, ...agentNodes, endNode];

  // Create edges based on connected_agents
  const edges: WorkflowEdge[] = [];
  
  // Find entry agents (those that receive from user) and connect start to them
  const entryAgents = agentNames.filter(name => agents[name].receives_from_user);
  entryAgents.forEach(agentName => {
    edges.push({
      id: `start-${agentName}`,
      source: 'start',
      target: agentName,
      type: 'smoothstep',
      animated: true,
      style: {
        strokeDasharray: '5,5',
        stroke: '#6366f1',
        strokeWidth: 2
      },
      markerEnd: {
        type: 'arrowclosed',
        color: '#6366f1'
      }
    });
  });
  
  // Create edges between agents
  agentNames.forEach((agentName) => {
    const agent = agents[agentName];
    agent.connected_agents.forEach((connectedAgent) => {
      if (agents[connectedAgent]) {
        edges.push({
          id: `${agentName}-${connectedAgent}`,
          source: agentName,
          target: connectedAgent,
          type: 'smoothstep',
          animated: true,
          style: {
            strokeDasharray: '5,5',
            stroke: '#6366f1',
            strokeWidth: 2
          },
          markerEnd: {
            type: 'arrowclosed',
            color: '#6366f1'
          }
        });
      }
    });
  });
  
  // Find exit agents (those that send to user) and connect them to end
  const exitAgents = agentNames.filter(name => agents[name].sends_to_user);
  exitAgents.forEach(agentName => {
    edges.push({
      id: `${agentName}-end`,
      source: agentName,
      target: 'end',
      type: 'smoothstep',
      animated: true,
      style: {
        strokeDasharray: '5,5',
        stroke: '#6366f1',
        strokeWidth: 2
      },
      markerEnd: {
        type: 'arrowclosed',
        color: '#6366f1'
      }
    });
  });

  return { nodes, edges };
}