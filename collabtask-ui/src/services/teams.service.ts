import { apiService } from './api.service';
import type { Team, Project } from '../types';

export interface CreateTeamRequest {
  name: string;
  description: string;
  color: string;
  leaderId: string;
  memberIds: string[];
  department: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  color?: string;
  leaderId?: string;
  department?: string;
}

export interface AddMemberRequest {
  userId: string;
  role?: 'member' | 'admin';
}

export interface TeamStats {
  totalMembers: number;
  activeProjects: number;
  completedTasks: number;
  averageTaskCompletion: number;
  memberActivity: Array<{
    userId: string;
    tasksCompleted: number;
    hoursLogged: number;
  }>;
}

class TeamsService {
  private endpoint = '/api/teams';

  async getTeams(): Promise<{ success: boolean; data?: Team[]; error?: string }> {
    try {
      const response = await apiService.get<Team[]>(this.endpoint);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Teams fetch error:', error);
      return { success: false, error: 'Takımlar yüklenemedi' };
    }
  }

  async getTeamById(id: string): Promise<{ success: boolean; data?: Team; error?: string }> {
    try {
      const response = await apiService.get<Team>(`${this.endpoint}/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Team fetch error:', error);
      return { success: false, error: 'Takım bulunamadı' };
    }
  }

  async createTeam(teamData: CreateTeamRequest): Promise<{ success: boolean; data?: Team; error?: string }> {
    try {
      const response = await apiService.post<Team>(this.endpoint, teamData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Team creation error:', error);
      return { success: false, error: 'Takım oluşturulamadı' };
    }
  }

  async updateTeam(id: string, updateData: UpdateTeamRequest): Promise<{ success: boolean; data?: Team; error?: string }> {
    try {
      const response = await apiService.put<Team>(`${this.endpoint}/${id}`, updateData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Team update error:', error);
      return { success: false, error: 'Takım güncellenemedi' };
    }
  }

  async deleteTeam(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await apiService.delete(`${this.endpoint}/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Team deletion error:', error);
      return { success: false, error: 'Takım silinemedi' };
    }
  }

  async addMember(teamId: string, memberData: AddMemberRequest): Promise<{ success: boolean; error?: string }> {
    try {
      await apiService.post(`${this.endpoint}/${teamId}/members`, memberData);
      return { success: true };
    } catch (error) {
      console.error('Add member error:', error);
      return { success: false, error: 'Üye eklenemedi' };
    }
  }

  async removeMember(teamId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await apiService.delete(`${this.endpoint}/${teamId}/members/${userId}`);
      return { success: true };
    } catch (error) {
      console.error('Remove member error:', error);
      return { success: false, error: 'Üye çıkarılamadı' };
    }
  }

  async changeLeader(teamId: string, newLeaderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await apiService.put(`${this.endpoint}/${teamId}/leader`, { leaderId: newLeaderId });
      return { success: true };
    } catch (error) {
      console.error('Change leader error:', error);
      return { success: false, error: 'Lider değiştirilemedi' };
    }
  }

  async getTeamProjects(teamId: string): Promise<{ success: boolean; data?: Project[]; error?: string }> {
    try {
      const response = await apiService.get<Project[]>(`${this.endpoint}/${teamId}/projects`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Team projects fetch error:', error);
      return { success: false, error: 'Takım projeleri yüklenemedi' };
    }
  }

  async getTeamStats(teamId: string): Promise<{ success: boolean; data?: TeamStats; error?: string }> {
    try {
      const response = await apiService.get<TeamStats>(`${this.endpoint}/${teamId}/stats`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Team stats fetch error:', error);
      return { success: false, error: 'Takım istatistikleri yüklenemedi' };
    }
  }
}

export const teamsService = new TeamsService(); 