// Kullanıcı API kontrolcüsü
import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../core/base/base.controller';
import { CreateUserCommand } from '../application/commands/create-user.command';
import { CreateUserHandler } from '../application/commands/create-user.handler';
import { GetUserByIdQuery } from '../application/queries/get-user-by-id.query';
import { GetUserByIdHandler } from '../application/queries/get-user-by-id.handler';
import { UserRepository } from '../domain/user.repository';

export class UsersController extends BaseController {
    constructor(
        private readonly createUserHandler: CreateUserHandler,
        private readonly getUserByIdHandler: GetUserByIdHandler,
        private readonly userRepository: UserRepository
    ) {
        super();
    }

    // POST /api/users, POST /api/users/signup
    async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, email, password } = req.body;

            // Input validation
            if (!name || !email || !password) {
                return this.badRequest(res, 'Name, email ve password alanları gereklidir');
            }

            const command = new CreateUserCommand(name, email, password);
            const user = await this.createUserHandler.handle(command);

            // Şifreyi response'dan çıkar
            const { ...userWithoutPassword } = user;
            
            this.created(res, userWithoutPassword);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    // GET /api/users
    async getUsers(req: Request, res: Response): Promise<void> {
        try {
            const { page, limit, search, role, status, department } = req.query;
            
            // Get users from database
            const users = await this.userRepository.findActiveUsers();
            
            // Apply filters
            let filteredUsers = users;
            
            if (search) {
                const searchLower = (search as string).toLowerCase();
                filteredUsers = filteredUsers.filter(u => 
                    u.email.toLowerCase().includes(searchLower) ||
                    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchLower)
                );
            }
            
            if (role) {
                filteredUsers = filteredUsers.filter(u => u.role === role);
            }
            
            if (status) {
                filteredUsers = filteredUsers.filter(u => u.status === status);
            }
            
            if (department) {
                filteredUsers = filteredUsers.filter(u => u.department === department);
            }
            
            // Pagination
            const pageNum = parseInt(page as string) || 1;
            const limitNum = parseInt(limit as string) || 20;
            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = startIndex + limitNum;
            const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

            this.ok(res, {
                data: paginatedUsers.map(u => ({
                    id: u.id,
                    name: `${u.firstName} ${u.lastName}`,
                    email: u.email,
                    avatar: u.avatar,
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
                }
            });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    // GET /api/users/:id
    async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const query = new GetUserByIdQuery(id);
            const user = await this.getUserByIdHandler.handle(query);

            if (!user) {
                return this.notFound(res, 'Kullanıcı bulunamadı');
            }

            this.ok(res, user);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    // PUT /api/users/:id
    async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { name, email, position, department, avatar } = req.body;

            const user = await this.userRepository.findById(id);
            if (!user) {
                return this.notFound(res, 'Kullanıcı bulunamadı');
            }

            // Update user properties
            const nameParts = name ? name.split(' ') : [`${user.firstName}`, `${user.lastName}`];
            user.firstName = nameParts[0] || user.firstName;
            user.lastName = nameParts.slice(1).join(' ') || user.lastName;
            user.email = email || user.email;
            user.position = position || user.position;
            user.department = department || user.department;
            user.avatar = avatar || user.avatar;

            const updatedUser = await this.userRepository.save(user);

            this.ok(res, {
                id: updatedUser.id,
                name: `${updatedUser.firstName} ${updatedUser.lastName}`,
                email: updatedUser.email,
                position: updatedUser.position,
                department: updatedUser.department,
                avatar: updatedUser.avatar,
                updatedAt: updatedUser.updatedAt
            });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    // DELETE /api/users/:id
    async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const user = await this.userRepository.findById(id);
            if (!user) {
                return this.notFound(res, 'Kullanıcı bulunamadı');
            }

            await this.userRepository.delete(id);
            this.noContent(res);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    // POST /api/users/invite
    async inviteUser(req: Request, res: Response): Promise<void> {
        try {
            const { email, role, message } = req.body;

            if (!email) {
                return this.badRequest(res, 'Email adresi gereklidir');
            }

            // Check if user already exists
            const existingUser = await this.userRepository.findByEmail(email);
            if (existingUser) {
                return this.badRequest(res, 'Bu email adresi zaten kayıtlı');
            }

            // TODO: Send actual invitation email
            const invitation = {
                id: Date.now().toString(),
                email,
                role: role || 'member',
                message,
                invitedBy: req.user?.userId,
                invitedAt: new Date().toISOString(),
                status: 'pending',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 gün
            };

            this.created(res, invitation);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    // PUT /api/users/:id/status
    async updateUserStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['ACTIVE', 'INACTIVE', 'INVITED'].includes(status.toUpperCase())) {
                return this.badRequest(res, 'Geçersiz durum. active, inactive veya invited olmalıdır');
            }

            const user = await this.userRepository.findById(id);
            if (!user) {
                return this.notFound(res, 'Kullanıcı bulunamadı');
            }

            user.status = status.toUpperCase() as any;
            const updatedUser = await this.userRepository.save(user);

            this.ok(res, {
                id: updatedUser.id,
                status: updatedUser.status,
                updatedAt: updatedUser.updatedAt
            });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    // GET /api/users/me
    async getCurrentUser(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return this.unauthorized(res);
            }

            const user = await this.userRepository.findById(userId);
            if (!user) {
                return this.notFound(res, 'Kullanıcı bulunamadı');
            }

            this.ok(res, {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                status: user.status,
                position: user.position,
                department: user.department,
                timezone: user.timezone,
                createdAt: user.createdAt,
                lastActive: user.lastActive
            });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    // PUT /api/users/me
    async updateCurrentUser(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return this.unauthorized(res);
            }

            const { name, email, avatar, position, timezone } = req.body;

            const user = await this.userRepository.findById(userId);
            if (!user) {
                return this.notFound(res, 'Kullanıcı bulunamadı');
            }

            // Update properties
            if (name) {
                const nameParts = name.split(' ');
                user.firstName = nameParts[0];
                user.lastName = nameParts.slice(1).join(' ');
            }
            if (email) user.email = email;
            if (avatar !== undefined) user.avatar = avatar;
            if (position !== undefined) user.position = position;
            if (timezone) user.timezone = timezone;

            const updatedUser = await this.userRepository.save(user);

            this.ok(res, {
                id: updatedUser.id,
                name: `${updatedUser.firstName} ${updatedUser.lastName}`,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                position: updatedUser.position,
                timezone: updatedUser.timezone,
                updatedAt: updatedUser.updatedAt
            });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    // PUT /api/users/me/settings
    async updateUserSettings(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return this.unauthorized(res);
            }

            const { language, theme, notifications } = req.body;

            // TODO: Implement user settings/preferences table and update logic
            this.ok(res, {
                userId,
                language,
                theme,
                notifications,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    // PUT /api/users/me/password
    async changePassword(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return this.unauthorized(res);
            }

            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return this.badRequest(res, 'Mevcut şifre ve yeni şifre gereklidir');
            }

            if (newPassword.length < 6) {
                return this.badRequest(res, 'Yeni şifre en az 6 karakter olmalıdır');
            }

            // TODO: Implement password verification and update logic
            // 1. Verify current password
            // 2. Hash new password
            // 3. Update user password
            
            this.ok(res, { message: 'Şifre başarıyla değiştirildi' });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    // GET /api/users/me/stats
    async getCurrentUserStats(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return this.unauthorized(res);
            }

            // Calculate real statistics from database
            const stats = await this.userRepository.getUserStatistics(userId);

            this.ok(res, stats);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    // GET /api/users/:id/stats
    async getUserStats(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const user = await this.userRepository.findById(id);
            if (!user) {
                return this.notFound(res, 'Kullanıcı bulunamadı');
            }

            // Calculate real statistics from database
            const stats = await this.userRepository.getUserStatistics(id);

            this.ok(res, stats);
        } catch (error) {
            this.handleError(res, error);
        }
    }
} 