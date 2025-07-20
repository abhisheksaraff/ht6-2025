import { Readability } from '@mozilla/readability';

export interface ProcessedContent {
  title: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  byline: string;
  siteName: string;
  publishedTime: string;
}

export function extractPageContent(): ProcessedContent | null {
  try {
    // Clone the document to avoid modifying the original
    const documentClone = document.cloneNode(true) as Document;
    
    // Create a new Readability object
    const reader = new Readability(documentClone);
    
    // Parse the content
    const article = reader.parse();
    
    // If the page is not readable, return null
    if (!article) {
      console.warn('❌ Readability could not parse the page content');
      return null;
    }
    
    const result = {
      title: article.title || document.title,
      content: article.content || '',
      textContent: article.textContent || '',
      length: article.length || 0,
      excerpt: article.excerpt || '',
      byline: article.byline || '',
      siteName: article.siteName || '',
      publishedTime: article.publishedTime || ''
    };
    
    // Enhanced success validation
    const hasTitle = result.title && result.title.length > 0;
    const hasContent = result.textContent && result.textContent.length > 0; // Any content is valid
    
    console.log('📄 Extracted:', {
      title: result.title,
      contentLength: result.textContent.length,
      excerpt: result.excerpt.substring(0, 100) + '...'
    });
    
    // Only return null if Readability completely failed
    if (!hasContent || !hasTitle) {
      console.warn('⚠️ No meaningful content extracted - Readability may have failed');
      return null;
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error extracting page content:', error);
    return null;
  }
}

export function getPageMetadata() {
  return {
    url: window.location.href,
    title: document.title,
    domain: window.location.hostname,
    timestamp: new Date().toISOString()
  };
}

export async function sendContentToBackend(content: ProcessedContent, metadata: ReturnType<typeof getPageMetadata>) {
  console.log('📤 Sending to backend:', {
    title: content.title,
    contentLength: content.textContent.length,
    url: metadata.url
  });
  
  try {
    const response = await fetch('http://localhost:63041/api/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content.textContent,
        title: content.title,
        url: metadata.url,
        domain: metadata.domain,
        excerpt: content.excerpt,
        timestamp: metadata.timestamp
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Error sending content to backend:', error);
    throw error;
  }
} 