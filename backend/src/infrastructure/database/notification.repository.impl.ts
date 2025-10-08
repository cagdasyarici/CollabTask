import { Notification, NotificationRepository } from '../../features/notifications/domain/notification.repository';
import { PrismaService } from './prisma.client';

export class NotificationRepositoryImpl implements NotificationRepository {
    constructor(private readonly prisma: PrismaService = new PrismaService()) {}

    async findById(id: string): Promise<Notification | null> {
        const result = await this.prisma.notification.findUnique({
            where: { id }
        });
        return result as Notification | null;
    }

    async save(entity: Notification): Promise<Notification> {
        return await this.prisma.notification.create({
            data: {
                type: entity.type as any,
                title: entity.title,
                message: entity.message,
                userId: entity.userId,
                relatedId: entity.relatedId,
                relatedType: entity.relatedType,
                actionUrl: entity.actionUrl
            }
        }) as Notification;
    }

    async delete(id: string): Promise<void> {
        await this.prisma.notification.delete({
            where: { id }
        });
    }

    async findByUserId(userId: string, filters?: { read?: boolean; type?: string }): Promise<Notification[]> {
        const results = await this.prisma.notification.findMany({
            where: {
                userId,
                ...(filters?.read !== undefined && { read: filters.read }),
                ...(filters?.type && { type: filters.type as any })
            },
            orderBy: { createdAt: 'desc' }
        });
        return results as Notification[];
    }

    async markAsRead(id: string): Promise<void> {
        await this.prisma.notification.update({
            where: { id },
            data: { read: true }
        });
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true }
        });
    }

    async deleteByUserId(userId: string): Promise<void> {
        await this.prisma.notification.deleteMany({
            where: { userId }
        });
    }
}



