import { createRoot } from 'react-dom/client';
import ChatPanel from './components/ChatPanel';

// Chrome types declaration
declare const chrome: any;

// Initialize the sidebar
function initializeSidebar() {
  const container = document.getElementById('root');
  if (!container) {
    console.error('❌ Root container not found');
    return;
  }

  const root = createRoot(container);
  
  // Render the ChatPanel without onClose since sidebar is persistent
  root.render(
    <ChatPanel 
      onClose={undefined} // Sidebar doesn't need close functionality
      initialInputValue={undefined}
    />
  );
}

// Check for selected text from storage when sidebar opens
function checkForSelectedText() {
  chrome.storage.local.get(['selectedText', 'timestamp'], (result: any) => {
    if (result.selectedText && result.timestamp) {
      // Check if the timestamp is recent (within last 5 seconds)
      const now = Date.now();
      if (now - result.timestamp < 5000) {
        console.log('🦊 Found selected text in storage:', result.selectedText);
        // Pass the selected text to ChatPanel
        window.postMessage({
          type: 'ADD_SELECTED_TEXT',
          text: result.selectedText
        }, '*');
        
        // Clear the stored text
        chrome.storage.local.remove(['selectedText', 'timestamp']);
      }
    }
  });
}



// Check for selected text when sidebar initializes
setTimeout(checkForSelectedText, 100);

// Also check when the window gains focus (in case sidebar was already open)
window.addEventListener('focus', checkForSelectedText);

// Check periodically for new selected text (every 500ms)
setInterval(checkForSelectedText, 500);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSidebar);
} else {
  initializeSidebar();
} 