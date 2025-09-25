"use client";

import { useState } from "react";

interface WorkflowState {
  main_task: string;
  relations: string;
  agents: Array<{
    name: string;
    description: string;
    task: string;
    expected_input: string;
    expected_output: string;
    tools: string[];
  }>;
}

interface ToolCallProps {
  toolName: string;
  input: any;
  className?: string;
}

interface ToolResultProps {
  toolName: string;
  output: any;
  className?: string;
}

// Workflow-specific renderers
function WorkflowCallRenderer({ input }: { input: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const workflowState = input?.workflowState as WorkflowState;

  if (!workflowState) {
    return <div className="text-red-600 text-sm">Invalid workflow data</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-green-700 dark:text-green-300">
            Workflow Summary
          </h4>
          <p className="text-sm text-green-600 dark:text-green-400">
            {workflowState.agents?.length || 0} agent
            {(workflowState.agents?.length || 0) !== 1 ? "s" : ""} edited
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 flex items-center gap-1"
        >
          {isExpanded ? "Hide details" : "Show details"}
          <svg
            className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-green-200 dark:border-green-800">
          <div>
            <h4 className="font-semibold text-green-700 dark:text-green-300 mb-1">
              Main Task
            </h4>
            <p className="text-sm text-green-800 dark:text-green-200">
              {workflowState.main_task}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-green-700 dark:text-green-300 mb-1">
              Agents ({workflowState.agents?.length || 0})
            </h4>
            <div className="space-y-2">
              {workflowState.agents?.map((agent, index) => (
                <div key={index} className="border-l-2 border-green-300 pl-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-green-700 dark:text-green-300">
                      {agent.name}
                    </span>
                    <span className="text-xs bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded">
                      {agent.tools?.length || 0} tools
                    </span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {agent.description}
                  </p>
                </div>
              )) || (
                <p className="text-xs text-green-600 dark:text-green-400">
                  No agents defined yet
                </p>
              )}
            </div>
          </div>

          {workflowState.relations && (
            <div>
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-1">
                Agent Relations
              </h4>
              <p className="text-sm text-green-800 dark:text-green-200">
                {workflowState.relations}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WorkflowResultRenderer({ output }: { output: any }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <svg
          className="w-4 h-4 text-green-600 dark:text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-green-700 dark:text-green-300 font-medium">
          {output?.success ? "Success" : "Failed"}
        </span>
      </div>

      {output?.message && (
        <p className="text-sm text-green-800 dark:text-green-200">
          {output.message}
        </p>
      )}

      {output?.agentCount !== undefined && (
        <p className="text-xs text-green-600 dark:text-green-400">
          Configured {output.agentCount} agent
          {output.agentCount !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

// Generic fallback renderer
function GenericCallRenderer({ input }: { input: any }) {
  // Try to extract meaningful information from the input
  const inputEntries =
    input && typeof input === "object" ? Object.entries(input) : [];

  if (inputEntries.length === 0) {
    return (
      <div className="text-blue-600 dark:text-blue-400 text-sm">
        No parameters
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {inputEntries.map(([key, value]) => (
        <div key={key} className="text-sm">
          <span className="font-medium text-blue-700 dark:text-blue-300">
            {key}:
          </span>
          <span className="ml-2 text-blue-800 dark:text-blue-200">
            {typeof value === "string"
              ? value
              : typeof value === "object"
                ? `${Object.keys(value || {}).length} items`
                : String(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function GenericResultRenderer({ output }: { output: any }) {
  // Handle string output
  if (typeof output === "string") {
    return (
      <div className="text-sm text-green-800 dark:text-green-200">{output}</div>
    );
  }

  // Handle object output
  if (output && typeof output === "object") {
    const outputEntries = Object.entries(output);

    return (
      <div className="space-y-1">
        {outputEntries.map(([key, value]) => (
          <div key={key} className="text-sm">
            <span className="font-medium text-green-700 dark:text-green-300">
              {key}:
            </span>
            <span className="ml-2 text-green-800 dark:text-green-200">
              {typeof value === "string"
                ? value
                : typeof value === "object"
                  ? `${Object.keys(value || {}).length} items`
                  : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Fallback for other types
  return (
    <div className="text-sm text-green-800 dark:text-green-200">
      {String(output)}
    </div>
  );
}

// Main tool call renderer
export function ToolCallRenderer({
  toolName,
  input,
  className = "",
}: ToolCallProps) {
  const baseClassName = `border border-green-200 dark:border-green-800 rounded-lg p-3 mb-2 bg-green-50 dark:bg-green-950/30 ${className}`;

  return (
    <div className={baseClassName}>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <span className="text-sm font-medium text-green-700 dark:text-green-300">
          {toolName === "updateWorkflow"
            ? "Workflow Modified"
            : `Tool Completed: ${toolName}`}
        </span>
      </div>

      {toolName === "updateWorkflow" ? (
        <WorkflowCallRenderer input={input} />
      ) : (
        <GenericCallRenderer input={input} />
      )}
    </div>
  );
}

// Main tool result renderer
export function ToolResultRenderer({
  toolName,
  output,
  className = "",
}: ToolResultProps) {
  const baseClassName = `border border-green-200 dark:border-green-800 rounded-lg p-3 mb-2 bg-green-50 dark:bg-green-950/30 ${className}`;

  return (
    <div className={baseClassName}>
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="w-4 h-4 text-green-600 dark:text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-sm font-medium text-green-700 dark:text-green-300">
          {toolName === "updateWorkflow"
            ? "Workflow Result"
            : `Result: ${toolName}`}
        </span>
      </div>

      {toolName === "updateWorkflow" ? (
        <WorkflowResultRenderer output={output} />
      ) : (
        <GenericResultRenderer output={output} />
      )}
    </div>
  );
}
