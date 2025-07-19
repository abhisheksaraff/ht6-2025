import { useState } from 'react';
import './ChatPanel.css';

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

  const handleSendMessage = () => {
    if (inputValue.trim()) {
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