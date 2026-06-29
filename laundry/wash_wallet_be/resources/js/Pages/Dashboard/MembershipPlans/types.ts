import {
    MembershipPlan,
    Outlet,
    MembershipPlanFilters,
    PaginationMeta,
} from "@/types";

export interface MembershipPlanIndexProps {
    membershipPlans: {
        data: MembershipPlan[];
        meta: PaginationMeta;
    };
    filterOptions: {
        outlets: Outlet[];
    };
    filters: MembershipPlanFilters;
    flash: {
        success?: string;
        error?: string;
    };
}

export interface MembershipPlanEditProps {
    membershipPlan: MembershipPlan;
    outlets: Outlet[];
}

export interface MembershipPlanCreateProps {
    outlets: Outlet[];
}

export interface MembershipPlanShowProps {
    membershipPlan: MembershipPlan;
}

export interface MembershipPlanOverviewProps {
    membershipPlan: MembershipPlan;
}

export interface MembershipPlanOutletProps {
    outlet: Outlet;
}

/**
 * Delete MembershipPlan modal props
 */
export interface DeleteMembershipPlanModalProps {
    isOpen: boolean;
    membershipPlan?: MembershipPlan;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

/**
 * MembershipPlan page header props
 */
export interface MembershipPlanPageHeaderProps {
    membershipPlan: MembershipPlan;
    isLoading?: boolean;
}
