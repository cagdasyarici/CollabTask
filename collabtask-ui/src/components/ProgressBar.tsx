import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  showPercentage?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  showPercentage = false,
  label,
  animated = false,
  striped = false,
  className = '',
  style
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeStyles = {
    sm: { height: '4px' },
    md: { height: '8px' },
    lg: { height: '12px' }
  };

  const variantColors = {
    default: 'var(--primary-color)',
    success: 'var(--success-color)',
    warning: 'var(--warning-color)',
    error: 'var(--error-color)'
  };

  const containerStyles: React.CSSProperties = {
    marginBottom: showLabel || showPercentage ? 'var(--spacing-sm)' : 0,
    ...style
  };

  const labelContainerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--spacing-xs)',
    fontSize: '14px',
    color: 'var(--gray-700)'
  };

  const trackStyles: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'var(--gray-200)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
    ...sizeStyles[size]
  };

  const fillStyles: React.CSSProperties = {
    height: '100%',
    backgroundColor: variantColors[variant],
    width: `${percentage}%`,
    transition: animated ? 'width 0.3s ease' : 'none',
    borderRadius: 'inherit',
    position: 'relative'
  };

  const stripedStyles: React.CSSProperties = striped ? {
    backgroundImage: `linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    )`,
    backgroundSize: '1rem 1rem'
  } : {};

  const animatedStripesStyles: React.CSSProperties = animated && striped ? {
    animation: 'progress-bar-stripes 1s linear infinite'
  } : {};

  return (
    <div className={className} style={containerStyles}>
      {(showLabel || showPercentage) && (
        <div style={labelContainerStyles}>
          {showLabel && (
            <span>{label || 'İlerleme'}</span>
          )}
          {showPercentage && (
            <span>{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      
      <div style={trackStyles}>
        <div 
          style={{
            ...fillStyles,
            ...stripedStyles,
            ...animatedStripesStyles
          }}
        />
      </div>
      
      <style>{`
        @keyframes progress-bar-stripes {
          0% {
            background-position: 1rem 0;
          }
          100% {
            background-position: 0 0;
          }
        }
      `}</style>
    </div>
  );
};

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showPercentage?: boolean;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  showPercentage = true,
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const variantColors = {
    default: 'var(--primary-color)',
    success: 'var(--success-color)',
    warning: 'var(--warning-color)',
    error: 'var(--error-color)'
  };

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const svgStyles: React.CSSProperties = {
    transform: 'rotate(-90deg)',
    width: size,
    height: size
  };

  const backgroundCircleStyles = {
    fill: 'transparent',
    stroke: 'var(--gray-200)',
    strokeWidth
  };

  const progressCircleStyles = {
    fill: 'transparent',
    stroke: variantColors[variant],
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeDasharray,
    strokeDashoffset,
    transition: 'stroke-dashoffset 0.5s ease'
  };

  const percentageStyles: React.CSSProperties = {
    position: 'absolute',
    fontSize: `${size / 6}px`,
    fontWeight: 600,
    color: variantColors[variant]
  };

  return (
    <div className={className} style={containerStyles}>
      <svg style={svgStyles}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          style={backgroundCircleStyles}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          style={progressCircleStyles}
        />
      </svg>
      
      {showPercentage && (
        <div style={percentageStyles}>
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}; 