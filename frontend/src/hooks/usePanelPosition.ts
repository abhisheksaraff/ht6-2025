import { useEffect, useState } from 'react';

export function usePanelPosition() {
  const [panelPosition, setPanelPosition] = useState<'right' | 'left'>('right');
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  // Load saved panel position on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('chatPanelPosition');
    if (savedPosition === 'left' || savedPosition === 'right') {
      setPanelPosition(savedPosition);
    }
  }, []);

  // Save panel position when it changes
  useEffect(() => {
    localStorage.setItem('chatPanelPosition', panelPosition);
  }, [panelPosition]);

  const handlePositionChange = (position: 'left' | 'right') => {
    if (position !== panelPosition) {
      // Start animation sequence
      const panel = document.querySelector('.chat-panel') as HTMLElement;
      if (panel) {
        // Stage 1: Close panel
        panel.style.transform = 'translateX(100%)';
        panel.style.transition = 'transform 0.3s ease-in-out';
        
        setTimeout(() => {
          // Stage 2: Update position and push content
          setPanelPosition(position);
          setShowSettingsDropdown(false);

          // Notify content script to adjust webpage content
          window.postMessage({
            type: 'PANEL_POSITION_CHANGE',
            position: position
          }, '*');
          
          // Stage 3: Reopen panel
          setTimeout(() => {
            panel.style.transform = 'translateX(0)';
          }, 50);
          
          // Reset transition after animation
          setTimeout(() => {
            panel.style.transition = '';
            panel.style.transform = '';
          }, 350);
        }, 300);
      }
    } else {
      setShowSettingsDropdown(false);
    }
  };

  const handleSettingsClick = () => {
    setShowSettingsDropdown(!showSettingsDropdown);
  };

  return {
    panelPosition,
    showSettingsDropdown,
    handlePositionChange,
    handleSettingsClick
  };
} 