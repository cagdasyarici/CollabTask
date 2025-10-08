import { apiService } from './api.service';
import type { User } from '../types';

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'member';
  position?: string;
  department?: string;
  teamIds?: string[];
}

interface UpdateUserData {
  id: string;
  name?: string;
  email?: string;
  role?: 'admin' | 'manager' | 'member';
  position?: string;
  department?: string;
  status?: 'active' | 'inactive' | 'invited';
  teamIds?: string[];
}

interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  department?: string;
  teamId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface UserInviteData {
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'member';
  teamIds?: string[];
  projectIds?: string[];
  message?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface UserSettings {
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

class UsersService {
  private readonly endpoint = '/api/users';

  // Get all users with filters
  async getUsers(filters?: UserFilters) {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;
    
    return apiService.get<User[]>(url);
  }

  // Get user by ID
  async getUser(id: string) {
    return apiService.get<User>(`${this.endpoint}/${id}`);
  }

  // Get current user profile
  async getCurrentUser() {
    return apiService.get<User>(`${this.endpoint}/me`);
  }

  // Update current user profile
  async updateCurrentUser(userData: Partial<User>) {
    return apiService.put<User>(`${this.endpoint}/me`, userData);
  }

  // Create new user (admin only)
  async createUser(userData: CreateUserData) {
    return apiService.post<User>(this.endpoint, userData);
  }

  // Update user (admin/manager)
  async updateUser(userData: UpdateUserData) {
    const { id, ...data } = userData;
    return apiService.put<User>(`${this.endpoint}/${id}`, data);
  }

  // Delete user (admin only)
  async deleteUser(id: string) {
    return apiService.delete(`${this.endpoint}/${id}`);
  }

  // Invite user
  async inviteUser(inviteData: UserInviteData) {
    return apiService.post(`${this.endpoint}/invite`, inviteData);
  }

  // Resend invitation
  async resendInvitation(userId: string) {
    return apiService.post(`${this.endpoint}/${userId}/resend-invitation`);
  }

  // Accept invitation
  async acceptInvitation(token: string, userData: { password: string; name?: string }) {
    return apiService.post(`${this.endpoint}/accept-invitation`, { token, ...userData });
  }

  // Change password
  async changePassword(passwordData: ChangePasswordData) {
    return apiService.put(`${this.endpoint}/me/password`, passwordData);
  }

  // Update user avatar
  async updateAvatar(file: File) {
    return apiService.uploadFile(`${this.endpoint}/me/avatar`, file);
  }

  // Get user settings
  async getUserSettings() {
    return apiService.get<UserSettings>(`${this.endpoint}/me/settings`);
  }

  // Update user settings
  async updateUserSettings(settings: Partial<UserSettings>) {
    return apiService.put<UserSettings>(`${this.endpoint}/me/settings`, settings);
  }

  // Get user statistics
  async getUserStats(userId?: string) {
    const url = userId ? `${this.endpoint}/${userId}/stats` : `${this.endpoint}/me/stats`;
    return apiService.get(url);
  }

  // Update user status
  async updateUserStatus(userId: string, status: 'active' | 'inactive') {
    return apiService.put(`${this.endpoint}/${userId}/status`, { status });
  }

  // Get user activities
  async getUserActivities(userId?: string, page = 1, limit = 20) {
    const url = userId 
      ? `${this.endpoint}/${userId}/activities?page=${page}&limit=${limit}`
      : `${this.endpoint}/me/activities?page=${page}&limit=${limit}`;
    return apiService.get(url);
  }

  // Get user projects
  async getUserProjects(userId?: string) {
    const url = userId ? `${this.endpoint}/${userId}/projects` : `${this.endpoint}/me/projects`;
    return apiService.get(url);
  }

  // Get user tasks
  async getUserTasks(userId?: string, filters?: { status?: string; priority?: string; projectId?: string }) {
    const baseUrl = userId ? `${this.endpoint}/${userId}/tasks` : `${this.endpoint}/me/tasks`;
    
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const queryString = params.toString();
      return apiService.get(`${baseUrl}?${queryString}`);
    }
    
    return apiService.get(baseUrl);
  }

  // Get user permissions
  async getUserPermissions(userId?: string) {
    const url = userId ? `${this.endpoint}/${userId}/permissions` : `${this.endpoint}/me/permissions`;
    return apiService.get(url);
  }

  // Update user permissions (admin only)
  async updateUserPermissions(userId: string, permissions: Record<string, boolean>) {
    return apiService.put(`${this.endpoint}/${userId}/permissions`, permissions);
  }

  // Get user teams
  async getUserTeams(userId?: string) {
    const url = userId ? `${this.endpoint}/${userId}/teams` : `${this.endpoint}/me/teams`;
    return apiService.get(url);
  }

  // Search users
  async searchUsers(query: string, filters?: { role?: string; department?: string; teamId?: string }) {
    const params = new URLSearchParams({ search: query });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    return apiService.get<User[]>(`${this.endpoint}/search?${params.toString()}`);
  }

  // Bulk update users (admin only)
  async bulkUpdateUsers(userIds: string[], updates: Partial<UpdateUserData>) {
    return apiService.put(`${this.endpoint}/bulk`, { userIds, updates });
  }

  // Get user workload
  async getUserWorkload(userId?: string, timeRange?: { start: string; end: string }) {
    const baseUrl = userId ? `${this.endpoint}/${userId}/workload` : `${this.endpoint}/me/workload`;
    
    if (timeRange) {
      const params = new URLSearchParams(timeRange);
      return apiService.get(`${baseUrl}?${params.toString()}`);
    }
    
    return apiService.get(baseUrl);
  }
}

export const usersService = new UsersService();
export default usersService; 