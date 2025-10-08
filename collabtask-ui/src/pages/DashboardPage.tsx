import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ActivityFeed } from '../components/ActivityFeed';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { projectsService } from '../services/projects.service';
import { tasksService } from '../services/tasks.service';
import { usersService } from '../services/users.service';
import type { Project, Task, UserStats } from '../types';

export const DashboardPage: React.FC = () => {
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeProjects: 0,
    weeklyHours: 0
  });

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load recent projects
      const projectsResponse = await projectsService.getProjects({ 
        limit: 3, 
        page: 1,
        status: 'active'
      });
      
      if (projectsResponse.success && projectsResponse.data) {
        const list = Array.isArray(projectsResponse.data)
          ? projectsResponse.data
          : (projectsResponse.data as any).data ?? [];
        setRecentProjects(list.slice(0, 3));
      }

      // Load today's tasks for current user
      const today = new Date().toISOString().split('T')[0];
      const tasksResponse = await tasksService.getTasks({
        dueDate: { start: today, end: today },
        limit: 5
      });
      
      if (tasksResponse.success && tasksResponse.data) {
        setTodayTasks(tasksResponse.data);
      }

      // Load user statistics
      const statsResponse = await usersService.getUserStats();
      
      if (statsResponse.success && statsResponse.data) {
        const stats = statsResponse.data as UserStats;
        setDashboardStats({
          totalTasks: stats.totalTasks || 0,
          completedTasks: stats.completedTasks || 0,
          activeProjects: stats.activeProjects || 0,
          weeklyHours: stats.weeklyHours || 0
        });
      }

    } catch (error) {
      console.error('Dashboard veri yükleme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completionRate = dashboardStats.totalTasks > 0 
    ? Math.round((dashboardStats.completedTasks / dashboardStats.totalTasks) * 100)
    : 0;

  const quickStats = [
    {
      title: 'Toplam Görevler',
      value: dashboardStats.totalTasks,
      icon: '✅',
      changeType: 'info' as const
    },
    {
      title: 'Tamamlanan',
      value: dashboardStats.completedTasks,
      icon: '📈',
      changeType: 'info' as const
    },
    {
      title: 'Aktif Projeler',
      value: dashboardStats.activeProjects,
      icon: '👥',
      changeType: 'info' as const
    },
    {
      title: 'Bu Hafta',
      value: `${dashboardStats.weeklyHours}h`,
      icon: '🕐',
      changeType: 'info' as const
    }
  ];

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
      const response = await projectsService.createProject({
        name: projectData.name,
        description: projectData.description,
        priority: projectData.priority,
        dueDate: projectData.dueDate,
        color: '#3B82F6',
        icon: '📁',
        tags: projectData.tags,
        memberIds: projectData.memberIds,
        status: projectData.status === 'planning' ? 'planning' : projectData.status === 'on_hold' ? 'on_hold' : projectData.status === 'completed' ? 'completed' : 'active',
        visibility: 'team'
      });
      
      if (response.success) {
        setIsCreateProjectModalOpen(false);
        // Reload dashboard data to show new project
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Proje oluşturma hatası:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'text-red-600 bg-red-50 border-red-200',
      high: 'text-orange-600 bg-orange-50 border-orange-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-green-600 bg-green-50 border-green-200'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      archived: 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600">Projelerinize genel bakış</p>
        </div>
        <Button
          onClick={() => setIsCreateProjectModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <span className="text-xl mr-2">+</span>
          Yeni Proje
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
              </div>
              <div className="ml-4">
                <div className="text-4xl opacity-80">{stat.icon}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <Card className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
              <h2 className="text-2xl font-bold text-gray-900">Son Projeler</h2>
              <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                🔍 Filtrele
              </Button>
            </div>
            <div className="space-y-3">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="text-3xl mt-1">{project.icon}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">{project.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)}`}>
                              {project.priority === 'high' ? 'Yüksek' : 
                               project.priority === 'medium' ? 'Orta' : 
                               project.priority === 'urgent' ? 'Acil' : 'Düşük'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                              {project.status === 'active' ? 'Aktif' : 
                               project.status === 'paused' ? 'Duraklatıldı' : 
                               project.status === 'archived' ? 'Arşivlendi' : 'Tamamlandı'}
                            </span>
                            {project.dueDate && (
                              <span className="text-xs text-gray-500">
                                📅 {new Date(project.dueDate).toLocaleDateString('tr-TR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${project.progress}%`,
                              backgroundColor: project.color 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📁</div>
                  <p>Henüz proje yok. İlk projenizi oluşturun!</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6 sm:space-y-8">
          {/* Today's Tasks */}
          <Card className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-5">Bugünkü Görevler</h3>
            <div className="space-y-3">
              {todayTasks.length > 0 ? (
                todayTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                      <p className="text-xs text-gray-600">Proje: {task.projectId}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? 'Yüksek' : 
                         task.priority === 'medium' ? 'Orta' : 
                         task.priority === 'urgent' ? 'Acil' : 'Düşük'}
                      </span>
                      {task.dueDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(task.dueDate).toLocaleTimeString('tr-TR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <div className="text-2xl mb-2">✅</div>
                  <p className="text-sm">Bugün için görev yok!</p>
                </div>
              )}
            </div>
          </Card>

          {/* Progress Overview */}
          <Card className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-5">İlerleme Özeti</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 border-8 border-blue-600 border-dashed">
                  <span className="text-2xl font-bold text-blue-600">{completionRate}%</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Toplam İlerleme</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tamamlanan</span>
                  <span className="font-medium">{dashboardStats.completedTasks}/{dashboardStats.totalTasks}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Activity Feed */}
          <ActivityFeed />
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onSuccess={handleCreateProject}
      />
    </div>
  );
}; 