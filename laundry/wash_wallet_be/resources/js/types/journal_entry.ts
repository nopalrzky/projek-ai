import { BaseFilters, JournalDetail, Outlet } from ".";

export interface JournalEntry {
    id: number;
    outletId: number;
    transactionNumber: string;
    date: string;
    description?: string;
    referenceType?: string;
    referenceId?: number;
    isManual: boolean;
    totalAmount: number;
    journalDetails: JournalDetail[];
    outlet: Outlet;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    canBeEdited?: boolean;
    canBeDeleted?: boolean;
}

export interface JournalEntryFilters extends BaseFilters {
    outletId?: number;
    isManual?: boolean;
    referenceType?: string;
    dateFrom: string;
    dateTo: string;
    minAmount?: number;
    maxAmount?: number;
    balanced?: boolean;
}

export type JournalEntrySortColumn =
    | "transactionNumber"
    | "date"
    | "totalAmount"
    | "isManual"
    | "createdAt";

export interface JournalEntrySortOptions {
    column: JournalEntrySortColumn;
    direction: "asc" | "desc";
}

export interface JournalEntryFormData {
    outletId: number;
    date: string;
    description: string;
    referenceType?: string;
    referenceId?: number;
    journalDetails: Array<{
        accountId: number;
        debit: number;
        credit: number;
        memo: string;
    }>;
}

export interface JournalDetailFormInput {
    id: string;
    accountId: number;
    debit: string;
    credit: string;
    memo: string;
}
