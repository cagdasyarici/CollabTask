export class UpdateProjectCommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly color?: string,
    public readonly icon?: string,
    public readonly status?: 'active' | 'paused' | 'completed' | 'archived',
    public readonly visibility?: 'public' | 'private' | 'team',
    public readonly dueDate?: string,
    public readonly progress?: number,
    public readonly priority?: 'low' | 'medium' | 'high' | 'urgent',
    public readonly template?: string,
    public readonly tags?: string[],
    public readonly settings?: {
      allowComments?: boolean;
      allowAttachments?: boolean;
      requireApproval?: boolean;
      timeTracking?: boolean;
    }
  ) {}
} 