import { PaginationMeta, User } from "@/types";

export interface AffiliateIndexProps {
    user: User;
    referrals: {
        data: User[];
        meta: PaginationMeta;
    };
    summary: {
        totalReferrals: number;
        totalCommission: number;
    };
    filters: {
        search?: string;
        status?: string | null;
        sortBy?: string;
        sortDirection?: "asc" | "desc";
        page?: number;
        perPage?: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}
