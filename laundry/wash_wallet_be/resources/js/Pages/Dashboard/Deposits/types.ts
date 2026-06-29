import { Deposit, DepositFilters, Outlet, PaginationMeta } from "@/types";

export interface DepositIndexProps {
    deposits: {
        data: Deposit[];
        meta: PaginationMeta;
    };
    filterOptions: {
        outlets: Outlet[];
        statusOptions: Array<{ value: string; label: string }>;
    };
    filters: DepositFilters;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface DepositShowProps {
    deposit: Deposit;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface DeleteDepositModalProps {
    isOpen: boolean;
    deposit?: Deposit;
    onClose: () => void;
    onConfirm: (deposit: Deposit) => void;
    isLoading?: boolean;
}

export interface ApproveDepositModalProps {
    isOpen: boolean;
    deposit?: Deposit;
    onClose: () => void;
    onConfirm: (deposit: Deposit) => void;
    isLoading?: boolean;
}

export interface RejectDepositModalProps {
    isOpen: boolean;
    deposit?: Deposit;
    onClose: () => void;
    onConfirm: (deposit: Deposit, reason: string) => void;
    isLoading?: boolean;
}
