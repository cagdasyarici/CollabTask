import { Router } from 'express';
import { ProjectsController } from './projects.controller';
import { authMiddleware } from '../../../core/middleware/auth.middleware';
import { ProjectRepositoryImpl } from '../../../infrastructure/database/project.repository.impl';

const router = Router();
const projectRepository = new ProjectRepositoryImpl();
const projectsController = new ProjectsController(projectRepository);

// Tüm route'lar authentication gerektiriyor
router.use(authMiddleware.authenticate());

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Proje yönetimi API'leri
 */

/**
 * @swagger
 * /api/projects/templates:
 *   get:
 *     summary: Proje şablonlarını listele
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Proje şablonları listesi
 */
router.get('/templates', (req, res) => projectsController.getProjectTemplates(req, res));

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Projeleri listele
 *     tags: [Projects]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, active, on_hold, completed, cancelled]
 *         description: Proje durumu filtresi
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Öncelik filtresi
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Arama terimi
 *     responses:
 *       200:
 *         description: Proje listesi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 */
router.get('/', (req, res) => projectsController.getProjects(req, res));

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Proje detayını getir
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Proje ID
 *     responses:
 *       200:
 *         description: Proje detayı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Proje bulunamadı
 */
router.get('/:id', (req, res) => projectsController.getProjectById(req, res));

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Yeni proje oluştur
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *     responses:
 *       201:
 *         description: Proje başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 */
router.post('/', (req, res) => projectsController.createProject(req, res));

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Projeyi güncelle
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Proje ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [planning, active, on_hold, completed, cancelled]
 *               progress:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       200:
 *         description: Proje başarıyla güncellendi
 */
router.put('/:id', (req, res) => projectsController.updateProject(req, res));

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Projeyi sil
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Proje ID
 *     responses:
 *       204:
 *         description: Proje başarıyla silindi
 */
router.delete('/:id', (req, res) => projectsController.deleteProject(req, res));

/**
 * @swagger
 * /api/projects/{id}/members:
 *   post:
 *     summary: Projeye üye ekle
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Proje ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *             required:
 *               - userId
 *     responses:
 *       200:
 *         description: Üye başarıyla eklendi
 */
router.post('/:id/members', (req, res) => projectsController.addMember(req, res));

/**
 * @swagger
 * /api/projects/{id}/members/{userId}:
 *   delete:
 *     summary: Projeden üye çıkar
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Proje ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Kullanıcı ID
 *     responses:
 *       200:
 *         description: Üye başarıyla çıkarıldı
 */
router.delete('/:id/members/:userId', (req, res) => projectsController.removeMember(req, res));

/**
 * @swagger
 * /api/projects/{id}/status:
 *   put:
 *     summary: Proje durumunu güncelle
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Proje ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [planning, active, on_hold, completed, cancelled]
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Proje durumu güncellendi
 */
router.put('/:id/status', (req, res) => projectsController.updateStatus(req, res));

/**
 * @swagger
 * /api/projects/{id}/stats:
 *   get:
 *     summary: Proje istatistiklerini getir
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Proje ID
 *     responses:
 *       200:
 *         description: Proje istatistikleri
 */
router.get('/:id/stats', (req, res) => projectsController.getStats(req, res));

/**
 * @swagger
 * /api/projects/{id}/activities:
 *   get:
 *     summary: Proje aktivitelerini getir
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Proje ID
 *     responses:
 *       200:
 *         description: Proje aktiviteleri
 */
router.get('/:id/activities', (req, res) => projectsController.getProjectActivities(req, res));

export { router as projectsRoutes }; 