import React from 'react';
import { Layout, Card, Button } from '../components';
import { useAuthStore } from '../store/authStore';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  const heroSectionStyles: React.CSSProperties = {
    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)',
    color: 'var(--white)',
    padding: 'var(--spacing-2xl) 0',
    textAlign: 'center',
  };

  const containerStyles: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 var(--spacing-lg)',
  };

  const heroContentStyles: React.CSSProperties = {
    maxWidth: '600px',
    margin: '0 auto',
  };

  const heroTitleStyles: React.CSSProperties = {
    fontSize: '3rem',
    fontWeight: 700,
    marginBottom: 'var(--spacing-lg)',
    lineHeight: 1.2,
  };

  const heroDescriptionStyles: React.CSSProperties = {
    fontSize: '1.25rem',
    marginBottom: 'var(--spacing-xl)',
    opacity: 0.9,
    lineHeight: 1.6,
  };

  const featuresSection: React.CSSProperties = {
    padding: 'var(--spacing-2xl) 0',
  };

  const featureGridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 'var(--spacing-xl)',
    marginTop: 'var(--spacing-2xl)',
  };

  const sectionTitleStyles: React.CSSProperties = {
    fontSize: '2.5rem',
    fontWeight: 600,
    textAlign: 'center',
    marginBottom: 'var(--spacing-lg)',
    color: 'var(--gray-900)',
  };

  const featureIconStyles: React.CSSProperties = {
    width: '48px',
    height: '48px',
    backgroundColor: 'var(--primary-light)',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 'var(--spacing-lg)',
    fontSize: '24px',
  };

  const featureTitleStyles: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: 'var(--spacing-md)',
    color: 'var(--gray-900)',
  };

  const featureDescriptionStyles: React.CSSProperties = {
    color: 'var(--gray-600)',
    lineHeight: 1.6,
  };

  const ctaSectionStyles: React.CSSProperties = {
    backgroundColor: 'var(--gray-100)',
    padding: 'var(--spacing-2xl) 0',
    textAlign: 'center',
  };

  const features = [
    {
      icon: '📋',
      title: 'Proje Yönetimi',
      description: 'Projelerinizi düzenleyin, görevleri takip edin ve ekibinizle koordineli çalışın.'
    },
    {
      icon: '👥',
      title: 'Takım Çalışması',
      description: 'Ekip üyelerinizle real-time olarak iş birliği yapın ve iletişim kurun.'
    },
    {
      icon: '📊',
      title: 'İlerleme Takibi',
      description: 'Projenizin ilerlemesini görsel grafiklerle takip edin ve raporlar alın.'
    },
    {
      icon: '⚡',
      title: 'Hızlı ve Verimli',
      description: 'Modern arayüz ile hızlı çalışın ve verimliliğinizi artırın.'
    },
    {
      icon: '🔒',
      title: 'Güvenli',
      description: 'Verileriniz güvenli şekilde saklanır ve korunur.'
    },
    {
      icon: '📱',
      title: 'Responsive',
      description: 'Her cihazda mükemmel çalışır - mobil, tablet ve masaüstü.'
    }
  ];

  if (isAuthenticated && user) {
    return (
      <Layout>
        <div style={heroSectionStyles}>
          <div style={containerStyles}>
            <div style={heroContentStyles}>
              <h1 style={heroTitleStyles}>
                Hoş geldin, {user.name}! 👋
              </h1>
              <p style={heroDescriptionStyles}>
                Projelerinizi yönetmeye ve ekibinizle işbirliği yapmaya hazır mısınız?
              </p>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
                <Button size="lg" variant="secondary">
                  Yeni Proje Oluştur
                </Button>
                <Button size="lg" variant="outline">
                  Projelerim
                </Button>
              </div>
            </div>
          </div>
        </div>

        <section style={featuresSection}>
          <div style={containerStyles}>
            <h2 style={sectionTitleStyles}>Neler Yapabilirsin?</h2>
            <div style={featureGridStyles}>
              {features.map((feature, index) => (
                <Card key={index} padding="lg">
                  <div style={featureIconStyles}>{feature.icon}</div>
                  <h3 style={featureTitleStyles}>{feature.title}</h3>
                  <p style={featureDescriptionStyles}>{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={heroSectionStyles}>
        <div style={containerStyles}>
          <div style={heroContentStyles}>
            <h1 style={heroTitleStyles}>
              Modern Proje Yönetimi
            </h1>
            <p style={heroDescriptionStyles}>
              Ekibinizle birlikte çalışın, projelerinizi takip edin ve hedeflerinize ulaşın.
              CollabTask ile proje yönetimi artık çok daha kolay.
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
              <Button size="lg" variant="secondary" onClick={() => window.location.href = '/signup'}>
                Ücretsiz Başla
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = '/login'}>
                Giriş Yap
              </Button>
            </div>
          </div>
        </div>
      </div>

      <section style={featuresSection}>
        <div style={containerStyles}>
          <h2 style={sectionTitleStyles}>Özellikler</h2>
          <div style={featureGridStyles}>
            {features.map((feature, index) => (
              <Card key={index} padding="lg">
                <div style={featureIconStyles}>{feature.icon}</div>
                <h3 style={featureTitleStyles}>{feature.title}</h3>
                <p style={featureDescriptionStyles}>{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section style={ctaSectionStyles}>
        <div style={containerStyles}>
          <h2 style={sectionTitleStyles}>Hazır mısın?</h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xl)' }}>
            Ekibinle çalışmaya başlamak için bugün kayıt ol.
          </p>
          <Button size="lg" onClick={() => window.location.href = '/signup'}>
            Hemen Başla
          </Button>
        </div>
      </section>
    </Layout>
  );
};