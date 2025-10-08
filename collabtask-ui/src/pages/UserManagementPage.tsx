import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { CreateTeamModal } from '../components/CreateTeamModal';
import { InviteUserModal } from '../components/InviteUserModal';
import { Dropdown } from '../components/Dropdown';
import { teamsService } from '../services/teams.service';
import { usersService } from '../services/users.service';
import { projectsService } from '../services/projects.service';
import type { User, Team, Project } from '../types';

export const UserManagementPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<string>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // API State
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
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

      // Load users, teams, and projects in parallel
      const [usersResponse, teamsResponse, projectsResponse] = await Promise.all([
        usersService.getUsers(),
        teamsService.getTeams(),
        projectsService.getProjects()
      ]);

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

      if (teamsResponse.success && teamsResponse.data) {
        // Handle both array and paginated response
        const teamData = Array.isArray(teamsResponse.data) 
          ? teamsResponse.data 
          : (teamsResponse.data as any).data ?? [];
        setTeams(teamData);
      } else {
        console.warn('Takımlar yüklenemedi:', teamsResponse.error);
        setTeams([]);
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

    } catch (err) {
      console.error('Veri yükleme hatası:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user invitation
  const handleInviteSubmit = async (userData: { name: string; email: string; role: string; teamIds?: string[]; projectIds?: string[] }) => {
    try {
      const response = await usersService.inviteUser({
        email: userData.email,
        role: userData.role as 'member' | 'admin' | 'manager',
        name: userData.name
      });

      if (response.success) {
        setIsInviteModalOpen(false);
        setEditingUser(null);
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

  // Handle team creation/update
  const handleTeamSubmit = async (teamData: { name: string; description: string; color: string; leaderId: string; memberIds: string[]; department: string }) => {
    try {
      let response;
      if (editingTeam) {
        response = await teamsService.updateTeam(editingTeam.id, {
          name: teamData.name,
          description: teamData.description,
          color: teamData.color,
          leaderId: teamData.leaderId,
          department: teamData.department
        });
      } else {
        response = await teamsService.createTeam(teamData);
      }

      if (response.success) {
        setIsTeamModalOpen(false);
        setEditingTeam(null);
        // Reload teams to show changes
        await loadData();
      } else {
        alert(response.error || 'Takım işlemi başarısız');
      }
    } catch (error) {
      console.error('Takım işlemi hatası:', error);
      alert('Takım işlemi başarısız');
    }
  };

  // Handle user status change
  const handleUserStatusChange = async (userId: string, newStatus: 'active' | 'inactive') => {
    try {
      const response = await usersService.updateUserStatus(userId, newStatus);
      
      if (response.success) {
        // Update local state - simulating isActive property
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId ? { ...user, active: newStatus === 'active' } : user
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

  // Handle team deletion
  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Bu takımı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await teamsService.deleteTeam(teamId);
      
      if (response.success) {
        // Remove from local state
        setTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));
      } else {
        alert(response.error || 'Takım silinemedi');
      }
    } catch (error) {
      console.error('Takım silme hatası:', error);
      alert('Takım silinemedi');
    }
  };

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    let filteredData = [...users];

    if (searchQuery) {
      filteredData = filteredData.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.department && user.department.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (roleFilter !== 'all') {
      filteredData = filteredData.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filteredData = filteredData.filter(user => {
          const extendedUser = user as User & { active?: boolean };
          return extendedUser.active !== false;
        });
      } else if (statusFilter === 'inactive') {
        filteredData = filteredData.filter(user => {
          const extendedUser = user as User & { active?: boolean };
          return extendedUser.active === false;
        });
      }
    }

    return filteredData;
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    try {
      if (action === 'activate') {
        await Promise.all(selectedUsers.map(id => handleUserStatusChange(id, 'active')));
      } else if (action === 'deactivate') {
        await Promise.all(selectedUsers.map(id => handleUserStatusChange(id, 'inactive')));
      }
      setSelectedUsers([]);
    } catch (error) {
      console.error('Toplu işlem hatası:', error);
      alert('Toplu işlem başarısız');
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--spacing-xl)' }}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 'var(--spacing-xl)' }}>
        <div className="text-center py-12">
          <div className="text-red-600 text-xl mb-4">❌ {error}</div>
          <Button onClick={loadData}>Tekrar Dene</Button>
        </div>
      </div>
    );
  }

  // User Table Component
  const UserTable: React.FC = () => (
    <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      {/* Table Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '50px 1fr 150px 120px 120px 120px 100px',
        padding: 'var(--spacing-md) var(--spacing-lg)',
        backgroundColor: 'var(--gray-50)',
        borderBottom: '1px solid var(--gray-200)',
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--gray-600)',
        textTransform: 'uppercase'
      }}>
        <div>
          <input
            type="checkbox"
            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedUsers(filteredUsers.map(u => u.id));
              } else {
                setSelectedUsers([]);
              }
            }}
          />
        </div>
        <div>Kullanıcı</div>
        <div>Rol</div>
        <div>Durum</div>
        <div>Son Aktivite</div>
        <div>Projeler</div>
        <div>İşlemler</div>
      </div>

      {/* Table Body */}
      <div>
        {filteredUsers.map((user) => {
          const userProjects = projects.filter(p => p.memberIds.includes(user.id));
          const isSelected = selectedUsers.includes(user.id);
          
          return (
            <div
              key={user.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '50px 1fr 150px 120px 120px 120px 100px',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                borderBottom: '1px solid var(--gray-100)',
                alignItems: 'center',
                backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'var(--gray-50)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleUserSelect(user.id)}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <Avatar src={user.avatar} name={user.name} size="sm" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                    {user.email}
                  </div>
                  {user.department && (
                    <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                      {user.department}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Badge 
                  variant={user.role === 'admin' ? 'error' : user.role === 'manager' ? 'warning' : 'default'}
                  size="sm"
                >
                  {user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Manager' : 'Üye'}
                </Badge>
              </div>
              
              <div>
                <Badge 
                  variant={(user as User & { active?: boolean }).active ? 'success' : 'error'}
                  size="sm"
                >
                  {(user as User & { active?: boolean }).active ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
              
              <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                {user.lastActive ? new Date(user.lastActive).toLocaleDateString('tr-TR') : 'Hiç'}
              </div>
              
              <div style={{ fontSize: '12px' }}>
                {userProjects.length > 0 ? (
                  <span style={{ color: 'var(--primary-color)', fontWeight: 500 }}>
                    {userProjects.length} proje
                  </span>
                ) : (
                  <span style={{ color: 'var(--gray-400)' }}>Proje yok</span>
                )}
              </div>
              
              <div>
                <Dropdown
                  trigger={
                    <Button variant="ghost" size="sm">
                      ⋯
                    </Button>
                  }
                  items={[
                    { 
                      id: 'edit', 
                      label: 'Düzenle', 
                      icon: '✏️', 
                      onClick: () => {
                        setEditingUser(user);
                        setIsInviteModalOpen(true);
                      }
                    },
                    { 
                      id: 'permissions', 
                      label: 'İzinler', 
                      icon: '🔐', 
                      onClick: () => console.log('Edit permissions', user.id) 
                    },
                    { id: 'divider', label: '', divider: true },
                    { 
                      id: 'deactivate', 
                      label: (user as User & { active?: boolean }).active ? 'Deaktive Et' : 'Aktive Et', 
                      icon: (user as User & { active?: boolean }).active ? '⏸️' : '▶️', 
                      onClick: () => handleUserStatusChange(user.id, (user as User & { active?: boolean }).active ? 'inactive' : 'active')
                    }
                  ]}
                  placement="bottom-end"
                />
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: 'var(--spacing-2xl)', 
          color: 'var(--gray-500)' 
        }}>
          <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-lg)' }}>👥</div>
          <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Kullanıcı bulunamadı</h3>
          <p>Arama kriterlerinize uygun kullanıcı bulunamadı.</p>
        </div>
      )}
    </div>
  );

  // Teams Grid Component
  const TeamsGrid: React.FC = () => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
      gap: 'var(--spacing-lg)' 
    }}>
      {teams.map((team) => {
        const teamMembers = team.memberIds.map(id => users.find(u => u.id === id)).filter(Boolean);
        const leader = users.find(u => u.id === team.leaderId);

        return (
          <Card
            key={team.id}
            style={{
              padding: 'var(--spacing-xl)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: 'var(--spacing-md)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
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
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
                  {team.name}
                </h3>
              </div>
              
              <Dropdown
                trigger={
                  <Button variant="ghost" size="sm">
                    ⋯
                  </Button>
                }
                items={[
                  { 
                    id: 'edit', 
                    label: 'Düzenle', 
                    icon: '✏️', 
                    onClick: () => {
                      setEditingTeam(team);
                      setIsTeamModalOpen(true);
                    }
                  },
                  { id: 'members', label: 'Üye Yönet', icon: '👥', onClick: () => console.log('Manage members') },
                  { id: 'divider', label: '', divider: true },
                  { 
                    id: 'delete', 
                    label: 'Sil', 
                    icon: '🗑️', 
                    onClick: () => handleDeleteTeam(team.id)
                  }
                ]}
                placement="bottom-end"
              />
            </div>

            <p style={{ 
              fontSize: '14px', 
              color: 'var(--gray-600)', 
              marginBottom: 'var(--spacing-lg)',
              lineHeight: 1.5
            }}>
              {team.description}
            </p>

            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: 'var(--spacing-xs)' }}>
                Takım Lideri
              </div>
              {leader && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <Avatar src={leader.avatar} name={leader.name} size="xs" />
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{leader.name}</span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: 'var(--spacing-sm)' 
              }}>
                <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Üyeler</span>
                <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                  {teamMembers.length} kişi
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                {teamMembers.slice(0, 8).map((member) => (
                  <Avatar 
                    key={member!.id} 
                    src={member!.avatar} 
                    name={member!.name} 
                    size="xs" 
                  />
                ))}
                {teamMembers.length > 8 && (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--gray-200)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: 'var(--gray-600)'
                  }}>
                    +{teamMembers.length - 8}
                  </div>
                )}
              </div>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
              Oluşturuldu: {new Date(team.createdAt).toLocaleDateString('tr-TR')}
            </div>
          </Card>
        );
      })}

      {/* Add New Team Card */}
      <Card
        style={{
          padding: 'var(--spacing-xl)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          border: '2px dashed var(--gray-300)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: '200px'
        }}
        onClick={() => {
          setEditingTeam(null);
          setIsTeamModalOpen(true);
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary-color)';
          e.currentTarget.style.backgroundColor = 'var(--primary-light)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--gray-300)';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>➕</div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
          Yeni Takım
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
          Yeni bir takım oluştur
        </p>
      </Card>
    </div>
  );

  // Permissions View Component
  const PermissionsView: React.FC = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)' }}>
      {/* Roles */}
      <Card style={{ padding: 'var(--spacing-xl)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
          Roller ve İzinler
        </h3>
        
        {[
          {
            role: 'admin',
            name: 'Administrator',
            color: 'var(--error-color)',
            count: users.filter(u => u.role === 'admin').length,
            permissions: ['Tüm İzinler', 'Kullanıcı Yönetimi', 'Sistem Ayarları', 'Proje Yönetimi']
          },
          {
            role: 'project_manager',
            name: 'Project Manager',
            color: 'var(--warning-color)',
            count: users.filter(u => u.role === 'manager').length,
            permissions: ['Proje Yönetimi', 'Takım Yönetimi', 'Görev Atama', 'Raporlama']
          },
          {
            role: 'developer',
            name: 'Developer',
            color: 'var(--primary-color)',
            count: users.filter(u => u.role === 'member').length,
            permissions: ['Görev Görüntüleme', 'Görev Güncelleme', 'Yorum Yapma', 'Dosya Yükleme']
          }
        ].map((roleInfo) => (
          <div
            key={roleInfo.role}
            style={{
              padding: 'var(--spacing-lg)',
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-md)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: 'var(--spacing-md)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: roleInfo.color
                  }}
                />
                <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                  {roleInfo.name}
                </h4>
              </div>
              <Badge variant="default" size="sm">
                {roleInfo.count} kişi
              </Badge>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
              {roleInfo.permissions.map((permission, index) => (
                <Badge key={index} variant="default" size="sm">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </Card>

      {/* Team Statistics */}
      <Card style={{ padding: 'var(--spacing-xl)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
          Takım İstatistikleri
        </h3>
        
        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: 'var(--spacing-md)',
            backgroundColor: 'var(--gray-50)',
            borderRadius: 'var(--radius-md)'
          }}>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Toplam Takım</span>
            <Badge variant="default" size="lg">{teams.length}</Badge>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: 'var(--spacing-md)',
            backgroundColor: 'var(--gray-50)',
            borderRadius: 'var(--radius-md)'
          }}>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Aktif Kullanıcı</span>
            <Badge variant="success" size="lg">{users.filter(u => (u as User & { active?: boolean }).active).length}</Badge>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: 'var(--spacing-md)',
            backgroundColor: 'var(--gray-50)',
            borderRadius: 'var(--radius-md)'
          }}>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Toplam Proje</span>
            <Badge variant="default" size="lg">{projects.length}</Badge>
          </div>
        </div>
      </Card>
    </div>
  );

  const viewModeOptions = [
    { id: 'users', label: 'Kullanıcılar', icon: '👤' },
    { id: 'teams', label: 'Takımlar', icon: '👥' },
    { id: 'permissions', label: 'İzinler', icon: '🔐' }
  ];

  const roleOptions = [
    { value: 'all', label: 'Tüm Roller' },
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'member', label: 'Üye' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Tüm Durumlar' },
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'İnaktif' },
    { value: 'invited', label: 'Davetli' }
  ];

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Kullanıcı Yönetimi
            </h1>
            <p className="text-gray-600">
              {viewMode === 'users' ? `${filteredUsers.length} kullanıcı` :
               viewMode === 'teams' ? `${teams.length} takım` :
               'İzinler ve roller'}
            </p>
          </div>
          
          <div className="flex gap-4">
            {viewMode === 'teams' && (
              <Button 
                variant="outline"
                onClick={() => {
                  setEditingTeam(null);
                  setIsTeamModalOpen(true);
                }}
              >
                + Yeni Takım
              </Button>
            )}
            <Button 
              variant="primary"
              onClick={() => {
                setEditingUser(null);
                setIsInviteModalOpen(true);
              }}
            >
              + Kullanıcı Davet Et
            </Button>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex mb-6 border-b border-gray-200">
          {viewModeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setViewMode(option.id as string)}
              style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                color: viewMode === option.id ? 'var(--primary-color)' : 'var(--gray-600)',
                borderBottom: viewMode === option.id ? '2px solid var(--primary-color)' : '2px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              {option.icon} {option.label}
            </button>
          ))}
        </div>

        {/* Filters - Only for users view */}
        {viewMode === 'users' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
            padding: 'var(--spacing-lg)',
            backgroundColor: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--gray-200)',
            marginBottom: 'var(--spacing-xl)'
          }}>
            <div style={{ minWidth: '300px' }}>
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
            
            <div style={{ minWidth: '150px' }}>
              <Dropdown
                trigger={
                  <Button variant="outline" size="sm">
                    {roleOptions.find(opt => opt.value === roleFilter)?.label || 'Rol Seç'}
                  </Button>
                }
                items={roleOptions.map(option => ({
                  id: option.value,
                  label: option.label,
                  onClick: () => setRoleFilter(option.value)
                }))}
                placement="bottom-start"
              />
            </div>

            <div style={{ minWidth: '150px' }}>
              <Dropdown
                trigger={
                  <Button variant="outline" size="sm">
                    {statusOptions.find(opt => opt.value === statusFilter)?.label || 'Durum Seç'}
                  </Button>
                }
                items={statusOptions.map(option => ({
                  id: option.value,
                  label: option.label,
                  onClick: () => setStatusFilter(option.value)
                }))}
                placement="bottom-start"
              />
            </div>

            {selectedUsers.length > 0 && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--spacing-sm)' }}>
                <span style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
                  {selectedUsers.length} seçili
                </span>
                <Dropdown
                  trigger={
                    <Button variant="outline" size="sm">
                      Toplu İşlem
                    </Button>
                  }
                  items={[
                    { id: 'activate', label: 'Aktive Et', icon: '▶️', onClick: () => handleBulkAction('activate') },
                    { id: 'deactivate', label: 'Deaktive Et', icon: '⏸️', onClick: () => handleBulkAction('deactivate') },
                    { id: 'divider', label: '', divider: true },
                    { id: 'export', label: 'Export', icon: '📤', onClick: () => handleBulkAction('export') }
                  ]}
                  placement="bottom-end"
                />
              </div>
            )}
          </div>
        )}

        {/* Content based on view mode */}
        {viewMode === 'users' && <UserTable />}
        {viewMode === 'teams' && <TeamsGrid />}
        {viewMode === 'permissions' && <PermissionsView />}

        {/* Real Modals */}
        <InviteUserModal
          isOpen={isInviteModalOpen}
          onClose={() => {
            setIsInviteModalOpen(false);
            setEditingUser(null);
          }}
          onSubmit={handleInviteSubmit}
          editUser={editingUser}
        />

        <CreateTeamModal
          isOpen={isTeamModalOpen}
          onClose={() => {
            setIsTeamModalOpen(false);
            setEditingTeam(null);
          }}
          onSubmit={handleTeamSubmit}
          editTeam={editingTeam}
        />
      </div>
  );
}; 