import { useState, useEffect } from 'react'
import './App.css'
import reactLogo from './assets/react.svg'
// Removed: import ChatPanel from './components/ChatPanel'

function App() {
  const [count, setCount] = useState(0)
  // Removed: showChatPanel and setShowChatPanel

  // Add/remove body class when chat panel is toggled
  useEffect(() => {
    // Removed: chat-panel-open logic
    return () => {};
  }, []);

  return (
    <>
      <div className="main-content">
        <div>
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
      {/* Removed: Floating chat button and ChatPanel, now handled by content script */}
    </>
  )
}

export default App
