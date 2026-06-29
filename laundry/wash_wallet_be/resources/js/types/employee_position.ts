import { Employee, Position } from ".";

export interface EmployeePosition {
    id: number;
    employeeId: number;
    positionId: number;
    isActive: boolean;
    employee: Employee;
    position: Position;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}
