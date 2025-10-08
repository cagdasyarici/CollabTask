import { Task, CreateTaskData, UpdateTaskData, TaskFilters, BulkUpdateData, KanbanColumn, TimeEntry, TaskComment, Subtask } from './task.entity';

export interface TaskRepository {
  // Temel CRUD işlemleri
  create(data: CreateTaskData, reporterId: string): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findAll(filters?: TaskFilters, page?: number, limit?: number): Promise<{
    data: Task[];
    total: number;
  }>;
  update(id: string, data: UpdateTaskData): Promise<Task>;
  delete(id: string): Promise<void>;

  // Görev durumu yönetimi
  updateStatus(id: string, status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'): Promise<Task>;
  bulkUpdate(data: BulkUpdateData): Promise<void>;

  // Görev atama
  assignTask(id: string, assigneeIds: string[]): Promise<Task>;
  unassignTask(id: string, assigneeId: string): Promise<Task>;

  // Yorumlar
  addComment(taskId: string, content: string, authorId: string, mentions?: string[]): Promise<TaskComment>;
  updateComment(commentId: string, content: string): Promise<TaskComment>;
  deleteComment(commentId: string): Promise<void>;

  // Alt görevler
  addSubtask(taskId: string, title: string, assigneeId?: string, dueDate?: string): Promise<Subtask>;
  updateSubtask(subtaskId: string, data: { title?: string; completed?: boolean; assigneeId?: string; dueDate?: string }): Promise<Subtask>;
  deleteSubtask(subtaskId: string): Promise<void>;

  // Zaman takibi
  addTimeEntry(taskId: string, userId: string, startTime: string, endTime?: string, description?: string): Promise<TimeEntry>;
  getTimeEntries(taskId: string): Promise<TimeEntry[]>;

  // Kanban board
  getKanbanBoard(projectId: string): Promise<KanbanColumn[]>;

  // Proje görevleri
  findByProjectId(projectId: string): Promise<Task[]>;
  findByAssigneeId(assigneeId: string): Promise<Task[]>;

  // Bağımlılıklar
  addDependency(taskId: string, dependsOnTaskId: string): Promise<void>;
  removeDependency(taskId: string, dependsOnTaskId: string): Promise<void>;

  // Pozisyon güncelleme
  updatePosition(id: string, position: number): Promise<Task>;
} 