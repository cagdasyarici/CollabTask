import jwt, { SignOptions } from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  permissions: string[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JWTService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiration: string;
  private readonly refreshTokenExpiration: string;

  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    this.accessTokenExpiration = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    this.refreshTokenExpiration = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  /**
   * Access token oluşturur (kısa süre geçerli)
   */
  generateAccessToken(payload: JWTPayload): string {
    const options = {
      expiresIn: this.accessTokenExpiration,
      issuer: 'collabtask-api',
      audience: 'collabtask-client'
    } as any;
    
    return jwt.sign(payload as object, this.accessTokenSecret, options);
  }

  /**
   * Refresh token oluşturur (uzun süre geçerli)
   */
  generateRefreshToken(userId: string): string {
    const options = {
      expiresIn: this.refreshTokenExpiration,
      issuer: 'collabtask-api',
      audience: 'collabtask-client'
    } as any;
    
    return jwt.sign({ userId, type: 'refresh' } as object, this.refreshTokenSecret, options);
  }

  /**
   * Token çifti oluşturur
   */
  generateTokenPair(payload: JWTPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload.userId)
    };
  }

  /**
   * Access token'ı doğrular ve payload'ı döndürür
   */
  verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.accessTokenSecret, {
        issuer: 'collabtask-api',
        audience: 'collabtask-client'
      }) as JWTPayload;
    } catch (error) {
      throw new Error('Geçersiz access token');
    }
  }

  /**
   * Refresh token'ı doğrular
   */
  verifyRefreshToken(token: string): { userId: string; type: string } {
    try {
      return jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'collabtask-api',
        audience: 'collabtask-client'
      }) as { userId: string; type: string };
    } catch (error) {
      throw new Error('Geçersiz refresh token');
    }
  }

  /**
   * Token'dan header'ı çıkarır (Bearer token)
   */
  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Kullanıcı rolüne göre izinleri belirler
   */
  getPermissionsByRole(role: 'ADMIN' | 'MANAGER' | 'MEMBER'): string[] {
    const basePermissions = ['read:own_profile', 'update:own_profile'];

    switch (role) {
      case 'ADMIN':
        return [
          ...basePermissions,
          'read:users', 'create:users', 'update:users', 'delete:users',
          'read:projects', 'create:projects', 'update:projects', 'delete:projects',
          'read:tasks', 'create:tasks', 'update:tasks', 'delete:tasks',
          'read:teams', 'create:teams', 'update:teams', 'delete:teams',
          'manage:system', 'view:analytics'
        ];
      
      case 'MANAGER':
        return [
          ...basePermissions,
          'read:users', 'invite:users',
          'read:projects', 'create:projects', 'update:own_projects',
          'read:tasks', 'create:tasks', 'update:tasks', 'assign:tasks',
          'read:teams', 'create:teams', 'manage:own_teams',
          'view:analytics'
        ];
      
      case 'MEMBER':
        return [
          ...basePermissions,
          'read:assigned_projects', 'read:team_projects',
          'read:assigned_tasks', 'update:assigned_tasks', 'comment:tasks',
          'read:own_teams'
        ];
      
      default:
        return basePermissions;
    }
  }

  /**
   * İzin kontrolü yapar
   */
  hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    return userPermissions.includes(requiredPermission) || userPermissions.includes('*');
  }
} 