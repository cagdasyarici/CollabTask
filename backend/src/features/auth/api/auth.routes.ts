import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../../core/middleware/auth.middleware';
import { UserRepositoryImpl } from '../../../infrastructure/database/user.repository.impl';
import { JWTService } from '../../../core/services/jwt.service';

export function createAuthRoutes(): Router {
  const router = Router();
  
  // Dependencies
  const userRepository = new UserRepositoryImpl();
  const jwtService = new JWTService();
  const authController = new AuthController(userRepository, jwtService);

  /**
   * @swagger
   * /api/auth/signup:
   *   post:
   *     tags: [Authentication]
   *     summary: Kullanıcı kaydı
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - password
   *             properties:
   *               name:
   *                 type: string
   *                 example: "John Doe"
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "john@example.com"
   *               password:
   *                 type: string
   *                 minLength: 6
   *                 example: "123456"
   *     responses:
   *       201:
   *         description: Kullanıcı başarıyla oluşturuldu
   *       400:
   *         description: Geçersiz input
   */
  router.post('/signup', authController.signup.bind(authController));

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     tags: [Authentication]
   *     summary: Kullanıcı girişi
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "john@example.com"
   *               password:
   *                 type: string
   *                 example: "123456"
   *     responses:
   *       200:
   *         description: Giriş başarılı
   *       401:
   *         description: Geçersiz kimlik bilgileri
   */
  router.post('/login', authController.login.bind(authController));

  /**
   * @swagger
   * /api/auth/refresh:
   *   post:
   *     tags: [Authentication]
   *     summary: Access token yenileme
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Token başarıyla yenilendi
   *       401:
   *         description: Geçersiz refresh token
   */
  router.post('/refresh', authController.refreshToken.bind(authController));

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     tags: [Authentication]
   *     summary: Kullanıcı çıkışı
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Başarıyla çıkış yapıldı
   */
  router.post('/logout', authMiddleware.authenticate(), authController.logout.bind(authController));

  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     tags: [Authentication]
   *     summary: Mevcut kullanıcı profili
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Kullanıcı profil bilgileri
   *       401:
   *         description: Authentication gerekli
   */
  router.get('/me', authMiddleware.authenticate(), authController.getProfile.bind(authController));

  /**
   * @swagger
   * /api/auth/forgot-password:
   *   post:
   *     tags: [Authentication]
   *     summary: Şifre sıfırlama talebi
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "john@example.com"
   *     responses:
   *       200:
   *         description: Şifre sıfırlama maili gönderildi
   *       400:
   *         description: Geçersiz email
   */
  router.post('/forgot-password', authController.forgotPassword.bind(authController));

  return router;
} 