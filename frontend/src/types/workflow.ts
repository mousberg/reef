export interface WorkflowAgent {
  name: string;
  task: string;
  instructions: string;
  connected_agents: string[];
  expected_input: string;
  expected_output: string;
  receives_from_user: boolean;
  sends_to_user: boolean;
  tools: string[];
}

export interface WorkflowNode {
  id: string;
  type: "agent" | "start" | "end" | "tool";
  position: { x: number; y: number };
  data: {
    agent?: WorkflowAgent;
    agentName?: string;
    label?: string;
    isFirst?: boolean;
    isLast?: boolean;
    tool?: string;
    parentAgent?: string;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
  markerEnd?: {
    type: string;
    color?: string;
  };
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export type WorkflowConfig = {
  main_task: string;
  relations: string;
  agents: WorkflowAgent[];
};
