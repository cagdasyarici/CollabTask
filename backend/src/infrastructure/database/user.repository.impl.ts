// Kullanıcı repository Prisma implementasyonu
import { UserRepository } from '../../features/users/domain/user.repository';
import { User, UserEntity, UserRole, UserStatus } from '../../features/users/domain/user.entity';
import { PrismaService } from './prisma.client';

export class UserRepositoryImpl implements UserRepository {
    constructor(private readonly prisma: PrismaService = new PrismaService()) {}

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id }
        });

        return user ? this.toDomainEntity(user) : null;
    }

    async save(entity: User, hashedPassword?: string): Promise<UserEntity> {
        const userData = {
            email: entity.email,
            name: `${entity.firstName} ${entity.lastName}`,
            passwordHash: hashedPassword || 'temp-hash',
            avatar: entity.avatar,
            role: entity.role,
            status: entity.status,
            position: entity.position,
            department: entity.department,
            timezone: entity.timezone || 'Europe/Istanbul',
            lastActive: entity.lastActive,
        };

        let savedUser;
        
        if (entity.id && entity.id !== 'temp-id') {
            // Güncelleme
            savedUser = await this.prisma.user.update({
                where: { id: entity.id },
                data: userData
            });
        } else {
            // Yeni kayıt - id'yi Prisma'nın oluşturmasına izin ver
            const { ...createData } = userData;
            savedUser = await this.prisma.user.create({
                data: createData
            });
        }

        return this.toDomainEntity(savedUser) as UserEntity;
    }

    async delete(id: string): Promise<void> {
        await this.prisma.user.delete({
            where: { id }
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email }
        });

        return user ? this.toDomainEntity(user) : null;
    }

    async findActiveUsers(): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            where: { 
                status: 'ACTIVE' 
            }
        });
        return users.map((user: any) => this.toDomainEntity(user));
    }

    async findByFullName(firstName: string, lastName: string): Promise<User[]> {
        const fullName = `${firstName} ${lastName}`;
        const users = await this.prisma.user.findMany({
            where: {
                name: {
                    contains: fullName,
                    mode: 'insensitive'
                }
            }
        });

        return users.map((user: any) => this.toDomainEntity(user));
    }

    async existsByEmail(email: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: { id: true }
        });

        return !!user;
    }

    async findByEmailWithPassword(email: string): Promise<{ user: User; passwordHash: string } | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                passwordHash: true,
                avatar: true,
                role: true,
                status: true,
                position: true,
                department: true,
                timezone: true,
                lastActive: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) return null;

        return {
            user: this.toDomainEntity(user),
            passwordHash: user.passwordHash
        };
    }

    async updateLastActive(id: string): Promise<void> {
        await this.prisma.user.update({
            where: { id },
            data: { lastActive: new Date() }
        });
    }

    async getUserStatistics(userId: string): Promise<any> {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        // Get all projects where user is owner or member
        const ownedProjects = await this.prisma.project.count({
            where: { ownerId: userId }
        });

        const memberProjects = await this.prisma.projectMember.count({
            where: { userId }
        });

        const totalProjects = ownedProjects + memberProjects;

        const activeProjects = await this.prisma.project.count({
            where: {
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId } } }
                ],
                status: 'ACTIVE'
            }
        });

        const completedProjects = await this.prisma.project.count({
            where: {
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId } } }
                ],
                status: 'COMPLETED'
            }
        });

        // Get tasks statistics
        const allTasks = await this.prisma.task.count({
            where: {
                assignees: { some: { userId } }
            }
        });

        const completedTasks = await this.prisma.task.count({
            where: {
                assignees: { some: { userId } },
                status: 'DONE'
            }
        });

        const tasksThisWeek = await this.prisma.task.count({
            where: {
                assignees: { some: { userId } },
                status: 'DONE',
                completedAt: { gte: weekAgo }
            }
        });

        const tasksLastWeek = await this.prisma.task.count({
            where: {
                assignees: { some: { userId } },
                status: 'DONE',
                completedAt: { gte: twoWeeksAgo, lt: weekAgo }
            }
        });

        const projectsThisMonth = await this.prisma.project.count({
            where: {
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId } } }
                ],
                createdAt: { gte: monthAgo }
            }
        });

        const projectsLastMonth = await this.prisma.project.count({
            where: {
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId } } }
                ],
                createdAt: { gte: twoMonthsAgo, lt: monthAgo }
            }
        });

        // Get time entries
        const timeEntriesThisWeek = await this.prisma.timeEntry.aggregate({
            where: {
                userId,
                createdAt: { gte: weekAgo }
            },
            _sum: { duration: true }
        });

        const weeklyHours = Math.round((timeEntriesThisWeek._sum.duration || 0) / 60 * 10) / 10;

        // Calculate completion rate
        const completionRate = allTasks > 0 ? Math.round((completedTasks / allTasks) * 100) : 0;

        return {
            totalTasks: allTasks,
            completedTasks,
            activeProjects,
            weeklyHours,
            completionRate,
            tasksThisWeek,
            tasksLastWeek,
            projectsThisMonth,
            projectsLastMonth
        };
    }

    private toDomainEntity(prismaUser: any): User {
        // name alanını firstName ve lastName'e böl
        const nameParts = prismaUser.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        return new UserEntity(
            prismaUser.id,
            prismaUser.email,
            firstName,
            lastName,
            prismaUser.role as UserRole,
            prismaUser.status as UserStatus,
            prismaUser.avatar,
            prismaUser.position,
            prismaUser.department,
            prismaUser.timezone,
            prismaUser.createdAt,
            prismaUser.updatedAt,
            prismaUser.lastActive
        );
    }
} 