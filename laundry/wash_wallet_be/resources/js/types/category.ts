import { BaseFilters, BaseSortOptions, LaundryService, Outlet } from ".";

export interface Category {
    id: number;
    outletId: number;
    name: string;
    description?: string | null;
    slug: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    outlet: Outlet;
    laundryServices?: LaundryService[];
    laundryServicesCount?: number;
    statusLabel?: string;
}

/**
 * Category filter interface
 */
export interface CategoryFilters extends BaseFilters {
    isActive?: boolean;
    outletId?: number;
}

/**
 * Category sort options
 */
export interface CategorySortOptions extends BaseSortOptions {
    column:
        | "name"
        | "slug"
        | "description"
        | "isActive"
        | "createdAt"
        | "updatedAt";
}

/**
 *  Category form data
 */
export interface CategoryFormData {
    outletId: number;
    name: string;
    description?: string;
    isActive?: boolean | null;
}

export interface CategoryLaundryServiceFormData {
    unitId: number;
    name: string;
    description?: string | null;
    price: number;
    durationHours: number;
    minQuantity: number;
    laundryServiceProcesses?: Array<{
        processId: number;
    }>;
}
