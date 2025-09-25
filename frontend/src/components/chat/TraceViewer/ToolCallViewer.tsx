"use client";

import { JsonViewer } from "./JsonViewer";

interface ToolCall {
  function: {
    arguments: string;
    name: string;
  };
  id: string;
  type: string;
}

interface ToolCallViewerProps {
  toolCalls: ToolCall[];
  className?: string;
}

export function ToolCallViewer({
  toolCalls,
  className = "",
}: ToolCallViewerProps) {
  if (!toolCalls || toolCalls.length === 0) {
    return null;
  }

  const parseArguments = (args: string) => {
    try {
      return JSON.parse(args);
    } catch {
      return args;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-[#2F3037] font-medium text-sm flex items-center gap-2">
        <svg
          className="w-4 h-4 text-[#556B5D]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Tool Calls ({toolCalls.length})
      </h4>

      {toolCalls.map((toolCall, index) => (
        <div
          key={toolCall.id || index}
          className="border border-[rgba(55,50,47,0.12)] rounded-lg p-3 bg-white/50"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#2F3037] font-medium text-sm">
              {toolCall.function.name}
            </span>
            <span className="text-[#556B5D] text-xs font-mono bg-[#F7F5F3] px-2 py-1 rounded">
              {toolCall.type}
            </span>
          </div>

          {toolCall.id && (
            <div className="text-[#556B5D] text-xs font-mono mb-2">
              ID: {toolCall.id}
            </div>
          )}

          <JsonViewer
            data={parseArguments(toolCall.function.arguments)}
            title="Arguments"
            className="mt-2"
          />
        </div>
      ))}
    </div>
  );
}
