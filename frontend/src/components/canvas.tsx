"use client"

import { useState } from 'react';
import { WorkflowCanvas } from './workflow/workflow-canvas';

interface CanvasProps {
  projectId: string
}

const exampleWorkflow = `{
  "main_task": "Draft and publish a 1-page product update.",
  "relations": "Intake collects brief → Writer drafts → Reviewer checks → Publisher posts.",
  "agents": {
    "Intake": {
      "name": "Intake",
      "task": "Collect brief and requirements.",
      "instructions": "Collect information via email and organize in Notion",
      "connected_agents": ["Writer"],
      "expected_input": "User's short brief.",
      "expected_output": "Structured brief JSON.",
      "receives_from_user": true,
      "sends_to_user": false,
      "tools": ["email", "notion"]
    },
    "Writer": {
      "name": "Writer",
      "task": "Create a concise draft.",
      "instructions": "Use Notion for drafting and GitHub for version control",
      "connected_agents": ["Reviewer"],
      "expected_input": "Structured brief JSON.",
      "expected_output": "300–500 word draft.",
      "receives_from_user": false,
      "sends_to_user": false,
      "tools": ["notion", "github"]
    },
    "Reviewer": {
      "name": "Reviewer",
      "task": "Light fact/clarity check.",
      "instructions": "Track review tasks in Jira and collaborate via Slack",
      "connected_agents": ["Publisher"],
      "expected_input": "Draft from Writer.",
      "expected_output": "Approved draft with minor edits.",
      "receives_from_user": false,
      "sends_to_user": false,
      "tools": ["jira", "slack"]
    },
    "Publisher": {
      "name": "Publisher",
      "task": "Post to site and return link.",
      "instructions": "Schedule via calendar and notify team through Slack",
      "connected_agents": [],
      "expected_input": "Approved draft and title.",
      "expected_output": "Live URL and timestamp.",
      "receives_from_user": false,
      "sends_to_user": true,
      "tools": ["calendar", "slack"]
    }
  }
}`;

export function Canvas({ projectId }: CanvasProps) {
  const [jsonInput, setJsonInput] = useState(exampleWorkflow);
  const [showJsonEditor, setShowJsonEditor] = useState(false);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Workflow Canvas</h2>
            <button
              onClick={() => setShowJsonEditor(!showJsonEditor)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              {showJsonEditor ? 'Hide JSON' : 'Edit JSON'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500">
              Export
            </button>
            <button className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50">
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* JSON Editor */}
      {showJsonEditor && (
        <div className="border-b border-gray-200 p-4 flex-shrink-0">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Workflow JSON:</label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm resize-none"
              placeholder="Enter your workflow JSON here..."
            />
          </div>
        </div>
      )}

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden">
        <WorkflowCanvas jsonContent={jsonInput} />
      </div>
    </div>
  )
}