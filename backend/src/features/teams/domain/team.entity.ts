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

export interface CreateTeamData {
  name: string;
  description?: string;
  leaderId: string;
  memberIds?: string[];
  color?: string;
  department?: string;
}

export interface UpdateTeamData {
  name?: string;
  description?: string;
  leaderId?: string;
  color?: string;
  department?: string;
} 