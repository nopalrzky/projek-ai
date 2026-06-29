import { Account, BaseFilters, Employee, Outlet, User } from ".";
import { JournalEntry } from "./journal_entry";

export interface Expense {
    id: number;
    code: string;
    outletId: number;
    userId?: number;
    employeeId?: number;
    expenseAccountId: number;
    sourceAccountId: number;
    description?: string;
    amount: number;
    date: string;
    attachment?: string;
    attachmentUrl?: string;
    hasAttachment: boolean;
    status: "pending" | "approved" | "rejected";
    approvedBy?: number;
    approvedAt?: string;
    rejectionReason?: string;
    journalEntryId?: number;
    referenceNumber?: string;
    formattedAmount: string;
    formattedDate: string;
    shortDescription: string;
    creatorName: string;
    creatorType: "employee" | "user" | "unknown";
    expenseAccountName: string;
    sourceAccountName: string;
    outletName: string;
    statusLabel: string;
    statusColor: string;
    isPending: boolean;
    isApproved: boolean;
    isRejected: boolean;
    canBeApproved: boolean;
    canBeRejected: boolean;
    canBeCancelled: boolean;
    outlet: Outlet;
    user?: User;
    employee?: Employee;
    sourceAccount: Account;
    expenseAccount: Account;
    approver?: User;
    journalEntry?: JournalEntry;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

export interface ExpenseFormData {
    outletId?: number;
    expenseAccountId: number | "";
    sourceAccountId: number | "";
    amount: number | "";
    date: string;
    description?: string;
    attachment?: File | null;
    removeAttachment?: boolean;
}
export interface ExpenseEditFormData {
    outletId: number | undefined;
    expenseAccountId: number | string;
    sourceAccountId: number | string;
    amount: number | string;
    date: string;
    description: string;
    attachment: File | null;
    removeAttachment?: boolean;
    _method: "PUT";
}

export interface ExpenseFilters extends BaseFilters {
    outletId?: number;
    expenseAccountId?: number;
    sourceAccountId?: number;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    hasAttachment?: boolean;
}
