export interface ToolParameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  optional?: boolean;
  default?: any;
}

export interface ToolDefinition {
  tool_name: string;
  description: string;
  parameters: ToolParameter[];
  category?: string;
  enabled?: boolean;
}

export interface ToolProvider {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType;
  scopes?: string[];
  enabled: boolean;
  tools: ToolDefinition[];
}

export interface ToolsConfig {
  providers: ToolProvider[];
  tools: ToolDefinition[];
}
