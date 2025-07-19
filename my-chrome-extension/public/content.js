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
      <img src="${chrome.runtime.getURL('fox.png')}" alt="Focus Fox" class="fox-icon">
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
  toggleBtn.addEventListener('click', (e) => {
    // Only toggle if we didn't drag
    if (!hasDragged) {
      if (chatPanel.style.display === 'none') {
        chatPanel.style.display = 'flex';
        adjustPageLayout(true);
      } else {
        chatPanel.style.display = 'none';
        adjustPageLayout(false);
      }
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

  // Drag functionality for toggle button
  let isDragging = false;
  let hasDragged = false;
  let startX = 0;
  let startY = 0;

  // Mouse down event for drag start
  toggleBtn.addEventListener('mousedown', (e) => {
    if (e.target.closest('.fox-icon')) {
      isDragging = true;
      hasDragged = false;
      startX = e.clientX;
      startY = e.clientY;
      toggleBtn.style.cursor = 'grabbing';
      toggleBtn.style.transition = 'none'; // Remove transition during drag
      e.preventDefault();
    }
  });

  // Mouse move event for dragging
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      // Check if we've moved enough to consider it a drag
      const deltaX = Math.abs(e.clientX - startX);
      const deltaY = Math.abs(e.clientY - startY);
      if (deltaX > 5 || deltaY > 5) {
        hasDragged = true;
      }
      
      // Center the button on the cursor
      const newX = e.clientX - (toggleBtn.offsetWidth / 2);
      const newY = e.clientY - (toggleBtn.offsetHeight / 2);
      
      // Keep button within viewport bounds
      const maxX = window.innerWidth - toggleBtn.offsetWidth;
      const maxY = window.innerHeight - toggleBtn.offsetHeight;
      
      toggleBtn.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
      toggleBtn.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
      toggleBtn.style.right = 'auto';
      toggleBtn.style.bottom = 'auto';
    }
  });

  // Mouse up event for drag end
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      toggleBtn.style.cursor = 'grab';
      toggleBtn.style.transition = 'all 0.2s ease'; // Restore transition after drag
      
      // Reset drag state after a short delay to allow click event to process
      setTimeout(() => {
        hasDragged = false;
      }, 10);
    }
  });

  // ESC key functionality
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // If panel is open, close it
      if (chatPanel.style.display !== 'none') {
        chatPanel.style.display = 'none';
        adjustPageLayout(false);
      } else {
        // If panel is closed and button is not in original position, reset it
        const currentLeft = parseInt(toggleBtn.style.left) || 0;
        const currentTop = parseInt(toggleBtn.style.top) || 0;
        const originalRight = window.innerWidth - 70; // 20px from right edge
        const originalBottom = window.innerHeight - 70; // 20px from bottom edge
        
        if (currentLeft !== 0 || currentTop !== 0) {
          // Reset to original position (bottom right)
          toggleBtn.style.left = '';
          toggleBtn.style.top = '';
          toggleBtn.style.right = '20px';
          toggleBtn.style.bottom = '20px';
        }
      }
    }
  });
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

    .fox-icon {
      width: 40px;
      height: 40px;
      object-fit: contain;
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
      cursor: grab;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: all 0.2s ease;
      z-index: 999;
      pointer-events: auto;
      user-select: none;
    }

    .chat-toggle-btn:active {
      cursor: grabbing;
    }

    .chat-toggle-btn:hover:not(:active) {
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