import { createRoot } from 'react-dom/client';
import ChatPanel from './components/ChatPanel';

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

// Listen for messages from content script
window.addEventListener('message', (event) => {
  if (event.data.type === 'SIDEBAR_OPEN_WITH_TEXT' && event.data.text) {
    // Handle opening sidebar with selected text
    // This will be handled by the ChatPanel component
    window.postMessage({
      type: 'ADD_SELECTED_TEXT',
      text: event.data.text
    }, '*');
  }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSidebar);
} else {
  initializeSidebar();
} 