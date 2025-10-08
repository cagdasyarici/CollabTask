import { UpdateProjectCommand } from './update-project.command';
import { ProjectRepository } from '../../domain/project.repository';
import { Project } from '../../domain/project.entity';

export class UpdateProjectHandler {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async handle(command: UpdateProjectCommand): Promise<Project> {
    const updateData = {
      ...(command.name && { name: command.name }),
      ...(command.description && { description: command.description }),
      ...(command.color && { color: command.color }),
      ...(command.icon && { icon: command.icon }),
      ...(command.status && { status: command.status }),
      ...(command.visibility && { visibility: command.visibility }),
      ...(command.dueDate && { dueDate: command.dueDate }),
      ...(command.progress !== undefined && { progress: command.progress }),
      ...(command.priority && { priority: command.priority }),
      ...(command.template && { template: command.template }),
      ...(command.tags && { tags: command.tags }),
      ...(command.settings && { settings: command.settings })
    };

    return await this.projectRepository.update(command.id, updateData);
  }
} 