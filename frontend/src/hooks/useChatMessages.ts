import { useState } from 'react';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'ai-placeholder',
      text: 'Hello, how can I help you?',
      isUser: false,
      timestamp: new Date()
    }
  ]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    };
    addMessage(userMessage);
  };

  const addAIMessage = (text: string) => {
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text,
      isUser: false,
      timestamp: new Date()
    };
    addMessage(aiMessage);
  };

  const addErrorMessage = () => {
    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Sorry, there was an error processing your request.',
      isUser: false,
      timestamp: new Date()
    };
    addMessage(errorMessage);
  };

  return {
    messages,
    addMessage,
    addUserMessage,
    addAIMessage,
    addErrorMessage
  };
} 