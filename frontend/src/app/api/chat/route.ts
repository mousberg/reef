import { streamText, convertToCoreMessages } from 'ai'
import { openai } from '@ai-sdk/openai'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

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
      system: 'You are a helpful AI assistant for building projects. Help users with their development tasks, provide code examples, and guide them through implementation steps.',
    })

    console.log('API Route - OpenAI stream created successfully')

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
