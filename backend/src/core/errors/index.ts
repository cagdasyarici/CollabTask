// Temel hata sınıfları
export class DomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DomainError';
    }
}

export class NotFoundError extends DomainError {
    constructor(message: string = 'Kaynak bulunamadı') {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class ValidationError extends DomainError {
    constructor(message: string = 'Geçersiz veri') {
        super(message);
        this.name = 'ValidationError';
    }
}

export class UnauthorizedError extends DomainError {
    constructor(message: string = 'Yetkisiz erişim') {
        super(message);
        this.name = 'UnauthorizedError';
    }
} 