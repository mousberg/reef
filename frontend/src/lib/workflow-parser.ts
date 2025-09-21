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

  // Horizontal layout with nodes spaced evenly
  const spacing = 400; // Horizontal spacing between nodes
  const yPosition = 200; // Fixed Y position for all nodes
  const toolYOffset = 120; // Vertical offset for tool nodes

  // Create agent nodes
  const agentNodes: WorkflowNode[] = agents.map((agent, index) => {
    return {
      id: agent.name,
      type: 'agent',
      position: {
        x: index * spacing,
        y: yPosition
      },
      data: {
        agent,
        agentName: agent.name,
        isFirst: index === 0, // First agent in the array
        isLast: index === agents.length - 1 // Last agent in the array
      }
    };
  });

  // Create tool nodes for each agent
  const toolNodes: WorkflowNode[] = [];
  agents.forEach((agent, agentIndex) => {
    const agentX = agentIndex * spacing;
    const agentWidth = 275; // Approximate width of agent node

    if (agent.tools.length > 0) {
      const toolSpacing = 90; // Spacing between tool nodes
      const totalToolsWidth = (agent.tools.length - 1) * toolSpacing;
      const startX = agentX + (agentWidth / 2) - (totalToolsWidth / 2);

      agent.tools.forEach((tool, toolIndex) => {
        toolNodes.push({
          id: `${agent.name}-tool-${toolIndex}`,
          type: 'tool',
          position: {
            x: startX + (toolIndex * toolSpacing),
            y: yPosition + toolYOffset
          },
          data: {
            tool,
            parentAgent: agent.name
          }
        });
      });
    }
  });

  const nodes: WorkflowNode[] = [...agentNodes, ...toolNodes];

  // Create edges for workflow flow
  const edges: Edge[] = [];

  // Create linear flow between agents (first agent -> second agent -> third agent...)
  for (let i = 0; i < agents.length - 1; i++) {
    const currentAgent = agents[i];
    const nextAgent = agents[i + 1];

    edges.push({
      id: `${currentAgent.name}-${nextAgent.name}`,
      source: currentAgent.name,
      target: nextAgent.name,
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

  // Create edges from agents to their tools
  agents.forEach((agent, agentIndex) => {
    agent.tools.forEach((tool, toolIndex) => {
      edges.push({
        id: `${agent.name}-tool-${toolIndex}`,
        source: agent.name,
        target: `${agent.name}-tool-${toolIndex}`,
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
