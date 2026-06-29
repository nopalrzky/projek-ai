import { User } from "./user";
import { OwnerBankAccount } from "./owner_bank_account";
import { BaseFilters } from "./filters";

export type WalletWithdrawalStatus =
    'pending' | 'processing' | 'paid' | 'rejected' | 'cancelled';

export interface WalletWithdrawal {
    id: number;
    userId: number;
    ownerBankAccountId?: number | null;
    code: string;
    requestedAmount: number;
    adminFee: number;
    netAmount: number;
    status: WalletWithdrawalStatus;
    statusLabel: string;
    statusColor: string;
    bankName: string;
    bankCode?: string | null;
    accountNumber: string;
    accountHolderName: string;
    adminNote?: string | null;
    proofPath?: string | null;
    proofUrl?: string | null;
    processedBy?: number | null;
    processedAt?: string | null;
    paidAt?: string | null;
    rejectedAt?: string | null;
    cancelledAt?: string | null;
    createdAt: string;
    updatedAt: string;
    user?: User;
    ownerBankAccount?: OwnerBankAccount;
    processedByUser?: User;
}

export interface WalletWithdrawalFilters extends BaseFilters {
    status?: WalletWithdrawalStatus | string;
    userId?: number;
    startDate?: string;
    endDate?: string;
}

export interface WalletWithdrawalFormData {
    ownerBankAccountId: number;
    requestedAmount: number;
}
