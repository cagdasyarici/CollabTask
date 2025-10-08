import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeMap = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '600px' },
    lg: { maxWidth: '800px' },
    xl: { maxWidth: '1200px' },
    full: { maxWidth: '95vw', maxHeight: '95vh' }
  };

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 'var(--spacing-lg)',
    overflow: 'auto'
  };

  const modalStyles: React.CSSProperties = {
    backgroundColor: 'var(--white)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-xl)',
    width: '100%',
    ...sizeMap[size],
    maxHeight: size === 'full' ? '95vh' : '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyles: React.CSSProperties = {
    padding: 'var(--spacing-xl)',
    borderBottom: '1px solid var(--gray-200)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '60px'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'var(--gray-900)',
    margin: 0
  };

  const contentStyles: React.CSSProperties = {
    padding: 'var(--spacing-xl)',
    overflow: 'auto',
    flex: 1
  };

  const footerStyles: React.CSSProperties = {
    padding: 'var(--spacing-xl)',
    borderTop: '1px solid var(--gray-200)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--spacing-md)'
  };

  const closeButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 'var(--spacing-sm)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--gray-400)',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div style={overlayStyles} onClick={handleOverlayClick}>
      <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
        {(title || showCloseButton) && (
          <div style={headerStyles}>
            {title && <h2 style={titleStyles}>{title}</h2>}
            {showCloseButton && (
              <button
                style={closeButtonStyles}
                onClick={onClose}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--gray-100)';
                  e.currentTarget.style.color = 'var(--gray-600)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--gray-400)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        )}
        
        <div style={contentStyles}>
          {children}
        </div>
        
        {footer && (
          <div style={footerStyles}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}; 