import {
    BaseFilters,
    BaseSortOptions,
    CustomerSubscription,
    Outlet,
    ServicePackageItem,
} from ".";

export interface ServicePackage {
    id: number;
    outletId: number | null;
    name: string;
    price: number;
    validityDays?: number | null;
    description?: string | null;
    isActive: boolean;
    isGlobal: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    outlet: Outlet;
    servicePackageItems: ServicePackageItem[];
    customerSubscriptions?: CustomerSubscription[];
    servicePackageItemsCount?: number;
    customerSubscriptionsCount?: number;
}

export interface ServicePackageFilters extends BaseFilters {
    outletId?: number | null;
    isActive?: boolean;
    minPrice?: number | null;
    maxPrice?: number | null;
    minValidityDays?: number | null;
    maxValidityDays?: number | null;
}

export interface ServicePackageSortOptions extends BaseSortOptions {
    column:
        | "name"
        | "price"
        | "validityDays"
        | "isActive"
        | "createdAt"
        | "updatedAt";
}

export interface ServicePackageFormData {
    name: string;
    description?: string | null;
    price: number;
    validityDays?: number | null;
    outletId?: number | null;
    isActive?: boolean | null;
    servicePackageItems: ServicePackageItemFormData[];
}

export interface ServicePackageItemFormData {
    laundryServiceId: number;
    quantity: number;
}
