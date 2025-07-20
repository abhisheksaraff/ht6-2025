import { apiClient } from './client';
import type { 
  Message, 
  SendMessageRequest, 
  SendMessageResponse, 
  Conversation 
} from './types';

// Message API functions
export const messageApi = {
  // Send a message to the backend
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    return apiClient.post<SendMessageResponse>('/messages', request);
  },

  // Get conversation history
  async getConversation(conversationId: string): Promise<Conversation> {
    return apiClient.get<Conversation>(`/conversations/${conversationId}`);
  },

  // Get all conversations
  async getConversations(): Promise<Conversation[]> {
    return apiClient.get<Conversation[]>('/conversations');
  },

  // Create a new conversation
  async createConversation(): Promise<Conversation> {
    return apiClient.post<Conversation>('/conversations', {});
  },

  // Update conversation
  async updateConversation(
    conversationId: string, 
    data: Partial<Conversation>
  ): Promise<Conversation> {
    return apiClient.put<Conversation>(`/conversations/${conversationId}`, data);
  },

  // Delete conversation
  async deleteConversation(conversationId: string): Promise<void> {
    return apiClient.delete<void>(`/conversations/${conversationId}`);
  },
};

// Content extraction API functions
export const contentApi = {
  // Send page content to backend for processing
  async sendContent(content: {
    textContent: string;
    title: string;
    url: string;
    domain: string;
    excerpt: string;
    timestamp: string;
  }): Promise<{ id: string; processed: boolean }> {
    return apiClient.post<{ id: string; processed: boolean }>('/content', content);
  },

  // Get processed content
  async getContent(contentId: string): Promise<{
    id: string;
    content: string;
    summary: string;
    processed: boolean;
  }> {
    return apiClient.get<{
      id: string;
      content: string;
      summary: string;
      processed: boolean;
    }>(`/content/${contentId}`);
  },
};

// Utility function to create a message object
export const createMessage = (
  content: string,
  role: 'user' | 'assistant' | 'system'
): Message => ({
  id: Date.now().toString(),
  content,
  role,
  timestamp: new Date().toISOString(),
});

// Utility function to create a send message request
export const createSendMessageRequest = (
  content: string
): SendMessageRequest => ({
  content,
  url: window.location.href,
  domain: window.location.hostname,
}); 