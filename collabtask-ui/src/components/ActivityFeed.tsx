import React, { useState, useMemo } from 'react';
import { Card, Avatar, Badge, Button, Input, Select } from './index';
import type { Activity } from '../types';

interface ActivityFeedProps {
  activities?: Activity[];
  showFilters?: boolean;
  maxHeight?: string;
  projectId?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities = [],
  showFilters = true,
  maxHeight = '500px',
  projectId
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter activities
  const filteredActivities = useMemo(() => {
    let filtered = [...activities];

    // Filter by project if projectId is provided
    if (projectId) {
      filtered = filtered.filter(activity => activity.projectId === projectId);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(activity => activity.type === filterType);
    }

    // Filter by user
    if (filterUser !== 'all') {
      filtered = filtered.filter(activity => activity.userId === filterUser);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by creation date (newest first)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activities, filterType, filterUser, searchQuery, projectId]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_created': return '📝';
      case 'task_updated': return '✏️';
      case 'task_completed': return '✅';
      case 'project_created': return '🎯';
      case 'user_joined': return '👋';
      case 'comment_added': return '💬';
      default: return '📋';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_created': return 'var(--primary-color)';
      case 'task_updated': return 'var(--warning-color)';
      case 'task_completed': return 'var(--success-color)';
      case 'project_created': return 'var(--purple-color)';
      case 'user_joined': return 'var(--info-color)';
      case 'comment_added': return 'var(--blue-color)';
      default: return 'var(--gray-color)';
    }
  };

  const formatActivityTime = (dateString: string) => {
    const now = new Date();
    const activityTime = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Şimdi';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    
    return activityTime.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelatedObject = (_activity: Activity) => null;

  const activityTypeOptions = [
    { value: 'all', label: 'Tüm Aktiviteler' },
    { value: 'task_created', label: 'Görev Oluşturuldu' },
    { value: 'task_updated', label: 'Görev Güncellendi' },
    { value: 'task_completed', label: 'Görev Tamamlandı' },
    { value: 'project_created', label: 'Proje Oluşturuldu' },
    { value: 'user_joined', label: 'Kullanıcı Katıldı' },
    { value: 'comment_added', label: 'Yorum Eklendi' }
  ];

  const userOptions = [
    { value: 'all', label: 'Tüm Kullanıcılar' }
  ];

  return (
    <div>
      {/* Filters */}
      {showFilters && (
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)',
          padding: 'var(--spacing-md)',
          backgroundColor: 'var(--gray-50)',
          borderRadius: 'var(--radius-md)'
        }}>
          <div style={{ minWidth: '200px' }}>
            <Input
              placeholder="Aktivitelerde ara..."
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
            <Select
              value={filterType}
              onChange={(value) => setFilterType(value)}
              options={activityTypeOptions}
            />
          </div>

          <div style={{ minWidth: '150px' }}>
            <Select
              value={filterUser}
              onChange={(value) => setFilterUser(value)}
              options={userOptions}
            />
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            fontSize: '14px', 
            color: 'var(--gray-600)',
            marginLeft: 'auto'
          }}>
            {filteredActivities.length} aktivite
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      <div style={{ 
        maxHeight: maxHeight, 
        overflowY: 'auto',
        paddingRight: 'var(--spacing-sm)'
      }}>
        {filteredActivities.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
            <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-lg)' }}>📋</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
              Aktivite bulunamadı
            </h3>
            <p style={{ color: 'var(--gray-600)' }}>
              Arama kriterlerinize uygun aktivite bulunmadı.
            </p>
          </Card>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Timeline Line */}
            <div
              style={{
                position: 'absolute',
                left: '24px',
                top: '20px',
                bottom: '20px',
                width: '2px',
                backgroundColor: 'var(--gray-200)',
                zIndex: 0
              }}
            />

            {/* Activities */}
            {filteredActivities.map((activity) => {
              const userName = activity.userId || 'Kullanıcı';
              const relatedObject = getRelatedObject(activity);

              return (
                <div
                  key={activity.id}
                  style={{
                    position: 'relative',
                    marginBottom: 'var(--spacing-lg)',
                    paddingLeft: '60px'
                  }}
                >
                  {/* Timeline Icon */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '8px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: getActivityColor(activity.type),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      zIndex: 1,
                      border: '2px solid var(--white)'
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Activity Card */}
                  <Card style={{ 
                    padding: 'var(--spacing-md)',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)' }}>
                      {/* User Avatar */}
                      <Avatar name={userName} size="sm" />

                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          marginBottom: 'var(--spacing-xs)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <span style={{ fontWeight: 600, fontSize: '14px' }}>{userName}</span>
                            <Badge 
                              variant="default" 
                              size="sm"
                            >
                              {activityTypeOptions.find(opt => opt.value === activity.type)?.label || activity.type}
                            </Badge>
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                            {formatActivityTime(activity.createdAt)}
                          </span>
                        </div>

                        <p style={{ 
                          fontSize: '14px', 
                          color: 'var(--gray-700)',
                          marginBottom: 'var(--spacing-sm)',
                          lineHeight: 1.4
                        }}>
                          {activity.description}
                        </p>

                        {/* Related Object */}
                        {false && relatedObject && (
                          <div style={{
                            padding: 'var(--spacing-sm)',
                            backgroundColor: 'var(--gray-50)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--gray-200)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)'
                          }}>
                            <span style={{ fontSize: '16px' }}>
                              📝
                            </span>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 500 }}>
                                İlgili İçerik
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Metadata */}
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div style={{ 
                            marginTop: 'var(--spacing-sm)',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 'var(--spacing-xs)'
                          }}>
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <Badge key={key} variant="default" size="sm">
                                {key}: {String(value)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {filteredActivities.length > 10 && (
          <div style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)' }}>
            <Button 
              variant="outline"
              onClick={() => console.log('Load more activities')}
            >
              Daha fazla yükle
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}; 