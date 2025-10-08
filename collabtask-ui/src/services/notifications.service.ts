import { apiService } from './api.service';
import type { Notification } from '../types';

export interface NotificationFilters {
  type?: 'task' | 'project' | 'team' | 'system';
  status?: 'unread' | 'read' | 'all';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: string;
  endDate?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  taskAssignments: boolean;
  taskDeadlines: boolean;
  projectUpdates: boolean;
  teamInvitations: boolean;
  systemAlerts: boolean;
}

class NotificationsService {
  private endpoint = '/api/notifications';

  async getNotifications(filters: NotificationFilters = {}): Promise<{ success: boolean; data?: Notification[]; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value.toString());
        }
      });

      const url = queryParams.toString() ? `${this.endpoint}?${queryParams.toString()}` : this.endpoint;
      const response = await apiService.get<Notification[]>(url);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Notifications fetch error:', error);
      return { success: false, error: 'Bildirimler yüklenemedi' };
    }
  }

  async markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await apiService.put(`${this.endpoint}/${notificationId}/read`);
      return { success: true };
    } catch (error) {
      console.error('Mark as read error:', error);
      return { success: false, error: 'Bildirim okundu olarak işaretlenemedi' };
    }
  }

  async markAllAsRead(): Promise<{ success: boolean; error?: string }> {
    try {
      await apiService.put(`${this.endpoint}/mark-all-read`);
      return { success: true };
    } catch (error) {
      console.error('Mark all as read error:', error);
      return { success: false, error: 'Tüm bildirimler okundu olarak işaretlenemedi' };
    }
  }

  async deleteNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await apiService.delete(`${this.endpoint}/${notificationId}`);
      return { success: true };
    } catch (error) {
      console.error('Delete notification error:', error);
      return { success: false, error: 'Bildirim silinemedi' };
    }
  }

  async getNotificationSettings(): Promise<{ success: boolean; data?: NotificationSettings; error?: string }> {
    try {
      const response = await apiService.get<NotificationSettings>(`${this.endpoint}/settings`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Notification settings fetch error:', error);
      return { success: false, error: 'Bildirim ayarları yüklenemedi' };
    }
  }

  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<{ success: boolean; error?: string }> {
    try {
      await apiService.put(`${this.endpoint}/settings`, settings);
      return { success: true };
    } catch (error) {
      console.error('Update notification settings error:', error);
      return { success: false, error: 'Bildirim ayarları güncellenemedi' };
    }
  }

  async getUnreadCount(): Promise<{ success: boolean; data?: number; error?: string }> {
    try {
      const response = await apiService.get<{ count: number }>(`${this.endpoint}/unread-count`);
      return { success: true, data: response.data?.count || 0 };
    } catch (error) {
      console.error('Unread count fetch error:', error);
      return { success: false, error: 'Okunmamış bildirim sayısı alınamadı' };
    }
  }

  async createNotification(notification: {
    title: string;
    message: string;
    type: 'task' | 'project' | 'team' | 'system';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    recipientId: string;
    relatedId?: string;
    actionUrl?: string;
  }): Promise<{ success: boolean; data?: Notification; error?: string }> {
    try {
      const response = await apiService.post<Notification>(this.endpoint, notification);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Create notification error:', error);
      return { success: false, error: 'Bildirim oluşturulamadı' };
    }
  }

  async subscribeToNotifications(subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }): Promise<{ success: boolean; error?: string }> {
    try {
      await apiService.post(`${this.endpoint}/subscribe`, subscription);
      return { success: true };
    } catch (error) {
      console.error('Subscribe to notifications error:', error);
      return { success: false, error: 'Bildirim aboneliği oluşturulamadı' };
    }
  }
}

export const notificationsService = new NotificationsService(); 