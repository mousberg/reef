import { RefAttributes } from 'react'

export interface ChatPaneProps {
  conversation: {
    id: string
    title: string
    updatedAt: any
    messageCount: number
    preview: string
    pinned: boolean
    folder: string
    messages: Array<{
      id: string
      role: 'user' | 'assistant'
      content: string
      createdAt: any
    }>
  }
  onSend: (content: string) => Promise<void>
  isThinking: boolean
  onPauseThinking: () => void
}

export interface ChatPaneRef {
  insertTemplate: (templateContent: string) => void
}

declare const ChatPane: React.ForwardRefExoticComponent<ChatPaneProps & RefAttributes<ChatPaneRef>>

export default ChatPane