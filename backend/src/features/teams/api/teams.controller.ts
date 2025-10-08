import { Request, Response } from 'express';
import { BaseController } from '../../../core/base/base.controller';
import { TeamRepository } from '../domain/team.repository';

export class TeamsController extends BaseController {
  constructor(private readonly teamRepository: TeamRepository) {
    super();
  }

  // GET /api/teams
  async getTeams(req: Request, res: Response): Promise<void> {
    try {
      const { search, department } = req.query;
      
      const teams = await this.teamRepository.findAll({
        search: search as string,
        department: department as string
      });

      this.ok(res, teams);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // GET /api/teams/:id
  async getTeamById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const team = await this.teamRepository.findById(id);
      if (!team) {
        return this.notFound(res, 'Takım bulunamadı');
      }

      this.ok(res, team);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // POST /api/teams
  async createTeam(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, leaderId, memberIds, color, department } = req.body;
      
      if (!name || !leaderId) {
        return this.badRequest(res, 'Takım adı ve lider gereklidir');
      }

      const team = await this.teamRepository.create({
        name,
        description,
        leaderId,
        memberIds,
        color,
        department
      });

      this.created(res, team);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // PUT /api/teams/:id
  async updateTeam(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, color, department } = req.body;
      
      const updatedTeam = await this.teamRepository.update(id, {
        name,
        description,
        color,
        department
      });

      this.ok(res, updatedTeam);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // DELETE /api/teams/:id
  async deleteTeam(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      await this.teamRepository.delete(id);
      this.noContent(res);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // POST /api/teams/:id/members
  async addMember(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return this.badRequest(res, 'Kullanıcı ID gereklidir');
      }

      await this.teamRepository.addMember(id, userId);

      this.ok(res, { 
        message: 'Üye başarıyla takıma eklendi'
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // DELETE /api/teams/:id/members/:userId
  async removeMember(req: Request, res: Response): Promise<void> {
    try {
      const { id, userId } = req.params;

      await this.teamRepository.removeMember(id, userId);

      this.ok(res, { 
        message: 'Üye başarıyla takımdan çıkarıldı'
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // PUT /api/teams/:id/leader
  async changeLeader(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { leaderId } = req.body;

      if (!leaderId) {
        return this.badRequest(res, 'Lider ID gereklidir');
      }

      const updatedTeam = await this.teamRepository.updateLeader(id, leaderId);

      this.ok(res, {
        message: 'Takım lideri başarıyla değiştirildi',
        data: updatedTeam
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // GET /api/teams/:id/projects
  async getTeamProjects(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const projects = await this.teamRepository.getTeamProjects(id);

      this.ok(res, projects);
    } catch (error) {
      this.handleError(res, error);
    }
  }
} 