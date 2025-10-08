import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authMiddleware } from '../../../core/middleware/auth.middleware';

const router = Router();

// UserRepository will be injected from app.ts
let adminController: AdminController;

export function initAdminController(userRepository: any) {
  adminController = new AdminController(userRepository);
}

router.use(authMiddleware.authenticate());

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin ve sistem ayarları API'leri
 */

/**
 * @swagger
 * /api/settings/general:
 *   get:
 *     summary: Genel sistem ayarlarını getir (herkese açık)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Genel sistem ayarları
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 application:
 *                   type: object
 *                 features:
 *                   type: object
 *                 limits:
 *                   type: object
 *                 support:
 *                   type: object
 *                 legal:
 *                   type: object
 */
router.get('/settings/general', (req, res) => adminController.getGeneralSettings(req, res));

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Admin kullanıcı listesi (sadece admin)
 *     tags: [Admin]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, manager, member]
 *         description: Rol filtresi
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, invited]
 *         description: Durum filtresi
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Arama terimi
 *     responses:
 *       200:
 *         description: Admin kullanıcı listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 summary:
 *                   type: object
 *       403:
 *         description: Bu işlem için admin yetkisi gereklidir
 */
router.get('/admin/users', (req, res) => adminController.getAdminUsers(req, res));

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Kullanıcı rolünü güncelle (sadece admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kullanıcı ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, manager, member]
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - role
 *     responses:
 *       200:
 *         description: Kullanıcı rolü başarıyla güncellendi
 *       403:
 *         description: Bu işlem için admin yetkisi gereklidir
 */
router.put('/admin/users/:id/role', (req, res) => adminController.updateUserRole(req, res));

/**
 * @swagger
 * /api/admin/system-stats:
 *   get:
 *     summary: Sistem istatistiklerini getir (sadece admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sistem istatistikleri
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SystemStats'
 *       403:
 *         description: Bu işlem için admin yetkisi gereklidir
 */
router.get('/admin/system-stats', (req, res) => adminController.getSystemStats(req, res));

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Audit loglarını getir (sadece admin)
 *     tags: [Admin]
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
 *         name: action
 *         schema:
 *           type: string
 *         description: Eylem filtresi
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Kullanıcı ID filtresi
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Başlangıç tarihi
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Bitiş tarihi
 *     responses:
 *       200:
 *         description: Audit log listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 filters:
 *                   type: object
 *       403:
 *         description: Bu işlem için admin yetkisi gereklidir
 */
router.get('/admin/audit-logs', (req, res) => adminController.getAuditLogs(req, res));

/**
 * @swagger
 * /api/admin/settings:
 *   put:
 *     summary: Sistem ayarlarını güncelle (sadece admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               security:
 *                 type: object
 *                 properties:
 *                   passwordMinLength:
 *                     type: integer
 *                     minimum: 6
 *                   requireTwoFactor:
 *                     type: boolean
 *                   sessionTimeout:
 *                     type: integer
 *                   maxLoginAttempts:
 *                     type: integer
 *                   ipWhitelist:
 *                     type: array
 *                     items:
 *                       type: string
 *               notifications:
 *                 type: object
 *                 properties:
 *                   emailEnabled:
 *                     type: boolean
 *                   pushEnabled:
 *                     type: boolean
 *                   smsEnabled:
 *                     type: boolean
 *                   digestFrequency:
 *                     type: string
 *                     enum: [daily, weekly, never]
 *               storage:
 *                 type: object
 *                 properties:
 *                   maxFileSize:
 *                     type: integer
 *                   allowedFileTypes:
 *                     type: array
 *                     items:
 *                       type: string
 *                   totalStorageLimit:
 *                     type: integer
 *               performance:
 *                 type: object
 *                 properties:
 *                   cacheEnabled:
 *                     type: boolean
 *                   cacheTtl:
 *                     type: integer
 *                   rateLimitEnabled:
 *                     type: boolean
 *                   rateLimitPerMinute:
 *                     type: integer
 *               features:
 *                 type: object
 *                 properties:
 *                   timeTracking:
 *                     type: boolean
 *                   fileSharing:
 *                     type: boolean
 *                   teamChat:
 *                     type: boolean
 *                   kanbanBoard:
 *                     type: boolean
 *                   analytics:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Sistem ayarları başarıyla güncellendi
 *       403:
 *         description: Bu işlem için admin yetkisi gereklidir
 */
router.put('/admin/settings', (req, res) => adminController.updateSystemSettings(req, res));

export { router as adminRoutes }; 