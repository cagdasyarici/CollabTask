import React, { useState, useMemo, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { Dropdown } from '../components/Dropdown';
import { InviteUserModal } from '../components/InviteUserModal';
import { usersService } from '../services/users.service';
import type { User } from '../types';

type UserSortOption = 'name' | 'email' | 'role' | 'joined' | 'lastActive';
type UserFilterRole = 'all' | 'admin' | 'project_manager' | 'developer' | 'designer' | 'analyst';
type UserFilterStatus = 'all' | 'active' | 'inactive' | 'pending';

// Extended User type with additional properties
type ExtendedUser = User & {
  isActive?: boolean;
  joinDate?: string;
  title?: string;
};

export const UsersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<UserFilterRole>('all');
  const [filterStatus, setFilterStatus] = useState<UserFilterStatus>('all');
  const [sortBy, setSortBy] = useState<UserSortOption>('name');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // API State
  const [users, setUsers] = useState<ExtendedUser[]>([]);
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

      const response = await usersService.getUsers();

      if (response.success && response.data) {
        // Map API response to extended user format
        const extendedUsers = response.data.map(user => ({
          ...user,
          isActive: true, // Default to active
          joinDate: user.createdAt || new Date().toISOString(),
          title: user.title || 'Kullanıcı'
        }));
        setUsers(extendedUsers);
      } else {
        throw new Error(response.error || 'Kullanıcılar yüklenemedi');
      }

    } catch (err) {
      console.error('Kullanıcılar yükleme hatası:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async (inviteData: {
    email: string;
    role: string;
    name: string;
  }) => {
    try {
      const response = await usersService.inviteUser(inviteData);
      
      if (response.success) {
        setIsInviteModalOpen(false);
        // Reload users to show new invitation
        await loadData();
      } else {
        alert(response.error || 'Kullanıcı davet edilemedi');
      }
    } catch (error) {
      console.error('Kullanıcı davet etme hatası:', error);
      alert('Kullanıcı davet edilemedi');
    }
  };

  const handleUserStatusChange = async (userId: string, newStatus: 'active' | 'inactive') => {
    try {
      const response = await usersService.updateUserStatus(userId, newStatus);
      
      if (response.success) {
        // Update local state
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId ? { ...user, isActive: newStatus === 'active' } : user
          )
        );
      } else {
        alert(response.error || 'Kullanıcı durumu güncellenemedi');
      }
    } catch (error) {
      console.error('Kullanıcı durumu güncelleme hatası:', error);
      alert('Kullanıcı durumu güncellenemedi');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await usersService.deleteUser(userId);
      
      if (response.success) {
        // Remove from local state
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      } else {
        alert(response.error || 'Kullanıcı silinemedi');
      }
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      alert('Kullanıcı silinemedi');
    }
  };

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      if (filterStatus === 'active') {
        filtered = filtered.filter(user => user.isActive);
      } else if (filterStatus === 'inactive') {
        filtered = filtered.filter(user => !user.isActive);
      } else if (filterStatus === 'pending') {
        filtered = filtered.filter(user => !user.lastActive);
      }
    }

    // Sort users
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'joined':
          if (a.joinDate && b.joinDate) {
            comparison = new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
          }
          break;
        case 'lastActive':
          if (a.lastActive && b.lastActive) {
            comparison = new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
          } else if (a.lastActive) {
            comparison = -1;
          } else if (b.lastActive) {
            comparison = 1;
          }
          break;
        default:
          comparison = 0;
      }
      return comparison;
    });

    return filtered;
  }, [users, searchQuery, filterRole, filterStatus, sortBy]);

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      admin: 'Yönetici',
      project_manager: 'Proje Yöneticisi',
      developer: 'Geliştirici',
      designer: 'Tasarımcı',
      analyst: 'Analist'
    };
    return roleLabels[role] || role;
  };

  const getStatusColor = (user: ExtendedUser) => {
    if (!user.isActive) return 'error';
    if (!user.lastActive) return 'warning';
    return 'success';
  };

  const getStatusLabel = (user: ExtendedUser) => {
    if (!user.isActive) return 'inactive';
    if (!user.lastActive) return 'pending';
    return 'active';
  };

  const roleOptions = [
    { value: 'all', label: 'Tüm Roller' },
    { value: 'admin', label: 'Yönetici' },
    { value: 'project_manager', label: 'Proje Yöneticisi' },
    { value: 'developer', label: 'Geliştirici' },
    { value: 'designer', label: 'Tasarımcı' },
    { value: 'analyst', label: 'Analist' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Tüm Durumlar' },
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Pasif' },
    { value: 'pending', label: 'Beklemede' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Ad' },
    { value: 'email', label: 'E-posta' },
    { value: 'role', label: 'Rol' },
    { value: 'joined', label: 'Katılma Tarihi' },
    { value: 'lastActive', label: 'Son Aktivite' }
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Kullanıcılar yükleniyor...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-red-600 text-xl mb-4">❌ {error}</div>
          <Button onClick={loadData}>Tekrar Dene</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kullanıcılar</h1>
            <p className="text-gray-600">{filteredUsers.length} kullanıcı bulundu</p>
          </div>
          <Button onClick={() => setIsInviteModalOpen(true)}>
            + Kullanıcı Davet Et
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 bg-white rounded-lg border">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Kullanıcı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Dropdown
              trigger={
                <Button variant="outline" size="sm">
                  {roleOptions.find(opt => opt.value === filterRole)?.label || 'Rol Seç'}
                </Button>
              }
              items={roleOptions.map(option => ({
                id: option.value,
                label: option.label,
                onClick: () => setFilterRole(option.value as UserFilterRole)
              }))}
              placement="bottom-start"
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
                onClick: () => setFilterStatus(option.value as UserFilterStatus)
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
                onClick: () => setSortBy(option.value as UserSortOption)
              }))}
              placement="bottom-start"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="grid gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar
                    src={user.avatar}
                    name={user.name}
                    size="lg"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">{user.title}</span>
                      {user.department && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-500">{user.department}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {getRoleLabel(user.role)}
                      </span>
                      <Badge 
                        variant={getStatusColor(user)}
                        size="sm"
                      >
                        {getStatusLabel(user) === 'active' ? 'Aktif' : 
                         getStatusLabel(user) === 'inactive' ? 'Pasif' : 'Beklemede'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.lastActive ? (
                        <>Son aktivite: {new Date(user.lastActive).toLocaleDateString('tr-TR')}</>
                      ) : (
                        <>Katıldı: {user.joinDate ? new Date(user.joinDate).toLocaleDateString('tr-TR') : 'Bilinmiyor'}</>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUserStatusChange(user.id, user.isActive ? 'inactive' : 'active')}
                    >
                      {user.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Sil
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Kullanıcı bulunamadı</h3>
            <p className="text-gray-600 mb-4">Arama kriterlerinize uygun kullanıcı bulunamadı.</p>
            <Button onClick={() => setIsInviteModalOpen(true)}>
              İlk Kullanıcıyı Davet Et
            </Button>
          </div>
        )}

        {/* Invite User Modal */}
        <InviteUserModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onSubmit={handleInviteUser}
        />
      </div>
    </Layout>
  );
}; 