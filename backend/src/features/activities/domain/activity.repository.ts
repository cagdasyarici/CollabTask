export interface Activity {
    id: string;
    type: string;
    description: string;
    userId: string;
    projectId?: string | null;
    taskId?: string | null;
    metadata?: any;
    createdAt: Date;
}

export interface ActivityRepository {
    findById(id: string): Promise<Activity | null>;
    delete(id: string): Promise<void>;
    create(data: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity>;
    findAll(filters?: { type?: string; userId?: string; projectId?: string }): Promise<Activity[]>;
    findByUserId(userId: string, filters?: { type?: string }): Promise<Activity[]>;
    findByProjectId(projectId: string, filters?: { type?: string }): Promise<Activity[]>;
}



