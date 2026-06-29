import { Employee } from ".";

export interface Attendance {
    id: number;
    employeeId: number;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    employee: Employee;
    createdAt: string;
    updatedAt: string;
}
