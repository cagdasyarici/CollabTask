import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authMiddleware } from '../../../core/middleware/auth.middleware';
import { NotificationRepositoryImpl } from '../../../infrastructure/database/notification.repository.impl';

const router = Router();
const notificationRepository = new NotificationRepositoryImpl();
const notificationsController = new NotificationsController(notificationRepository);

router.use(authMiddleware.authenticate());

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Bildirim yönetimi API'leri
 */

/**
 * @swagger
 * /api/notifications/settings:
 *   get:
 *     summary: Bildirim ayarlarını getir
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bildirim ayarları
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 email:
 *                   type: object
 *                 push:
 *                   type: object
 *                 inApp:
 *                   type: object
 *                 digest:
 *                   type: object
 *                 doNotDisturb:
 *                   type: object
 */
router.get('/settings', (req, res) => notificationsController.getNotificationSettings(req, res));

/**
 * @swagger
 * /api/notifications/settings:
 *   post:
 *     summary: Bildirim ayarlarını güncelle
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   taskAssigned:
 *                     type: boolean
 *                   taskCompleted:
 *                     type: boolean
 *                   commentAdded:
 *                     type: boolean
 *                   dueDateReminder:
 *                     type: boolean
 *                   projectInvitation:
 *                     type: boolean
 *                   mention:
 *                     type: boolean
 *               push:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   taskAssigned:
 *                     type: boolean
 *                   taskCompleted:
 *                     type: boolean
 *                   commentAdded:
 *                     type: boolean
 *                   dueDateReminder:
 *                     type: boolean
 *                   projectInvitation:
 *                     type: boolean
 *                   mention:
 *                     type: boolean
 *               inApp:
 *                 type: object
 *               digest:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   frequency:
 *                     type: string
 *                     enum: [daily, weekly, never]
 *                   time:
 *                     type: string
 *               doNotDisturb:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   startTime:
 *                     type: string
 *                   endTime:
 *                     type: string
 *     responses:
 *       200:
 *         description: Bildirim ayarları başarıyla güncellendi
 */
router.post('/settings', (req, res) => notificationsController.updateNotificationSettings(req, res));

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   put:
 *     summary: Tüm bildirimleri okundu işaretle
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tüm bildirimler okundu olarak işaretlendi
 */
router.put('/mark-all-read', (req, res) => notificationsController.markAllAsRead(req, res));

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Bildirimleri listele
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Sayfa numarası
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Sayfa başına kayıt sayısı
 *       - in: query
 *         name: read
 *         schema:
 *           type: boolean
 *         description: Okunma durumu filtresi
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [task_assigned, task_completed, comment_added, due_date_reminder, project_invitation, mention]
 *         description: Bildirim türü filtresi
 *     responses:
 *       200:
 *         description: Bildirim listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     unread:
 *                       type: integer
 *                     read:
 *                       type: integer
 */
router.get('/', (req, res) => notificationsController.getNotifications(req, res));

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Bildirimi okundu işaretle
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bildirim ID
 *     responses:
 *       200:
 *         description: Bildirim okundu olarak işaretlendi
 */
router.put('/:id/read', (req, res) => notificationsController.markAsRead(req, res));

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Bildirimi sil
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bildirim ID
 *     responses:
 *       200:
 *         description: Bildirim başarıyla silindi
 */
router.delete('/:id', (req, res) => notificationsController.deleteNotification(req, res));

export { router as notificationsRoutes }; 