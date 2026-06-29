import { Employee, EmployeeSalary, Salary } from "@/types";

export interface EmployeeSalariesIndexProps {
    employee: Employee;
}

export interface EmployeeSalaryCreateProps {
    employee: Employee;
    salaries: Salary[];
    errors?: Record<string, string>;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface EmployeeSalaryEditProps {
    employee: Employee;
    employeeSalary: EmployeeSalary;
    salaries: Salary[];
    errors?: Record<string, string>;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface DeleteEmployeeSalaryModalProps {
    isOpen: boolean;
    employeeSalary?: EmployeeSalary;
    employee: Employee;
    onClose: () => void;
    onConfirm: (employeeSalary: EmployeeSalary) => void;
    isLoading?: boolean;
}
