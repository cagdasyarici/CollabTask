import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Badge } from './Badge';
import { notificationsService } from '../services/notifications.service';
import type { Notification } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    priority: 'all'
  });

  // useCallback to prevent dependency warning
  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filterParams = {
        ...(filters.type !== 'all' && { type: filters.type as 'task' | 'project' | 'team' | 'system' }),
        ...(filters.status !== 'all' && { status: filters.status as 'unread' | 'read' }),
        ...(filters.priority !== 'all' && { priority: filters.priority as 'low' | 'medium' | 'high' | 'urgent' })
      };

      const response = await notificationsService.getNotifications(filterParams);
      
      if (response.success && response.data) {
        setNotifications(response.data);
      } else {
        throw new Error(response.error || 'Bildirimler yüklenemedi');
      }
    } catch (err) {
      console.error('Bildirim yükleme hatası:', err);
      setError(err instanceof Error ? err.message : 'Bildirimler yüklenemedi');
      
      // Fallback to mock data for demo
      setNotifications([
        {
          id: '1',
          title: 'Yeni Görev Atandı',
          message: 'Size yeni bir görev atandı: Frontend geliştirme',
          type: 'task_assigned',
          read: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: '1',
          relatedId: '1',
          actionUrl: '/tasks/1'
        },
        {
          id: '2',
          title: 'Proje Güncellemesi',
          message: 'CollabTask projesi güncellendi',
          type: 'project_invitation',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date().toISOString(),
          userId: '1',
          relatedId: '1',
          actionUrl: '/projects/1'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Load notifications when component mounts or opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await notificationsService.markAsRead(notificationId);
      
      if (response.success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
      } else {
        alert(response.error || 'Bildirim okundu olarak işaretlenemedi');
      }
    } catch (error) {
      console.error('Bildirim okundu işaretleme hatası:', error);
      alert('Bildirim okundu olarak işaretlenemedi');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationsService.markAllAsRead();
      
      if (response.success) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
        );
      } else {
        alert(response.error || 'Tüm bildirimler okundu olarak işaretlenemedi');
      }
    } catch (error) {
      console.error('Tüm bildirimleri okundu işaretleme hatası:', error);
      alert('Tüm bildirimler okundu olarak işaretlenemedi');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await notificationsService.deleteNotification(notificationId);
      
      if (response.success) {
        setNotifications(prev =>
          prev.filter(notification => notification.id !== notificationId)
        );
      } else {
        alert(response.error || 'Bildirim silinemedi');
      }
    } catch (error) {
      console.error('Bildirim silme hatası:', error);
      alert('Bildirim silinemedi');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task': return '📝';
      case 'project': return '📁';
      case 'team': return '👥';
      case 'system': return '⚙️';
      default: return '📢';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'task': return 'Görev';
      case 'project': return 'Proje';
      case 'team': return 'Takım';
      case 'system': return 'Sistem';
      default: return type;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Bildirimler</h2>
              {unreadCount > 0 && (
                <Badge variant="error" size="sm">
                  {unreadCount} okunmamış
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkAllAsRead}
                  disabled={isLoading}
                >
                  Tümünü Okundu İşaretle
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={onClose}>
                ✕
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex items-center gap-3">
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">Tüm Türler</option>
              <option value="task">Görevler</option>
              <option value="project">Projeler</option>
              <option value="team">Takımlar</option>
              <option value="system">Sistem</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="unread">Okunmamış</option>
              <option value="read">Okunmuş</option>
            </select>
            
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">Tüm Öncelikler</option>
              <option value="urgent">Acil</option>
              <option value="high">Yüksek</option>
              <option value="medium">Orta</option>
              <option value="low">Düşük</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Yükleniyor...</span>
            </div>
          )}

          {error && (
            <div className="p-6 text-center">
              <div className="text-red-600 mb-2">❌ {error}</div>
              <Button onClick={loadNotifications} size="sm">
                Tekrar Dene
              </Button>
            </div>
          )}

          {!isLoading && !error && notifications.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-lg font-semibold mb-2">Bildirim yok</h3>
              <p>Henüz hiç bildiriminiz bulunmuyor.</p>
            </div>
          )}

          {!isLoading && !error && notifications.length > 0 && (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {notification.title}
                        </h4>
                        <Badge variant="default" size="sm">
                          {getTypeLabel(notification.type)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {new Date(notification.createdAt).toLocaleString('tr-TR')}
                        </span>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Okundu İşaretle
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            Sil
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}; 