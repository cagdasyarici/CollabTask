import { Request, Response } from 'express';
import { BaseController } from '../../../core/base/base.controller';
import { UserRepository } from '../../users/domain/user.repository';
import { AdminService } from '../../../infrastructure/database/admin.service';

export class AdminController extends BaseController {
  private adminService: AdminService;

  constructor(private readonly userRepository: UserRepository) {
    super();
    this.adminService = new AdminService();
  }

  // GET /api/admin/users
  async getAdminUsers(req: Request, res: Response): Promise<void> {
    try {
      // Admin yetkisi kontrolü
      if (req.user?.role !== 'ADMIN') {
        return this.forbidden(res, 'Bu işlem için admin yetkisi gereklidir');
      }

      const { page, limit, role, status, search } = req.query;

      // Get all users from database
      const users = await this.userRepository.findActiveUsers();
      
      // Apply filters
      let filteredUsers = users;

      if (role) {
        filteredUsers = filteredUsers.filter(u => u.role === role);
      }

      if (status) {
        filteredUsers = filteredUsers.filter(u => u.status === status);
      }

      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredUsers = filteredUsers.filter(u => 
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm) ||
          u.email.toLowerCase().includes(searchTerm) ||
          u.department?.toLowerCase().includes(searchTerm)
        );
      }

      // Pagination
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 20;
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limitNum);

      this.ok(res, {
        data: paginatedUsers.map(u => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email,
          role: u.role,
          status: u.status,
          position: u.position,
          department: u.department,
          createdAt: u.createdAt,
          lastActive: u.lastActive
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: filteredUsers.length,
          totalPages: Math.ceil(filteredUsers.length / limitNum)
        },
        summary: {
          total: users.length,
          active: users.filter(u => u.status === 'ACTIVE').length,
          inactive: users.filter(u => u.status === 'INACTIVE').length,
          invited: users.filter(u => u.status === 'INVITED').length,
          byRole: {
            admin: users.filter(u => u.role === 'ADMIN').length,
            manager: users.filter(u => u.role === 'MANAGER').length,
            member: users.filter(u => u.role === 'MEMBER').length
          }
        }
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // PUT /api/admin/users/:id/role
  async updateUserRole(req: Request, res: Response): Promise<void> {
    try {
      // Admin yetkisi kontrolü
      if (req.user?.role !== 'ADMIN') {
        return this.forbidden(res, 'Bu işlem için admin yetkisi gereklidir');
      }

      const { id } = req.params;
      const { role, permissions } = req.body;

      if (!['admin', 'manager', 'member'].includes(role)) {
        return this.badRequest(res, 'Geçersiz rol. admin, manager veya member olmalıdır');
      }

      // Mock role update
      const updatedUser = {
        id,
        role,
        permissions: permissions || [],
        updatedAt: new Date().toISOString(),
        updatedBy: req.user?.userId
      };

      this.ok(res, {
        message: 'Kullanıcı rolü başarıyla güncellendi',
        data: updatedUser
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // GET /api/admin/system-stats
  async getSystemStats(req: Request, res: Response): Promise<void> {
    try {
      // Admin yetkisi kontrolü
      if (req.user?.role !== 'ADMIN') {
        return this.forbidden(res, 'Bu işlem için admin yetkisi gereklidir');
      }

      const stats = await this.adminService.getSystemStatistics();

      this.ok(res, stats);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // GET /api/admin/audit-logs
  async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      // Admin yetkisi kontrolü
      if (req.user?.role !== 'ADMIN') {
        return this.forbidden(res, 'Bu işlem için admin yetkisi gereklidir');
      }

      const { page, limit, action, userId, dateFrom, dateTo } = req.query;

      // TODO: Implement actual audit logging system
      const logs = [
        {
          id: '1',
          timestamp: '2024-07-09T14:30:00Z',
          action: 'user.login',
          category: 'authentication',
          severity: 'info',
          userId: '1',
          userName: 'Ahmet Yılmaz',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: {
            method: 'password',
            success: true,
            sessionId: 'sess_123456'
          },
          resource: null,
          resourceId: null
        },
        {
          id: '2',
          timestamp: '2024-07-09T14:25:00Z',
          action: 'project.created',
          category: 'project_management',
          severity: 'info',
          userId: '1',
          userName: 'Ahmet Yılmaz',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: {
            projectName: 'Yeni Proje',
            projectId: '5'
          },
          resource: 'project',
          resourceId: '5'
        },
        {
          id: '3',
          timestamp: '2024-07-09T13:45:00Z',
          action: 'user.role.updated',
          category: 'user_management',
          severity: 'warning',
          userId: '1',
          userName: 'Ahmet Yılmaz',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: {
            targetUserId: '3',
            targetUserName: 'Mehmet Kaya',
            oldRole: 'member',
            newRole: 'manager'
          },
          resource: 'user',
          resourceId: '3'
        },
        {
          id: '4',
          timestamp: '2024-07-09T10:15:00Z',
          action: 'user.login.failed',
          category: 'authentication',
          severity: 'error',
          userId: null,
          userName: null,
          ipAddress: '192.168.1.200',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: {
            email: 'wrong@example.com',
            reason: 'invalid_credentials',
            attemptCount: 3
          },
          resource: null,
          resourceId: null
        }
      ];

      // Apply filters
      let filteredLogs = logs;

      if (action) {
        filteredLogs = filteredLogs.filter(log => log.action.includes(action as string));
      }

      if (userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === userId);
      }

      this.ok(res, {
        data: filteredLogs,
        pagination: {
          page: parseInt(page as string) || 1,
          limit: parseInt(limit as string) || 50,
          total: filteredLogs.length,
          totalPages: Math.ceil(filteredLogs.length / (parseInt(limit as string) || 50))
        },
        filters: {
          actions: ['user.login', 'user.logout', 'project.created', 'user.role.updated', 'file.uploaded'],
          categories: ['authentication', 'project_management', 'user_management', 'file_management'],
          severities: ['info', 'warning', 'error', 'critical']
        }
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // PUT /api/admin/settings
  async updateSystemSettings(req: Request, res: Response): Promise<void> {
    try {
      // Admin yetkisi kontrolü
      if (req.user?.role !== 'ADMIN') {
        return this.forbidden(res, 'Bu işlem için admin yetkisi gereklidir');
      }

      const {
        security,
        notifications,
        storage,
        performance,
        features
      } = req.body;

      // TODO: Implement actual system settings storage
      const updatedSettings = {
        security: {
          passwordMinLength: security?.passwordMinLength || 8,
          requireTwoFactor: security?.requireTwoFactor || false,
          sessionTimeout: security?.sessionTimeout || 3600,
          maxLoginAttempts: security?.maxLoginAttempts || 5,
          ipWhitelist: security?.ipWhitelist || []
        },
        notifications: {
          emailEnabled: notifications?.emailEnabled || true,
          pushEnabled: notifications?.pushEnabled || true,
          smsEnabled: notifications?.smsEnabled || false,
          digestFrequency: notifications?.digestFrequency || 'daily'
        },
        storage: {
          maxFileSize: storage?.maxFileSize || 10485760, // 10MB
          allowedFileTypes: storage?.allowedFileTypes || ['pdf', 'jpg', 'png', 'docx'],
          totalStorageLimit: storage?.totalStorageLimit || 107374182400 // 100GB
        },
        performance: {
          cacheEnabled: performance?.cacheEnabled || true,
          cacheTtl: performance?.cacheTtl || 300,
          rateLimitEnabled: performance?.rateLimitEnabled || true,
          rateLimitPerMinute: performance?.rateLimitPerMinute || 100
        },
        features: {
          timeTracking: features?.timeTracking || true,
          fileSharing: features?.fileSharing || true,
          teamChat: features?.teamChat || false,
          kanbanBoard: features?.kanbanBoard || true,
          analytics: features?.analytics || true
        },
        updatedAt: new Date().toISOString(),
        updatedBy: req.user?.userId
      };

      this.ok(res, {
        message: 'Sistem ayarları başarıyla güncellendi',
        data: updatedSettings
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // GET /api/settings/general (Bu endpoint admin olmayanlara da açık)
  async getGeneralSettings(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Load from system settings table
      const settings = {
        application: {
          name: 'CollabTask',
          version: '2.0.0',
          description: 'Modern proje yönetimi platformu',
          logo: '/assets/logo.png',
          favicon: '/assets/favicon.ico',
          theme: {
            primaryColor: '#3B82F6',
            secondaryColor: '#10B981',
            darkMode: true
          }
        },
        features: {
          timeTracking: true,
          fileSharing: true,
          teamChat: false,
          kanbanBoard: true,
          analytics: true,
          mobileApp: true,
          integrations: ['slack', 'github', 'google-drive']
        },
        limits: {
          maxProjectMembers: 50,
          maxFileSize: '10 MB',
          maxStoragePerUser: '1 GB',
          maxTasksPerProject: 500
        },
        support: {
          email: 'support@collabtask.com',
          documentation: 'https://docs.collabtask.com',
          helpCenter: 'https://help.collabtask.com',
          status: 'https://status.collabtask.com'
        },
        legal: {
          privacyPolicy: '/privacy',
          termsOfService: '/terms',
          cookiePolicy: '/cookies',
          lastUpdated: '2024-07-01T00:00:00Z'
        }
      };

      this.ok(res, settings);
    } catch (error) {
      this.handleError(res, error);
    }
  }
} 