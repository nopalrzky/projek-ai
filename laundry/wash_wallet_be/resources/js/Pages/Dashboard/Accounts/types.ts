import { Account, PaginationMeta } from "@/types";

export interface AccountIndexProps {
    accounts: Account[];
    filters: {
        search?: string;
        type?: string;
        isSystem?: boolean | null;
        isTransactional?: boolean | null;
    };
    accountTypes: AccountType[];
}

export interface AccountEditProps {
    account: Account;
    accounts: Account[];
}

export interface AccountCreateProps {
    accounts: Account[];
}

export interface DeleteAccountModalProps {
    isOpen: boolean;
    account?: Account;
    onClose: () => void;
    onConfirm: (account: Account) => void;
    isLoading?: boolean;
}

export interface CreateAccountModalProps {
    isOpen: boolean;
    parentId?: number;
    parentName?: string;
    parentCode?: string;
    parentType?: string;
    accountTypes: AccountType[];
    onClose: () => void;
    onSuccess?: () => void;
}

export interface EditAccountModalProps {
    isOpen: boolean;
    account?: Account;
    accountTypes: AccountType[];
    onClose: () => void;
    onSuccess?: () => void;
}

export interface AccountTreeTableProps {
    accounts: Account[];
    isLoading: boolean;
    onCreateChild: (
        parentId?: number,
        parentName?: string,
        parentCode?: string,
        parentType?: string,
    ) => void;
    onEdit: (account: Account) => void;
    onDelete: (account: Account) => void;
}
export interface AccountRowProps {
    account: Account;
    level: number;
    onCreateChild: (
        accountId: number,
        accountName: string,
        accountCode?: string,
        accountType?: string,
    ) => void;
    onEdit: (account: Account) => void;
    onDelete: (account: Account) => void;
}

export interface AccountType {
    value: string;
    label: string;
}
