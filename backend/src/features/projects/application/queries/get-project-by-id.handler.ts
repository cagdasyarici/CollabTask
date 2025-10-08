import { GetProjectByIdQuery } from './get-project-by-id.query';
import { ProjectRepository } from '../../domain/project.repository';
import { Project } from '../../domain/project.entity';

export class GetProjectByIdHandler {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async handle(query: GetProjectByIdQuery): Promise<Project | null> {
    return await this.projectRepository.findById(query.id);
  }
} 