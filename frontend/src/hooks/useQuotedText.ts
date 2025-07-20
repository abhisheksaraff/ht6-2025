import { useState, useEffect, useRef } from 'react';

export function useQuotedText(initialInputValue?: string) {
  const [quotedText, setQuotedText] = useState(initialInputValue || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Listen for selected text messages from content script
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ADD_SELECTED_TEXT' && event.data.text) {
        console.log('🦊 ChatPanel received selected text:', event.data.text);
        setQuotedText(event.data.text);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Focus textarea and position cursor at the end when quoted text is set
  useEffect(() => {
    if (quotedText && textareaRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const length = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(length, length);
          console.log('🦊 Textarea focused and cursor positioned at end');
        }
      });
    }
  }, [quotedText]);

  const clearQuotedText = () => {
    setQuotedText('');
  };

  return {
    quotedText,
    setQuotedText,
    clearQuotedText,
    textareaRef
  };
} 