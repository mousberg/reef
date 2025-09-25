import { WorkflowConfig, WorkflowNode } from "@/types/workflow";
import { Edge, MarkerType } from "reactflow";

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
  const spacing = 320; // Horizontal spacing between nodes (reduced for better fit)
  const yPosition = 150; // Fixed Y position for all nodes

  // Create agent nodes
  const agentNodes: WorkflowNode[] = agents.map((agent, index) => {
    return {
      id: agent.name,
      type: "agent",
      position: {
        x: index * spacing,
        y: yPosition,
      },
      data: {
        agent,
        agentName: agent.name,
        isFirst: index === 0, // First agent in the array
        isLast: index === agents.length - 1, // Last agent in the array
      },
    };
  });

  // Tools are now integrated into agent nodes as icons
  const nodes: WorkflowNode[] = agentNodes;

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
      type: "smoothstep",
      animated: true,
      style: {
        stroke: "#4f46e5",
        strokeWidth: 3,
        strokeLinecap: "round",
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#4f46e5",
        width: 24,
        height: 24,
      },
    });
  }

  // Tools are now integrated into agent nodes, no separate tool edges needed

  return { nodes, edges };
}
