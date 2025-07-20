import { extractPageContent, getPageMetadata, sendContentToBackend } from '../utils/readability';

export async function sendContentToBackendIfNeeded(contentSent: boolean, setContentSent: (sent: boolean) => void) {
  if (contentSent) {
    console.log('Content already sent for this page, skipping...');
    return;
  }
  
  console.log('🦊 Focus Fox: Extracting page content...');
  try {
    const content = extractPageContent();
    if (!content) {
      console.warn('Could not extract page content');
      return;
    }

    console.log('📄 Extracted content:', {
      title: content.title,
      textLength: content.textContent.length,
      excerpt: content.excerpt.substring(0, 100) + '...'
    });

    const metadata = getPageMetadata();
    console.log('🌐 Page metadata:', metadata);
    
    console.log('📤 Sending to backend...');
    await sendContentToBackend(content, metadata);
    setContentSent(true);
    console.log('✅ Page content sent to backend successfully');
  } catch (error) {
    console.error('❌ Failed to send content to backend:', error);
  }
} 