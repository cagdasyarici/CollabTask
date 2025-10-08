import { PrismaService } from '../../../infrastructure/database/prisma.client';

export class SearchService {
    constructor(private readonly prisma: PrismaService = new PrismaService()) {}

    async globalSearch(query: string, limit: number = 10) {
        const searchTerm = query.toLowerCase();

        const [projects, tasks, users] = await Promise.all([
            this.searchProjects(searchTerm, limit),
            this.searchTasks(searchTerm, limit),
            this.searchUsers(searchTerm, limit)
        ]);

        return {
            query,
            totalResults: projects.length + tasks.length + users.length,
            results: {
                projects,
                tasks,
                users,
                files: []
            }
        };
    }

    async searchProjects(query: string, limit: number = 10) {
        const projects = await this.prisma.project.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            },
            include: {
                owner: true
            },
            take: limit
        });

        return projects.map(p => ({
            id: p.id,
            type: 'project',
            title: p.name,
            description: p.description,
            url: `/projects/${p.id}`,
            metadata: {
                status: p.status,
                progress: p.progress,
                owner: p.owner.name
            }
        }));
    }

    async searchTasks(query: string, limit: number = 10) {
        const tasks = await this.prisma.task.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            },
            include: {
                project: true,
                assignees: {
                    include: {
                        user: true
                    },
                    take: 1
                }
            },
            take: limit
        });

        return tasks.map(t => ({
            id: t.id,
            type: 'task',
            title: t.title,
            description: t.description,
            url: `/projects/${t.projectId}/tasks/${t.id}`,
            metadata: {
                status: t.status,
                priority: t.priority,
                assignee: t.assignees[0]?.user.name,
                project: t.project.name
            }
        }));
    }

    async searchUsers(query: string, limit: number = 10) {
        const users = await this.prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                    { position: { contains: query, mode: 'insensitive' } }
                ]
            },
            take: limit
        });

        return users.map(u => ({
            id: u.id,
            type: 'user',
            title: u.name,
            description: `${u.position || ''} - ${u.department || ''}`,
            url: `/users/${u.id}`,
            metadata: {
                role: u.role,
                department: u.department,
                position: u.position,
                email: u.email
            }
        }));
    }

    async searchSuggestions(query: string) {
        const suggestions = await Promise.all([
            this.prisma.project.findMany({
                where: {
                    name: { contains: query, mode: 'insensitive' }
                },
                select: { name: true },
                take: 3
            }),
            this.prisma.task.findMany({
                where: {
                    title: { contains: query, mode: 'insensitive' }
                },
                select: { title: true },
                take: 3
            }),
            this.prisma.user.findMany({
                where: {
                    name: { contains: query, mode: 'insensitive' }
                },
                select: { name: true },
                take: 3
            })
        ]);

        return {
            query,
            suggestions: [
                ...suggestions[0].map(p => p.name),
                ...suggestions[1].map(t => t.title),
                ...suggestions[2].map(u => u.name)
            ].slice(0, 10)
        };
    }
}



