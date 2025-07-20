interface ChatHeaderProps {
  panelPosition: 'left' | 'right';
  showSettingsDropdown: boolean;
  onSettingsClick: () => void;
  onPositionChange: (position: 'left' | 'right') => void;
  onClose: () => void;
}

export default function ChatHeader({
  panelPosition,
  showSettingsDropdown,
  onSettingsClick,
  onPositionChange,
  onClose
}: ChatHeaderProps) {
  return (
    <div className="chat-header">
      <h3>Focus Fox</h3>
      <div className="header-buttons">
        <div className="settings-container">
          <button className="settings-btn" onClick={onSettingsClick}>
            ⋯
          </button>
          {showSettingsDropdown && (
            <div className="settings-dropdown">
              <div className="dropdown-item" onClick={() => onPositionChange('left')}>
                <span>Panel: Left</span>
                {panelPosition === 'left' && <span className="check">✓</span>}
              </div>
              <div className="dropdown-item" onClick={() => onPositionChange('right')}>
                <span>Panel: Right</span>
                {panelPosition === 'right' && <span className="check">✓</span>}
              </div>
            </div>
          )}
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
    </div>
  );
} 