import { streamText, tool, stepCountIs, NoSuchToolError, InvalidToolInputError, convertToModelMessages } from 'ai'
import { openai } from '@ai-sdk/openai'
import { NextRequest } from 'next/server'
import { z } from 'zod'


// Zod schema for WorkflowState validation
const workflowStateSchema = z.object({
  main_task: z.string().describe('The main task or goal of the workflow'),
  relations: z.string().describe('Description of how agents relate to each other'),
  agents: z.record(z.object({
    name: z.string().describe('The name of the agent'),
    task: z.string().describe('The specific task this agent performs'),
    instructions: z.string().describe('Detailed instructions for the agent'),
    connected_agents: z.array(z.string()).describe('Array of agent names this agent connects to'),
    expected_input: z.string().describe('What input this agent expects'),
    expected_output: z.string().describe('What output this agent produces'),
    receives_from_user: z.boolean().describe('Whether this agent receives input directly from users'),
    sends_to_user: z.boolean().describe('Whether this agent sends output directly to users'),
    tools: z.array(z.string()).describe('Array of tools this agent can use')
  })).describe('Record of agents keyed by agent name')
})

// Simple tool for updating workflow state - just returns success
const updateWorkflowTool = tool({
  description: 'Update the workflow state for a project with agents, their connections, and tools',
  inputSchema: z.object({
    userId: z.string().describe('The ID of the user who owns the project'),
    projectId: z.string().describe('The ID of the project to update'),
    workflowState: workflowStateSchema
  }),
  execute: async ({ userId, projectId, workflowState }) => {
    console.log('Tool called with:', { userId, projectId, workflowState })

    // Simple success response - Firestore update will happen client-side
    return {
      success: true,
      message: `Workflow created successfully for project ${projectId}`,
      agentCount: Object.keys(workflowState.agents).length
    }
  }
})

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json()
    console.log('API Route - Full request body:', JSON.stringify(requestBody, null, 2))

    const { messages, projectId, userId } = requestBody

    console.log('API Route - Extracted messages:', messages)
    console.log('API Route - Extracted projectId:', projectId)
    console.log('API Route - Extracted userId:', userId)

    if (!messages || !Array.isArray(messages)) {
      console.log('API Route - Messages validation failed:', { messages, isArray: Array.isArray(messages) })
      return new Response('Messages array is required', { status: 400 })
    }

    if (!projectId) {
      console.log('API Route - ProjectId validation failed:', { projectId })
      return new Response('Project ID is required', { status: 400 })
    }

    if (!userId) {
      console.log('API Route - UserId validation failed:', { userId })
      return new Response('User ID is required', { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response('OpenAI API key not configured', { status: 500 })
    }

    // Convert UI messages to model messages for AI SDK 5
    console.log('API Route - Converting UI messages to model messages...')
    console.log('API Route - Input messages:', JSON.stringify(messages, null, 2))

    const modelMessages = convertToModelMessages(messages)
    console.log('API Route - Converted model messages:', JSON.stringify(modelMessages, null, 2))

    // Stream the chat completion with multi-step tool calling
    console.log('API Route - Starting OpenAI stream with multi-step tool calls...')

    const result = await streamText({
      model: openai('gpt-5-nano'),
      messages: modelMessages,
      maxOutputTokens: 4000,
      system: `You are a helpful AI assistant for building workflow projects. You can help users design multi-agent workflows by creating and updating workflow states.

When users describe their workflow needs, use the updateWorkflow tool to create or modify their project workflow with appropriate agents, connections, and tools.

Current context:
- User ID: ${userId}
- Project ID: ${projectId}

IMPORTANT: When calling updateWorkflow, you MUST provide a complete workflowState object with ALL required fields:

Required structure:
{
  "userId": "${userId}",
  "projectId": "${projectId}",
  "workflowState": {
    "main_task": "Description of the overall workflow goal",
    "relations": "Description of how agents connect and interact",
    "agents": {
      "AgentName": {
        "name": "AgentName",
        "task": "What this agent does",
        "instructions": "Detailed instructions for the agent",
        "connected_agents": ["NextAgentName"],
        "expected_input": "What input this agent expects",
        "expected_output": "What output this agent produces",
        "receives_from_user": true/false,
        "sends_to_user": true/false,
        "tools": ["tool1", "tool2"]
      }
    }
  }
}

Example minimal workflow:
{
  "userId": "${userId}",
  "projectId": "${projectId}",
  "workflowState": {
    "main_task": "Simple content creation workflow",
    "relations": "Writer creates content, Reviewer checks it, Publisher posts it",
    "agents": {
      "Writer": {
        "name": "Writer",
        "task": "Create content",
        "instructions": "Write engaging content based on user requirements",
        "connected_agents": ["Reviewer"],
        "expected_input": "Content requirements and guidelines",
        "expected_output": "Draft content ready for review",
        "receives_from_user": true,
        "sends_to_user": false,
        "tools": ["notion", "grammarly"]
      },
      "Reviewer": {
        "name": "Reviewer",
        "task": "Review and edit content",
        "instructions": "Review content for quality, accuracy, and style",
        "connected_agents": ["Publisher"],
        "expected_input": "Draft content from Writer",
        "expected_output": "Reviewed and approved content",
        "receives_from_user": false,
        "sends_to_user": false,
        "tools": ["grammarly", "slack"]
      },
      "Publisher": {
        "name": "Publisher",
        "task": "Publish approved content",
        "instructions": "Publish content to appropriate channels",
        "connected_agents": [],
        "expected_input": "Approved content from Reviewer",
        "expected_output": "Published content with links",
        "receives_from_user": false,
        "sends_to_user": true,
        "tools": ["cms", "social-media"]
      }
    }
  }
}

Always include the complete agents object with all required fields for each agent.`,
      tools: {
        updateWorkflow: updateWorkflowTool
      },
      stopWhen: stepCountIs(5), // Allow up to 5 steps for multi-step tool calling
      onStepFinish: ({ text, toolCalls, toolResults, finishReason, usage }) => {
        console.log('API Route - Step finished:', {
          hasText: !!text,
          toolCallsCount: toolCalls.length,
          toolResultsCount: toolResults.length,
          finishReason,
          usage
        })

        // Log tool calls and results for debugging
        toolCalls.forEach((toolCall, index) => {
          console.log(`API Route - Tool call ${index}:`, {
            toolName: toolCall.toolName,
            input: toolCall.input
          })
        })

        toolResults.forEach((toolResult, index) => {
          console.log(`API Route - Tool result ${index}:`, {
            toolName: toolResult.toolName,
            hasOutput: !!toolResult.output,
            output: toolResult.output
          })
        })
      }
    })

    console.log('API Route - OpenAI stream created successfully')

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error('API Route - Tool execution error:', error)

        // Handle specific AI SDK errors
        if (NoSuchToolError.isInstance(error)) {
          return 'The model tried to call an unknown tool.';
        } else if (InvalidToolInputError.isInstance(error)) {
          return 'The model called a tool with invalid inputs.';
        } else {
          return 'An error occurred while processing your request.';
        }
      }
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
