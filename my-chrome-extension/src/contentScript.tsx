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
// @ts-ignore
import foxPngUrl from './assets/fox.png?url';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const chrome: any;

console.log('Content script running: attempting to render chat button');

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

let root: ReactDOMRoot | null = null;

// --- Drag and Toggle Logic ---
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let dragMoved = false;
let panelOpen = false;

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
  panelOpen = !panelOpen;
  if (panelOpen) {
    container!.style.display = 'flex';
    if (!root) {
      root = createRoot(container!);
    }
    // Render the chat panel. The ChatPanel component handles user input and can send messages to the backend.
    root.render(
      <ChatPanel onClose={() => {
        // When the panel is closed (via the × button), hide the panel and update state
        root!.render(null);
        container!.style.display = 'none';
        panelOpen = false;
        document.body.appendChild(btn); // ensure button is last
      }} />
    );
    document.body.appendChild(btn); // ensure button is last
  } else {
    // Hide the panel if open
    root!.render(null);
    container!.style.display = 'none';
    document.body.appendChild(btn); // ensure button is last
  }
});

// --- Button Hover Styling ---
btn.addEventListener('mouseenter', () => {
  btn.style.background = '#ff7a3a';
});
btn.addEventListener('mouseleave', () => {
  btn.style.background = '#ff5c1a';
});

// --- ChatPanel Component ---
// Handles chat UI, user input, and can be extended to send/receive messages from a backend API.
// See ChatPanel.tsx for details. 