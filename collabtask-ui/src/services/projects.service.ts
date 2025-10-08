import { apiService } from './api.service';
import type { Project } from '../types';

interface CreateProjectData {
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  color: string;
  icon: string;
  tags: string[];
  teamId?: string;
  memberIds: string[];
  budget?: number;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  visibility: 'private' | 'team' | 'public';
}

interface UpdateProjectData extends Partial<CreateProjectData> {
  id: string;
}

interface ProjectFilters {
  search?: string;
  status?: string;
  priority?: string;
  ownerId?: string;
  teamId?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

class ProjectsService {
  private readonly endpoint = '/api/projects';

  // Get all projects with filters
  async getProjects(filters?: ProjectFilters) {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;
    
    return apiService.get<Project[]>(url);
  }

  // Get project by ID
  async getProject(id: string) {
    return apiService.get<Project>(`${this.endpoint}/${id}`);
  }

  // Create new project
  async createProject(projectData: CreateProjectData) {
    return apiService.post<Project>(this.endpoint, projectData);
  }

  // Update project
  async updateProject(projectData: UpdateProjectData) {
    const { id, ...data } = projectData;
    return apiService.put<Project>(`${this.endpoint}/${id}`, data);
  }

  // Delete project
  async deleteProject(id: string) {
    return apiService.delete(`${this.endpoint}/${id}`);
  }

  // Get project statistics
  async getProjectStats(id: string) {
    return apiService.get(`${this.endpoint}/${id}/stats`);
  }

  // Get project members
  async getProjectMembers(id: string) {
    return apiService.get(`${this.endpoint}/${id}/members`);
  }

  // Add member to project
  async addProjectMember(id: string, userId: string, role?: string) {
    return apiService.post(`${this.endpoint}/${id}/members`, { userId, role });
  }

  // Remove member from project
  async removeProjectMember(id: string, userId: string) {
    return apiService.delete(`${this.endpoint}/${id}/members/${userId}`);
  }

  // Get project activities
  async getProjectActivities(id: string, page = 1, limit = 20) {
    return apiService.get(`${this.endpoint}/${id}/activities?page=${page}&limit=${limit}`);
  }

  // Get project templates
  async getProjectTemplates() {
    return apiService.get(`${this.endpoint}/templates`);
  }

  // Archive project
  async archiveProject(id: string) {
    return apiService.put(`${this.endpoint}/${id}/archive`);
  }

  // Unarchive project
  async unarchiveProject(id: string) {
    return apiService.put(`${this.endpoint}/${id}/unarchive`);
  }

  // Duplicate project
  async duplicateProject(id: string, newName: string) {
    return apiService.post(`${this.endpoint}/${id}/duplicate`, { name: newName });
  }

  // Get project dashboard data
  async getProjectDashboard(id: string) {
    return apiService.get(`${this.endpoint}/${id}/dashboard`);
  }
}

export const projectsService = new ProjectsService();
export default projectsService; 