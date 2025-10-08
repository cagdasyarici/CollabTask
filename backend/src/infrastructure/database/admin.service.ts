import { PrismaService } from './prisma.client';

export class AdminService {
    constructor(private readonly prisma: PrismaService = new PrismaService()) {}

    async getSystemStatistics() {
        const [
            totalUsers,
            activeUsers,
            totalProjects,
            activeProjects,
            totalTasks,
            completedTasks,
            totalFiles
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { status: 'ACTIVE' } }),
            this.prisma.project.count(),
            this.prisma.project.count({ where: { status: 'ACTIVE' } }),
            this.prisma.task.count(),
            this.prisma.task.count({ where: { status: 'DONE' } }),
            this.prisma.attachment.count()
        ]);

        // Get user growth (last 7 days)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newUsersThisWeek = await this.prisma.user.count({
            where: { createdAt: { gte: weekAgo } }
        });

        // Get project growth
        const newProjectsThisWeek = await this.prisma.project.count({
            where: { createdAt: { gte: weekAgo } }
        });

        // Get tasks by status
        const [todoTasks, inProgressTasks, reviewTasks, backlogTasks] = await Promise.all([
            this.prisma.task.count({ where: { status: 'TODO' } }),
            this.prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
            this.prisma.task.count({ where: { status: 'REVIEW' } }),
            this.prisma.task.count({ where: { status: 'BACKLOG' } })
        ]);

        return {
            overview: {
                totalUsers,
                activeUsers,
                totalProjects,
                activeProjects,
                totalTasks,
                completedTasks,
                totalFiles,
                totalStorage: '0 GB' // Can be calculated from file sizes
            },
            growth: {
                newUsersThisWeek,
                newProjectsThisWeek,
                newTasksThisWeek: await this.prisma.task.count({
                    where: { createdAt: { gte: weekAgo } }
                })
            },
            tasks: {
                total: totalTasks,
                completed: completedTasks,
                inProgress: inProgressTasks,
                todo: todoTasks,
                review: reviewTasks,
                backlog: backlogTasks
            },
            users: {
                total: totalUsers,
                active: activeUsers,
                byRole: await this.getUsersByRole()
            },
            projects: {
                total: totalProjects,
                active: activeProjects,
                byStatus: await this.getProjectsByStatus()
            }
        };
    }

    private async getUsersByRole() {
        const [admins, managers, members] = await Promise.all([
            this.prisma.user.count({ where: { role: 'ADMIN' } }),
            this.prisma.user.count({ where: { role: 'MANAGER' } }),
            this.prisma.user.count({ where: { role: 'MEMBER' } })
        ]);

        return { admins, managers, members };
    }

    private async getProjectsByStatus() {
        const [active, paused, completed, archived] = await Promise.all([
            this.prisma.project.count({ where: { status: 'ACTIVE' } }),
            this.prisma.project.count({ where: { status: 'PAUSED' } }),
            this.prisma.project.count({ where: { status: 'COMPLETED' } }),
            this.prisma.project.count({ where: { status: 'ARCHIVED' } })
        ]);

        return { active, paused, completed, archived };
    }
}

