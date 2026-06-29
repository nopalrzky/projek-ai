import { Employee, EmployeeProcess } from "@/types";
import { Process } from "@/types";

export interface EmployeeProcessesIndexProps {
    employee: Employee;
    isLoading?: boolean;
}

export interface EmployeeProcessCreateProps {
    employee: Employee;
    processes: Process[];
    errors?: Record<string, string>;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface EmployeeProcessSettingProps {
    employee: Employee;
    processes: Process[];
    errors?: Record<string, string>;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface EmployeeProcessEditProps {
    employee: Employee;
    employeeProcess: EmployeeProcess;
    errors?: Record<string, string>;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface DeleteEmployeeProcessModalProps {
    isOpen: boolean;
    employee: Employee;
    employeeProcess?: EmployeeProcess;
    onClose: () => void;
    onConfirm: (employeeProcess: EmployeeProcess) => void;
    isLoading: boolean;
}

export interface ShowEmployeeProcessModalProps {
    isOpen: boolean;
    employee: Employee;
    employeeProcess?: EmployeeProcess;
    onClose: () => void;
}
