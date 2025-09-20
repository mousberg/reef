"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import ChatPane from "./ChatPane"

interface ChatInterfaceProps {
  projectId: string
}

export function ChatInterface({ projectId }: ChatInterfaceProps) {
  const searchParams = useSearchParams()
  const initialPrompt = searchParams.get("prompt")
  
  const [conversation, setConversation] = useState(() => {
    const now = new Date().toISOString()
    const messages = []
    
    // If there's an initial prompt, add it as the first user message
    if (initialPrompt) {
      messages.push({
        id: crypto.randomUUID(),
        role: "user",
        content: initialPrompt,
        createdAt: now
      })
      
      // Add hardcoded AI response
      // TODO: Replace with actual AI API call
      messages.push({
        id: crypto.randomUUID(),
        role: "assistant", 
        content: "I understand you want to work on: \"" + initialPrompt + "\". I'm here to help you build this step by step. What would you like to start with first?",
        createdAt: now
      })
    }
    
    return {
      id: projectId,
      title: initialPrompt ? `Project: ${initialPrompt.slice(0, 50)}...` : "New Project",
      updatedAt: now,
      messageCount: messages.length,
      preview: initialPrompt || "New project chat",
      pinned: false,
      folder: "Projects",
      messages
    }
  })

  const [isThinking, setIsThinking] = useState(false)

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const now = new Date().toISOString()
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content,
      createdAt: now
    }

    // Add user message
    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      updatedAt: now,
      messageCount: prev.messageCount + 1,
      preview: content.slice(0, 80)
    }))

    // Show thinking state
    setIsThinking(true)

    // Simulate AI response delay
    setTimeout(() => {
      // TODO: Replace with actual AI API call
      const aiResponse = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: "Thanks for your message! I'm a hardcoded response for now. In the future, I'll be replaced with actual AI API calls to provide intelligent responses to help you build your project.",
        createdAt: new Date().toISOString()
      }

      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, aiResponse],
        updatedAt: aiResponse.createdAt,
        messageCount: prev.messageCount + 1,
        preview: aiResponse.content.slice(0, 80)
      }))

      setIsThinking(false)
    }, 2000)
  }

  const handleEditMessage = (messageId: string, newContent: string) => {
    const now = new Date().toISOString()
    setConversation(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent, editedAt: now }
          : msg
      ),
      updatedAt: now
    }))
  }

  const handleResendMessage = (messageId: string) => {
    const message = conversation.messages.find(msg => msg.id === messageId)
    if (message) {
      handleSendMessage(message.content)
    }
  }

  return (
    <ChatPane
      conversation={conversation}
      onSend={handleSendMessage}
      onEditMessage={handleEditMessage}
      onResendMessage={handleResendMessage}
      isThinking={isThinking}
      onPauseThinking={() => setIsThinking(false)}
    />
  )
}