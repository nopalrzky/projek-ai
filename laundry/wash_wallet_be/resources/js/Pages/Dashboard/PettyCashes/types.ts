import {
    Account,
    PaginationMeta,
    PettyCash,
    PettyCashFilters,
    Outlet,
} from "@/types";

export interface PettyCashIndexProps {
    pettyCashes: {
        data: PettyCash[];
        meta: PaginationMeta;
    };
    filterOptions: {
        outlets: Outlet[];
        accounts: Account[];
        statusOptions: Array<{ value: string; label: string }>;
    };
    filters: PettyCashFilters;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface PettyCashShowProps {
    pettyCash: PettyCash;
    accounts: Account[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface DeletePettyCashModalProps {
    isOpen: boolean;
    pettyCash?: PettyCash;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

export interface ApprovePettyCashModalProps {
    isOpen: boolean;
    pettyCash?: PettyCash;
    accounts: Account[];
    onClose: () => void;
    onConfirm: (sourceAccountId: number) => void;
    isLoading?: boolean;
}

export interface RejectPettyCashModalProps {
    isOpen: boolean;
    pettyCash?: PettyCash;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    isLoading?: boolean;
}
