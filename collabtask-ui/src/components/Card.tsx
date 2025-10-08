import React from 'react';

interface CardProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'lg',
  shadow = 'md',
  rounded = 'lg',
  className = '',
  style,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
  const getCardStyles = (): React.CSSProperties => {
    const paddingMap = {
      sm: 'var(--spacing-md)',
      md: 'var(--spacing-lg)',
      lg: 'var(--spacing-xl)',
      xl: 'var(--spacing-2xl)',
    };

    const shadowMap = {
      sm: 'var(--shadow-sm)',
      md: 'var(--shadow-md)',
      lg: 'var(--shadow-lg)',
      xl: 'var(--shadow-xl)',
    };

    const roundedMap = {
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
    };

    return {
      backgroundColor: 'var(--white)',
      border: '1px solid var(--gray-200)',
      borderRadius: roundedMap[rounded],
      boxShadow: shadowMap[shadow],
      padding: paddingMap[padding],
      transition: 'all 0.2s ease',
      ...style,
    };
  };

  return (
    <div 
      className={className}
      style={getCardStyles()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  );
}; 