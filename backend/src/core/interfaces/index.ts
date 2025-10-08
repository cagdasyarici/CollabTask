// Temel arayüzler
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Repository<T extends BaseEntity> {
    findById(id: string): Promise<T | null>;
    save(entity: T): Promise<T>;
    delete(id: string): Promise<void>;
}

export interface Command {
    readonly type: string;
}

export interface Query {
    readonly type: string;
}

export interface CommandHandler<TCommand extends Command, TResult = void> {
    handle(command: TCommand): Promise<TResult>;
}

export interface QueryHandler<TQuery extends Query, TResult> {
    handle(query: TQuery): Promise<TResult>;
}

// Base Controller sınıfı
export abstract class BaseController {
    protected logRequest(method: string, endpoint: string, userId?: string): void {
        const timestamp = new Date().toISOString();
        const user = userId ? `[User: ${userId}]` : '[Anonymous]';
        console.log(`${timestamp} ${method} ${endpoint} ${user}`);
    }

    protected logError(method: string, endpoint: string, error: any, userId?: string): void {
        const timestamp = new Date().toISOString();
        const user = userId ? `[User: ${userId}]` : '[Anonymous]';
        console.error(`${timestamp} ERROR ${method} ${endpoint} ${user}:`, error);
    }
} 