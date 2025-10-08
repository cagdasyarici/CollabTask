import { GetProjectsQuery } from './get-projects.query';
import { ProjectRepository } from '../../domain/project.repository';
import { Project } from '../../domain/project.entity';

export class GetProjectsHandler {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async handle(query: GetProjectsQuery): Promise<{
    data: Project[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const result = await this.projectRepository.findAll(query.filters, page, limit);
    
    return {
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      }
    };
  }
} 