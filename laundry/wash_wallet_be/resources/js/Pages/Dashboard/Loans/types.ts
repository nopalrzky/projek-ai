import {
    Loan,
    PaginationMeta,
    LoanFilters,
    Employee,
    Account,
    Outlet,
} from "@/types";

export interface LoanIndexProps {
    loans: {
        data: Loan[];
        meta: PaginationMeta;
    };
    filterOptions: {
        employees: Employee[];
        outlets: Outlet[];
    };
    filters: LoanFilters;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface LoanShowProps {
    loan: Loan;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface LoanEditProps {
    loan: Loan;
    employees: Employee[];
    sourceAccounts: Account[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface LoanCreateProps {
    outlets: Outlet[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface LoanPageHeaderProps {
    loan: Loan;
    onEdit?: () => void;
    onDelete?: () => void;
    onToggleStatus?: () => void;
    isLoading?: boolean;
}

export interface LoanDeleteModalProps {
    isOpen: boolean;
    loan?: Loan;
    onClose: () => void;
    onConfirm: (loan: Loan) => void;
    isLoading?: boolean;
}
