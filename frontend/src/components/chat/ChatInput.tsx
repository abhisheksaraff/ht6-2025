import { Spinner } from '../Spinner';

interface ChatInputProps {
  inputValue: string;
  quotedText: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export default function ChatInput({
  inputValue,
  quotedText,
  isLoading,
  onInputChange,
  onSendMessage,
  onKeyPress
}: ChatInputProps) {
  return (
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
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder={quotedText ? "Ask about the quoted text..." : "Ask anything..."}
            className="chat-input"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={onSendMessage}
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
  );
} 