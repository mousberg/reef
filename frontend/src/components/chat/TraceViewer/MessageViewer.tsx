"use client";

import { ToolCallViewer } from "./ToolCallViewer";

interface Message {
  content?: string;
  role: string;
  tool_calls?: Array<{
    function: {
      arguments: string;
      name: string;
    };
    id: string;
    type: string;
  }>;
}

interface MessageViewerProps {
  messages: Message[];
  className?: string;
}

export function MessageViewer({
  messages,
  className = "",
}: MessageViewerProps) {
  if (!messages || messages.length === 0) {
    return null;
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "user":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        );
      case "assistant":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        );
      case "tool":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        );
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "user":
        return "text-blue-600 bg-blue-50";
      case "assistant":
        return "text-emerald-600 bg-emerald-50";
      case "tool":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-[#556B5D] bg-[#F7F5F3]";
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-[#2F3037] font-medium text-sm flex items-center gap-2">
        <svg
          className="w-4 h-4 text-[#556B5D]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        Conversation ({messages.length} messages)
      </h4>

      {messages.map((message, index) => (
        <div
          key={index}
          className="border border-[rgba(55,50,47,0.12)] rounded-lg p-3 bg-white/50"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1 rounded-full ${getRoleColor(message.role)}`}>
              {getRoleIcon(message.role)}
            </div>
            <span className="text-[#2F3037] font-medium text-sm capitalize">
              {message.role}
            </span>
          </div>

          {message.content && (
            <div className="text-[#2F3037] text-sm leading-relaxed mb-2 whitespace-pre-wrap">
              {message.content}
            </div>
          )}

          {message.tool_calls && message.tool_calls.length > 0 && (
            <ToolCallViewer toolCalls={message.tool_calls} className="mt-2" />
          )}
        </div>
      ))}
    </div>
  );
}
