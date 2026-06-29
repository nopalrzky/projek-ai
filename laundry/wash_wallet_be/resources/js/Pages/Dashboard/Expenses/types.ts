import {
    Expense,
    ExpenseFilters,
    PaginationMeta,
    Outlet,
    Account,
} from "@/types";

export interface ExpenseIndexProps {
    expenses: {
        data: Expense[];
        meta: PaginationMeta;
    };
    filterOptions: {
        outlets: Outlet[];
        expenseAccounts: Account[];
        sourceAccounts: Account[];
    };
    filters: ExpenseFilters;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface ExpenseCreateProps {
    outlets: Outlet[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface ExpenseEditProps {
    expense: Expense;
    outlets: Outlet[];
    expenseAccounts: Account[];
    sourceAccounts: Account[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface ExpenseOverviewProps {
    expense: Expense;
}

export interface ExpenseAccountingInfoProps {
    expense: Expense;
}

export interface ExpenseShowProps {
    expense: Expense;
    sourceAccounts: Account[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface DeleteExpenseModalProps {
    isOpen: boolean;
    expense?: Expense;
    onClose: () => void;
    onConfirm: (expense: Expense) => void;
    isLoading: boolean;
}

export interface ApproveExpenseModalProps {
    isOpen: boolean;
    expense?: Expense;
    accounts: Account[];
    onClose: () => void;
    onConfirm: (expense: Expense, sourceAccountId?: number) => void;
    isLoading: boolean;
}

export interface RejectExpenseModalProps {
    isOpen: boolean;
    expense?: Expense;
    onClose: () => void;
    onConfirm: (expense: Expense, reason: string) => void;
    isLoading: boolean;
}
