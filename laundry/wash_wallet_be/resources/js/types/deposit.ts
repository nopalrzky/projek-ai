import {
    Account,
    BaseFilters,
    BaseSortOptions,
    Employee,
    JournalEntry,
    Outlet,
    User,
} from ".";

export interface Deposit {
    id: number;
    code: string;
    ownerId: number;
    outletId: number;
    cashierId: number;
    sourceAccountId: number;
    destinationAccountId: number;
    amount: number;
    notes?: string | null;
    attachmentPath?: string | null;
    attachmentUrl?: string | null;
    status: DepositStatus;
    approvedBy?: number | null;
    approvedAt?: string | null;
    rejectionReason?: string | null;
    journalEntryId?: number | null;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    owner?: User;
    outlet?: Outlet;
    cashier?: Employee | User;
    sourceAccount?: Account;
    destinationAccount?: Account;
    approvedByUser?: User;
    journalEntry?: JournalEntry;
    statusLabel?: string;
    statusColor?: string;
}

export type DepositStatus = "pending" | "approved" | "rejected";

export interface DepositFilters extends BaseFilters {
    status?: DepositStatus | string;
    outletId?: number;
    startDate?: string;
    endDate?: string;
}

export interface DepositSortOptions extends BaseSortOptions {
    column:
        | "code"
        | "amount"
        | "status"
        | "createdAt"
        | "updatedAt"
        | "approvedAt";
}

export interface DepositFormData {
    outletId: number;
    destinationAccountId: number;
    amount: string;
    notes?: string;
    attachment?: File;
}

export interface RejectDepositData {
    reason: string;
}
