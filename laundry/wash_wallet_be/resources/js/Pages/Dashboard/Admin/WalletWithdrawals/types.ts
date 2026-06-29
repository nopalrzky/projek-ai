import { WalletWithdrawal, PaginationMeta } from "@/types";

export interface AdminWalletWithdrawalIndexProps {
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

export interface AdminWalletWithdrawalShowProps {
    withdrawal: WalletWithdrawal;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface ProcessWithdrawalModalProps {
    isOpen: boolean;
    withdrawal?: WalletWithdrawal;
    onClose: () => void;
    onConfirm: (withdrawal: WalletWithdrawal) => void;
    isLoading: boolean;
}

export interface MarkPaidModalProps {
    isOpen: boolean;
    withdrawal?: WalletWithdrawal;
    onClose: () => void;
    onConfirm: (withdrawal: WalletWithdrawal, data: { proof: File | null; adminNote: string }) => void;
    isLoading: boolean;
}

export interface RejectWithdrawalModalProps {
    isOpen: boolean;
    withdrawal?: WalletWithdrawal;
    onClose: () => void;
    onConfirm: (withdrawal: WalletWithdrawal, data: { reason: string }) => void;
    isLoading: boolean;
}
