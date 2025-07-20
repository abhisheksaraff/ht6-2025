interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  return (
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
  );
} 