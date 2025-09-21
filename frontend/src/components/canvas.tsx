"use client"

import { WorkflowCanvas } from './workflow/workflow-canvas';
import { AnimatedCoral } from './animated-coral';
import { useState } from 'react'
import type { Project } from '@/contexts/AuthContext';
import { WorkflowQueryDialog } from './ui/workflow-query-dialog';

interface CanvasProps {
  project: Project
}

export function Canvas({ project }: CanvasProps) {
  // Convert workflowState to JSON string for WorkflowCanvas component
  const workflowJson = project.workflowState ? JSON.stringify(project.workflowState, null, 2) : undefined;

  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportSuccess, setExportSuccess] = useState(false)

  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)
  const [runSuccess, setRunSuccess] = useState(false)
  const [showQueryDialog, setShowQueryDialog] = useState(false)

  const handleExport = async () => {
    setExportError(null)
    setExportSuccess(false)

    if (!project.workflowState) {
      setExportError('No workflow to export')
      return
    }

    try {
      setExporting(true)
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowState: project.workflowState }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setExportError(data?.error || 'Export failed')
        return
      }

      setExportSuccess(true)
    } catch (e: any) {
      setExportError(e?.message || 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  const handleRun = () => {
    setRunError(null)
    setRunSuccess(false)
    setShowQueryDialog(true)
  }

  const handleQuerySubmit = async (query: string) => {
    try {
      setRunning(true)
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setRunError(data?.error || 'Run failed')
        return
      }

      setRunSuccess(true)
    } catch (e: any) {
      setRunError(e?.message || 'Run failed')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Workflow Canvas</h2>
            <span className="text-sm text-gray-500">
              {project.workflowState ? 'AI agents running on the Coral Protocol' : 'No workflow created yet'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleRun} disabled={running} className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-60">
              {running ? 'Running...' : 'RUN'}
            </button>
            <button type="button" onClick={handleExport} disabled={exporting} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60">
              {exporting ? 'Exporting...' : 'Export'}
            </button>
            <button type="button" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50">
              Publish
            </button>
          </div>
        </div>
        {exportError && (
          <div className="mt-2 text-sm text-red-600">{exportError}</div>
        )}
        {exportSuccess && (
          <div className="mt-2 text-sm text-green-600">Exported to factory successfully.</div>
        )}
        {runError && (
          <div className="mt-2 text-sm text-red-600">{runError}</div>
        )}
        {runSuccess && (
          <div className="mt-2 text-sm text-green-600">Run started successfully.</div>
        )}
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden">
        {project.workflowState ? (
          <WorkflowCanvas jsonContent={workflowJson} />
        ) : (
          <AnimatedCoral />
        )}
      </div>

      {/* Query Dialog */}
      <WorkflowQueryDialog
        open={showQueryDialog}
        onOpenChange={setShowQueryDialog}
        onSubmit={handleQuerySubmit}
      />
    </div>
  )
}
