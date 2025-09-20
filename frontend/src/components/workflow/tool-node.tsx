import { Handle, Position } from 'reactflow';
import Image from 'next/image';

interface ToolNodeProps {
  data: {
    tool: string;
    parentAgent: string;
  };
}

export function ToolNode({ data }: ToolNodeProps) {
  const { tool, parentAgent } = data;
  
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
  
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-3 min-w-[80px] text-center relative">
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-2 h-2" 
        style={{ left: '50%', transform: 'translateX(-50%)' }}
      />
      
      <div className="flex flex-col items-center gap-2">
        {iconPath ? (
          <Image
            src={iconPath}
            alt={tool}
            width={24}
            height={24}
            className="opacity-80"
          />
        ) : (
          <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-xs font-mono">{tool.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <span className="text-xs font-medium text-gray-700 truncate max-w-[70px]">
          {tool}
        </span>
      </div>
    </div>
  );
}