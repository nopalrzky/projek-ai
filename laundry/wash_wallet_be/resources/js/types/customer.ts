import {
    BaseFilters,
    BaseSortOptions,
    CustomerSubscription,
    MembershipContract,
    Order,
    Outlet,
} from ".";

export interface Customer {
    id: number;
    outletId: number;
    name: string;
    email: string;
    phone?: string | null;
    dateOfBirth?: string | null;
    gender: "male" | "female" | null;
    address?: string | null;
    isActive: boolean;
    statusLabel: string;
    membershipContracts: MembershipContract[];
    customerSubscriptions?: CustomerSubscription[];
    outlet: Outlet;
    orders: Order[];
    customerSubscriptionsCount?: number;
    membershipContractsCount?: number;
    ordersCount?: number;
    subscriptionsCount: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

/**
 * Customer filter interface
 */
export interface CustomerFilters extends BaseFilters {
    isActive?: boolean;
    outletId?: number;
    phone?: string;
    gender?: string;
    startDate?: string;
    endDate?: string;
}

/**
 * Customer sort options
 */
export interface CustomerSortOptions extends BaseSortOptions {
    column:
        | "name"
        | "phone"
        | "email"
        | "gender"
        | "isActive"
        | "createdAt"
        | "updatedAt"
        | "ordersCount";
}

export interface CustomerFormData {
    name: string;
    email?: string;
    phone?: string;
    outletId: string;
    gender: "male" | "female" | "";
    address: string;
    isActive: boolean;
}

export interface CustomerMembershipContractFormData {
    membershipPlanId: string;
    startDate: string;
    totalPaid: string;
}

export interface CustomerCustomerSubscriptionFormData {
    servicePackageId: string;
    pricePaid: string;
    purchaseDate: string;
}
