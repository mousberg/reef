"use client";

import {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import { Square, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Message from "./Message";
import Composer, { ComposerRef } from "./Composer";
import { timeAgo } from "../../lib/utils";
import { ToolCallRenderer, ToolResultRenderer } from "./ToolRenderer";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date | any;
  parts?: Array<{
    type: "text" | "reasoning" | "tool-call" | "tool-result";
    text?: string;
    toolCallId?: string;
    toolName?: string;
    input?: any;
    output?: any;
    state?: "streaming" | "done";
  }>;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: Date | any;
  messageCount?: number;
  preview?: string;
  pinned?: boolean;
  folder?: string;
  messages: ChatMessage[];
}

interface ChatPaneProps {
  conversation: Conversation;
  onSend?: (message: string) => Promise<void> | void;
  isThinking?: boolean;
  onPauseThinking?: () => void;
  tracesOpen?: boolean;
  onToggleTraces?: () => void;
}

export interface ChatPaneRef {
  insertTemplate: (templateContent: string) => void;
}

interface ThinkingMessageProps {
  onPause?: () => void;
  hasActiveTool?: boolean;
}

function ThinkingMessage({ onPause, hasActiveTool }: ThinkingMessageProps) {
  return (
    <Message role="assistant">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {hasActiveTool ? (
            <>
              <div className="h-2 w-2 animate-spin rounded-full border border-blue-400 border-t-transparent"></div>
            </>
          ) : (
            <>
              <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"></div>
            </>
          )}
        </div>
        <span className="text-sm text-zinc-500">
          {hasActiveTool ? "Working on your request..." : "AI is thinking..."}
        </span>
        <button
          onClick={onPause}
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Square className="h-3 w-3" /> Pause
        </button>
      </div>
    </Message>
  );
}

const ChatPane = forwardRef<ChatPaneRef, ChatPaneProps>(function ChatPane(
  { conversation, onSend, isThinking, onPauseThinking, onToggleTraces },
  ref,
) {
  const [busy, setBusy] = useState(false);
  const composerRef = useRef<ComposerRef>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useImperativeHandle(
    ref,
    () => ({
      insertTemplate: (templateContent: string) => {
        composerRef.current?.insertTemplate(templateContent);
      },
    }),
    [],
  );

  // Auto-scroll to bottom when messages change or when thinking
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [conversation.messages, isThinking]);

  if (!conversation) return null;

  const messages = Array.isArray(conversation.messages)
    ? conversation.messages
    : [];

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 px-4 py-6 sm:px-8 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        {/* Top row: Back button and Title */}
        <div className="flex items-center gap-3 mb-3">
          <button
            type="button"
            onClick={() => router.push("/projects")}
            className="flex-shrink-0 flex items-center gap-2 text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
            title="Back to Projects"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-title leading-tight truncate">
              {conversation.title}
            </h1>
          </div>
        </div>
        {/* Bottom row: Updated timestamp and Traces button */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Updated {timeAgo(conversation.updatedAt)}
          </div>
          <button
            type="button"
            onClick={onToggleTraces}
            className="flex-shrink-0 px-3 py-[6px] bg-white shadow-[0px_1px_2px_rgba(55,50,47,0.12)] hover:shadow-[0px_2px_4px_rgba(55,50,47,0.16)] overflow-hidden rounded-full flex justify-center items-center gap-2 transition-all dark:bg-zinc-800 dark:shadow-[0px_1px_2px_rgba(0,0,0,0.24)]"
          >
            <svg
              className="w-4 h-4 text-[#37322F] dark:text-zinc-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-[#37322F] dark:text-zinc-200 text-[13px] font-medium leading-5 font-sans">
              Traces
            </span>
          </button>
        </div>
      </div>

      {/* Scrollable Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-8 scroll-smooth"
      >
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
                  {(m as any).parts
                    ?.filter((part: any) => part.type === "reasoning")
                    .map((reasoningPart: any, index: number) => (
                      <div
                        key={`reasoning-${index}`}
                        className="text-sm text-zinc-600 dark:text-zinc-400 italic border-l-2 border-zinc-300 dark:border-zinc-600 pl-3 mb-3"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {reasoningPart.state === "streaming" ? (
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
                            {reasoningPart.state === "streaming"
                              ? "Thinking..."
                              : "Reasoning"}
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap text-xs leading-relaxed">
                          {reasoningPart.text}
                        </div>
                      </div>
                    ))}

                  {/* Render tool call parts */}
                  {(m as any).parts
                    ?.filter((part: any) => part.type === "tool-call")
                    .map((toolCallPart: any, index: number) => (
                      <ToolCallRenderer
                        key={`tool-call-${index}`}
                        toolName={toolCallPart.toolName}
                        input={toolCallPart.input}
                      />
                    ))}

                  {/* Render tool result parts */}
                  {(m as any).parts
                    ?.filter((part: any) => part.type === "tool-result")
                    .map((toolResultPart: any, index: number) => (
                      <ToolResultRenderer
                        key={`tool-result-${index}`}
                        toolName={toolResultPart.toolName}
                        output={toolResultPart.output}
                      />
                    ))}

                  {/* Render text parts */}
                  {(m as any).parts
                    ?.filter((part: any) => part.type === "text")
                    .map((textPart: any, index: number) => (
                      <div
                        key={`text-${index}`}
                        className="whitespace-pre-wrap"
                      >
                        {textPart.text}
                      </div>
                    )) || (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  )}
                </div>
              </Message>
            ))}
            {isThinking && (
              <div key="thinking-wrapper">
                {(() => {
                  // Check if the last message has an unfinished tool call (tool-call without matching tool-result)
                  const lastMessage = messages[messages.length - 1];
                  const hasActiveTool =
                    lastMessage?.parts?.some((part: any) => {
                      if (part.type === "tool-call") {
                        // Check if there's a corresponding tool-result for this tool call
                        const hasResult = lastMessage.parts?.some(
                          (resultPart: any) =>
                            resultPart.type === "tool-result" &&
                            resultPart.toolCallId === part.toolCallId,
                        );
                        return !hasResult; // Tool call without result means it's active
                      }
                      return false;
                    }) || false;

                  return (
                    <ThinkingMessage
                      onPause={onPauseThinking}
                      hasActiveTool={hasActiveTool}
                    />
                  );
                })()}
              </div>
            )}
          </>
        )}
      </div>

      <Composer
        ref={composerRef}
        onSend={async (text) => {
          if (!text.trim()) return;
          setBusy(true);
          try {
            await onSend?.(text);
          } finally {
            setBusy(false);
          }
        }}
        busy={busy || isThinking}
      />
    </div>
  );
});

export default ChatPane;
