import { WalletWithdrawal, OwnerBankAccount, PaginationMeta } from "@/types";

export interface WalletWithdrawalIndexProps {
    withdrawals: {
        data: WalletWithdrawal[];
        meta: PaginationMeta;
    };
    filters: any;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface WalletWithdrawalCreateProps {
    stats: {
        walletBalance: number;
        availableBalance: number;
        pendingWdrTotal: number;
    };
    accounts: OwnerBankAccount[];
}

export interface WalletWithdrawalShowProps {
    withdrawal: WalletWithdrawal;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface CancelWithdrawalModalProps {
    isOpen: boolean;
    withdrawal?: WalletWithdrawal;
    onClose: () => void;
    onConfirm: (withdrawal: WalletWithdrawal) => void;
    isLoading: boolean;
}

export interface WithdrawalSummaryCardProps {
    availableBalance: number;
    requestedAmount: number;
    adminFee: number;
    netAmount: number;
}
