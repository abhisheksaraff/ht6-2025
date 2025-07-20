import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = '#ff5c1a',
  text = 'Processing your request...'
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="loading-spinner-container">
      <div className={`loading-spinner ${sizeClasses[size]}`}>
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            stroke={color} 
            strokeWidth="3"
            strokeOpacity="0.3"
            fill="none"
          />
          <path 
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            className="loading-spinner-path"
          />
        </svg>
      </div>
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
}; 