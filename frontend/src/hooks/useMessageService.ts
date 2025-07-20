import { useState } from 'react';
import { createStorage } from '../storage';

export function useMessageService() {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      
      // Send to backend
      const response = await fetch('http://localhost:8787/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'user',
          content: content,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Store in local storage
      const storage = await createStorage();
      const currentTime = Math.floor(Date.now() / 1000);
      const userMessage = {
        id: result.id || Date.now().toString(),
        content: content,
        role: 'user' as const,
        ttl: result.ttl || 3600,
        createdAt: currentTime,
        expiresAt: currentTime + (result.ttl || 3600),
      };
      
      await storage.store([userMessage]);
      
      return {
        userMessage: { id: userMessage.id, content, role: 'user' as const },
        assistantMessage: { 
          id: (Date.now() + 1).toString(), 
          content: 'This is a simulated response. The backend API is not yet connected.', 
          role: 'assistant' as const 
        },
        conversationId: undefined
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    sendMessage
  };
} 