"use client"

import { useState } from "react"
import { useAutoResizeTextarea } from "../../hooks/use-auto-resize-textarea"
import { Button } from "./button"

export function AnimatedAIInput() {
  const [value, setValue] = useState("")
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 72,
    maxHeight: 300,
  })
  const [selectedModel, setSelectedModel] = useState("GPT-4-1 Mini")

  const AI_MODELS = [
    "o3-mini",
    "Gemini 2.5 Flash", 
    "Claude 3.5 Sonnet",
    "GPT-4-1 Mini",
    "GPT-4-1",
  ]

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      // Handle send message
      console.log("Sending message:", value)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-4 px-4 min-w-0">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border border-white/20 shadow-lg min-w-0">
        <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/30 min-w-0">
          <textarea
            ref={textareaRef}
            value={value}
            placeholder="What can I do for you?"
            className="w-full p-4 bg-transparent border-none outline-none resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 min-w-0"
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setValue(e.target.value)
              adjustHeight()
            }}
          />
          
          <div className="flex items-center justify-between p-3 pt-0 min-w-0">
            <div className="flex items-center gap-2">
              {/* Model selector */}
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
              >
                {AI_MODELS.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              
              {/* File attachment button */}
              <Button variant="ghost" size="sm" className="p-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </Button>
            </div>
            
            {/* Send button */}
            <Button 
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={!value.trim()}
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