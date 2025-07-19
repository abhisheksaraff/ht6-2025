// Create and inject the chat panel into the webpage
function createChatPanel() {
  // Create the main container
  const chatContainer = document.createElement('div');
  chatContainer.id = 'chat-extension-container';
  chatContainer.innerHTML = `
    <div id="chat-panel" class="chat-panel" style="display: none;">
      <div class="chat-header">
        <h3 class="chat-title">Focus Fox</h3>
        <div class="header-icons">
          <button class="menu-btn">⋯</button>
          <button class="close-btn" id="chat-close-btn">×</button>
        </div>
      </div>
      
      <div class="chat-messages" id="chat-messages">
        <div class="message ai-message">
          <div class="message-content">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </div>
        </div>
        <div class="message ai-message">
          <div class="message-content">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </div>
        </div>
      </div>
      
      <div class="chat-input-container">
        <div class="input-wrapper">
          <textarea
            id="chat-input"
            placeholder="Ask anything..."
            class="chat-input"
            rows="1"
          ></textarea>
          <button
            id="chat-send-btn"
            class="send-button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5,3 19,12 5,21"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <button id="chat-toggle-btn" class="chat-toggle-btn">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>
  `;

  // Add to page
  document.body.appendChild(chatContainer);

  // Get elements
  const chatPanel = document.getElementById('chat-panel');
  const toggleBtn = document.getElementById('chat-toggle-btn');
  const closeBtn = document.getElementById('chat-close-btn');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');
  const messagesContainer = document.getElementById('chat-messages');

  let messages = [];

  // Function to adjust page layout
  function adjustPageLayout(isOpen) {
    const body = document.body;
    const html = document.documentElement;
    const panelWidth = '400px';
    
    if (isOpen) {
      // Set the page width to be viewport width minus panel width
      body.style.width = `calc(100vw - ${panelWidth})`;
      html.style.width = `calc(100vw - ${panelWidth})`;
      
      // Add class for additional styling
      body.classList.add('chat-panel-open');
      html.classList.add('chat-panel-open');
    } else {
      // Reset to full width
      body.style.width = '';
      html.style.width = '';
      
      // Remove class
      body.classList.remove('chat-panel-open');
      html.classList.remove('chat-panel-open');
    }
  }

  // Toggle chat panel
  toggleBtn.addEventListener('click', () => {
    if (chatPanel.style.display === 'none') {
      chatPanel.style.display = 'flex';
      adjustPageLayout(true);
    } else {
      chatPanel.style.display = 'none';
      adjustPageLayout(false);
    }
  });

  // Close chat panel
  closeBtn.addEventListener('click', () => {
    chatPanel.style.display = 'none';
    adjustPageLayout(false);
  });

  // Send message
  function sendMessage() {
    const text = chatInput.value.trim();
    if (text) {
      const message = {
        id: Date.now().toString(),
        text: text,
        isUser: true,
        timestamp: new Date()
      };
      
      messages.push(message);
      displayMessage(message);
      chatInput.value = '';
      sendBtn.disabled = true;
    }
  }

  // Display message
  function displayMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.isUser ? 'user-message' : 'ai-message'}`;
    
    messageDiv.innerHTML = `
      <div class="message-content">
        ${message.text}
      </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Send button click
  sendBtn.addEventListener('click', sendMessage);

  // Enter key to send
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Enable/disable send button based on input
  chatInput.addEventListener('input', () => {
    sendBtn.disabled = !chatInput.value.trim();
  });

  // Initialize send button as disabled
  sendBtn.disabled = true;
}

// Inject CSS directly
function injectCSS() {
  const style = document.createElement('style');
  style.textContent = `
    #chat-extension-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2147483647;
    }

    .chat-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      height: 100vh;
      background: #1e1e1e;
      border-left: 1px solid #333;
      display: flex;
      flex-direction: column;
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      pointer-events: auto;
      box-sizing: border-box;
    }

    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #333;
      background: #1e1e1e;
    }

    .chat-title {
      margin: 0;
      color: #ff6b35;
      font-size: 16px;
      font-weight: 600;
    }

    .header-icons {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .menu-btn {
      background: none;
      border: none;
      color: #cccccc;
      font-size: 18px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background-color 0.2s;
      font-weight: bold;
    }

    .menu-btn:hover {
      background: #404040;
    }

    .close-btn {
      background: none;
      border: none;
      color: #cccccc;
      font-size: 18px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .close-btn:hover {
      background: #404040;
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .chat-messages::-webkit-scrollbar {
      width: 6px;
    }

    .chat-messages::-webkit-scrollbar-track {
      background: transparent;
    }

    .chat-messages::-webkit-scrollbar-thumb {
      background: #404040;
      border-radius: 3px;
    }

    .chat-messages::-webkit-scrollbar-thumb:hover {
      background: #555;
    }

    .message {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .user-message {
      align-items: flex-end;
    }

    .ai-message {
      align-items: flex-start;
    }

    .message-content {
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.4;
      word-wrap: break-word;
    }

    .user-message .message-content {
      background: #ff6b35;
      color: white;
      border-bottom-right-radius: 4px;
    }

    .ai-message .message-content {
      background: #ff6b35;
      color: white;
      border-bottom-left-radius: 4px;
    }

    .chat-input-container {
      padding: 16px 20px;
      border-top: 1px solid #333;
      background: #1e1e1e;
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #2d2d30;
      border: 1px solid #555;
      border-radius: 8px;
      padding: 8px 12px;
      transition: border-color 0.2s;
    }

    .input-wrapper:focus-within {
      border-color: #ff6b35;
    }

    .chat-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #cccccc;
      font-size: 14px;
      line-height: 1.4;
      resize: none;
      max-height: 120px;
      min-height: 20px;
      font-family: inherit;
    }

    .chat-input::placeholder {
      color: #888;
    }

    .send-button {
      background: #ff6b35;
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
      min-width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    .send-button:hover:not(:disabled) {
      background: #e55a2b;
    }

    .send-button:disabled {
      background: #555;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .send-button svg {
      width: 14px;
      height: 14px;
    }

    .chat-toggle-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #ff6b35;
      border: none;
      color: #cccccc;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: all 0.2s ease;
      z-index: 999;
      pointer-events: auto;
    }

    .chat-toggle-btn:hover {
      background: #e55a2b;
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }

    .chat-toggle-btn:active {
      transform: scale(0.95);
    }

    /* Page layout adjustments */
    body.chat-panel-open,
    html.chat-panel-open {
      transition: width 0.3s ease;
      box-sizing: border-box;
    }

    /* Ensure no default margins interfere */
    body.chat-panel-open *,
    html.chat-panel-open * {
      box-sizing: border-box;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .chat-panel {
        width: 100vw;
        height: 100vh;
      }
      
      .chat-toggle-btn {
        bottom: 15px;
        right: 15px;
        width: 45px;
        height: 45px;
      }

      body.chat-panel-open,
      html.chat-panel-open {
        width: 100vw !important;
      }
    }

    .message {
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    injectCSS();
    createChatPanel();
  });
} else {
  injectCSS();
  createChatPanel();
} 