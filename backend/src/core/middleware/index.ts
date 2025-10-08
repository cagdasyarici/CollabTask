// Middleware fonksiyonları
import { Request, Response, NextFunction } from 'express';
import { DomainError, NotFoundError, ValidationError, UnauthorizedError } from '../errors';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    console.error('Hata yakalandı:', err);

    if (err instanceof NotFoundError) {
        res.status(404).json({ error: err.message });
        return;
    }

    if (err instanceof ValidationError) {
        res.status(400).json({ error: err.message });
        return;
    }

    if (err instanceof UnauthorizedError) {
        res.status(401).json({ error: err.message });
        return;
    }

    if (err instanceof DomainError) {
        res.status(400).json({ error: err.message });
        return;
    }

    // Genel server hatası
    res.status(500).json({ error: 'Sunucu hatası oluştu' });
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
}; 