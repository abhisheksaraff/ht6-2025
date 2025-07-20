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
    
    this.observer = new MutationObserver((mutations) => {
      // Check if any mutations are relevant to content changes
      const hasContentChanges = mutations.some(mutation => {
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
    console.log('Content observer started');
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
    
    console.log('Content observer stopped');
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
    console.log('🔍 Checking for content changes...');
    try {
      const content = extractPageContent();
      if (!content) {
        console.log('❌ No content extracted, skipping...');
        return;
      }

      // Create a simple hash of the content to detect changes
      const contentHash = this.createContentHash(content.textContent);
      console.log('🔢 Content hash:', contentHash);
      console.log('🔢 Previous hash:', this.lastContentHash);
      
      if (contentHash !== this.lastContentHash) {
        console.log('🔄 Content change detected!');
        this.lastContentHash = contentHash;
        const metadata = getPageMetadata();
        
        console.log('📤 Sending updated content to backend...');
        
        try {
          const result = await sendContentToBackend(content, metadata);
          this.onContentChange(result);
        } catch (error) {
          console.error('❌ Failed to send content to backend:', error);
        }
      } else {
        console.log('✅ No content changes detected');
      }
    } catch (error) {
      console.error('❌ Error checking content change:', error);
    }
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