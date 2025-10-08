import { Request, Response, NextFunction } from 'express';
import { JWTService, JWTPayload } from '../services/jwt.service';

// Request interface'ini genişlet
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export interface AuthMiddlewareOptions {
  requiredPermissions?: string[];
  requiredRole?: 'ADMIN' | 'MANAGER' | 'MEMBER';
  optional?: boolean;
}

export class AuthMiddleware {
  private readonly jwtService: JWTService;

  constructor() {
    this.jwtService = new JWTService();
  }

  /**
   * JWT token doğrulama middleware'i
   */
  authenticate = (options: AuthMiddlewareOptions = {}) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
          if (options.optional) {
            return next();
          }
          res.status(401).json({
            success: false,
            error: 'Authorization header gerekli'
          });
          return;
        }

        const token = this.jwtService.extractTokenFromHeader(authHeader);
        
        if (!token) {
          res.status(401).json({
            success: false,
            error: 'Geçersiz authorization format. Bearer token bekleniyor.'
          });
          return;
        }

        const payload = this.jwtService.verifyAccessToken(token);
        req.user = payload;

        // Rol kontrolü
        if (options.requiredRole && payload.role !== options.requiredRole) {
          // Admin her zaman geçebilir
          if (payload.role !== 'ADMIN') {
            res.status(403).json({
              success: false,
              error: 'Bu işlem için yeterli yetkiniz yok'
            });
            return;
          }
        }

        // İzin kontrolü
        if (options.requiredPermissions) {
          const hasAllPermissions = options.requiredPermissions.every(permission => 
            this.jwtService.hasPermission(payload.permissions, permission)
          );

          if (!hasAllPermissions) {
            res.status(403).json({
              success: false,
              error: 'Bu işlem için gerekli izinlere sahip değilsiniz'
            });
            return;
          }
        }

        next();
      } catch (error) {
        res.status(401).json({
          success: false,
          error: 'Geçersiz token'
        });
      }
    };
  };

  /**
   * Sadece admin erişimi
   */
  requireAdmin = () => {
    return this.authenticate({ requiredRole: 'ADMIN' });
  };

  /**
   * Manager veya admin erişimi
   */
  requireManagerOrAdmin = () => {
    return (req: Request, res: Response, next: NextFunction): void => {
      this.authenticate()(req, res, (err?: any) => {
        if (err) return next(err);
        
        const user = req.user;
        if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
          res.status(403).json({
            success: false,
            error: 'Bu işlem için manager veya admin yetkisi gerekli'
          });
          return;
        }
        
        next();
      });
    };
  };

  /**
   * Belirli izinleri kontrol eder
   */
  requirePermissions = (permissions: string[]) => {
    return this.authenticate({ requiredPermissions: permissions });
  };

  /**
   * Opsiyonel authentication - token varsa doğrular, yoksa geçer
   */
  optionalAuth = () => {
    return this.authenticate({ optional: true });
  };

  /**
   * Kullanıcının kendi kaynaklarına erişimini kontrol eder
   */
  requireOwnershipOrAdmin = (userIdField: string = 'userId') => {
    return (req: Request, res: Response, next: NextFunction): void => {
      this.authenticate()(req, res, (err?: any) => {
        if (err) return next(err);
        
        const user = req.user;
        if (!user) {
          res.status(401).json({
            success: false,
            error: 'Authentication gerekli'
          });
          return;
        }

        // Admin her zaman geçebilir
        if (user.role === 'ADMIN') {
          return next();
        }

        // Parametre veya body'den user ID'yi al
        const resourceUserId = req.params[userIdField] || req.body[userIdField];
        
        if (user.userId !== resourceUserId) {
          res.status(403).json({
            success: false,
            error: 'Bu kaynağa erişim yetkiniz yok'
          });
          return;
        }
        
        next();
      });
    };
  };
}

// Singleton instance export et
export const authMiddleware = new AuthMiddleware(); 