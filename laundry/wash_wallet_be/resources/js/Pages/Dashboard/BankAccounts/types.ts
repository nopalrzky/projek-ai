import { OwnerBankAccount, WithdrawalBank, PaginationMeta } from "@/types";

export interface BankAccountIndexProps {
    accounts: {
        data: OwnerBankAccount[];
        meta: PaginationMeta;
    };
    filters: any;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface BankAccountFormProps {
    account?: OwnerBankAccount;
    banks: WithdrawalBank[];
    onSubmit: (data: any) => void;
    isLoading: boolean;
}

export interface DeleteBankAccountModalProps {
    isOpen: boolean;
    account?: OwnerBankAccount;
    onClose: () => void;
    onConfirm: (account: OwnerBankAccount) => void;
    isLoading: boolean;
}
