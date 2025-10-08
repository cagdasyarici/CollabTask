import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select, Avatar, Badge } from './index';
import { usersService } from '../services/users.service';
import type { Team, User } from '../types';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teamData: {
    name: string;
    description: string;
    color: string;
    leaderId: string;
    memberIds: string[];
    department: string;
  }) => void;
  editTeam?: Team | null;
}

interface TeamFormData {
  name: string;
  description: string;
  leaderId: string;
  memberIds: string[];
  color: string;
  department: string;
}

const teamColors = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', 
  '#6B7280', '#EC4899', '#14B8A6', '#F97316', '#84CC16',
  '#6366F1', '#F43F5E', '#06B6D4', '#8B5A2B', '#7C3AED'
];

const departments = [
  'Engineering',
  'Product',
  'Design', 
  'Marketing',
  'Sales',
  'Support',
  'HR',
  'Finance',
  'Operations',
  'Other'
];

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editTeam = null
}) => {
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    leaderId: '',
    memberIds: [],
    color: teamColors[0],
    department: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load users from backend
  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;
      
      try {
        setIsLoadingData(true);
        const usersRes = await usersService.getUsers();
        
        if (usersRes.success && usersRes.data) {
          setUsers(usersRes.data);
        }
      } catch (error) {
        console.error('Kullanıcılar yükleme hatası:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [isOpen]);

  // Initialize form data if editing
  useEffect(() => {
    if (editTeam) {
      setFormData({
        name: editTeam.name,
        description: editTeam.description,
        leaderId: editTeam.leaderId,
        memberIds: [...editTeam.memberIds],
        color: editTeam.color,
        department: editTeam.department || ''
      });
    }
  }, [editTeam]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Takım adı gerekli';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Takım açıklaması gerekli';
    }

    if (!formData.leaderId) {
      newErrors.leaderId = 'Takım lideri seçimi gerekli';
    }

    if (formData.memberIds.length === 0) {
      newErrors.memberIds = 'En az bir takım üyesi seçmelisiniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Ensure leader is also in members list
      const memberIds = formData.memberIds.includes(formData.leaderId) 
        ? formData.memberIds 
        : [...formData.memberIds, formData.leaderId];

      onSubmit({
        ...formData,
        memberIds,
        id: editTeam?.id || `team_${Date.now()}`,
        createdAt: editTeam?.createdAt || new Date().toISOString()
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      leaderId: '',
      memberIds: [],
      color: teamColors[0],
      department: ''
    });
    setErrors({});
    setSearchQuery('');
    onClose();
  };

  const toggleMember = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(userId)
        ? prev.memberIds.filter(id => id !== userId)
        : [...prev.memberIds, userId]
    }));
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUsers = users.filter((user) => formData.memberIds.includes(user.id));
  const leader = users.find((user) => user.id === formData.leaderId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editTeam ? 'Takım Düzenle' : 'Yeni Takım Oluştur'}
      size="xl"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
            {formData.memberIds.length} üye seçildi
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <Button variant="ghost" onClick={handleClose}>
              İptal
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editTeam ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)' }}>
        {/* Left Column - Team Info */}
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
            Takım Bilgileri
          </h3>

          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <Input
              label="Takım Adı *"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Frontend Team"
              error={errors.name}
            />
          </div>

          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>
              Açıklama *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Takımın görevleri ve sorumluluklarını açıklayın"
              rows={4}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${errors.description ? 'var(--error-color)' : 'var(--gray-300)'}`,
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            {errors.description && (
              <div style={{ color: 'var(--error-color)', fontSize: '12px', marginTop: 'var(--spacing-xs)' }}>
                {errors.description}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <Select
              label="Departman"
              value={formData.department}
              onChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
              options={[
                { value: '', label: 'Departman seçin' },
                ...departments.map(dept => ({ value: dept, label: dept }))
              ]}
            />
          </div>

          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>
              Takım Rengi
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(5, 1fr)', 
              gap: 'var(--spacing-sm)' 
            }}>
              {teamColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: `3px solid ${formData.color === color ? 'var(--gray-800)' : 'var(--gray-200)'}`,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: color,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Team Leader Selection */}
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <Select
              label="Takım Lideri *"
              value={formData.leaderId}
              onChange={(value) => setFormData(prev => ({ ...prev, leaderId: value }))}
              options={[
                { value: '', label: 'Lider seçin' },
                ...users.map(user => ({
                  value: user.id,
                  label: `${user.name} (${user.position || user.role})`
                }))
              ]}
              error={errors.leaderId}
            />
            
            {leader && (
              <div style={{ 
                marginTop: 'var(--spacing-sm)', 
                padding: 'var(--spacing-sm)', 
                backgroundColor: 'var(--gray-50)', 
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)'
              }}>
                <Avatar src={leader.avatar} name={leader.name} size="sm" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{leader.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                    {leader.position || leader.role}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div style={{ 
            padding: 'var(--spacing-md)', 
            backgroundColor: 'var(--gray-50)', 
            borderRadius: 'var(--radius-md)' 
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
              Takım Önizleme
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: formData.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--white)',
                  fontWeight: 600,
                  fontSize: '12px'
                }}
              >
                {formData.name.charAt(0) || '?'}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>
                  {formData.name || 'Takım Adı'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                  {formData.memberIds.length} üye
                  {formData.department && ` • ${formData.department}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Member Selection */}
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
            Takım Üyeleri
          </h3>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <Input
              placeholder="Kullanıcı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              }
            />
          </div>

          {/* Selected Members */}
          {selectedUsers.length > 0 && (
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
                Seçilen Üyeler ({selectedUsers.length})
              </h4>
              <div style={{ 
                maxHeight: '120px', 
                overflowY: 'auto',
                padding: 'var(--spacing-sm)',
                backgroundColor: 'var(--primary-light)',
                borderRadius: 'var(--radius-md)'
              }}>
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--spacing-sm)',
                      marginBottom: 'var(--spacing-xs)',
                      backgroundColor: 'var(--white)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <Avatar src={user.avatar} name={user.name} size="xs" />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 500 }}>{user.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>
                          {user.position || user.role}
                        </div>
                      </div>
                    </div>
                    {user.id === formData.leaderId && (
                      <Badge variant="warning" size="sm">Lider</Badge>
                    )}
                    <button
                      onClick={() => toggleMember(user.id)}
                      style={{
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        color: 'var(--gray-500)',
                        fontSize: '16px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Users */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
              Kullanıcılar
            </h4>
            {errors.memberIds && (
              <div style={{ color: 'var(--error-color)', fontSize: '12px', marginBottom: 'var(--spacing-sm)' }}>
                {errors.memberIds}
              </div>
            )}
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {filteredUsers.map((user) => {
                const isSelected = formData.memberIds.includes(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleMember(user.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--spacing-sm)',
                      border: '1px solid var(--gray-200)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 'var(--spacing-xs)',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--white)',
                      borderColor: isSelected ? 'var(--primary-color)' : 'var(--gray-200)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <Avatar src={user.avatar} name={user.name} size="xs" />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 500 }}>{user.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>
                          {user.position || user.role} • {user.email}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div style={{ color: 'var(--primary-color)' }}>✓</div>
                    )}
                  </div>
                );
              })}
              
              {filteredUsers.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 'var(--spacing-lg)', 
                  color: 'var(--gray-500)' 
                }}>
                  Kullanıcı bulunamadı
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}; 