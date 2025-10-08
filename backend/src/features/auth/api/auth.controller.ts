import { Request, Response } from 'express';
import { BaseController } from '../../../core/interfaces';
import { ValidationError } from '../../../core/errors';
import { JWTService } from '../../../core/services/jwt.service';
import { SignupCommand } from '../application/commands/signup.command';
import { SignupHandler, SignupResult } from '../application/commands/signup.handler';
import { LoginCommand } from '../application/commands/login.command';
import { LoginHandler, LoginResult } from '../application/commands/login.handler';
import { UserRepository } from '../../users/domain/user.repository';

export class AuthController extends BaseController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JWTService
  ) {
    super();
  }

  /**
   * POST /api/auth/signup
   * Yeni kullanıcı kaydı
   */
  async signup(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      // Input validasyonu
      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          error: 'İsim, email ve şifre gereklidir'
        });
        return;
      }

      const command = new SignupCommand(name, email, password);
      const handler = new SignupHandler(this.userRepository, this.jwtService);
      
      const result: SignupResult = await handler.handle(command);

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          token: result.tokens.accessToken,
          message: result.message
        },
        message: result.message
      });

    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        console.error('Signup error:', error);
        res.status(500).json({
          success: false,
          error: 'Kayıt işlemi sırasında bir hata oluştu'
        });
      }
    }
  }

  /**
   * POST /api/auth/login
   * Kullanıcı girişi
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Input validasyonu
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email ve şifre gereklidir'
        });
        return;
      }

      const command = new LoginCommand(email, password);
      const handler = new LoginHandler(this.userRepository, this.jwtService);
      
      const result: LoginResult = await handler.handle(command);

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          token: result.tokens.accessToken,
          message: result.message
        },
        message: result.message
      });

    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(401).json({
          success: false,
          error: error.message
        });
      } else {
        console.error('Login error:', error);
        res.status(500).json({
          success: false,
          error: 'Giriş işlemi sırasında bir hata oluştu'
        });
      }
    }
  }

  /**
   * POST /api/auth/refresh
   * Access token yenileme
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Refresh token gereklidir'
        });
        return;
      }

      // Refresh token'ı doğrula
      const payload = this.jwtService.verifyRefreshToken(refreshToken);
      
      // Kullanıcıyı bul
      const user = await this.userRepository.findById(payload.userId);
      if (!user || user.status !== 'ACTIVE') {
        res.status(401).json({
          success: false,
          error: 'Geçersiz kullanıcı'
        });
        return;
      }

      // Yeni token çifti oluştur
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions: this.jwtService.getPermissionsByRole(user.role)
      };

      const tokens = this.jwtService.generateTokenPair(tokenPayload);

      res.status(200).json({
        success: true,
        data: {
          tokens,
          user: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
            status: user.status
          }
        },
        message: 'Token başarıyla yenilendi'
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        error: 'Geçersiz refresh token'
      });
    }
  }

  /**
   * POST /api/auth/logout
   * Kullanıcı çıkışı (optional - client-side token silme)
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Client-side'da token silinmesi yeterli
      // İsteğe bağlı: Token blacklist implementasyonu
      
      res.status(200).json({
        success: true,
        message: 'Başarıyla çıkış yapıldı'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Çıkış işlemi sırasında bir hata oluştu'
      });
    }
  }

  /**
   * GET /api/auth/me
   * Mevcut kullanıcı bilgilerini getir
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Authentication gerekli'
        });
        return;
      }

      // Veritabanından güncel kullanıcı bilgilerini al
      const currentUser = await this.userRepository.findById(user.userId);
      
      if (!currentUser) {
        res.status(404).json({
          success: false,
          error: 'Kullanıcı bulunamadı'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: currentUser.id,
          name: `${currentUser.firstName} ${currentUser.lastName}`,
          email: currentUser.email,
          avatar: currentUser.avatar,
          role: currentUser.role,
          status: currentUser.status,
          position: currentUser.position,
          department: currentUser.department,
          timezone: currentUser.timezone,
          lastActive: currentUser.lastActive,
          createdAt: currentUser.createdAt
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Profil bilgileri alınırken bir hata oluştu'
      });
    }
  }

  /**
   * POST /api/auth/forgot-password
   * Şifre sıfırlama talebi
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: 'Email adresi gereklidir'
        });
        return;
      }

      // TODO: Implement password reset logic
      // 1. Check if user exists
      // 2. Generate reset token
      // 3. Send email with reset link
      // 4. Store reset token in database

      // Şimdilik basit response
      res.status(200).json({
        success: true,
        message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi'
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        error: 'Şifre sıfırlama talebi işlenirken bir hata oluştu'
      });
    }
  }
} 