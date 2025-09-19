"use client"

import React, { useState, useEffect } from "react"

interface Message {
  id: number
  text: string
  isBot: boolean
  timestamp: Date
}

const sampleMessages = [
  "How can I integrate AI agents into my workflow?",
  "What makes Reefs different from other platforms?",
  "Can you show me an example of building an agent?",
  "How does the deployment process work?",
]

export function AnimatedAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm here to help you learn about Reefs and AI agents. Ask me anything!",
      isBot: true,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentSampleIndex, setCurrentSampleIndex] = useState(0)
  const [placeholderText, setPlaceholderText] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSampleIndex((prev) => (prev + 1) % sampleMessages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const currentSample = sampleMessages[currentSampleIndex]
    let charIndex = 0
    setPlaceholderText("")

    const typingInterval = setInterval(() => {
      if (charIndex <= currentSample.length) {
        setPlaceholderText(currentSample.slice(0, charIndex))
        charIndex++
      } else {
        clearInterval(typingInterval)
      }
    }, 50)

    return () => clearInterval(typingInterval)
  }, [currentSampleIndex])

  const handleSend = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")
    setIsTyping(true)

    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: "Thanks for your question! Reefs makes it incredibly easy to build and deploy AI agents. Would you like to see a quick demo or learn more about our features?",
        isBot: true,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="bg-white/95 backdrop-blur-sm border border-[#37322f]/10 shadow-xl overflow-hidden rounded-lg">
        <div className="bg-gradient-to-r from-[#37322f] to-[#37322f]/80 p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🤖</span>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">AI Assistant</h3>
              <p className="text-white/80 text-sm">Powered by Reefs AI</p>
            </div>
          </div>
        </div>

        <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-[#f7f5f3]/30">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex transition-all duration-300 ${
                message.isBot ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`flex gap-2 max-w-[80%] ${
                  message.isBot ? "flex-row" : "flex-row-reverse"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.isBot
                      ? "bg-gradient-to-br from-[#37322f] to-[#37322f]/70"
                      : "bg-gradient-to-br from-blue-500 to-blue-600"
                  }`}
                >
                  {message.isBot ? (
                    <span className="text-white text-sm">🤖</span>
                  ) : (
                    <span className="text-white text-sm">👤</span>
                  )}
                </div>
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    message.isBot
                      ? "bg-white border border-[#37322f]/10 text-[#37322f]"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start transition-opacity duration-300">
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#37322f] to-[#37322f]/70 flex items-center justify-center">
                  <span className="text-white text-sm">🤖</span>
                </div>
                <div className="px-4 py-3 bg-white border border-[#37322f]/10 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#37322f]/60 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-[#37322f]/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-[#37322f]/60 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#37322f]/10 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholderText || "Ask about AI agents..."}
              className="flex-1 px-4 py-2 bg-[#f7f5f3]/50 border border-[#37322f]/10 rounded-lg focus:border-[#37322f]/30 focus:outline-none placeholder:text-[#37322f]/40"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-[#37322f] to-[#37322f]/80 hover:from-[#37322f]/90 hover:to-[#37322f]/70 text-white rounded-lg transition-all duration-200"
            >
              <span className="text-sm">→</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}