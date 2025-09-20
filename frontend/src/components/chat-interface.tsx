"use client"

import { useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useSearchParams } from "next/navigation"
import { useAuth, Message } from "../contexts/AuthContext"
import { WorkflowState } from "../lib/types"
import ChatPane from "./ChatPane"

// Utility function to recursively remove undefined values from objects
function removeUndefined(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj === undefined ? null : obj
  }

  if (Array.isArray(obj)) {
    return obj.map(removeUndefined).filter(item => item !== null)
  }

  const cleaned: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = removeUndefined(value)
    }
  }
  return cleaned
}

interface ChatInterfaceProps {
  projectId: string
  initialMessages?: Message[]
  projectName?: string
}

export function ChatInterface({ projectId, initialMessages = [], projectName }: ChatInterfaceProps) {
  const searchParams = useSearchParams()
  const initialPrompt = searchParams.get("prompt")
  const { user, updateProjectMessages, updateProjectName, updateProjectWorkflowState } = useAuth()

  // Convert Firebase messages to AI SDK v5 UI message format
  const convertedMessages = initialMessages.map(msg => ({
    id: msg.id,
    role: msg.role,
    parts: msg.parts || [{ type: 'text' as const, text: msg.content }], // Use parts if available, fallback to content
    createdAt: msg.createdAt instanceof Date ? msg.createdAt : msg.createdAt?.toDate?.() || new Date()
  }))

  const {
    messages,
    sendMessage,
    status,
    setMessages,
    addToolResult
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        projectId
      }
    }),
    messages: convertedMessages,
    async onToolCall({ toolCall }) {
      // Check if it's a dynamic tool first for proper type narrowing
      if (toolCall.dynamic) {
        return;
      }

      if (toolCall.toolName === 'updateWorkflowState') {
        try {
          if (user) {
            await updateProjectWorkflowState(user.uid, projectId, toolCall.input as WorkflowState)
            console.log('Workflow state updated:', toolCall.input)

            // Add tool result to indicate success
            addToolResult({
              tool: 'updateWorkflowState',
              toolCallId: toolCall.toolCallId,
              output: 'Workflow state updated successfully'
            })
          } else {
            addToolResult({
              tool: 'updateWorkflowState',
              toolCallId: toolCall.toolCallId,
              output: 'Error: User not authenticated'
            })
          }
        } catch (error) {
          console.error('Failed to update workflow state:', error)
          addToolResult({
            tool: 'updateWorkflowState',
            toolCallId: toolCall.toolCallId,
            output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          })
        }
      }
    },
    onFinish: async ({ messages: finishedMessages }) => {
      // Save complete conversation to Firebase after AI response is complete
      if (user) {
        try {
          // Convert all current UI messages to Firebase format (includes the AI response)
          const allFirebaseMessages: Message[] = finishedMessages.map(msg => ({
            id: msg.id || crypto.randomUUID(),
            role: msg.role,
            content: msg.parts?.find(part => part.type === 'text')?.text || '',
            createdAt: new Date(),
            parts: removeUndefined(msg.parts) // Clean undefined values before saving
          }))

          await updateProjectMessages(user.uid, projectId, allFirebaseMessages)
          console.log('Complete conversation saved to Firebase:', {
            totalMessages: allFirebaseMessages.length
          })
        } catch (error) {
          console.error('Failed to save complete conversation to Firebase:', error)
        }
      }
    }
  })

  // Add initial prompt as first message if provided
  useEffect(() => {
    if (initialPrompt && messages.length === 0) {
      setMessages([{
        id: crypto.randomUUID(),
        role: 'user',
        parts: [{ type: 'text' as const, text: initialPrompt }],
        createdAt: new Date()
      }])
    }
  }, [initialPrompt, messages.length, setMessages])

  // Debug status changes and message updates
  useEffect(() => {
    console.log('Chat status changed:', status)
  }, [status])


  // Create conversation object for ChatPane
  const conversation = {
    id: projectId,
    title: projectName || "Project Chat",
    updatedAt: messages.length > 0 ? messages[messages.length - 1].createdAt : new Date(),
    messageCount: messages.length,
    preview: messages.length > 0 ? messages[messages.length - 1].parts?.find(part => part.type === 'text')?.text?.slice(0, 80) || "No text content" : "No messages yet",
    pinned: false,
    folder: "Projects",
    messages: messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.parts?.find(part => part.type === 'text')?.text || '',
      createdAt: msg.createdAt,
      parts: msg.parts // Pass through the parts for reasoning content
    }))
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      parts: [{ type: 'text' as const, text: content }],
      createdAt: new Date()
    }

    // Save user message to Firebase immediately
    if (user) {
      try {
        // Get current messages and add the new user message
        const currentFirebaseMessages: Message[] = messages.map(msg => ({
          id: msg.id || crypto.randomUUID(),
          role: msg.role,
          content: msg.parts?.find(part => part.type === 'text')?.text || '',
          createdAt: new Date(),
          parts: removeUndefined(msg.parts) // Clean undefined values
        }))

        const newFirebaseMessage: Message = {
          id: userMessage.id,
          role: userMessage.role,
          content: content,
          createdAt: new Date(),
          parts: removeUndefined(userMessage.parts) // Clean undefined values
        }

        const updatedMessages = [...currentFirebaseMessages, newFirebaseMessage]
        await updateProjectMessages(user.uid, projectId, updatedMessages)
        console.log('User message saved to Firebase:', newFirebaseMessage)

        // If this is the first message and project has a default name, update it with message content
        if (currentFirebaseMessages.length === 0 && projectName?.startsWith('New Project')) {
          const newName = content.length > 50 ? content.substring(0, 50) + '...' : content
          await updateProjectName(user.uid, projectId, newName)
        }
      } catch (error) {
        console.error('Failed to save user message to Firebase:', error)
      }
    }

    // Send message using AI SDK v5 - this will trigger the API call and streaming
    await sendMessage(userMessage)
  }


  return (
    <ChatPane
      conversation={conversation}
      onSend={handleSendMessage}
      isThinking={status === 'submitted' || status === 'streaming'}
      onPauseThinking={() => {}}
    />
  )
}
