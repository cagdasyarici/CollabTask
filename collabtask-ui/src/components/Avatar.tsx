import React from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  shape = 'circle',
  status,
  showStatus = false,
  onClick,
  className = ''
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeMap = {
    xs: { size: 24, fontSize: 10 },
    sm: { size: 32, fontSize: 12 },
    md: { size: 40, fontSize: 14 },
    lg: { size: 48, fontSize: 16 },
    xl: { size: 64, fontSize: 20 }
  };

  const statusColors = {
    online: '#10B981',
    offline: '#6B7280',
    away: '#F59E0B',
    busy: '#EF4444'
  };

  const { size: avatarSize, fontSize } = sizeMap[size];

  const avatarStyles: React.CSSProperties = {
    width: `${avatarSize}px`,
    height: `${avatarSize}px`,
    borderRadius: shape === 'circle' ? '50%' : 'var(--radius-md)',
    backgroundColor: src ? 'transparent' : 'var(--primary-color)',
    color: 'var(--white)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${fontSize}px`,
    fontWeight: 600,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    position: 'relative',
    overflow: 'hidden',
    border: '2px solid var(--white)',
    boxShadow: 'var(--shadow-sm)'
  };

  const imageStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  };

  const statusStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: `${Math.max(8, avatarSize * 0.25)}px`,
    height: `${Math.max(8, avatarSize * 0.25)}px`,
    borderRadius: '50%',
    backgroundColor: status ? statusColors[status] : statusColors.offline,
    border: '2px solid var(--white)',
    zIndex: 1
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.transform = 'scale(1.05)';
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
    }
  };

  return (
    <div
      className={className}
      style={avatarStyles}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={name}
    >
      {src ? (
        <img src={src} alt={name} style={imageStyles} />
      ) : (
        getInitials(name)
      )}
      
      {showStatus && status && (
        <div style={statusStyles} />
      )}
    </div>
  );
};

interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    name: string;
    id: string;
  }>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  max?: number;
  spacing?: 'tight' | 'normal' | 'loose';
  onClick?: (id: string) => void;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  size = 'md',
  max = 5,
  spacing = 'normal',
  onClick
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = Math.max(0, avatars.length - max);

  const spacingMap = {
    tight: -8,
    normal: -4,
    loose: 0
  };

  const groupStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center'
  };

  const sizeMap = {
    xs: { size: 24, fontSize: 10 },
    sm: { size: 32, fontSize: 12 },
    md: { size: 40, fontSize: 14 },
    lg: { size: 48, fontSize: 16 },
    xl: { size: 64, fontSize: 20 }
  };

  const moreAvatarStyles: React.CSSProperties = {
    width: `${sizeMap[size].size}px`,
    height: `${sizeMap[size].size}px`,
    borderRadius: '50%',
    backgroundColor: 'var(--gray-200)',
    color: 'var(--gray-600)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${sizeMap[size].fontSize}px`,
    fontWeight: 600,
    border: '2px solid var(--white)',
    boxShadow: 'var(--shadow-sm)',
    marginLeft: `${spacingMap[spacing]}px`
  };

  return (
    <div style={groupStyles}>
      {visibleAvatars.map((avatar, index) => (
        <div
          key={avatar.id}
          style={{ marginLeft: index > 0 ? `${spacingMap[spacing]}px` : 0 }}
        >
          <Avatar
            src={avatar.src}
            name={avatar.name}
            size={size}
            onClick={onClick ? () => onClick(avatar.id) : undefined}
          />
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div style={moreAvatarStyles}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
}; 