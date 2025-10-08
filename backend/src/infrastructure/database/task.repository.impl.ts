import { PrismaClient } from '@prisma/client';
import { TaskRepository } from '../../features/tasks/domain/task.repository';
import { Task, CreateTaskData, UpdateTaskData, TaskFilters, BulkUpdateData, KanbanColumn, TimeEntry, TaskComment, Subtask } from '../../features/tasks/domain/task.entity';
import { prisma } from './prisma.client';

export class TaskRepositoryImpl implements TaskRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async create(data: CreateTaskData, reporterId: string): Promise<Task> {
    const task = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description || '',
        priority: data.priority?.toUpperCase() as any || 'MEDIUM',
        projectId: data.projectId,
        reporterId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        estimatedHours: data.estimatedHours,
        tags: data.tags || [],
        position: data.position || 0,
        assignees: data.assigneeIds ? {
          create: data.assigneeIds.map(userId => ({ userId }))
        } : undefined,
      },
      include: {
        assignees: { include: { user: true } },
        reporter: true,
        comments: { include: { author: true, reactions: true } },
        attachments: true,
        subtasks: true,
        dependencies: true,
        dependents: true,
      }
    });

    return this.mapPrismaToEntity(task);
  }

  async findById(id: string): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignees: { include: { user: true } },
        reporter: true,
        comments: { include: { author: true, reactions: true } },
        attachments: true,
        subtasks: true,
        dependencies: true,
        dependents: true,
      }
    });

    return task ? this.mapPrismaToEntity(task) : null;
  }

  async findAll(filters?: TaskFilters, page: number = 1, limit: number = 20): Promise<{
    data: Task[];
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
      if (filters.assignee) {
        where.assignees = {
          some: { userId: filters.assignee }
        };
      }
      if (filters.project) {
        where.projectId = filters.project;
      }
      if (filters.dueDate) {
        where.dueDate = {
          lte: new Date(filters.dueDate)
        };
      }
      if (filters.overdue) {
        where.dueDate = {
          lt: new Date(),
        };
        where.status = { not: 'DONE' };
      }
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        include: {
          assignees: { include: { user: true } },
          reporter: true,
          comments: { include: { author: true, reactions: true } },
          attachments: true,
          subtasks: true,
          dependencies: true,
          dependents: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ position: 'asc' }, { createdAt: 'desc' }]
      }),
      this.prisma.task.count({ where })
    ]);

    return {
      data: tasks.map(t => this.mapPrismaToEntity(t)),
      total
    };
  }

  async update(id: string, data: UpdateTaskData): Promise<Task> {
    const updateData: any = {};

    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.status) updateData.status = data.status.toUpperCase();
    if (data.priority) updateData.priority = data.priority.toUpperCase();
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.estimatedHours !== undefined) updateData.estimatedHours = data.estimatedHours;
    if (data.actualHours !== undefined) updateData.actualHours = data.actualHours;
    if (data.tags) updateData.tags = data.tags;
    if (data.position !== undefined) updateData.position = data.position;

    if (data.assigneeIds) {
      updateData.assignees = {
        deleteMany: {},
        create: data.assigneeIds.map(userId => ({ userId }))
      };
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignees: { include: { user: true } },
        reporter: true,
        comments: { include: { author: true, reactions: true } },
        attachments: true,
        subtasks: true,
        dependencies: true,
        dependents: true,
      }
    });

    return this.mapPrismaToEntity(task);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({
      where: { id }
    });
  }

  async updateStatus(id: string, status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'): Promise<Task> {
    const updateData: any = { status: status.toUpperCase() };
    
    if (status === 'done') {
      updateData.completedAt = new Date();
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignees: { include: { user: true } },
        reporter: true,
        comments: { include: { author: true, reactions: true } },
        attachments: true,
        subtasks: true,
        dependencies: true,
        dependents: true,
      }
    });

    return this.mapPrismaToEntity(task);
  }

  async bulkUpdate(data: BulkUpdateData): Promise<void> {
    const updateData: any = {};

    if (data.updates.status) {
      updateData.status = data.updates.status.toUpperCase();
    }
    if (data.updates.priority) {
      updateData.priority = data.updates.priority.toUpperCase();
    }

    await this.prisma.task.updateMany({
      where: {
        id: { in: data.taskIds }
      },
      data: updateData
    });

    if (data.updates.assigneeIds) {
      // Bulk assignee update needs individual updates
      for (const taskId of data.taskIds) {
        await this.prisma.task.update({
          where: { id: taskId },
          data: {
            assignees: {
              deleteMany: {},
              create: data.updates.assigneeIds.map(userId => ({ userId }))
            }
          }
        });
      }
    }
  }

  async assignTask(id: string, assigneeIds: string[]): Promise<Task> {
    const task = await this.prisma.task.update({
      where: { id },
      data: {
        assignees: {
          deleteMany: {},
          create: assigneeIds.map(userId => ({ userId }))
        }
      },
      include: {
        assignees: { include: { user: true } },
        reporter: true,
        comments: { include: { author: true, reactions: true } },
        attachments: true,
        subtasks: true,
        dependencies: true,
        dependents: true,
      }
    });

    return this.mapPrismaToEntity(task);
  }

  async unassignTask(id: string, assigneeId: string): Promise<Task> {
    await this.prisma.taskAssignee.deleteMany({
      where: {
        taskId: id,
        userId: assigneeId
      }
    });

    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignees: { include: { user: true } },
        reporter: true,
        comments: { include: { author: true, reactions: true } },
        attachments: true,
        subtasks: true,
        dependencies: true,
        dependents: true,
      }
    });

    return this.mapPrismaToEntity(task!);
  }

  async addComment(taskId: string, content: string, authorId: string, mentions?: string[]): Promise<TaskComment> {
    const comment = await this.prisma.comment.create({
      data: {
        content,
        authorId,
        taskId,
        mentions: mentions || []
      },
      include: {
        author: true,
        reactions: true
      }
    });

    return {
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      createdAt: comment.createdAt.toISOString(),
      mentions: comment.mentions,
      attachments: [],
      reactions: comment.reactions.map(r => ({
        emoji: r.emoji,
        userIds: r.userIds
      }))
    };
  }

  async updateComment(commentId: string, content: string): Promise<TaskComment> {
    const comment = await this.prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        author: true,
        reactions: true
      }
    });

    return {
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      createdAt: comment.createdAt.toISOString(),
      mentions: comment.mentions,
      attachments: [],
      reactions: comment.reactions.map(r => ({
        emoji: r.emoji,
        userIds: r.userIds
      }))
    };
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.prisma.comment.delete({
      where: { id: commentId }
    });
  }

  async addSubtask(taskId: string, title: string, assigneeId?: string, dueDate?: string): Promise<Subtask> {
    const subtask = await this.prisma.subtask.create({
      data: {
        title,
        taskId,
        assigneeId,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });

    return {
      id: subtask.id,
      title: subtask.title,
      completed: subtask.completed,
      assigneeId: subtask.assigneeId || undefined,
      dueDate: subtask.dueDate?.toISOString(),
      createdAt: subtask.createdAt.toISOString()
    };
  }

  async updateSubtask(subtaskId: string, data: { title?: string; completed?: boolean; assigneeId?: string; dueDate?: string }): Promise<Subtask> {
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.completed !== undefined) updateData.completed = data.completed;
    if (data.assigneeId) updateData.assigneeId = data.assigneeId;
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);

    const subtask = await this.prisma.subtask.update({
      where: { id: subtaskId },
      data: updateData
    });

    return {
      id: subtask.id,
      title: subtask.title,
      completed: subtask.completed,
      assigneeId: subtask.assigneeId || undefined,
      dueDate: subtask.dueDate?.toISOString(),
      createdAt: subtask.createdAt.toISOString()
    };
  }

  async deleteSubtask(subtaskId: string): Promise<void> {
    await this.prisma.subtask.delete({
      where: { id: subtaskId }
    });
  }

  async addTimeEntry(taskId: string, userId: string, startTime: string, endTime?: string, description?: string): Promise<TimeEntry> {
    const timeEntry = await this.prisma.timeEntry.create({
      data: {
        taskId,
        userId,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        description
      }
    });

    return {
      id: timeEntry.id,
      startTime: timeEntry.startTime.toISOString(),
      endTime: timeEntry.endTime?.toISOString(),
      duration: timeEntry.duration,
      description: timeEntry.description || undefined,
      billable: timeEntry.billable,
      userId: timeEntry.userId,
      createdAt: timeEntry.createdAt.toISOString()
    };
  }

  async getTimeEntries(taskId: string): Promise<TimeEntry[]> {
    const entries = await this.prisma.timeEntry.findMany({
      where: { taskId }
    });

    return entries.map(entry => ({
      id: entry.id,
      startTime: entry.startTime.toISOString(),
      endTime: entry.endTime?.toISOString(),
      duration: entry.duration,
      description: entry.description || undefined,
      billable: entry.billable,
      userId: entry.userId,
      createdAt: entry.createdAt.toISOString()
    }));
  }

  async getKanbanBoard(projectId: string): Promise<KanbanColumn[]> {
    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      include: {
        assignees: { include: { user: true } },
        reporter: true,
        comments: { include: { author: true, reactions: true } },
        attachments: true,
        subtasks: true,
        dependencies: true,
        dependents: true,
      },
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }]
    });

    const columns: KanbanColumn[] = [
      { status: 'backlog', tasks: [] },
      { status: 'todo', tasks: [] },
      { status: 'in_progress', tasks: [] },
      { status: 'review', tasks: [] },
      { status: 'done', tasks: [] }
    ];

    tasks.forEach(task => {
      const taskEntity = this.mapPrismaToEntity(task);
      const column = columns.find(c => c.status === taskEntity.status);
      if (column) {
        column.tasks.push(taskEntity);
      }
    });

    return columns;
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      include: {
        assignees: { include: { user: true } },
        reporter: true,
        comments: { include: { author: true, reactions: true } },
        attachments: true,
        subtasks: true,
        dependencies: true,
        dependents: true,
      }
    });

    return tasks.map(t => this.mapPrismaToEntity(t));
  }

  async findByAssigneeId(assigneeId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        assignees: {
          some: { userId: assigneeId }
        }
      },
      include: {
        assignees: { include: { user: true } },
        reporter: true,
        comments: { include: { author: true, reactions: true } },
        attachments: true,
        subtasks: true,
        dependencies: true,
        dependents: true,
      }
    });

    return tasks.map(t => this.mapPrismaToEntity(t));
  }

  async addDependency(taskId: string, dependsOnTaskId: string): Promise<void> {
    await this.prisma.taskDependency.create({
      data: {
        dependentTaskId: taskId,
        prerequisiteTaskId: dependsOnTaskId
      }
    });
  }

  async removeDependency(taskId: string, dependsOnTaskId: string): Promise<void> {
    await this.prisma.taskDependency.deleteMany({
      where: {
        dependentTaskId: taskId,
        prerequisiteTaskId: dependsOnTaskId
      }
    });
  }

  async updatePosition(id: string, position: number): Promise<Task> {
    const task = await this.prisma.task.update({
      where: { id },
      data: { position },
      include: {
        assignees: { include: { user: true } },
        reporter: true,
        comments: { include: { author: true, reactions: true } },
        attachments: true,
        subtasks: true,
        dependencies: true,
        dependents: true,
      }
    });

    return this.mapPrismaToEntity(task);
  }

  private mapPrismaToEntity(prismaTask: any): Task {
    return {
      id: prismaTask.id,
      title: prismaTask.title,
      description: prismaTask.description,
      status: prismaTask.status.toLowerCase(),
      priority: prismaTask.priority.toLowerCase(),
      projectId: prismaTask.projectId,
      assigneeIds: prismaTask.assignees.map((a: any) => a.userId),
      reporterId: prismaTask.reporterId,
      createdAt: prismaTask.createdAt.toISOString(),
      updatedAt: prismaTask.updatedAt.toISOString(),
      dueDate: prismaTask.dueDate?.toISOString(),
      startDate: prismaTask.startDate?.toISOString(),
      completedAt: prismaTask.completedAt?.toISOString(),
      estimatedHours: prismaTask.estimatedHours,
      actualHours: prismaTask.actualHours,
      tags: prismaTask.tags,
      attachments: prismaTask.attachments.map((a: any) => ({
        id: a.id,
        name: a.name,
        url: a.url,
        type: a.type,
        size: a.size,
        uploadedBy: a.uploadedById,
        uploadedAt: a.uploadedAt.toISOString()
      })),
      comments: prismaTask.comments.map((c: any) => ({
        id: c.id,
        content: c.content,
        authorId: c.authorId,
        createdAt: c.createdAt.toISOString(),
        mentions: c.mentions,
        attachments: [],
        reactions: c.reactions.map((r: any) => ({
          emoji: r.emoji,
          userIds: r.userIds
        }))
      })),
      dependencies: prismaTask.dependencies.map((d: any) => d.prerequisiteTaskId),
      subtasks: prismaTask.subtasks.map((s: any) => ({
        id: s.id,
        title: s.title,
        completed: s.completed,
        assigneeId: s.assigneeId,
        dueDate: s.dueDate?.toISOString(),
        createdAt: s.createdAt.toISOString()
      })),
      customFields: {},
      position: prismaTask.position
    };
  }
} 