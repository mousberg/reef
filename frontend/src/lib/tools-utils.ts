import { toolsConfig } from './tools-config';

// Export tools list for backend consumption (e.g., coral_factory)
export function getAvailableTools(): string[] {
  return toolsConfig.tools.map(tool => tool.tool_name);
}

// Export tools by category for better organization
export function getToolsByCategory(): { [category: string]: string[] } {
  const toolsByCategory: { [category: string]: string[] } = {};
  
  toolsConfig.tools.forEach(tool => {
    const category = tool.category || 'other';
    if (!toolsByCategory[category]) {
      toolsByCategory[category] = [];
    }
    toolsByCategory[category].push(tool.tool_name);
  });
  
  return toolsByCategory;
}

// Export individual tool definitions for detailed information
export function getToolDefinition(toolName: string) {
  return toolsConfig.tools.find(tool => tool.tool_name === toolName);
}

export default {
  getAvailableTools,
  getToolsByCategory,
  getToolDefinition,
};
