export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface PaginatedResponse<T = unknown> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}
//# sourceMappingURL=common.d.ts.map