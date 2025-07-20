import { useEffect, useRef, useState } from 'react';
import { ContentObserver } from '../utils/contentObserver';

export function useContentObserver() {
  const [contentSent, setContentSent] = useState(false);
  const contentObserverRef = useRef<ContentObserver | null>(null);
  const currentUrlRef = useRef<string>('');

  useEffect(() => {
    const currentUrl = window.location.href;

    // Reset content sent flag when URL changes
    if (currentUrl !== currentUrlRef.current) {
      currentUrlRef.current = currentUrl;
      setContentSent(false);

      // Stop previous observer if it exists
      if (contentObserverRef.current) {
        contentObserverRef.current.stop();
      }
    }

    // Initialize content observer
    if (!contentObserverRef.current) {
      contentObserverRef.current = new ContentObserver((content) => {
        console.log('🔄 Content updated from observer:', content);
        setContentSent(true);
      });
      contentObserverRef.current.start();
      console.log('👀 Content observer started');
    }

    // Cleanup on unmount
    return () => {
      if (contentObserverRef.current) {
        contentObserverRef.current.stop();
      }
    };
  }, []);

  return {
    contentSent,
    setContentSent,
    contentObserverRef
  };
} 