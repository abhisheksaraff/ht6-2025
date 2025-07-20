import { useState } from 'react';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  quotedText?: string;
}

export function useMessageHandling() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'ai-placeholder',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      // For now, simulate a response since we don't have a backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        userMessage: { id: Date.now().toString(), content, role: 'user' as const },
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

  const addUserMessage = (text: string, quotedText?: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
      quotedText
    };
    setMessages(prev => [...prev, userMessage]);
  };

  const addAIMessage = (text: string) => {
    const aiMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, aiMessage]);
  };

  const addErrorMessage = () => {
    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Sorry, there was an error processing your request.',
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, errorMessage]);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    addUserMessage,
    addAIMessage,
    addErrorMessage
  };
} 