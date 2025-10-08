// Kullanıcı API rotaları
import { Router } from 'express';
import { UsersController } from './users.controller';
import { authMiddleware } from '../../../core/middleware/auth.middleware';

export function createUsersRouter(usersController: UsersController): Router {
    const router = Router();

    /**
     * @swagger
     * tags:
     *   name: Users
     *   description: Kullanıcı yönetimi API'leri
     */

    /**
     * @swagger
     * /api/users/signup:
     *   post:
     *     summary: Kullanıcı kaydı (public)
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateUserRequest'
     *     responses:
     *       201:
     *         description: Kullanıcı başarıyla oluşturuldu
     */
    router.post('/signup', (req, res, next) => usersController.createUser(req, res, next));

    // Protected endpoints (auth required)
    router.use(authMiddleware.authenticate());

    /**
     * @swagger
     * /api/users/me:
     *   get:
     *     summary: Mevcut kullanıcı profilini getir
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Kullanıcı profili
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     */
    router.get('/me', (req, res) => usersController.getCurrentUser(req, res));

    /**
     * @swagger
     * /api/users/me:
     *   put:
     *     summary: Kullanıcı profilini güncelle
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               email:
     *                 type: string
     *                 format: email
     *               avatar:
     *                 type: string
     *               position:
     *                 type: string
     *               timezone:
     *                 type: string
     *     responses:
     *       200:
     *         description: Profil başarıyla güncellendi
     */
    router.put('/me', (req, res) => usersController.updateCurrentUser(req, res));

    /**
     * @swagger
     * /api/users/me/settings:
     *   put:
     *     summary: Kullanıcı ayarlarını güncelle
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               language:
     *                 type: string
     *               theme:
     *                 type: string
     *                 enum: [light, dark]
     *               notifications:
     *                 type: object
     *     responses:
     *       200:
     *         description: Ayarlar başarıyla güncellendi
     */
    router.put('/me/settings', (req, res) => usersController.updateUserSettings(req, res));

    /**
     * @swagger
     * /api/users/me/password:
     *   put:
     *     summary: Kullanıcı şifresini değiştir
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               currentPassword:
     *                 type: string
     *               newPassword:
     *                 type: string
     *                 minLength: 6
     *             required:
     *               - currentPassword
     *               - newPassword
     *     responses:
     *       200:
     *         description: Şifre başarıyla değiştirildi
     */
    router.put('/me/password', (req, res) => usersController.changePassword(req, res));

    /**
     * @swagger
     * /api/users/me/stats:
     *   get:
     *     summary: Mevcut kullanıcının istatistiklerini getir
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Kullanıcı istatistikleri
     */
    router.get('/me/stats', (req, res) => usersController.getCurrentUserStats(req, res));

    /**
     * @swagger
     * /api/users/invite:
     *   post:
     *     summary: Kullanıcı davet et
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *               role:
     *                 type: string
     *                 enum: [admin, manager, member]
     *               message:
     *                 type: string
     *             required:
     *               - email
     *     responses:
     *       201:
     *         description: Davet başarıyla gönderildi
     */
    router.post('/invite', (req, res) => usersController.inviteUser(req, res));

    /**
     * @swagger
     * /api/users:
     *   get:
     *     summary: Kullanıcıları listele
     *     tags: [Users]
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
     *         name: search
     *         schema:
     *           type: string
     *         description: Arama terimi
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
     *     responses:
     *       200:
     *         description: Kullanıcı listesi
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/PaginationResponse'
     */
    router.get('/', (req, res) => usersController.getUsers(req, res));

    /**
     * @swagger
     * /api/users:
     *   post:
     *     summary: Yeni kullanıcı oluştur
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateUserRequest'
     *     responses:
     *       201:
     *         description: Kullanıcı başarıyla oluşturuldu
     */
    router.post('/', (req, res, next) => usersController.createUser(req, res, next));

    /**
     * @swagger
     * /api/users/{id}:
     *   get:
     *     summary: Kullanıcı detayını getir
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Kullanıcı ID
     *     responses:
     *       200:
     *         description: Kullanıcı detayı
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       404:
     *         description: Kullanıcı bulunamadı
     */
    router.get('/:id', (req, res) => usersController.getUserById(req, res));

    /**
     * @swagger
     * /api/users/{id}:
     *   put:
     *     summary: Kullanıcıyı güncelle
     *     tags: [Users]
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
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               email:
     *                 type: string
     *                 format: email
     *               position:
     *                 type: string
     *               department:
     *                 type: string
     *               avatar:
     *                 type: string
     *     responses:
     *       200:
     *         description: Kullanıcı başarıyla güncellendi
     */
    router.put('/:id', (req, res) => usersController.updateUser(req, res));

    /**
     * @swagger
     * /api/users/{id}:
     *   delete:
     *     summary: Kullanıcıyı sil
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Kullanıcı ID
     *     responses:
     *       204:
     *         description: Kullanıcı başarıyla silindi
     */
    router.delete('/:id', (req, res) => usersController.deleteUser(req, res));

    /**
     * @swagger
     * /api/users/{id}/status:
     *   put:
     *     summary: Kullanıcı durumunu güncelle
     *     tags: [Users]
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
     *               status:
     *                 type: string
     *                 enum: [active, inactive, invited]
     *             required:
     *               - status
     *     responses:
     *       200:
     *         description: Kullanıcı durumu güncellendi
     */
    router.put('/:id/status', (req, res) => usersController.updateUserStatus(req, res));

    /**
     * @swagger
     * /api/users/{id}/stats:
     *   get:
     *     summary: Kullanıcı istatistiklerini getir
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Kullanıcı ID
     *     responses:
     *       200:
     *         description: Kullanıcı istatistikleri
     */
    router.get('/:id/stats', (req, res) => usersController.getUserStats(req, res));

    return router;
} 