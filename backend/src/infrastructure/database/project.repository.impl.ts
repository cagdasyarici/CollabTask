import { PrismaClient } from '@prisma/client';
import { ProjectRepository } from '../../features/projects/domain/project.repository';
import { Project, CreateProjectData, UpdateProjectData, ProjectFilters, ProjectStats } from '../../features/projects/domain/project.entity';
import { prisma } from './prisma.client';

export class ProjectRepositoryImpl implements ProjectRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async create(data: CreateProjectData, ownerId: string): Promise<Project> {
    const project = await this.prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color || '#3B82F6',
        icon: data.icon || '📋',
        visibility: data.visibility?.toUpperCase() as any || 'TEAM',
        priority: data.priority?.toUpperCase() as any || 'MEDIUM',
        template: data.template,
        tags: data.tags || [],
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        ownerId,
        settings: data.settings ? {
          create: {
            allowComments: data.settings.allowComments ?? true,
            allowAttachments: data.settings.allowAttachments ?? true,
            requireApproval: data.settings.requireApproval ?? false,
            timeTracking: data.settings.timeTracking ?? false,
          }
        } : undefined,
        members: data.memberIds ? {
          create: data.memberIds.map(userId => ({ userId }))
        } : undefined,
        teams: data.teamIds ? {
          create: data.teamIds.map(teamId => ({ teamId }))
        } : undefined,
      },
      include: {
        owner: true,
        settings: true,
        members: true,
        teams: true,
      }
    });

    return this.mapPrismaToEntity(project);
  }

  async findById(id: string): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: true,
        settings: true,
        members: true,
        teams: true,
      }
    });

    return project ? this.mapPrismaToEntity(project) : null;
  }

  async findAll(filters?: ProjectFilters, page: number = 1, limit: number = 20): Promise<{
    data: Project[];
    total: number;
  }> {
    const where: any = {};

    if (filters) {
      if (filters.status) {
        where.status = filters.status.toUpperCase();
      }
      if (filters.priority) {
        where.priority = filters.priority.toUpperCase();
      }
      if (filters.owner) {
        where.ownerId = filters.owner;
      }
      if (filters.member) {
        where.members = {
          some: {
            userId: filters.member
          }
        };
      }
      if (filters.tag) {
        where.tags = {
          has: filters.tag
        };
      }
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) {
          where.createdAt.gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          where.createdAt.lte = new Date(filters.dateTo);
        }
      }
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          owner: true,
          settings: true,
          members: true,
          teams: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.project.count({ where })
    ]);

    return {
      data: projects.map(p => this.mapPrismaToEntity(p)),
      total
    };
  }

  async update(id: string, data: UpdateProjectData): Promise<Project> {
    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.color) updateData.color = data.color;
    if (data.icon) updateData.icon = data.icon;
    if (data.status) updateData.status = data.status.toUpperCase();
    if (data.visibility) updateData.visibility = data.visibility.toUpperCase();
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.progress !== undefined) updateData.progress = data.progress;
    if (data.priority) updateData.priority = data.priority.toUpperCase();
    if (data.template) updateData.template = data.template;
    if (data.tags) updateData.tags = data.tags;

    if (data.settings) {
      updateData.settings = {
        upsert: {
          create: data.settings,
          update: data.settings
        }
      };
    }

    const project = await this.prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        owner: true,
        settings: true,
        members: true,
        teams: true,
      }
    });

    return this.mapPrismaToEntity(project);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({
      where: { id }
    });
  }

  async addMember(projectId: string, userId: string): Promise<void> {
    await this.prisma.projectMember.create({
      data: {
        projectId,
        userId
      }
    });
  }

  async removeMember(projectId: string, userId: string): Promise<void> {
    await this.prisma.projectMember.deleteMany({
      where: {
        projectId,
        userId
      }
    });
  }

  async getMembers(projectId: string): Promise<string[]> {
    const members = await this.prisma.projectMember.findMany({
      where: { projectId },
      select: { userId: true }
    });
    return members.map(m => m.userId);
  }

  async addTeam(projectId: string, teamId: string): Promise<void> {
    await this.prisma.projectTeam.create({
      data: {
        projectId,
        teamId
      }
    });
  }

  async removeTeam(projectId: string, teamId: string): Promise<void> {
    await this.prisma.projectTeam.deleteMany({
      where: {
        projectId,
        teamId
      }
    });
  }

  async getTeams(projectId: string): Promise<string[]> {
    const teams = await this.prisma.projectTeam.findMany({
      where: { projectId },
      select: { teamId: true }
    });
    return teams.map(t => t.teamId);
  }

  async getStats(projectId: string): Promise<ProjectStats> {
    const [totalTasks, completedTasks, pendingTasks, overdueTasks, totalMembers, timeStats] = await Promise.all([
      this.prisma.task.count({ where: { projectId } }),
      this.prisma.task.count({ where: { projectId, status: 'DONE' } }),
      this.prisma.task.count({ where: { projectId, status: { in: ['TODO', 'IN_PROGRESS', 'REVIEW'] } } }),
      this.prisma.task.count({ 
        where: { 
          projectId, 
          dueDate: { lt: new Date() },
          status: { not: 'DONE' }
        } 
      }),
      this.prisma.projectMember.count({ where: { projectId } }),
      this.prisma.task.aggregate({
        where: { projectId },
        _sum: {
          estimatedHours: true,
          actualHours: true
        }
      })
    ]);

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalMembers,
      totalHours: timeStats._sum.actualHours || 0,
      remainingHours: Math.max(0, (timeStats._sum.estimatedHours || 0) - (timeStats._sum.actualHours || 0))
    };
  }

  async findByOwnerId(ownerId: string): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { ownerId },
      include: {
        owner: true,
        settings: true,
        members: true,
        teams: true,
      }
    });
    return projects.map(p => this.mapPrismaToEntity(p));
  }

  async findByMemberId(memberId: string): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: memberId
          }
        }
      },
      include: {
        owner: true,
        settings: true,
        members: true,
        teams: true,
      }
    });
    return projects.map(p => this.mapPrismaToEntity(p));
  }

  async findByTeamId(teamId: string): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        teams: {
          some: {
            teamId
          }
        }
      },
      include: {
        owner: true,
        settings: true,
        members: true,
        teams: true,
      }
    });
    return projects.map(p => this.mapPrismaToEntity(p));
  }

  async updateStatus(id: string, status: 'active' | 'paused' | 'completed' | 'archived'): Promise<Project> {
    const project = await this.prisma.project.update({
      where: { id },
      data: { status: status.toUpperCase() as any },
      include: {
        owner: true,
        settings: true,
        members: true,
        teams: true,
      }
    });
    return this.mapPrismaToEntity(project);
  }

  async updateProgress(id: string, progress: number): Promise<Project> {
    const project = await this.prisma.project.update({
      where: { id },
      data: { progress },
      include: {
        owner: true,
        settings: true,
        members: true,
        teams: true,
      }
    });
    return this.mapPrismaToEntity(project);
  }

  private mapPrismaToEntity(prismaProject: any): Project {
    return {
      id: prismaProject.id,
      name: prismaProject.name,
      description: prismaProject.description,
      color: prismaProject.color,
      icon: prismaProject.icon,
      status: prismaProject.status.toLowerCase(),
      visibility: prismaProject.visibility.toLowerCase(),
      ownerId: prismaProject.ownerId,
      teamIds: prismaProject.teams.map((t: any) => t.teamId),
      memberIds: prismaProject.members.map((m: any) => m.userId),
      createdAt: prismaProject.createdAt.toISOString(),
      updatedAt: prismaProject.updatedAt.toISOString(),
      dueDate: prismaProject.dueDate?.toISOString(),
      progress: prismaProject.progress,
      priority: prismaProject.priority.toLowerCase(),
      template: prismaProject.template,
      tags: prismaProject.tags,
      settings: {
        allowComments: prismaProject.settings?.allowComments ?? true,
        allowAttachments: prismaProject.settings?.allowAttachments ?? true,
        requireApproval: prismaProject.settings?.requireApproval ?? false,
        timeTracking: prismaProject.settings?.timeTracking ?? false,
      }
    };
  }
} 