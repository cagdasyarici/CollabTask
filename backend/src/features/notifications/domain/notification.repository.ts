export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    userId: string;
    relatedId?: string | null;
    relatedType?: string | null;
    actionUrl?: string | null;
    createdAt: Date;
}

export interface NotificationRepository {
    findById(id: string): Promise<Notification | null>;
    save(entity: Notification): Promise<Notification>;
    delete(id: string): Promise<void>;
    findByUserId(userId: string, filters?: { read?: boolean; type?: string }): Promise<Notification[]>;
    markAsRead(id: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    deleteByUserId(userId: string): Promise<void>;
}



