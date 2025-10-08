import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select, Badge } from './index';
import { teamsService } from '../services/teams.service';
import { projectsService } from '../services/projects.service';
import type { User, Team, Project } from '../types';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: User) => void;
  editUser?: User | null;
}

interface UserFormData {
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  position: string;
  department: string;
  teamIds: string[];
  projectIds: string[];
  permissions: {
    canCreateProjects: boolean;
    canDeleteTasks: boolean;
    canManageTeams: boolean;
    canViewAnalytics: boolean;
    canExportData: boolean;
  };
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editUser = null
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'member',
    position: '',
    department: '',
    teamIds: [],
    projectIds: [],
    permissions: {
      canCreateProjects: false,
      canDeleteTasks: false,
      canManageTeams: false,
      canViewAnalytics: false,
      canExportData: false
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load teams and projects from backend
  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;
      
      try {
        setIsLoadingData(true);
        const [teamsRes, projectsRes] = await Promise.all([
          teamsService.getTeams(),
          projectsService.getProjects()
        ]);

        if (teamsRes.success && teamsRes.data) {
          setTeams(teamsRes.data);
        }
        if (projectsRes.success && projectsRes.data) {
          setProjects(projectsRes.data);
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [isOpen]);

  const steps = [
    { id: 'basic', title: 'Temel Bilgiler', description: 'Kullanıcı bilgileri ve rol' },
    { id: 'teams', title: 'Takımlar', description: 'Takım atamaları' },
    { id: 'projects', title: 'Projeler', description: 'Proje erişimi' },
    { id: 'permissions', title: 'İzinler', description: 'Detaylı izinler' }
  ];

  // Initialize form data if editing
  useEffect(() => {
    if (editUser) {
      setFormData({
        name: editUser.name,
        email: editUser.email,
        role: editUser.role,
        position: editUser.position || '',
        department: editUser.department || '',
        teamIds: teams.filter(t => t.memberIds.includes(editUser.id)).map(t => t.id),
        projectIds: projects.filter(p => p.memberIds.includes(editUser.id)).map(p => p.id),
        permissions: {
          canCreateProjects: editUser.role !== 'member',
          canDeleteTasks: editUser.role === 'admin',
          canManageTeams: editUser.role !== 'member',
          canViewAnalytics: true,
          canExportData: editUser.role !== 'member'
        }
      });
    }
  }, [editUser]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.name.trim()) {
        newErrors.name = 'Ad Soyad gerekli';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'E-posta gerekli';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Geçerli bir e-posta adresi girin';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onSubmit({
        ...formData,
        id: editUser?.id || `user_${Date.now()}`,
        avatar: editUser?.avatar,
        status: editUser?.status || 'invited',
        createdAt: editUser?.createdAt || new Date().toISOString(),
        lastActive: editUser?.lastActive
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      role: 'member',
      position: '',
      department: '',
      teamIds: [],
      projectIds: [],
      permissions: {
        canCreateProjects: false,
        canDeleteTasks: false,
        canManageTeams: false,
        canViewAnalytics: false,
        canExportData: false
      }
    });
    setErrors({});
    setCurrentStep(0);
    onClose();
  };

  const toggleTeam = (teamId: string) => {
    setFormData(prev => ({
      ...prev,
      teamIds: prev.teamIds.includes(teamId)
        ? prev.teamIds.filter(id => id !== teamId)
        : [...prev.teamIds, teamId]
    }));
  };

  const toggleProject = (projectId: string) => {
    setFormData(prev => ({
      ...prev,
      projectIds: prev.projectIds.includes(projectId)
        ? prev.projectIds.filter(id => id !== projectId)
        : [...prev.projectIds, projectId]
    }));
  };

  // Step Components
  const BasicInfoStep = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <Input
            label="Ad Soyad *"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Kullanıcının tam adını girin"
            error={errors.name}
          />
        </div>

        <Input
          label="E-posta Adresi *"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="ornek@sirket.com"
          error={errors.email}
          disabled={!!editUser}
        />

        <Select
          label="Rol"
          value={formData.role}
          onChange={(value) => setFormData(prev => ({ ...prev, role: value as 'admin' | 'manager' | 'member' }))}
          options={[
            { value: 'member', label: 'Team Member' },
            { value: 'manager', label: 'Manager' },
            { value: 'admin', label: 'Administrator' }
          ]}
        />

        <Input
          label="Pozisyon"
          value={formData.position}
          onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
          placeholder="Frontend Developer"
        />

        <Input
          label="Departman"
          value={formData.department}
          onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
          placeholder="Engineering"
        />
      </div>

      {/* Role Info */}
      <div style={{ 
        marginTop: 'var(--spacing-lg)', 
        padding: 'var(--spacing-md)', 
        backgroundColor: 'var(--gray-50)', 
        borderRadius: 'var(--radius-md)' 
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
          {formData.role === 'admin' ? 'Administrator' : 
           formData.role === 'manager' ? 'Manager' : 'Team Member'} Yetkiler:
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
          {formData.role === 'admin' && (
            <>
              <Badge variant="error" size="sm">Tüm İzinler</Badge>
              <Badge variant="error" size="sm">Kullanıcı Yönetimi</Badge>
              <Badge variant="error" size="sm">Sistem Ayarları</Badge>
            </>
          )}
          {formData.role === 'manager' && (
            <>
              <Badge variant="warning" size="sm">Proje Yönetimi</Badge>
              <Badge variant="warning" size="sm">Takım Yönetimi</Badge>
              <Badge variant="warning" size="sm">Raporlama</Badge>
            </>
          )}
          {formData.role === 'member' && (
            <>
              <Badge variant="default" size="sm">Görev Yönetimi</Badge>
              <Badge variant="default" size="sm">Yorum Yapma</Badge>
              <Badge variant="default" size="sm">Dosya Yükleme</Badge>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const TeamsStep = () => (
    <div>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
        Takım Atamaları
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: 'var(--spacing-lg)' }}>
        Kullanıcının üye olacağı takımları seçin
      </p>

      <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        {teams.map((team) => (
          <div
            key={team.id}
            onClick={() => toggleTeam(team.id)}
            style={{
              padding: 'var(--spacing-md)',
              border: `2px solid ${formData.teamIds.includes(team.id) ? 'var(--primary-color)' : 'var(--gray-200)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              backgroundColor: formData.teamIds.includes(team.id) ? 'var(--primary-light)' : 'var(--white)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: team.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--white)',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}
                >
                  {team.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{team.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                    {team.memberIds.length} üye • {team.description}
                  </div>
                </div>
              </div>
              {formData.teamIds.includes(team.id) && (
                <div style={{ color: 'var(--primary-color)' }}>✓</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: 'var(--spacing-lg)', 
        fontSize: '12px', 
        color: 'var(--gray-500)',
        textAlign: 'center'
      }}>
        {formData.teamIds.length} takım seçildi
      </div>
    </div>
  );

  const ProjectsStep = () => (
    <div>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
        Proje Erişimi
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: 'var(--spacing-lg)' }}>
        Kullanıcının erişim sağlayacağı projeleri seçin
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-md)' }}>
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => toggleProject(project.id)}
            style={{
              padding: 'var(--spacing-md)',
              border: `2px solid ${formData.projectIds.includes(project.id) ? 'var(--primary-color)' : 'var(--gray-200)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              backgroundColor: formData.projectIds.includes(project.id) ? 'var(--primary-light)' : 'var(--white)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <span style={{ fontSize: '20px' }}>{project.icon}</span>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{project.name}</span>
              </div>
              {formData.projectIds.includes(project.id) && (
                <div style={{ color: 'var(--primary-color)' }}>✓</div>
              )}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--gray-600)', marginBottom: 'var(--spacing-sm)' }}>
              {project.description}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Badge variant="default" size="sm">{project.status}</Badge>
              <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>
                {project.memberIds.length} üye
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: 'var(--spacing-lg)', 
        fontSize: '12px', 
        color: 'var(--gray-500)',
        textAlign: 'center'
      }}>
        {formData.projectIds.length} proje seçildi
      </div>
    </div>
  );

  const PermissionsStep = () => (
    <div>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
        Detaylı İzinler
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: 'var(--spacing-lg)' }}>
        Kullanıcının sistemi nasıl kullanabileceğini belirleyin
      </p>

      <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        {[
          { 
            key: 'canCreateProjects', 
            title: 'Proje Oluşturabilir', 
            description: 'Yeni projeler oluşturabilir ve yönetebilir' 
          },
          { 
            key: 'canDeleteTasks', 
            title: 'Görev Silebilir', 
            description: 'Herhangi bir görevi silebilir' 
          },
          { 
            key: 'canManageTeams', 
            title: 'Takım Yönetebilir', 
            description: 'Takımlara üye ekleyip çıkarabilir' 
          },
          { 
            key: 'canViewAnalytics', 
            title: 'Analitik Görüntüleyebilir', 
            description: 'Proje ve takım analitiklerini görebilir' 
          },
          { 
            key: 'canExportData', 
            title: 'Veri Export Edebilir', 
            description: 'Proje verilerini export edebilir' 
          }
        ].map((permission) => (
          <div
            key={permission.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--spacing-md)',
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--white)'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>
                {permission.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>
                {permission.description}
              </div>
            </div>
            <label style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.permissions[permission.key as keyof typeof formData.permissions]}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  permissions: {
                    ...prev.permissions,
                    [permission.key]: e.target.checked
                  }
                }))}
                style={{ width: '16px', height: '16px' }}
              />
            </label>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{ 
        marginTop: 'var(--spacing-lg)', 
        padding: 'var(--spacing-md)', 
        backgroundColor: 'var(--gray-50)', 
        borderRadius: 'var(--radius-md)' 
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
          Özet
        </h4>
        <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>
          <div>Rol: <strong>{formData.role}</strong></div>
          <div>Takımlar: <strong>{formData.teamIds.length} adet</strong></div>
          <div>Projeler: <strong>{formData.projectIds.length} adet</strong></div>
          <div>Özel İzinler: <strong>
            {Object.values(formData.permissions).filter(Boolean).length} adet
          </strong></div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return <BasicInfoStep />;
      case 1: return <TeamsStep />;
      case 2: return <ProjectsStep />;
      case 3: return <PermissionsStep />;
      default: return null;
    }
  };

  const modalFooter = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
        {steps.map((_, index) => (
          <div
            key={index}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: index <= currentStep ? 'var(--primary-color)' : 'var(--gray-300)',
              transition: 'all 0.2s ease'
            }}
          />
        ))}
      </div>
      
      <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
        <Button variant="ghost" onClick={handleClose}>
          İptal
        </Button>
        
        {currentStep > 0 && (
          <Button variant="outline" onClick={handlePrevious}>
            Önceki
          </Button>
        )}
        
        {currentStep < steps.length - 1 ? (
          <Button variant="primary" onClick={handleNext}>
            Sonraki
          </Button>
        ) : (
          <Button variant="primary" onClick={handleSubmit}>
            {editUser ? 'Güncelle' : 'Davet Gönder'}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
            {editUser ? 'Kullanıcı Düzenle' : 'Kullanıcı Davet Et'}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--gray-500)', marginTop: 'var(--spacing-xs)' }}>
            {steps[currentStep]?.title} - {steps[currentStep]?.description}
          </div>
        </div>
      }
      size="xl"
      footer={modalFooter}
      closeOnOverlayClick={false}
    >
      <div style={{ minHeight: '400px' }}>
        {renderStepContent()}
      </div>
    </Modal>
  );
}; 