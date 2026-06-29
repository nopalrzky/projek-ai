import {
    BaseFilters,
    BaseSortOptions,
    Customer,
    MembershipPlan,
    Outlet,
} from ".";

/**
 * MembershipContract interface
 */
export interface MembershipContract {
    id: number;
    customerId: number;
    membershipPlanId: number;
    startAt: string;
    expiredAt: string;
    status: "active" | "expired" | "replaced" | "cancelled";
    totalPaid: number;
    formattedTotalPaid?: string;
    createdAt: string;
    updatedAt: string;
    customer: Customer;
    outlet: Outlet;
    membershipPlan: MembershipPlan;
    daysRemaining?: number | null;
    discountAmount?: number;
}

/**
 * MembershipContract filter interface extends complete base filters
 */
export interface MembershipContractFilters extends BaseFilters {
    customerId?: number;
    outletId?: number;
    membershipPlanId?: number;
    status?: "active" | "replaced" | "expired";
    startDate?: string;
    endDate?: string;
    expiringIn?: number; // Days
}

/**
 * MembershipContract sort options
 */
export interface MembershipContractSortOptions extends BaseSortOptions {
    column:
        | "id"
        | "startAt"
        | "expiredAt"
        | "totalPaid"
        | "createdAt"
        | "updatedAt"
        | "customerName";
}

/**
 * MembershipContract form data interface
 */
export interface MembershipContractFormData {
    customerId: number;
    outletId: number;
    membershipPlanId: number;
    startAt: string;
    totalPaid: number;
    status?: "active" | "replaced" | "expired";
}

