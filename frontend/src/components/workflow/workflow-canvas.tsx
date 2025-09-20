"use client";

import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
  Panel,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

import { AgentNode } from './agent-node';
import { ToolNode } from './tool-node';
import { parseWorkflowJson, convertToReactFlowElements } from '@/lib/workflow-parser';
import { WorkflowConfig } from '@/types/workflow';

const nodeTypes = {
  agent: AgentNode,
  tool: ToolNode,
};

interface WorkflowCanvasProps {
  jsonContent?: string;
}

function WorkflowCanvasInner({ jsonContent }: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [config, setConfig] = useState<WorkflowConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Parse JSON and update flow elements
  const updateWorkflow = useCallback((json: string) => {
    try {
      const parsedConfig = parseWorkflowJson(json);
      const { nodes: newNodes, edges: newEdges } = convertToReactFlowElements(parsedConfig);
      
      setNodes(newNodes);
      setEdges(newEdges);
      setConfig(parsedConfig);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse workflow');
      setNodes([]);
      setEdges([]);
      setConfig(null);
    }
  }, [setNodes, setEdges]);

  // Update workflow when jsonContent changes
  useEffect(() => {
    if (jsonContent) {
      updateWorkflow(jsonContent);
    }
  }, [jsonContent, updateWorkflow]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-red-500 text-sm font-medium mb-2">Error parsing workflow</div>
          <div className="text-red-400 text-xs">{error}</div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-gray-500 text-sm">No workflow loaded</div>
          <div className="text-gray-400 text-xs mt-1">
            Provide JSON content to visualize workflow
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative" style={{ minHeight: '500px', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        fitView
        className="bg-gray-50"
      >
        <Controls className="bg-white border border-gray-200 rounded-lg shadow-sm" />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
    </div>
  );
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}