import { CoinTransaction, PaginationMeta } from "@/types";

export interface CoinTransactionIndexProps {
    transactions: {
        data: CoinTransaction[];
        meta: PaginationMeta;
    };
    stats: Array<{
        label: string;
        value: string | number;
        subValue?: string;
        icon: string;
        variant?: "primary" | "success" | "info" | "warning" | "danger";
    }>;
    filterOptions: {
        typeOptions: Array<{ value: string; label: string }>;
        statusOptions: Array<{ value: string; label: string }>;
    };
    filters: CoinTransactionFilters;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface CoinTransactionFilters {
    search?: string;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortDirection?: string;
    page?: number;
    perPage?: number;
}

export interface CoinTransactionShowProps {
    coinTransaction: CoinTransaction;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface CoinTransactionPageHeaderProps {
    transaction: CoinTransaction;
}

export interface CoinTransactionOverviewProps {
    transaction: CoinTransaction;
}

export interface CoinTransactionDetailsProps {
    transaction: CoinTransaction;
}
