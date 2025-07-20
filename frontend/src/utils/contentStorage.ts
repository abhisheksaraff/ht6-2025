export interface ContentData {
  id: string;
  ttl: number;
  expiresAt: number;
  createdAt: number;
  url: string;
}

const STORAGE_KEY = 'focus_fox_content_data';

export class ContentStorage {
  private static instance: ContentStorage;
  
  private constructor() {}
  
  static getInstance(): ContentStorage {
    if (!ContentStorage.instance) {
      ContentStorage.instance = new ContentStorage();
    }
    return ContentStorage.instance;
  }
  
  // Store content data for current URL
  storeContent(contentData: { id: string; ttl: number }): void {
    try {
      const data: ContentData = {
        ...contentData,
        expiresAt: Date.now() + (contentData.ttl * 1000),
        createdAt: Date.now(),
        url: window.location.href
      };
      
      const existingData = this.getAllContent();
      
      // Remove old data for this URL if it exists
      const filteredData = existingData.filter(item => item.url !== window.location.href);
      
      // Add new data
      filteredData.push(data);
      
      // Clean up expired data
      const validData = filteredData.filter(item => item.expiresAt > Date.now());
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validData));
      
      console.log('💾 Content data stored:', data);
    } catch (error) {
      console.error('💾 Error storing content data:', error);
    }
  }
  
  // Get content data for current URL
  getCurrentContent(): ContentData | null {
    try {
      const allData = this.getAllContent();
      const currentUrl = window.location.href;
      
      const currentData = allData.find(item => item.url === currentUrl);
      
      if (currentData && currentData.expiresAt > Date.now()) {
        return currentData;
      }
      
      // Remove expired data
      if (currentData && currentData.expiresAt <= Date.now()) {
        this.removeContent(currentData.id);
      }
      
      return null;
    } catch (error) {
      console.error('💾 Error getting current content data:', error);
      return null;
    }
  }
  
  // Get all content data
  getAllContent(): ContentData[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const parsedData = JSON.parse(data) as ContentData[];
      
      // Filter out expired data
      const validData = parsedData.filter(item => item.expiresAt > Date.now());
      
      // Update storage if some data was expired
      if (validData.length !== parsedData.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validData));
      }
      
      return validData;
    } catch (error) {
      console.error('💾 Error getting all content data:', error);
      return [];
    }
  }
  
  // Remove content data by ID
  removeContent(id: string): void {
    try {
      const allData = this.getAllContent();
      const filteredData = allData.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredData));
      
      console.log('💾 Content data removed:', id);
    } catch (error) {
      console.error('💾 Error removing content data:', error);
    }
  }
  
  // Clear all content data
  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('💾 All content data cleared');
    } catch (error) {
      console.error('💾 Error clearing content data:', error);
    }
  }
  
  // Check if content needs refresh (expires within 30 seconds)
  needsRefresh(): boolean {
    const currentContent = this.getCurrentContent();
    if (!currentContent) return true;
    
    const thirtySecondsFromNow = Date.now() + (30 * 1000);
    return currentContent.expiresAt <= thirtySecondsFromNow;
  }
  
  // Get time until content expires (in milliseconds)
  getTimeUntilExpiry(): number {
    const currentContent = this.getCurrentContent();
    if (!currentContent) return 0;
    
    return Math.max(0, currentContent.expiresAt - Date.now());
  }
}

// Export singleton instance
export const contentStorage = ContentStorage.getInstance(); 