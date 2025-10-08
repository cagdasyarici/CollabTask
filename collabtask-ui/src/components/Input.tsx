import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  style,
  ...props
}) => {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const getInputStyles = (): React.CSSProperties => ({
    width: '100%',
    padding: leftIcon || rightIcon ? '12px 16px 12px 40px' : '12px 16px',
    fontSize: '14px',
    lineHeight: '20px',
    border: `1px solid ${error ? 'var(--error-color)' : 'var(--gray-300)'}`,
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--white)',
    color: 'var(--gray-900)',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    outline: 'none',
    ...style
  });

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    marginBottom: 'var(--spacing-md)',
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--gray-700)',
    marginBottom: 'var(--spacing-sm)',
  };

  const iconStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--gray-400)',
    pointerEvents: 'none',
    zIndex: 1,
  };

  const leftIconStyles: React.CSSProperties = {
    ...iconStyles,
    left: '12px',
  };

  const rightIconStyles: React.CSSProperties = {
    ...iconStyles,
    right: '12px',
  };

  const errorStyles: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--error-color)',
    marginTop: 'var(--spacing-xs)',
  };

  const helperTextStyles: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--gray-500)',
    marginTop: 'var(--spacing-xs)',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = error ? 'var(--error-color)' : 'var(--primary-color)';
    e.target.style.boxShadow = error 
      ? '0 0 0 3px rgba(239, 68, 68, 0.1)'
      : '0 0 0 3px rgba(79, 70, 229, 0.1)';
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = error ? 'var(--error-color)' : 'var(--gray-300)';
    e.target.style.boxShadow = 'none';
    props.onBlur?.(e);
  };

  return (
    <div style={containerStyles}>
      {label && (
        <label htmlFor={inputId} style={labelStyles}>
          {label}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        {leftIcon && (
          <div style={leftIconStyles}>
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          style={getInputStyles()}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {rightIcon && (
          <div style={rightIconStyles}>
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && <div style={errorStyles}>{error}</div>}
      {helperText && !error && <div style={helperTextStyles}>{helperText}</div>}
    </div>
  );
}; 