import React, { useState } from 'react';
import { Card, Input, Button } from '../components';
import { useAuthStore } from '../store/authStore';
import type { SignupRequest } from '../types';

export const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState<SignupRequest>({
    name: '',
    email: '',
    password: '',
  });
  
  const { setError, clearError, register, isLoading, error } = useAuthStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      clearError();
      
      // Real API call using useAuthStore register method
      const success = await register(formData);
      
      if (success) {
        // Redirect to home page
        window.location.href = '/';
      }
      // Error handling is managed by useAuthStore
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Kayıt olurken bir hata oluştu';
      setError(errorMessage);
    }
  };

  const containerStyles: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-xl)',
    backgroundColor: 'var(--gray-50)',
  };

  const formContainerStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: '400px',
  };

  const logoStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-sm)',
    marginBottom: 'var(--spacing-xl)',
    textDecoration: 'none',
    color: 'var(--primary-color)',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: 600,
    textAlign: 'center',
    marginBottom: 'var(--spacing-sm)',
    color: 'var(--gray-900)',
  };

  const subtitleStyles: React.CSSProperties = {
    textAlign: 'center',
    color: 'var(--gray-600)',
    marginBottom: 'var(--spacing-xl)',
  };

  const errorStyles: React.CSSProperties = {
    backgroundColor: 'var(--error-light)',
    border: '1px solid var(--error-color)',
    color: 'var(--error-color)',
    padding: 'var(--spacing-md)',
    borderRadius: 'var(--radius-md)',
    marginBottom: 'var(--spacing-lg)',
    fontSize: '14px',
  };

  const footerStyles: React.CSSProperties = {
    textAlign: 'center',
    marginTop: 'var(--spacing-xl)',
    color: 'var(--gray-600)',
    fontSize: '14px',
  };

  return (
      <div style={containerStyles}>
        <div style={formContainerStyles}>
          {/* Logo */}
          <a href="/" style={logoStyles}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'var(--primary-color)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--white)',
              fontWeight: 'bold',
              fontSize: '20px'
            }}>
              CT
            </div>
            <span style={{ fontSize: '24px', fontWeight: 700 }}>CollabTask</span>
          </a>

          <Card padding="xl">
            <h1 style={titleStyles}>Kayıt Ol</h1>
            <p style={subtitleStyles}>
              Hesabınızı oluşturun ve ekibinizle çalışmaya başlayın
            </p>
            
            <form onSubmit={handleSubmit}>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                label="Ad Soyad"
                placeholder="Adınızı ve soyadınızı girin"
                required
                leftIcon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                }
              />

              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                label="Email"
                placeholder="Email adresinizi girin"
                required
                leftIcon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                }
              />

              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                label="Şifre"
                placeholder="Şifrenizi girin (en az 6 karakter)"
                required
                minLength={6}
                helperText="Şifreniz en az 6 karakter olmalıdır"
                leftIcon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                }
              />

              {error && (
                <div style={errorStyles}>
                  {error}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                style={{ width: '100%', marginBottom: 'var(--spacing-lg)' }}
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
              </Button>
            </form>

            <div style={footerStyles}>
              Zaten hesabınız var mı?{' '}
              <a href="/login">
                Giriş Yap
              </a>
            </div>
          </Card>
        </div>
      </div>
  );
}; 