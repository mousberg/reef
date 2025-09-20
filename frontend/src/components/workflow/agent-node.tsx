import { Handle, Position } from 'reactflow';
import { WorkflowAgent } from '@/types/workflow';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useState } from 'react';

interface AgentNodeProps {
  data: {
    agent: WorkflowAgent;
    agentName: string;
    isFirst?: boolean;
    isLast?: boolean;
  };
}

export function AgentNode({ data }: AgentNodeProps) {
  const { agent, agentName, isFirst, isLast } = data;
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div 
      className={`
        bg-white border-2 rounded-lg shadow-md min-w-[250px] max-w-[300px] cursor-pointer
        ${isFirst ? 'border-green-400 bg-green-50' : isLast ? 'border-red-400 bg-red-50' : 'border-gray-200'}
        hover:shadow-lg transition-shadow
      `}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-gray-900 truncate">{agent.name}</h3>
          <div className="flex gap-1 items-center">
            {isFirst && (
              <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
                START
              </Badge>
            )}
            {isLast && (
              <Badge variant="default" className="text-xs bg-red-500 hover:bg-red-600">
                END
              </Badge>
            )}
            <span className="text-xs text-gray-400 ml-2">
              {isExpanded ? '▼' : '▶'}
            </span>
          </div>
        </div>
        
        {/* Basic info - always visible */}
        <div className="mb-3">
          <p className="text-xs text-gray-600 line-clamp-2">{agent.task}</p>
        </div>
        
        {/* Expanded details - show only when clicked */}
        {isExpanded && (
          <>
            {/* Description */}
            <div className="mb-3 p-2 bg-gray-50 rounded">
              <p className="text-xs font-medium text-gray-700 mb-1">Description:</p>
              <p className="text-xs text-gray-600">{agent.instructions}</p>
            </div>
            
            {/* Input/Output */}
            <div className="space-y-2 mb-3">
              <div>
                <p className="text-xs font-medium text-gray-700">Input:</p>
                <p className="text-xs text-gray-500">{agent.expected_input}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">Output:</p>
                <p className="text-xs text-gray-500">{agent.expected_output}</p>
              </div>
            </div>
            
            {/* Connected Agents */}
            {agent.connected_agents.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">Connected to:</p>
                <div className="flex flex-wrap gap-1">
                  {agent.connected_agents.map((connectedAgent, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {connectedAgent}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
      
      {/* Handle for tools at the bottom center */}
      {agent.tools.length > 0 && (
        <Handle 
          type="source" 
          position={Position.Bottom} 
          className="w-3 h-3" 
          id="tools"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        />
      )}
    </div>
  );
}