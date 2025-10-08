import { Router } from 'express';
import { FilesController } from './files.controller';
import { authMiddleware } from '../../../core/middleware/auth.middleware';

const router = Router();
const filesController = new FilesController();

router.use(authMiddleware.authenticate());

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: Dosya yönetimi API'leri
 */

/**
 * @swagger
 * /api/files/bulk-upload:
 *   post:
 *     summary: Toplu dosya yükleme
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     type:
 *                       type: string
 *                     size:
 *                       type: integer
 *                 minItems: 1
 *                 maxItems: 10
 *             required:
 *               - files
 *     responses:
 *       201:
 *         description: Dosyalar başarıyla yüklendi
 */
router.post('/bulk-upload', (req, res) => filesController.bulkUpload(req, res));

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     summary: Dosya yükle
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UploadFileRequest'
 *     responses:
 *       201:
 *         description: Dosya başarıyla yüklendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileItem'
 */
router.post('/upload', (req, res) => filesController.uploadFile(req, res));

/**
 * @swagger
 * /api/files:
 *   get:
 *     summary: Dosyaları listele
 *     tags: [Files]
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
 *         description: Dosya tipi filtresi
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Arama terimi
 *       - in: query
 *         name: uploadedBy
 *         schema:
 *           type: string
 *         description: Yükleyen kullanıcı ID filtresi
 *     responses:
 *       200:
 *         description: Dosya listesi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 */
router.get('/', (req, res) => filesController.getFiles(req, res));

/**
 * @swagger
 * /api/files/{id}:
 *   get:
 *     summary: Dosya detayını getir
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dosya ID
 *     responses:
 *       200:
 *         description: Dosya detayı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileItem'
 *       404:
 *         description: Dosya bulunamadı
 */
router.get('/:id', (req, res) => filesController.getFile(req, res));

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     summary: Dosyayı sil
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dosya ID
 *     responses:
 *       200:
 *         description: Dosya başarıyla silindi
 */
router.delete('/:id', (req, res) => filesController.deleteFile(req, res));

export { router as filesRoutes }; 