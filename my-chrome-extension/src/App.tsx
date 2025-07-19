import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ChatPanel from './components/ChatPanel'

function App() {
  const [count, setCount] = useState(0)
  const [showChatPanel, setShowChatPanel] = useState(false)

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
      <div className="main-content">
        <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Vite + React</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </div>

      {/* Chat Panel Toggle Button */}
      <button 
        className="chat-toggle-btn"
        onClick={() => setShowChatPanel(!showChatPanel)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      {/* Chat Panel */}
      {showChatPanel && (
        <ChatPanel onClose={() => setShowChatPanel(false)} />
      )}
    </>
  )
}

export default App
