import {
    Account,
    BaseFilters,
    BaseSortOptions,
    Employee,
    JournalEntry,
    Outlet,
    User,
} from ".";

export interface PettyCash {
    id: number;
    code: string;
    ownerId: number;
    outletId: number;
    cashierId: number;
    sourceAccountId?: number | null;
    amount: number;
    description: string;
    requestDate: string;
    status: PettyCashStatus;
    approvedBy?: number | null;
    approvedAt?: string | null;
    rejectionReason?: string | null;
    journalEntryId?: number | null;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    owner?: User;
    outlet?: Outlet;
    cashier?: Employee;
    sourceAccount?: Account;
    approvedByUser?: User;
    journalEntry?: JournalEntry;
    statusLabel?: string;
    statusColor?: string;
    formattedAmount?: string;
    requestDateFormatted?: string;
}

export type PettyCashStatus = "pending" | "approved" | "rejected";

export interface PettyCashFilters extends BaseFilters {
    status?: PettyCashStatus | string;
    outletId?: number;
    startDate?: string;
    endDate?: string;
}

export interface PettyCashSortOptions extends BaseSortOptions {
    column:
        | "code"
        | "amount"
        | "status"
        | "requestDate"
        | "createdAt"
        | "updatedAt";
}

export interface ApprovePettyCashData {
    sourceAccountId: number;
}

export interface RejectPettyCashData {
    reason: string;
}
