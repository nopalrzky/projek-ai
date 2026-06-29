import {
    Payroll,
    PayrollFilters,
    PaginationMeta,
    Outlet,
    Account,
} from "@/types";

export interface PayrollIndexProps {
    payrolls: {
        data: Payroll[];
        meta: PaginationMeta;
    };
    outlets: Outlet[];
    filters: PayrollFilters;
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
    };
}

export interface PayrollCreateProps {
    outlets: Outlet[];
    bankAccounts: Account[];
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
    };
}

export interface PayrollShowProps {
    payroll: Payroll;
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
    };
}

export interface PayrollEmployeeProps {
    payroll: Payroll;
}

export interface PayrollOverviewProps {
    payroll: Payroll;
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
    };
}

export interface PayrollBankAccountProps {
    payroll: Payroll;
}

export interface PayrollPageHeaderProps {
    payroll: Payroll;
}

export interface PayrollEditProps {
    payroll: Payroll;
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
    };
}

export interface DeletePayrollModalProps {
    isOpen: boolean;
    payroll?: Payroll;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}
