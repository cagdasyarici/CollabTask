// Redis istemcisi konfigürasyonu
export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
}

export interface CacheService {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
}

// Placeholder - İleride gerçek Redis implementasyonu eklenecek
export class RedisManager implements CacheService {
    async get(key: string): Promise<string | null> {
        console.log(`Redis GET: ${key}`);
        return null;
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        console.log(`Redis SET: ${key} = ${value} (TTL: ${ttl || 'unlimited'})`);
    }

    async delete(key: string): Promise<void> {
        console.log(`Redis DELETE: ${key}`);
    }
} 