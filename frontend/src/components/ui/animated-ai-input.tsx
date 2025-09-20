"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAutoResizeTextarea } from "../../hooks/use-auto-resize-textarea"
import { Button } from "./button"

export function AnimatedAIInput() {
  const [value, setValue] = useState("")
  const router = useRouter()
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 120,
    maxHeight: 400,
  })
  const [selectedModel, setSelectedModel] = useState("GPT-4-1 Mini")

  const AI_MODELS = [
    "o3-mini",
    "Gemini 2.5 Flash", 
    "Claude 3.5 Sonnet",
    "GPT-4-1 Mini",
    "GPT-4-1",
  ]

  const handleSubmit = () => {
    if (!value.trim()) return
    
    // Generate unique project ID
    const projectId = crypto.randomUUID()
    
    // Navigate to project page with initial prompt
    router.push(`/projects/${projectId}?prompt=${encodeURIComponent(value)}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="w-full max-w-[700px] lg:w-[700px] mx-auto py-6 px-4 sm:px-6 md:px-8 lg:px-0 min-w-0">
      <div className="bg-white/15 backdrop-blur-lg rounded-3xl p-2 border border-white/25 shadow-2xl min-w-0">
        <div className="bg-white/45 dark:bg-gray-900/45 backdrop-blur-md rounded-2xl border border-white/35 dark:border-gray-700/35 min-w-0">
          <textarea
            ref={textareaRef}
            value={value}
            placeholder="Build a personal Uber booking agent"
            className="w-full p-6 text-lg bg-transparent border-none outline-none resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 min-w-0"
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setValue(e.target.value)
              adjustHeight()
            }}
          />
          
          <div className="flex items-center justify-between p-4 pt-0 min-w-0">
            <div className="flex items-center gap-2">
              {/* Model selector */}
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-4 py-2 text-base bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300"
              >
                {AI_MODELS.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              
              {/* File attachment button */}
              <Button variant="ghost" size="sm" className="p-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </Button>
            </div>
            
            {/* Send button */}
            <Button 
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
              disabled={!value.trim()}
              onClick={handleSubmit}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}