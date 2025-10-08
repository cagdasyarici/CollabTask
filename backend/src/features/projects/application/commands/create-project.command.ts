export class CreateProjectCommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly ownerId: string,
    public readonly color?: string,
    public readonly icon?: string,
    public readonly visibility?: 'public' | 'private' | 'team',
    public readonly dueDate?: string,
    public readonly priority?: 'low' | 'medium' | 'high' | 'urgent',
    public readonly template?: string,
    public readonly tags?: string[],
    public readonly teamIds?: string[],
    public readonly memberIds?: string[],
    public readonly settings?: {
      allowComments?: boolean;
      allowAttachments?: boolean;
      requireApproval?: boolean;
      timeTracking?: boolean;
    }
  ) {}
} 