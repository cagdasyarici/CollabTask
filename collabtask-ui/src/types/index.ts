// Domain tipleri ve ApiResponse artık core paketinden gelir
import type {
  User,
  Project,
  Task,
  Subtask,
  Comment,
  Attachment,
  Reaction,
  Team,
  Notification,
  Activity,
  Permission,
  PermissionLevel,
  ProjectStats,
  UserStats,
  TimeEntry,
  ApiResponse,
  PaginatedResponse,
  ApiError,
  UserRole,
  UserStatus,
  TaskStatus,
  Priority,
  ProjectStatus,
  ProjectVisibility,
} from 'collabtask-core';

export type {
  User,
  Project,
  Task,
  Subtask,
  Comment,
  Attachment,
  Reaction,
  Team,
  Notification,
  Activity,
  Permission,
  PermissionLevel,
  ProjectStats,
  UserStats,
  TimeEntry,
  ApiResponse,
  PaginatedResponse,
  ApiError,
  UserRole,
  UserStatus,
  TaskStatus,
  Priority,
  ProjectStatus,
  ProjectVisibility,
};

// Auth Types
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupResponse {
  user: User;
  token: string;
  message: string;
}

// UI’de RegisterData eşleniği
export type RegisterData = SignupRequest;

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
}

export interface AuthActions {
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Page/Component Types
export type { UserRole, UserStatus, TaskStatus, Priority, ProjectStatus, ProjectVisibility };
export type UserManagementViewMode = 'users' | 'teams' | 'permissions';
export type ProjectViewMode = 'grid' | 'list';
export type ProjectSortOption = 'name' | 'updated' | 'created' | 'progress' | 'priority';
export type ProjectFilterStatus = 'all' | 'active' | 'paused' | 'completed' | 'archived';

// Form Data Types
export interface InviteUserData {
  email: string;
  name: string;
  role: UserRole;
  teamIds: string[];
  projectIds: string[];
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  projectId: string;
  assigneeId: string;
  dueDate: string;
  startDate: string;
  estimatedHours: string;
  tags: string[];
  dependencies: string[];
  attachments: File[];
  settings: {
    allowComments: boolean;
    trackTime: boolean;
    sendNotifications: boolean;
    requireApproval: boolean;
  };
}

export interface ProjectFormData {
  name: string;
  description: string;
  template: string;
  icon: string;
  color: string;
  visibility: 'public' | 'private' | 'team';
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  teamIds: string[];
  memberIds: string[];
  tags: string[];
  settings: {
    allowComments: boolean;
    allowAttachments: boolean;
    requireApproval: boolean;
    timeTracking: boolean;
  };
}

export interface TeamFormData {
  name: string;
  description: string;
  color: string;
  leaderId: string;
  memberIds: string[];
  department: string;
}

export interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  position: string;
  department: string;
  teamIds: string[];
  permissions: {
    createProjects: boolean;
    manageUsers: boolean;
    viewReports: boolean;
    manageSettings: boolean;
  };
}

export interface ProfileSettings {
  notifications: {
    email: boolean;
    push: boolean;
    taskAssigned: boolean;
    taskCompleted: boolean;
    mentions: boolean;
    projectUpdates: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'team' | 'private';
    activityVisibility: 'public' | 'team' | 'private';
    showEmail: boolean;
    showPosition: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: 'tr' | 'en';
    timezone: string;
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    workingHours: {
      start: string;
      end: string;
    };
  };
}

// Component Props Types
export interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: TaskFormData & { id?: string; createdAt?: string; updatedAt?: string }) => void;
  editTask?: Task | null;
  defaultProjectId?: string;
  defaultStatus?: TaskStatus;
}

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: ProjectFormData & { id?: string; createdAt?: string; updatedAt?: string }) => void;
  editProject?: Project | null;
}

export interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: InviteUserData) => void;
  editUser?: User | null;
}

export interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teamData: TeamFormData) => void;
  editTeam?: Team | null;
}

// Filter Types
export interface FilterOption {
  id: string;
  label: string;
  type: 'select' | 'multiSelect' | 'dateRange' | 'text' | 'number';
  options?: { value: string; label: string }[];
}

type DateRange = { start?: string; end?: string };
type NumberRange = { min?: string; max?: string };

export interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, string | string[] | boolean | DateRange | NumberRange>;
  isDefault?: boolean;
}

export interface AdvancedFiltersProps {
  title?: string;
  filterOptions: FilterOption[];
  onFiltersChange: (filters: Record<string, string | string[] | boolean | DateRange | NumberRange>) => void;
  savedFilters?: SavedFilter[];
  onSaveFilter?: (filter: SavedFilter) => void;
  showSaveFilters?: boolean;
}

// Drag & Drop Types
export interface DragState {
  isDragging: boolean;
  draggedTask: Task | null;
  draggedOver: string | null;
}

// API Response Types
// ApiResponse, PaginatedResponse ve ApiError core’dan geldi