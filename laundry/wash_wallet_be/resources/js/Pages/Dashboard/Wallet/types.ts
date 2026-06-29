import { WalletTransaction, WalletTransactionFilters, PaginationMeta } from "@/types";

export interface WalletIndexProps {
    stats: {
        walletBalance: number;
        availableBalance: number;
        pendingWdrTotal: number;
    };
    transactions: {
        data: WalletTransaction[];
        meta: PaginationMeta;
    };
    filters: WalletTransactionFilters;
    flash?: {
        success?: string;
        error?: string;
    };
}
