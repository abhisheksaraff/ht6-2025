import { useState, useEffect } from 'react'
import './App.css'
import ChatPanel from './components/ChatPanel'

function App() {
  const [showChatPanel, setShowChatPanel] = useState(true) // Start with panel open

  // Add/remove body class when chat panel is toggled
  useEffect(() => {
    if (showChatPanel) {
      document.body.classList.add('chat-panel-open');
    } else {
      document.body.classList.remove('chat-panel-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('chat-panel-open');
    };
  }, [showChatPanel]);

  return (
    <>
      {/* Chat Panel - Always visible as overlay */}
      {showChatPanel && (
        <ChatPanel onClose={() => setShowChatPanel(false)} />
      )}
    </>
  )
}

export default App
