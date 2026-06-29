import { Employee, EmployeePosition, Position } from "@/types";

export interface EmployeePositionsIndexProps {
    employee: Employee;
    positions: Position[];
    isLoading?: boolean;
}

export interface CreateEmployeePositionModalProps {
    isOpen: boolean;
    employee: Employee;
    positions: Position[];
    onClose: () => void;
    onSuccess?: () => void;
}

export interface EditEmployeePositionModalProps {
    isOpen: boolean;
    employee: Employee;
    employeePosition: EmployeePosition;
    positions: Position[];
    onClose: () => void;
    onSuccess?: () => void;
}

export interface DeleteEmployeePositionModalProps {
    isOpen: boolean;
    employee: Employee;
    employeePosition?: EmployeePosition;
    onClose: () => void;
    onConfirm: (employeePosition: EmployeePosition) => void;
    isLoading: boolean;
}
