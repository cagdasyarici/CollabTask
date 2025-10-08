import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { ProgressBar } from '../components/ProgressBar';
import { Dropdown } from '../components/Dropdown';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { projectsService } from '../services/projects.service';
import { usersService } from '../services/users.service';
import type { Project, User } from '../types';

type ProjectSortOption = 'name' | 'updated' | 'created' | 'progress' | 'priority';
type ProjectFilterStatus = 'all' | 'active' | 'paused' | 'completed' | 'archived';

export const ProjectsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<ProjectSortOption>('updated');
  const [filterStatus, setFilterStatus] = useState<ProjectFilterStatus>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // API State
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load projects and users in parallel
      const [projectsResponse, usersResponse] = await Promise.all([
        projectsService.getProjects(),
        usersService.getUsers()
      ]);

      if (projectsResponse.success && projectsResponse.data) {
        // Handle both array and paginated response
        const projectData = Array.isArray(projectsResponse.data) 
          ? projectsResponse.data 
          : (projectsResponse.data as any).data ?? [];
        setProjects(projectData);
      } else {
        console.warn('Projeler yüklenemedi:', projectsResponse.error);
        setProjects([]);
      }

      if (usersResponse.success && usersResponse.data) {
        // Handle both array and paginated response
        const userData = Array.isArray(usersResponse.data) 
          ? usersResponse.data 
          : (usersResponse.data as any).data ?? [];
        setUsers(userData);
      } else {
        console.warn('Kullanıcılar yüklenemedi:', usersResponse.error);
        setUsers([]);
      }

    } catch (err) {
      console.error('Veri yükleme hatası:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (projectData: {
    name: string;
    description: string;
    status: 'active' | 'completed' | 'planning' | 'on_hold';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: string;
    teamIds: string[];
    memberIds: string[];
    tags: string[];
    ownerId: string;
  }) => {
    try {
      // Add missing required fields for CreateProjectData
      const fullProjectData = {
        ...projectData,
        color: '#3B82F6', // Default color
        icon: '📁', // Default icon
        visibility: 'team' as const // Default visibility
      };
      
      const response = await projectsService.createProject(fullProjectData);
      
      if (response.success) {
        setIsCreateModalOpen(false);
        // Reload projects to show new one
        await loadData();
      } else {
        alert(response.error || 'Proje oluşturulamadı');
      }
    } catch (error) {
      console.error('Proje oluşturma hatası:', error);
      alert('Proje oluşturulamadı');
    }
  };

  const getUserById = (id: string) => {
    return users.find(user => user.id === id);
  };

  const getStatusColor = (status: string): "default" | "primary" | "success" | "warning" | "error" | "info" => {
    const colors: Record<string, "default" | "primary" | "success" | "warning" | "error" | "info"> = {
      active: 'success',
      paused: 'warning',
      completed: 'default',
      archived: 'info'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Aktif',
      paused: 'Duraklatıldı',
      completed: 'Tamamlandı',
      archived: 'Arşivlendi'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPriorityColor = (priority: string): "default" | "primary" | "success" | "warning" | "error" | "info" => {
    const colors: Record<string, "default" | "primary" | "success" | "warning" | "error" | "info"> = {
      urgent: 'error',
      high: 'warning',
      medium: 'default',
      low: 'success'
    };
    return colors[priority] || 'default';
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      urgent: 'Acil',
      high: 'Yüksek',
      medium: 'Orta',
      low: 'Düşük'
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    if (!Array.isArray(projects)) return [];
    let filtered = [...projects];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(project => project.status === filterStatus);
    }

    // Sort projects
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'updated':
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          break;
        case 'created':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'progress':
          comparison = b.progress - a.progress;
          break;
        case 'priority': {
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
          break;
        }
        default:
          comparison = 0;
      }
      return comparison;
    });

    return filtered;
  }, [projects, searchQuery, filterStatus, sortBy]);

  const statusOptions = [
    { value: 'all', label: 'Tüm Durumlar' },
    { value: 'active', label: 'Aktif' },
    { value: 'paused', label: 'Duraklatıldı' },
    { value: 'completed', label: 'Tamamlandı' },
    { value: 'archived', label: 'Arşivlendi' }
  ];

  const sortOptions = [
    { value: 'updated', label: 'Son Güncelleme' },
    { value: 'created', label: 'Oluşturma Tarihi' },
    { value: 'name', label: 'Alfabetik' },
    { value: 'progress', label: 'İlerleme' },
    { value: 'priority', label: 'Öncelik' }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Projeler yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-xl mb-4">❌ {error}</div>
        <Button onClick={loadData}>Tekrar Dene</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projeler</h1>
            <p className="text-gray-600">{filteredProjects.length} proje bulundu</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            + Yeni Proje
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 bg-white rounded-lg border">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Proje ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Dropdown
              trigger={
                <Button variant="outline" size="sm">
                  {statusOptions.find(opt => opt.value === filterStatus)?.label || 'Durum Seç'}
                </Button>
              }
              items={statusOptions.map(option => ({
                id: option.value,
                label: option.label,
                onClick: () => setFilterStatus(option.value as ProjectFilterStatus)
              }))}
              placement="bottom-start"
            />
            <Dropdown
              trigger={
                <Button variant="outline" size="sm">
                  {sortOptions.find(opt => opt.value === sortBy)?.label || 'Sırala'}
                </Button>
              }
              items={sortOptions.map(option => ({
                id: option.value,
                label: option.label,
                onClick: () => setSortBy(option.value as ProjectSortOption)
              }))}
              placement="bottom-start"
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const teamMembers = project.memberIds.map(id => getUserById(id)).filter(Boolean);
            
            return (
              <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{project.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <Badge 
                        variant={getStatusColor(project.status)}
                        size="sm"
                      >
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                  </div>
                  <Badge 
                    variant={getPriorityColor(project.priority)}
                    size="sm"
                  >
                    {getPriorityLabel(project.priority)}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mb-4">{project.description}</p>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>İlerleme</span>
                    <span>{project.progress}%</span>
                  </div>
                  <ProgressBar value={project.progress} size="sm" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {teamMembers.slice(0, 3).map((user) => (
                      <Avatar
                        key={user!.id}
                        src={user!.avatar}
                        name={user!.name}
                        size="sm"
                        className="border-2 border-white"
                      />
                    ))}
                    {teamMembers.length > 3 && (
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full border-2 border-white text-xs text-gray-600">
                        +{teamMembers.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(project.updatedAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredProjects.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold mb-2">Proje bulunamadı</h3>
            <p className="text-gray-600 mb-4">Arama kriterlerinize uygun proje bulunamadı.</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              İlk Projenizi Oluşturun
            </Button>
          </div>
        )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateProject}
      />
    </div>
  );
}; 