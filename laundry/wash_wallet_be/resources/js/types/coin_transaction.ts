import { BaseFilters, BaseSortOptions, User, Outlet } from ".";

export interface CoinTransaction {
    id: number;
    userId: number;
    outletId?: number | null;
    type: string;
    typeLabel: string;
    amount: number;
    referenceType?: string | null;
    referenceId?: number | null;
    description?: string | null;
    transactionNumber?: string | null;
    createdAt: string;
    updatedAt: string;
    user?: User;
    outlet?: Outlet;
}

export interface CoinTransactionFilters extends BaseFilters {
    type?: string;
    status?: string;
    userId?: number;
    outletId?: number;
    referenceType?: string;
    referenceId?: number;
    startDate?: string;
    endDate?: string;
}

export interface CoinTransactionSortOptions extends BaseSortOptions {
    column:
        | "id"
        | "type"
        | "amount"
        | "balanceBefore"
        | "balanceAfter"
        | "status"
        | "createdAt"
        | "updatedAt";
}
