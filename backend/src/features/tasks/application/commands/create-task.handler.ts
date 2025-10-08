import { CreateTaskCommand } from './create-task.command';
import { TaskRepository } from '../../domain/task.repository';
import { Task } from '../../domain/task.entity';

export class CreateTaskHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

  async handle(command: CreateTaskCommand): Promise<Task> {
    const taskData = {
      title: command.title,
      description: command.description || '',
      priority: command.priority || 'medium',
      projectId: command.projectId,
      assigneeIds: command.assigneeIds || [],
      dueDate: command.dueDate,
      startDate: command.startDate,
      estimatedHours: command.estimatedHours,
      tags: command.tags || [],
      dependencies: command.dependencies || [],
      customFields: command.customFields,
      position: command.position || 0
    };

    return await this.taskRepository.create(taskData, command.reporterId);
  }
} 