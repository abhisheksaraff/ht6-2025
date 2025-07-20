// Inject ChatPanel styles directly into the page
import chatPanelCss from './components/ChatPanel.css?raw';
const style = document.createElement('style');
style.textContent = chatPanelCss;
document.head.appendChild(style);

// React and assets imports
import { createRoot } from 'react-dom/client';
import type { Root as ReactDOMRoot } from 'react-dom/client';
import ChatPanel from './components/ChatPanel';
import './App.css';
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
btn.style.zIndex = '2147483660'; // above panel
btn.style.fontSize = '28px';
btn.style.isolation = 'isolate';
document.body.appendChild(btn);

// --- Chat Panel Container Setup ---
const containerId = 'chrome-ext-chat-panel-root';
let container = document.getElementById(containerId);
if (!container) {
  container = document.createElement('div');
  container.id = containerId;
  document.body.appendChild(container);
}
container.style.position = 'fixed';
container.style.top = '0';
container.style.right = '0';
container.style.height = '100vh';
container.style.width = '400px';
container.style.zIndex = '2147483648'; // below button
container.style.display = 'none'; // Hide by default
container.style.flexDirection = 'column';
container.style.boxShadow = '0 0 24px 0 rgba(0,0,0,0.25)';
container.style.background = '#fff'; // Ensure panel has a background
container.style.transition = 'right 0.2s cubic-bezier(.4,0,.2,1)';

let root: ReactDOMRoot | null = null;

// --- Drag and Toggle Logic ---
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let dragMoved = false;
let panelOpen = false;

const PANEL_WIDTH = 400;

function updateContainerPosition(position: 'left' | 'right') {
  if (position === 'left') {
    container!.style.left = '0';
    container!.style.right = '';
  } else {
    container!.style.right = '0';
    container!.style.left = '';
  }
}

function setBodyMargin(open: boolean, position: 'left' | 'right' = 'right') {
  if (open) {
    document.body.style.transition = 'margin-right 0.2s cubic-bezier(.4,0,.2,1), margin-left 0.2s cubic-bezier(.4,0,.2,1)';
    if (position === 'right') {
      document.body.style.marginRight = PANEL_WIDTH + 'px';
      document.body.style.marginLeft = '';
    } else {
      document.body.style.marginLeft = PANEL_WIDTH + 'px';
      document.body.style.marginRight = '';
    }
  } else {
    document.body.style.transition = 'margin-right 0.2s cubic-bezier(.4,0,.2,1), margin-left 0.2s cubic-bezier(.4,0,.2,1)';
    document.body.style.marginRight = '';
    document.body.style.marginLeft = '';
  }
}

function closePanel() {
  if (root) {
    root.render(null);
  }
  container!.style.display = 'none';
  panelOpen = false;
  setBodyMargin(false);
  document.body.appendChild(btn);
}

function openPanel(selectedText?: string) {
  // Get saved panel position
  const savedPosition = localStorage.getItem('chatPanelPosition') || 'right';
  
  panelOpen = true;
  updateContainerPosition(savedPosition as 'left' | 'right');
  setBodyMargin(true, savedPosition as 'left' | 'right');
  container!.style.display = 'flex';
  
  if (!root) {
    root = createRoot(container!);
  }
  
  root.render(
    <ChatPanel onClose={closePanel} initialInputValue={selectedText} />
  );
  document.body.appendChild(btn); // ensure button is last
}

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

// --- Button Click: Toggle Panel ---
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

  // Toggle the chat panel
  if (!panelOpen) {
    openPanel();
  } else {
    closePanel();
  }
});

// --- Message Listener for Panel Position Changes ---
window.addEventListener('message', (event) => {
  if (event.data.type === 'PANEL_POSITION_CHANGE') {
    const { position } = event.data;
    if (panelOpen) {
      // Update container position first
      updateContainerPosition(position);
      
      // Reset all margins first to clear any previous state
      document.body.style.marginRight = '';
      document.body.style.marginLeft = '';
      
      // Then set the new margin based on position
      setBodyMargin(true, position);
    }
  }
});

// --- Button Hover Styling ---
btn.addEventListener('mouseenter', () => {
  btn.style.background = '#ff7a3a';
});
btn.addEventListener('mouseleave', () => {
  btn.style.background = '#ff5c1a';
});

// --- ESC Key Handling ---
document.addEventListener('keydown', (e) => {
  // ESC closes panel
  if (e.key === 'Escape') {
    if (panelOpen) {
      closePanel();
    }
  }
  // Cmd+K (Mac) or Ctrl+K (Win/Linux) toggles panel
  if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    btn.click();
  }
});

// --- ChatPanel Component ---
// Handles chat UI, user input, and can be extended to send/receive messages from a backend API.
// See ChatPanel.tsx for details. 

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
    
    if (panelOpen) {
      // If panel is already open, send the selected text to the existing panel
      // Send message to the existing panel to add the selected text
      window.postMessage({
        type: 'ADD_SELECTED_TEXT',
        text: selectedText
      }, '*');
    } else {
      // Open chat panel with selected text in input
      openPanel(selectedText);
    }
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
  
  // Update content based on panel state
  selectionPopup.innerHTML = panelOpen ? 'Add to chat...' : 'Ask Focus Fox anything...';
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

// Initialize selection popup
createSelectionPopup(); 