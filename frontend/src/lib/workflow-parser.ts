import { WorkflowConfig, WorkflowNode } from '@/types/workflow';
import { Edge, MarkerType } from 'reactflow';

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
  edges: Edge[];
} {
  const agents = config.agents;
  const agentNames = Object.keys(agents);
  
  // Horizontal layout with nodes spaced evenly
  const spacing = 400; // Horizontal spacing between nodes
  const yPosition = 200; // Fixed Y position for all nodes
  const toolYOffset = 120; // Vertical offset for tool nodes
  
  // Find entry and exit agents
  const entryAgents = agentNames.filter(name => agents[name].receives_from_user);
  const exitAgents = agentNames.filter(name => agents[name].sends_to_user);
  
  // Create agent nodes
  const agentNodes: WorkflowNode[] = agentNames.map((agentName, index) => {
    const agent = agents[agentName];
    const isFirst = entryAgents.includes(agentName);
    const isLast = exitAgents.includes(agentName);
    
    return {
      id: agentName,
      type: 'agent',
      position: {
        x: index * spacing,
        y: yPosition
      },
      data: {
        agent,
        agentName,
        isFirst,
        isLast
      }
    };
  });
  
  // Create tool nodes for each agent
  const toolNodes: WorkflowNode[] = [];
  agentNames.forEach((agentName, agentIndex) => {
    const agent = agents[agentName];
    const agentX = agentIndex * spacing;
    const agentWidth = 275; // Approximate width of agent node
    
    if (agent.tools.length > 0) {
      const toolSpacing = 90; // Spacing between tool nodes
      const totalToolsWidth = (agent.tools.length - 1) * toolSpacing;
      const startX = agentX + (agentWidth / 2) - (totalToolsWidth / 2);
      
      agent.tools.forEach((tool, toolIndex) => {
        toolNodes.push({
          id: `${agentName}-tool-${toolIndex}`,
          type: 'tool',
          position: {
            x: startX + (toolIndex * toolSpacing),
            y: yPosition + toolYOffset
          },
          data: {
            tool,
            parentAgent: agentName
          }
        });
      });
    }
  });
  
  const nodes: WorkflowNode[] = [...agentNodes, ...toolNodes];

  // Create edges based on connected_agents
  const edges: Edge[] = [];
  
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
            type: MarkerType.ArrowClosed,
            color: '#6366f1'
          }
        });
      }
    });
  });
  
  // Create edges from agents to their tools
  agentNames.forEach((agentName, agentIndex) => {
    const agent = agents[agentName];
    agent.tools.forEach((tool, toolIndex) => {
      edges.push({
        id: `${agentName}-tool-${toolIndex}`,
        source: agentName,
        target: `${agentName}-tool-${toolIndex}`,
        sourceHandle: 'tools', // Use the specific bottom handle for tools
        targetHandle: null, // Use default top handle
        type: 'straight',
        style: {
          stroke: '#94a3b8',
          strokeWidth: 2,
          strokeDasharray: '4,4'
        }
      });
    });
  });

  return { nodes, edges };
}