import { useState, useEffect, useRef } from 'react';
import { createStorage } from '../storage';
import type { IStorage, IContent } from '../storage';


export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  quotedText?: string;
}

export function useMessageHandling() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'ai-placeholder',
      content: 'Hi! I\'m Focus Fox. How can I help you today?',
      role: "assistant" as const,
      timestamp: new Date()
    }
  ]);

  const storage = useRef<IStorage | null>(null);

  // Initialize storage
  useEffect(() => {
    const initStorage = async () => {
      const storageInstance = await createStorage();
      storage.current = storageInstance;
    };
    initStorage();
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      // For now, simulate a response since we don't have a backend
      const response = await fetch('http://localhost:8787/api/content', {
        method: 'POST',
        body: JSON.stringify({ 
          role: 'user' as const,
          content: content
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateContent = async (id: string, role: 'user' | 'assistant' | undefined = undefined, content: string | undefined = undefined) => {
    const response = await fetch('http://localhost:8787/api/content', {
      method: 'PUT',
      body: JSON.stringify({
        id,
        role,
        content
      })
    });
    
    return await response.json();
  };

  const addUserMessage = (content: string, quotedText?: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
      quotedText
    };  

    setMessages(prev => [...prev, userMessage]);
  };



  const addAIMessage = (content: string) => {
    const aiMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "assistant",
      timestamp: new Date()
    };

    if (storage) {
      const storageContent: IContent = {
        id: aiMessage.id,
        content: aiMessage.content,
        role: aiMessage.role,
        ttl: 60 * 60 * 24,
        createdAt: aiMessage.timestamp.getSeconds(),
        expiresAt: aiMessage.timestamp.getSeconds() + 60 * 60 * 24
      };
      storage.current?.store([storageContent]);
    }

    setMessages(prev => [...prev, aiMessage]);
  };

  const addErrorMessage = () => {
    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: 'Sorry, there was an error processing your request.',
      role: "assistant",
      timestamp: new Date()
    };

    if (storage) {
      const storageContent: IContent = {
        id: errorMessage.id,
        content: errorMessage.content,
        role: errorMessage.role,
        ttl: 60 * 60 * 24,
        createdAt: errorMessage.timestamp.getSeconds(),
        expiresAt: errorMessage.timestamp.getSeconds() + 60 * 60 * 24
      };
      storage.current?.store([storageContent]);
    }
    
    setMessages(prev => [...prev, errorMessage]);
  };

  const addUserStorage = (userMessage: Message) => {
    const storageContent: IContent = {
      id: userMessage.id,
      content: userMessage.content,
      role: userMessage.role,
      ttl: 60 * 60 * 24,
      createdAt: userMessage.timestamp.getSeconds(),
      expiresAt: userMessage.timestamp.getSeconds() + 60 * 60 * 24
    };
    storage.current?.store([storageContent]);
  }

  return {
    messages,
    isLoading,
    sendMessage,
    addUserMessage,
    addAIMessage,
    addErrorMessage,
    setIsLoading,
    updateContent,
    addUserStorage
  };
} 