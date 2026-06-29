import { BaseFilters, EmployeeSalary } from ".";

export interface Salary {
    id: number;
    name: string;
    description: string;
    type: "daily" | "monthly" | "hourly" | "once";
    employeeSalariesCount: number;
    employeeSalaries: EmployeeSalary[];
    createdAt: string;
    updatedAt: string;
}

export interface SalaryFormData {
    name: string;
    description: string;
    type: "daily" | "monthly" | "hourly" | "once" | "overtime" | "allowance" | "";
}

export interface SalaryFilters extends BaseFilters {
    search?: string;
    type?: "daily" | "monthly" | "hourly" | "once" | "overtime" | "allowance" | "";
}
