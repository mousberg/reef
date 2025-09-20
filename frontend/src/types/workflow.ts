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

export interface WorkflowConfig {
  main_task: string;
  relations: string;
  agents: Record<string, WorkflowAgent>;
}

export interface WorkflowNode {
  id: string;
  type: 'agent' | 'start' | 'end';
  position: { x: number; y: number };
  data: {
    agent?: WorkflowAgent;
    agentName?: string;
    label?: string;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type: 'smoothstep';
}