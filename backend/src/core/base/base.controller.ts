import { Response } from 'express';
import type { ApiResponse } from 'collabtask-core';

export abstract class BaseController {
  protected ok<T>(res: Response, data?: T, message?: string): void {
    const body: ApiResponse<T> = { success: true, data, message };
    res.status(200).json(body);
  }

  protected created<T>(res: Response, data?: T, message?: string): void {
    const body: ApiResponse<T> = { success: true, data, message };
    res.status(201).json(body);
  }

  protected noContent(res: Response): void {
    res.status(204).send();
  }

  protected badRequest(res: Response, message?: string): void {
    const body: ApiResponse = { success: false, error: message || 'Bad Request' };
    res.status(400).json(body);
  }

  protected unauthorized(res: Response, message?: string): void {
    const body: ApiResponse = { success: false, error: message || 'Unauthorized' };
    res.status(401).json(body);
  }

  protected forbidden(res: Response, message?: string): void {
    const body: ApiResponse = { success: false, error: message || 'Forbidden' };
    res.status(403).json(body);
  }

  protected notFound(res: Response, message?: string): void {
    const body: ApiResponse = { success: false, error: message || 'Not Found' };
    res.status(404).json(body);
  }

  protected conflict(res: Response, message?: string): void {
    const body: ApiResponse = { success: false, error: message || 'Conflict' };
    res.status(409).json(body);
  }

  protected tooManyRequests(res: Response, message?: string): void {
    const body: ApiResponse = { success: false, error: message || 'Too Many Requests' };
    res.status(429).json(body);
  }

  protected internalServerError(res: Response, message?: string): void {
    const body: ApiResponse = { success: false, error: message || 'Internal Server Error' };
    res.status(500).json(body);
  }

  protected handleError(res: Response, error: any): void {
    console.error('Controller Error:', error);
    
    if (error.name === 'ValidationError') {
      this.badRequest(res, error.message);
    } else if (error.name === 'UnauthorizedError') {
      this.unauthorized(res, error.message);
    } else if (error.name === 'ForbiddenError') {
      this.forbidden(res, error.message);
    } else if (error.name === 'NotFoundError') {
      this.notFound(res, error.message);
    } else if (error.name === 'ConflictError') {
      this.conflict(res, error.message);
    } else {
      this.internalServerError(res, 'Bir hata oluştu');
    }
  }
} 