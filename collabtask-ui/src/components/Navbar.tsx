import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Button, NotificationCenter } from './index';
// Mock bildirimler kaldırıldı; boş dizi ile başla

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navbarStyles: React.CSSProperties = {
    backgroundColor: 'var(--white)',
    borderBottom: '1px solid var(--gray-200)',
    padding: '0',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: 'var(--shadow-sm)',
  };

  const containerStyles: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 var(--spacing-lg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
  };

  const logoStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--primary-color)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
  };

  const desktopNavStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xl)',
  };

  const userSectionStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
  };

  const userInfoStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  };

  const userNameStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--gray-900)',
    margin: 0,
  };

  const userEmailStyles: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--gray-500)',
    margin: 0,
  };

  const avatarStyles: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-color)',
    color: 'var(--white)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 600,
  };

  const hamburgerStyles: React.CSSProperties = {
    display: 'none',
    flexDirection: 'column',
    cursor: 'pointer',
    padding: 'var(--spacing-sm)',
    border: 'none',
    backgroundColor: 'transparent',
    gap: '4px',
  };

  const hamburgerLineStyles: React.CSSProperties = {
    width: '24px',
    height: '3px',
    backgroundColor: 'var(--gray-700)',
    borderRadius: '2px',
    transition: 'all 0.3s ease',
  };

  const mobileMenuStyles: React.CSSProperties = {
    position: 'absolute',
    top: '64px',
    left: 0,
    right: 0,
    backgroundColor: 'var(--white)',
    borderBottom: '1px solid var(--gray-200)',
    boxShadow: 'var(--shadow-lg)',
    padding: 'var(--spacing-lg)',
    display: isMobileMenuOpen ? 'block' : 'none',
    zIndex: 999,
  };

  const mobileNavLinkStyles: React.CSSProperties = {
    display: 'block',
    padding: 'var(--spacing-md) 0',
    color: 'var(--gray-700)',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: 500,
    borderBottom: '1px solid var(--gray-100)',
  };

  const mobileUserSectionStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
    paddingTop: 'var(--spacing-lg)',
    borderTop: '1px solid var(--gray-200)',
    marginTop: 'var(--spacing-lg)',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', active: window.location.pathname === '/dashboard' },
    { href: '/projects', label: 'Projeler', active: window.location.pathname === '/projects' },
    { href: '/kanban', label: 'Kanban', active: window.location.pathname === '/kanban' },
    { href: '/users', label: 'Kullanıcılar', active: window.location.pathname === '/users' },
  ];

  return (
    <>
      <nav style={navbarStyles}>
        <div style={containerStyles}>
          {/* Logo */}
          <a href={isAuthenticated ? "/dashboard" : "/"} style={logoStyles}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'var(--primary-color)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--white)',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              CT
            </div>
            <span style={{ display: window.innerWidth < 480 ? 'none' : 'inline' }}>
              CollabTask
            </span>
          </a>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div style={desktopNavStyles} className="navbar-navigation">
              {navLinks.map((link) => (
                <a 
                  key={link.href}
                  href={link.href} 
                  style={{ 
                    color: 'var(--gray-700)', 
                    textDecoration: 'none', 
                    fontSize: '14px',
                    fontWeight: 500,
                    padding: 'var(--spacing-sm) 0',
                    borderBottom: link.active ? '2px solid var(--primary-color)' : 'none'
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* Desktop User Section */}
          <div style={userSectionStyles} className="navbar-user-section">
            {isAuthenticated && user ? (
              <>
                <NotificationCenter
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onDeleteNotification={handleDeleteNotification}
                />
                
                <div style={userInfoStyles} className="navbar-user-info">
                  <div style={userNameStyles}>{user.name}</div>
                  <div style={userEmailStyles}>{user.email}</div>
                </div>
                
                <div
                  style={{ ...avatarStyles, cursor: 'pointer' }}
                  onClick={() => window.location.href = '/profile'}
                  title="Profil"
                >
                  {getInitials(user.name)}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="hidden lg:block"
                >
                  Çıkış
                </Button>

                {/* Mobile Hamburger Menu */}
                <button
                  style={hamburgerStyles}
                  className="lg:hidden"
                  onClick={toggleMobileMenu}
                  aria-label="Menu"
                >
                  <div style={{
                    ...hamburgerLineStyles,
                    transform: isMobileMenuOpen ? 'rotate(45deg) translate(6px, 6px)' : 'none'
                  }}></div>
                  <div style={{
                    ...hamburgerLineStyles,
                    opacity: isMobileMenuOpen ? 0 : 1
                  }}></div>
                  <div style={{
                    ...hamburgerLineStyles,
                    transform: isMobileMenuOpen ? 'rotate(-45deg) translate(6px, -6px)' : 'none'
                  }}></div>
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.location.href = '/login'}
                >
                  Giriş Yap
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => window.location.href = '/signup'}
                >
                  Kayıt Ol
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isAuthenticated && (
        <div style={mobileMenuStyles} className="lg:hidden">
          {/* Navigation Links */}
          {navLinks.map((link) => (
            <a 
              key={link.href}
              href={link.href}
              style={{
                ...mobileNavLinkStyles,
                color: link.active ? 'var(--primary-color)' : 'var(--gray-700)',
                fontWeight: link.active ? 600 : 500
              }}
              onClick={closeMobileMenu}
            >
              {link.label}
            </a>
          ))}

          {/* Mobile User Section */}
          <div style={mobileUserSectionStyles}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <div
                style={{ ...avatarStyles, cursor: 'pointer' }}
                onClick={() => {
                  window.location.href = '/profile';
                  closeMobileMenu();
                }}
              >
                {user && getInitials(user.name)}
              </div>
              <div>
                <div style={userNameStyles}>{user?.name}</div>
                <div style={userEmailStyles}>{user?.email}</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <Button 
                variant="outline" 
                size="md"
                onClick={() => {
                  window.location.href = '/profile';
                  closeMobileMenu();
                }}
                style={{ flex: 1 }}
              >
                Profil
              </Button>
              <Button 
                variant="secondary" 
                size="md" 
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                style={{ flex: 1, backgroundColor: 'var(--error-color)', color: 'var(--white)' }}
              >
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @media (max-width: 1023px) {
            .navbar-navigation {
              display: none !important;
            }
            
            .lg\\:hidden {
              display: flex !important;
            }
            
            .lg\\:block {
              display: none !important;
            }
          }
          
          @media (min-width: 1024px) {
            .lg\\:hidden {
              display: none !important;
            }
            
            .lg\\:block {
              display: block !important;
            }
          }
          
          @media (max-width: 767px) {
            .navbar-user-info {
              display: none !important;
            }
            
            .navbar-container {
              padding: 0 var(--spacing-md) !important;
            }
          }
        `
      }} />
    </>
  );
}; 