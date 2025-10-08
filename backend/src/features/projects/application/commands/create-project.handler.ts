import { CreateProjectCommand } from './create-project.command';
import { ProjectRepository } from '../../domain/project.repository';
import { Project } from '../../domain/project.entity';

export class CreateProjectHandler {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async handle(command: CreateProjectCommand): Promise<Project> {
    const projectData = {
      name: command.name,
      description: command.description,
      color: command.color || '#3B82F6',
      icon: command.icon || '📋',
      visibility: command.visibility || 'team',
      dueDate: command.dueDate,
      priority: command.priority || 'medium',
      template: command.template,
      tags: command.tags || [],
      teamIds: command.teamIds || [],
      memberIds: command.memberIds || [],
      settings: {
        allowComments: command.settings?.allowComments ?? true,
        allowAttachments: command.settings?.allowAttachments ?? true,
        requireApproval: command.settings?.requireApproval ?? false,
        timeTracking: command.settings?.timeTracking ?? false,
      }
    };

    return await this.projectRepository.create(projectData, command.ownerId);
  }
} 