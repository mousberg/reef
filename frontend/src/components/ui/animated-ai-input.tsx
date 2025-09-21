"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"

export function AnimatedAIInput() {
  const [value, setValue] = useState("")
  const [selectedModel, setSelectedModel] = useState("GPT-4-1 Mini")
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { user, createProject } = useAuth()

  const AI_MODELS = [
    "o3-mini",
    "Gemini 2.5 Flash",
    "Claude 3.5 Sonnet",
    "GPT-4-1 Mini",
    "GPT-4-1",
  ]

  const handleSubmit = async () => {
    if (!value.trim()) return

    // Check if user is authenticated
    if (!user) {
      router.push("/auth")
      return
    }

    setIsCreating(true)
    try {
      // Create project in Firebase
      const projectId = await createProject(user.uid)
      
      // Navigate to project page with initial prompt
      router.push(`/projects/${projectId}?prompt=${encodeURIComponent(value)}`)
    } catch (error) {
      console.error("Failed to create project:", error)
      setIsCreating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const hasContent = value.trim().length > 0

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [value])

  // Maintain focus when layout changes
  useEffect(() => {
    if (hasContent && textareaRef.current) {
      // When transitioning to expanded layout, maintain focus
      const timeoutId = setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          // Position cursor at end
          const length = textareaRef.current.value.length
          textareaRef.current.setSelectionRange(length, length)
        }
      }, 0)

      return () => clearTimeout(timeoutId)
    }
  }, [hasContent])

  return (
    <div className="w-full max-w-[700px] lg:w-[700px] mx-auto py-6 px-4">
      <div className="bg-background/8 dark:bg-card/15 backdrop-blur-lg rounded-[32px] p-1.5 border border-border/15 shadow-2xl">
        <div className={`bg-background/25 dark:bg-card/30 backdrop-blur-md rounded-[28px] border border-border/20 ${hasContent ? 'p-3' : 'py-2 px-1'}`}>

          {/* When no content - compact single row */}
          {!hasContent && (
            <div className="flex items-center gap-2">
              <textarea
                key="main-textarea"
                ref={textareaRef}
                value={value}
                placeholder="Ask anything"
                className="flex-1 bg-transparent border-none outline-none resize-none text-[15px] text-foreground placeholder-muted-foreground min-w-0 py-2 px-2"
                rows={1}
                onKeyDown={handleKeyDown}
                onChange={(e) => setValue(e.target.value)}
                style={{
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}
              />

              <button
                className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors flex-shrink-0"
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>

              <button
                disabled={true}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-300 dark:border-gray-600 transition-colors mr-1"
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground">
                  <path d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z"></path>
                </svg>
              </button>
            </div>
          )}

          {/* When has content - expanded layout */}
          {hasContent && (
            <div className="flex flex-col gap-2">
              {/* Textarea */}
              <textarea
                key="main-textarea"
                ref={textareaRef}
                value={value}
                placeholder="Ask anything"
                className="w-full bg-transparent border-none outline-none resize-none text-[15px] text-foreground placeholder-muted-foreground px-2"
                rows={1}
                onKeyDown={handleKeyDown}
                onChange={(e) => setValue(e.target.value)}
                style={{
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}
              />

              {/* Bottom row with model selector and send button */}
              <div className="flex items-center justify-between">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="pl-3 pr-8 py-1.5 bg-secondary/50 hover:bg-secondary/70 border border-border/50 rounded-xl text-xs font-medium text-foreground cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='%23666' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '12px 12px'
                  }}
                >
                  {AI_MODELS.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleSubmit}
                  disabled={!hasContent || isCreating}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  type="button"
                >
                  {isCreating ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin text-primary-foreground">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-primary-foreground">
                      <path d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}