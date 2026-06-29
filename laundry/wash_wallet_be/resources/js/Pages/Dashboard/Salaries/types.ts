import { PaginationMeta, Salary, SalaryFilters } from "@/types";

export interface SalaryIndexProps {
    salaries: {
        data: Salary[];
        meta: PaginationMeta;
    };
    filters: SalaryFilters;
    flash: {
        success?: string;
        error?: string;
    };
}

export interface SalaryFiltersProps {
    filters: SalaryFilters;
    hasActiveFilters: boolean;
    isLoading: boolean;
    onSearchChange: (value: string) => void;
    onFilterChange: (key: string, value: any) => void;
    onResetFilters: () => void;
}

export interface SalaryTableProps {
    data: Salary[];
    meta: PaginationMeta;
    filters: SalaryFilters;
    isLoading: boolean;
    onPaginationChange: (page: number, pageSize: number) => void;
    onSortingChange: (sorting: any[]) => void;
    onEditSalary: (salary: Salary) => void;
    onViewSalary: (salary: Salary) => void;
    onDeleteSalary: (salary: Salary) => void;
}

export interface SalaryShowProps {
    salary: Salary;
    flash: {
        success?: string;
        error?: string;
    };
}

export interface SalaryEditProps {
    salary: Salary;
    flash: {
        success?: string;
        error?: string;
    };
}

export interface SalaryCreateProps {
    flash: {
        success?: string;
        error?: string;
    };
}

export interface SalaryPageHeaderProps {
    salary: Salary;
    onEdit?: () => void;
    onDelete?: () => void;
    onToggleStatus?: () => void;
    isLoading?: boolean;
}

export interface DeleteSalaryModalProps {
    isOpen: boolean;
    salary?: Salary;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
}
