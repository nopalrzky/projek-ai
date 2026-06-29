import { Customer, MembershipPlan } from "@/types";

export interface CustomerMembershipContractsIndexProps {
    customer: Customer;
}

export interface CustomerMembershipContractCreateProps {
    customer: Customer;
    membershipPlans: MembershipPlan[];
}
