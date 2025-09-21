"use client"

import { useEffect, useState } from "react"
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
  const { user, updateProjectMessages, updateProjectName } = useAuth()
  const [tracesOpen, setTracesOpen] = useState(false)

  // Convert Firebase messages to AI SDK v5 UI message format
  const convertedMessages = initialMessages.map(msg => ({
    id: msg.id,
    role: msg.role,
    parts: [{ type: 'text' as const, text: msg.content }],
    createdAt: msg.createdAt instanceof Date ? msg.createdAt : msg.createdAt?.toDate?.() || new Date()
  }))

  const {
    messages,
    sendMessage,
    status,
    setMessages
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        projectId
      }
    }),
    messages: convertedMessages,
    onFinish: async ({ messages: finishedMessages }) => {
      // Save complete conversation to Firebase after AI response is complete
      if (user) {
        try {
          // Convert all current UI messages to Firebase format (includes the AI response)
          const allFirebaseMessages: Message[] = finishedMessages.map(msg => ({
            id: msg.id || crypto.randomUUID(),
            role: msg.role,
            content: msg.parts?.find(part => part.type === 'text')?.text || '',
            createdAt: new Date()
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

  useEffect(() => {
    console.log('Messages updated:', messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      parts: msg.parts,
      partsCount: msg.parts?.length,
      partsTypes: msg.parts?.map(p => p.type)
    })))
  }, [messages])

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
          createdAt: new Date()
        }))

        const newFirebaseMessage: Message = {
          id: userMessage.id,
          role: userMessage.role,
          content: content,
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


  return (
    <div className="relative h-full">
      {/* Traces Toggle Button */}
      <button
        type="button"
        onClick={() => setTracesOpen(!tracesOpen)}
        className="absolute top-4 right-4 px-3 py-[6px] bg-white shadow-[0px_1px_2px_rgba(55,50,47,0.12)] hover:shadow-[0px_2px_4px_rgba(55,50,47,0.16)] overflow-hidden rounded-full flex justify-center items-center gap-2 transition-all z-10"
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
      />
      
      {/* Traces Panel */}
      <TracesPanel isOpen={tracesOpen} onClose={() => setTracesOpen(false)} />
      
      {/* ElevenLabs AI Assistant Widget */}
      <elevenlabs-convai agent-id="agent_3101k5p8y1r2e25bn1bb4rjpx932"></elevenlabs-convai>
      <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
    </div>
  )
}
