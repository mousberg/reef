import { Handle, Position } from 'reactflow';
import { WorkflowAgent } from '@/types/workflow';
import { Badge } from '@/components/ui/badge';

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
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
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
            <div className="flex flex-wrap gap-1">
              {agent.tools.slice(0, 3).map((tool, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tool}
                </Badge>
              ))}
              {agent.tools.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{agent.tools.length - 3}
                </Badge>
              )}
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
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}