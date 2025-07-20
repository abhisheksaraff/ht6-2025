import { useState, useEffect } from "react";
import { createStorage, type IContent } from "../storage";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
  ttl?: number;
  createdAt?: number;
  expiresAt?: number;
}

export default function MessagesSent({isFetching}: {isFetching: boolean}) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    async function loadMessages() {
      try {
        const storage = await createStorage();
        // Use filter to get all messages (no filter condition)
        const storedMessages = await storage.filter(() => true);
        
        // Convert stored messages to display format
        const displayMessages: Message[] = storedMessages.map((msg: IContent) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.createdAt * 1000),
          ttl: msg.ttl,
          createdAt: msg.createdAt,
          expiresAt: msg.expiresAt,
        }));

        setMessages(displayMessages);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    }

    loadMessages();
  }, []);

  if (messages.length === 0) {
    return (
      <div className="messages-sent-container">
        <div className="empty-state">
          <h3>No messages sent yet</h3>
          <p>Your sent messages will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div>
        <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`${message.role}`}>
            <div className="message-content">{message.content}</div>
            <div className="message-timestamp">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}

        {isFetching && (
          <div className="message ai-message">
            <div className="loading-message">
              <div className="spinner-container">
                <div className="spinner"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
