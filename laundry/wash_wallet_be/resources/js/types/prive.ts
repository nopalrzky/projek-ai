import { Account, BaseFilters, Outlet, User } from ".";

export interface Prive {
    id: number;
    outletId: number;
    userId: number;
    sourceAccountId: number;
    equityAccountId: number;
    description?: string;
    amount: number;
    date: string;
    formattedAmount: string;
    formattedDate: string;
    shortDescription: string;
    ownerName: string;
    sourceAccountName: string;
    equityAccountName: string;
    outletName: string;
    outlet: Outlet;
    user: User;
    sourceAccount: Account;
    equityAccount: Account;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

export interface PriveFormData {
    outletId: number | "";
    sourceAccountId: number | "";
    equityAccountId: number | "";
    amount: number | "";
    date: string;
    description?: string;
}

export interface PriveFilters extends BaseFilters {
    search?: string;
    outletId?: number;
    sourceAccountId?: number;
    equityAccountId?: number;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
}
