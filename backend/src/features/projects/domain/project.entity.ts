export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  visibility: 'public' | 'private' | 'team';
  ownerId: string;
  teamIds: string[];
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  template?: string;
  tags: string[];
  settings: {
    allowComments: boolean;
    allowAttachments: boolean;
    requireApproval: boolean;
    timeTracking: boolean;
  };
}

export interface CreateProjectData {
  name: string;
  description: string;
  color?: string;
  icon?: string;
  visibility?: 'public' | 'private' | 'team';
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  template?: string;
  tags?: string[];
  teamIds?: string[];
  memberIds?: string[];
  settings?: {
    allowComments?: boolean;
    allowAttachments?: boolean;
    requireApproval?: boolean;
    timeTracking?: boolean;
  };
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  status?: 'active' | 'paused' | 'completed' | 'archived';
  visibility?: 'public' | 'private' | 'team';
  dueDate?: string;
  progress?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  template?: string;
  tags?: string[];
  settings?: {
    allowComments?: boolean;
    allowAttachments?: boolean;
    requireApproval?: boolean;
    timeTracking?: boolean;
  };
}

export interface ProjectFilters {
  status?: 'active' | 'paused' | 'completed' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  owner?: string;
  member?: string;
  tag?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalMembers: number;
  totalHours: number;
  remainingHours: number;
} 