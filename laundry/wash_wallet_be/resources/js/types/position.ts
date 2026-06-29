import { BaseFilters, BaseSortOptions, EmployeePosition, Outlet } from ".";

export interface Position {
    id: number;
    outletId: number;
    name: string;
    description?: string | null;
    isActive: boolean;
    slug?: string | null;
    isDefault: boolean;
    permissions: string[];
    employeesCount?: number;
    employeePositions?: EmployeePosition[];
    outlet: Outlet;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface PositionFilters extends BaseFilters {
    outletId?: number;
    isActive?: boolean;
}

/**
 * Position sort options
 */
export interface PositionSortOptions extends BaseSortOptions {
    column:
        | "name"
        | "description"
        | "isActive"
        | "createdAt"
        | "updatedAt"
        | "employeesCount";
}

export interface PositionFormData {
    outletId?: number;
    name: string;
    description?: string;
    isActive?: boolean | null;
    permissions?: string[];
}
