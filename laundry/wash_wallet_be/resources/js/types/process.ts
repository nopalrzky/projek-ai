import {
    BaseFilters,
    BaseSortOptions,
    Employee,
    EmployeeProcessCommission,
    LaundryService,
    LaundryServiceProcess,
} from ".";

export interface Process {
    id: number;
    name: string;
    description?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    laundryServices?: LaundryService[];
    laundryServicesCount?: number;
    employees?: Employee[];
    employeesCount?: number;
    laundryServiceProcesses?: LaundryServiceProcess[];
    employeeProcessCommissions?: EmployeeProcessCommission[];
    statusLabel?: string;
}

/**
 * Process filter interface
 */
export interface ProcessFilters extends BaseFilters {
    isActive?: boolean;
}

/**
 * Process sort options
 */
export interface ProcessSortOptions extends BaseSortOptions {
    column: "name" | "description" | "isActive" | "createdAt" | "updatedAt";
}

/**
 * Process form data
 */
export interface ProcessFormData {
    name: string;
    description?: string;
    isActive?: boolean | null;
}
