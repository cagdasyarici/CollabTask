export class CreateTaskCommand {
  constructor(
    public readonly title: string,
    public readonly projectId: string,
    public readonly reporterId: string,
    public readonly description?: string,
    public readonly priority?: 'low' | 'medium' | 'high' | 'urgent',
    public readonly assigneeIds?: string[],
    public readonly dueDate?: string,
    public readonly startDate?: string,
    public readonly estimatedHours?: number,
    public readonly tags?: string[],
    public readonly dependencies?: string[],
    public readonly customFields?: Record<string, any>,
    public readonly position?: number
  ) {}
} 