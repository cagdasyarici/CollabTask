import type {
  UserRole,
  UserStatus,
  ProjectStatus,
  ProjectVisibility,
  TaskStatus,
  Priority,
  NotificationType,
  ActivityType,
} from './enums';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastActive?: string;
  timezone?: string;
  position?: string;
  department?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  ownerId: string;
  teamIds: string[];
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  progress: number;
  priority: Priority;
  template?: string;
  tags: string[];
  settings: {
    allowComments: boolean;
    allowAttachments: boolean;
    requireApproval: boolean;
    timeTracking: boolean;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
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
  attachments: Attachment[];
  comments: Comment[];
  dependencies: string[];
  subtasks: Subtask[];
  customFields: { [key: string]: string | number | boolean | string[] };
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

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt?: string;
  mentions: string[];
  attachments: Attachment[];
  reactions: Reaction[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Reaction {
  emoji: string;
  userIds: string[];
}

export interface Team {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
  leaderId: string;
  createdAt: string;
  color: string;
  department?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
  relatedId?: string;
  relatedType?: 'task' | 'project' | 'comment';
  actionUrl?: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  projectId?: string;
  taskId?: string;
  description: string;
  createdAt: string;
  metadata?: { [key: string]: string | number | boolean };
}

export interface Permission {
  id: string;
  userId: string;
  resourceType: 'project' | 'task' | 'team';
  resourceId: string;
  permissions: PermissionLevel[];
}

export type PermissionLevel =
  | 'view'
  | 'edit'
  | 'delete'
  | 'create_tasks'
  | 'assign_tasks'
  | 'manage_members'
  | 'manage_settings';

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  tasksInProgress: number;
  teamSize: number;
  avgCompletionTime: number;
  productivity: number;
}

export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  activeProjects: number;
  weeklyHours: number;
  completionRate: number;
  tasksThisWeek: number;
  tasksLastWeek: number;
  projectsThisMonth: number;
  projectsLastMonth: number;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration: number;
  description?: string;
  billable: boolean;
}


