import { useState, useEffect, useRef } from 'react';
import './ChatPanel.css';
import { ContentObserver } from '../utils/contentObserver';
import { extractPageContent, getPageMetadata, sendContentToBackend } from '../utils/readability';

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
  const contentObserverRef = useRef<ContentObserver | null>(null);
  const currentUrlRef = useRef<string>('');

  // Initialize content observer and handle URL changes
  useEffect(() => {
    const currentUrl = window.location.href;
    
    // Reset content sent flag when URL changes
    if (currentUrl !== currentUrlRef.current) {
      currentUrlRef.current = currentUrl;
      setContentSent(false);
      
      // Stop previous observer if it exists
      if (contentObserverRef.current) {
        contentObserverRef.current.stop();
      }
    }

    // Initialize content observer
    if (!contentObserverRef.current) {
      contentObserverRef.current = new ContentObserver((content) => {
        console.log('🔄 Content updated from observer:', content);
        setContentSent(true);
      });
      contentObserverRef.current.start();
      console.log('👀 Content observer started');
    }

    // Cleanup on unmount
    return () => {
      if (contentObserverRef.current) {
        contentObserverRef.current.stop();
      }
    };
  }, []);

  // Function to send content to backend
  const sendContentToBackendIfNeeded = async () => {
    if (contentSent) {
      console.log('Content already sent for this page, skipping...');
      return;
    }
    
    console.log('🦊 Focus Fox: Extracting page content...');
    try {
      const content = extractPageContent();
      if (!content) {
        console.warn('Could not extract page content');
        return;
      }

      console.log('📄 Extracted content:', {
        title: content.title,
        textLength: content.textContent.length,
        excerpt: content.excerpt.substring(0, 100) + '...'
      });

      const metadata = getPageMetadata();
      console.log('🌐 Page metadata:', metadata);
      
      console.log('📤 Sending to backend...');
      await sendContentToBackend(content, metadata);
      setContentSent(true);
      console.log('✅ Page content sent to backend successfully');
    } catch (error) {
      console.error('❌ Failed to send content to backend:', error);
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      // Send content to backend on first user message if not already sent
      await sendContentToBackendIfNeeded();
      
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        isUser: true,
        timestamp: new Date(),
        quotedText: quotedText || undefined
      };
      setMessages(prev => [...prev, newMessage]);
      setInputValue('');
      
      // Clear the quoted text from input area after sending
      if (quotedText) {
        setQuotedText('');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>Focus Fox</h3>
        <button className="close-btn" onClick={handleClose}>×</button>
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
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={quotedText ? "Ask about the quoted text..." : "Ask anything..."}
              className="chat-input"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              className="send-button"
              disabled={!inputValue.trim()}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5,3 19,12 5,21"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 