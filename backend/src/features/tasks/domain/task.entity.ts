export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  projectId: string;
  assigneeIds: string[];
  reporterId: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  dependencies: string[];
  subtasks: Subtask[];
  customFields?: Record<string, any>;
  position: number;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assigneeId?: string;
  dueDate?: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TaskComment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  mentions: string[];
  attachments: TaskAttachment[];
  reactions: CommentReaction[];
}

export interface CommentReaction {
  emoji: string;
  userIds: string[];
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  projectId: string;
  assigneeIds?: string[];
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  tags?: string[];
  dependencies?: string[];
  customFields?: Record<string, any>;
  position?: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigneeIds?: string[];
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  dependencies?: string[];
  customFields?: Record<string, any>;
  position?: number;
}

export interface TaskFilters {
  status?: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  project?: string;
  dueDate?: string;
  overdue?: boolean;
  search?: string;
}

export interface BulkUpdateData {
  taskIds: string[];
  updates: {
    status?: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    assigneeIds?: string[];
    tags?: string[];
  };
}

export interface KanbanColumn {
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  tasks: Task[];
}

export interface TimeEntry {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number;
  description?: string;
  billable: boolean;
  userId: string;
  createdAt: string;
} 