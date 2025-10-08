import { Project, CreateProjectData, UpdateProjectData, ProjectFilters, ProjectStats } from './project.entity';

export interface ProjectRepository {
  // Temel CRUD işlemleri
  create(data: CreateProjectData, ownerId: string): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findAll(filters?: ProjectFilters, page?: number, limit?: number): Promise<{
    data: Project[];
    total: number;
  }>;
  update(id: string, data: UpdateProjectData): Promise<Project>;
  delete(id: string): Promise<void>;

  // Proje üyeleri yönetimi
  addMember(projectId: string, userId: string): Promise<void>;
  removeMember(projectId: string, userId: string): Promise<void>;
  getMembers(projectId: string): Promise<string[]>;

  // Proje takımları yönetimi
  addTeam(projectId: string, teamId: string): Promise<void>;
  removeTeam(projectId: string, teamId: string): Promise<void>;
  getTeams(projectId: string): Promise<string[]>;

  // Proje istatistikleri
  getStats(projectId: string): Promise<ProjectStats>;

  // Kullanıcıya göre projeler
  findByOwnerId(ownerId: string): Promise<Project[]>;
  findByMemberId(memberId: string): Promise<Project[]>;
  findByTeamId(teamId: string): Promise<Project[]>;

  // Proje durumu güncelleme
  updateStatus(id: string, status: 'active' | 'paused' | 'completed' | 'archived'): Promise<Project>;
  updateProgress(id: string, progress: number): Promise<Project>;
} 