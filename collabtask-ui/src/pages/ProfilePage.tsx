import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Dropdown } from '../components/Dropdown';
import { useAuthStore } from '../store/authStore';
import { usersService } from '../services/users.service';
// 'User' kullanılmadığı için import kaldırıldı

export const ProfilePage: React.FC = () => {
  const { user: currentUser, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    department: '',
    bio: '',
    phone: '',
    location: '',
    avatar: ''
  });

  // Settings state
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'tr',
    timezone: 'Europe/Istanbul',
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  });

  // Load user data on mount
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        title: currentUser.title || '',
        department: currentUser.department || '',
        bio: currentUser.bio || '',
        phone: currentUser.phone || '',
        location: currentUser.location || '',
        avatar: currentUser.avatar || ''
      });
      
      if (currentUser.settings) {
        setSettings(currentUser.settings);
      }
    }
  }, [currentUser]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSettingsChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const response = await usersService.updateProfile(currentUser.id, formData);
      
      if (response.success) {
        // Update auth store with new user data
        await updateUser({ ...currentUser, ...formData });
        setSuccess('Profil başarıyla güncellendi!');
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.error || 'Profil güncellenemedi');
      }
    } catch (err) {
      console.error('Profil güncelleme hatası:', err);
      setError(err instanceof Error ? err.message : 'Profil güncellenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const response = await usersService.updateSettings(currentUser.id, settings);
      
      if (response.success) {
        // Update auth store with new settings
        await updateUser({ ...currentUser, settings });
        setSuccess('Ayarlar başarıyla güncellendi!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.error || 'Ayarlar güncellenemedi');
      }
    } catch (err) {
      console.error('Ayarlar güncelleme hatası:', err);
      setError(err instanceof Error ? err.message : 'Ayarlar güncellenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const currentPassword = prompt('Mevcut şifrenizi girin:');
    if (!currentPassword) return;
    
    const newPassword = prompt('Yeni şifrenizi girin:');
    if (!newPassword) return;
    
    const confirmPassword = prompt('Yeni şifrenizi tekrar girin:');
    if (newPassword !== confirmPassword) {
      alert('Şifreler eşleşmiyor!');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const response = await usersService.changePassword(currentPassword, newPassword);
      
      if (response.success) {
        setSuccess('Şifre başarıyla değiştirildi!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.error || 'Şifre değiştirilemedi');
      }
    } catch (err) {
      console.error('Şifre değiştirme hatası:', err);
      setError(err instanceof Error ? err.message : 'Şifre değiştirilemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Açık' },
    { value: 'dark', label: 'Koyu' },
    { value: 'auto', label: 'Otomatik' }
  ];

  const languageOptions = [
    { value: 'tr', label: 'Türkçe' },
    { value: 'en', label: 'English' }
  ];

  const timezoneOptions = [
    { value: 'Europe/Istanbul', label: 'İstanbul' },
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'New York' }
  ];

  if (!currentUser) {
    return (
        <div className="flex justify-center items-center h-64">
          <div className="text-red-600">Kullanıcı bilgileri yüklenemedi</div>
        </div>
    );
  }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "primary"}
          >
            {isEditing ? 'İptal' : 'Düzenle'}
          </Button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center gap-6 mb-6">
                <Avatar
                  src={formData.avatar}
                  name={formData.name}
                  size="xl"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{formData.name}</h2>
                  <p className="text-gray-600">{formData.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant="success"
                      size="sm"
                    >
                      Aktif
                    </Badge>
                    <span className="text-sm text-gray-500">{formData.title}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ad Soyad
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-posta
                    </label>
                    <Input
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      type="email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ünvan
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departman
                    </label>
                    <Input
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Konum
                    </label>
                    <Input
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hakkımda
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full p-2 border rounded-md disabled:bg-gray-50"
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      İptal
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Settings */}
          <div className="space-y-6">
            {/* Security */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Güvenlik</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className="w-full"
                >
                  Şifre Değiştir
                </Button>
                <p className="text-sm text-gray-600">
                  Son şifre değişikliği: {new Date().toLocaleDateString('tr-TR')}
                </p>
              </div>
            </Card>

            {/* Preferences */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tercihler</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tema
                  </label>
                  <Dropdown
                    trigger={
                      <Button variant="outline" className="w-full">
                        {themeOptions.find(opt => opt.value === settings.theme)?.label || 'Tema Seç'}
                      </Button>
                    }
                    items={themeOptions.map(option => ({
                      id: option.value,
                      label: option.label,
                      onClick: () => handleSettingsChange('theme', option.value)
                    }))}
                    placement="bottom-start"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dil
                  </label>
                  <Dropdown
                    trigger={
                      <Button variant="outline" className="w-full">
                        {languageOptions.find(opt => opt.value === settings.language)?.label || 'Dil Seç'}
                      </Button>
                    }
                    items={languageOptions.map(option => ({
                      id: option.value,
                      label: option.label,
                      onClick: () => handleSettingsChange('language', option.value)
                    }))}
                    placement="bottom-start"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Saat Dilimi
                  </label>
                  <Dropdown
                    trigger={
                      <Button variant="outline" className="w-full">
                        {timezoneOptions.find(opt => opt.value === settings.timezone)?.label || 'Saat Dilimi Seç'}
                      </Button>
                    }
                    items={timezoneOptions.map(option => ({
                      id: option.value,
                      label: option.label,
                      onClick: () => handleSettingsChange('timezone', option.value)
                    }))}
                    placement="bottom-start"
                  />
                </div>

                <Button
                  onClick={handleSaveSettings}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                </Button>
              </div>
            </Card>

            {/* Notifications */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Bildirimler</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">E-posta Bildirimleri</label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) => handleNotificationChange('email', e.target.checked)}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">Push Bildirimleri</label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.push}
                    onChange={(e) => handleNotificationChange('push', e.target.checked)}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">SMS Bildirimleri</label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.sms}
                    onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                    className="rounded"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
  );
}; 