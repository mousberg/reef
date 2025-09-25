export interface AgentTrace {
  id: string;
  created_at: Date | { toDate?: () => Date };
  end_time: Date | { toDate?: () => Date };
  group_id: string | null;
  inputs: {
    [key: string]: unknown;
  };
  metadata: {
    agent_type: string;
    name: string;
  };
  outputs: {
    [key: string]: unknown;
  };
  start_time: Date | { toDate?: () => Date };
  status: "completed" | "failed" | "pending" | "running";
  tags: string[];
  trace_id: string;
  updated_at: Date | { toDate?: () => Date };
  user_id: string;
}

export interface AgentSpan {
  id: string;
  created_at: Date | { toDate?: () => Date };
  end_time: Date | { toDate?: () => Date };
  error: unknown;
  inputs: {
    input?: Array<{
      content: string;
      role: string;
    }>;
    [key: string]: unknown;
  };
  metadata: {
    openai_parent_id?: string;
    openai_span_id: string;
    openai_trace_id: string;
    name: string;
  };
  outputs: {
    output?: Array<{
      annotations?: unknown[];
      content?: string;
      function_call?: unknown;
      role: string;
      tool_calls?: Array<{
        function: {
          arguments: string;
          name: string;
        };
        id: string;
        type: string;
      }>;
    }>;
    [key: string]: unknown;
  };
  parent_id?: string;
  span_id: string;
  start_time: Date | { toDate?: () => Date };
  status: "completed" | "failed" | "pending" | "running";
  tags: string[];
  trace_id: string;
  type: string;
  updated_at: Date | { toDate?: () => Date };
  user_id: string;
}

export interface TraceLogEntry {
  id: string;
  timestamp: Date;
  type: "trace" | "span";
  level: "info" | "error" | "warning";
  message: string;
  data: AgentTrace | AgentSpan;
  duration?: number;
}
