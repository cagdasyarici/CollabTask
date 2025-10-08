import { Router } from 'express';
import { ActivitiesController } from './activities.controller';
import { authMiddleware } from '../../../core/middleware/auth.middleware';
import { ActivityRepositoryImpl } from '../../../infrastructure/database/activity.repository.impl';

const router = Router();
const activityRepository = new ActivityRepositoryImpl();
const activitiesController = new ActivitiesController(activityRepository);

router.use(authMiddleware.authenticate());

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: Aktivite ve analytics API'leri
 */

/**
 * @swagger
 * /api/activities/analytics/dashboard:
 *   get:
 *     summary: Dashboard analytics verilerini getir
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard analytics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardAnalytics'
 */
router.get('/analytics/dashboard', (req, res) => activitiesController.getDashboardAnalytics(req, res));

/**
 * @swagger
 * /api/activities/analytics/projects:
 *   get:
 *     summary: Proje analytics verilerini getir
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Proje analytics
 */
router.get('/analytics/projects', (req, res) => activitiesController.getProjectAnalytics(req, res));

/**
 * @swagger
 * /api/activities/analytics/users:
 *   get:
 *     summary: Kullanıcı analytics verilerini getir
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı analytics
 */
router.get('/analytics/users', (req, res) => activitiesController.getUserAnalytics(req, res));

/**
 * @swagger
 * /api/activities/analytics/tasks:
 *   get:
 *     summary: Görev analytics verilerini getir
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Görev analytics
 */
router.get('/analytics/tasks', (req, res) => activitiesController.getTaskAnalytics(req, res));

/**
 * @swagger
 * /api/activities/analytics/time-tracking:
 *   get:
 *     summary: Zaman takibi analytics verilerini getir
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Zaman takibi analytics
 */
router.get('/analytics/time-tracking', (req, res) => activitiesController.getTimeTrackingAnalytics(req, res));

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Aktiviteleri listele
 *     tags: [Activities]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [task_created, task_updated, task_completed, project_created, comment_added, member_added]
 *         description: Aktivite türü filtresi
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Kullanıcı ID filtresi
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Proje ID filtresi
 *     responses:
 *       200:
 *         description: Aktivite listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Activity'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', (req, res) => activitiesController.getActivities(req, res));

/**
 * @swagger
 * /api/activities/user/{id}:
 *   get:
 *     summary: Kullanıcı aktivitelerini getir
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kullanıcı ID
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
 *         name: type
 *         schema:
 *           type: string
 *         description: Aktivite türü filtresi
 *     responses:
 *       200:
 *         description: Kullanıcı aktiviteleri
 */
router.get('/user/:id', (req, res) => activitiesController.getUserActivities(req, res));

/**
 * @swagger
 * /api/activities/project/{projectId}:
 *   get:
 *     summary: Proje aktivitelerini getir
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Proje ID
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
 *         name: type
 *         schema:
 *           type: string
 *         description: Aktivite türü filtresi
 *     responses:
 *       200:
 *         description: Proje aktiviteleri
 */
router.get('/project/:projectId', (req, res) => activitiesController.getProjectActivities(req, res));

export { router as activitiesRoutes }; 