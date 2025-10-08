import { Router } from 'express';
import { TeamsController } from './teams.controller';
import { authMiddleware } from '../../../core/middleware/auth.middleware';
import { TeamRepositoryImpl } from '../../../infrastructure/database/team.repository.impl';

const router = Router();
const teamRepository = new TeamRepositoryImpl();
const teamsController = new TeamsController(teamRepository);

router.use(authMiddleware.authenticate());

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Takım yönetimi API'leri
 */

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Takımları listele
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Takım listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 */
router.get('/', (req, res) => teamsController.getTeams(req, res));

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Takım detayını getir
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Takım ID
 *     responses:
 *       200:
 *         description: Takım detayı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       404:
 *         description: Takım bulunamadı
 */
router.get('/:id', (req, res) => teamsController.getTeamById(req, res));

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Yeni takım oluştur
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTeamRequest'
 *     responses:
 *       201:
 *         description: Takım başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 */
router.post('/', (req, res) => teamsController.createTeam(req, res));

/**
 * @swagger
 * /api/teams/{id}:
 *   put:
 *     summary: Takımı güncelle
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Takım ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Takım başarıyla güncellendi
 */
router.put('/:id', (req, res) => teamsController.updateTeam(req, res));

/**
 * @swagger
 * /api/teams/{id}:
 *   delete:
 *     summary: Takımı sil
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Takım ID
 *     responses:
 *       204:
 *         description: Takım başarıyla silindi
 */
router.delete('/:id', (req, res) => teamsController.deleteTeam(req, res));

/**
 * @swagger
 * /api/teams/{id}/members:
 *   post:
 *     summary: Takıma üye ekle
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Takım ID
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
router.post('/:id/members', (req, res) => teamsController.addMember(req, res));

/**
 * @swagger
 * /api/teams/{id}/members/{userId}:
 *   delete:
 *     summary: Takımdan üye çıkar
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Takım ID
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
router.delete('/:id/members/:userId', (req, res) => teamsController.removeMember(req, res));

/**
 * @swagger
 * /api/teams/{id}/leader:
 *   put:
 *     summary: Takım liderini değiştir
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Takım ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leaderId:
 *                 type: string
 *             required:
 *               - leaderId
 *     responses:
 *       200:
 *         description: Takım lideri başarıyla değiştirildi
 */
router.put('/:id/leader', (req, res) => teamsController.changeLeader(req, res));

/**
 * @swagger
 * /api/teams/{id}/projects:
 *   get:
 *     summary: Takım projelerini getir
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Takım ID
 *     responses:
 *       200:
 *         description: Takım projeleri
 */
router.get('/:id/projects', (req, res) => teamsController.getTeamProjects(req, res));

export { router as teamsRoutes }; 