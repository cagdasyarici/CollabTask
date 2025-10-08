import { apiService } from './api.service';
import type { Task } from '../types';

interface CreateTaskData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  projectId: string;
  assigneeIds?: string[];
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  tags?: string[];
  dependencies?: string[];
  subtasks?: Array<{
    title: string;
    assigneeId?: string;
    dueDate?: string;
  }>;
}

interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string;
}

interface TaskFilters {
  search?: string;
  status?: string | string[];
  priority?: string | string[];
  assigneeId?: string;
  projectId?: string;
  tags?: string[];
  dueDate?: {
    start?: string;
    end?: string;
  };
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface TaskComment {
  content: string;
  taskId: string;
  mentions?: string[];
}

interface TaskAttachment {
  taskId: string;
  file: File;
  description?: string;
}

class TasksService {
  private readonly endpoint = '/api/tasks';

  // Get all tasks with filters
  async getTasks(filters?: TaskFilters) {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else if (typeof value === 'object' && value !== null) {
            // Handle nested objects like dueDate
            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
              if (nestedValue !== undefined && nestedValue !== null) {
                params.append(`${key}.${nestedKey}`, nestedValue.toString());
              }
            });
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;
    
    return apiService.get<Task[]>(url);
  }

  // Get task by ID
  async getTask(id: string) {
    return apiService.get<Task>(`${this.endpoint}/${id}`);
  }

  // Create new task
  async createTask(taskData: CreateTaskData) {
    return apiService.post<Task>(this.endpoint, taskData);
  }

  // Update task
  async updateTask(taskData: UpdateTaskData) {
    const { id, ...data } = taskData;
    return apiService.put<Task>(`${this.endpoint}/${id}`, data);
  }

  // Delete task
  async deleteTask(id: string) {
    return apiService.delete(`${this.endpoint}/${id}`);
  }

  // Update task status
  async updateTaskStatus(id: string, status: string) {
    return apiService.put(`${this.endpoint}/${id}/status`, { status });
  }

  // Assign task to user
  async assignTask(id: string, userId: string) {
    return apiService.put(`${this.endpoint}/${id}/assign`, { userId });
  }

  // Unassign task
  async unassignTask(id: string, userId: string) {
    return apiService.put(`${this.endpoint}/${id}/unassign`, { userId });
  }

  // Get task comments
  async getTaskComments(taskId: string) {
    return apiService.get(`${this.endpoint}/${taskId}/comments`);
  }

  // Add comment to task
  async addTaskComment(commentData: TaskComment) {
    const { taskId, ...data } = commentData;
    return apiService.post(`${this.endpoint}/${taskId}/comments`, data);
  }

  // Update comment
  async updateTaskComment(taskId: string, commentId: string, content: string) {
    return apiService.put(`${this.endpoint}/${taskId}/comments/${commentId}`, { content });
  }

  // Delete comment
  async deleteTaskComment(taskId: string, commentId: string) {
    return apiService.delete(`${this.endpoint}/${taskId}/comments/${commentId}`);
  }

  // Get task attachments
  async getTaskAttachments(taskId: string) {
    return apiService.get(`${this.endpoint}/${taskId}/attachments`);
  }

  // Add attachment to task
  async addTaskAttachment(attachmentData: TaskAttachment) {
    const { taskId, file, description } = attachmentData;
    return apiService.uploadFile(`${this.endpoint}/${taskId}/attachments`, file, { description });
  }

  // Delete attachment
  async deleteTaskAttachment(taskId: string, attachmentId: string) {
    return apiService.delete(`${this.endpoint}/${taskId}/attachments/${attachmentId}`);
  }

  // Get task subtasks
  async getTaskSubtasks(taskId: string) {
    return apiService.get(`${this.endpoint}/${taskId}/subtasks`);
  }

  // Add subtask
  async addTaskSubtask(taskId: string, subtaskData: { title: string; assigneeId?: string; dueDate?: string }) {
    return apiService.post(`${this.endpoint}/${taskId}/subtasks`, subtaskData);
  }

  // Update subtask
  async updateTaskSubtask(taskId: string, subtaskId: string, data: { title?: string; completed?: boolean; assigneeId?: string; dueDate?: string }) {
    return apiService.put(`${this.endpoint}/${taskId}/subtasks/${subtaskId}`, data);
  }

  // Delete subtask
  async deleteTaskSubtask(taskId: string, subtaskId: string) {
    return apiService.delete(`${this.endpoint}/${taskId}/subtasks/${subtaskId}`);
  }

  // Get task activities
  async getTaskActivities(taskId: string, page = 1, limit = 20) {
    return apiService.get(`${this.endpoint}/${taskId}/activities?page=${page}&limit=${limit}`);
  }

  // Track time on task
  async startTimeTracking(taskId: string, description?: string) {
    return apiService.post(`${this.endpoint}/${taskId}/time/start`, { description });
  }

  // Stop time tracking
  async stopTimeTracking(taskId: string, timeEntryId: string) {
    return apiService.put(`${this.endpoint}/${taskId}/time/stop`, { timeEntryId });
  }

  // Get task time entries
  async getTaskTimeEntries(taskId: string) {
    return apiService.get(`${this.endpoint}/${taskId}/time`);
  }

  // Bulk update tasks
  async bulkUpdateTasks(taskIds: string[], updates: Partial<CreateTaskData>) {
    return apiService.put(`${this.endpoint}/bulk`, { taskIds, updates });
  }

  // Get task dependencies
  async getTaskDependencies(taskId: string) {
    return apiService.get(`${this.endpoint}/${taskId}/dependencies`);
  }

  // Add task dependency
  async addTaskDependency(taskId: string, dependencyTaskId: string) {
    return apiService.post(`${this.endpoint}/${taskId}/dependencies`, { dependencyTaskId });
  }

  // Remove task dependency
  async removeTaskDependency(taskId: string, dependencyTaskId: string) {
    return apiService.delete(`${this.endpoint}/${taskId}/dependencies/${dependencyTaskId}`);
  }
}

export const tasksService = new TasksService();
export default tasksService; 