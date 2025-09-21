"use client"

import { ReactNode } from "react"

interface WorkflowState {
  main_task: string
  relations: string
  agents: Array<{
    name: string
    description: string
    task: string
    expected_input: string
    expected_output: string
    tools: string[]
  }>
}

interface ToolCallProps {
  toolName: string
  input: any
  className?: string
}

interface ToolResultProps {
  toolName: string
  output: any
  className?: string
}

// Workflow-specific renderers
function WorkflowCallRenderer({ input }: { input: any }) {
  const workflowState = input?.workflowState as WorkflowState

  if (!workflowState) {
    return <div className="text-red-600 text-sm">Invalid workflow data</div>
  }

  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Main Task</h4>
        <p className="text-sm text-blue-800 dark:text-blue-200">{workflowState.main_task}</p>
      </div>

      <div>
        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Agents ({workflowState.agents?.length || 0})</h4>
        <div className="space-y-2">
          {workflowState.agents?.map((agent, index) => (
            <div key={index} className="border-l-2 border-blue-300 pl-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-blue-700 dark:text-blue-300">{agent.name}</span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded">
                  {agent.tools?.length || 0} tools
                </span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">{agent.description}</p>
            </div>
          )) || <p className="text-xs text-blue-600 dark:text-blue-400">No agents defined yet</p>}
        </div>
      </div>

      {workflowState.relations && (
        <div>
          <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Agent Relations</h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">{workflowState.relations}</p>
        </div>
      )}
    </div>
  )
}

function WorkflowResultRenderer({ output }: { output: any }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-green-700 dark:text-green-300 font-medium">
          {output?.success ? 'Success' : 'Failed'}
        </span>
      </div>

      {output?.message && (
        <p className="text-sm text-green-800 dark:text-green-200">{output.message}</p>
      )}

      {output?.agentCount !== undefined && (
        <p className="text-xs text-green-600 dark:text-green-400">
          Configured {output.agentCount} agent{output.agentCount !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}

// Generic fallback renderer
function GenericCallRenderer({ toolName, input }: { toolName: string, input: any }) {
  // Try to extract meaningful information from the input
  const inputEntries = input && typeof input === 'object' ? Object.entries(input) : []

  if (inputEntries.length === 0) {
    return <div className="text-blue-600 dark:text-blue-400 text-sm">No parameters</div>
  }

  return (
    <div className="space-y-1">
      {inputEntries.map(([key, value]) => (
        <div key={key} className="text-sm">
          <span className="font-medium text-blue-700 dark:text-blue-300">{key}:</span>
          <span className="ml-2 text-blue-800 dark:text-blue-200">
            {typeof value === 'string'
              ? value
              : typeof value === 'object'
                ? `${Object.keys(value || {}).length} items`
                : String(value)
            }
          </span>
        </div>
      ))}
    </div>
  )
}

function GenericResultRenderer({ toolName, output }: { toolName: string, output: any }) {
  // Handle string output
  if (typeof output === 'string') {
    return (
      <div className="text-sm text-green-800 dark:text-green-200">
        {output}
      </div>
    )
  }

  // Handle object output
  if (output && typeof output === 'object') {
    const outputEntries = Object.entries(output)

    return (
      <div className="space-y-1">
        {outputEntries.map(([key, value]) => (
          <div key={key} className="text-sm">
            <span className="font-medium text-green-700 dark:text-green-300">{key}:</span>
            <span className="ml-2 text-green-800 dark:text-green-200">
              {typeof value === 'string'
                ? value
                : typeof value === 'object'
                  ? `${Object.keys(value || {}).length} items`
                  : String(value)
              }
            </span>
          </div>
        ))}
      </div>
    )
  }

  // Fallback for other types
  return (
    <div className="text-sm text-green-800 dark:text-green-200">
      {String(output)}
    </div>
  )
}

// Main tool call renderer
export function ToolCallRenderer({ toolName, input, className = "" }: ToolCallProps) {
  const baseClassName = `border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-2 bg-blue-50 dark:bg-blue-950/30 ${className}`

  return (
    <div className={baseClassName}>
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          {toolName === 'updateWorkflow' ? 'Creating Workflow' : `Tool: ${toolName}`}
        </span>
      </div>

      {toolName === 'updateWorkflow' ? (
        <WorkflowCallRenderer input={input} />
      ) : (
        <GenericCallRenderer toolName={toolName} input={input} />
      )}
    </div>
  )
}

// Main tool result renderer
export function ToolResultRenderer({ toolName, output, className = "" }: ToolResultProps) {
  const baseClassName = `border border-green-200 dark:border-green-800 rounded-lg p-3 mb-2 bg-green-50 dark:bg-green-950/30 ${className}`

  return (
    <div className={baseClassName}>
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-medium text-green-700 dark:text-green-300">
          {toolName === 'updateWorkflow' ? 'Workflow Result' : `Result: ${toolName}`}
        </span>
      </div>

      {toolName === 'updateWorkflow' ? (
        <WorkflowResultRenderer output={output} />
      ) : (
        <GenericResultRenderer toolName={toolName} output={output} />
      )}
    </div>
  )
}
