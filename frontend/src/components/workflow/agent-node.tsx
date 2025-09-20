import { Handle, Position } from 'reactflow';
import { WorkflowAgent } from '@/types/workflow';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface AgentNodeProps {
  data: {
    agent: WorkflowAgent;
    agentName: string;
  };
}

export function AgentNode({ data }: AgentNodeProps) {
  const { agent, agentName } = data;
  
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md min-w-[250px] max-w-[300px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-gray-900 truncate">{agent.name}</h3>
          <div className="flex gap-1">
            {agent.receives_from_user && (
              <Badge variant="secondary" className="text-xs">Entry</Badge>
            )}
            {agent.sends_to_user && (
              <Badge variant="secondary" className="text-xs">Exit</Badge>
            )}
          </div>
        </div>
        
        {/* Task */}
        <div className="mb-3">
          <p className="text-xs text-gray-600 line-clamp-2">{agent.task}</p>
        </div>
        
        {/* Tools */}
        {agent.tools.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-700 mb-1">Tools:</p>
            <div className="flex gap-2">
              {agent.tools.map((tool, index) => {
                // Map of available tool icons
                const toolIcons: Record<string, string> = {
                  'calendar': '/icons/calendar.svg',
                  'contacts': '/icons/contacts.svg',
                  'databricks': '/icons/databricks.svg',
                  'email': '/icons/email.svg',
                  'github': '/icons/github.svg',
                  'jira': '/icons/jira.svg',
                  'notion': '/icons/notion.svg',
                  'slack': '/icons/slack.svg'
                };
                
                const iconPath = toolIcons[tool.toLowerCase()];
                
                if (iconPath) {
                  return (
                    <div key={index} className="relative group">
                      <Image
                        src={iconPath}
                        alt={tool}
                        width={20}
                        height={20}
                        className="opacity-80 hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        {tool}
                      </div>
                    </div>
                  );
                }
                
                // Fallback to badge if no icon found
                return (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tool}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Input/Output */}
        <div className="space-y-2">
          <div>
            <p className="text-xs font-medium text-gray-700">Input:</p>
            <p className="text-xs text-gray-500 line-clamp-1">{agent.expected_input}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-700">Output:</p>
            <p className="text-xs text-gray-500 line-clamp-1">{agent.expected_output}</p>
          </div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
}