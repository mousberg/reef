import { toolsConfig, ToolParameter } from "./tools-config";

export function generateToolsPrompt(): string {
  let prompt =
    "# TIMEZONE\n\n- We are in the timezone: New York\n- Time now: {time}\n\n";

  // Group tools by category/provider
  const toolsByCategory: { [key: string]: any[] } = {};

  toolsConfig.tools.forEach((tool) => {
    const category = tool.category || "other";
    if (!toolsByCategory[category]) {
      toolsByCategory[category] = [];
    }
    toolsByCategory[category].push(tool);
  });

  // Generate sections for each category
  Object.entries(toolsByCategory).forEach(([category, tools]) => {
    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
    prompt += `## ${categoryTitle}\n\n`;

    tools.forEach((tool) => {
      prompt += `tool_name = "${tool.tool_name}"\n`;
      prompt += `${tool.description}\n\n`;

      if (tool.parameters && tool.parameters.length > 0) {
        prompt += "Parameters:\n\n";
        tool.parameters.forEach((param: ToolParameter) => {
          const required = param.required ? "required" : "optional";
          const defaultValue = param.default
            ? `, Defaults to ${param.default}`
            : "";
          prompt += `- ${param.name} (${param.type}, ${required}${defaultValue}) ${param.description || ""}\n`;
        });
      } else {
        prompt += "Parameters:\nThis tool takes no parameters.\n";
      }
      prompt += "\n";
    });
  });

  return prompt;
}

export default generateToolsPrompt;
