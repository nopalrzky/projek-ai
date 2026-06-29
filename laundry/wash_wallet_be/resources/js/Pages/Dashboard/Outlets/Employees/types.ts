import { Employee, Outlet, Position, Process, Salary } from "@/types";

export interface OutletEmployeesProps {
    outlet: Outlet;
    isLoading?: boolean;
}

export interface EmployeeCreateProps {
    outletId: number;
    outlet: Outlet;
    positions: Position[];
    processes: Process[];
    salaries: Salary[];
}

export interface EmployeeEditProps {
    outlet: Outlet;
    employee: Employee;
}

export interface DeleteEmployeeModalProps {
    isOpen: boolean;
    employee?: Employee;
    onClose: () => void;
    onConfirm: (employee: Employee) => void;
    isLoading?: boolean;
}
