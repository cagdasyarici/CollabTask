import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill';
  dot?: boolean;
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  dot = false,
  count,
  maxCount = 99,
  showZero = false,
  className = ''
}) => {
  const variantStyles = {
    default: {
      backgroundColor: 'var(--gray-100)',
      color: 'var(--gray-700)',
      border: '1px solid var(--gray-200)'
    },
    primary: {
      backgroundColor: 'var(--primary-color)',
      color: 'var(--white)',
      border: '1px solid var(--primary-color)'
    },
    success: {
      backgroundColor: 'var(--success-color)',
      color: 'var(--white)',
      border: '1px solid var(--success-color)'
    },
    warning: {
      backgroundColor: 'var(--warning-color)',
      color: 'var(--white)',
      border: '1px solid var(--warning-color)'
    },
    error: {
      backgroundColor: 'var(--error-color)',
      color: 'var(--white)',
      border: '1px solid var(--error-color)'
    },
    info: {
      backgroundColor: '#3B82F6',
      color: 'var(--white)',
      border: '1px solid #3B82F6'
    }
  };

  const sizeStyles = {
    xs: {
      padding: '1px 4px',
      fontSize: '9px',
      minHeight: '14px'
    },
    sm: {
      padding: '2px 6px',
      fontSize: '10px',
      minHeight: '16px'
    },
    md: {
      padding: '4px 8px',
      fontSize: '12px',
      minHeight: '20px'
    },
    lg: {
      padding: '6px 12px',
      fontSize: '14px',
      minHeight: '24px'
    }
  };

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 500,
    borderRadius: shape === 'pill' ? '999px' : 'var(--radius-sm)',
    transition: 'all 0.2s ease',
    ...variantStyles[variant],
    ...sizeStyles[size]
  };

  if (dot) {
    const dotStyles: React.CSSProperties = {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      ...variantStyles[variant]
    };
    return <div className={className} style={dotStyles} />;
  }

  if (typeof count === 'number') {
    if (count === 0 && !showZero) return null;
    
    const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
    
    return (
      <div className={className} style={baseStyles}>
        {displayCount}
      </div>
    );
  }

  return (
    <div className={className} style={baseStyles}>
      {children}
    </div>
  );
};

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'paused' | 'archived';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const statusConfig = {
    active: { label: 'Aktif', variant: 'success' as const },
    inactive: { label: 'Pasif', variant: 'default' as const },
    pending: { label: 'Beklemede', variant: 'warning' as const },
    completed: { label: 'Tamamlandı', variant: 'success' as const },
    paused: { label: 'Duraklatıldı', variant: 'warning' as const },
    archived: { label: 'Arşivlendi', variant: 'default' as const }
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size={size} shape="pill">
      {config.label}
    </Badge>
  );
};

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const priorityConfig = {
    low: { label: 'Düşük', variant: 'default' as const, icon: '⬇️' },
    medium: { label: 'Orta', variant: 'info' as const, icon: '➡️' },
    high: { label: 'Yüksek', variant: 'warning' as const, icon: '⬆️' },
    urgent: { label: 'Acil', variant: 'error' as const, icon: '🔥' }
  };

  const config = priorityConfig[priority];

  return (
    <Badge variant={config.variant} size={size} shape="pill">
      <span style={{ marginRight: '4px' }}>{config.icon}</span>
      {config.label}
    </Badge>
  );
}; 