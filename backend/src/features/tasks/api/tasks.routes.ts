import { Router } from 'express';
import { TasksController } from './tasks.controller';
import { authMiddleware } from '../../../core/middleware/auth.middleware';
import { TaskRepositoryImpl } from '../../../infrastructure/database/task.repository.impl';

const router = Router();
const taskRepository = new TaskRepositoryImpl();
const tasksController = new TasksController(taskRepository);

router.use(authMiddleware.authenticate());

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Görev yönetimi API'leri
 */

/**
 * @swagger
 * /api/tasks/kanban/{projectId}:
 *   get:
 *     summary: Proje kanban board'unu getir
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Proje ID
 *     responses:
 *       200:
 *         description: Kanban board verisi
 */
router.get('/kanban/:projectId', (req, res) => tasksController.getKanbanBoard(req, res));

/**
 * @swagger
 * /api/tasks/bulk-update:
 *   post:
 *     summary: Görevleri toplu güncelle
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taskIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               updates:
 *                 type: object
 *             required:
 *               - taskIds
 *               - updates
 *     responses:
 *       200:
 *         description: Görevler başarıyla güncellendi
 */
router.post('/bulk-update', (req, res) => tasksController.bulkUpdate(req, res));

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Görevleri listele
 *     tags: [Tasks]
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
 *           enum: [backlog, todo, in_progress, review, done, blocked]
 *         description: Görev durumu filtresi
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Öncelik filtresi
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: Proje ID filtresi
 *       - in: query
 *         name: assignee
 *         schema:
 *           type: string
 *         description: Atanan kullanıcı ID filtresi
 *     responses:
 *       200:
 *         description: Görev listesi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 */
router.get('/', (req, res) => tasksController.getTasks(req, res));

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Görev detayını getir
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Görev ID
 *     responses:
 *       200:
 *         description: Görev detayı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Görev bulunamadı
 */
router.get('/:id', (req, res) => tasksController.getTaskById(req, res));

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Yeni görev oluştur
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *     responses:
 *       201:
 *         description: Görev başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 */
router.post('/', (req, res) => tasksController.createTask(req, res));

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Görevi güncelle
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Görev ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [backlog, todo, in_progress, review, done, blocked]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               assigneeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               actualHours:
 *                 type: number
 *     responses:
 *       200:
 *         description: Görev başarıyla güncellendi
 */
router.put('/:id', (req, res) => tasksController.updateTask(req, res));

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Görevi sil
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Görev ID
 *     responses:
 *       204:
 *         description: Görev başarıyla silindi
 */
router.delete('/:id', (req, res) => tasksController.deleteTask(req, res));

/**
 * @swagger
 * /api/tasks/{id}/status:
 *   put:
 *     summary: Görev durumunu güncelle
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Görev ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [backlog, todo, in_progress, review, done, blocked]
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Görev durumu güncellendi
 */
router.put('/:id/status', (req, res) => tasksController.updateStatus(req, res));

/**
 * @swagger
 * /api/tasks/{id}/assign:
 *   put:
 *     summary: Görev atama
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Görev ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assigneeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - assigneeIds
 *     responses:
 *       200:
 *         description: Görev başarıyla atandı
 */
router.put('/:id/assign', (req, res) => tasksController.assignTask(req, res));

/**
 * @swagger
 * /api/tasks/{id}/comments:
 *   post:
 *     summary: Göreve yorum ekle
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Görev ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               mentions:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - content
 *     responses:
 *       201:
 *         description: Yorum başarıyla eklendi
 */
router.post('/:id/comments', (req, res) => tasksController.addComment(req, res));

/**
 * @swagger
 * /api/tasks/{id}/comments/{commentId}:
 *   put:
 *     summary: Yorumu güncelle
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Görev ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Yorum ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *             required:
 *               - content
 *     responses:
 *       200:
 *         description: Yorum başarıyla güncellendi
 */
router.put('/:id/comments/:commentId', (req, res) => tasksController.updateComment(req, res));

/**
 * @swagger
 * /api/tasks/{id}/comments/{commentId}:
 *   delete:
 *     summary: Yorumu sil
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Görev ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Yorum ID
 *     responses:
 *       204:
 *         description: Yorum başarıyla silindi
 */
router.delete('/:id/comments/:commentId', (req, res) => tasksController.deleteComment(req, res));

/**
 * @swagger
 * /api/tasks/{id}/attachments:
 *   post:
 *     summary: Göreve dosya ekle
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Görev ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               url:
 *                 type: string
 *               type:
 *                 type: string
 *               size:
 *                 type: integer
 *             required:
 *               - name
 *               - url
 *               - type
 *               - size
 *     responses:
 *       201:
 *         description: Dosya başarıyla eklendi
 */
router.post('/:id/attachments', (req, res) => tasksController.addAttachment(req, res));

/**
 * @swagger
 * /api/tasks/{id}/attachments/{attachmentId}:
 *   delete:
 *     summary: Dosyayı sil
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Görev ID
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Dosya ID
 *     responses:
 *       204:
 *         description: Dosya başarıyla silindi
 */
router.delete('/:id/attachments/:attachmentId', (req, res) => tasksController.deleteAttachment(req, res));

/**
 * @swagger
 * /api/tasks/{id}/subtasks:
 *   post:
 *     summary: Alt görev ekle
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Görev ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               assigneeId:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *             required:
 *               - title
 *     responses:
 *       201:
 *         description: Alt görev başarıyla eklendi
 */
router.post('/:id/subtasks', (req, res) => tasksController.addSubtask(req, res));

/**
 * @swagger
 * /api/tasks/{id}/subtasks/{subtaskId}:
 *   put:
 *     summary: Alt görevi güncelle
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Görev ID
 *       - in: path
 *         name: subtaskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Alt görev ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               completed:
 *                 type: boolean
 *               assigneeId:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Alt görev başarıyla güncellendi
 */
router.put('/:id/subtasks/:subtaskId', (req, res) => tasksController.updateSubtask(req, res));

/**
 * @swagger
 * /api/tasks/{id}/subtasks/{subtaskId}:
 *   delete:
 *     summary: Alt görevi sil
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Görev ID
 *       - in: path
 *         name: subtaskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Alt görev ID
 *     responses:
 *       204:
 *         description: Alt görev başarıyla silindi
 */
router.delete('/:id/subtasks/:subtaskId', (req, res) => tasksController.deleteSubtask(req, res));

/**
 * @swagger
 * /api/tasks/{id}/time-entries:
 *   post:
 *     summary: Zaman kaydı ekle
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Görev ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *             required:
 *               - startTime
 *               - endTime
 *     responses:
 *       201:
 *         description: Zaman kaydı başarıyla eklendi
 *   get:
 *     summary: Zaman kayıtlarını getir
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Görev ID
 *     responses:
 *       200:
 *         description: Zaman kayıtları listesi
 */
router.post('/:id/time-entries', (req, res) => tasksController.addTimeEntry(req, res));
router.get('/:id/time-entries', (req, res) => tasksController.getTimeEntries(req, res));

export { router as tasksRoutes }; 