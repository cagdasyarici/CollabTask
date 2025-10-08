import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { Dropdown } from '../components/Dropdown';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { tasksService } from '../services/tasks.service';
import { projectsService } from '../services/projects.service';
import { usersService } from '../services/users.service';
import type { Task, Project, User } from '../types';

type SortOption = 'priority' | 'dueDate' | 'created' | 'assignee';

const statusColumns = [
  { id: 'todo', label: 'Yapılacak', color: 'gray' },
  { id: 'in_progress', label: 'Devam Ediyor', color: 'blue' },
  { id: 'review', label: 'İnceleme', color: 'yellow' },
  { id: 'done', label: 'Tamamlandı', color: 'green' }
];

const statusToColumn: Record<string, string> = {
  backlog: 'todo',
  todo: 'todo',
  in_progress: 'in_progress',
  review: 'review',
  done: 'done'
};

export const KanbanPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // API State
  const [tasks, setTasks] = useState<Task[]>([]);
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

      // Load tasks, projects, and users in parallel
      const [tasksResponse, projectsResponse, usersResponse] = await Promise.all([
        tasksService.getTasks(),
        projectsService.getProjects(),
        usersService.getUsers()
      ]);

      if (tasksResponse.success && tasksResponse.data) {
        // Handle both array and paginated response
        const taskData = Array.isArray(tasksResponse.data) 
          ? tasksResponse.data 
          : (tasksResponse.data as any).data ?? [];
        setTasks(taskData);
      } else {
        console.warn('Görevler yüklenemedi:', tasksResponse.error);
        setTasks([]);
      }

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

  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'todo' | 'in_progress' | 'review' | 'done' | string;
    projectId: string;
    assigneeId: string;
    dueDate: string;
    startDate: string;
    estimatedHours: string | number;
    tags: string[];
    dependencies: string[];
    attachments: File[];
    settings: Record<string, boolean>;
    id?: string;
    createdAt?: string;
    updatedAt?: string;
  }) => {
    try {
      const response = await tasksService.createTask({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: (taskData.status === 'todo' || taskData.status === 'in_progress' || taskData.status === 'review' || taskData.status === 'done') ? taskData.status : 'todo',
        projectId: taskData.projectId,
        assigneeIds: taskData.assigneeId ? [taskData.assigneeId] : [],
        dueDate: taskData.dueDate,
        startDate: taskData.startDate,
        estimatedHours: typeof taskData.estimatedHours === 'string' ? Number(taskData.estimatedHours) : taskData.estimatedHours,
        tags: taskData.tags,
        dependencies: taskData.dependencies,
        subtasks: []
      });
      
      if (response.success) {
        setIsCreateModalOpen(false);
        // Reload tasks to show new one
        await loadData();
      } else {
        alert(response.error || 'Görev oluşturulamadı');
      }
    } catch (error) {
      console.error('Görev oluşturma hatası:', error);
      alert('Görev oluşturulamadı');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await tasksService.updateTaskStatus(taskId, newStatus);
      
      if (response.success) {
        // Update local state
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId ? { ...task, status: newStatus as any } : task
          )
        );
      } else {
        alert(response.error || 'Görev durumu güncellenemedi');
      }
    } catch (error) {
      console.error('Görev durumu güncelleme hatası:', error);
      alert('Görev durumu güncellenemedi');
    }
  };

  const getUserById = (id: string) => {
    return users.find(user => user.id === id);
  };

  const getProjectById = (id: string) => {
    return projects.find(project => project.id === id);
  };

  // removed unused getPriorityColor

  const getPriorityLabel = (priority: string) => {
    const labels = {
      urgent: 'Acil',
      high: 'Yüksek',
      medium: 'Orta',
      low: 'Düşük'
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    let filtered = [...tasks];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by project
    if (selectedProject !== 'all') {
      filtered = filtered.filter(task => task.projectId === selectedProject);
    }

    // Filter by assignee
    if (selectedAssignee !== 'all') {
      filtered = filtered.filter(task => task.assigneeIds.includes(selectedAssignee));
    }

    // Sort tasks
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
          break;
        }
        case 'dueDate':
          if (a.dueDate && b.dueDate) {
            comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          } else if (a.dueDate) {
            comparison = -1;
          } else if (b.dueDate) {
            comparison = 1;
          }
          break;
        case 'created':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'assignee': {
          const assigneeA = getUserById(a.assigneeIds[0])?.name || '';
          const assigneeB = getUserById(b.assigneeIds[0])?.name || '';
          comparison = assigneeA.localeCompare(assigneeB);
          break;
        }
        default:
          comparison = 0;
      }
      return comparison;
    });

    return filtered;
  }, [tasks, searchQuery, selectedProject, selectedAssignee, sortBy, users, getUserById]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped = statusColumns.reduce((acc, column) => {
      acc[column.id] = filteredTasks.filter(task => statusToColumn[task.status] === column.id);
      return acc;
    }, {} as Record<string, Task[]>);
    
    return grouped;
  }, [filteredTasks]);

  const projectOptions = [
    { value: 'all', label: 'Tüm Projeler' },
    ...projects.map(project => ({
      value: project.id,
      label: project.name
    }))
  ];

  const assigneeOptions = [
    { value: 'all', label: 'Tüm Atananlar' },
    ...users.map(user => ({
      value: user.id,
      label: user.name
    }))
  ];

  const sortOptions = [
    { value: 'priority', label: 'Öncelik' },
    { value: 'dueDate', label: 'Teslim Tarihi' },
    { value: 'created', label: 'Oluşturma Tarihi' },
    { value: 'assignee', label: 'Atanan Kişi' }
  ];

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Görevler yükleniyor...</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Kanban Panosu</h1>
            <p className="text-gray-600">{filteredTasks.length} görev bulundu</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            + Yeni Görev
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 bg-white rounded-lg border">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Görev ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Dropdown
              trigger={
                <Button variant="outline" size="sm">
                  {projectOptions.find(opt => opt.value === selectedProject)?.label || 'Proje Seç'}
                </Button>
              }
              items={projectOptions.map(option => ({
                id: option.value,
                label: option.label,
                onClick: () => setSelectedProject(option.value)
              }))}
              placement="bottom-start"
            />
            <Dropdown
              trigger={
                <Button variant="outline" size="sm">
                  {assigneeOptions.find(opt => opt.value === selectedAssignee)?.label || 'Atanan Seç'}
                </Button>
              }
              items={assigneeOptions.map(option => ({
                id: option.value,
                label: option.label,
                onClick: () => setSelectedAssignee(option.value)
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
                onClick: () => setSortBy(option.value as SortOption)
              }))}
              placement="bottom-start"
            />
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto pb-6">
          {statusColumns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-80">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{column.label}</h3>
                    <span className="text-sm text-gray-500">
                      {tasksByStatus[column.id]?.length || 0}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3 min-h-[400px]">
                  {tasksByStatus[column.id]?.map((task) => {
                    const assignee = getUserById(task.assigneeIds[0]);
                    const project = getProjectById(task.projectId);
                    
                    return (
                      <Card key={task.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                          <Badge 
                            variant={task.priority === 'urgent' ? 'error' : task.priority === 'high' ? 'warning' : 'default'}
                            size="sm"
                          >
                            {getPriorityLabel(task.priority)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                        
                        {project && (
                          <div className="text-xs text-gray-500 mb-2">
                            📁 {project.name}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {assignee && (
                              <Avatar src={assignee.avatar} name={assignee.name} size="sm" />
                            )}
                            {task.tags.length > 0 && (
                              <div className="flex gap-1">
                                {task.tags.slice(0, 2).map((tag, index) => (
                                  <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {task.dueDate && (
                            <span className="text-xs text-gray-500">
                              {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                            </span>
                          )}
                        </div>
                        
                        {/* Status Change Buttons */}
                        <div className="mt-3 flex gap-2">
                          {statusColumns.map((col) => (
                            col.id !== statusToColumn[task.status] && (
                              <Button
                                key={col.id}
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(task.id, col.id)}
                              >
                                {col.label}
                              </Button>
                            )
                          ))}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">Görev bulunamadı</h3>
            <p className="text-gray-600 mb-4">Arama kriterlerinize uygun görev bulunamadı.</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              İlk Görevinizi Oluşturun
            </Button>
          </div>
        )}

        {/* Create Task Modal */}
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateTask}
        />
      </div>
  );
}; 