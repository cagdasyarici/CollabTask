import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  style,
  ...props
}) => {
  const getButtonStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 500,
      fontFamily: 'inherit',
      border: '1px solid',
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      textDecoration: 'none',
      opacity: disabled || isLoading ? 0.6 : 1,
    };

    const sizeStyles = {
      sm: {
        padding: '6px 12px',
        fontSize: '14px',
        borderRadius: 'var(--radius-md)',
      },
      md: {
        padding: '8px 16px',
        fontSize: '14px',
        borderRadius: 'var(--radius-md)',
      },
      lg: {
        padding: '12px 24px',
        fontSize: '16px',
        borderRadius: 'var(--radius-lg)',
      },
    };

    const variantStyles = {
      primary: {
        backgroundColor: 'var(--primary-color)',
        borderColor: 'var(--primary-color)',
        color: 'var(--white)',
        boxShadow: 'var(--shadow-sm)',
      },
      secondary: {
        backgroundColor: 'var(--gray-100)',
        borderColor: 'var(--gray-300)',
        color: 'var(--gray-900)',
        boxShadow: 'var(--shadow-sm)',
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: 'var(--primary-color)',
        color: 'var(--primary-color)',
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        color: 'var(--gray-600)',
      },
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    
    const button = e.currentTarget;
    if (variant === 'primary') {
      button.style.backgroundColor = 'var(--primary-hover)';
      button.style.boxShadow = 'var(--shadow-md)';
    } else if (variant === 'secondary') {
      button.style.backgroundColor = 'var(--gray-200)';
      button.style.boxShadow = 'var(--shadow-md)';
    } else if (variant === 'outline') {
      button.style.backgroundColor = 'var(--primary-light)';
    } else if (variant === 'ghost') {
      button.style.backgroundColor = 'var(--gray-100)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    
    const button = e.currentTarget;
    if (variant === 'primary') {
      button.style.backgroundColor = 'var(--primary-color)';
      button.style.boxShadow = 'var(--shadow-sm)';
    } else if (variant === 'secondary') {
      button.style.backgroundColor = 'var(--gray-100)';
      button.style.boxShadow = 'var(--shadow-sm)';
    } else if (variant === 'outline') {
      button.style.backgroundColor = 'transparent';
    } else if (variant === 'ghost') {
      button.style.backgroundColor = 'transparent';
    }
  };

  return (
    <button
      style={getButtonStyles()}
      disabled={disabled || isLoading}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {isLoading && (
        <svg
          style={{ 
            animation: 'spin 1s linear infinite',
            marginRight: '8px',
            width: '16px',
            height: '16px'
          }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            style={{ opacity: 0.25 }}
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            style={{ opacity: 0.75 }}
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}; 