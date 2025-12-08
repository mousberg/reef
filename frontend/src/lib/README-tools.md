# Tools Configuration System

This directory contains the centralized tools configuration system that replaces the hardcoded tools in `Prompt.md` and the settings page.

## Files Overview

### `/types/tools.ts`
TypeScript type definitions for tools configuration:
- `ToolParameter`: Individual parameter definition
- `ToolDefinition`: Complete tool definition with parameters
- `ToolProvider`: Provider configuration (Google, GitHub, etc.)
- `ToolsConfig`: Overall configuration structure

### `/lib/tools-config.ts`
Centralized tools configuration containing all available tools organized by category:
- **Social**: Twitter/X, LinkedIn
- **Communication**: Slack
- **Email**: Gmail
- **Calendar**: Google Calendar
- **Finance**: Google Finance
- **Development**: GitHub
- **Productivity**: Notion
- **Music**: Spotify
- **Search**: Google Search

### `/lib/tools-providers.ts`
Provider-specific configuration for the settings page, including:
- Provider metadata (name, description, icon)
- OAuth scopes
- Enabled status

### `/lib/tools-prompt-generator.ts`
Dynamic prompt generator that creates the tools documentation from the configuration:
- Replaces the static `Prompt.md` file
- Automatically formats tools with parameters
- Groups tools by category

### `/lib/tools-utils.ts`
Utility functions for backend integration:
- `getAvailableTools()`: Returns array of tool names
- `getToolsByCategory()`: Returns tools grouped by category
- `getToolDefinition()`: Returns detailed tool information

### `/lib/system-prompt.ts`
Updated to use dynamic tools generation instead of reading `Prompt.md`

## Usage

### Frontend (Settings Page)
```typescript
import { toolsProviders } from '../lib/tools-providers';

// Use in settings page
const availableTools = toolsProviders;
```

### System Prompt Generation
```typescript
import { getSystemPrompt } from '../lib/system-prompt';

// Automatically includes all configured tools
const prompt = getSystemPrompt();
```

### Backend Integration
```typescript
import { getAvailableTools } from '../lib/tools-utils';

// Get list of all available tools
const tools = getAvailableTools();
```

## Adding New Tools

1. **Add tool definition** to `/lib/tools-config.ts`:
```typescript
const newTool: ToolDefinition = {
  tool_name: "NewTool.Action",
  description: "Description of what the tool does",
  parameters: [
    { name: "param1", type: "string", required: true, description: "Parameter description" }
  ],
  category: "category_name"
};
```

2. **Add to tools array** in the same file:
```typescript
const allTools: ToolDefinition[] = [
  ...existingTools,
  newTool
];
```

3. **If it's a new provider**, add to `/lib/tools-providers.ts`:
```typescript
{
  id: "newprovider",
  name: "New Provider",
  description: "Provider description",
  icon: NewProviderIcon,
  scopes: ["required.scope"],
  enabled: true,
  tools: []
}
```

## Benefits

- **Single source of truth**: All tools defined in one place
- **Type safety**: TypeScript types ensure consistency
- **Dynamic generation**: System prompt automatically updates
- **Easy maintenance**: Add/remove tools without touching multiple files
- **Backend integration**: Utilities for coral_factory consumption
- **Categorized organization**: Tools grouped by functionality

## Migration Notes

- `Prompt.md` is no longer used for tools documentation
- Settings page now uses centralized provider configuration
- System prompt is generated dynamically
- All tool definitions are now in TypeScript for better maintainability








