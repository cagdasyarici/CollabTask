import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select, PriorityBadge } from './index';
import { usersService } from '../services/users.service';
import { projectsService } from '../services/projects.service';
import { tasksService } from '../services/tasks.service';
import type { CreateTaskModalProps, TaskFormData, User, Project, Task, TaskStatus, Priority } from '../types';

const taskTemplates = [
  {
    id: 'bug-fix',
    name: '🐛 Bug Fix',
    title: 'Bug: ',
    description: '**Açıklama:** \n\n**Adımlar:**\n1. \n2. \n3. \n\n**Beklenen Sonuç:**\n\n**Gerçek Sonuç:**',
    priority: 'high' as const,
    tags: ['bug', 'fix'],
    settings: { allowComments: true, trackTime: true, sendNotifications: true, requireApproval: true }
  },
  {
    id: 'feature',
    name: '✨ New Feature',
    title: 'Feature: ',
    description: '**Özellik Açıklaması:**\n\n**Kabul Kriterleri:**\n- [ ] \n- [ ] \n- [ ] \n\n**Teknik Notlar:**',
    priority: 'medium' as const,
    tags: ['feature', 'development'],
    settings: { allowComments: true, trackTime: true, sendNotifications: true, requireApproval: false }
  },
  {
    id: 'research',
    name: '🔍 Research Task',
    title: 'Research: ',
    description: '**Araştırma Konusu:**\n\n**Hedefler:**\n- \n- \n\n**Çıktılar:**\n- \n- ',
    priority: 'medium' as const,
    tags: ['research', 'analysis'],
    settings: { allowComments: true, trackTime: true, sendNotifications: false, requireApproval: false }
  },
  {
    id: 'design',
    name: '🎨 Design Task',
    title: 'Design: ',
    description: '**Tasarım İhtiyacı:**\n\n**Gereksinimler:**\n- \n- \n\n**Çıktılar:**\n- Mockup\n- Assets',
    priority: 'medium' as const,
    tags: ['design', 'ui/ux'],
    settings: { allowComments: true, trackTime: true, sendNotifications: true, requireApproval: true }
  },
  {
    id: 'meeting',
    name: '📅 Meeting/Discussion',
    title: 'Meeting: ',
    description: '**Toplantı Konusu:**\n\n**Katılımcılar:**\n- \n- \n\n**Gündem:**\n1. \n2. \n3. ',
    priority: 'low' as const,
    tags: ['meeting', 'discussion'],
    settings: { allowComments: true, trackTime: false, sendNotifications: true, requireApproval: false }
  },
  {
    id: 'blank',
    name: '📝 Blank Task',
    title: '',
    description: '',
    priority: 'medium' as const,
    tags: [],
    settings: { allowComments: true, trackTime: false, sendNotifications: true, requireApproval: false }
  }
];

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editTask = null,
  defaultProjectId = '',
  defaultStatus = 'todo'
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    status: defaultStatus as TaskStatus,
    projectId: defaultProjectId,
    assigneeId: '',
    dueDate: '',
    startDate: '',
    estimatedHours: '',
    tags: [],
    dependencies: [],
    attachments: [],
    settings: {
      allowComments: true,
      trackTime: false,
      sendNotifications: true,
      requireApproval: false
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');
  const [showTemplates, setShowTemplates] = useState(!editTask);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load users, projects, and tasks from backend
  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;
      
      try {
        const [usersRes, projectsRes, tasksRes] = await Promise.all([
          usersService.getUsers(),
          projectsService.getProjects(),
          tasksService.getTasks()
        ]);

        if (usersRes.success && usersRes.data) {
          setUsers(usersRes.data);
        }
        if (projectsRes.success && projectsRes.data) {
          setProjects(projectsRes.data);
        }
        if (tasksRes.success && tasksRes.data) {
          setTasks(tasksRes.data);
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      }
    };

    loadData();
  }, [isOpen]);

  // Initialize form data if editing
  useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title,
        description: editTask.description,
        priority: editTask.priority,
        status: editTask.status,
        projectId: editTask.projectId,
        assigneeId: editTask.assigneeIds[0] || '',
        dueDate: editTask.dueDate ? editTask.dueDate.split('T')[0] : '',
        startDate: editTask.startDate ? editTask.startDate.split('T')[0] : '',
        estimatedHours: (editTask.estimatedHours?.toString() || ''),
        tags: editTask.tags || [],
        dependencies: [],
        attachments: [],
        settings: {
          allowComments: true,
          trackTime: false,
          sendNotifications: true,
          requireApproval: false
        }
      });
      setShowTemplates(false);
    }
  }, [editTask]);

  const handleTemplateSelect = (template: typeof taskTemplates[0]) => {
    setFormData(prev => ({
      ...prev,
      title: template.title,
      description: template.description,
      priority: template.priority,
      tags: [...template.tags],
      settings: { ...template.settings }
    }));
    setShowTemplates(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Görev başlığı gerekli';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Proje seçimi gerekli';
    }

    if (formData.dueDate && formData.startDate && formData.dueDate < formData.startDate) {
      newErrors.dueDate = 'Bitiş tarihi başlangıç tarihinden önce olamaz';
    }

    if (formData.estimatedHours && (isNaN(Number(formData.estimatedHours)) || Number(formData.estimatedHours) < 0)) {
      newErrors.estimatedHours = 'Geçerli bir saat değeri girin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        ...formData,
        id: editTask?.id || `task_${Date.now()}`,
        createdAt: editTask?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: defaultStatus as TaskStatus,
      projectId: defaultProjectId,
      assigneeId: '',
      dueDate: '',
      startDate: '',
      estimatedHours: '',
      tags: [],
      dependencies: [],
      attachments: [],
      settings: {
        allowComments: true,
        trackTime: false,
        sendNotifications: true,
        requireApproval: false
      }
    });
    setErrors({});
    setNewTag('');
    setShowTemplates(!editTask);
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target === document.activeElement) {
      e.preventDefault();
      if (newTag.trim()) {
        addTag();
      }
    }
  };

  const projectOptions = projects.map(project => ({
    value: project.id,
    label: `${project.icon} ${project.name}`
  }));

  const assigneeOptions = [
    { value: '', label: 'Atanmamış' },
    ...users.map(user => ({
      value: user.id,
      label: user.name
    }))
  ];

  const statusOptions = [
    { value: 'todo', label: 'Yapılacak' },
    { value: 'in-progress', label: 'Devam Ediyor' },
    { value: 'in-review', label: 'İncelemede' },
    { value: 'completed', label: 'Tamamlandı' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Düşük' },
    { value: 'medium', label: 'Orta' },
    { value: 'high', label: 'Yüksek' },
    { value: 'urgent', label: 'Acil' }
  ];

  const dependencyOptions = tasks
    .filter(task => task.id !== editTask?.id && task.projectId === formData.projectId)
    .map(task => ({
      value: task.id,
      label: task.title
    }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editTask ? 'Görevi Düzenle' : 'Yeni Görev Oluştur'}
      size="xl"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {!showTemplates && !editTask && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplates(true)}
              >
                📋 Template Seç
              </Button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <Button variant="ghost" onClick={handleClose}>
              İptal
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editTask ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        {/* Templates Section */}
        {showTemplates && (
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
              Görev Template'i Seçin
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 'var(--spacing-md)' 
            }}>
              {taskTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  style={{
                    padding: 'var(--spacing-md)',
                    border: '2px solid var(--gray-200)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-color)';
                    e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--gray-200)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                    {template.name}
                  </div>
                  <PriorityBadge priority={template.priority} size="sm" />
                </div>
              ))}
            </div>
            <div style={{ 
              textAlign: 'center', 
              marginTop: 'var(--spacing-lg)',
              padding: 'var(--spacing-md)',
              borderTop: '1px solid var(--gray-200)'
            }}>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowTemplates(false)}
              >
                Template olmadan devam et
              </Button>
            </div>
          </div>
        )}

        {/* Main Form */}
        {!showTemplates && (
          <>
            {/* Basic Information */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
                Temel Bilgiler
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Input
                    label="Görev Başlığı *"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Görev başlığını girin"
                    error={errors.title}
                  />
                </div>
                
                <Select
                  label="Proje *"
                  value={formData.projectId}
                  onChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
                  options={projectOptions}
                  placeholder="Proje seçin"
                  error={errors.projectId}
                />
                
                <Select
                  label="Durum"
                  value={formData.status}
                  onChange={(value) => setFormData(prev => ({ ...prev, status: value as TaskStatus }))}
                  options={statusOptions}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>
                Açıklama
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Görev açıklamasını girin..."
                rows={6}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  lineHeight: 1.5
                }}
              />
            </div>

            {/* Assignment & Priority */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
                Atama & Öncelik
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <Select
                  label="Atanan Kişi"
                  value={formData.assigneeId}
                  onChange={(value) => setFormData(prev => ({ ...prev, assigneeId: value }))}
                  options={assigneeOptions}
                />
                
                <Select
                  label="Öncelik"
                  value={formData.priority}
                  onChange={(value) => setFormData(prev => ({ ...prev, priority: value as Priority }))}
                  options={priorityOptions}
                />
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
                Zaman Çizelgesi
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)' }}>
                <Input
                  label="Başlangıç Tarihi"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
                
                <Input
                  label="Bitiş Tarihi"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  error={errors.dueDate}
                />
                
                <Input
                  label="Tahmini Süre (saat)"
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                  placeholder="0"
                  error={errors.estimatedHours}
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
                Etiketler
              </h3>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Etiket ekle..."
                  style={{ flex: 1 }}
                />
                <Button variant="outline" size="md" onClick={addTag}>
                  Ekle
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                  {formData.tags.map((tag, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                        padding: '4px 8px',
                        backgroundColor: 'var(--primary-light)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px'
                      }}
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        style={{
                          border: 'none',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          color: 'var(--gray-500)',
                          padding: '0',
                          margin: '0',
                          fontSize: '14px'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dependencies */}
            {formData.projectId && dependencyOptions.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
                  Bağımlılıklar
                </h3>
                <Select
                  label="Bağımlı Görevler"
                  value=""
                  onChange={(value) => {
                    if (!formData.dependencies.includes(value)) {
                      setFormData(prev => ({
                        ...prev,
                        dependencies: [...prev.dependencies, value]
                      }));
                    }
                  }}
                  options={dependencyOptions}
                  placeholder="Bağımlı görev seçin"
                />
                {formData.dependencies.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-md)' }}>
                    {formData.dependencies.map((depId) => {
                      const task = tasks.find(t => t.id === depId);
                      return (
                        <div
                          key={depId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-xs)',
                            padding: '4px 8px',
                            backgroundColor: 'var(--gray-100)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '12px'
                          }}
                        >
                          {task?.title || depId}
                          <button
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              dependencies: prev.dependencies.filter(id => id !== depId)
                            }))}
                            style={{
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              color: 'var(--gray-500)',
                              padding: '0',
                              margin: '0',
                              fontSize: '14px'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Task Settings */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
                Görev Ayarları
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <input
                    type="checkbox"
                    checked={formData.settings.allowComments}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, allowComments: e.target.checked }
                    }))}
                  />
                  <span style={{ fontSize: '14px' }}>Yorum yapılabilir</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <input
                    type="checkbox"
                    checked={formData.settings.trackTime}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, trackTime: e.target.checked }
                    }))}
                  />
                  <span style={{ fontSize: '14px' }}>Zaman takibi</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <input
                    type="checkbox"
                    checked={formData.settings.sendNotifications}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, sendNotifications: e.target.checked }
                    }))}
                  />
                  <span style={{ fontSize: '14px' }}>Bildirim gönder</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <input
                    type="checkbox"
                    checked={formData.settings.requireApproval}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, requireApproval: e.target.checked }
                    }))}
                  />
                  <span style={{ fontSize: '14px' }}>Onay gerekli</span>
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}; 