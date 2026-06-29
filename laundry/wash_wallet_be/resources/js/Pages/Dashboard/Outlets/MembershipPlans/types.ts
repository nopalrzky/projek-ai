import { MembershipPlan, Outlet } from "@/types";

export interface OutletMembershipPlanIndexProps {
    outlet: Outlet;
    isLoading?: boolean;
}

export interface OutletMembershipPlanCreateProps {
    outlet: Outlet;
}

export interface OutletMembershipPlanEditProps {
    outlet: Outlet;
    membershipPlan: MembershipPlan;
}

export interface OutletMembershipPlanDeleteModalProps {
    isOpen: boolean;
    membershipPlan?: MembershipPlan;
    onClose: () => void;
    onConfirm: (membershipPlan: MembershipPlan) => void;
    isLoading?: boolean;
}
