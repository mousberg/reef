"use client"

import { useEffect, useState, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useSearchParams } from "next/navigation"
import { useAuth, Message } from "../contexts/AuthContext"
import ChatPane from "./ChatPane"
import { TracesPanel } from "./TracesPanel"

interface ChatInterfaceProps {
  projectId: string
  initialMessages?: Message[]
  projectName?: string
}

export function ChatInterface({ projectId, initialMessages = [], projectName }: ChatInterfaceProps) {
  const searchParams = useSearchParams()
  const initialPrompt = searchParams.get("prompt")
  const { user, updateProjectMessages, updateProjectName, updateProjectWorkflow } = useAuth()
  const [tracesOpen, setTracesOpen] = useState(false)
  const initialPromptSentRef = useRef(false)

  // Convert Firebase messages to AI SDK v5 UI message format (simplified for AI SDK compatibility)
  const convertedMessages = initialMessages
    .filter(msg => msg.role !== 'tool') // Filter out tool messages for AI SDK
    .map(msg => {
      // Only include text parts for AI SDK compatibility
      const textParts = msg.parts && msg.parts.length > 0
        ? msg.parts
            .filter(part => part.type === 'text')
            .map(part => ({
              type: 'text' as const,
              text: part.text || ''
            }))
        : [{ type: 'text' as const, text: msg.content || '' }]

      return {
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        parts: textParts
      }
    })

  const {
    messages,
    sendMessage,
    status,
    setMessages
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        projectId,
        userId: user?.uid
      }
    }),
    messages: convertedMessages,
    onFinish: async ({ messages: finishedMessages }) => {
      // Save complete conversation to Firebase after AI response is complete
      if (user) {
        try {
          console.log('AI SDK onFinish - finishedMessages:', finishedMessages.length)

          // IMPORTANT: Check for updateWorkflow tool calls BEFORE converting to Firebase format
          // This ensures we catch tool calls in their original structured format
          for (const message of finishedMessages) {
            console.log('Processing message:', {
              role: message.role,
              id: message.id,
              partsCount: message.parts?.length || 0
            })

            if (message.role === 'assistant' && message.parts) {
              for (const part of message.parts) {
                // Check if this is a tool call part (type assertion needed due to AI SDK types)
                const partAny = part as any
                console.log('Checking part:', {
                  type: partAny.type,
                  toolName: partAny.toolName,
                  hasInput: !!partAny.input,
                  keys: Object.keys(partAny)
                })

                if (partAny.type === 'tool-updateWorkflow') {
                  console.log('Found updateWorkflow tool call:', {
                    type: partAny.type,
                    hasInput: !!partAny.input,
                    hasWorkflowState: !!(partAny.input && partAny.input.workflowState),
                    inputKeys: partAny.input ? Object.keys(partAny.input) : []
                  })

                  if (partAny.input && partAny.input.workflowState) {
                    try {
                      console.log('Calling updateProjectWorkflow with:', {
                        userId: user.uid,
                        projectId: projectId,
                        workflowStateAgents: partAny.input.workflowState.agents?.length || 0
                      })
                      await updateProjectWorkflow(user.uid, projectId, partAny.input.workflowState)
                      console.log('Workflow updated in Firestore successfully!')
                    } catch (error) {
                      console.error('Failed to update workflow in Firestore:', error)
                    }
                  } else {
                    console.log('Missing workflowState in tool call input')
                  }
                }
              }
            }
          }

          // For AI SDK 5, finishedMessages contains all messages including tool calls/results
          const messagesToSave = finishedMessages

          // Convert AI SDK messages to Firebase format
          const allFirebaseMessages: Message[] = messagesToSave.map((msg: any) => {
            // Convert AI SDK message parts to Firebase format, handling different part types
            const parts = msg.parts?.map((part: any) => {
              // Handle different AI SDK part types - only keep parts we want to store
              if (part.type === 'text') {
                return {
                  type: 'text' as const,
                  text: (part as any).text
                }
              } else if (part.type === 'tool-call') {
                return {
                  type: 'tool-call' as const,
                  toolCallId: (part as any).toolCallId,
                  toolName: (part as any).toolName,
                  input: (part as any).input
                }
              } else if (part.type === 'tool-updateWorkflow') {
                // Handle the specific tool-updateWorkflow type from AI SDK
                return {
                  type: 'tool-call' as const,
                  toolCallId: (part as any).toolCallId || crypto.randomUUID(),
                  toolName: 'updateWorkflow',
                  input: (part as any).input
                }
              } else if (part.type === 'tool-result') {
                return {
                  type: 'tool-result' as const,
                  toolCallId: (part as any).toolCallId,
                  toolName: (part as any).toolName,
                  result: (part as any).output // Note: AI SDK uses 'output', we store as 'result'
                }
              } else if (part.type === 'reasoning' && part.text && part.text.trim()) {
                // Only include reasoning if it has actual text content
                return {
                  type: 'reasoning' as const,
                  text: (part as any).text
                }
              } else {
                // Filter out any other part types (step-start, etc.) - return null to exclude them
                return null
              }
            }).filter((part: any): part is NonNullable<typeof part> => part !== null) || []

            // Determine role, mapping AI SDK roles to Firebase roles
            const role: 'user' | 'assistant' | 'tool' = msg.role as any

            return {
              id: msg.id || crypto.randomUUID(),
              role,
              content: msg.parts?.find((part: any) => part.type === 'text')?.text || '',
              parts,
              createdAt: new Date()
            }
          })

          await updateProjectMessages(user.uid, projectId, allFirebaseMessages)
          console.log('Complete conversation with tool calls saved to Firebase:', {
            totalMessages: allFirebaseMessages.length,
            messagesWithParts: allFirebaseMessages.filter(msg => msg.parts && msg.parts.length > 0).length,
            toolCallCount: allFirebaseMessages.filter(msg =>
              msg.parts?.some(part => part.type === 'tool-call')
            ).length,
            toolResultCount: allFirebaseMessages.filter(msg =>
              msg.parts?.some(part => part.type === 'tool-result')
            ).length
          })
        } catch (error) {
          console.error('Failed to save complete conversation to Firebase:', error)
        }
      }
    }
  })

  // Define handleSendMessage early so it can be used in useEffect
  const handleSendMessage = async (content: string) => {
    // Prevent sending empty messages or messages with only whitespace
    if (!content || !content.trim() || content.trim().length === 0) return

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
        const currentFirebaseMessages: Message[] = messages.map(msg => {
          const parts = msg.parts?.map((part: any) => {
            // Handle AI SDK parts properly - only keep parts we want to store
            if (part.type === 'text') {
              return {
                type: 'text' as const,
                text: (part as any).text || ''
              }
            } else if (part.type === 'tool-call') {
              return {
                type: 'tool-call' as const,
                toolCallId: (part as any).toolCallId,
                toolName: (part as any).toolName,
                input: (part as any).input
              }
            } else if (part.type === 'tool-updateWorkflow') {
              // Handle the specific tool-updateWorkflow type from AI SDK
              return {
                type: 'tool-call' as const,
                toolCallId: (part as any).toolCallId || crypto.randomUUID(),
                toolName: 'updateWorkflow',
                input: (part as any).input
              }
            } else if (part.type === 'tool-result') {
              return {
                type: 'tool-result' as const,
                toolCallId: (part as any).toolCallId,
                toolName: (part as any).toolName,
                result: (part as any).output || (part as any).result
              }
            } else if (part.type === 'reasoning' && part.text && part.text.trim()) {
              return {
                type: 'reasoning' as const,
                text: (part as any).text
              }
            } else {
              // Filter out any other part types - return null to exclude them
              return null
            }
          }).filter((part): part is NonNullable<typeof part> => part !== null) || []

          return {
            id: msg.id || crypto.randomUUID(),
            role: msg.role as 'user' | 'assistant', // Type assertion for Firebase
            content: msg.parts?.find(part => part.type === 'text')?.text || '',
            parts,
            createdAt: new Date()
          }
        })

        const newFirebaseMessage: Message = {
          id: userMessage.id,
          role: userMessage.role,
          content: content,
          parts: [{ type: 'text', text: content }],
          createdAt: new Date()
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

  // Send initial prompt as first message if provided
  useEffect(() => {
    if (initialPrompt && !initialPromptSentRef.current && messages.length === 0) {
      initialPromptSentRef.current = true
      // Send the initial prompt as a message to trigger AI response
      handleSendMessage(initialPrompt)
    }
  }, [initialPrompt, handleSendMessage, messages.length])

  // Debug status changes and message updates
  useEffect(() => {
    console.log('Chat status changed:', status)
  }, [status])


  // Normalize parts data for consistent rendering - only keep parts we want to display
  const normalizePart = (part: any) => {
    // Only process parts we want to render in the UI
    if (part.type === 'text') {
      return {
        type: 'text' as const,
        text: part.text || '',
        state: 'done' as const
      }
    } else if (part.type === 'tool-call') {
      return {
        type: 'tool-call' as const,
        toolCallId: part.toolCallId,
        toolName: part.toolName,
        input: part.input,
        state: 'done' as const
      }
    } else if (part.type === 'tool-updateWorkflow') {
      // Handle the specific tool-updateWorkflow type from AI SDK
      return {
        type: 'tool-call' as const,
        toolCallId: part.toolCallId || crypto.randomUUID(),
        toolName: 'updateWorkflow',
        input: part.input,
        state: 'done' as const
      }
    } else if (part.type === 'tool-result') {
      return {
        type: 'tool-result' as const,
        toolCallId: part.toolCallId,
        toolName: part.toolName,
        output: part.result || part.output, // Handle both Firebase and AI SDK properties
        state: 'done' as const
      }
    } else if (part.type === 'reasoning' && part.text && part.text.trim()) {
      // Only include reasoning if it has actual text content
      return {
        type: 'reasoning' as const,
        text: part.text,
        state: 'done' as const
      }
    }

    // Filter out any other part types (step-start, etc.) - return null to exclude them
    return null
  }

  // Helper function to check if a message has meaningful content
  const hasContent = (msg: any) => {
    // Check if the main content is not empty/whitespace
    const mainContent = msg.content?.trim()
    if (mainContent && mainContent.length > 0) return true
    
    // Check if any text parts have meaningful content
    const hasTextContent = msg.parts?.some((part: any) => 
      part?.type === 'text' && part?.text?.trim() && part.text.trim().length > 0
    )
    if (hasTextContent) return true
    
    // Check if it has non-text parts (tool calls, reasoning, etc.)
    const hasNonTextParts = msg.parts?.some((part: any) => 
      part?.type && part.type !== 'text'
    )
    if (hasNonTextParts) return true
    
    return false
  }

  // Create conversation object for ChatPane using normalized data
  const allMessages = [
    // Firebase messages (already have correct structure)
    ...initialMessages.map(msg => ({
      ...msg,
      parts: msg.parts?.map(normalizePart).filter((part): part is NonNullable<typeof part> => part !== null) || []
    })),
    // AI SDK messages (need normalization)
    ...messages.slice(initialMessages.length).map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.parts?.find(part => part.type === 'text')?.text || '',
      createdAt: new Date(),
      parts: msg.parts?.map(normalizePart).filter((part): part is NonNullable<typeof part> => part !== null) || []
    }))
  ].filter(hasContent) // Filter out empty messages

  const conversation = {
    id: projectId,
    title: projectName || "Project Chat",
    updatedAt: allMessages.length > 0 ? new Date() : new Date(),
    messageCount: allMessages.length,
    preview: allMessages.length > 0 ?
      allMessages[allMessages.length - 1].parts?.find(part => part.type === 'text')?.text?.slice(0, 80) ||
      allMessages[allMessages.length - 1].content?.slice(0, 80) || "No text content"
      : "No messages yet",
    pinned: false,
    folder: "Projects",
    messages: allMessages.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content || msg.parts?.find(part => part.type === 'text')?.text || '',
      createdAt: msg.createdAt instanceof Date ? msg.createdAt : msg.createdAt?.toDate?.() || new Date(),
      parts: msg.parts || []
    })).filter(hasContent) // Filter out empty messages from conversation as well
  }

  return (
    <div className="relative h-full">
      {/* Traces Toggle Button */}
      <button
        type="button"
        onClick={() => setTracesOpen(!tracesOpen)}
        className="absolute top-4 right-4 px-3 py-[6px] bg-white shadow-[0px_1px_2px_rgba(55,50,47,0.12)] hover:shadow-[0px_2px_4px_rgba(55,50,47,0.16)] overflow-hidden rounded-full flex justify-center items-center gap-2 transition-all z-10 cursor-pointer"
      >
        <svg className="w-4 h-4 text-[#37322F]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-[#37322F] text-[13px] font-medium leading-5 font-sans">
          Traces
        </span>
      </button>

      <ChatPane
        conversation={conversation}
        onSend={handleSendMessage}
        isThinking={status === 'submitted' || status === 'streaming'}
        onPauseThinking={() => {}}
        tracesOpen={tracesOpen}
      />

      {/* Traces Panel */}
      <TracesPanel isOpen={tracesOpen} onClose={() => setTracesOpen(false)} />

      {/* ElevenLabs AI Assistant Widget */}
      <elevenlabs-convai agent-id="agent_3101k5p8y1r2e25bn1bb4rjpx932"></elevenlabs-convai>
      <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
    </div>
  )
}
