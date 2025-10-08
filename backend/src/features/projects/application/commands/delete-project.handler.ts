import { DeleteProjectCommand } from './delete-project.command';
import { ProjectRepository } from '../../domain/project.repository';

export class DeleteProjectHandler {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async handle(command: DeleteProjectCommand): Promise<void> {
    await this.projectRepository.delete(command.id);
  }
} 