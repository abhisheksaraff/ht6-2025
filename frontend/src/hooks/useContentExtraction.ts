import { useState, useEffect } from 'react';
import { useSchedule } from './useSchedule';

// Chrome types declaration
declare const chrome: any;

export function useContentExtraction() {
  const [contentSent, setContentSent] = useState(false);
  const [contentChanged, setContentChanged] = useState(false);
  const [currentContentId, setCurrentContentId] = useState<string | null>(null);

  // Initialize content change detection
  useEffect(() => {
    // Request content script to start monitoring for changes
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'START_CONTENT_MONITORING'
        }).catch((error: any) => {
          console.error('🦊 Error starting content monitoring:', error);
        });
      }
    });

    const schedule = useSchedule();



    // Listen for content change notifications from content script
    const handleContentChange = (message: any) => {
      if (message.type === 'CONTENT_CHANGED') {
        console.log('🦊 Content change detected by content script');
        setContentChanged(true);
      } else if (message.type === 'CONTENT_UPDATED' && message.data) {
        console.log('🦊 Content updated from backend:', message.data);
        setCurrentContentId(message.data.id);
        function task() {
          schedule.add(message.data.id, message.data.ttl - 6000, () => {
            task();
          });
        }

        if (currentContentId) {
          schedule.remove(currentContentId);
        }

        schedule.add(message.data.id, message.data.ttl - 6000, task);
        setContentSent(true);
        setContentChanged(false);
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
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
      if (tabs[0]?.id) {
        console.log('🦊 Sending message to content script via Chrome runtime');
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'EXTRACT_AND_SEND_CONTENT'
        }).catch((error: any) => {
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
    sendContentToBackendIfNeeded,
    currentContentId
  };
} 