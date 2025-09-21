"use client"

import { WorkflowCanvas } from './workflow/workflow-canvas';
import type { Project } from '@/contexts/AuthContext';

interface CanvasProps {
  project: Project
}

export function Canvas({ project }: CanvasProps) {
  // Convert workflowState to JSON string for WorkflowCanvas component
  const workflowJson = project.workflowState ? JSON.stringify(project.workflowState, null, 2) : undefined;

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Workflow Canvas</h2>
            <span className="text-sm text-gray-500">
              {project.workflowState ? 'AI-managed workflow' : 'No workflow created yet'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500">
              Export
            </button>
            <button type="button" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50">
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden">
        <WorkflowCanvas jsonContent={workflowJson} />
      </div>
    </div>
  )
}