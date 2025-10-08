import { TeamRepository } from '../../features/teams/domain/team.repository';
import { Team, CreateTeamData, UpdateTeamData } from '../../features/teams/domain/team.entity';
import { PrismaService } from './prisma.client';

export class TeamRepositoryImpl implements TeamRepository {
    constructor(private readonly prisma: PrismaService = new PrismaService()) {}

    async save(entity: Team): Promise<Team> {
        return await this.update(entity.id, entity);
    }

    async findById(id: string): Promise<Team | null> {
        const team = await this.prisma.team.findUnique({
            where: { id },
            include: {
                leader: true,
                members: {
                    include: {
                        user: true
                    }
                }
            }
        });

        return team ? this.toDomain(team) : null;
    }

    async create(data: CreateTeamData): Promise<Team> {
        const team = await this.prisma.team.create({
            data: {
                name: data.name,
                description: data.description || '',
                color: data.color || '#3B82F6',
                department: data.department,
                leaderId: data.leaderId,
                members: data.memberIds ? {
                    create: data.memberIds.map(userId => ({
                        userId
                    }))
                } : undefined
            },
            include: {
                leader: true,
                members: {
                    include: {
                        user: true
                    }
                }
            }
        });

        return this.toDomain(team);
    }

    async update(id: string, data: UpdateTeamData): Promise<Team> {
        const team = await this.prisma.team.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                color: data.color,
                department: data.department,
                leaderId: data.leaderId
            },
            include: {
                leader: true,
                members: {
                    include: {
                        user: true
                    }
                }
            }
        });

        return this.toDomain(team);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.team.delete({
            where: { id }
        });
    }

    async findAll(filters?: { search?: string; department?: string }): Promise<Team[]> {
        const teams = await this.prisma.team.findMany({
            where: {
                ...(filters?.search && {
                    OR: [
                        { name: { contains: filters.search, mode: 'insensitive' } },
                        { description: { contains: filters.search, mode: 'insensitive' } }
                    ]
                }),
                ...(filters?.department && { department: filters.department })
            },
            include: {
                leader: true,
                members: {
                    include: {
                        user: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return teams.map(team => this.toDomain(team));
    }

    async addMember(teamId: string, userId: string): Promise<void> {
        await this.prisma.teamMember.create({
            data: {
                teamId,
                userId
            }
        });
    }

    async removeMember(teamId: string, userId: string): Promise<void> {
        await this.prisma.teamMember.deleteMany({
            where: {
                teamId,
                userId
            }
        });
    }

    async updateLeader(teamId: string, leaderId: string): Promise<Team> {
        const team = await this.prisma.team.update({
            where: { id: teamId },
            data: { leaderId },
            include: {
                leader: true,
                members: {
                    include: {
                        user: true
                    }
                }
            }
        });

        return this.toDomain(team);
    }

    async getTeamProjects(teamId: string): Promise<any[]> {
        const projectTeams = await this.prisma.projectTeam.findMany({
            where: { teamId },
            include: {
                project: {
                    include: {
                        owner: true,
                        members: true,
                        tasks: {
                            where: { status: { not: 'DONE' } }
                        }
                    }
                }
            }
        });

        return projectTeams.map(pt => ({
            id: pt.project.id,
            name: pt.project.name,
            description: pt.project.description,
            status: pt.project.status,
            progress: pt.project.progress,
            owner: {
                id: pt.project.owner.id,
                name: pt.project.owner.name
            },
            memberCount: pt.project.members.length,
            taskCount: pt.project.tasks.length,
            assignedAt: pt.assignedAt
        }));
    }

    private toDomain(prismaTeam: any): Team {
        return {
            id: prismaTeam.id,
            name: prismaTeam.name,
            description: prismaTeam.description,
            color: prismaTeam.color,
            department: prismaTeam.department,
            leaderId: prismaTeam.leaderId,
            memberIds: prismaTeam.members?.map((m: any) => m.userId) || [],
            createdAt: prismaTeam.createdAt.toISOString()
        };
    }
}



