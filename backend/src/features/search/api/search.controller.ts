import { Request, Response } from 'express';
import { BaseController } from '../../../core/base/base.controller';
import { SearchService } from '../domain/search.service';

export class SearchController extends BaseController {
  private searchService: SearchService;

  constructor() {
    super();
    this.searchService = new SearchService();
  }

  // GET /api/search
  async globalSearch(req: Request, res: Response): Promise<void> {
    try {
      const { q, limit } = req.query;

      if (!q || (q as string).trim().length < 2) {
        return this.badRequest(res, 'Arama terimi en az 2 karakter olmalıdır');
      }

      const searchLimit = parseInt(limit as string) || 10;
      const results = await this.searchService.globalSearch(q as string, searchLimit);

      this.ok(res, results);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async searchProjects(req: Request, res: Response): Promise<void> {
    try {
      const { q, limit } = req.query;

      if (!q || (q as string).trim().length < 2) {
        return this.badRequest(res, 'Arama terimi en az 2 karakter olmalıdır');
      }

      const searchLimit = parseInt(limit as string) || 10;
      const projects = await this.searchService.searchProjects(q as string, searchLimit);

      this.ok(res, { data: projects });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async searchTasks(req: Request, res: Response): Promise<void> {
    try {
      const { q, limit } = req.query;

      if (!q || (q as string).trim().length < 2) {
        return this.badRequest(res, 'Arama terimi en az 2 karakter olmalıdır');
      }

      const searchLimit = parseInt(limit as string) || 10;
      const tasks = await this.searchService.searchTasks(q as string, searchLimit);

      this.ok(res, { data: tasks });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const { q, limit } = req.query;

      if (!q || (q as string).trim().length < 2) {
        return this.badRequest(res, 'Arama terimi en az 2 karakter olmalıdır');
      }

      const searchLimit = parseInt(limit as string) || 10;
      const users = await this.searchService.searchUsers(q as string, searchLimit);

      this.ok(res, { data: users });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async searchSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q || (q as string).trim().length < 2) {
        return this.badRequest(res, 'Arama terimi en az 2 karakter olmalıdır');
      }

      const suggestions = await this.searchService.searchSuggestions(q as string);

      this.ok(res, suggestions);
    } catch (error) {
      this.handleError(res, error);
    }
  }
}
