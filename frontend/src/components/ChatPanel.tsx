import { useState } from 'react';
import { Spinner } from './Spinner';
import './ChatPanel.css';
import { useContentExtraction } from '../hooks/useContentExtraction';
import { useMessageHandling } from '../hooks/useMessageHandling';
import { useQuotedText } from '../hooks/useQuotedText';

interface ChatPanelProps {
  onClose?: () => void;
  initialInputValue?: string;
}

export default function ChatPanel({ onClose, initialInputValue }: ChatPanelProps) {
  console.log('🦊 ChatPanel component mounted');
  
  const [inputValue, setInputValue] = useState('');
  const { sendContentToBackendIfNeeded } = useContentExtraction();
  const { messages, isLoading, sendMessage, addUserMessage, addAIMessage, addErrorMessage } = useMessageHandling();
  const { quotedText, clearQuotedText, textareaRef } = useQuotedText(initialInputValue);
  
  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      // Send content to backend on first user message if not already sent
      await sendContentToBackendIfNeeded();
      
      // Add user message
      addUserMessage(inputValue, quotedText || undefined);
      setInputValue('');

      // Clear the quoted text from input area after sending
      if (quotedText) {
        clearQuotedText();
      }

      try {
        // Send message to backend
        const result = await sendMessage(inputValue);
        
        // Add AI response message
        addAIMessage(result.assistantMessage.content);
      } catch (error) {
        console.error('Error sending message:', error);
        addErrorMessage();
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