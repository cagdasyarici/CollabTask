import { Request, Response } from 'express';
import { BaseController } from '../../../core/base/base.controller';
import { NotificationRepository } from '../domain/notification.repository';

export class NotificationsController extends BaseController {
  constructor(private readonly notificationRepository: NotificationRepository) {
    super();
  }

  // GET /api/notifications
  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return this.unauthorized(res);
      }

      const { read, type } = req.query;
      
      const notifications = await this.notificationRepository.findByUserId(userId, {
        read: read !== undefined ? read === 'true' : undefined,
        type: type as string
      });

      const unreadCount = notifications.filter(n => !n.read).length;

      this.ok(res, {
        data: notifications,
        summary: {
          total: notifications.length,
          unread: unreadCount,
          read: notifications.length - unreadCount
        }
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // PUT /api/notifications/:id/read
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      await this.notificationRepository.markAsRead(id);

      this.ok(res, {
        message: 'Bildirim okundu olarak işaretlendi'
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // PUT /api/notifications/read-all
  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return this.unauthorized(res);
      }

      await this.notificationRepository.markAllAsRead(userId);

      this.ok(res, {
        message: 'Tüm bildirimler okundu olarak işaretlendi'
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // DELETE /api/notifications/:id
  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await this.notificationRepository.delete(id);

      this.ok(res, {
        message: 'Bildirim başarıyla silindi'
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // GET /api/notifications/settings
  async getNotificationSettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return this.unauthorized(res);
      }

      const settings = {
        userId,
        email: {
          enabled: true,
          frequency: 'instant',
          types: ['task_assigned', 'due_date_reminder', 'mention']
        },
        push: {
          enabled: true,
          types: ['task_assigned', 'comment_added', 'mention']
        },
        inApp: {
          enabled: true,
          types: ['all']
        },
        digest: {
          enabled: false,
          frequency: 'daily',
          time: '09:00'
        },
        doNotDisturb: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00'
        }
      };

      this.ok(res, settings);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // PUT /api/notifications/settings
  async updateNotificationSettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return this.unauthorized(res);
      }

      const { email, push, inApp, digest, doNotDisturb } = req.body;

      const updatedSettings = {
        userId,
        email,
        push,
        inApp,
        digest,
        doNotDisturb,
        updatedAt: new Date().toISOString()
      };

      this.ok(res, {
        message: 'Bildirim ayarları başarıyla güncellendi',
        data: updatedSettings
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }
}
