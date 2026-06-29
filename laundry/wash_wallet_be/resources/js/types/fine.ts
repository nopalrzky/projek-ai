import { BaseFilters, FineLog, Outlet } from ".";

export interface Fine {
    id: number;
    outletId: number;
    name: string;
    amount: number;
    description: string;
    fineLogsCount: number;
    fineLogs: FineLog[];
    outlet: Outlet;
    createdAt: string;
    updatedAt: string;
}

export interface FineFormData {
    outletId: number;
    name: string;
    amount: number;
    description?: string;
}

export interface FineFilters extends BaseFilters {
    outletId?: number;
    minAmount?: number;
    maxAmount?: number;
}

export interface FineSortOptions {
    column: string;
    direction: "asc" | "desc";
}
