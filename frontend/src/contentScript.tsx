// Inject ChatPanel styles directly into the page
import chatPanelCss from './components/ChatPanel.css?raw';
const style = document.createElement('style');
style.textContent = chatPanelCss;
document.head.appendChild(style);

// React and assets imports
import foxPngUrl from './assets/fox.png?url';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const chrome: any;

// --- Floating Fox Button Setup ---
const btn = document.createElement('button');
btn.textContent = '';
const foxImg = document.createElement('img');
foxImg.src = chrome.runtime.getURL(foxPngUrl);
foxImg.alt = 'Fox';
foxImg.style.width = '36px';
foxImg.style.height = '36px';
foxImg.style.objectFit = 'contain';
foxImg.style.display = 'block';
foxImg.style.pointerEvents = 'none';
btn.appendChild(foxImg);
btn.style.position = 'fixed';
btn.style.left = '20px';
btn.style.bottom = '20px';
btn.style.width = '50px';
btn.style.height = '50px';
btn.style.borderRadius = '50%';
btn.style.background = '#ff5c1a';
btn.style.border = 'none';
btn.style.color = '#fff';
btn.style.cursor = 'pointer';
btn.style.display = 'flex';
btn.style.alignItems = 'center';
btn.style.justifyContent = 'center';
btn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
btn.style.transition = 'all 0.2s ease';
btn.style.zIndex = '2147483660';
btn.style.fontSize = '28px';
btn.style.isolation = 'isolate';
document.body.appendChild(btn);

// --- Drag and Toggle Logic ---
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let dragMoved = false;

// Start dragging the button
btn.addEventListener('mousedown', (e) => {
  isDragging = true;
  dragMoved = false;
  const rect = btn.getBoundingClientRect();
  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;
  btn.style.transition = 'none';
  document.body.style.userSelect = 'none';
});

// Move the button with the cursor, clamped to the viewport
document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  dragMoved = true;
  const btnWidth = btn.offsetWidth;
  const btnHeight = btn.offsetHeight;
  let x = e.clientX - dragOffsetX;
  let y = e.clientY - dragOffsetY;
  x = Math.max(0, Math.min(window.innerWidth - btnWidth, x));
  y = Math.max(0, Math.min(window.innerHeight - btnHeight, y));
  btn.style.left = x + 'px';
  btn.style.top = y + 'px';
  btn.style.right = '';
  btn.style.bottom = '';
  btn.style.position = 'fixed';
});

document.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false;
  btn.style.transition = 'all 0.2s ease';
  document.body.style.userSelect = '';
});

// --- Button Click Animation ---
const animStyle = document.createElement('style');
animStyle.textContent = `
@keyframes fox-btn-click {
  0% { transform: scale(1); }
  50% { transform: scale(0.88); }
  100% { transform: scale(1); }
}
.fox-btn-animate {
  animation: fox-btn-click 0.18s cubic-bezier(.4,0,.2,1);
}`;
document.head.appendChild(animStyle);

// --- Button Click: Open Sidebar ---
btn.addEventListener('click', () => {
  if (dragMoved) {
    dragMoved = false;
    return;
  }
  // Animate button
  btn.classList.remove('fox-btn-animate');
  void btn.offsetWidth; // force reflow
  btn.classList.add('fox-btn-animate');
  setTimeout(() => btn.classList.remove('fox-btn-animate'), 180);

  // Open the sidebar
  chrome.runtime.sendMessage({ type: 'OPEN_SIDEBAR' });
});

// --- Button Hover Styling ---
btn.addEventListener('mouseenter', () => {
  btn.style.background = '#ff7a3a';
});
btn.addEventListener('mouseleave', () => {
  btn.style.background = '#ff5c1a';
});

// --- Keyboard Shortcuts ---
document.addEventListener('keydown', (e) => {
  // Cmd+K (Mac) or Ctrl+K (Win/Linux) opens sidebar
  if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    chrome.runtime.sendMessage({ type: 'OPEN_SIDEBAR' });
  }
});

// Text selection popup functionality
let selectionPopup: HTMLDivElement | null = null;

function createSelectionPopup() {
  if (selectionPopup) {
    document.body.removeChild(selectionPopup);
  }
  
  selectionPopup = document.createElement('div');
  selectionPopup.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    background: #ff5c1a;
    border: 1px solid #ff5c1a;
    border-radius: 8px;
    padding: 8px 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 2147483661;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s ease;
    display: none;
    pointer-events: auto;
    transform: translate3d(0, 0, 0);
    will-change: transform;
  `;
  
  selectionPopup.innerHTML = 'Ask Focus Fox anything...';
  selectionPopup.addEventListener('mousedown', (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Get selected text before clearing selection
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : undefined;
    
    // Clear the text selection
    if (selection) {
      selection.removeAllRanges();
    }
    
    // Hide popup immediately
    hideSelectionPopup();
    
    // Check if sidebar is already open and send text directly, otherwise open sidebar
    chrome.runtime.sendMessage({ 
      type: 'SEND_TEXT_TO_SIDEBAR', 
      text: selectedText 
    });
  });
  
  // Hover effects
  selectionPopup.addEventListener('mouseenter', () => {
    if (selectionPopup) {
      selectionPopup.style.background = '#ff7a3a';
      selectionPopup.style.borderColor = '#ff7a3a';
    }
  });
  
  selectionPopup.addEventListener('mouseleave', () => {
    if (selectionPopup) {
      selectionPopup.style.background = '#ff5c1a';
      selectionPopup.style.borderColor = '#ff5c1a';
    }
  });
  
  document.body.appendChild(selectionPopup);
  
  // Prevent popup from being hidden when clicking on it
  selectionPopup.addEventListener('mousedown', (e: MouseEvent) => {
    e.stopPropagation();
  });
}

function showSelectionPopup() {
  const selection = window.getSelection();
  if (!selection || !selection.toString().trim() || !selectionPopup) {
    return;
  }
  
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  // Direct positioning - no checks, no parsing, just set the position
  selectionPopup.style.transform = `translate3d(${rect.left}px, ${rect.bottom + 5}px, 0)`;
  selectionPopup.style.display = 'block';
  
  // Update content
  selectionPopup.innerHTML = 'Ask Focus Fox anything...';
}

function hideSelectionPopup() {
  if (selectionPopup) {
    selectionPopup.style.display = 'none';
  }
}

// Listen for text selection
document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    // Small delay to ensure selection is complete
    setTimeout(() => {
      showSelectionPopup();
    }, 100);
  } else {
    hideSelectionPopup();
  }
});

// Hide popup when clicking outside
document.addEventListener('mousedown', (e) => {
  if (selectionPopup && !selectionPopup.contains(e.target as Node)) {
    hideSelectionPopup();
  }
});

// Hide popup when selection changes
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  if (!selection || !selection.toString().trim()) {
    hideSelectionPopup();
  }
});

// Update popup position when scrolling while text is selected
document.addEventListener('scroll', () => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim() && selectionPopup && selectionPopup.style.display !== 'none') {
    // Immediate update - no throttling, no delays
    showSelectionPopup();
  }
});

// Content monitoring variables
let contentObserver: MutationObserver | null = null;
let lastContentHash: string = '';

// Function to create content hash
function createContentHash(text: string): string {
  let hash = 0;
  if (text.length === 0) return hash.toString();
  
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString();
}

// Function to start content monitoring
function startContentMonitoring() {
  if (contentObserver) {
    contentObserver.disconnect();
  }
  
  console.log('🦊 Starting content monitoring...');
  
  contentObserver = new MutationObserver((mutations) => {
    // Filter out mutations from extension elements
    const relevantMutations = mutations.filter(mutation => {
      const target = mutation.target as Element;
      return !target.closest('.chat-panel') && 
             !target.closest('#focus-fox-extension') &&
             !target.classList.contains('fox-btn');
    });
    
    if (relevantMutations.length > 0) {
      // Check if content actually changed
      const currentContent = document.body.textContent || '';
      const currentHash = createContentHash(currentContent);
      
             if (currentHash !== lastContentHash) {
         console.log('🦊 Content change detected');
         lastContentHash = currentHash;
         
         // Notify sidebar about content change via Chrome runtime
         chrome.runtime.sendMessage({
           type: 'CONTENT_CHANGED'
         }).catch((error: any) => {
           console.error('🦊 Error sending content change notification:', error);
         });
       }
    }
  });
  
  // Start observing
  contentObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true
  });
  
  // Set initial hash
  lastContentHash = createContentHash(document.body.textContent || '');
}

// Listen for messages from sidebar via Chrome runtime
chrome.runtime.onMessage.addListener((message: any, _sender: any, sendResponse: any) => {
  console.log('🦊 Content script received Chrome message:', message);
  
  if (message.type === 'EXTRACT_AND_SEND_CONTENT') {
    console.log('🦊 Content script received extract request');
    extractAndSendContentFromMainPage();
  } else if (message.type === 'START_CONTENT_MONITORING') {
    console.log('🦊 Starting content monitoring...');
    startContentMonitoring();
  }
  
  // Send response back
  sendResponse({ success: true });
});

// Function to extract and send content from main page context
async function extractAndSendContentFromMainPage() {
  try {
    console.log('🦊 Extracting content from main page...');
    
    // Simple content extraction for main page
    const content = {
      title: document.title,
      content: document.body.innerHTML,
      textContent: document.body.textContent || '',
      length: document.body.textContent?.length || 0,
      excerpt: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      byline: '',
      siteName: window.location.hostname,
      publishedTime: ''
    };
    
    const metadata = {
      url: window.location.href,
      title: document.title,
      domain: window.location.hostname,
      timestamp: new Date().toISOString()
    };
    
    console.log('📄 Extracted content:', {
      title: content.title,
      contentLength: content.textContent.length,
      url: metadata.url
    });
    
    try {
      const response = await fetch('http://localhost:8787/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.textContent,
          role: "user"
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Content sent to backend successfully from main page');
      
      return result;
    } catch (error) {
      console.error('❌ Failed to send content to backend:', error);
    }
  } catch (error) {
    console.error('❌ Error extracting content from main page:', error);
  }
}

// Initialize selection popup
createSelectionPopup(); 