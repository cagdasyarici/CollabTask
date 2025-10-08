import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Dropdown';
import { Card } from './Card';
import { teamsService } from '../services/teams.service';
import { usersService } from '../services/users.service';
import type { Team, User } from '../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (projectData: {
    name: string;
    description: string;
    status: 'active' | 'completed' | 'planning' | 'on_hold';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: string;
    teamIds: string[];
    memberIds: string[];
    tags: string[];
    ownerId: string;
  }) => void;
}

interface ProjectFormData {
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  color: string;
  icon: string;
  tags: string[];
  teamId?: string;
  memberIds: string[];
  budget?: number;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  visibility: 'private' | 'team' | 'public';
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    color: '#3B82F6',
    icon: '📁',
    tags: [],
    memberIds: [],
    status: 'planning',
    visibility: 'team'
  });

  const [newTag, setNewTag] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<User[]>([]);

  // Load teams and users from backend
  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;
      
      try {
        const [teamsRes, usersRes] = await Promise.all([
          teamsService.getTeams(),
          usersService.getUsers()
        ]);

        if (teamsRes.success && teamsRes.data) {
          setTeams(teamsRes.data);
        }
        if (usersRes.success && usersRes.data) {
          setMembers(usersRes.data);
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      }
    };

    loadData();
  }, [isOpen]);

  const projectColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const projectIcons = [
    '📁', '🚀', '💼', '🎯', '⚡', '🔥', '💡', '🌟',
    '🛠️', '📊', '🎨', '💻', '📱', '🌐', '⚙️', '📈'
  ];

  const handleInputChange = (field: keyof ProjectFormData, value: string | string[] | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleMemberToggle = (memberId: string) => {
    const newMembers = selectedMembers.includes(memberId)
      ? selectedMembers.filter(id => id !== memberId)
      : [...selectedMembers, memberId];
    setSelectedMembers(newMembers);
    handleInputChange('memberIds', newMembers);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Dosya seçildi:', file.name);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate,
        teamIds: formData.teamId ? [formData.teamId] : [],
        memberIds: formData.memberIds,
        tags: formData.tags,
        ownerId: '1' // This should come from current user
      };
      
      onSuccess(projectData);
      onClose();
    } catch (error) {
      console.error('Proje oluşturma hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== '' && formData.description.trim() !== '';
      case 2:
        return formData.dueDate !== '';
      case 3:
        return true;
      default:
        return false;
    }
  };

  const stepTitles = [
    'Temel Bilgiler',
    'Proje Detayları', 
    'Takım ve Ayarlar'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Yeni Proje Oluştur"
      size="xl"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
            Adım {currentStep} / 3: {stepTitles[currentStep - 1]}
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevious}>
                Önceki
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              İptal
            </Button>
            {currentStep < 3 ? (
              <Button 
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                Sonraki
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Oluşturuluyor...' : 'Proje Oluştur'}
              </Button>
            )}
          </div>
        </div>
      }
    >
      {/* Progress Steps */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          {[1, 2, 3].map((step) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 600,
                backgroundColor: step <= currentStep ? 'var(--primary-color)' : 'var(--gray-200)',
                color: step <= currentStep ? 'var(--white)' : 'var(--gray-600)'
              }}>
                {step}
              </div>
              {step < 3 && (
                <div style={{
                  width: '60px',
                  height: '2px',
                  marginLeft: 'var(--spacing-sm)',
                  marginRight: 'var(--spacing-sm)',
                  backgroundColor: step < currentStep ? 'var(--primary-color)' : 'var(--gray-200)'
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 1 && (
        <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
          {/* Proje Adı */}
          <Input
            label="Proje Adı *"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Örn: Yeni Web Sitesi"
          />

          {/* Açıklama */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>
              Proje Açıklaması *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Projenizin amacını ve kapsamını açıklayın..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Görsel Seçimi */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
            {/* Renk Seçimi */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>
                Proje Rengi
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-sm)' }}>
                {projectColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleInputChange('color', color)}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: `3px solid ${formData.color === color ? 'var(--gray-800)' : 'var(--gray-200)'}`,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: color,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: formData.color === color ? 'scale(1.1)' : 'scale(1)'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* İkon Seçimi */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>
                Proje İkonu
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-sm)' }}>
                {projectIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => handleInputChange('icon', icon)}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: `2px solid ${formData.icon === icon ? 'var(--primary-color)' : 'var(--gray-200)'}`,
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      cursor: 'pointer',
                      backgroundColor: formData.icon === icon ? 'var(--primary-light)' : 'var(--white)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Önizleme */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>
              Önizleme
            </label>
            <Card style={{ padding: 'var(--spacing-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  backgroundColor: formData.color + '20',
                  color: formData.color
                }}>
                  {formData.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, marginBottom: 'var(--spacing-xs)' }}>
                    {formData.name || 'Proje Adı'}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--gray-600)', margin: 0 }}>
                    {formData.description || 'Proje açıklaması buraya gelecek...'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
            {/* Öncelik */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>
                Öncelik *
              </label>
              <Select
                value={formData.priority}
                onChange={(value) => handleInputChange('priority', value)}
                options={[
                  { value: 'low', label: 'Düşük' },
                  { value: 'medium', label: 'Orta' },
                  { value: 'high', label: 'Yüksek' },
                  { value: 'urgent', label: 'Acil' }
                ]}
              />
            </div>

            {/* Durum */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>
                Başlangıç Durumu
              </label>
              <Select
                value={formData.status}
                onChange={(value) => handleInputChange('status', value)}
                options={[
                  { value: 'planning', label: 'Planlama' },
                  { value: 'active', label: 'Aktif' },
                  { value: 'on_hold', label: 'Beklemede' },
                  { value: 'completed', label: 'Tamamlandı' }
                ]}
              />
            </div>
          </div>

          {/* Bitiş Tarihi */}
          <Input
            label="Bitiş Tarihi * 📅"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
          />

          {/* Bütçe */}
          <Input
            label="Bütçe (Opsiyonel) 💰"
            type="number"
            value={formData.budget || ''}
            onChange={(e) => handleInputChange('budget', parseInt(e.target.value) || 0)}
            placeholder="0"
          />

          {/* Etiketler */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>
              Etiketler 🏷️
            </label>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Etiket ekle..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                style={{ flex: 1 }}
              />
              <Button onClick={handleAddTag} variant="outline">
                Ekle
              </Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
              {formData.tags.map((tag, index) => (
                <span 
                  key={index}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary-color)',
                    borderRadius: '20px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-xs)'
                  }}
                >
                  <span>{tag}</span>
                  <button 
                    onClick={() => handleRemoveTag(tag)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--primary-color)',
                      fontSize: '14px'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Dosya Yükleme */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>
              Proje Belgeleri 📄
            </label>
            <div 
              onClick={handleFileUpload}
              style={{
                border: '2px dashed var(--gray-300)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-xl)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--gray-300)'}
            >
              <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-sm)' }}>📤</div>
              <p style={{ fontSize: '14px', color: 'var(--gray-600)', margin: 0 }}>
                Belgeleri buraya sürükleyin veya <span style={{ color: 'var(--primary-color)' }}>dosya seçin</span>
              </p>
              <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: 'var(--spacing-xs)' }}>
                PDF, DOC, DOCX, XLS, XLSX (Maks. 10MB)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              style={{ display: 'none' }}
              multiple
            />
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
          {/* Görünürlük */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>
              Proje Görünürlüğü
            </label>
            <Select
              value={formData.visibility}
              onChange={(value) => handleInputChange('visibility', value)}
              options={[
                { value: 'private', label: '🔒 Özel (Sadece ben)' },
                { value: 'team', label: '👥 Takım (Takım üyeleri)' },
                { value: 'public', label: '🌐 Genel (Tüm şirket)' }
              ]}
            />
          </div>

          {/* Takım Seçimi */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>
              Takım Seçimi (Opsiyonel)
            </label>
            <Select
              value={formData.teamId || ''}
              onChange={(value) => handleInputChange('teamId', value)}
              options={[
                { value: '', label: 'Takım seçin' },
                ...teams.map((team) => ({
                  value: team.id,
                  label: `${team.name} (${team.memberIds.length} üye)`
                }))
              ]}
            />
          </div>

          {/* Takım Üyeleri */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>
              Proje Üyeleri 👥
            </label>
            <div style={{
              maxHeight: '240px',
              overflowY: 'auto',
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-md)'
            }}>
              {members.map((member) => (
                <div key={member.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }} 
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--gray-50)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => handleMemberToggle(member.id)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>{member.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0 }}>
                      {member.email} • {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginTop: 'var(--spacing-sm)' }}>
              {selectedMembers.length} üye seçildi
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}; 