"use client";

import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

import { AgentNode } from "./agent-node";
import {
  parseWorkflowJson,
  convertToReactFlowElements,
} from "@/lib/workflow-parser";

const nodeTypes = {
  agent: AgentNode,
};

interface WorkflowCanvasProps {
  jsonContent?: string;
}

function WorkflowCanvasInner({ jsonContent }: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [error, setError] = useState<string | null>(null);

  // Parse JSON and update flow elements
  const updateWorkflow = useCallback(
    (json: string) => {
      try {
        const parsedConfig = parseWorkflowJson(json);
        const { nodes: newNodes, edges: newEdges } =
          convertToReactFlowElements(parsedConfig);

        setNodes(newNodes);
        setEdges(newEdges);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to parse workflow",
        );
        setNodes([]);
        setEdges([]);
      }
    },
    [setNodes, setEdges],
  );

  // Update workflow when jsonContent changes
  useEffect(() => {
    if (jsonContent) {
      updateWorkflow(jsonContent);
    }
  }, [jsonContent, updateWorkflow]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-red-500 text-sm font-medium mb-2">
            Error parsing workflow
          </div>
          <div className="text-red-400 text-xs">{error}</div>
        </div>
      </div>
    );
  }

  // Always render the canvas, even when empty

  return (
    <div
      className="flex-1 relative"
      style={{ minHeight: "500px", height: "100%" }}
    >
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
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        className="bg-slate-50"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Controls
          className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg"
          showInteractive={false}
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#cbd5e1"
        />
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
