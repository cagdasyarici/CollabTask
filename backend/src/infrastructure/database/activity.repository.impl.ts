import { Activity, ActivityRepository } from '../../features/activities/domain/activity.repository';
import { PrismaService } from './prisma.client';

export class ActivityRepositoryImpl implements ActivityRepository {
    constructor(private readonly prisma: PrismaService = new PrismaService()) {}

    async findById(id: string): Promise<Activity | null> {
        const result = await this.prisma.activity.findUnique({
            where: { id }
        });
        return result as Activity | null;
    }

    async delete(id: string): Promise<void> {
        await this.prisma.activity.delete({
            where: { id }
        });
    }

    async save(entity: Activity): Promise<Activity> {
        return await this.create({
            type: entity.type,
            description: entity.description,
            userId: entity.userId,
            projectId: entity.projectId,
            taskId: entity.taskId,
            metadata: entity.metadata
        });
    }

    async create(data: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
        const result = await this.prisma.activity.create({
            data: {
                type: data.type as any,
                description: data.description,
                userId: data.userId,
                projectId: data.projectId || null,
                taskId: data.taskId || null,
                metadata: data.metadata
            }
        });
        return result as Activity;
    }

    async findAll(filters?: { type?: string; userId?: string; projectId?: string }): Promise<Activity[]> {
        const results = await this.prisma.activity.findMany({
            where: {
                ...(filters?.type && { type: filters.type as any }),
                ...(filters?.userId && { userId: filters.userId }),
                ...(filters?.projectId && { projectId: filters.projectId })
            },
            include: {
                user: true,
                project: true,
                task: true
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        return results as Activity[];
    }

    async findByUserId(userId: string, filters?: { type?: string }): Promise<Activity[]> {
        const results = await this.prisma.activity.findMany({
            where: {
                userId,
                ...(filters?.type && { type: filters.type as any })
            },
            include: {
                user: true,
                project: true,
                task: true
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        return results as Activity[];
    }

    async findByProjectId(projectId: string, filters?: { type?: string }): Promise<Activity[]> {
        return await this.prisma.activity.findMany({
            where: {
                projectId,
                ...(filters?.type && { type: filters.type as any })
            },
            include: {
                user: true,
                project: true,
                task: true
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    }
}



