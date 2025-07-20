import { useState, useEffect, useRef } from 'react';
import { Spinner } from './Spinner';
import './ChatPanel.css';
import { ContentObserver } from '../utils/contentObserver';
import { extractPageContent, getPageMetadata, sendContentToBackend } from '../utils/readability';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
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
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [panelPosition, setPanelPosition] = useState<'right' | 'left'>('right');
  // Conditionally use the hook to avoid QueryClient errors
  const [isLoading, setIsLoading] = useState(false);

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

  // Load saved panel position on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('chatPanelPosition');
    if (savedPosition === 'left' || savedPosition === 'right') {
      setPanelPosition(savedPosition);
    }
  }, []);

  // Save panel position when it changes
  useEffect(() => {
    localStorage.setItem('chatPanelPosition', panelPosition);
  }, [panelPosition]);
  
  // Listen for selected text messages from content script
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ADD_SELECTED_TEXT' && event.data.text) {
        console.log('Received selected text:', event.data.text);
        setQuotedText(event.data.text);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      
      // Send content to backend on first user message if not already sent
      await sendContentToBackendIfNeeded();
      
      // Create message content with quoted text if available
      let messageContent = inputValue;
      if (quotedText) {
        messageContent = `"${quotedText}"\n\n${inputValue}`;
      }
      
      const userMessage: Message = {
        id: Date.now().toString(),
        text: messageContent,
        isUser: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      
      // Clear the quoted text from input area after sending
      if (quotedText) {
        setQuotedText('');
      }

      try {
        // Send message to backend using TanStack Query
        const result = await sendMessage(messageContent);
        
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

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleSettingsClick = () => {
    setShowSettingsDropdown(!showSettingsDropdown);
  };

  const handlePositionChange = (position: 'left' | 'right') => {
    if (position !== panelPosition) {
      // Start animation sequence
      const panel = document.querySelector('.chat-panel') as HTMLElement;
      if (panel) {
        // Stage 1: Close panel
        panel.style.transform = 'translateX(100%)';
        panel.style.transition = 'transform 0.3s ease-in-out';
        
        setTimeout(() => {
          // Stage 2: Update position and push content
          setPanelPosition(position);
          setShowSettingsDropdown(false);
          
          // Notify content script to adjust webpage content
          window.postMessage({
            type: 'PANEL_POSITION_CHANGE',
            position: position
          }, '*');
          
          // Stage 3: Reopen panel
          setTimeout(() => {
            panel.style.transform = 'translateX(0)';
          }, 50);
          
          // Reset transition after animation
          setTimeout(() => {
            panel.style.transition = '';
            panel.style.transform = '';
          }, 350);
        }, 300);
      }
    } else {
      setShowSettingsDropdown(false);
    }
  };

  return (
    <div className={`chat-panel ${panelPosition === 'left' ? 'chat-panel-left' : 'chat-panel-right'}`}>
      <div className="chat-header">
        <h3>Focus Fox</h3>
        <div className="header-buttons">
          <div className="settings-container">
            <button className="settings-btn" onClick={handleSettingsClick}>
              ⋯
            </button>
            {showSettingsDropdown && (
              <div className="settings-dropdown">
                <div className="dropdown-item" onClick={() => handlePositionChange('left')}>
                  <span>Panel: Left</span>
                  {panelPosition === 'left' && <span className="check">✓</span>}
                </div>
                <div className="dropdown-item" onClick={() => handlePositionChange('right')}>
                  <span>Panel: Right</span>
                  {panelPosition === 'right' && <span className="check">✓</span>}
                </div>
              </div>
            )}
          </div>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-content">
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