"use client"

import { useState, forwardRef, useImperativeHandle, useRef } from "react"
import { Square } from "lucide-react"
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
        <div className="mb-2 text-3xl tracking-tight sm:text-4xl md:text-5xl">
          <span className="block leading-[1.05] font-title text-2xl">{conversation.title}</span>
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
