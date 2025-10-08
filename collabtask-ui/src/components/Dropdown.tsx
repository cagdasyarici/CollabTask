import React, { useState, useRef, useEffect } from 'react';

interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  divider?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  disabled?: boolean;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  placement = 'bottom-start',
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block'
  };

  const triggerStyles: React.CSSProperties = {
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1
  };

  const placementStyles = {
    'bottom-start': {
      top: '100%',
      left: 0,
      marginTop: '4px'
    },
    'bottom-end': {
      top: '100%',
      right: 0,
      marginTop: '4px'
    },
    'top-start': {
      bottom: '100%',
      left: 0,
      marginBottom: '4px'
    },
    'top-end': {
      bottom: '100%',
      right: 0,
      marginBottom: '4px'
    }
  } as const;

  const menuStyles: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'var(--white)',
    border: '1px solid var(--gray-200)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    minWidth: '160px',
    zIndex: 1000,
    padding: 'var(--spacing-xs) 0',
    ...placementStyles[placement]
  };

  const itemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: 'var(--spacing-sm) var(--spacing-md)',
    fontSize: '14px',
    color: 'var(--gray-700)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    border: 'none',
    background: 'none',
    width: '100%',
    textAlign: 'left'
  };

  const dividerStyles: React.CSSProperties = {
    height: '1px',
    backgroundColor: 'var(--gray-200)',
    margin: 'var(--spacing-xs) 0'
  };

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled && item.onClick) {
      item.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className={className} style={containerStyles}>
      <div style={triggerStyles} onClick={handleTriggerClick}>
        {trigger}
      </div>
      
      {isOpen && (
        <div style={menuStyles}>
          {items.map((item) => (
            <React.Fragment key={item.id}>
              {item.divider ? (
                <div style={dividerStyles} />
              ) : (
                <button
                  style={{
                    ...itemStyles,
                    color: item.danger ? 'var(--error-color)' : 
                           item.disabled ? 'var(--gray-400)' : 'var(--gray-700)',
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    opacity: item.disabled ? 0.5 : 1
                  }}
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={(e) => {
                    if (!item.disabled) {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--gray-50)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                  }}
                  disabled={item.disabled}
                >
                  {item.icon && (
                    <span style={{ marginRight: 'var(--spacing-sm)' }}>
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg' | 'xs';
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Seçin...',
  disabled = false,
  className = '',
  label,
  error,
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%'
  };

  const triggerStyles: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    lineHeight: '20px',
    border: '1px solid var(--gray-300)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: disabled ? 'var(--gray-100)' : 'var(--white)',
    color: selectedOption ? 'var(--gray-900)' : 'var(--gray-400)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.2s ease'
  };

  const dropdownStyles: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'var(--white)',
    border: '1px solid var(--gray-200)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 1000,
    marginTop: '4px',
    maxHeight: '200px',
    overflowY: 'auto'
  };

  const optionStyles: React.CSSProperties = {
    padding: 'var(--spacing-sm) var(--spacing-md)',
    fontSize: '14px',
    color: 'var(--gray-700)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    background: 'none',
    width: '100%',
    textAlign: 'left'
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: 'var(--spacing-sm)'
  };

  const errorStyles: React.CSSProperties = {
    color: 'var(--error-color)',
    fontSize: '12px',
    marginTop: '4px'
  };

  const sizePadding = size === 'xs' ? '6px 10px' : size === 'sm' ? '10px 14px' : size === 'lg' ? '14px 18px' : '12px 16px';

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={className} style={containerStyles}>
      {label && <label style={labelStyles}>{label}</label>}
      <div
        style={{ ...triggerStyles, padding: sizePadding, minHeight: size === 'xs' ? '28px' : 'auto' }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onMouseEnter={(e) => {
          if (!disabled) {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary-color)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--gray-300)';
          }
        }}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </div>

      {isOpen && (
        <div style={dropdownStyles}>
          {options.map((option) => (
            <button
              key={option.value}
              style={{
                ...optionStyles,
                backgroundColor: option.value === value ? 'var(--primary-light)' : 'transparent',
                color: option.disabled ? 'var(--gray-400)' : 'var(--gray-700)',
                cursor: option.disabled ? 'not-allowed' : 'pointer'
              }}
              onClick={() => !option.disabled && handleOptionClick(option.value)}
              onMouseEnter={(e) => {
                if (!option.disabled && option.value !== value) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--gray-50)';
                }
              }}
              onMouseLeave={(e) => {
                if (option.value !== value) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                }
              }}
              disabled={option.disabled}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
      {error && <div style={errorStyles}>{error}</div>}
    </div>
  );
} 