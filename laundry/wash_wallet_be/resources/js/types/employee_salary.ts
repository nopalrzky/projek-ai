import { Employee, Salary } from ".";

export interface EmployeeSalary {
    id: number;
    employeeId: number;
    salaryId: number;
    amount: number;
    type: string;
    status: "active" | "inactive";
    employee: Employee;
    salary: Salary;
    createdAt: string;
    updatedAt: string;
}
