import { Request, Response } from 'express';
import { BaseController } from '../../../core/base/base.controller';
import { CreateTaskCommand } from '../application/commands/create-task.command';
import { CreateTaskHandler } from '../application/commands/create-task.handler';
import { TaskRepository } from '../domain/task.repository';
import { TaskFilters, UpdateTaskData } from '../domain/task.entity';

export class TasksController extends BaseController {
  private createTaskHandler: CreateTaskHandler;

  constructor(private readonly taskRepository: TaskRepository) {
    super();
    this.createTaskHandler = new CreateTaskHandler(taskRepository);
  }

  // GET /api/tasks
  async getTasks(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page, 
        limit, 
        status,
        priority,
        assignee,
        project,
        dueDate,
        overdue,
        search 
      } = req.query;

      const filters: TaskFilters = {
        ...(status && { status: status as any }),
        ...(priority && { priority: priority as any }),
        ...(assignee && { assignee: assignee as string }),
        ...(project && { project: project as string }),
        ...(dueDate && { dueDate: dueDate as string }),
        ...(overdue && { overdue: overdue === 'true' }),
        ...(search && { search: search as string }),
      };

      const result = await this.taskRepository.findAll(
        filters,
        page ? parseInt(page as string) : undefined,
        limit ? parseInt(limit as string) : undefined
      );

      this.ok(res, {
        data: result.data,
        pagination: {
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 20,
          total: result.total,
          totalPages: Math.ceil(result.total / (limit ? parseInt(limit as string) : 20))
        }
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // GET /api/tasks/:id
  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const task = await this.taskRepository.findById(id);

      if (!task) {
        return this.notFound(res, 'Görev bulunamadı');
      }

      this.ok(res, task);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // POST /api/tasks
  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return this.unauthorized(res);
      }

      const {
        title,
        description,
        priority,
        projectId,
        assigneeIds,
        dueDate,
        startDate,
        estimatedHours,
        tags,
        dependencies,
        customFields,
        position
      } = req.body;

      const command = new CreateTaskCommand(
        title,
        projectId,
        userId,
        description,
        priority,
        assigneeIds,
        dueDate,
        startDate,
        estimatedHours,
        tags,
        dependencies,
        customFields,
        position
      );

      const task = await this.createTaskHandler.handle(command);
      this.created(res, task);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // PUT /api/tasks/:id
  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        status,
        priority,
        assigneeIds,
        dueDate,
        startDate,
        estimatedHours,
        actualHours,
        tags,
        dependencies,
        customFields,
        position
      } = req.body;

      const updateData: UpdateTaskData = {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assigneeIds && { assigneeIds }),
        ...(dueDate && { dueDate }),
        ...(startDate && { startDate }),
        ...(estimatedHours !== undefined && { estimatedHours }),
        ...(actualHours !== undefined && { actualHours }),
        ...(tags && { tags }),
        ...(dependencies && { dependencies }),
        ...(customFields && { customFields }),
        ...(position !== undefined && { position })
      };

      const task = await this.taskRepository.update(id, updateData);
      this.ok(res, task);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // DELETE /api/tasks/:id
  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.taskRepository.delete(id);
      this.noContent(res);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // PUT /api/tasks/:id/status
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const task = await this.taskRepository.updateStatus(id, status);
      this.ok(res, task);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // PUT /api/tasks/:id/assign
  async assignTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { assigneeIds } = req.body;

      const task = await this.taskRepository.assignTask(id, assigneeIds);
      this.ok(res, task);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // POST /api/tasks/:id/comments
  async addComment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { content, mentions } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return this.unauthorized(res);
      }

      const comment = await this.taskRepository.addComment(id, content, userId, mentions);
      this.created(res, comment);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // PUT /api/tasks/:id/comments/:commentId
  async updateComment(req: Request, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;
      const { content } = req.body;

      const comment = await this.taskRepository.updateComment(commentId, content);
      this.ok(res, comment);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // DELETE /api/tasks/:id/comments/:commentId
  async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;

      await this.taskRepository.deleteComment(commentId);
      this.noContent(res);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // POST /api/tasks/:id/attachments
  async addAttachment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, url, type, size } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return this.unauthorized(res);
      }

      // Mock attachment creation - production'da file service kullanılacak
      const attachment = {
        id: Date.now().toString(),
        name,
        url,
        type,
        size,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString()
      };

      this.created(res, attachment);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // DELETE /api/tasks/:id/attachments/:attachmentId
  async deleteAttachment(req: Request, res: Response): Promise<void> {
    try {
      const { attachmentId } = req.params;

      // Mock attachment deletion - production'da file service kullanılacak
      this.noContent(res);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // POST /api/tasks/:id/subtasks
  async addSubtask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, assigneeId, dueDate } = req.body;

      const subtask = await this.taskRepository.addSubtask(id, title, assigneeId, dueDate);
      this.created(res, subtask);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // PUT /api/tasks/:id/subtasks/:subtaskId
  async updateSubtask(req: Request, res: Response): Promise<void> {
    try {
      const { subtaskId } = req.params;
      const { title, completed, assigneeId, dueDate } = req.body;

      const updateData = {
        ...(title && { title }),
        ...(completed !== undefined && { completed }),
        ...(assigneeId && { assigneeId }),
        ...(dueDate && { dueDate })
      };

      const subtask = await this.taskRepository.updateSubtask(subtaskId, updateData);
      this.ok(res, subtask);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // DELETE /api/tasks/:id/subtasks/:subtaskId
  async deleteSubtask(req: Request, res: Response): Promise<void> {
    try {
      const { subtaskId } = req.params;

      await this.taskRepository.deleteSubtask(subtaskId);
      this.noContent(res);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // GET /api/tasks/kanban/:projectId
  async getKanbanBoard(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const kanbanData = await this.taskRepository.getKanbanBoard(projectId);
      this.ok(res, kanbanData);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // POST /api/tasks/bulk-update
  async bulkUpdate(req: Request, res: Response): Promise<void> {
    try {
      const { taskIds, updates } = req.body;

      await this.taskRepository.bulkUpdate({ taskIds, updates });
      this.ok(res, { message: 'Görevler başarıyla güncellendi' });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // POST /api/tasks/:id/time-entries
  async addTimeEntry(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { startTime, endTime, description } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return this.unauthorized(res);
      }

      const timeEntry = await this.taskRepository.addTimeEntry(id, userId, startTime, endTime, description);
      this.created(res, timeEntry);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // GET /api/tasks/:id/time-entries
  async getTimeEntries(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const timeEntries = await this.taskRepository.getTimeEntries(id);
      this.ok(res, timeEntries);
    } catch (error) {
      this.handleError(res, error);
    }
  }
} 