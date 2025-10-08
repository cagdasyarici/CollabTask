import { ProjectFilters } from '../../domain/project.entity';

export class GetProjectsQuery {
  constructor(
    public readonly filters?: ProjectFilters,
    public readonly page?: number,
    public readonly limit?: number,
    public readonly sort?: string,
    public readonly order?: 'asc' | 'desc'
  ) {}
} 