import { Team, CreateTeamData, UpdateTeamData } from './team.entity';

export interface TeamRepository {
    findById(id: string): Promise<Team | null>;
    save(entity: Team): Promise<Team>;
    delete(id: string): Promise<void>;
    create(data: CreateTeamData): Promise<Team>;
    update(id: string, data: UpdateTeamData): Promise<Team>;
    findAll(filters?: { search?: string; department?: string }): Promise<Team[]>;
    addMember(teamId: string, userId: string): Promise<void>;
    removeMember(teamId: string, userId: string): Promise<void>;
    updateLeader(teamId: string, leaderId: string): Promise<Team>;
    getTeamProjects(teamId: string): Promise<any[]>;
}



