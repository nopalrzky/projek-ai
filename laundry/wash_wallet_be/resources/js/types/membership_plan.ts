import { BaseFilters, BaseSortOptions, MembershipContract, Outlet } from ".";

/**
 * MembershipPlan interface
 */
export interface MembershipPlan {
    id: number;
    outletId: number;
    name: string;
    price: number;
    durationDays: number;
    isActive: boolean;
    discountPercentage: number;
    level: number;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
    outlet: Outlet;
    membershipContracts?: MembershipContract[];
    membershipContractsCount?: number;
    activeMembershipContractsCount?: number;
}

/**
 * MembershipPlan filter interface extends complete base filters
 */
export interface MembershipPlanFilters extends BaseFilters {
    outletId?: number;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
    minDurationDays?: number;
    maxDurationDays?: number;
    minDiscountPercentage?: number;
    maxDiscountPercentage?: number;
}

/**
 * MembershipPlan sort options
 */
export interface MembershipPlanSortOptions extends BaseSortOptions {
    column:
        | "name"
        | "price"
        | "durationDays"
        | "discountPercentage"
        | "createdAt"
        | "updatedAt"
        | "isActive"
        | "popular";
}

/**
 * MembershipPlan form data interface
 */
export interface MembershipPlanFormData {
    outletId: number;
    name: string;
    price: number;
    durationDays?: number | null;
    isActive?: boolean | null;
    discountPercentage: number;
    description?: string;
    level: number;
}
