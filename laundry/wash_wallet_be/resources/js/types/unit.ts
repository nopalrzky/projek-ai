import { BaseFilters, BaseSortOptions, LaundryService } from ".";

export interface Unit {
    id: number;
    name: string;
    symbol: string;
    description?: string | null;
    isActive: boolean;
    laundryServicesCount?: number;
    laundryServices?: LaundryService[];
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface UnitFormData {
    name: string;
    symbol: string;
    description?: string;
    isActive: boolean;
}

/**
 * Unit filter interface
 */
export interface UnitFilters extends BaseFilters {
    isActive?: boolean;
}

/**
 * Unit sort options
 */
export interface UnitSortOptions extends BaseSortOptions {
    column:
        | "name"
        | "symbol"
        | "description"
        | "isActive"
        | "createdAt"
        | "updatedAt"
        | "laundryServicesCount";
}
