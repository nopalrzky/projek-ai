import {
    Customer,
    MembershipContract,
    MembershipPlan,
    Outlet,
    PaginationMeta,
} from "@/types";

export interface MembershipContractIndexProps {
    membershipContracts: {
        data: MembershipContract[];
        meta: PaginationMeta;
    };
    filterOptions: {
        outlets: Outlet[];
        customers: Customer[];
        membershipPlans: MembershipPlan[];
        statusOptions: {
            value: string;
            label: string;
        }[];
    };
    filters: MembershipContractFilters;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface MembershipContractFilters {
    search?: string;
    customerId?: number;
    outletId?: number;
    membershipPlanId?: number;
    status?: "active" | "expired" | "replaced";
    startDateFrom?: string;
    startDateTo?: string;
    expiredDateFrom?: string;
    expiredDateTo?: string;
    startDate?: string;
    endDate?: string;
    hasExpiredDate?: boolean;
    expiringSoonDays?: number;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    page?: number;
    perPage?: number;
}

export interface MembershipContractCreateProps {
    outlets: Outlet[];
}

export interface MembershipContractShowProps {
    membershipContract: MembershipContract;
}

export interface DeleteMembershipContractModalProps {
    isOpen: boolean;
    membershipContract?: MembershipContract;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

export interface MembershipContractPageHeaderProps {
    membershipContract: MembershipContract;
    isLoading?: boolean;
}

export interface MembershipContractOverviewProps {
    membershipContract: MembershipContract;
}

export interface MembershipContractCustomerProps {
    customer: Customer;
}

export interface MembershipContractOutletProps {
    outlet: Outlet;
}
