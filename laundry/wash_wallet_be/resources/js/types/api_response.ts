/**
 * API response wrapper
 */
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    meta?: {
        total?: number;
        current_page?: number;
        last_page?: number;
        per_page?: number;
        from?: number;
        to?: number;
        status?: string;
    };
    links?: {
        first?: string;
        last?: string;
        prev?: string;
        next?: string;
    };
}
