import {
    Employee,
    EmployeeFilters,
    Outlet,
    PaginationMeta,
    Position,
    Process,
    Salary,
} from "@/types";

export interface EmployeeIndexProps {
    employees: {
        data: Employee[];
        meta: PaginationMeta;
    };
    stats: Array<{
        label: string;
        value: string | number;
        subValue?: string;
        icon: string;
        variant?: "primary" | "success" | "info" | "warning" | "danger";
        trend?: string;
        unit?: string;
        progress?: number;
    }>;
    filterOptions: {
        outlets: Outlet[];
        positions: Position[];
    };
    filters: EmployeeFilters;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface EmployeeCreateProps {
    outlets: Outlet[];
    salaries: Salary[];
    processes: Process[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface EmployeeEditProps {
    employee: Employee;
    salaries: Salary[];
    processes: Process[];
    positions: Position[];
    flash?: {
        success?: string;
        error?: string;
    };
}
export interface DeleteEmployeeModalProps {
    isOpen: boolean;
    employee?: Employee;
    onClose: () => void;
    onConfirm: (employee: Employee) => void;
    isLoading?: boolean;
}
export interface EmployeePersonalInfoProps {
    employee: Employee;
}

export interface EmployeeOverviewProps {
    employee: Employee;
}

export interface EmployeeShowProps {
    employee: Employee;
    positions: Position[];
    salaries: Salary[];
}

export interface EmployeePageHeaderProps {
    employee: Employee;
    onEdit?: () => void;
    onChangePassword?: () => void;
    onDelete?: () => void;
    isLoading?: boolean;
}

export interface ChangeEmployeePasswordFormData {
    password: string;
    passwordConfirmation: string;
    [key: string]: string;
}

export interface ChangeEmployeePasswordModalProps {
    isOpen: boolean;
    employee?: Employee;
    onClose: () => void;
}
