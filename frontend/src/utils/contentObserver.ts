import { extractPageContent, getPageMetadata, sendContentToBackend } from './readability';

interface BackendContentResponse {
  id: string;
  ttl: number;
}

export class ContentObserver {
  private observer: MutationObserver | null = null;
  private isObserving = false;
  private lastContentHash: string = '';
  private debounceTimer: NodeJS.Timeout | null = null;
  private onContentChange: (content: BackendContentResponse) => void;

  constructor(onContentChange: (content: BackendContentResponse) => void) {
    this.onContentChange = onContentChange;
  }

  start() {
    if (this.isObserving) return;
    
    // Wait a bit for the extension to be fully loaded
    setTimeout(() => {
      this.startObserving();
    }, 100);
  }

  private startObserving() {
    if (this.isObserving) return;
    
    this.observer = new MutationObserver((mutations) => {
      // Filter out mutations from the extension elements
      const relevantMutations = mutations.filter(mutation => 
        !this.isExtensionMutation(mutation)
      );
      
      // Check if any remaining mutations are relevant to content changes
      const hasContentChanges = relevantMutations.some(mutation => {
        return (
          mutation.type === 'childList' ||
          mutation.type === 'characterData' ||
          (mutation.type === 'attributes' && 
           (mutation.attributeName === 'innerHTML' || 
            mutation.attributeName === 'textContent'))
        );
      });

      if (hasContentChanges) {
        this.debouncedContentCheck();
      }
    });

    // Start observing
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['innerHTML', 'textContent']
    });

    this.isObserving = true;
  }

  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.isObserving = false;
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  private debouncedContentCheck() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.checkContentChange();
    }, 1000); // 1 second debounce
  }

  private async checkContentChange() {
    try {
      const content = extractPageContent();
      if (!content) {
        return;
      }

      // Create a simple hash of the content to detect changes
      const contentHash = this.createContentHash(content.textContent);
      
      if (contentHash !== this.lastContentHash) {
        console.log('📄 Page content changed - will send on next user message');
        this.lastContentHash = contentHash;
        
        // Just notify that content changed, don't send immediately
        this.onContentChange({ id: 'content-changed', ttl: 0 });
      }
    } catch (error) {
      console.error('❌ ContentObserver: Error checking content change:', error);
    }
  }

  // Check if a mutation is related to the chat panel or any extension elements
  private isExtensionMutation(mutation: MutationRecord): boolean {
    // Check if the mutation target is within the chat panel
    const chatPanel = document.querySelector('.chat-panel');
    if (chatPanel && chatPanel.contains(mutation.target)) {
      return true;
    }
    
    // Check if the mutation target is the chat panel itself
    if (mutation.target === chatPanel) {
      return true;
    }
    
    // Check if the mutation target is within any extension container
    const extensionContainer = document.querySelector('#focus-fox-extension');
    if (extensionContainer && extensionContainer.contains(mutation.target)) {
      return true;
    }
    
    // Check if the mutation target is the extension container itself
    if (mutation.target === extensionContainer) {
      return true;
    }
    
    // Check if the mutation target has extension-related classes or IDs
    const target = mutation.target as Element;
    if (target && target.classList) {
      const classList = Array.from(target.classList);
      if (classList.some(cls => cls.includes('chat-') || cls.includes('fox-') || cls.includes('extension'))) {
        return true;
      }
    }
    
    // Check if the mutation target has extension-related IDs
    if (target && target.id) {
      if (target.id.includes('chat') || target.id.includes('fox') || target.id.includes('extension')) {
        return true;
      }
    }
    
    return false;
  }

  private createContentHash(text: string): string {
    // Simple hash function for content comparison
    let hash = 0;
    if (text.length === 0) return hash.toString();
    
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString();
  }

  // Method to manually trigger content extraction and sending
  async extractAndSendContent() {
    try {
      const content = extractPageContent();
      if (!content) {
        console.warn('Could not extract page content');
        return null;
      }

      const metadata = getPageMetadata();
      const result = await sendContentToBackend(content, metadata);
      this.onContentChange(result);
      return result;
    } catch (error) {
      console.error('Error extracting and sending content:', error);
      throw error;
    }
  }
} 