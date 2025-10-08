// Prisma Client wrapper'ı
import { PrismaClient } from '@prisma/client';

export class PrismaService extends PrismaClient {
    constructor() {
        super({
            log: ['query', 'info', 'warn', 'error'],
        });
    }

    async connect(): Promise<void> {
        await this.$connect();
        console.log('🚀 PostgreSQL veritabanına bağlantı başarılı');
    }

    async disconnect(): Promise<void> {
        await this.$disconnect();
        console.log('🔌 PostgreSQL bağlantısı kapatıldı');
    }

    async isConnected(): Promise<boolean> {
        try {
            await this.$queryRaw`SELECT 1`;
            return true;
        } catch {
            return false;
        }
    }
}

// Singleton instance
export const prisma = new PrismaService(); 