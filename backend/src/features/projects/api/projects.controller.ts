import { Request, Response } from 'express';
import { BaseController } from '../../../core/base/base.controller';
import { CreateProjectCommand } from '../application/commands/create-project.command';
import { CreateProjectHandler } from '../application/commands/create-project.handler';
import { UpdateProjectCommand } from '../application/commands/update-project.command';
import { UpdateProjectHandler } from '../application/commands/update-project.handler';
import { DeleteProjectCommand } from '../application/commands/delete-project.command';
import { DeleteProjectHandler } from '../application/commands/delete-project.handler';
import { GetProjectsQuery } from '../application/queries/get-projects.query';
import { GetProjectsHandler } from '../application/queries/get-projects.handler';
import { GetProjectByIdQuery } from '../application/queries/get-project-by-id.query';
import { GetProjectByIdHandler } from '../application/queries/get-project-by-id.handler';
import { ProjectRepository } from '../domain/project.repository';
import { ProjectFilters } from '../domain/project.entity';

export class ProjectsController extends BaseController {
  private createProjectHandler: CreateProjectHandler;
  private updateProjectHandler: UpdateProjectHandler;
  private deleteProjectHandler: DeleteProjectHandler;
  private getProjectsHandler: GetProjectsHandler;
  private getProjectByIdHandler: GetProjectByIdHandler;

  constructor(private readonly projectRepository: ProjectRepository) {
    super();
    this.createProjectHandler = new CreateProjectHandler(projectRepository);
    this.updateProjectHandler = new UpdateProjectHandler(projectRepository);
    this.deleteProjectHandler = new DeleteProjectHandler(projectRepository);
    this.getProjectsHandler = new GetProjectsHandler(projectRepository);
    this.getProjectByIdHandler = new GetProjectByIdHandler(projectRepository);
  }

  // GET /api/projects
  async getProjects(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page, 
        limit, 
        sort, 
        order,
        status,
        priority,
        owner,
        member,
        tag,
        dateFrom,
        dateTo,
        search 
      } = req.query;

      const filters: ProjectFilters = {
        ...(status && { status: status as any }),
        ...(priority && { priority: priority as any }),
        ...(owner && { owner: owner as string }),
        ...(member && { member: member as string }),
        ...(tag && { tag: tag as string }),
        ...(dateFrom && { dateFrom: dateFrom as string }),
        ...(dateTo && { dateTo: dateTo as string }),
        ...(search && { search: search as string }),
      };

      const query = new GetProjectsQuery(
        filters,
        page ? parseInt(page as string) : undefined,
        limit ? parseInt(limit as string) : undefined,
        sort as string,
        order as 'asc' | 'desc'
      );

      const result = await this.getProjectsHandler.handle(query);
      this.ok(res, result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // GET /api/projects/:id
  async getProjectById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const query = new GetProjectByIdQuery(id);
      const project = await this.getProjectByIdHandler.handle(query);

      if (!project) {
        return this.notFound(res, 'Proje bulunamadı');
      }

      this.ok(res, project);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // POST /api/projects
  async createProject(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return this.unauthorized(res);
      }

      const {
        name,
        description,
        color,
        icon,
        visibility,
        dueDate,
        priority,
        template,
        tags,
        teamIds,
        memberIds,
        settings
      } = req.body;

      const command = new CreateProjectCommand(
        name,
        description,
        userId,
        color,
        icon,
        visibility,
        dueDate,
        priority,
        template,
        tags,
        teamIds,
        memberIds,
        settings
      );

      const project = await this.createProjectHandler.handle(command);
      this.created(res, project);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // PUT /api/projects/:id
  async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        color,
        icon,
        status,
        visibility,
        dueDate,
        progress,
        priority,
        template,
        tags,
        settings
      } = req.body;

      const command = new UpdateProjectCommand(
        id,
        name,
        description,
        color,
        icon,
        status,
        visibility,
        dueDate,
        progress,
        priority,
        template,
        tags,
        settings
      );

      const project = await this.updateProjectHandler.handle(command);
      this.ok(res, project);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // DELETE /api/projects/:id
  async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const command = new DeleteProjectCommand(id);
      await this.deleteProjectHandler.handle(command);
      this.noContent(res);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // POST /api/projects/:id/members
  async addMember(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      await this.projectRepository.addMember(id, userId);
      this.ok(res, { message: 'Üye başarıyla eklendi' });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // DELETE /api/projects/:id/members/:userId
  async removeMember(req: Request, res: Response): Promise<void> {
    try {
      const { id, userId } = req.params;

      await this.projectRepository.removeMember(id, userId);
      this.ok(res, { message: 'Üye başarıyla çıkarıldı' });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // PUT /api/projects/:id/status
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const project = await this.projectRepository.updateStatus(id, status);
      this.ok(res, project);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // GET /api/projects/:id/stats
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const stats = await this.projectRepository.getStats(id);
      this.ok(res, stats);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // GET /api/projects/:id/activities
  async getProjectActivities(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Mock activities data - production'da activity repository'den gelecek
      const activities = [
        {
          id: '1',
          type: 'project_created',
          userId: '1',
          projectId: id,
          description: 'Proje oluşturuldu',
          createdAt: '2024-07-01T09:00:00Z',
          metadata: { projectName: 'Test Projesi' }
        },
        {
          id: '2',
          type: 'member_added',
          userId: '1',
          projectId: id,
          description: 'Projeye yeni üye eklendi',
          createdAt: '2024-07-02T10:30:00Z',
          metadata: { memberName: 'Ahmet Yılmaz' }
        },
        {
          id: '3',
          type: 'task_created',
          userId: '2',
          projectId: id,
          taskId: '1',
          description: 'Yeni görev oluşturuldu',
          createdAt: '2024-07-03T14:15:00Z',
          metadata: { taskTitle: 'Dashboard UI tasarımı' }
        }
      ];

      this.ok(res, activities);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // GET /api/projects/templates
  async getProjectTemplates(req: Request, res: Response): Promise<void> {
    try {
      // Mock project templates
      const templates = [
        {
          id: 'software_development',
          name: 'Yazılım Geliştirme',
          description: 'Web ve mobil uygulama projeleri için',
          icon: '💻',
          color: '#3B82F6',
          defaultTasks: [
            'Proje kurulumu',
            'UI/UX tasarımı',
            'Frontend geliştirme',
            'Backend geliştirme',
            'Test yazımı',
            'Deployment'
          ],
          estimatedDuration: '12 hafta',
          teamSize: '4-6 kişi',
          tags: ['development', 'web', 'mobile']
        },
        {
          id: 'marketing_campaign',
          name: 'Pazarlama Kampanyası',
          description: 'Dijital pazarlama projeleri için',
          icon: '📈',
          color: '#10B981',
          defaultTasks: [
            'Pazar araştırması',
            'Hedef kitle analizi',
            'Kampanya stratejisi',
            'İçerik oluşturma',
            'Sosyal medya planı',
            'Performans analizi'
          ],
          estimatedDuration: '8 hafta',
          teamSize: '3-5 kişi',
          tags: ['marketing', 'campaign', 'digital']
        },
        {
          id: 'product_launch',
          name: 'Ürün Lansmanı',
          description: 'Yeni ürün lansmanı projeleri için',
          icon: '🚀',
          color: '#8B5CF6',
          defaultTasks: [
            'Ürün stratejisi',
            'Go-to-market planı',
            'PR stratejisi',
            'Lansman etkinliği',
            'Medya koordinasyonu',
            'Satış eğitimleri'
          ],
          estimatedDuration: '16 hafta',
          teamSize: '6-10 kişi',
          tags: ['product', 'launch', 'strategy']
        },
        {
          id: 'research_development',
          name: 'Araştırma & Geliştirme',
          description: 'AR-GE projeleri için',
          icon: '🔬',
          color: '#F59E0B',
          defaultTasks: [
            'Literatür taraması',
            'Hipotez oluşturma',
            'Deney tasarımı',
            'Veri toplama',
            'Analiz ve raporlama',
            'Patent başvurusu'
          ],
          estimatedDuration: '24 hafta',
          teamSize: '3-4 kişi',
          tags: ['research', 'development', 'innovation']
        },
        {
          id: 'event_management',
          name: 'Etkinlik Yönetimi',
          description: 'Konferans, seminer ve etkinlik projeleri için',
          icon: '🎪',
          color: '#EF4444',
          defaultTasks: [
            'Etkinlik planlaması',
            'Mekan rezervasyonu',
            'Konuşmacı koordinasyonu',
            'Sponsor bulma',
            'Pazarlama ve tanıtım',
            'Etkinlik günü koordinasyonu'
          ],
          estimatedDuration: '10 hafta',
          teamSize: '4-8 kişi',
          tags: ['event', 'management', 'coordination']
        }
      ];

      this.ok(res, templates);
    } catch (error) {
      this.handleError(res, error);
    }
  }
} 