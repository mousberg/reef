"use client"

import { useState } from 'react';
import { WorkflowCanvas } from './workflow/workflow-canvas';

interface CanvasProps {
  projectId: string
}

const exampleWorkflow = `workflow:
  main_task: "Process customer support ticket and generate response"
  relations: "Interface agent receives user input, routes to analysis agent, then to response agent, and back to interface for user delivery"
  agents:
    interface_agent:
      name: "Interface Agent"
      task: "Handle user interactions and route requests"
      instructions: "Receive user input, validate format, route to appropriate agent"
      connected_agents:
        - analysis_agent
      expected_input: "Customer support ticket text"
      expected_output: "Processed ticket with metadata"
      receives_from_user: true
      sends_to_user: false
      tools:
        - input_validator
        - router
        - formatter
    
    analysis_agent:
      name: "Analysis Agent"
      task: "Analyze ticket content and classify issues"
      instructions: "Parse ticket content, extract key information, classify issue type"
      connected_agents:
        - response_agent
      expected_input: "Raw ticket data with metadata"
      expected_output: "Analyzed ticket with classification"
      receives_from_user: false
      sends_to_user: false
      tools:
        - text_analyzer
        - classifier
        - entity_extractor
    
    response_agent:
      name: "Response Agent"
      task: "Generate appropriate response based on analysis"
      instructions: "Create response using analysis results and knowledge base"
      connected_agents:
        - interface_agent
      expected_input: "Classified ticket with extracted entities"
      expected_output: "Generated response text"
      receives_from_user: false
      sends_to_user: true
      tools:
        - knowledge_base
        - response_generator
        - quality_checker`;

export function Canvas({ projectId }: CanvasProps) {
  const [yamlInput, setYamlInput] = useState(exampleWorkflow);
  const [showYamlEditor, setShowYamlEditor] = useState(false);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Workflow Canvas</h2>
            <button
              onClick={() => setShowYamlEditor(!showYamlEditor)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              {showYamlEditor ? 'Hide YAML' : 'Edit YAML'}
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

      {/* YAML Editor */}
      {showYamlEditor && (
        <div className="border-b border-gray-200 p-4 flex-shrink-0">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Workflow YAML:</label>
            <textarea
              value={yamlInput}
              onChange={(e) => setYamlInput(e.target.value)}
              className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm resize-none"
              placeholder="Enter your workflow YAML here..."
            />
          </div>
        </div>
      )}

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden">
        <WorkflowCanvas yamlContent={yamlInput} />
      </div>
    </div>
  )
}