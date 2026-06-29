import { WithdrawalBank, PaginationMeta } from "@/types";

export interface WithdrawalBankIndexProps {
    banks: {
        data: WithdrawalBank[];
        meta: PaginationMeta;
    };
    filters: any;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface WithdrawalBankCreateProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface WithdrawalBankEditProps {
    bank: WithdrawalBank;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface WithdrawalBankFormProps {
    bank?: WithdrawalBank;
    onSubmit: (data: any) => void;
    isLoading: boolean;
}

export interface DeleteWithdrawalBankModalProps {
    isOpen: boolean;
    bank?: WithdrawalBank;
    onClose: () => void;
    onConfirm: (bank: WithdrawalBank) => void;
    isLoading: boolean;
}
