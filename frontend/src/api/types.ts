export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
}

export interface SendMessageRequest {
  content: string;
  url?: string;
  domain?: string;
}

export interface SendMessageResponse {
  id: string;
  content: string;
  role: 'assistant';
  timestamp: string;
}

export interface Conversation {
  id: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface BackendConfig {
  baseUrl: string;
  timeout?: number;
} 