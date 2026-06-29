import { Employee, EmployeeProcessCommission, Process } from ".";

export interface EmployeeProcess {
    id: number;
    employeeId: number;
    processId: number;
    isActive: boolean;
    notes?: string | null;
    assignedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    employee: Employee;
    process?: Process | null;
    commission?: EmployeeProcessCommission | null;
    employeeProcessCommission?: EmployeeProcessCommission | null;
}
