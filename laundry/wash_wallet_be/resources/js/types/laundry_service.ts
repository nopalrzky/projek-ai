import {
    BaseFilters,
    Category,
    LaundryServiceProcess,
    OrderItem,
    Outlet,
    ServicePackageItem,
    Unit,
} from ".";

export interface LaundryService {
    id: number;
    name: string;
    description?: string;
    slug: string;
    price: number;
    durationHours: number;
    minQuantity: number;
    isActive: boolean;
    supportsCourier: boolean;
    courierSupportLabel?: string | null;
    courierSupportMessage?: string | null;
    averageRating?: number;
    totalReviews?: number;
    categoryId: number;
    unitId: number;
    category: Category;
    unit: Unit;
    outlet?: Outlet;
    laundryServiceProcesses?: LaundryServiceProcess[];
    orderItems?: OrderItem[];
    servicePackageItems?: ServicePackageItem[];
    laundryServiceProcessesCount?: number;
    orderItemsCount?: number;
    servicePackageItemsCount?: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

/**
 * Laundry service form data interface
 */
export interface LaundryServiceFormData {
    categoryId: number;
    unitId: number;
    name: string;
    description?: string | null;
    isActive?: boolean | null;
    price: number;
    durationHours: number;
    minQuantity: number;
    laundryServiceProcesses?: Array<{
        processId: number;
    }>;
}

export interface LaundryServiceFilters extends BaseFilters {
    isActive?: boolean;
    outletId?: number;
    categoryId?: number;
    unitId?: number;
    minDurationHours: number;
    maxDurationHours: number;
    minPrice: number;
    maxPrice: number;
    minQuantity: number;
}

/**
 * Laundry service sort options
 */
export interface LaundryServiceSortOptions {
    column:
        | "name"
        | "description"
        | "slug"
        | "isActive"
        | "createdAt"
        | "updatedAt";
    direction: "asc" | "desc";
}
