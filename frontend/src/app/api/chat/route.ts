import { streamText, convertToCoreMessages } from 'ai'
import { openai } from '@ai-sdk/openai'
import { NextRequest } from 'next/server'
import { z } from 'zod'

export const runtime = 'edge'

// Zod schemas for WorkflowState
const AgentSchema = z.object({
  name: z.string(),
  task: z.string(),
  instructions: z.string(),
  connected_agents: z.array(z.string()),
  expected_input: z.string(),
  expected_output: z.string(),
  receives_from_user: z.boolean(),
  sends_to_user: z.boolean(),
  tools: z.array(z.string())
})

const WorkflowStateSchema = z.object({
  main_task: z.string(),
  relations: z.string(),
  agents: z.record(z.string(), AgentSchema).default({})
})

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json()
    console.log('API Route - Full request body:', JSON.stringify(requestBody, null, 2))

    const { messages, projectId } = requestBody

    console.log('API Route - Extracted messages:', messages)
    console.log('API Route - Extracted projectId:', projectId)

    if (!messages || !Array.isArray(messages)) {
      console.log('API Route - Messages validation failed:', { messages, isArray: Array.isArray(messages) })
      return new Response('Messages array is required', { status: 400 })
    }

    if (!projectId) {
      console.log('API Route - ProjectId validation failed:', { projectId })
      return new Response('Project ID is required', { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response('OpenAI API key not configured', { status: 500 })
    }

    // Convert UI messages to core messages for the model
    console.log('API Route - Converting messages to core format...')
    const coreMessages = convertToCoreMessages(messages)
    console.log('API Route - Core messages:', JSON.stringify(coreMessages, null, 2))

    // Stream the chat completion
    console.log('API Route - Starting OpenAI stream...')
    const result = await streamText({
      model: openai('gpt-5-nano'),
      messages: coreMessages,
      maxOutputTokens: 4000,
      system: 'You are a helpful AI assistant for building projects. Help users with their development tasks, provide code examples, and guide them through implementation steps. When users ask you to create or modify workflows, agents, or project structure, use the updateWorkflowState tool to make those changes.',
      tools: {
        updateWorkflowState: {
          description: 'Update the complete workflow state for a project. Include agents as key-value pairs where each agent represents a distinct role or task in the workflow. Agents should have unique names as keys and define their specific responsibilities, inputs, outputs, and connections. If no specific agents are needed for the task, agents can be empty.',
          inputSchema: WorkflowStateSchema,
        }
      }
    })

    console.log('API Route - OpenAI stream created successfully')

    return result.toUIMessageStreamResponse({
      sendReasoning: true,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
