import { Router } from 'express';
import { SearchController } from './search.controller';
import { authMiddleware } from '../../../core/middleware/auth.middleware';

const router = Router();
const searchController = new SearchController();

router.use(authMiddleware.authenticate());

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Arama API'leri
 */

/**
 * @swagger
 * /api/search/suggestions:
 *   get:
 *     summary: Arama önerilerini getir
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Arama terimi
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, project, task, user, file]
 *         description: Sonuç türü filtresi
 *     responses:
 *       200:
 *         description: Arama önerileri
 */
router.get('/suggestions', (req, res) => searchController.searchSuggestions(req, res));

/**
 * @swagger
 * /api/search/projects:
 *   get:
 *     summary: Projelerde arama yap
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Arama terimi
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
 *         name: owner
 *         schema:
 *           type: string
 *         description: Proje sahibi ID filtresi
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
 *     responses:
 *       200:
 *         description: Proje arama sonuçları
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 query:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SearchResult'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 facets:
 *                   type: object
 */
router.get('/projects', (req, res) => searchController.searchProjects(req, res));

/**
 * @swagger
 * /api/search/tasks:
 *   get:
 *     summary: Görevlerde arama yap
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Arama terimi
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [backlog, todo, in_progress, review, done, blocked]
 *         description: Görev durumu filtresi
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Öncelik filtresi
 *       - in: query
 *         name: assignee
 *         schema:
 *           type: string
 *         description: Atanan kullanıcı ID filtresi
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: Proje ID filtresi
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
 *     responses:
 *       200:
 *         description: Görev arama sonuçları
 */
router.get('/tasks', (req, res) => searchController.searchTasks(req, res));

/**
 * @swagger
 * /api/search/users:
 *   get:
 *     summary: Kullanıcılarda arama yap
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Arama terimi
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, manager, member]
 *         description: Rol filtresi
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Departman filtresi
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, invited]
 *         description: Durum filtresi
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
 *     responses:
 *       200:
 *         description: Kullanıcı arama sonuçları
 */
router.get('/users', (req, res) => searchController.searchUsers(req, res));

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Genel arama yap
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Arama terimi
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, project, task, user, file]
 *         description: Sonuç türü filtresi
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Kategori başına maksimum sonuç sayısı
 *     responses:
 *       200:
 *         description: Genel arama sonuçları
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 query:
 *                   type: string
 *                 totalResults:
 *                   type: integer
 *                 results:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SearchResult'
 *                     tasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SearchResult'
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SearchResult'
 *                     files:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SearchResult'
 */
router.get('/', (req, res) => searchController.globalSearch(req, res));

export { router as searchRoutes }; 