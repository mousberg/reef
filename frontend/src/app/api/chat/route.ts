import { streamText, tool, stepCountIs, NoSuchToolError, InvalidToolInputError, convertToModelMessages } from 'ai'
import { openai } from '@ai-sdk/openai'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getSystemPrompt } from '../../../lib/system-prompt'


// Zod schema for WorkflowState validation
const workflowStateSchema = z.object({
  main_task: z.string().describe('The main task or goal of the workflow'),
  relations: z.string().describe('Description of how agents interact and pass data'),
  agents: z.array(z.object({
    name: z.string().describe('The name of the agent NO WHITESPACE + NO SPECIAL CHARACTERS, just place "agent_name"'),
    description: z.string().describe('How the agent identifies itself to other agents'),
    task: z.string().describe('The task / goal the agent is trying to achieve'),
    expected_input: z.string().describe('What does the agent need to receive'),
    expected_output: z.string().describe('What does the agent need to output'),
    tools: z.array(z.string()).describe('Array of tools this agent can use')
  })).describe('Array of agents in the workflow')
})

// Simple tool for updating workflow state - just returns success
const createUpdateWorkflowTool = (userId: string, projectId: string) => tool({
  description: 'Update the workflow state for a project with agents, their connections, and tools',
  inputSchema: z.object({
    workflowState: workflowStateSchema
  }),
  execute: async ({ workflowState }) => {
    console.log('Tool called with:', { userId, projectId, workflowState })

    // Simple success response - Firestore update will happen client-side
    return {
      success: true,
      message: `Workflow created successfully edited`,
      agentCount: workflowState.agents.length
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
      model: openai('gpt-4.1'),
      messages: modelMessages,
      maxOutputTokens: 4000,
      system: getSystemPrompt(userId, projectId),
      tools: {
        updateWorkflow: createUpdateWorkflowTool(userId, projectId)
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
