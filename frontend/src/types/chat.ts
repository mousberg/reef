export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string | Date;
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  messages: ChatMessage[];
  messageCount?: number;
  tags?: string[];
  status?: "active" | "archived" | "deleted";
}

export interface ChatAction {
  id?: string;
  label: string;
  icon?: React.ComponentType<any>;
  badge?: string;
  action: () => void | Promise<void>;
  disabled?: boolean;
  variant?: "default" | "primary" | "danger";
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface ChatSession {
  id: string;
  conversationId: string;
  userId: string;
  startedAt: string | Date;
  endedAt?: string | Date;
  context?: Record<string, any>;
}
