import chatPanelCss from './components/ChatPanel.css?raw';

const style = document.createElement('style');
style.textContent = chatPanelCss;
document.head.appendChild(style);

import { createRoot } from 'react-dom/client';
import type { Root as ReactDOMRoot } from 'react-dom/client';
import ChatPanel from './components/ChatPanel';
import './App.css';

console.log('Content script running: attempting to render chat button');

// Plain DOM floating button
const btn = document.createElement('button');
btn.textContent = '💬';
btn.style.position = 'fixed';
btn.style.bottom = '20px';
btn.style.right = '20px';
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
btn.style.zIndex = '2147483647';
btn.style.fontSize = '28px';
document.body.appendChild(btn);

// React chat panel container
const containerId = 'chrome-ext-chat-panel-root';
let container = document.getElementById(containerId);
if (!container) {
  container = document.createElement('div');
  container.id = containerId;
  document.body.appendChild(container);
}
// Style the container as a fixed right-side panel
container.style.position = 'fixed';
container.style.top = '0';
container.style.right = '0';
container.style.height = '100vh';
container.style.width = '400px';
container.style.zIndex = '2147483647';
container.style.display = 'none'; // Hide by default
container.style.flexDirection = 'column';
container.style.boxShadow = '0 0 24px 0 rgba(0,0,0,0.25)';

let root: ReactDOMRoot | null = null;

btn.addEventListener('click', () => {
  btn.style.display = 'none';
  container!.style.display = 'flex';
  if (!root) {
    root = createRoot(container!);
  }
  root.render(
    <ChatPanel onClose={() => {
      root!.render(null);
      btn.style.display = 'flex';
      container!.style.display = 'none';
    }} />
  );
});
btn.addEventListener('mouseenter', () => {
  btn.style.background = '#ff7a3a';
});
btn.addEventListener('mouseleave', () => {
  btn.style.background = '#ff5c1a';
}); 