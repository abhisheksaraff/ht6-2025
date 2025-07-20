import { useState, useEffect } from 'react';

// Chrome types declaration
interface ChromeTab {
  id?: number;
  url?: string;
  title?: string;
}

interface ChromeMessage {
  type: string;
  [key: string]: unknown;
}

interface ChromeError {
  message: string;
  stack?: string;
}

declare const chrome: {
  tabs: {
    query: (queryInfo: { active: boolean; currentWindow: boolean }, callback: (tabs: ChromeTab[]) => void) => void;
    sendMessage: (tabId: number, message: ChromeMessage) => Promise<void>;
  };
  runtime: {
    onMessage: {
      addListener: (callback: (message: ChromeMessage) => void) => void;
      removeListener: (callback: (message: ChromeMessage) => void) => void;
    };
  };
};

export function useContentExtraction() {
  const [contentSent, setContentSent] = useState(false);
  const [contentChanged, setContentChanged] = useState(false);

  // Initialize content change detection
  useEffect(() => {
    // Request content script to start monitoring for changes
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: ChromeTab[]) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'START_CONTENT_MONITORING'
        }).catch((error: ChromeError) => {
          console.error('🦊 Error starting content monitoring:', error);
        });
      }
    });

    // Listen for content change notifications from content script
    const handleContentChange = (message: ChromeMessage) => {
      if (message.type === 'CONTENT_CHANGED') {
        console.log('🦊 Content change detected by content script');
        setContentChanged(true);
      }
    };

    // Listen for Chrome runtime messages
    chrome.runtime.onMessage.addListener(handleContentChange);
    return () => chrome.runtime.onMessage.removeListener(handleContentChange);
  }, []);

  // Function to send content to backend
  const sendContentToBackendIfNeeded = async () => {
    // Send content if:
    // 1. Never sent before (first message), OR
    // 2. Content has changed since last send
    if (contentSent && !contentChanged) {
      return; // Skip silently
    }
    
    console.log('🦊 Requesting content extraction from main page...');
    console.log('🦊 contentSent:', contentSent, 'contentChanged:', contentChanged);
    
    // Send message to content script via Chrome runtime
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: ChromeTab[]) => {
      if (tabs[0]?.id) {
        console.log('🦊 Sending message to content script via Chrome runtime');
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'EXTRACT_AND_SEND_CONTENT'
        }).catch((error: ChromeError) => {
          console.error('🦊 Error sending message to content script:', error);
        });
      } else {
        console.error('🦊 No active tab found');
      }
    });
    
    // Mark content as sent to prevent repeated requests
    setContentSent(true);
    setContentChanged(false);
  };

  return {
    sendContentToBackendIfNeeded
  };
} 