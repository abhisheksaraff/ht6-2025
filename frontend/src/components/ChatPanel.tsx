import { useState, useEffect, useRef } from 'react';
import { Spinner } from './Spinner';
import './ChatPanel.css';

// Chrome types declaration
declare const chrome: any;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  quotedText?: string;
}

interface ChatPanelProps {
  onClose?: () => void;
  initialInputValue?: string;
}

export default function ChatPanel({ onClose, initialInputValue }: ChatPanelProps) {
  console.log('🦊 ChatPanel component mounted');
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'ai-placeholder',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      isUser: false,
      timestamp: new Date()
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [quotedText, setQuotedText] = useState(initialInputValue || '');
  const [contentSent, setContentSent] = useState(false);
  const [contentChanged, setContentChanged] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Conditionally use the hook to avoid QueryClient errors
  const [isLoading, setIsLoading] = useState(false);

  // Initialize content change detection
  useEffect(() => {
    // Request content script to start monitoring for changes
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'START_CONTENT_MONITORING'
        }).catch((error: any) => {
          console.error('🦊 Error starting content monitoring:', error);
        });
      }
    });

    // Listen for content change notifications from content script
    const handleContentChange = (message: any) => {
      if (message.type === 'CONTENT_CHANGED') {
        console.log('🦊 Content change detected by content script');
        setContentChanged(true);
      }
    };

    // Listen for Chrome runtime messages
    chrome.runtime.onMessage.addListener(handleContentChange);
    return () => chrome.runtime.onMessage.removeListener(handleContentChange);
  }, []);

  // Function to send content to backend
  const sendContentToBackendIfNeeded = async () => {
    // Send content if:
    // 1. Never sent before (first message), OR
    // 2. Content has changed since last send
    if (contentSent && !contentChanged) {
      return; // Skip silently
    }
    
    console.log('🦊 Requesting content extraction from main page...');
    console.log('🦊 contentSent:', contentSent, 'contentChanged:', contentChanged);
    
    // Send message to content script via Chrome runtime
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
      if (tabs[0]?.id) {
        console.log('🦊 Sending message to content script via Chrome runtime');
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'EXTRACT_AND_SEND_CONTENT'
        }).catch((error: any) => {
          console.error('🦊 Error sending message to content script:', error);
        });
      } else {
        console.error('🦊 No active tab found');
      }
    });
    
    // Mark content as sent to prevent repeated requests
    setContentSent(true);
    setContentChanged(false);
  };

  const [sendMessage] = useState(() => {
    return async (content: string) => {
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
  });
  
  // Listen for selected text messages from content script
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ADD_SELECTED_TEXT' && event.data.text) {
        console.log('🦊 ChatPanel received selected text:', event.data.text);
        setQuotedText(event.data.text);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Focus textarea and position cursor at the end when quoted text is set
  useEffect(() => {
    if (quotedText && textareaRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const length = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(length, length);
          console.log('🦊 Textarea focused and cursor positioned at end');
        }
      });
    }
  }, [quotedText]);
  
  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      
      // Send content to backend on first user message if not already sent
      await sendContentToBackendIfNeeded();
      
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        isUser: true,
        timestamp: new Date(),
        quotedText: quotedText || undefined
      };
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      
      // Clear the quoted text from input area after sending
      if (quotedText) {
        setQuotedText('');
      }

      try {
        // Send message to backend using TanStack Query
        const result = await sendMessage(inputValue);
        
        // Add AI response message
        const aiMessage: Message = {
          id: result.assistantMessage.id,
          text: result.assistantMessage.content,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
        // Add error message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Sorry, there was an error processing your request.',
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-panel chat-panel-sidebar">
      <div className="chat-header">
        <h3>Focus Fox</h3>
        {onClose && (
          <div className="header-buttons">
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        )}
      </div>
      
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-content">
              {message.quotedText && (
                <div className="message-quoted-text">
                  <div className="message-quote-line"></div>
                  <span className="message-quote-content">{message.quotedText}</span>
                </div>
              )}
              {message.text}
            </div>
            <div className="message-timestamp">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai-message">
            <div className="loading-message">
              <div className="spinner-container">
                <div className="spinner"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="chat-input-container">
        <div className="input-wrapper">
          {quotedText && (
            <div className="quoted-text">
              <div className="quote-line"></div>
              <span className="quote-content">{quotedText}</span>
            </div>
          )}
          <div className="input-row">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={quotedText ? "Ask about the quoted text..." : "Ask anything..."}
              className="chat-input"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              className="send-button"
              disabled={!inputValue.trim() || isLoading}
            >
              {isLoading ? (
                <Spinner size="small" color="white" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5,3 19,12 5,21"></polygon>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 