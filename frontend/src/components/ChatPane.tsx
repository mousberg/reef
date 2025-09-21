"use client"

import { useState, forwardRef, useImperativeHandle, useRef } from "react"
import { Square, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Message from "./Message"
import Composer, { ComposerRef } from "./Composer"
import { cls, timeAgo } from "../lib/utils"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Date | any
  parts?: Array<{ type: 'text' | 'reasoning' | string; text: string; state?: 'streaming' | 'done' }>
}

interface Conversation {
  id: string
  title: string
  updatedAt: Date | any
  messageCount?: number
  preview?: string
  pinned?: boolean
  folder?: string
  messages: ChatMessage[]
}

interface ChatPaneProps {
  conversation: Conversation
  onSend?: (message: string) => Promise<void> | void
  isThinking?: boolean
  onPauseThinking?: () => void
}

export interface ChatPaneRef {
  insertTemplate: (templateContent: string) => void
}

interface ThinkingMessageProps {
  onPause?: () => void
}

function ThinkingMessage({ onPause }: ThinkingMessageProps) {
  return (
    <Message role="assistant">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"></div>
        </div>
        <span className="text-sm text-zinc-500">AI is thinking...</span>
        <button
          onClick={onPause}
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Square className="h-3 w-3" /> Pause
        </button>
      </div>
    </Message>
  )
}

const ChatPane = forwardRef<ChatPaneRef, ChatPaneProps>(function ChatPane(
  { conversation, onSend, isThinking, onPauseThinking },
  ref,
) {
  const [busy, setBusy] = useState(false)
  const composerRef = useRef<ComposerRef>(null)
  const router = useRouter()

  useImperativeHandle(
    ref,
    () => ({
      insertTemplate: (templateContent: string) => {
        composerRef.current?.insertTemplate(templateContent)
      },
    }),
    [],
  )

  if (!conversation) return null

  const tags: string[] = []
  const messages = Array.isArray(conversation.messages) ? conversation.messages : []
  const count = messages.length || conversation.messageCount || 0

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mb-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/projects")}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
            title="Back to Projects"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-3xl tracking-tight sm:text-4xl md:text-5xl">
            <span className="block leading-[1.05] font-title text-2xl">{conversation.title}</span>
          </div>
        </div>
        <div className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Updated {timeAgo(conversation.updatedAt)}
        </div>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-zinc-200 pb-5 dark:border-zinc-800">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:text-zinc-200"
            >
              {t}
            </span>
          ))}
        </div>

        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No messages yet. Say hello to start.
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <Message key={m.id} role={m.role}>
                <div className="space-y-2">
                  {/* Render reasoning parts if they exist */}
                  {(m as any).parts?.filter((part: any) => part.type === 'reasoning').map((reasoningPart: any, index: number) => (
                    <div key={`reasoning-${index}`} className="text-sm text-zinc-600 dark:text-zinc-400 italic border-l-2 border-zinc-300 dark:border-zinc-600 pl-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {reasoningPart.state === 'streaming' ? (
                            <>
                              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400"></div>
                              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:0.2s]"></div>
                              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:0.4s]"></div>
                            </>
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-zinc-400"></div>
                          )}
                        </div>
                        <span className="text-xs font-medium">
                          {reasoningPart.state === 'streaming' ? 'Thinking...' : 'Reasoning'}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap text-xs leading-relaxed">{reasoningPart.text}</div>
                    </div>
                  ))}

                  {/* Render tool call parts */}
                  {(m as any).parts?.filter((part: any) => part.type === 'tool-call').map((toolCallPart: any, index: number) => (
                    <div key={`tool-call-${index}`} className="border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-2 bg-blue-50 dark:bg-blue-950/30">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Tool Call: {toolCallPart.toolName}</span>
                      </div>
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200">
                          View parameters
                        </summary>
                        <pre className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/50 rounded text-blue-900 dark:text-blue-100 overflow-x-auto">
{JSON.stringify(toolCallPart.input, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))}

                  {/* Render tool result parts */}
                  {(m as any).parts?.filter((part: any) => part.type === 'tool-result').map((toolResultPart: any, index: number) => (
                    <div key={`tool-result-${index}`} className="border border-green-200 dark:border-green-800 rounded-lg p-3 mb-2 bg-green-50 dark:bg-green-950/30">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">Tool Result: {toolResultPart.toolName}</span>
                      </div>
                      <details className="text-xs">
                        <summary className="cursor-pointer text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200">
                          View result
                        </summary>
                        <pre className="mt-2 p-2 bg-green-100 dark:bg-green-900/50 rounded text-green-900 dark:text-green-100 overflow-x-auto max-h-40 overflow-y-auto">
{typeof toolResultPart.output === 'string' ? toolResultPart.output : JSON.stringify(toolResultPart.output, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))}

                  {/* Render text parts */}
                  {(m as any).parts?.filter((part: any) => part.type === 'text').map((textPart: any, index: number) => (
                    <div key={`text-${index}`} className="whitespace-pre-wrap">{textPart.text}</div>
                  )) || <div className="whitespace-pre-wrap">{m.content}</div>}
                </div>
              </Message>
            ))}
            {isThinking && messages.length > 0 && !messages[messages.length - 1]?.parts?.some((part: any) => part.type === 'reasoning') && (
              <div key="thinking-wrapper">
                <ThinkingMessage onPause={onPauseThinking} />
              </div>
            )}
          </>
        )}
      </div>

      <Composer
        ref={composerRef}
        onSend={async (text) => {
          if (!text.trim()) return
          setBusy(true)
          try {
            await onSend?.(text)
          } finally {
            setBusy(false)
          }
        }}
        busy={busy || isThinking}
      />
    </div>
  )
})

export default ChatPane
